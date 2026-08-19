# CRM Portal — Flat Git/Vercel Frontend

All files stay in the repository root. No folders.

## Files

- `index.html` — page structure
- `styles.css` — all styling
- `config.js` — frontend configuration / future Apps Script API URL
- `auth.js` — login/session/logout
- `navigation.js` — sidebar/module routing
- `dashboard.js` — dashboard UI
- `appointments.js` — appointment calendar/UI
- `leads.js` — leads UI
- `requests.js` — requests UI
- `reports.js` — reports UI
- `utils.js` — shared helpers as we refactor

## Important: current migration stage

The frontend has been separated into normal web files for Git/Vercel.

However, the JavaScript still contains the existing `google.script.run` calls from the current Apps Script-hosted version.

That means:

1. Upload these files to GitHub now.
2. Do NOT switch production to Vercel yet.
3. Next, convert the Apps Script backend into an HTTP API.
4. Replace `google.script.run` calls with `fetch()` calls to that API.
5. Test login, dashboard, leads, appointments, requests, and reports.
6. Then connect/deploy the GitHub repo to Vercel.

This staged migration avoids breaking the currently working CRM.
