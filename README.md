# Greenscape Plant Library

A browser-based plant library and landscape project workspace created for **Greenscape Landscaping Services**.

It organizes plant information, project plant lists, schedules, mood boards, quotations, BOQs, costing, and related project documents in one responsive website.

## Live Website

https://nyxdcz.github.io/greenscape-plant-library/

## Current Status

The website is actively maintained.

Forced maintenance mode may limit editing and project tools while keeping the following available:

- Dashboard and Plant Library browsing
- Plant search, filters, and details
- Plant-image downloads
- Maintenance information
- Greenie Help assistant and feedback form

Plant List Editor, Mood Board Creator, Project Lists, Plant Identifier, or other editing tools may be unavailable while maintenance restrictions are active.

## Latest Interface Update

### Phone Dock Maintenance Status V1

- Shows the existing floating **Maintenance Mode** or **Staff tools unlocked** pill on every normal navigation layout at **761 px and above**, including large desktop.
- Keeps the large floating pill hidden when the phone floating tab is active at **760 px and below**.
- Adds a compact dynamic maintenance item inside the phone **More** menu directly before **Visit Greenscape website**.
- Displays **Maintenance Mode / Read-only access** in read-only state and **Staff tools unlocked / Staff access active** after authorization.
- Opens the existing maintenance details and staff-access panel when the phone menu item is tapped.
- Uses the existing maintenance icon and preserves the phone dock size, Plant Identifier, More button, project shortcuts, and website link.
- Keeps the raised phone Plant Library filter position at `top: 44px`, with page-content top padding at `0`.
- Preserves maintenance security, session expiry, Greenie, plant cards, category labels, scroll loading, and project tools.

Affected files:

```text
assets/js/magnetic-dock.js
assets/css/maintenance.css
index.html
scripts/validate.mjs
README.md
```

### Maintenance Visibility and Higher Phone Filters V1

- Shows the floating **Maintenance Mode** or **Staff tools unlocked** status only from **761 px through 1439 px**.
- Hides the floating maintenance status on phones at **760 px and below** and on large desktop layouts at **1440 px and above**.
- Keeps the existing bottom-right pill design, maintenance details action, authorization state, and read-only protections unchanged.
- Moves the mobile Plant Library filter panel slightly higher by removing the remaining page-content top padding and adjusting its sticky top position from `48px` to `44px`.
- Keeps the compact two-line phone category labels introduced in the previous refinement.
- Preserves the sidebar, Greenie, Greenie scroll loading, plant cards, filters, mobile navigation, staff security, and project tools.

Affected files:

```text
assets/css/maintenance.css
assets/css/plant-library-refinements.css
index.html
scripts/validate.mjs
README.md
```

### Responsive Maintenance and Phone Library Refinement V1

- Shows the **Maintenance Mode** status on desktop, laptop, tablet, and intermediate layouts.
- Keeps the status hidden at **760 px and below** so it does not obstruct the mobile navigation dock.
- Uses the same status control and visual treatment for **Maintenance Mode** and **Staff tools unlocked**.
- Reduces the empty space above the phone Plant Library filters and moves the sticky filter panel slightly upward.
- Makes phone category labels smaller, tighter, and limited to two lines for long category names.
- Preserves Greenie scroll loading, plant cards, filters, phone navigation, maintenance protections, staff access, and project tools.

Affected files:

```text
assets/css/maintenance.css
assets/css/plant-library-refinements.css
index.html
scripts/validate.mjs
README.md
```

### Greenie Scroll Loading V1

- Uses the exact approved `dig to plant.gif` file without redrawing, recoloring, cropping, or recompressing it.
- Loads the next 48 Plant Library entries automatically when the results footer approaches the viewport.
- Shows Greenie centered below the plant cards while the next batch is prepared, then removes the loader after the new cards appear.
- Keeps the existing **Show more** control as a keyboard-accessible and unsupported-browser fallback.
- Cancels stale loading work when filters, sorting, views, or pages change so duplicate batches are not added.
- Adds a polite screen-reader loading status and preserves reduced-motion safeguards.
- Keeps Dashboard, phone navigation, responsive behavior, maintenance protections, Greenie Help, plant data, and project tools unchanged.
- Refreshes only the changed Plant Library CSS and application JavaScript cache keys and adds regression validation.

Affected files:

```text
assets/images/greenie/dig-to-plant.gif
assets/js/app.js
assets/css/plant-library-refinements.css
scripts/validate.mjs
index.html
README.md
```

