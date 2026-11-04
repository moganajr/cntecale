# CNTE Virtual Science Laboratories — Functional pilot v0.1

An independent, dependency-free, offline-capable browser-based pilot that implements five interactive educational science models. Designed as a future module for CNTE/CALE, **not yet integrated with the live CNTE system**.

## Run

Install nothing beyond a local Python 3 server (or any static HTTP server):

```bash
cd cnte-vsl
python3 -m http.server 8080
```

Open http://localhost:8080. In supported browsers, the service worker caches the app after the first visit. On a device accessible over LAN, standard browser PWA security rules apply; offline service workers require HTTPS or localhost.

Run numerical model tests with `npm test` (requires Node.js, no package installation). No hosted libraries or APIs are used.

## Implemented

- Five interactive starter experiments: titration, Ohm's law, osmosis, synthetic hemoglobin analyzer QC and low-voltage electrical fault diagnosis.
- Scientific formula calculations, parameter control, guided instructions and simulated safety gates.
- Workbench illustrations (SVG), procedural checklists, electronic notebook, practice scoring, browser-local submissions.
- Student portfolio and JSON / CSV export.
- Faculty *draft request* workflow, not a validated free-form lab builder.
- Responsive interface, semantic forms, service-worker app shell cache.

## Important limitations

- **Not a 3D / VR simulator yet**: workbench uses original SVG 2D visualizations. Accurate 3D equipment and physics-based interaction require a later release.
- Curricular subject/topic labels are provisional; no official WAEC syllabus version or exam endorsement is asserted.
- Models intentionally simplified. Titration assumes 1:1 strong acid/base equivalence, omits detailed pH curves. Osmosis uses an illustrative linear pedagogical approximation, not an experimentally validated potato-tissue biophysical model. Hematology uses **synthetic** readings and simplified QC tolerance. Electrical model is ideal DC with qualitative short-circuit safety stop.
- No real user accounts, tenant isolation, faculty authorization, clinical information, CALE gradebook, server database, cloud backup, remote multiplayer, formal certification, or institutional audit trail.
- All progress is stored in the **current browser's localStorage** and can be deleted by clearing local site data. Export it manually.
- No claim of compliance with official high-stakes examination or regulated clinical competency standards.
- A functioning UI is not evidence of production-readiness. Subject specialist validation and accessibility audits are still required.

## CNTE integration interface — future work

1. Audit live CNTE tech stack and its existing authentication, multi-tenancy and CALE course schemas.
2. Replace local profile with CNTE JWT/session adapter and server authorization for learners, instructors, reviewers and institution admins.
3. Create server-side schemas for validated `Laboratory`, `ExperimentVersion`, `ModelValidation`, `SafetyApproval`, `Enrollment`, `Attempt`, `Measurement`, `Review`, `GradeTransfer` and `PortfolioArtifact`.
4. Expose tenant-aware APIs, e.g. `GET /api/vsl/labs`, `POST /api/vsl/attempts`, `POST /api/vsl/attempts/:id/measurements`, `POST /api/vsl/attempts/:id/submit`, `POST /api/vsl/reviews/:id/decision` and a verified CALE grade passback service. All paths are **illustrative**, not existing endpoints.
5. Use approved curriculum mappings, digital signatures for scientific validation, audit logs, risk reviews and verified gradebook contract tests.
6. Add Three.js/Babylon/WebXR using progressively enhanced 3D assets and accessible 2D alternatives.
7. Implement encrypted offline record storage, robust reconciliation and secure attempt verification; a service-worker cache alone is not complete offline-first examination support.

## Suggested pilot validation

Use a qualified secondary science teacher, chemistry/physics/biology laboratory scientist, a medical laboratory professional and a TVET instructor to review each experiment. Check scientific assumptions and scoring, safety, usability, accessibility and each curriculum mapping prior to class or formal assessment use.

## Files

