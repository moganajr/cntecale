# CNTE Virtual Science Laboratories — Development Status

**Repository:** `moganajr/cntecale`  
**Branch:** `feature/cnte-virtual-science-labs`  
**Status:** Prototype source committed, scientific tests pass locally, GitHub workflow added, hosted preview not yet enabled.

## Implemented in version 0.1

- Five interactive **2D** laboratories: acid-base titration, Ohm's law, potato osmosis, synthetic hematology quality control, and low-voltage fault diagnosis
- Browser-based learner dashboard, procedure and safety checks, simplified scientific computation, local notebook, practice scores, and JSON/CSV exports
- Responsive interface and offline app-shell caching
- A Node.js test suite with 14 model and scoring assertions
- An isolated GitHub Actions workflow for scientific tests and JavaScript syntax validation

## Run locally

```bash
cd cnte-vsl
npm test
python3 -m http.server 8080
```

Then open `http://localhost:8080`.

## Important limitations

This prototype is not a full 3D/AR/VR lab. Results use simplified educational models not independently validated for regulated or high-stakes assessment. Its portfolio and scores are local to the browser and **not** connected to CNTE/CALE. GitHub Pages or any other hosting preview has not yet been enabled.

## Safeguards

- Keep `main` unchanged until reviewed
- Audit the real CNTE/CALE authentication, course, grade and portfolio interfaces prior to integration
- Require scientific, curriculum, and safety approvals before formal usage
- Never use synthetic medical scenarios for real diagnosis or credential physical competence based on simulation alone

## Next milestones

1. Enable an isolated preview without disrupting an existing Pages configuration.
2. Run GitHub Actions and investigate any workflow errors.
3. Validate scientific behavior and WASSCE/academic curriculum mappings.
4. Introduce genuine interactive 3D equipment and a versioned laboratory authoring framework.
5. Implement authenticated, audited CALE integration after inspection.
