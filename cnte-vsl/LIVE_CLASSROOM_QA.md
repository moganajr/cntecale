# CNTE-VSL Version 1.5 — Live Classroom Acceptance Plan

**Release gate: NOT PASSED.** The source contains the tests and controls below, but deployment and actual multi-browser execution have not been confirmed.

## Self-built scope
The native Node.js WebSocket service supports chemistry titration, equipment repair and synthetic medical practicals. No external virtual laboratory integration is needed. Rooms, classroom records and demonstration work remain temporary and nonclinical.

## Automated verification
From `cnte-vsl/` on Node.js 22:

```bash
npm install --ignore-scripts --no-package-lock
npm test
npm run test:integration
npm start
```

The main scientific and classroom model tests run without external institutional services. The integration suite starts the local server and checks HTTPS-preview-key equivalents for HTTP room creation, separate WebSocket clients, lecturer demonstrations, private responses, pause/reset, classroom mode restrictions and microscopy messaging. This command still needs to be executed successfully on a machine with the `ws` dependency installed. A syntactically valid integration test does **not** count as an integration pass.

## Manual acceptance — lecturer + two students

1. Start the development Node service. Open `/api/health`; verify the prototype health response.
2. Open `/live.html` as a lecturer. Create a chemistry room and record the room code.
3. Open the same site in two independent browsers or private profiles. Both students join with different demonstration names.
4. Have student A select PPE and assemble the titration apparatus. Verify only A's bench changes in the lecturer dashboard.
5. Have student B record a separate practice action. Verify the lecturer sees both benches and neither student receives the other's private progress data.
6. Have the lecturer demonstrate titration on the separate instructor bench; confirm both students see the changing demonstration state, not a change to their own benches.
7. Provide feedback only to student A; verify student B never receives it. Pause student B; ensure B cannot perform an experiment action, while A remains unaffected.
8. Disconnect and reconnect student B. Confirm B's existing temporary workbench still loads and continues at the same state and revision.
9. Open `/equipment-live.html?equipment=electrical-panel`. Repeat separate workbench checks for part inspection, contact tools, fasteners, removal, alignment, connection, and simulated function checks.
10. Open `/equipment-live.html?equipment=field-microscope`. Verify the lecturer's synthetic microscope view is read-only on student stations, students can independently prepare/focus/record observations, and safety checks block unauthorized actions.
11. Export the lecturer classroom snapshot and confirm that its action sequence is strictly increasing and excludes credentials and secret preview keys.
12. Test mobile layout, keyboard-only operation, low-bandwidth and reconnect behavior. Record defects with repeatable steps.

## Security and scientific limitations
This is **not** institutionally authenticated or persistence-backed. Existing preview keys, random session tokens and participant role checks are development safeguards only. In-memory rooms expire after four hours and evidence is lost after a server restart. No real patient information should be uploaded. Synthetic training calculations are not physical medical device measurements, professional qualification or clinical diagnosis.

The engine provides monotonic room revisions, bounded lecturer-only event history, student-specific snapshots, manual reconnect controls, separate learner workbenches, lecturer-only pause/reset and feedback, and test coverage for cross-student isolation.

## Exit requirements before any educational pilot
- GitHub Actions model tests: green
- Real local HTTP/WebSocket integration test: green
- Two-browser and lecturer walkthrough: passed
- Authorized education/safety review: completed
- Privacy controls, accessibility, and record retention reviewed
- Separate nonproduction hosting and monitoring configured

The current work **does not** change CNTE/CALE production or deploy a hosted preview.
