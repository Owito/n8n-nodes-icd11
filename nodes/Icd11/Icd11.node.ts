import { NodeConnectionTypes } from 'n8n-workflow';
import type { INodeType, INodeTypeDescription } from 'n8n-workflow';

/**
 * Node for the WHO ICD-11 API.
 *
 * Routes verified against the WHO's official sample repository
 * (github.com/ICD-API/Python-samples) and independently confirmed
 * across several public implementations:
 *
 *   GET /icd/release/11                                  -> available releases
 *   GET /icd/release/11/{release}/mms/search             -> search
 *   GET /icd/release/11/{release}/mms/autocode           -> free text to code
 *   GET /icd/release/11/{release}/mms/codeinfo/{code}    -> detail for a code
 *   GET /icd/release/11/{release}/mms/lookup             -> resolve a foundationUri
 *   GET /icd/entity/{id}                                 -> foundation entity
 *
 * The API requires the 'API-Version: v2' header and accepts 'Accept-Language'.
 */
export class Icd11 implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'ICD-11',
		name: 'icd11',
		icon: 'file:icd11.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"]}}',
		description: 'Query the WHO International Classification of Diseases (ICD-11)',
		defaults: {
			name: 'ICD-11',
		},
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		usableAsTool: true,
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
						name: 'Autocode Text',
						value: 'autocode',
						description: 'Get the best matching ICD-11 code for free clinical text',
						action: 'Autocode clinical text',
						routing: {
							request: {
								method: 'GET',
								url: '=/icd/release/11/{{$parameter.release}}/mms/autocode',
							},
						},
					},
					{
						name: 'Get Code Info',
						value: 'codeInfo',
						description: 'Get the details of a specific ICD-11 code',
						action: 'Get code info',
						routing: {
							request: {
								method: 'GET',
								url: '=/icd/release/11/{{$parameter.release}}/mms/codeinfo/{{$parameter.code}}',
							},
						},
					},
					{
						name: 'Get Entity',
						value: 'getEntity',
						description: 'Get a foundation entity by its identifier',
						action: 'Get a foundation entity',
						routing: {
							request: {
								method: 'GET',
								url: '=/icd/entity/{{$parameter.entityId}}',
							},
						},
					},
					{
						name: 'List Releases',
						value: 'listReleases',
						description:
							'List the published ICD-11 releases. Only available on the WHO cloud API: local Docker deployments embed a single release and return 404.',
						action: 'List published releases',
						routing: {
							request: {
								method: 'GET',
								url: '/icd/release/11',
							},
						},
					},
					{
						name: 'Look Up Foundation URI',
						value: 'lookup',
						description: 'Resolve a foundation URI within the MMS linearization',
						action: 'Look up a foundation URI',
						routing: {
							request: {
								method: 'GET',
								url: '=/icd/release/11/{{$parameter.release}}/mms/lookup',
							},
						},
					},
					{
						name: 'Search',
						value: 'search',
						description: 'Search for entities in the MMS linearization',
						action: 'Search the ICD 11',
						routing: {
							request: {
								method: 'GET',
								url: '=/icd/release/11/{{$parameter.release}}/mms/search',
							},
						},
					},
				],
			},

			{
				displayName: 'Release',
				name: 'release',
				type: 'string',
				default: '2026-01',
				required: true,
				description:
					'Published ICD-11 release, for example 2026-01 or 2025-01. Use the List Releases operation to see the ones available on the cloud API.',
				displayOptions: {
					show: {
						operation: ['search', 'autocode', 'codeInfo', 'lookup'],
					},
				},
			},

			{
				displayName: 'Query',
				name: 'q',
				type: 'string',
				default: '',
				required: true,
				description: 'Text to search for',
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
				displayName: 'Clinical Text',
				name: 'searchText',
				type: 'string',
				default: '',
				required: true,
				description: 'Free text to convert into an ICD-11 code',
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
				displayName: 'Code',
				name: 'code',
				type: 'string',
				default: '',
				required: true,
				description: 'ICD-11 code to look up, for example 1A00',
				displayOptions: {
					show: {
						operation: ['codeInfo'],
					},
				},
			},

			{
				displayName: 'Entity ID',
				name: 'entityId',
				type: 'string',
				default: '',
				required: true,
				description: 'Numeric identifier of the entity, for example 257068234',
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
					'Foundation URI returned by a previous search, pointing to an entity in the foundation',
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
				displayName: 'Options',
				name: 'options',
				type: 'collection',
				placeholder: 'Add option',
				default: {},
				options: [
					{
						displayName: 'Chapter Filter',
						name: 'chapterFilter',
						type: 'string',
						default: '',
						description:
							'Semicolon separated list of chapters to narrow the search down to, for example 01;02;03',
						routing: {
							request: {
								qs: {
									chapterFilter: '={{$value}}',
								},
							},
						},
					},
					{
						displayName: 'Flat Results',
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
						displayName: 'Include Keyword Result',
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
						displayName: 'Language',
						name: 'acceptLanguage',
						type: 'string',
						default: 'en',
						description:
							'Language of the returned content, sent as the Accept-Language header. The ICD-11 is available in several languages on the cloud API.',
						routing: {
							request: {
								headers: {
									'Accept-Language': '={{$value}}',
								},
							},
						},
					},
					{
						displayName: 'Match Threshold',
						name: 'matchThreshold',
						type: 'number',
						typeOptions: {
							minValue: 0,
							maxValue: 1,
							numberPrecision: 2,
						},
						default: 0.5,
						description:
							'Minimum score, between 0 and 1, required to accept a match when autocoding',
						routing: {
							request: {
								qs: {
									matchThreshold: '={{$value}}',
								},
							},
						},
					},
					{
						displayName: 'Use Flexisearch',
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
