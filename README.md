# School SMS client

React/Vite frontend for Hospitality Competence Center Africa.

Run `npm ci`, then `npm run dev` for development or `npm run build` for a production build.

Copy `.env.example` to `.env` and configure `VITE_API_URL` to the Node API,
including its `/hcc-sms` prefix. The development default is
`http://localhost:5000/hcc-sms`.

`npm run build` generates `dist/` for hosting. Configure SPA fallback to
`index.html`. Vite environment values are included in the browser build;
server credentials must never be stored here.

Local `.env`, dependencies and generated builds are excluded from Git.
