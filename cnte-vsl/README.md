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
