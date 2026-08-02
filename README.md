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

### Mobile Form, Viewport and Image Loading V1.1

- Prevents iPhone Safari from zooming the page when phone users focus text-entry controls by keeping their computed font size at **16 px**.
- Corrects the V1 installer so stylesheet updates end with exactly one newline and pass `git diff --check` without trailing blank-line errors.
- Keeps Plant Library and Plant List Editor controls touch-friendly while preserving the current compact toolbar composition and responsive breakpoints.
- Adds `100dvh` sizing with `100vh` fallbacks to mobile-sensitive shells, dialogs, feedback panels, and fullscreen Mood Board previews so controls remain visible above changing browser bars.
- Adds targeted lazy loading and asynchronous decoding to non-critical Plant Identifier result images without delaying the logo, first Dashboard hero image, first visible plant cards, selected previews, or loading indicators.
- Preserves the Magic Bento Dashboard interaction, hero slideshow, phone dock touch-state correction, plant data, Greenie, maintenance protections, staff access, project tools, and existing accessibility safeguards.
- Adds regression validation for iPhone form sizing, dynamic viewport fallbacks, critical-image loading priority, targeted lazy loading, cache versions, and release documentation.

Affected files:

```text
README.md
assets/css/styles.css
assets/css/plant-library-refinements.css
assets/js/app.js
index.html
scripts/validate.mjs
```

### Magic Bento Dashboard Interaction V1

- Adds a restrained Magic Bento interaction to the existing Dashboard statistic cards and bento panels without changing their layout, order, dimensions, or content.
- Adds a card-local green-and-lime pointer spotlight and proximity border beam on genuine fine-pointer devices.
- Adds a subtle 2 px card lift and a short click-glow pulse for existing Dashboard controls only.
- Preserves all current Dashboard buttons, category filtering, recently added plant links, statistics, health calculations, and the hero slideshow.
- Adds matching keyboard `:focus-visible` and `:focus-within` feedback without converting panels into new links or buttons.
- Disables pointer-following motion on touch and coarse-pointer devices and retains a static accessible focus treatment.
- Adds a reduced-motion safeguard that removes animated movement while preserving readable content and focus indication.
- Uses native HTML, CSS, and JavaScript only; no Framer, React, GSAP, animation library, image, or new dependency is added.
- Preserves the phone navigation, phone dock touch-state correction, responsive Dashboard composition, maintenance protections, Greenie, plant data, project tools, and existing accessibility safeguards.
- Adds regression validation for Dashboard-only event scope, cleanup on navigation, non-intercepting decorative layers, fine-pointer and reduced-motion protections, unchanged bento spans, cache versions, and release documentation.

Affected files:

```text
README.md
assets/css/styles.css
assets/js/app.js
index.html
scripts/validate.mjs
```

### Phone Dock Touch-State Stability V1.1

- Fixes the temporary pale or washed-out phone dock state seen on iPhone and other touch-only devices after changing pages or opening **More**.
- Corrects the V1 installer so plain and regex-escaped stylesheet cache checks are updated together before final validation.
- Keeps the current page control consistently dark green while it is active, tapped, focused, or still carrying a touch-generated hover state.
- Restricts hover-only appearance changes to devices with a genuine hover-capable fine pointer, while preserving keyboard `:focus-visible` feedback.
- Removes the whole-control brightness animation from click feedback and keeps the existing lime border and shadow glow.
- Preserves the approved responsive expanded widths of **72 px**, **64 px**, and **58 px**.
- Preserves the four phone controls, More menu behavior, safe-area placement, dashboard bento layout, maintenance protections, Greenie, plant data, project tools, and desktop/tablet layouts.
- Adds regression validation for touch-hover isolation, stable active and open states, click feedback, responsive widths, cache version, and release documentation.
- Does not change phone navigation JavaScript or page navigation logic.

Affected files:

```text
README.md
assets/css/styles.css
index.html
scripts/validate.mjs
```

### Plant Library Breakpoint Continuity V1

- Keeps the Plant Library readable when the desktop sidebar first appears above the **760 px** phone breakpoint.
- Uses three catalogue columns from **761–1023 px**, avoiding the previous four-column compression at the narrowest tablet width.
- Retains the existing four-column catalogue beginning at **1024 px** and the existing five- and six-column desktop layouts.
- Adds a narrow **761–820 px** sticky-toolbar offset so the filter panel clears the taller wrapped header.
- Preserves every phone rule at **760 px and below**, including the floating dock, safe-area positioning, compact filters, and View-only cards.
- Adds regression validation for the new column boundaries, sticky offset, unchanged phone layout, cache version, and release documentation.
- Preserves plant data, cards, filters, sorting, list mode, dialogs, Greenie, Help, maintenance protections, project tools, slideshow behavior, and the dashboard bento layout.

Affected files:

```text
README.md
assets/css/plant-library-refinements.css
index.html
scripts/validate.mjs
```

### Expanding Hover Phone Menu V1

