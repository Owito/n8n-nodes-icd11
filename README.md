# n8n-nodes-icd11

Nodo community de [n8n](https://n8n.io/) para la **ICD-11 API de la Organización Mundial de la Salud**, la Clasificación Internacional de Enfermedades.

Permite consultar y codificar diagnósticos desde un workflow de n8n, sin escribir llamadas HTTP a mano ni gestionar el ciclo de vida del token.

## Estado

En desarrollo. Todavía no publicado en npm.

## Requisitos

- n8n 1.x o superior
- Credenciales de la ICD API (gratuitas)

## Obtener credenciales

1. Registrate en <https://icd.who.int/icdapi>
2. Confirmá tu correo con el enlace que envía la OMS
3. Iniciá sesión y entrá a **API Access → View API access key(s)**
4. Copiá el `client_id` y el `client_secret`

## Autenticación

El nodo usa **OAuth2 con client credentials grant**:

| | |
|---|---|
| Token endpoint | `https://icdaccessmanagement.who.int/connect/token` |
| Scope | `icdapi_access` |
| Duración del token | ~1 hora (n8n lo renueva solo) |
| Base URL | `https://id.who.int` |

La API también se puede desplegar localmente con Docker, útil para pruebas sin depender de la red. La credencial permite elegir entre la nube de la OMS y una instancia local.

## Cabeceras requeridas

La API exige `API-Version: v2` y acepta `Accept-Language` para negociar el idioma del contenido, incluido español.

## Licencia

MIT

## Descargo

Este es un proyecto community independiente. No está afiliado ni respaldado por la Organización Mundial de la Salud. El uso del contenido de la CIE está sujeto a los términos de licencia de la OMS.
