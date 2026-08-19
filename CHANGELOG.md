# Changelog

All notable changes to this project are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- `test/` suite: structural validation of a workflow JSON against the compiled
  node description, plus Docker Compose setups to load the package in a real
  n8n. Neither needs WHO API credentials.
- Continuous integration on every push and pull request: lint, build and the
  structural validation.

## [0.1.3] - 2026-08-03

### Fixed

- **Send `Accept-Language: en` by default.** The ICD-11 API does not fall back
  to a default language: without the header it fails outright instead of
  serving English. The node only sent it when the user opened
  Options > Language by hand, so the node was broken out of the box in 0.1.0,
  0.1.1 and 0.1.2. Measured against the official `whoicd/icd-api` image:

  | Route | Without header | With `Accept-Language: en` |
  |---|---|---|
  | `/icd/entity/{id}` | 404 | 200 |
  | `mms/search` | 404 | 200 |
  | `mms/autocode` | **500** | 200 |
  | `mms/lookup` | 404 | 200 |
  | `mms/codeinfo` | 200 | 200 |

  The header is now set in the node's `requestDefaults` and in the credential
  test. The `Language` option still overrides it.

  The bug survived the first validation round because that round exercised the
  API with `curl`, passing the header by hand, rather than exercising the node
  the way n8n runs it.

### Changed

- Default `Language` is now `en` instead of `es`.

## [0.1.2] - 2026-08-03

### Added

- Credential test on `Icd11OAuth2Api`, so the credential can be verified from
  the n8n UI. It requests `/icd/entity/257068234` (Cholera), chosen over
  `/icd/release/11` because that route is verified against both the WHO cloud
  and the local container, while `/icd/release/11` answers 404 locally and
  would show a failing credential to anyone developing against Docker.

## [0.1.1] - 2026-08-03

### Changed

- Releases are now published from GitHub Actions through npm **trusted
  publishing (OIDC)**. No publish token exists in the repository or on the
  maintainer account; npm generates the provenance attestation itself.

## [0.1.0] - 2026-08-03

### Added

- First release. n8n community node for the WHO ICD-11 API with six
  operations: Search, Autocode Text, Get Code Info, Look Up Foundation URI,
  Get Entity and List Releases.
- OAuth2 client credentials credential against
  `https://icdaccessmanagement.who.int/connect/token`.
- Usable as an AI agent tool (`usableAsTool`).
- Zero runtime dependencies. Published with npm provenance.

[Unreleased]: https://github.com/Owito/n8n-nodes-icd11/compare/v0.1.3...HEAD
[0.1.3]: https://github.com/Owito/n8n-nodes-icd11/compare/v0.1.2...v0.1.3
[0.1.2]: https://github.com/Owito/n8n-nodes-icd11/compare/v0.1.1...v0.1.2
[0.1.1]: https://github.com/Owito/n8n-nodes-icd11/compare/v0.1.0...v0.1.1
[0.1.0]: https://github.com/Owito/n8n-nodes-icd11/releases/tag/v0.1.0