- Adds a phone-only expanding state to the existing four-control floating dock at **760 px and below**.
- Keeps the outer glass dock fixed while the current tab, open **More** control, tapped utility, or keyboard-focused control widens.
- Uses responsive expanded widths of **72 px** from 431–760 px, **64 px** at 430 px and below, and **58 px** at 370 px and below.
- Limits hover-triggered expansion to devices that report both genuine hover and a fine pointer, preventing sticky hover behavior on iPhone and other touch-only devices.
- Uses the existing dark-green glass treatment with a lime glow and keeps every icon centered without adding text labels.
- Makes the state change effectively instant when reduced motion is requested.
- Preserves the four existing controls: **Dashboard**, **Plant Library**, **Plant Identifier**, and **More**. Greenie remains the Help entry point, and no separate Help button is restored.
- Preserves the dashboard bento layout, responsive behavior above the phone breakpoint, maintenance protections, Greenie, plant data, project tools, accessibility hooks, and existing validation safeguards.

Affected files:

```text
README.md
assets/css/styles.css
index.html
scripts/validate.mjs
```

### Website Quality Workflow Lock-File Fix V1.1

- Corrects the new **Website Quality** GitHub Actions workflow after `actions/setup-node` attempted to create an npm cache without a dependency lock file.
- Updates the workflow action runtime to `actions/setup-node@v6` while continuing to test the website with Node.js 20.
- Disables automatic package-manager caching with `package-manager-cache: false`.
- Removes the unnecessary dependency-install step because the repository currently has no npm dependency packages.
- Continues running the complete `npm run quality` suite on every push to `main`, every pull request, and manual workflow runs.
- Adds regression checks that reject `cache: npm`, reject the unnecessary install step, and require the corrected action configuration.
- Does not change the live website interface, plant data, staff access, Greenie, project tools, or browser cache keys.

Affected files:

```text
.github/workflows/quality.yml
scripts/validate.mjs
README.md
```

### Interface QA Fixes and Workflow Clarity V1

- Fixes phone **Plant List Editor**, **Mood Board Creator**, and **Project Lists** navigation so authorized staff workspaces become writable before rendering.
- Replaces phone **Soon** labels with dynamic **Locked** and **Open** states; locked items open the existing Staff access form.
- Preserves the non-recursive phone-dock freeze hotfix.
- Improves Plant Library search with accent and punctuation normalization, exact-match ranking, broader field matching, a short input delay, and a live result count.
- Hides **Add to List** from read-only Plant Library cards instead of displaying a disabled action.
- Clarifies that Plant List Editor additions are local to the current browser and links directly to the shared GitHub `ADD_PLANTS_HERE` publishing folder.
- Renames local creation actions to **Add local plant** and gives clear local-only save messages.
- Adds touch-friendly mood-board move controls, disables empty exports, and confirms very large bulk additions with an estimated A3 page count.
- Adds `.github/workflows/quality.yml` so every push to `main` and every pull request runs `npm run quality`.
- Keeps all plant data, access-code security settings, Greenie, project tools, and the separate staff-access configuration unchanged.

Affected files:

```text
.github/workflows/quality.yml
README.md
assets/css/styles.css
assets/js/app.js
assets/js/maintenance.js
assets/js/magnetic-dock.js
index.html
scripts/validate.mjs
```

### GitHub Plant Folder and Separated Staff Access V1

- Adds `data/ADD_PLANTS_HERE/` with a reusable JSON template for adding or updating one plant at a time through GitHub.
- Extends **Plant CSV Sync** to validate the folder records, merge them into the canonical CSV, regenerate website data, update cache keys, and publish only after all checks pass.
- Requires each JSON filename to match its Record ID and verifies local images, HTTPS links, duplicate IDs, and supported fields.
- Adds a separate `assets/js/staff-access-config.js` file for the public salt and SHA-256 hash while keeping maintenance messages and behavior in `maintenance-config.js`.
- Adds a local-only `staff-access/access-code.txt` workflow and a double-click macOS tool that generates the salted hash, deletes plaintext, runs quality checks, commits, pushes, and verifies the live website.
- Keeps the current staff access code working until it is intentionally replaced.
- Preserves all 231 existing plant records, the current CSV workflow, maintenance security limits, phone-dock freeze hotfix, Greenie, filters, cards, and project tools.

Affected files:

```text
.github/workflows/sync-plant-csv.yml
.gitignore
README.md
package.json
index.html
scripts/validate.mjs
scripts/import_plant_additions.mjs
scripts/set_staff_access_code.mjs
assets/js/maintenance-config.js
assets/js/staff-access-config.js
data/ADD_PLANTS_HERE/README.md
data/ADD_PLANTS_HERE/_PLANT_TEMPLATE.json
staff-access/README.md
staff-access/access-code.example.txt
tools/Update Staff Access Code.command
```

### Phone Dock Freeze Hotfix V1.2

- Removes the body-wide child-mutation observer that repeatedly resynchronized the phone dock and could freeze the browser.
- Makes **Maintenance Mode** and **Staff tools unlocked** phone-menu updates idempotent, changing text and attributes only when the status actually changes.
- Synchronizes phone dock utilities only at startup and when the `760px` navigation breakpoint changes.
- Observes only maintenance authorization class changes on `body` and `html`.
- Preserves the compact maintenance item directly before **Visit Greenscape website** in the phone **More** menu.
- Preserves the floating maintenance pill at `761px` and above, the raised mobile filters, Greenie, plant data, cards, and security controls.

Affected files:

```text
assets/js/magnetic-dock.js
index.html
scripts/validate.mjs
README.md
```

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
- Fine-pointer hover elevation and image zoom, without sticky hover motion on touch devices
- Consistent Greenscape pressed and focus-glow feedback for interactive controls
- Plant Library result announcements that include the active search, filters, and sort context
- Empty-result guidance covering common names, scientific names, codes, categories, tags, and sunlight

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