- `index.html`: main app entry point
- `src/app.js`: UI, lab sessions, notebook and persistence
- `src/science.js`: transparent, unit-testable pedagogical models
- `src/styles.css`: responsive UI design
- `sw.js`, `manifest.webmanifest`, `assets/icon.svg`: installable offline app shell
- `tests/science.test.mjs`: numerical validation assertions

## Version 0.2 development milestone — 3D titration

The chemistry titration workbench now includes a dependency-free 3D geometry renderer with drag-to-rotate and wheel-to-zoom, a visible burette and conical flask, titrant volume changes, and a selectable accessible 2D diagram. Volume is dispensed through explicit keyboard-accessible buttons (0.1, 0.5, 1.0 mL); the 3D scene is a visualization rather than a fully physics-simulated fluid engine.

The titration model now exposes an ideal 25 °C strong monoprotic acid/base pH calculation based on molar amounts and water autoionization, with input validation and a computed equivalence volume. It is an educational model and **must not** be interpreted as a calibrated laboratory instrument or validated examination score.

### Verification

Run `npm test` from the `cnte-vsl` folder to execute 19 model/scoring assertions. A GitHub Actions workflow is committed, but its remote execution result must be checked before claiming CI success. The code is on an isolated development branch; no production deployment or authenticated CALE integration has occurred.

### Preview and release safety

Avoid enabling GitHub Pages at the repository level without first confirming the existing Pages configuration, domain and downstream production deployments. A branch-specific preview can be set up on a dedicated hosting project without altering CNTE's live domain.


## Version 0.3 — Measurement, trials, curve and grading

The titration workbench now adds a calibration/eye-level meniscus check, initial and final burette reading fields, repeat trial preparation, an accepted-trial notebook, mean titre and range checks, and a live SVG plot of the idealized strong acid–strong base pH curve. An accepted endpoint requires simulated calibration, PPE, apparatus preparation, indicator and final burette reading within 0.11 mL of the simulated meniscus. Duplicate recording of the same completed trial is blocked.

**Concordance policy:** At least two accepted titres with a maximum difference of 0.20 mL are required for a simulation practice pass. This is an internal teaching configuration, not an official WAEC grading policy.

**Titration scoring (100 points):** PPE 15, preparation 10, calibration 15, indicator 5, procedural technique 15, repeatability 20, trial records 10 and written analysis 10. Failing the concordance condition prevents a practice pass regardless of the numeric score. Other lab tracks retain the original prototype scoring.

**Limitations:** Meniscus entry is verified against an idealized 0.1 mL reading rather than a physical eye-position model. Equipment calibration is a procedural confirmation, not an instrument calibration simulation. The curve is computed from an ideal monoprotic strong acid/base equilibrium at 25 °C, excluding solution activity effects. No exam body or scientific reviewer has approved this simulation for high-stakes assessments.

**Testing:** The enhanced test suite now has 34 assertions covering the first five models and the new titration practical functions. The tests were executed against the retrieved source using an isolated JavaScript assertion harness; a passing remote GitHub Actions workflow has not been confirmed.


## Version 0.4 — Physics workbench

- Rotatable 3D circuit bench plus accessible 2D configuration schematic.
- Ideal low-voltage DC simulation: series/parallel resistance, currents, power and meter positions.
- Switch, isolation, open-circuit, short-circuit and current-limit safety checks.
- Repeated series and parallel measurements, notebook, export and portfolio report.
- 100-point rubric: PPE 15, preparation 10, isolation 15, meters 20, measurements 15, comparisons 15, interpretation 10.
- Both network configurations must be measured for practice pass.

Limitations: ideal resistor model; 3D shapes illustrate apparatus rather than physical freehand wire manipulation. Not certified physical or high-stakes training. 55 assertions passed in the local JavaScript test harness; remote CI and end-to-end browser tests remain unconfirmed. CNTE production main branch unchanged.


