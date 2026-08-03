import type { ICredentialTestRequest, ICredentialType, INodeProperties } from 'n8n-workflow';

/**
 * Credential for the WHO ICD-11 API.
 *
 * Verified against the WHO's official sample repository
 * (github.com/ICD-API/Python-samples):
 *   - OAuth2 "client credentials grant" flow
 *   - Token endpoint: https://icdaccessmanagement.who.int/connect/token
 *   - Scope: icdapi_access
 *   - Credentials are sent in the request body
 *   - Tokens last about one hour; n8n takes care of refreshing them
 *
 * The client ID and client secret are free, from registering at
 * https://icd.who.int/icdapi ("API Access" section).
 */
export class Icd11OAuth2Api implements ICredentialType {
	name = 'icd11OAuth2Api';

	displayName = 'ICD-11 OAuth2 API';

	icon = 'file:icd11.svg' as const;

	documentationUrl = 'https://icd.who.int/docs/icd-api/API-Authentication/';

	extends = ['oAuth2Api'];

	properties: INodeProperties[] = [
		{
			displayName: 'Grant Type',
			name: 'grantType',
			type: 'hidden',
			default: 'clientCredentials',
		},
		{
			displayName: 'Access Token URL',
			name: 'accessTokenUrl',
			type: 'hidden',
			default: 'https://icdaccessmanagement.who.int/connect/token',
		},
		{
			displayName: 'Scope',
			name: 'scope',
			type: 'hidden',
			default: 'icdapi_access',
		},
		{
			displayName: 'Authentication',
			name: 'authentication',
			type: 'hidden',
			default: 'body',
		},
		{
			displayName: 'Base URL',
			name: 'baseUrl',
			type: 'string',
			default: 'https://id.who.int',
			description:
				'Address of the API. Use the WHO cloud API or your own local Docker deployment.',
		},
	];

	/**
	 * Credential test: fetch a single, stable foundation entity. It returns 200
	 * only once the client credentials have produced a valid token, which is
	 * exactly what needs checking.
	 *
	 * 257068234 is Cholera, a core ICD entity with a persistent identifier. It
	 * was picked over the more obvious /icd/release/11 because this route is
	 * verified to answer on both the WHO cloud API and a local Docker
	 * deployment, whereas /icd/release/11 answers 404 on local deployments
	 * (they embed a single release) and would report a failing credential to
	 * anyone developing against the container.
	 *
	 * Accept-Language is required: without it the API answers 404 rather than
	 * falling back to a default language, which would report a working
	 * credential as broken.
	 */
	test: ICredentialTestRequest = {
		request: {
			baseURL: '={{$credentials.baseUrl}}',
			url: '/icd/entity/257068234',
			headers: {
				Accept: 'application/json',
				'API-Version': 'v2',
				'Accept-Language': 'en',
			},
		},
	};
}
