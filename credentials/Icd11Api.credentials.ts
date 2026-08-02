import type { ICredentialType, INodeProperties } from 'n8n-workflow';

/**
 * Credencial para la ICD-11 API de la OMS.
 *
 * Datos verificados en la documentación oficial (icd.who.int/docs/icd-api):
 *   - Flujo OAuth2 "client credentials grant"
 *   - Token endpoint: https://icdaccessmanagement.who.int/connect/token
 *   - Scope: icdapi_access
 *   - Los tokens duran ~1 hora; n8n se encarga de renovarlos.
 *
 * El client ID y el client secret se obtienen gratis registrándose en
 * https://icd.who.int/icdapi (sección "API Access").
 */
export class Icd11Api implements ICredentialType {
	name = 'icd11Api';

	displayName = 'ICD-11 API (WHO)';

	documentationUrl = 'https://icd.who.int/icdapi';

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
			type: 'options',
			options: [
				{
					name: 'WHO Cloud (id.who.int)',
					value: 'https://id.who.int',
				},
				{
					name: 'Instancia local (Docker)',
					value: 'http://localhost:80',
				},
			],
			default: 'https://id.who.int',
			description:
				'La API se puede consumir desde la nube de la OMS o desde un despliegue local en Docker',
		},
	];
}
