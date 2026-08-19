# n8n-nodes-icd11

[![npm version](https://img.shields.io/npm/v/n8n-nodes-icd11?logo=npm&color=cb3837)](https://www.npmjs.com/package/n8n-nodes-icd11)
[![npm downloads](https://img.shields.io/npm/dm/n8n-nodes-icd11?logo=npm&color=cb3837)](https://www.npmjs.com/package/n8n-nodes-icd11)
[![CI](https://github.com/Owito/n8n-nodes-icd11/actions/workflows/ci.yml/badge.svg)](https://github.com/Owito/n8n-nodes-icd11/actions/workflows/ci.yml)
[![npm provenance](https://img.shields.io/badge/npm-provenance%20signed-2ea44f?logo=npm)](https://www.npmjs.com/package/n8n-nodes-icd11#provenance)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue)](LICENSE)
[![runtime dependencies](https://img.shields.io/badge/runtime%20dependencies-0-2ea44f)](package.json)

An [n8n](https://n8n.io/) community node for the **WHO ICD-11 API**, the World Health Organization's International Classification of Diseases.

It lets you search and code diagnoses from an n8n workflow, without hand-writing HTTP calls or managing the token lifecycle yourself.

## Status

Published on npm as [`n8n-nodes-icd11`](https://www.npmjs.com/package/n8n-nodes-icd11). Every release is published from GitHub Actions through npm **trusted publishing (OIDC)**, with no long-lived publish token in this repository or on the maintainer account; npm issues an ephemeral credential per run and generates the provenance attestation itself. This is what n8n requires for verified nodes.

You can check the published package yourself:

```bash
npm audit signatures                       # verifies the provenance attestation
npx @n8n/scan-community-package n8n-nodes-icd11
```

Release history is in [CHANGELOG.md](CHANGELOG.md).

## Installation

In n8n, go to **Settings → Community nodes → Install** and enter:

```
n8n-nodes-icd11
```

For a self-hosted instance you can also install it directly:

```bash
npm install n8n-nodes-icd11
```

## Operations

| Operation | Route | Status |
|---|---|---|
| Search | `/icd/release/11/{release}/mms/search` | Verified |
| Autocode Text | `/icd/release/11/{release}/mms/autocode` | Verified |
| Get Code Info | `/icd/release/11/{release}/mms/codeinfo/{code}` | Verified |
| Look Up Foundation URI | `/icd/release/11/{release}/mms/lookup` | Verified |
| Get Entity | `/icd/entity/{id}` | Verified |
| List Releases | `/icd/release/11` | Cloud only |

The first five were validated against the official `whoicd/icd-api` image (release `2026-01`) with a round-trip check: `autocode` on "cholera" returns code **1A00** with score 1, `codeinfo/1A00` resolves to the same `stemId`, and its `foundationURI` resolved through both `lookup` and `/icd/entity/{id}` returns Cholera again.

`List Releases` is **not available on local deployments**: the container embeds a single release and answers 404. The operation is kept for the WHO cloud API.

## Example workflow

Turn a free-text diagnosis into a billable ICD-11 code:

1. **Autocode Text** with Clinical Text set to `acute myocardial infarction`. The response carries `theCode` and a `matchScore`.
2. **Get Code Info** with Code set to the `theCode` from the previous step, to pull the full title, parent and `stemId`.

Set **Match Threshold** under Options to discard weak matches, and **Language** to get the content in a language other than English.

## Testing without credentials

The official image does not require OAuth, so it works for development:

```bash
docker run -d -p 8080:80 -e acceptLicense=true -e saveAnalytics=false whoicd/icd-api
```

Point the credential's **Base URL** at `http://localhost:8080`.

Two caveats: the container ships **English only**, so `Accept-Language` other than `en` only pays off against the cloud API; and it exposes its own Swagger at `/swagger/index.html`, which is handy because the cloud one requires authentication.

## Requirements

- n8n 1.x or later
- Node.js 20.19 or later
- ICD API credentials (free)

## Getting credentials

1. Register at <https://icd.who.int/icdapi>
2. Confirm your email with the link the WHO sends you
3. Sign in and go to **API Access → View API access key(s)**
4. Copy the `client_id` and the `client_secret`

## Authentication

The node uses **OAuth2 with the client credentials grant**:

| | |
|---|---|
| Token endpoint | `https://icdaccessmanagement.who.int/connect/token` |
| Scope | `icdapi_access` |
| Token lifetime | ~1 hour (n8n refreshes it for you) |
| Base URL | `https://id.who.int` |

The API can also be deployed locally with Docker, which is useful for testing without depending on the network. The credential lets you pick between the WHO cloud and a local instance.

## Required headers

The API requires `API-Version: v2` and accepts `Accept-Language` to negotiate the language of the returned content.

## Development

```bash
npm ci
npm run build
npm test      # validates the demo workflow against the compiled node
npm run lint
```

`npm test` needs no credentials and no network: it loads the compiled node
description and checks that every operation, parameter and connection in
`test/workflow-demo.json` actually exists and is visible for its operation.
See [test/README.md](test/README.md) for the Docker-based checks against a real
n8n instance.

## License

MIT

## Disclaimer

This is an independent community project. It is not affiliated with or endorsed by the World Health Organization. Use of ICD content is subject to the WHO's licensing terms.