### Safe Repository Cleanup V1.3

- Removes the unreachable legacy script that hid the former standalone Help launcher while scrolling.
- Removes unused phone-dock helper functions and stale `dock-utilities-attached` state cleanup.
- Removes only CSS selector branches tied to the deleted Help launcher, including its icon, label, Beta badge, scrolling state, and former phone-dock placement.
- Preserves Greenie’s feedback controller, feedback form, maintenance status pill, Plant Identifier, More menu, phone navigation, and responsive behavior.
- Does not delete, move, or rename any repository file, image, icon, plant record, workflow, or public URL.
- Refreshes cache keys for the four changed browser assets and adds cleanup regression checks.
- Updates two legacy regression checks to verify current direct phone-button labels and the existing phone maintenance-banner hide safeguard.
- Normalizes trailing whitespace created when obsolete selector branches are removed, before `git diff --check` runs.
- Creates a protected pre-cleanup backup branch before editing and uses normal Git commits without force-pushing.

Affected files:

```text
assets/js/app.js
assets/js/magnetic-dock.js
assets/css/styles.css
assets/css/maintenance.css
scripts/validate.mjs
index.html
README.md
```

### Greenie-Only Help and Maintenance Status V1.4

- Removes the standalone **Help BETA** launcher from Dashboard, Plant Library, Plant List Editor, Mood Board Creator, Project Lists, tablet, desktop, and phone layouts.
- Keeps the feedback dialog and email workflow available through Greenie’s **Ask me anything** speech bubble.
- Refactors feedback opening and closing so it no longer depends on `feedbackToggle`.
- Returns keyboard focus to Greenie after closing with Close, Cancel, or Escape.
- Removes Help from the phone dock while preserving Plant Identifier and More.
- Keeps one bottom-right maintenance status control:
  - **Maintenance mode** for read-only access.
  - **Staff tools unlocked** when staff authorization is active.
- Keeps the status control linked to maintenance details and preserves the startup maintenance screen, access code, session limits, and locking behavior.
- Preserves the existing phone rule that hides the floating maintenance pill so it does not cover the phone dock.
- Keeps the Dashboard bento layout, Plant Library information spacing, View-only intermediate actions, plant data, and project tools unchanged.
- Refreshes affected cache keys and adds regression checks.
- Corrects earlier installers by removing both phone and desktop Help lookups, retaining intentional regression-test references, allowing assets without an older cache assertion, and preserving JavaScript escape sequences such as `.join('\n')`, and scoping the controller regression check to the marked controller block.

Affected files:

```text
index.html
assets/js/app.js
assets/js/sidebar-assistant.js
assets/js/magnetic-dock.js
assets/js/maintenance.js
assets/css/styles.css
assets/css/maintenance.css
scripts/validate.mjs
README.md
```

### Intermediate View-Only Actions V1

- Shows one full-width **View** action at `1200px` and below.
- Hides the compact **+** action on phone, tablet, and compact laptop/browser layouts.
- Keeps **View + compact +** available at `1201px` and wider.
- Applies the same responsive behavior to Plant Library Grid and List views.
- Prevents maintenance/read-only styling from forcing the hidden Add action to reappear.
- Retains the `44px` View touch target and centred eye-icon label.
- Preserves Plant Information Spacing V1.3, information order, mixed-case codes, category pills, and Add-to-Project functionality on large desktop.
- Keeps plant data, images, Dashboard, header, toolbar, search, filters, Greenie, maintenance protections, and project tools unchanged.
- Refreshes the Plant Library stylesheet cache key and adds regression checks.

Affected files:

```text
assets/css/plant-library-refinements.css
scripts/validate.mjs
index.html
README.md
```

### Plant Information Spacing V1.3

- Keeps the **common name, scientific name, and code** together as one compact information group.
- Uses a final high-specificity Plant Library override instead of rewriting multiple legacy desktop, tablet, and phone rules.
- Applies `2px` spacing around the first three information lines.
- Applies the larger `12px` separation only before **available sizes** in Grid and List views.
- Preserves natural wrapping for longer common and scientific names.
- Keeps the approved information order, mixed-case codes, category pills, compact **+** action, and phone View-only behavior.
- Leaves unrelated legacy responsive rules untouched and supersedes only the targeted Plant Library spacing.
- Keeps plant data, images, Dashboard, header, toolbar, search, filters, maintenance protections, Greenie, and project tools unchanged.
- Refreshes the Plant Library stylesheet cache key and adds regression checks.

