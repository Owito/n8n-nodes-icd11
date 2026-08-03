import type { ICredentialType, INodeProperties } from 'n8n-workflow';

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
}
