import type { INodeType, INodeTypeDescription } from 'n8n-workflow';

/**
 * Nodo para la ICD-11 API de la OMS.
 *
 * Rutas verificadas contra el repositorio oficial de ejemplos de la OMS
 * (github.com/ICD-API/Python-samples) y confirmadas de forma independiente
 * en varias implementaciones publicas:
 *
 *   GET /icd/release/11                                  -> releases disponibles
 *   GET /icd/release/11/{release}/mms/search             -> busqueda
 *   GET /icd/release/11/{release}/mms/autocode           -> texto libre a codigo
 *   GET /icd/release/11/{release}/mms/codeinfo/{code}    -> detalle por codigo
 *   GET /icd/release/11/{release}/mms/lookup             -> resolver un foundationUri
 *   GET /icd/entity/{id}                                 -> entidad de la fundacion
 *
 * La API exige la cabecera 'API-Version: v2' y acepta 'Accept-Language'.
 */
export class Icd11 implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'ICD-11',
		name: 'icd11',
		icon: 'file:icd11.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"]}}',
		description: 'Consulta la Clasificacion Internacional de Enfermedades (CIE-11) de la OMS',
		defaults: {
			name: 'ICD-11',
		},
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: 'icd11OAuth2Api',
				required: true,
			},
		],
		requestDefaults: {
			baseURL: '={{$credentials.baseUrl}}',
			headers: {
				Accept: 'application/json',
				'API-Version': 'v2',
			},
		},
		properties: [
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				default: 'search',
				options: [
					{
						name: 'Autocodificar Texto',
						value: 'autocode',
						description: 'Obtener el mejor codigo CIE-11 para un texto clinico libre',
						action: 'Autocodificar un texto clinico',
						routing: {
							request: {
								method: 'GET',
								url: '=/icd/release/11/{{$parameter.release}}/mms/autocode',
							},
						},
					},
					{
						name: 'Buscar',
						value: 'search',
						description: 'Buscar entidades en la linealizacion MMS',
						action: 'Buscar en la CIE 11',
						routing: {
							request: {
								method: 'GET',
								url: '=/icd/release/11/{{$parameter.release}}/mms/search',
							},
						},
					},
					{
						name: 'Consultar Codigo',
						value: 'codeInfo',
						description: 'Obtener el detalle de un codigo CIE-11 concreto',
						action: 'Consultar un codigo CIE 11',
						routing: {
							request: {
								method: 'GET',
								url: '=/icd/release/11/{{$parameter.release}}/mms/codeinfo/{{$parameter.code}}',
							},
						},
					},
					{
						name: 'Listar Versiones',
						value: 'listReleases',
						description:
							'Listar las versiones publicadas de la CIE-11. Solo disponible en la nube de la OMS: los despliegues locales en Docker traen una unica version embebida y devuelven 404.',
						action: 'Listar las versiones publicadas',
						routing: {
							request: {
								method: 'GET',
								url: '/icd/release/11',
							},
						},
					},
					{
						name: 'Obtener Entidad',
						value: 'getEntity',
						description: 'Obtener una entidad de la fundacion por su identificador',
						action: 'Obtener una entidad de la fundacion',
						routing: {
							request: {
								method: 'GET',
								url: '=/icd/entity/{{$parameter.entityId}}',
							},
						},
					},
					{
						name: 'Resolver URI De Fundacion',
						value: 'lookup',
						description: 'Resolver un foundationUri dentro de la linealizacion MMS',
						action: 'Resolver un URI de fundacion',
						routing: {
							request: {
								method: 'GET',
								url: '=/icd/release/11/{{$parameter.release}}/mms/lookup',
							},
						},
					},
				],
			},

			{
				displayName: 'Version (Release)',
				name: 'release',
				type: 'string',
				default: '2026-01',
				required: true,
				description:
					'Version publicada de la CIE-11, por ejemplo 2026-01 o 2025-01. Usa la operacion Listar Versiones para ver las disponibles en la nube.',
				displayOptions: {
					show: {
						operation: ['search', 'autocode', 'codeInfo', 'lookup'],
					},
				},
			},

			{
				displayName: 'Consulta',
				name: 'q',
				type: 'string',
				default: '',
				required: true,
				description: 'Texto a buscar',
				displayOptions: {
					show: {
						operation: ['search'],
					},
				},
				routing: {
					request: {
						qs: {
							q: '={{$value}}',
						},
					},
				},
			},

			{
				displayName: 'Texto Clinico',
				name: 'searchText',
				type: 'string',
				default: '',
				required: true,
				description: 'Texto libre a convertir en un codigo CIE-11',
				displayOptions: {
					show: {
						operation: ['autocode'],
					},
				},
				routing: {
					request: {
						qs: {
							searchText: '={{$value}}',
						},
					},
				},
			},

			{
				displayName: 'Codigo',
				name: 'code',
				type: 'string',
				default: '',
				required: true,
				description: 'Codigo CIE-11 a consultar, por ejemplo 1A00',
				displayOptions: {
					show: {
						operation: ['codeInfo'],
					},
				},
			},

			{
				displayName: 'ID De Entidad',
				name: 'entityId',
				type: 'string',
				default: '',
				required: true,
				description: 'Identificador numerico de la entidad, por ejemplo 257068234',
				displayOptions: {
					show: {
						operation: ['getEntity'],
					},
				},
			},

			{
				displayName: 'Foundation URI',
				name: 'foundationUri',
				type: 'string',
				default: '',
				required: true,
				description:
					'URI de fundacion devuelto por una busqueda previa, que apunta a una entidad de la fundacion',
				displayOptions: {
					show: {
						operation: ['lookup'],
					},
				},
				routing: {
					request: {
						qs: {
							foundationUri: '={{$value}}',
						},
					},
				},
			},

			{
				displayName: 'Opciones',
				name: 'options',
				type: 'collection',
				placeholder: 'Anadir opcion',
				default: {},
				options: [
					{
						displayName: 'Filtro De Capitulos',
						name: 'chapterFilter',
						type: 'string',
						default: '',
						description:
							'Lista de capitulos separados por punto y coma para acotar la busqueda, por ejemplo 01;02;03',
						routing: {
							request: {
								qs: {
									chapterFilter: '={{$value}}',
								},
							},
						},
					},
					{
						displayName: 'Idioma',
						name: 'acceptLanguage',
						type: 'string',
						default: 'es',
						description:
							'Idioma del contenido devuelto, segun la cabecera Accept-Language. La CIE-11 incluye espanol.',
						routing: {
							request: {
								headers: {
									'Accept-Language': '={{$value}}',
								},
							},
						},
					},
					{
						displayName: 'Incluir Resultado De Palabras Clave',
						name: 'includeKeywordResult',
						type: 'boolean',
						default: false,
						description: 'Whether to include the keyword based result set',
						routing: {
							request: {
								qs: {
									includeKeywordResult: '={{$value}}',
								},
							},
						},
					},
					{
						displayName: 'Resultados Planos',
						name: 'flatResults',
						type: 'boolean',
						default: true,
						description:
							'Whether to return results as a flat list instead of a hierarchical tree',
						routing: {
							request: {
								qs: {
									flatResults: '={{$value}}',
								},
							},
						},
					},
					{
						displayName: 'Umbral De Coincidencia',
						name: 'matchThreshold',
						type: 'number',
						typeOptions: {
							minValue: 0,
							maxValue: 1,
							numberPrecision: 2,
						},
						default: 0.5,
						description:
							'Puntuacion minima para aceptar una coincidencia al autocodificar, entre 0 y 1',
						routing: {
							request: {
								qs: {
									matchThreshold: '={{$value}}',
								},
							},
						},
					},
					{
						displayName: 'Usar Flexisearch',
						name: 'useFlexisearch',
						type: 'boolean',
						default: false,
						description:
							'Whether to use flexible search, which returns more results but less precise ones',
						routing: {
							request: {
								qs: {
									useFlexisearch: '={{$value}}',
								},
							},
						},
					},
				],
				displayOptions: {
					show: {
						operation: ['search', 'autocode', 'codeInfo', 'lookup', 'getEntity'],
					},
				},
			},
		],
	};
}
