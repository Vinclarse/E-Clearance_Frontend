# ClearanceDNSC

A responsive student clearance management landing page built with React and Vite. The sign-in page is a front-end placeholder; authentication is not yet connected.

## Getting started

Install dependencies and start the Vite development server:

```sh
npm install
npm run dev
```

Available scripts:

- `npm run dev` starts the development server.
- `npm run build` creates the production build in `dist/`.
- `npm run preview` serves the production build locally.
- `npm run lint` checks the project with ESLint.

## Project structure

```text
.
├── index.html
├── public/
├── src/
│   ├── App.jsx       # Landing page and /login placeholder
│   ├── App.css       # Shared page styles
│   ├── index.css     # Stylesheet entry point
│   └── assets/       # SVG illustrations and icons
└── vite.config.js
```

The app and its assets are self-contained in this Vite project. The homepage is served at `/`, the account-access placeholder at `/login`, and the student dashboard at `/dashboard`. The login page links to the dashboard so it can be previewed while authentication is not yet connected.

The dashboard uses the E-Clearance API at `https://e-clearance-system-api.onrender.com/api/v1/` by default. To use a local backend or another environment, set `VITE_API_BASE_URL` in a local `.env` file to its API base URL (for example, `http://localhost:8000/api/v1/`) before using profile updates, clearance requests, and other server-backed actions.