Affected files:

```text
assets/css/plant-library-refinements.css
scripts/validate.mjs
index.html
README.md
```

### Plant Information Order V1.1

- Standardizes every Plant Library entry as **common name → scientific name → code → available sizes**.
- Applies the same hierarchy to Grid and List views on desktop, tablet, and phone.
- Displays codes exactly as stored, including mixed capitalization such as `AMa`.
- Moves List-view sizes into the information block and removes all three responsive rules that previously hid sizes.
- Removes the duplicate List-view category text while preserving the image category pill.
- Preserves the compact **+** action on tablet and desktop and the full-width View-only phone action.
- Keeps plant data, images, search, filters, header, Dashboard, maintenance protections, Greenie, and project tools unchanged.
- Corrects the V1 installer’s assumption that only one responsive size-hide rule existed.
- Refreshes the affected CSS and JavaScript cache keys and adds regression checks.

Affected files:

```text
assets/js/app.js
assets/css/plant-library-refinements.css
scripts/validate.mjs
index.html
README.md
```

### Compact Add Button V1

- Replaces the visible **Add to List** text with a compact **+** button at `761px` and wider.
- Applies the compact action consistently to Plant Library Grid and List views.
- Gives the View action the remaining available width while reserving a stable `44px` Add column.
- Keeps the Add-to-Project action, plant-specific accessible label, keyboard focus, hover state, and maintenance behavior.
- Preserves the phone layout at `760px` and below, where Add remains hidden and View stays full-width.
- Keeps the standardized Dashboard-matched Plant Library header, toolbar, cards, data, and responsive navigation unchanged.
- Refreshes the Plant Library stylesheet cache key and adds regression checks.

Affected files:

```text
assets/css/plant-library-refinements.css
scripts/validate.mjs
index.html
README.md
```

### Dashboard-Matched Plant Library Header V1.2

- Uses the Dashboard header as the master style for the Plant Library on tablet and desktop.
- Matches header height, width behavior, internal padding, radius, glass background, border, shadow, glow, title scale, and vertical alignment.
- Matches the confidentiality card dimensions, spacing, icon, typography, and right alignment.
- Keeps only the page title different: **Dashboard** or **Plant Library**.
- Keeps the Plant Library toolbar correctly spaced and sticky below the standardized header.
- Preserves the existing phone Plant Library header, phone glass navigation, and phone card actions.
- Keeps the original Dashboard bento layout and slideshow unchanged.
- Adds regression checks, including the corrected escaped Plant Library cache-key validation.
- Refreshes the affected stylesheet cache keys.

Affected files:

```text
assets/css/styles.css
assets/css/plant-library-refinements.css
scripts/validate.mjs
index.html
README.md
```

## Main Features

- Searchable plant and landscape-material library
- Responsive Grid and List views
- Plant details, sizes, tags, notes, images, and reference links
- Automatic botanical plant-code generation
- Plant List Editor
- Project plant lists and planting schedules
- Mood board creator
- Project quotation creator
- Landscape BOQ creator
- Project costing suite
- Quantity, maintenance, water, manpower, equipment, and tax calculations
- Statement of Account generation
- On-device Plant Identifier with optional Google Lens verification
- CSV, Excel, JSON, HTML, PNG, print, and PDF-ready workflows
- Responsive desktop, tablet, and phone layouts
- Mobile home-screen support
- Maintenance read-only mode
- Greenie Help assistant
- GitHub Pages deployment and automated repository checks

## Technology Stack

The project is a dependency-free static website built with:

- HTML
- CSS
- Vanilla JavaScript
- Browser `localStorage`
- Node.js 20 or newer for repository checks
- GitHub Actions
- GitHub Pages

The website does not use a frontend framework, TypeScript, or a compiled production build.

## Plant Data Source

The published plant catalogue is maintained through:

```text
data/Greenscape_Plant_Library.csv
```

The synchronization script validates the CSV and generates:

```text
assets/js/data.js
```

### Updating the Plant Catalogue

1. Download `data/Greenscape_Plant_Library.csv`.
2. Open or import it in Google Sheets.
3. Update the plant records.
4. Export the active sheet as CSV.
5. Replace the repository CSV file.
6. Commit the change to `main`.
7. Wait for **Plant CSV Sync** and **Website Checks** to pass.
8. Hard-refresh the live website.

