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

The app and its assets are self-contained in this Vite project. The homepage is served at `/` and the account-access placeholder at `/login`.
