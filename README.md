# E-Clearance Frontend

A responsive static landing page for the ClearanceDNSC student clearance system.

## Project structure

```text
.
├── index.html       # Landing page
├── pages/
│   └── login.html   # Account-access placeholder
├── css/
│   └── style.css    # Shared styles and responsive layouts
├── images/          # SVG illustrations and categorized icons
├── js/
│   └── main.js      # Mobile navigation and small page enhancements
```

SVG filenames use descriptive category prefixes such as `feature-`, `office-`,
`role-`, and `status-`. This makes assets easier to find and identify by use.

Open `index.html` in a browser to preview the site. Add future pages under
`pages/` and reuse the shared stylesheet and JavaScript with paths such as
`../css/style.css` and `../js/main.js`.

The login page is a front-end placeholder; connect it to the application’s
authentication flow when it is available.