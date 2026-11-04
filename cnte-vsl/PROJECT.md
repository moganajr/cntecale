# CNTE Virtual Science Laboratories — development status

**Branch:** `feature/cnte-virtual-science-labs`  
**Latest milestone:** v0.8 — collaborative practical classroom pilot  
**Production status:** NOT DEPLOYED. The CNTE/CALE `main` branch remains unchanged.

## Existing single-user laboratories (7)
1. Chemistry — acid–base titration, repeated trials, pH curve, 3D apparatus illustration.
2. Physics — Ohm's law with series/parallel ideal networks and 3D equipment illustration.
3. Biology — potato osmosis model.
4. Medical laboratory — introductory hemoglobin/QC simulation.
5. TVET — low-voltage electrical fault diagnosis and 3D equipment illustration.
6. Biology — virtual microscopy and synthetic slides.
7. Medical laboratory — advanced synthetic hematology and three-level QC.

## New v0.8 collaboration pilot

- Same-origin Node.js HTTP + WebSocket classroom server (isolated from production).
- Lecturer creates a room, assigns a task, performs live shared titration, monitors independent learner benches, coaches and resets/restricts work.
- Student joins via room code and temporary token; equipment placement, indicator, calibration, incremental titrant dispensing, meniscus reading, repeated titres and lab notes are server-validated actions.
- Live 3D apparatus illustration plus interactive 2D apparatus actions; instructor and student dashboards update over WebSocket.
- Preliminary preview access key, role separation and four-hour in-memory room expiry.
- Software integration test defined for actual lecturer/student exchange, feedback, demonstration, safety-stop, reset and room access.
- All 111 previous scientific/scoring assertions plus 30 live-state assertions passed in the isolated JavaScript test harness. A real Node/WebSocket server run, browser interaction test and GitHub Actions result are not yet verified.

## First practical classroom launch

Read `deploy/README.md`. The service must run as a Node web application (`npm install && npm start`), **not** solely under GitHub Pages. No public development URL exists yet. An isolated Render configuration example is available, but deployment requires a connected hosting account and approval of the preview configuration.

## Required next phases

1. Deploy restricted live preview to an isolated Node host and verify HTTP/WebSocket integration.
2. Validate with two browsers and a lecturer/student pilot class.
3. Upgrade live interactions to manipulated, not only rotatable, 3D apparatus with realistic science.
4. Adapt the live classroom architecture to physics, biology, medical laboratory and TVET.
5. Integrate audited CNTE/CALE authentication, course roster, LMS, gradebook and durable portfolios.
6. Obtain curriculum, scientific and safety review before high-stakes assessment.

See `LIVE_LAB_REQUIREMENTS.md` for **non-negotiable** real practical activity and lecturer supervision expectations.
