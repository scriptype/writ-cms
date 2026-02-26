## Project
- Currently a prototype / PoC phase

## Architecture
- `app/` contains the UI code
- `app/components/` holds reusable components
- Feature-specific modules live in their own folders under `app/components/` (e.g., `app/components/explorePanel/`)

## Preferences
- No 3rd party libraries — vanilla JS only
- No external CSS files — styles are inline `<style>` blocks within component templates

## Verification
- After moving/renaming files or changing imports, check the browser console for errors (server runs on port 8080)