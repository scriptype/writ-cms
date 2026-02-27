## Project
- A CMS studio with a browser-based UI that previews the site and provides tools for content management
- Currently a prototype / PoC phase

## Architecture
- Vanilla JS only — no frameworks, bundlers, or 3rd party libraries
- No external CSS files — styles are inline `<style>` blocks within component templates
- `app/` contains the UI code
- `app/components/` holds reusable components
- Feature-specific modules live in their own folders under `app/components/` (e.g., `app/components/explorePanel/`)

## Verification
- After moving/renaming files or changing imports, check the browser console for errors (server runs on port 8080)
