# CNTE-VSL Cloudflare Containers — development-only deployment handoff

**Status:** Configuration prepared in GitHub. **No Container deployment, Cloudflare paid-plan change, secret modification, custom-domain activation or production DNS change has been performed here.**

## Source

- Repository: `moganajr/cntecale`
- Branch: `feature/cnte-virtual-science-labs` (**never main**)
- Project: `cnte-vsl/`
- Dockerfile: `cnte-vsl/Dockerfile`
- Container Worker: `cnte-vsl/cloudflare/container-worker.js`
- Wrangler configuration: `cnte-vsl/cloudflare/wrangler.jsonc`
- GitHub test/build workflow: `.github/workflows/cnte-vsl-container-dev.yml`
- Existing authenticated Worker: `cnte-vsl-proxy` (Agent Lee controls this Worker)

## Architecture

```text
labs-dev.ciu.edu.lr
   |
   v
cnte-vsl-proxy (existing Worker; existing cookie login and rate limiting)
   |
   | authenticated service binding request
   | X-CNTE-VSL-Bridge: secret (injected ONLY after authentication)
   v
cnte-vsl-container-dev (separate Worker; workers_dev=false; no custom domain)
   |
   | same secret checked, then removed before forwarding
   | X-CNTE-Preview-Key: secret (added server-side only)
   v
VslContainer Durable Object (single named instance)
   |
   v
Node.js 22 on 0.0.0.0:8080; /api/health and /live WebSocket
```

A single named Durable Object Container maintains classroom affinity while running, but the Node.js application still stores rooms in process memory and loses them after a restart.

## Prerequisites — Agent Lee must check

1. Confirm the correct Cloudflare account, Containers entitlement and Workers Paid status; obtain explicit user approval **before** a paid subscription/charge.
2. Confirm the source branch is accessible and permission to create a **new** Worker named `cnte-vsl-container-dev`. Do not overwrite `cnte-vsl-proxy`.
3. Configure GitHub Actions access to Docker if using the test pipeline; a separate Docker-compatible runner may be required for deployment. The workflow performs **no paid deployment automatically**.
4. Configure `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` as encrypted GitHub Actions secrets only if GitHub-based deployment is approved; never commit token values.
5. Configure the GitHub environment `cnte-vsl-development` with a reviewer approval requirement and repository variable `CNTE_VSL_PAID_DEPLOY_APPROVED=true` **only after approval**. GitHub `workflow_dispatch` generally requires the workflow to be present on the default branch; this workflow is deliberately kept on the feature branch to preserve main. The safe push-triggered Docker verification works without manual dispatch. To deploy without modifying main, Agent Lee can run Wrangler from an authorized Docker-capable checkout of the development branch.

## Local verification (no Cloudflare deployment)

```bash
git checkout feature/cnte-virtual-science-labs
cd cnte-vsl
npm install --ignore-scripts --no-package-lock
npm test
npm run test:integration
docker build -t cnte-vsl-dev:qa .
docker run --rm -p 127.0.0.1:18080:8080 \
  -e HOST=0.0.0.0 -e PORT=8080 \
  -e LIVE_PREVIEW_KEY=development-test-key-only-1234567890 \
  cnte-vsl-dev:qa
# Separate terminal: curl -fsS http://127.0.0.1:18080/api/health
```

Do not claim passing tests until outputs/logs are observed and stored.

## Deploy the internal backend when eligibility and approval are confirmed

Use Wrangler 4.141.0 or later with Docker running, from `cnte-vsl/`:

```bash
npx wrangler@4.141.0 deploy --config cloudflare/wrangler.jsonc
```

The backend Worker is configured with `workers_dev=false` and has no custom domain or public route.

Generate a fresh high-entropy **bridge key**, at least 32 random bytes, in the Cloudflare secure environment. **Do not send it through chat.** Set the identical value as `CNTE_VSL_BRIDGE_KEY` secret on **both** the existing authenticated proxy Worker and the private `cnte-vsl-container-dev` Worker.

Example secure interactive command for the backend (do not log the key):

```bash
npx wrangler@4.141.0 secret put CNTE_VSL_BRIDGE_KEY --config cloudflare/wrangler.jsonc
```

Use Agent Lee's secure secret-management action to configure the existing `cnte-vsl-proxy` Worker. The existing login access key and cookie signing key remain separate and unchanged.

### Change to existing proxy Worker (requires Agent Lee)

Add an internal **Worker service binding** to `cnte-vsl-container-dev` with binding name `CNTE_VSL_BACKEND`.

After **successful existing cookie authentication**, the proxy may forward requests as follows. This is an illustrative handler fragment; preserve Agent Lee's existing login, cookie verification, login rate limiting, and safe routing code:

```js
const upstream = new Request(request);
upstream.headers.delete("X-CNTE-VSL-Bridge");
upstream.headers.set("X-CNTE-VSL-Bridge", env.CNTE_VSL_BRIDGE_KEY);
return env.CNTE_VSL_BACKEND.fetch(upstream);
```

Never forward unauthenticated requests to the service binding. Preserve WebSocket Upgrade headers, and return the WebSocket handshake response unchanged. Do not expose the `CNTE_VSL_BRIDGE_KEY` or `LIVE_PREVIEW_KEY` in responses or client-side scripts.

The backend Worker injects the matching `X-CNTE-Preview-Key` header into the Node origin and starts the Node process with `LIVE_PREVIEW_KEY` set from the same secret. These values are not supplied by browsers.

Use a **separate** `labs-dev.ciu.edu.lr` custom domain only on the existing authenticated proxy Worker after the service binding and security tests succeed. Do not add any route to `cnte.ciu.edu.lr` and do not change its DNS/proxy status.

## Required go/no-go acceptance

- Cloudflare entitlement + paid costs approved
- Real Node, test suite and HTTP/WebSocket integration green
- Docker image built and health check passes
- Container-bound Worker starts and responds through internal binding
- Unauthenticated HTTP and WebSocket requests denied
- Valid authenticated login works with secured cookies
- At least one lecturer and two students collaborate, and cannot access one another's private benches
- Reconnect works and classroom stays mapped to one instance while active
- Separate production CNTE website remains unaffected
- Container restart / in-memory room loss warning prominently documented
- Rollback: unbind the development custom domain, remove internal proxy service binding, and/or delete the isolated Container Worker

**Deployment is not production readiness:** persist classrooms and portfolios, institutional authentication, clinical SME review, accessibility testing and reliable multi-instance scaling before broad use.

Current authoritative Cloudflare guidance:
- https://developers.cloudflare.com/containers/examples/websocket/
- https://developers.cloudflare.com/containers/examples/env-vars-and-secrets/
- https://developers.cloudflare.com/containers/configuration/wrangler/
