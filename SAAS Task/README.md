# MiniSaaS

A small React and Node.js workspace/task application for demonstrating basic SaaS concepts.

## Run locally
1. Open this folder in VS Code.
2. Open the terminal.
3. Run `npm install`.
4. Run `npm run dev`.
5. Open the local URL printed by Vite, usually http://localhost:5173.

The frontend runs through Vite and the backend API runs on port 5000.

## Try it
1. Create an organization using the left panel.
2. Add tasks to that workspace.
3. Create another organization.
4. Switch between workspaces to see that each one has its own task list.

The first run starts with no organizations and no sample tasks. Data is stored locally in `server/data/store.json`.

This is a learning project, not a production-ready SaaS platform. Authentication, secure production data storage, real DNS subdomains, HTTPS and AWS automation are separate implementation steps.
