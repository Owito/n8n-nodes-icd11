# Tests

Two layers, neither of which needs WHO API credentials.

## 1. Structural validation (runs in CI)

```bash
npm run build
npm test
```

`validate-workflow.js` loads the **compiled node description** and checks a
workflow JSON against it: node type, that every operation exists, that every
parameter exists and is actually visible for that operation per
`displayOptions`, that no unknown key is set inside the `Options` collection,
that required parameters are present, and that connections point at nodes that
exist.

It catches the class of bug that only shows up when a user drops the node on a
canvas, and it does it without a running n8n, without network and without
credentials. Pass a different file as the first argument to validate your own
workflow:

```bash
node test/validate-workflow.js path/to/workflow.json
```

## 2. Load check inside a real n8n

```bash
docker compose -f test/docker-compose.test.yml up -d
docker logs -f n8n-test-icd11
```

Installs the published package at boot through
`N8N_COMMUNITY_PACKAGES_MANAGED_BY_ENV`, so n8n's `PackageDirectoryLoader`
registers the package without anyone touching the UI. A successful boot proves
the published tarball is loadable: package `n8n-nodes-icd11`, node `icd11`,
credential `icd11OAuth2Api`, workflow node type `n8n-nodes-icd11.icd11`.

## 3. Trying it by hand

```bash
docker compose -f test/docker-compose.yml up -d
```

Then open <http://localhost:5678> and install `n8n-nodes-icd11` from
**Settings > Community nodes**, the way a user would.

## Testing against the API without credentials

The WHO ships an official container that serves the same API locally and does
**not** require OAuth:

```bash
docker run -p 8080:80 -e acceptLicense=true -e saveAnalytics=false whoicd/icd-api
```

Wait for `ICD-11 Container is Running!` in the logs before trusting any
response: while it builds its indexes it answers 404 and 500 on valid routes.
It embeds a single release and only English, so `List Releases` and
`Accept-Language` values other than `en` can only be exercised against the WHO
cloud API.
