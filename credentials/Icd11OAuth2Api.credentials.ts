import type { ICredentialType, INodeProperties } from 'n8n-workflow';

/**
 * Credencial para la ICD-11 API de la OMS.
 *
 * Datos verificados contra el repositorio oficial de ejemplos de la OMS
 * (github.com/ICD-API/Python-samples):
 *   - Flujo OAuth2 "client credentials grant"
 *   - Token endpoint: https://icdaccessmanagement.who.int/connect/token
 *   - Scope: icdapi_access
 *   - Las credenciales viajan en el cuerpo de la peticion
 *   - Los tokens duran ~1 hora; n8n se encarga de renovarlos
 *
 * El client ID y el client secret se obtienen gratis registrandose en
 * https://icd.who.int/icdapi (seccion "API Access").
 */
export class Icd11OAuth2Api implements ICredentialType {
	name = 'icd11OAuth2Api';

	displayName = 'ICD-11 OAuth2 API';

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
				'Direccion de la API. Usa la nube de la OMS o la de tu propio despliegue local en Docker.',
		},
	];
}
