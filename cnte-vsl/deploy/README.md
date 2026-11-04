# Isolated live-classroom preview deployment

This directory is for **an experimental, non-production deployment** of CNTE-VSL. The live lab **cannot** run as a multi-user service on GitHub Pages alone: it requires the Node.js WebSocket server.

## Local demonstration

From `cnte-vsl/`:

```bash
npm install
npm test
npm run test:integration
npm start
```

Open `http://127.0.0.1:8080/live.html`. On one browser window select **Lecturer**, create a room and copy the code. On another browser or device, open the same site and select **Student**, enter a demonstration name and the room code. The lecturer can perform a live titration demonstration while students operate separate virtual benches. Instructor feedback, room assignments, and pause/resume controls use WebSockets.

## Render preview configuration (manual review required)

An example blueprint is provided at `deploy/render-blueprint.example.yaml`; it is intentionally **not** named `render.yaml` at repository root, to avoid modifying any existing CNTE deployment. Review it and deploy **only** to a new, isolated development service connected to the branch `feature/cnte-virtual-science-labs`.

Recommended setup:
- Source repository: `moganajr/cntecale`.
- Branch: `feature/cnte-virtual-science-labs`.
- Root directory: `cnte-vsl`.
- Runtime: Node.js 22.
- Build command: `npm install --ignore-scripts --no-package-lock`.
- Start command: `npm start`.
- `HOST=0.0.0.0`.
- Set a **private** `LIVE_PREVIEW_KEY` with at least 16 unpredictable characters in the host's secret environment variables; do not commit it.
- Health endpoint: `/api/health`.
- Use HTTPS/WSS and restrict the preview to an approved instructor/test cohort, ideally behind an additional access policy.
- Use one running instance only; do not horizontally scale an in-memory room server.

Do not configure `cnte.ciu.edu.lr` or overwrite any existing CNTE/CALE service. No live environment has been provisioned by these source changes.

## Architecture and scope

The prototype uses `POST /api/rooms`, `POST /api/rooms/:code/join`, and a same-origin `/live` WebSocket endpoint. The instructor receives a private role token, students receive separate random role tokens, and the server validates every learner experiment action against a shared scientific/procedural state machine. Student sessions cannot modify other learners' apparatus. The lecturer can run a shared demonstration, broadcast an assignment, send individual feedback, and pause/resume a learner. The initial shared practical is acid–base titration; other laboratories remain standalone interactive simulations.

**Limitations before real use:** no institutional SSO, persistent database, durable audit trail, enrollment roster, tutor voice/video, privacy impact assessment, independent scientific calibration, load testing, room handoff/failover, formal examination security, or official certification. In-memory rooms and learner evidence are lost when the process restarts and expire after four hours. Use only test identities and synthetic measurements. Data exported from the instructor interface are development evidence, not approved academic records.

## Next engineering gates

1. Run the automated HTTP/WebSocket integration test and browser acceptance test.
2. Add CNTE identity-provider integration and per-course instructor/student RBAC.
3. Add durable append-only events, database storage, secure access control, retention policies, and tenant isolation.
4. Replace illustrative apparatus geometry with validated, directly manipulable 3D physical interactions and error feedback.
5. Extend the same live practical interface to physics, biology, medical lab, and TVET.
6. Require independent science, safety, accessibility, and curriculum review before opening enrollment.