## Version 0.5 — Advanced biology microscopy

The biology catalog now contains **two** experiments: the original potato osmosis model and a new microscopy/cell-identification practical. The new practical includes a rotatable 3D compound-light microscope teaching illustration, synthetic slide fields (onion epidermis, human cheek epithelium, leaf stomata), 10× eyepiece and 4×/10×/40× objective controls, approximate field diameter and estimated cell counts, fine-focus control, stage centering, illumination, and identification of specimen structures. A synthetic field of view responds to focus, stage offset and objective selection; it is **not** a real photomicrograph or clinical diagnostic product.

Workflow: select PPE, inspect microscope, switch on light, select slide, center stage, adjust focus, identify all relevant structures, save observations, then compare at least two unique specimens in the laboratory report. An observation is accepted only when the view is focused/centered, equipment preparation is complete, illumination is on and all correct features are identified without extraneous labels. The 100-point practice rubric covers safety (10), preparation (15), illumination (10), centering (10), focus (20), specimen identification (20) and reporting (15); a passing grade additionally requires two distinct identified specimens.

Optical approximations use total magnification = eyepiece × objective and field diameter = eyepiece field number (18 mm) ÷ objective magnification. Cell counts are illustrative—not scientific counts of real microscopic samples. A separate 3D mesh provides the instrument visualization rather than photorealistic optics. This is an educational practice simulator pending specialist, curriculum, and accessibility validation; no physical microscopy competency is certified.

**Verification:** 71 scientific/scoring assertions passed in an isolated JavaScript execution harness. JavaScript syntax checks passed for the new modules, but full browser QA and GitHub Actions execution have not been confirmed. No live CNTE/CALE backend connection or production release has occurred.


## Version 0.6 — Advanced synthetic hematology laboratory

Added a seventh laboratory module, **Advanced Hematology & Three-Level QC**, alongside the existing introductory hemoglobin analyzer demonstration. The new training workstation includes: virtual pre-analytical specimen identity and acceptance checks, instrument readiness, three illustrative QC levels (low, normal, high), QC failure and result-release gating, three synthetic case datasets, and automated red-cell index calculations (MCV, MCH, MCHC). Students must release at least two distinct simulated specimens after all three control levels pass to meet the practice-pass conditions.

The 100-point internal assessment comprises PPE/biosafety (15), specimen identification (10), acceptance checks (10), analyzer readiness (10), three-level QC (25), specimen measurement (15), and interpretation (15). The report is retained in the local browser portfolio and may be exported as JSON; it does **not** sync to CNTE/CALE yet.

**Scientific and safety limits:** all data are synthetic, instrument display is a schematic rather than a validated device emulator, and QC acceptance limits are illustrative, not manufacturer instructions or clinical reference intervals. No real patient data should be entered. The platform does not provide diagnoses, authorize test results, or certify physical laboratory competence. Pending qualified medical laboratory scientist, biosafety, curriculum, and end-to-end browser review.

**Verification:** all 92 scientific and scoring assertions passed in an isolated JavaScript assertion harness. Syntax checks passed for the medical modules and integrated app. GitHub Actions and full browser-execution status have not been independently confirmed, and the development branch is not deployed to production.


## Version 0.7 — TVET Electrical Fault Diagnosis Workshop

The existing TVET electrical experiment was upgraded to a dedicated low-voltage fault-diagnosis workshop, retaining its catalog identity and the previous six other labs. The workshop reuses the rotatable 3D DC equipment illustration alongside accessible form controls. Trainees select instructor fault scenarios (healthy, open conductor, shorted load, high-resistance connection), DC source 6/12/24 V, simulated multimeter mode (resistance, continuity, voltage, current), and the source isolation state. The model produces idealized meter readings or an explicit safety lockout for unsafe tests. Resistance/continuity measurements are blocked while energized; short-circuit/current-limit conditions are blocked from energized measurements.

