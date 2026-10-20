# CIU Interactive Courses

Nine-week, Liberia-focused interactive courses with case studies, decision simulators, fieldwork tools, quizzes, and capstone project studios.

## Available courses

- **SUAG 309 — Strengthening Local Food Systems**
- **SUAG 403 — Analyzing Complex Agricultural Issues**

Choose a course from the selector in the page header. Course progress, quiz results, and project work are saved separately for each course.

## Run locally

```bash
cd "/home/mogana/Apps Center for CIU"
python3 -m http.server 3000
```

Then open http://localhost:3000 in your browser.

## Deploy to GitHub Pages

1. Source repository: https://github.com/moganajr/cntecale
2. In the repository, open **Settings → Pages** and set the build and deployment source to **GitHub Actions**.
3. Push to `main` or run **Deploy courses to GitHub Pages** from the Actions tab.

After a successful workflow run, the site is available at https://moganajr.github.io/cntecale/ . The workflow publishes only the static app files. Student progress remains in each learner's browser and is not uploaded to GitHub.

## Offline use

Open the course once while connected so the browser can cache the course files. After the service worker activates, the lessons and saved work can be reopened without a network connection from the same browser and device. Progress is stored in that browser's local storage; it is not synced automatically. Use **Back up progress** to download a JSON backup and **Restore from backup** on another device. Restoring replaces that browser's current course progress.

## Course tools

- Search lessons by title, objective, or summary, and bookmark lessons for later.
- Complete the weekly quizzes, case-study self-reviews, and decision simulations.
- For SUAG 403, track the continuous project phases and complete weekly SEC/OPD reflections.
- Build an anonymous Week 3 research questionnaire and export its blank JSON template.
- Record anonymous Week 2 field observations and export them as CSV.
- Complete the Week 9 capstone and download a project brief.
- Download a learning portfolio containing progress and saved course work.
- Back up or restore local progress between devices.

## Files
- `index.html` - course structure
- `styles.css` - responsive course styling
- `script.js` - lessons, activities, assessments, and browser-saved progress
- `suag403-data.js` - SUAG 403 lessons, cases, quizzes, visuals, and simulation settings
- `service-worker.js` - offline caching
