// Validates a workflow JSON against the REAL description of the compiled node:
// node type, existing operations, parameter names and their visibility per
// displayOptions. It executes nothing against the API, so it needs no
// credentials and no network.
//
//   npm run build && npm test
const fs = require('node:fs');
const path = require('node:path');

const NODE_PATH = path.join(__dirname, '..', 'dist', 'nodes', 'Icd11', 'Icd11.node.js');
if (!fs.existsSync(NODE_PATH)) {
	console.error(`Compiled node not found at ${NODE_PATH}. Run "npm run build" first.`);
	process.exit(1);
}

const { Icd11 } = require(NODE_PATH);

const d = new Icd11().description;
const NODE_TYPE = 'n8n-nodes-icd11.icd11';
const workflowFile = process.argv[2] ?? path.join(__dirname, 'workflow-demo.json');
const wf = JSON.parse(fs.readFileSync(workflowFile, 'utf8'));

const operations = d.properties.find((p) => p.name === 'operation').options.map((o) => o.value);
const props = d.properties;
const errors = [];

// The "options" collection declares its children separately.
const optionsChildren = new Set(
	(props.find((p) => p.name === 'options')?.options ?? []).map((o) => o.name),
);

const visibleFor = (prop, operation) => {
	const show = prop.displayOptions?.show;
	if (!show || !show.operation) return true;
	return show.operation.includes(operation);
};

for (const node of wf.nodes) {
	if (!node.type.startsWith('n8n-nodes-icd11')) continue;
	const label = `node "${node.name}"`;

	if (node.type !== NODE_TYPE) {
		errors.push(`${label}: type "${node.type}", expected "${NODE_TYPE}"`);
	}

	const op = node.parameters.operation;
	if (!operations.includes(op)) {
		errors.push(`${label}: operation "${op}" does not exist. Valid: ${operations.join(', ')}`);
		continue;
	}

	for (const [key, value] of Object.entries(node.parameters)) {
		if (key === 'operation') continue;
		const prop = props.find((p) => p.name === key);
		if (!prop) {
			errors.push(`${label}: parameter "${key}" does not exist on the node`);
			continue;
		}
		if (!visibleFor(prop, op)) {
			errors.push(`${label}: parameter "${key}" does not apply to operation "${op}"`);
		}
		if (key === 'options' && value && typeof value === 'object') {
			for (const sub of Object.keys(value)) {
				if (!optionsChildren.has(sub)) {
					errors.push(`${label}: option "${sub}" does not exist inside Options`);
				}
			}
		}
	}

	// Required parameters missing for this operation.
	for (const p of props) {
		if (p.name === 'operation' || !p.required) continue;
		if (visibleFor(p, op) && !(p.name in node.parameters)) {
			errors.push(`${label}: missing required parameter "${p.name}" for "${op}"`);
		}
	}
}

// Connections must point at nodes that exist.
const names = new Set(wf.nodes.map((n) => n.name));
for (const [source, outputs] of Object.entries(wf.connections ?? {})) {
	if (!names.has(source)) errors.push(`connection from "${source}", which does not exist`);
	for (const branch of outputs.main ?? []) {
		for (const c of branch ?? []) {
			if (!names.has(c.node)) errors.push(`connection to "${c.node}", which does not exist`);
		}
	}
}

if (errors.length) {
	console.error(`FAIL (${errors.length}):\n - ` + errors.join('\n - '));
	process.exit(1);
}

const icdNodes = wf.nodes.filter((n) => n.type === NODE_TYPE);
console.log(`OK: ${path.basename(workflowFile)} is valid against the real node description`);
console.log(`   ICD-11 nodes: ${icdNodes.length}`);
console.log(`   operations used: ${icdNodes.map((n) => n.parameters.operation).join(', ')}`);