A learner records simulated readings, submits an evidence-based diagnosis and documents a practical report. The internally proposed 100-point rubric awards PPE 15, inspection 10, isolation 20, measurements 20, correct fault diagnoses 20, reporting 15; a practice pass requires at least three distinct evidence-supported diagnoses. Unsafe simulated measurement attempts trigger a practice safety fail. Records are kept only in the browser-local learning portfolio.

**Important limitations:** this is an idealized low-voltage instructional model, not a true electrical engineering simulator or a certified electrician qualification. The 3D equipment is an illustrative rotatable model, not physical wire dragging. No real power system should be tested using these simplified instructions. No institutional competency endorsement, official Liberian TVET standard alignment, live CALE backend, or classroom deployment has been validated.

**Verification:** 111 JavaScript scientific and scoring assertions passed in the local source-test harness and the modified files passed syntax checks. GitHub Actions results and a full browser interaction test are not yet independently verified. The application remains on an isolated development branch and has not been deployed to the live CNTE instance.


## Version 0.8 — Lecturer/student live practical classroom (development)

**The central product requirement is active scientific practical work rather than videos or visual-only simulations.** See [LIVE_LAB_REQUIREMENTS.md](LIVE_LAB_REQUIREMENTS.md).

This milestone creates a distinct live classroom page, `/live.html`, and a Node.js WebSocket application supporting role-scoped, same-origin realtime chemistry titration. The instructor creates a room and shares its code, broadcasts task instructions, manipulates a shared demonstration bench, monitors separate student benches and scores, sends individual feedback, pauses students and authorizes a clean retry. Students perform simulated apparatus placement (including drag/drop or accessible button input), PPE and safety checks, indicator preparation, burette calibration, stopcock dispensing, meniscus recording, repeated trials, and written explanations. The authoritative event/state model runs on the server, not in an independent learner-only animation.

The instructor and students receive live apparatus volume/pH/trial states, with both a rotatable 3D equipment view and a complementary interactive 2D workbench. The 3D geometry is **not yet** fully physically manipulable; the controls and drop target perform the validated state changes.

### Launch locally

```bash
cd cnte-vsl
npm install
npm test
npm run test:integration
npm start
```

Visit `http://127.0.0.1:8080/live.html` in separate lecturer and student browsers. The Node service must be used for multi-user functionality; a static GitHub Pages copy of `live.html` would not provide live sessions. Refer to [deploy/README.md](deploy/README.md) for protected, separate deployment instructions.

### Preview security and incomplete production capabilities

- Room creation and joining are gated by `LIVE_PREVIEW_KEY` when configured. Hosting on a non-loopback interface refuses to start without an access key of 16 or more characters. Do not commit access keys.
- Lecturer and learners each have separate random role tokens and workbench permissions. Role identification is still **prototype-specific**, not yet CALE SSO or institutional authorization.
- Room state, assignments, grades and notes are held in memory. Rooms expire after four hours; server restarts lose evidence. Use synthetic/demonstration names and data exclusively.
- Shared live work currently supports **titration only**. The other six laboratory modules remain available in the standalone catalog but have not yet been given simultaneous multi-user practical capabilities.
- Full multi-browser end-to-end verification, specialist review, deployment, and production integration remain pending. The updated automated CI workflow now includes a real HTTP/WebSocket integration test, but CI success has not been verified in this conversation.

**No production CNTE/CALE source files on `main` were changed by this development milestone.**


## Version 0.9 — Advanced repairable equipment workshop and self-running lessons

The self-built `equipment.html` module (linked from the main laboratory dashboard and program cards) adds a **reusable equipment engineering workspace** intended for chemistry, biology, public health, university science, medical laboratory science, agriculture, computer/electronics, and vocational technical training. This is a step toward the hands-on capability requirements in `LIVE_LAB_REQUIREMENTS.md`; it does not yet meet high-end immersive simulation standards.

### Interactive mechanics now implemented

