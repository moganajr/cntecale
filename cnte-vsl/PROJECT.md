# CNTE Virtual Science Laboratories — development status

**Branch:** `feature/cnte-virtual-science-labs`  
**Latest milestone:** v1.5 — separate student workbenches, centralized classroom authorization, action revisions and reconnect support  
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


## New v1.0 live equipment servicing

- `equipment-live.html` offers dedicated instructor and student equipment rooms using the existing CNTE-VSL Node/WebSocket service.
- 12 model catalog, individual student component states, live instructor demonstration and progress supervision, feedback, pause/resume and retries.
- Confirm isolation before tool use, perform 90-degree fastener-driver turns, remove parts in dependency order, digitally inspect and repair damage, reinstall parts, tighten the fasteners and pass a functional check.
- Accessible tool and part controls plus drag-and-drop between installed-components and removed-parts trays; 360-degree view and transparency remain available.
- The scientific engine makes authoritative state decisions; animated geometry remains simplified, not a manufacturer-certified 3D or VR/AR simulation.
- 492 equipment/mechanical assertions pass in the local JS harness. Server/WebSocket integration test is authored but browser and hosted runtime completion remain unverified.
- No external laboratory integration and no changes to production `main`.


## Version 1.1 spatial assembly gate

The self-built live repair engine now models per-part attachment locations and an instructional positional/rotational tolerance. Students adjust part X/Y/Z coordinates, see displaced-part and target-mount markers, and must pass the server-validated docking gate before installing. The optional precision snap is an instructional aid. Existing safety isolation, fastener constraints and lecturer supervision remain active; previously passed functional tests expire after subsequent manipulation.

841 equipment, servicing and spatial checks passed in an isolated JS harness. Browser, full WebSocket runtime, scientific realism and device-specific AR/VR validation are still outstanding. This is not manufacturer-certified assembly training.


## Version 1.2 additional practical controls

The self-built live workshop now requires tool selection/contact before manual fastener operations or applying digital repairs; collision-aware movements; equipment-specific connector restoration; and synthetic functional response before a practical test can pass. Existing lecturer/student role separation, isolation, 3D positioning and protective-cover sequences remain. Twelve models are supported. Four test groups pass 1,002 assertions; browser and HTTP/WebSocket runtime checks are not yet independently verified. The engine does not claim real CAD, medical instrument calibration, photorealistic 3D, or fully tracked AR/VR.


## Version 1.3 — Self-built live medical training

Three interactive procedure engines (synthetic hematology/QC, centrifuge safety, and nonpatient respiratory-equipment bench check) now run through our existing Node/WebSocket lecturer–student classroom. Medical training uses separate individual learner procedural states, a lecturer demonstration state, draggable virtual specimen/component placement with button accessibility, and medical progress summaries visible to lecturers and learners. All actions remain server-validated, and lecturer pause/reset applies to medical exercises. The main dashboard links directly to the live hematology classroom.

The equipment/servicing/spatial/physical/medical model suite passed 1,037 assertions in an isolated JavaScript harness. The medical UI, live server and expanded HTTP/WebSocket test sources passed syntax checks. Actual multi-browser WebSocket test execution, hosting, clinical expert review, headset AR/VR functionality and clinical device calibration are still unverified. This is an instructional prototype with synthetic data and cannot be used for real diagnosis, treatment or physical medical device maintenance.

The system remains entirely self-built: no third-party virtual science laboratory integration; production CNTE/CALE main branch unchanged.


## Version 1.4 — Live medical microscopy

The same self-built live classroom now supports a fourth medical practice type, `field-microscope`. The learner actively selects synthetic slide specimens, prepares microscope stage and illumination, selects objective magnification, focuses a computer-rendered synthetic field, identifies structures, saves observations and interprets the comparison between at least two slides. The lecturer can perform the same procedures on a demonstration bench while learner stations remain independent; students see a read-only live lecturer microscope viewport. Optional institutional training videos remain available in the original equipment workshop, without integrating a third-party lab service.

All 1,059 equipment, mechanical, spatial, synthetic-medical and microscopy model assertions passed in the source test harness. Browser rendering, the hosted two-student/lecturer WebSocket integration, clinical expert review and formal competency accreditation remain **unverified**. These are original teaching illustrations, not clinically diagnostic images or patient results. Production CNTE/CALE is unchanged.


## Version 1.5 — Live classroom reliability

A new self-built classroom protocol engine centralizes role validation and live student/lecturer state changes, adds monotonic revisions and lecturer-only action history, protects each learner's private snapshot, and preserves student benches across manual reconnects while rooms remain in memory. The corresponding two-student model tests passed 35 assertions. The existing integration test now exercises two students, lecturer demonstration, personal progress privacy, and the chemistry, equipment, and synthetic medical room modes. **Runtime end-to-end execution remains unverified.** See `LIVE_CLASSROOM_QA.md` for required local and hosted acceptance steps. No production branch or external virtual laboratory was changed.
