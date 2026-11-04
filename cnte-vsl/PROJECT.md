# CNTE Virtual Science Laboratories (CNTE-VSL)

**Development branch:** `feature/cnte-virtual-science-labs`

A science learning module planned for integration into the CNTE/CALE platform. This branch is deliberately isolated from `main` to avoid affecting existing courses or production services.

## Planned learning tracks

- WASSCE chemistry, physics, and biology practical learning
- University science laboratory courses
- Medical laboratory training with synthetic educational data
- Competency-based TVET workshops

## First pilot specification

The existing local v0.1 pilot contains five interactive **2D** experiments: acid-base titration, Ohm's law, osmosis, simulated hematology QC, and low-voltage electrical fault diagnosis. It includes a notebook, basic grading, and local JSON/CSV export. The source files have **not yet been committed to this branch**; this file only establishes a safe GitHub workspace and documentation.

## Release rules

1. Do not modify, overwrite, or deploy the CNTE `main` branch from this prototype.
2. Audit the actual CALE integration interfaces before connecting authentication, grades, portfolios, or learner accounts.
3. Keep experimental scientific models and assumptions documented and tested.
4. Require curriculum, scientific, safety, and quality approval before publishing labs for formal assessment.
5. Avoid claiming 3D/AR/VR, offline high-stakes proctoring, or clinical competency certification before tested implementation.

## Proposed folder structure

```
cnte-vsl/
  index.html
  src/app.js
  src/science.js
  src/styles.css
  tests/science.test.mjs
  assets/icon.svg
  manifest.webmanifest
  sw.js
  package.json
  README.md
```

## Milestones

- [x] Create isolated GitHub development branch
- [ ] Commit and review the existing prototype source files
- [ ] Run scientific model regression tests in GitHub Actions
- [ ] Deploy an isolated GitHub Pages preview
- [ ] Validate the five pilot experiments with scientific reviewers
- [ ] Build advanced 3D apparatus interactions
- [ ] Plan and implement audited CALE integration

**Status:** Repository branch initialized; source-code migration and hosted preview pending.