- 12 representative illustrated equipment assemblies, with uniquely identified and labeled components.
- 360-degree rotation by slider; selectable components; transparent / see-through cutaway view; exploded assembly view; parts list.
- Safety-isolation gates, dependency-constrained disassembly/reassembly, inspection of one training fault per model, correct digital tool selection, repair state and maintenance evidence.
- Practice rubric (inspection 15, disassembly 20, correct repair 30, reassembly 20, restored state 15) and JSON export.
- Low-cost stereoscopic *preview* (side-by-side projections). This is not tracked VR/headset support.
- Optional camera overlay that shows the equipment projection over a local camera feed; this is **not** spatially registered AR, object tracking, real-world equipment recognition or a certified WebXR experience.
- Built-in institutional instructional video player. Lecturers can choose a locally owned MP4/WebM/OGG file, play/pause, enable muted autoplay with looping, and use a separate self-running step-by-step instruction demonstration with timed on-screen captions. No videos are copied from PraxiLabs or other providers, bundled, uploaded to a server, or fetched from a third-party API.
- Browser autoplay with sound may be blocked. Students can manually start playback. The step-by-step procedure animation is locally generated, independent of the video player.
- The lesson is fully self-built and does not require an external laboratory or video integration.

### Equipment prototypes

1. TVET electrical control panel (fuse).
2. Automotive starter motor (brush).
3. Chemistry burette (stopcock).
4. Compound microscope (lamp).
5. Synthetic hematology analyzer (sample probe).
6. Synthetic bench centrifuge (rotor).
7. Public-health field microscope (illumination).
8. Agricultural irrigation pump (impeller).
9. Desktop computer system unit (RAM).
10. Fashion/design sewing machine (needle).
11. Welding torch assembly (contact tip).
12. Respiratory-training ventilator circuit unit (illustrative filter).

The parts are deliberately **simplified box-mesh drawings**, not original equipment manufacturer CAD models, physically calibrated assemblies, physics-based deformation, or medical device service instructions. User interaction and part dependencies are active, but neither the video nor the stereoscopic visualization proves realistic advanced VR. The camera overlay remains optional and local-only. Operational medical training still requires specialist sign-off.

### Validation and future work

The additional equipment module has **246 passing model and mechanical-action assertions** covering 12 models, rotation, transparency, exploded modes, protective-cover sequencing, component repair, tool selection and restoration. These passed in the isolated JavaScript assertion harness; full browser, WebXR, physics accuracy and faculty acceptance tests remain to be completed. The default Node test script and GitHub Actions syntax/test workflow are updated. Earlier laboratory model checks (111) and live classroom checks (30) remain included in the suite.

Next milestones:
- Replace indicative box geometry with validated, anatomically/mechanically accurate 3D assets and true interactive tool manipulation with snap-to-fit, torque/clearance/connector constraints.
- Add WebXR headset sessions, tracked controllers and spatial AR anchors with fallback accessibility and device compatibility checks. Do not claim these capabilities exist yet.
- Integrate the self-built live classroom teaching engine with equipment event streams, lecturer demonstration, supervised repairs, instructor approval and durable audit trails.
- Add authored institutional video and caption libraries, guided demonstrations, accessible transcripts, variable playback and instructor-controlled assignments.
- Build equipment validation program with TVET assessors, practicing medical lab scientists, engineers and safety reviewers; map to approved competency standards, then conduct learner trials.
- Preserve CNTE/CALE production features and keep the `main` branch untouched until review.

**Status:** v0.9 development source committed; no hosted deployment, verified browser integration, or institutional accreditation is claimed.


## Version 1.0 — Live equipment maintenance and manipulation

A new `equipment-live.html` interface introduces a second kind of lecturer-led practical in the existing **self-built** WebSocket classroom server. A lecturer can create an equipment room for any of the twelve equipment models, perform a live servicing demonstration, monitor the progress of separate learner service benches, provide direct feedback, pause attempts, and authorize resets. The original chemistry live classroom and individual science laboratory catalog are retained.