Important rules:

- Keep existing Record IDs unchanged.
- Leave the Record ID blank only for new records.
- Keep plant codes unique.
- Keep local images inside `assets/`.
- Use HTTPS for new external image or reference links.
- Do not use spreadsheet formulas in plant-data fields.
- Failed CSV validation leaves the previously published data unchanged.

## Browser Data

User-created records are stored in browser `localStorage`, including:

- Plant edits
- Project records
- Mood boards
- Quotation drafts
- BOQ drafts
- Costing records

This means:

- Data stays on the same browser and device.
- Browser records do not automatically update GitHub.
- Records do not automatically appear on another device.
- Clearing browser data may remove saved records.
- Export important records regularly as backups.

## Local Validation

Requirements:

- Node.js 20 or newer
- Git

Run the complete repository checks:

```bash
npm run quality
```

Available checks:

```bash
npm run lint
npm test
npm run build
npm run check
npm run audit
npm run quality
```

The checks cover JavaScript syntax, plant-data synchronization, HTML structure, metadata, accessibility hooks, security safeguards, asset paths, responsive requirements, and static performance metrics.

Type checking is not applicable because the repository does not use TypeScript.

## Deployment

Website updates are deployed through GitHub Pages and GitHub Actions.

Typical workflow:

1. Edit only the files related to the change.
2. Update this README when the change affects usage, deployment, responsive behavior, or validation.
3. Run `npm run quality`.
4. Commit with a clear message.
5. Push to `main` or merge an approved pull request.
6. Confirm the GitHub Actions checks and Pages deployment are successful.
7. Hard-refresh the live website.
8. Verify the affected desktop, tablet, and phone views.

Hard refresh:

- macOS: `Command + Shift + R`
- Windows: `Ctrl + Shift + R`

## Repository Structure

```text
index.html
README.md
package.json
robots.txt
site.webmanifest
data/
└── Greenscape_Plant_Library.csv
assets/
├── css/
├── js/
├── icons/
└── images/
scripts/
├── sync_plants_from_csv.mjs
├── validate.mjs
└── audit.mjs
.github/
└── workflows/
```

## Accessibility and Responsive Design

The project aims to preserve:

- Keyboard navigation and visible focus states
- Accessible labels for interactive controls
- Polite result announcements
- Reduced-motion support
- Touch-friendly controls
- Safe-area support for phone navigation
- Responsive desktop, tablet, and phone layouts
- Readable contrast and clear form feedback

Manual browser testing is still required after visual or interaction changes.

## Privacy and Security

This is an internal company tool hosted on a public GitHub Pages URL.

The website uses `noindex` metadata and `robots.txt` rules to discourage search-engine indexing. These measures do not provide authentication. Anyone with the public URL may still access the website.

The maintenance staff code is a convenience gate for static-site workflows and must not be treated as server-side authentication.

Do not commit:

- Private keys
- Access tokens
- Passwords
- Personal credentials
- Unprotected environment files

## Performance Notes

The project already uses:

- Deferred JavaScript
- Lazy-loaded plant images
- Responsive Dashboard slideshow images
- Reduced initial loading for project-only tools
- Static asset validation
- Cache-version query strings

Real Core Web Vitals should be measured against the deployed website using Lighthouse, PageSpeed Insights, or WebPageTest.

## Troubleshooting

### A new feature is missing

- Confirm the latest commit is on `main`.
- Wait for GitHub Pages deployment to finish.
- Hard-refresh the browser.
- Reopen the affected view.

### Website Checks fail

1. Open the failed run in **Actions**.
2. Expand the first failed step.
3. Read the exact validation error.
4. Correct the reported file.
5. Run `npm run quality`.
6. Commit and push the fix.

### The website shows an older version

Wait a few minutes after deployment and perform a hard refresh.

### Images or styles are missing

Confirm that the complete `assets/` directory was uploaded and that file names and paths were not changed.

### Saved records disappeared

Check whether browser data was cleared or whether the website was opened in another browser or device.

## Documentation Policy

Keep this README focused on the current project.

For future updates, document only:

- The current behavior
- Important setup or usage changes
- Affected deployment or validation steps
- Known limitations

Use Git commits and pull requests for detailed release history instead of continuously appending full change logs to this file.

## Project Status

The Greenscape Plant Library is actively developed as the plant database, landscape planning, project documentation, quotation, BOQ, costing, and presentation workflow expands.
