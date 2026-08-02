const parser = require('@typescript-eslint/parser');
const n8nNodesBase = require('eslint-plugin-n8n-nodes-base');

/**
 * Config plana (ESLint 9). El plugin eslint-plugin-n8n-nodes-base publica sus
 * presets en formato eslintrc, asi que aqui se registran el plugin y sus reglas
 * de forma explicita, separando credenciales, nodos y package.json.
 */
module.exports = [
	{
		ignores: ['dist/**', 'node_modules/**', 'gulpfile.js', 'eslint.config.js'],
	},
	{
		files: ['credentials/**/*.ts'],
		languageOptions: {
			parser,
			parserOptions: {
				sourceType: 'module',
				ecmaVersion: 2020,
			},
		},
		plugins: {
			'n8n-nodes-base': n8nNodesBase,
		},
		rules: {
			...n8nNodesBase.configs.credentials.rules,
			// Conflicto entre dos reglas del propio plugin: 'documentation-url-miscased'
			// exige camelCase para este campo, pero al aplicarlo se dispara
			// 'documentation-url-not-http-url', que exige una URL. Son mutuamente
			// excluyentes, asi que se desactiva la primera y se mantiene la URL real
			// de la documentacion de autenticacion de la OMS.
			'n8n-nodes-base/cred-class-field-documentation-url-miscased': 'off',
		},
	},
	{
		files: ['nodes/**/*.ts'],
		languageOptions: {
			parser,
			parserOptions: {
				sourceType: 'module',
				ecmaVersion: 2020,
			},
		},
		plugins: {
			'n8n-nodes-base': n8nNodesBase,
		},
		rules: {
			...n8nNodesBase.configs.nodes.rules,
		},
	},
];