### Learner interactions

- Select equipment parts in a rotatable, see-through, labeled 3D projection, or use accessible controls.
- Dismantle components using dedicated **installed-parts** and **removed-parts** drag-and-drop trays, or equivalent remove/install buttons.
- Apply a virtual fastener driver by 90° increments. Four loosening turns are needed before removing a component; after reassembly, all disturbed fasteners must be tightened.
- Respect protective-cover removal order and internal component reassembly dependencies.
- Inspect a simulated damaged part, select its matching repair tool, carry out a digital repair, and reinstall it.
- Run a functional test only after all parts are installed and fasteners secured, with the simulated fault repaired.
- Inspect evidence, performed operations, and the simulated practice score.

### Live controls

- Students cannot alter another student's assembly or the lecturer demonstration.
- The instructor and each student receive independently validated equipment states through the Node.js WebSocket service.
- The lecturer has live workbench monitoring, individual text feedback, pause/resume and reset-for-retry permissions.
- These dedicated equipment sessions are separate from titration sessions and **do not require any third-party virtual laboratory integration**.

### Current standards and restrictions

The apparatus remains *illustrative low-poly box geometry*. This is **not yet high-fidelity physics**, haptic tool handling, tracked spatial AR/VR, certified medical device maintenance, manufacturer CAD, instrument calibration, graded torque feedback, or approved qualification evidence. The fastening and sequence constraints are educational approximations. Live-room data remain in memory, use demonstration identities and expire after four hours. Persistent academic portfolios and secure CNTE identity integration are not included in this milestone.

The software validation now includes 246 existing equipment mechanics checks and **210 new servicing-mechanics checks**. These passed in the isolated JavaScript test harness. The existing chemistry/live state regression checks also remain configured. A WebSocket integration test was expanded to cover equipment rooms, lecturer demonstrations, live monitoring, pause and reset; however the expanded test has not been observed completing against a running server. Full browser QA and hosted deployment are still pending.

### Next realistic-equipment roadmap

1. Replace box-mesh geometry with specialist-reviewed, dimensioned, textured parts and full 3D meshes.
2. Add tool collisions, spatial snapping, joint constraints, actual fastener selection, reassembly tolerances, and torque/range checking.
3. Add scientifically validated electrical, mechanical, biological, and medical instrument responses to component failures.
4. Progress from side-by-side stereo previews to a tested WebXR VR controller workflow and optional spatially tracked AR with fallback support.
5. Build original CNTE instructor-led procedure videos, synchronized annotations, transcripts and automated playback into each live workshop.
6. Validate with instructors, medical laboratory scientists, engineers, and TVET assessors before classroom or high-stakes use.

Use `npm install`, `npm test`, `npm run test:integration` and `npm start` from `cnte-vsl` to run the current development classroom. Open `http://127.0.0.1:8080/equipment-live.html` and create separate lecturer/student sessions. A Node.js server is required; static GitHub Pages hosting cannot provide live sessions.


### Version 1.0 safety and validation update

The live equipment practical starts with **source isolation not yet confirmed**. The student or lecturer must explicitly select the isolation/lockout control before tool turns, component removal, replacement or digital repair. This remains a software teaching control; it does not verify physical lockout/tagout of any real device.

Direct drag-and-drop of component chips between **installed parts** and **removed parts** trays now triggers the same server-validated remove/install actions as accessible buttons, including fastener and dependency gates. Snapping remains logical/sequence-based, not yet true 6-DOF physical alignment.

The expanded equipment and service model tests now pass **492 assertions** (246 equipment and 246 service tests), executed in an isolated JavaScript test harness. An updated WebSocket integration test has been committed for the chemistry and equipment live sessions, but a successful run against a hosted/installed live server has not been confirmed.
