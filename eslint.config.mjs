import parser from '@typescript-eslint/parser';
import n8nNodesBase from 'eslint-plugin-n8n-nodes-base';
import { n8nCommunityNodesPlugin } from '@n8n/eslint-plugin-community-nodes';

/**
 * Config plana (ESLint 9) que replica el gate oficial de verificacion de n8n.
 *
 * El escaner `@n8n/scan-community-package` construye su configuracion en
 * scanner/buildScanConfig: parte del preset `recommended` de
 * @n8n/eslint-plugin-community-nodes y encima aplica los tres rulesets de
 * eslint-plugin-n8n-nodes-base con unas pocas reglas desactivadas. Aqui se
 * reproduce ese mismo orden y esas mismas excepciones, para que `npm run lint`
 * en local de exactamente el mismo resultado que el escaner de n8n.
 *
 * Sin esto, el lint local pasaba mientras el gate fallaba: las reglas de
 * @n8n/community-nodes (icono, usableAsTool, NodeConnectionTypes, autor) solo
 * viven en ese plugin.
 */
export default [
	{
		ignores: ['dist/**', 'node_modules/**', 'gulpfile.js', 'eslint.config.mjs'],
	},

	n8nCommunityNodesPlugin.configs.recommended,

	{
		rules: { 'no-console': 'error' },
	},

	{
		plugins: { 'n8n-nodes-base': n8nNodesBase },
	},

	{
		files: ['package.json'],
		rules: { ...n8nNodesBase.configs.community.rules },
	},

	{
		files: ['**/credentials/**/*.ts'],
		rules: {
			...n8nNodesBase.configs.credentials.rules,
			// Desactivadas por el propio escaner: no aplican a nodos community.
			'n8n-nodes-base/cred-class-field-documentation-url-miscased': 'off',
			// La regla credential-password-field de @n8n/community-nodes es mas precisa.
			'n8n-nodes-base/cred-class-field-type-options-password-missing': 'off',
		},
	},

	{
		files: ['**/nodes/**/*.ts'],
		rules: {
			...n8nNodesBase.configs.nodes.rules,
			// Desactivadas por el escaner: inputs/outputs pueden (y deben) usar el
			// enum NodeConnectionTypes en vez del literal "main".
			'n8n-nodes-base/node-class-description-inputs-wrong-regular-node': 'off',
			'n8n-nodes-base/node-class-description-outputs-wrong': 'off',
			// A veces la API de terceros si tiene un maximo real, asi que maxValue vale.
			'n8n-nodes-base/node-param-type-options-max-value-present': 'off',
		},
	},

	// package.json no lo parsea el parser por defecto de ESLint; las reglas que
	// lo inspeccionan recorren un AST TSESTree, que el parser de TypeScript
	// produce a partir de un objeto literal de nivel superior.
	{
		files: ['**/*.json'],
		languageOptions: { parser },
	},

	{
		files: ['**/*.ts'],
		languageOptions: {
			parser,
			parserOptions: { sourceType: 'module', ecmaVersion: 2020 },
		},
	},
];
