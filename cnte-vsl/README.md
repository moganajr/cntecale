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
