# OJT Hours Tracker (PWA)
Plain HTML/CSS/JS. No build step, no backend, no account. Data stays in your browser (IndexedDB).

## Run locally
`python -m http.server 8000` in this folder, then open http://localhost:8000
(Service workers need HTTP(S) — opening index.html by double-click works as a normal site but without offline/install.)

## Deploy free (GitHub Pages)
Create a repo, upload all files, Settings → Pages → Deploy from branch `main` / root. Open the https URL; use the in-app "Install App" button or browser menu → Install / Add to Home screen. HTTPS is required for PWA install except on localhost.

## Transfer between devices
Backup & Restore → download JSON → open the app on the other device → restore.

## Tests
`node test.js` (calculation engine).

## Known limitations
No charts beyond 7-day bars; calendar is read-only; PDF uses the browser print dialog.
