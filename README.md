# n8n-nodes-icd11

An [n8n](https://n8n.io/) community node for the **WHO ICD-11 API**, the World Health Organization's International Classification of Diseases.

It lets you search and code diagnoses from an n8n workflow, without hand-writing HTTP calls or managing the token lifecycle yourself.

## Status

In development. Not published to npm yet.

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

## License

MIT

## Disclaimer

This is an independent community project. It is not affiliated with or endorsed by the World Health Organization. Use of ICD content is subject to the WHO's licensing terms.
