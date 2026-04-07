# Kotzod.github.io

Personal portfolio homepage (GitHub Pages) for Oliver Chandler.

This site is intentionally build-less (plain HTML/CSS/JS) and includes an interactive canvas playground powered by the `@chenglou/pretext` library for text measurement & layout.

## What’s in here

- `index.html` – semantic, accessible page structure
- `styles.css` – styling for the portfolio sections
- `main.js` – interactions (tilt effects + pretext canvas playground + project spotlight)
- `CNAME` – custom domain configuration (if enabled)

## Run locally

Because this is a static site, you can open `index.html` directly.

For more reliable module loading (recommended), serve the folder with a local web server:

- Python: `python -m http.server 5173`
- Then open: http://localhost:5173/

## Featured projects

These are shown on the homepage in the Projects section.

- Dreamhouse – Salesforce DX project with a full platform-style setup.
- Final_project_Oliver_Chandler – final Python data pipeline project.
- Final_Assignment – React/Vite final assignment (routing + modern frontend tooling).
- final_app – Node/Express backend using MongoDB/Mongoose + JWT auth + validation.
- fullstack_project – full-stack app with separate frontend/backend.
- bowd-w04-example-main – full-stack example app (backend + frontend).
- final_assignement – weather forecast app (API + charts + statistics).
- valentine-projects-main – collection of multiple interactive mini-projects.
- Unity project – Unity game project bundle.
- server – standalone server-side app used in the fullstack coursework.

## Pretext usage

The site loads Pretext at runtime (no bundler) via an ESM CDN and uses it to:

- render the hero + lab canvas effects, and
- lay out Project Spotlight text on a canvas when you hover/focus a project card.

If Pretext fails to load, the site falls back to a simpler canvas renderer and all project info remains available as normal HTML.
