# Greenscape Plant Library

A browser-based plant library, landscape database, project scheduling, quotation, BOQ, and costing tool created for **Greenscape Landscaping Services**.

The website helps organize plant information, prepare project plant lists, create landscape schedules and mood boards, calculate project quantities and costs, and generate project documents from one workspace.

## Live Website

Open the published website here:

**https://nyxdcz.github.io/greenscape-plant-library/**

## What's New

<!-- GREENSCAPE_LIBRARY_REFERENCE_LAYOUT_V1_START -->
### Plant Library Reference Toolbar and Cards V1

The Plant Library now uses the approved reference arrangement while retaining the original Greenscape colors, rounded glass surfaces, shadows, typography, and responsive catalogue.

Latest UI and layout changes:

- Uses one compact desktop toolbar arranged as Search, Category, Sunlight, Sort, Grid, and List.
- Generates the Sunlight filter from actual `plant.sun` values in the current library.
- Sorts plants by common name using A–Z or Z–A.
- Adds accessible Grid and List view controls with the original dark-green active state.
- Removes the visible quick-filter-chip row and the separate toolbar result-count badge.
- Keeps result totals in the existing Showing/Show More footer.
- Places the category badge at the upper-left and the plant code at the upper-right of each photograph.
- Shows common name, scientific name, and available-size count without a horizontal divider.
- Uses equal View and Add to List actions with eye and plus icons.
- Keeps plant photographs and common names clickable for Plant Details.
- Keeps Add to List visible but disabled during maintenance mode.
- Keeps Search, Category, Sunlight, Sort, Grid, List, and View active during maintenance mode.
- Retains the 6/5/4/3/2 responsive grid and adds a responsive list layout.

Responsive catalogue grid:

```text
Large desktop:   1440px and above   6 columns
Compact desktop: 1181px–1439px      5 columns
Tablet:          761px–1180px       4 columns
Mobile:          391px–760px        3 columns
Small mobile:    390px and below    2 columns
```

Responsive toolbar:

```text
Desktop: Search | Category | Sunlight | Sort | Grid/List
Tablet:  Search + Category / Sunlight + Sort + Grid/List
Mobile:  Search / Category + Sunlight / Sort + Grid/List
```

Affected files:

```text
assets/js/app.js
assets/js/maintenance.js
assets/css/plant-library-refinements.css
index.html
README.md
```

Current cache keys:

```text
plant-library-refinements.css?v=20260729-library-reference-layout2
maintenance.js?v=20260729-library-reference-controls2
app.js?v=20260729-library-reference-layout2
```

Deployment:

1. Upload `.github/workflows/apply-plant-library-reference-layout.yml`.
2. The workflow validates, commits, packages, and deploys the current website in one run.
3. Confirm the update and GitHub Pages deployment steps are green.
4. Hard-refresh the live Plant Library after deployment.

Verification:

```text
node --check assets/js/app.js
node --check assets/js/maintenance.js
npm run quality
git diff --check
```

Current version status: implemented and deployed from the same validated workflow working tree.
<!-- GREENSCAPE_LIBRARY_REFERENCE_LAYOUT_V1_END -->

### Catalog Pulse Bento Dashboard V1

The original Greenscape workspace now uses a more complete bento dashboard while preserving its established colors, rounded glass surfaces, glow effects, and responsive structure.

Changes:

- Keeps the full-photo Dashboard hero, original Greenscape navigation, header, confidentiality notices, and **Visit Greenscape website** link.
- Gives the header, brand, menu groups, metrics, and dashboard panels consistent rounded glass surfaces with restrained green glow.
- Keeps the existing **Plant categories** name and category bars.
- Adds **Library Health** using the real photo-coverage count from the current library.
- Adds **Recently added** plant shortcuts using the latest available library records.
- Adds a compact **Catalog Pulse** card for current photo coverage, plant-record share, category count, and material count without inventing historical data.
- Keeps the original four summary metrics and project totals.
- Simplifies the phone-only floating dock to five controls: Dashboard, Plant Library, Plant Identifier, More, and Help.
- Moves Plant List Editor, Mood Board Creator, Project Lists, and the Greenscape website link into the phone **More** menu while retaining the complete desktop sidebar.
- Keeps tablet and desktop navigation behavior separate from the five-button phone dock.
- Refreshes stylesheet and script cache keys so browsers receive the updated dashboard and dock.

Updated files:

```text
assets/css/styles.css
assets/js/app.js
assets/js/magnetic-dock.js
index.html
README.md
```

### Responsive Bento Workspace and Magnetic Phone Dock V1

The workspace now uses a responsive bento-style presentation on desktop, tablet, and phone, with a dedicated glass navigation dock on small screens.

Changes:

- Gives the desktop sidebar and header consistent rounded bento corners, including the left side of the header.
- Removes the extra inner brand and title boxes that created double or irregular corners.
- Uses the 15-photo Dashboard slideshow as a full-bleed hero background at every supported size.
- Keeps hero text readable with responsive shading, feature glow, rounded clipping, and phone-specific typography.
- Uses `object-fit: cover` for the slideshow and applies a source-specific horizontal fill correction to the padded MK S photograph.
- Turns the phone sidebar into a fixed glass dock containing Dashboard, Plant Library, Plant List Editor, Mood Board Creator, Project Lists, Maintenance Mode, and Help.
- Uses centered, consistently sized icons, a dark-green active state, a brief click glow, and reduced-motion support.
- Keeps Maintenance Mode and Help visible in the phone dock instead of hiding them while scrolling.
- Marks Plant List Editor, Mood Board Creator, and Project Lists as disabled **Soon** destinations during maintenance.
- Keeps tablet and desktop navigation behavior separate from the phone dock.
- Adds iPhone 14 Pro refinements at `430px` and below, including a compact header, shorter hero, 44px dock controls, safe-area spacing, and an 18px minimum dock bottom gap.
- Moves the sticky Plant Library toolbar slightly higher on phone screens.
- Refreshes stylesheet and script cache keys so deployed browsers receive the latest layout.

Updated files:

```text
assets/css/styles.css
assets/js/app.js
assets/js/maintenance.js
assets/js/magnetic-dock.js
index.html
README.md
```

Validation:

```text
npm test -- --runInBand
git diff --check
```

Responsive browser verification covered desktop bento corners, the full-photo Dashboard hero, the Plant Library sticky toolbar, the phone dock, iPhone safe-area clearance, maintenance-only destinations, Maintenance Mode, and Help.

### On-Device Plant Identifier V1

The Dashboard now opens a Plant Identifier that analyzes an uploaded plant photograph in the browser and returns possible common-name and scientific-name matches.

Changes:

- Accepts JPG, PNG, WEBP, and supported phone images up to 20 MB.
- Downloads and caches the quantized `onnx-community/FloraSense-ONNX` image-classification model on first use.
- Processes the selected photograph locally in the browser and returns up to five possible matches with model-confidence percentages.
- Matches scientific names against the Greenscape Plant Library to show known common names and library photographs.
- Uses iNaturalist and Wikipedia only to enrich missing reference names or photographs when available.
- Provides **Verify with Google Lens** as a separate confirmation step.
- Requires the user to choose the same photograph again in Google Lens because browsers cannot transfer a local upload directly between websites.
- Warns that automated suggestions are not guaranteed identification and that edible, toxic, medicinal, or otherwise important plants require professional confirmation.
- Keeps the first-use model size visible: approximately 225 MB, which may take several minutes on mobile data.

Usage:

1. Open **Plant Identifier** from the Dashboard.
2. Choose a clear plant photograph.
3. Select **Analyze on this device**.
4. Review the possible common and scientific name matches.
5. Use **Verify with Google Lens** and select the same photograph again.

The local model is downloaded from the internet on first use. After it is cached by the browser, later analyses can start faster. Google Lens verification always opens an external Google page.

The Plant Identifier remains visible on the Dashboard but is unavailable while forced maintenance read-only mode is enabled.

Updated files:

```text
assets/js/app.js
assets/css/styles.css
index.html
README.md
```

### Duplicate Plant Consolidation V1

Four duplicate plant records were consolidated into one permanent surviving record per plant while retaining their unique nursery size options.

Removed duplicate Record IDs:

- `bam-012` — `VBm-02` — Variegated Bamboo
- `bam-007` — `YBv-01` — Yellow Buho
- `pal-025` — `BAc-01` — Bunga
- `shr-035` — `GOl-02` — Golden Miagos

Surviving records and final automatic codes:

- `bam-006` — `VBm` — Variegated Bamboo — *Bambusa multiplex* 'Variegata'
- `bam-008` — `YBv` — Yellow Bamboo — *Bambusa vulgaris*
- `pal-037` — `BAc` — Bunga — *Areca catechu*
- `shr-010` — `GOl` — Golden Miagos — *Osmoxylon lineare*

Changes:

- Reduces the published library from 235 to 231 entries and from 224 to 220 plant records; all 11 Landscape Materials remain unchanged.
- Merges unique available-size options into each surviving record before deleting the duplicate row.
- Keeps the surviving image path and leaves the four unused duplicate image assets in the repository for rollback or later review.
- Migrates browser-saved plant records, project plant references, and mood-board selections from removed IDs to surviving IDs.
- Preserves project quantities, sizes, zones, spacing, notes, prices, and other line details; only otherwise identical numeric-quantity lines are combined.
- Regenerates automatic botanical codes so the four surviving plants no longer require duplicate suffixes.
- Adds regression checks for removed IDs, survivor IDs, merged sizes, published totals, project migration, and mood-board migration.

Updated files:

```text
data/Greenscape_Plant_Library.csv
assets/js/data.js
assets/js/app.js
index.html
scripts/validate.mjs
README.md
```

### Plant Common and Scientific Name Corrections V1.2

Plant Library common and scientific names were synchronized from the reviewed **Flagged Records and Scientific Names** correction file.

Changes:

- Reviews 129 approved plant-name records and sets their Common Name and Scientific Name values by permanent Record ID.
- Applies 126 record updates in this publication run; 3 reviewed records already matched the approved values.
- Changes 62 common names and 108 scientific names in this run, including 44 records where both fields changed.
- Fills 23 scientific-name cells that were blank immediately before this run.
- Uses category guards and exact Record IDs, avoiding fragile checks against previous spelling errors.
- Regenerates automatic botanical codes and keeps all 235 final codes unique.
- Current code result: 224 plants have complete code inputs; 17 same-initial groups affecting 38 plants use stable numbered suffixes.
- Keeps 1 species-level `sp.` placeholder record for an intentionally unresolved identification.
- Preserves every permanent Record ID, category, image path, size, plant detail, project reference, mood board, quotation, BOQ, and costing record.

Updated files:

```text
data/Greenscape_Plant_Library.csv
assets/js/data.js
index.html
README.md
```

### Plant Detail Tags and Overview Planting Notes V1

Plant tags now stay inside **View Details**, keeping Plant Library cards compact, and verified overview descriptions can supply a concise planting-note fallback.

Changes:

- Removes tag chips from Plant Library cards without removing tag data.
- Keeps automatic and manual tags searchable and visible in Plant Detail.
- Adds an **Overview Description** field to the plant form, Plant List Editor, Excel workflow, and Google Sheets CSV source.
- Uses the first complete sentence of **Overview Description** as the automatic planting note when the manual **Planting Notes** field is empty.
- Always gives a manually written planting note priority over the automatic overview sentence.
- Uses the same effective planting note in Plant Detail, project plant defaults, project schedules, and CSV exports.
- Keeps the Google AI Overview link as a research shortcut only. The website does not scrape Google, invent descriptions, or copy generated text automatically.
- Leaves existing overview descriptions blank until verified text is entered through the editor or `data/Greenscape_Plant_Library.csv`.
- Removes the unused Plant Library tag-badge CSS and refreshes the affected browser caches.

Updated files:

```text
data/Greenscape_Plant_Library.csv
assets/js/data.js
assets/js/app.js
assets/css/styles.css
scripts/sync_plants_from_csv.mjs
scripts/validate.mjs
index.html
README.md
```

### One-Word Scientific Name Code Rule V1

Plants whose scientific name contains only a genus now receive a complete automatic code instead of retaining a legacy code.

Code format:

```text
Common-name initial + genus initial + genus second letter
```

Examples:

- Buho + *Schizostachyum* → `BSc`
- Yellow Bamboo + *Schizostachyum* → `YSc`
- Bogambilya + *Bougainvillea* → `BBo`
- Peace Lily + *Spathiphyllum* → `PSp-01`
- Peace Lily Silver + *Spathiphyllum* → `PSp-02`

Changes:

- Uses uppercase, uppercase, lowercase formatting for every generated code.
- Keeps the existing common-name, genus, and species initials rule for scientific names containing two or more words.
- Uses the genus second letter as the third code character when the scientific name contains only one word.
- Marks the two `PSp` Peace Lily codes in red and gives them stable numeric suffixes.
- Leaves plants without a scientific name unchanged and marked as incomplete.
- Applies the same rule in the browser, Google Sheets CSV synchronization, and repository validation.
- Preserves every permanent Record ID, image path, plant detail, project reference, mood board, quotation, BOQ, and costing record.

Current migration:

- 224 plants have a complete automatic botanical code.
- 17 same-initial groups affecting 38 plants use stable numbered suffixes.
- 0 plants are missing a scientific name; every plant now has a complete code input.
- All 235 published entries retain unique final codes.

Updated files:

```text
data/Greenscape_Plant_Library.csv
assets/js/data.js
assets/js/app.js
scripts/sync_plants_from_csv.mjs
scripts/validate.mjs
index.html
README.md
```

### Plant Detail Image Download and Automatic Tags V1

Plant Detail now uses one clear image-download control and generates searchable tags from the plant information already available in the website.

Changes:

- Keeps **Download image** over the plant photograph as the single image-download control.
- Removes the duplicate **Download image** button from the modal footer.
- Keeps the photo download available during maintenance read-only mode.
- Gives the photo control an accessible plant-specific label, visible focus treatment, and stronger contrast.
- Automatically derives tags from the common name, scientific name, genus, species, category, sun, water, landscape use, and growing condition.
- Merges automatic tags with any manually supplied tags without repeating the same value.
- Uses the effective tag set in Plant Detail, Plant Library search, Plant List Editor search, Mood Board search, project plant search, badges, and Excel exports.
- Updates automatic tags when plant identity, category, or overview fields are edited.
- Does not scrape or copy Google AI Overview text; the automatic tags use the plant metadata stored locally in Greenscape.

Updated files:

```text
assets/js/app.js
assets/css/styles.css
index.html
scripts/validate.mjs
README.md
```

### Automatic Botanical Plant Code System V1

Plant codes now follow a consistent botanical initials rule while permanent Record IDs continue to protect project and document references.

Code format:

```text
Common-name initial + genus initial + species initial
```

Examples:

- Bayog + *Bambusa merrilliana* → `BBm`
- Malakatmon + *Dillenia luzoniensis* → `MDl`
- Katmon + *Dillenia philippinensis* → `KDp`

Changes:

- Generates the first letter from the common name in uppercase.
- Generates the genus initial in uppercase and the species initial in lowercase.
- Applies the automatic botanical code to every plant with a complete two-word scientific name.
- Keeps all permanent Record IDs, image paths, project references, mood boards, quotation drafts, BOQ drafts, and costing records unchanged.
- Gives plants with the same initials stable numeric suffixes such as `TTg-01` and `TTg-02`.
- Marks every same-initial code in red in the Plant Library, Plant Detail, and Plant List Editor.
- Shows the other plants using the same initials in the code tooltip.
- Marks plants without a complete genus and species in amber while retaining their previous code.
- Keeps Landscape Materials on structured manual codes such as `MAT-001`.
- Makes botanical codes read-only and automatically recalculates them after a common name, scientific name, or category changes.
- Canonicalizes the Google Sheets CSV and generated website data through the Plant CSV Sync workflow.
- Adds repository validation for botanical initials, suffixes, uniqueness, red conflict states, amber incomplete states, and preserved synchronization.

Current migration:

- 196 plants received an automatic botanical code.
- 19 same-initial groups affecting 41 plants received stable numbered suffixes.
- 28 plants with incomplete scientific names retain their previous codes and show an amber warning.
- All 235 published entries retain unique final codes.

Updated files:

```text
data/Greenscape_Plant_Library.csv
assets/js/data.js
assets/js/app.js
assets/css/styles.css
scripts/sync_plants_from_csv.mjs
scripts/validate.mjs
.github/workflows/sync-plant-csv.yml
index.html
README.md
```

### Maintenance Published Plant Data Fix V1

The read-only Plant Library now loads the latest GitHub-published catalogue as soon as maintenance mode starts.

Changes:

- Fixes a startup timing issue that allowed an older browser-saved plant list to override newly published GitHub records during maintenance.
- Detects maintenance mode from the document state established before the main application initializes.
- Makes newly published records such as **Malakatmon — Dillenia luzoniensis — TRE-028** immediately searchable in maintenance read-only access.
- Keeps saved projects, project schedules, mood boards, categories, quotation drafts, BOQ drafts, and costing records unchanged.
- Preserves normal-mode browser editing and storage behavior.
- Refreshes the `app.js` cache version so existing browsers receive the correction.
- Adds validation that prevents maintenance startup from depending on the later body read-only class.

Updated files:

```text
assets/js/app.js
index.html
scripts/validate.mjs
README.md
```

### Malakatmon Plant Record Update V1

The Malakatmon plant record now includes searchable identification tags while preserving its stable project references and supplied photograph.

Changes:

- Keeps Malakatmon as `tre-028` / `TRE-028`.
- Keeps the common name **Malakatmon**, scientific name *Dillenia luzoniensis*, and canonical **Trees** category.
- Adds the searchable tags `Dillenia`, `tree`, and `yellow flower`.
- Preserves the supplied `assets/images/malakatmon.jpg` photograph without unnecessary recompression.
- Uses the existing automatic **Google AI Overview** reference generated from the common and scientific names; no external summary text is copied into the repository.
- Regenerates `assets/js/data.js` from the Google Sheets-compatible CSV and refreshes its cache version in `index.html`.

Updated files:

```text
data/Greenscape_Plant_Library.csv
assets/js/data.js
index.html
README.md
```

### Malakatmon Plant Identifier Fix V1

The newly uploaded Malakatmon record now uses its own stable identifier instead of duplicating the existing Katmon record.

Changes:

- Keeps Katmon as `tre-010` / `TRE-010`.
- Assigns Malakatmon the next available identifier, `tre-028` / `TRE-028`.
- Preserves the supplied Malakatmon name, scientific name, sizes, category, and `assets/images/malakatmon.jpg` image.
- Regenerates `assets/js/data.js` from the corrected Google Sheets-compatible CSV.
- Refreshes the generated plant-data cache version in `index.html`.
- Restores the Plant CSV synchronization and Website Checks workflows.

Updated files:

```text
data/Greenscape_Plant_Library.csv
assets/js/data.js
index.html
README.md
```

### Repository Quality Review V2

This focused review improves initial loading, responsive interaction, accessibility, validation, and CI safety without changing the website architecture, stored browser data, maintenance protection, or visual direction.

Performance:

- Loads Quotation, BOQ, BOQ enhancements, and Project Costing assets only after **Project Lists** is opened.
- Removes four feature stylesheets and four feature scripts from the initial page request.
- Adds 15 responsive `900 × 600` Dashboard slideshow sources while retaining the original `1800 × 1200` files for larger or high-density displays.
- Adds responsive preload metadata for the first Dashboard slide.
- Reduces eagerly loaded Plant Library photos from five to the first three visible cards.
- Preserves the three-second crossfade, progressive preloading, reduced-motion behavior, and existing Dashboard crop.

Measured static results:

| Metric | Before | After | Change |
|---|---:|---:|---:|
| Initial JavaScript | 578,455 bytes | 428,427 bytes | −150,028 bytes (−25.9%) |
| Initial CSS | 247,197 bytes | 214,773 bytes | −32,424 bytes (−13.1%) |
| Slideshow source set selected on smaller screens | 9,971,436 bytes | 2,991,601 bytes | −6,979,835 bytes (−70.0%) |
| Initial script tags | 9 | 5 | −4 |
| Initial stylesheet links | 7 | 3 | −4 |

Responsive design and accessibility:

- Restores minimum 44 px interaction targets on phones, tablets, and coarse-pointer devices where later compact-layout rules previously reduced them to approximately 27–32 px.
- Covers Plant Library actions, search and filters, Plant List Editor controls, Mood Board controls, category rows, and key icon actions.
- Gives every visible **View details** action a plant-specific accessible label.
- Makes Plant Library and Plant List result announcements polite and atomic for assistive technology.
- Keeps keyboard focus, reduced-motion support, maintenance read-only behavior, and the current responsive card layouts unchanged.

Quality, security, and workflow:

- Extends the static audit with initial CSS and JavaScript transfer metrics, deferred Project-tool totals, and responsive slideshow totals.
- Validates all responsive slideshow files, responsive preload metadata, deferred Project-tool loading, touch safeguards, accessible Plant actions, and CI limits.
- Gives **Website Checks** explicit read-only repository permission.
- Adds a ten-minute timeout to prevent a stalled validation job from running indefinitely.
- Preserves the intentional `noindex`, `nofollow`, canonical URL, and `robots.txt` crawler block for this internal company tool.

Files changed:

```text
.github/workflows/ci.yml
README.md
index.html
assets/css/styles.css
assets/js/app.js
assets/images/dashboard-slideshow/*-900.jpg
scripts/audit.mjs
scripts/validate.mjs
```

Validation:

```text
npm run lint
npm test
npm run build
npm run check
npm run audit
npm run quality
git diff --check
```

All listed checks passed locally on July 28, 2026. Browser verification covered Dashboard and Plant Library loading, deferred Project-tool initialization, maintenance read-only entry, desktop, tablet, and mobile layouts, responsive image selection, touch targets, overflow, and console errors.

Remaining follow-up work:

- Run Lighthouse and real-user Core Web Vitals against the deployed pull-request revision; the local browser bridge does not expose reliable navigation timing entries.
- Consolidate the historical appended sections in `assets/css/styles.css` only in a dedicated visual-regression project because a broad rewrite would be higher risk.
- Visually recheck Quotation, BOQ, and Costing documents with representative saved project data after deployment.
- No TypeScript type check is available because this repository contains no TypeScript configuration or files.

### Dashboard Slideshow Speed Refinement V2

The Dashboard hero slideshow now advances every three seconds, reduced from five seconds, so the 15 landscape photographs rotate more quickly.

Changes:

- Changes the automatic slide interval from `5s` to `3s`.
- Preserves the smooth `0.9s` crossfade, progressive image preloading, responsive cropping, and feature glow.
- Continues pausing the slideshow outside the Dashboard and while the browser tab is hidden.
- Continues showing a static first image when reduced motion is preferred.
- Adds automated validation for the three-second interval.
- Refreshes the `app.js` browser cache version.
- Updates `assets/js/app.js`, `scripts/validate.mjs`, `index.html`, and `README.md`.

### Dashboard Auto Slideshow V1

The Dashboard hero now rotates through 15 supplied landscape photographs instead of displaying a single plant-record image.

Changes:

- Originally added an automatic five-second slideshow with a smooth `0.9s` crossfade; V2 now uses a three-second interval.
- Keeps the existing Dashboard hero layout, feature glow, text, and actions unchanged.
- Uses two image layers so the current photo remains visible while the next photo loads.
- Preloads the first image for faster initial rendering and progressively prepares later slides.
- Pauses slide changes while the browser tab or Dashboard view is not active.
- Keeps the first photo static when the visitor prefers reduced motion.
- Crops every supplied source photograph to a consistent `1800 × 1200` hero asset.
- Optimizes the photographs as JPEG files in `assets/images/dashboard-slideshow/`.
- Reduces the combined supplied-image size from `52,143,275` bytes to `9,971,436` bytes (`80.9%` smaller).
- Preserves responsive `object-fit: cover` behavior on desktop, tablet, and mobile.
- Adds automated validation for the 15 image files, preload hint, reduced-motion support, and crossfade styling.
- Refreshes the browser cache versions for `styles.css` and `app.js`.
- Updates `assets/js/app.js`, `assets/css/styles.css`, `scripts/validate.mjs`, `index.html`, slideshow image assets, and `README.md`.

Photo source filenames retain their Unsplash contributor names: David Genelhu, Francisco Perez, Chuttersnap, The Maker Jess, Karla Santana, Ke Tang, MK S, Krystal Ng, Joe R. Harris, Christian Holzinger, Mo, David Clode, Mackenzie Martin, Aesthetes ID, and Moises Ferreira.

Validation:

```text
npm run lint
npm test
npm run build
npm run check
npm run audit
npm run quality
```

All listed checks passed before deployment on July 28, 2026. Local browser verification also confirmed automatic image changes with no console errors.

### Google Sheets Plant Source V1.3

The published Plant Library can now be maintained through a Google Sheets-compatible CSV stored directly in GitHub.

Source file:

```text
data/Greenscape_Plant_Library.csv
```

GitHub workflow:

1. Open the CSV file in the GitHub repository.
2. Download the CSV from GitHub.
3. Import or open it in Google Sheets.
4. Edit the complete plant list.
5. Download the active Google Sheets tab as a comma-separated values (`.csv`) file.
6. Replace `data/Greenscape_Plant_Library.csv` directly in GitHub.
7. Commit the replacement to `main`.
8. Wait for **Plant CSV Sync** and **Website Checks** to pass.
9. Hard-refresh the website.

Website behavior:

- No Google Sheets download or GitHub upload controls are added to the website.
- During maintenance, **Import Excel**, **Export Excel**, **Add category**, and **Add plant** are hidden.
- Search, category filtering, entry counts, plant details, and plant-image downloads remain available.
- Excel export is removed from the maintenance allowlist.
- During maintenance, the website loads the latest published GitHub plant data rather than stale browser-saved plant records.
- Outside maintenance, existing browser Plant List editing and Excel tools remain available.

CSV columns:

- Record ID
- Code
- Common Name
- Scientific Name
- Category
- Available Sizes
- Sun
- Water
- Spacing
- Mature Height
- Mature Spread
- Landscape Use
- Growing Condition
- Planting Notes
- Tags
- Image Path / URL
- Plant Link

Rules:

- Keep existing Record IDs unchanged.
- Leave Record ID blank only when adding a new plant.
- Keep plant codes unique.
- Codes may use the short `AEg` format or structured codes such as `PAL-014`.
- Use `size | unit; size | unit` for Available Sizes.
- Store local images in `assets/images/` and enter the repository path in the CSV.
- HTTP and HTTPS image URLs already used by the website are preserved; use HTTPS for new records.
- Local image paths may include safe spaces and parentheses and must remain inside `assets/`.
- Supported embedded data images are preserved up to 8 MB.
- Empty historical data-image placeholders are converted to blank image cells.
- Plant-reference URLs must use HTTPS.
- Spreadsheet formulas and unsafe formula-like values are rejected.
- Duplicate IDs and codes, unsafe image paths, missing local images, malformed rows, and large accidental deletions stop publication.
- Failed validation leaves the previously published website data unchanged.

Automation:

- `scripts/sync_plants_from_csv.mjs` validates and converts the CSV into `assets/js/data.js`.
- `.github/workflows/sync-plant-csv.yml` runs when the CSV changes.
- The workflow updates the plant-data cache version using a deterministic CSV hash.
- The workflow runs the complete repository quality checks before committing generated plant data.
- `README.md` is updated in the same release.

### Plant Image Download During Maintenance V1

Plant images can now be downloaded from the Plant Detail view while the website is operating in read-only maintenance mode.

Changes:

- Adds a **Download image** button to Plant Detail whenever the selected plant has an image.
- Downloads local, data-URL, and browser-accessible remote images.
- Generates a clean filename using the plant code and common name.
- Preserves the image extension when it can be detected from the file type or image URL.
- Uses a direct browser-download fallback when a remote image host blocks `fetch` through CORS.
- Adds `download-plant-image` to the maintenance action allowlist.
- Keeps the download button enabled, readable, and keyboard-accessible during maintenance.
- Does not write to `localStorage` or change any plant record.
- Keeps plant editing, image replacement, adding, deleting, importing, restoring, and saving blocked.
- Keeps project, quotation, BOQ, and costing data-changing actions blocked.
- Hides the download control automatically when a plant has no image.
- Changes cache versions for `app.js` and `maintenance.js`.
- Updates `assets/js/app.js`, `assets/js/maintenance.js`, `index.html`, and `README.md`.
- Runs the complete repository quality checks before deployment.

### Navigation Icon and Project Header Contrast V1

The primary navigation and Maintenance Mode control now use the supplied Greenscape interface icons, and the glowing Project Detail header has stronger text contrast.

Changes:

- Replaces the Dashboard text symbol with the uploaded dashboard/house icon.
- Replaces the Plant Library text symbol with the uploaded plant-library icon.
- Replaces the Plant List Editor text symbol with the uploaded plant-and-document icon.
- Replaces the Mood Board Creator text symbol with the uploaded image/location icon.
- Replaces the Project Lists text symbol with the uploaded circular project icon.
- Stores all navigation icons in `assets/icons/navigation/`.
- Uses CSS masks so icons inherit the correct inactive, hover, active, desktop, and compact-navigation colors.
- Keeps navigation labels, keyboard focus, active-page state, and routing unchanged.
- Replaces the generated Maintenance Mode SVG with the uploaded wrench icon.
- Uses the wrench icon as a CSS mask inside the same circular Help-style control.
- Keeps the compact mobile Maintenance Mode layout and shared Help hover, focus, press, and scroll-hide behavior.
- Forces Project Detail breadcrumbs, project title, subtitle, and action labels to remain readable in white.
- Applies a translucent glass treatment to Project Detail buttons.
- Keeps disabled maintenance controls readable while clearly unavailable.
- Changes cache versions for `styles.css`, `feature-glow.css`, `maintenance.css`, and `maintenance.js`.
- Updates `index.html`, `assets/css/styles.css`, `assets/css/feature-glow.css`, `assets/css/maintenance.css`, `assets/js/maintenance.js`, icon assets, and `README.md`.
- Runs the complete repository quality checks before deployment.

### Feature Glow Scale and Motion Refinement V2

The Dashboard and Project Detail glow treatments now have a larger spread and faster, more visible motion.

Changes:

- Increases the Dashboard upper-left lime glow from approximately `620px` to `820px`.
- Increases the Dashboard lower-right green glow from approximately `560px` to `760px`.
- Expands the bloom radius, visible spread, and animated travel distance.
- Speeds up the Dashboard lime animation from `9s` to `4.5s`.
- Speeds up the Dashboard green animation from `11s` to `5.5s`.
- Increases the Project Detail lime glow from `230px` to `340px`.
- Increases the Project Detail green glow from `210px` to `320px`.
- Adds restrained Project Detail breathing animations at `4.8s` and `5.8s`.
- Keeps Project Detail motion softer than the Dashboard hero.
- Enlarges both Dashboard glows on mobile while preserving clipped hero boundaries.
- Replaces the maintenance lock emoji with a custom inline SVG maintenance/status icon.
- On screens up to `760px`, reduces the maintenance pill to the icon and **Maintenance mode** title only.
- Hides the read-only description and **Details** label on small screens while keeping the entire pill clickable.
- Preserves the shared Help-style hover, focus, press, and scrolling behavior.
- Extends reduced-motion support to the Project Detail glow animation.
- Changes cache versions for `feature-glow.css`, `maintenance.css`, and `maintenance.js`.
- Updates `assets/css/feature-glow.css`, `assets/css/maintenance.css`, `assets/js/maintenance.js`, `index.html`, and `README.md`.
- Runs the complete repository quality checks before deployment.

### Feature Glow Design System V1

The maintenance-screen lighting language is now reused selectively across important feature areas without affecting data-entry clarity.

Included applications:

- **Dashboard hero:** animated upper-left lime glow and lower-right green glow at a softer intensity than the maintenance startup.
- **Project Detail header:** compact static dark-green glow behind the project identity and primary actions.
- **Quotation header:** restrained static lime and green corner glows.
- **BOQ header:** restrained static lime and green corner glows.
- **Costing header:** restrained static lime and green corner glows.
- Tables, forms, plant cards, mood-board output, printable documents, and exported reports remain unchanged.
- The Dashboard animation stops automatically for users who prefer reduced motion.
- Print styles remove all decorative glow layers and restore clean white headers.
- Adds `assets/css/feature-glow.css`.
- Updates `assets/js/app.js`, `index.html`, and `README.md`.
- Runs the complete repository quality checks before deployment.

The design system uses three levels:

- **Full glow:** reserved for the maintenance startup.
- **Feature glow:** used on the Dashboard hero.
- **Static glow:** used on Project Detail and tool headers.

### Maintenance and Help Control Match V6

The bottom-right maintenance status now follows the same interaction and visual language as the Help control.

Changes:

- Converts the Maintenance Mode status into one fully clickable glass pill.
- Uses the existing Help pill class so both controls share the same rounded glass treatment.
- Adds a circular lock icon that matches the Help question-mark icon structure.
- Applies the same hover lift, pressed state, keyboard focus treatment, reflection, blur, and shadow behavior.
- Keeps the Maintenance Mode title, read-only explanation, and **Details** label.
- Opens the maintenance details screen when any part of the maintenance pill is selected.
- Hides both Maintenance Mode and Help while the page, a modal, or a nested work area is scrolling.
- Restores both controls together shortly after scrolling stops.
- Keeps both controls visible while the Help panel is open.
- Preserves all maintenance read-only protection and browser-storage safeguards.
- Keeps the controls aligned side by side on desktop and stacked on narrow mobile screens.
- Changes cache-version strings for `maintenance.css`, `maintenance.js`, and `app.js`.
- Updates `assets/css/maintenance.css`, `assets/js/maintenance.js`, `assets/js/app.js`, `index.html`, and `README.md`.
- Runs the complete repository quality checks before deployment.

### Maintenance Background and Button Refinement V5

The maintenance startup now uses two atmospheric glowing light sources while retaining the existing dark-green read-only presentation.

Changes:

- Keeps the upper-left lime light and turns it into a brighter, softly blurred glow with bloom and a gentle breathing animation.
- Keeps the lower-right green light and turns it into a balanced green glow with bloom and a slower breathing animation.
- Uses layered radial gradients, blurred pseudo-elements, soft box-shadow bloom, and a deep-green translucent overlay.
- Increases backdrop blur and saturation slightly while preserving visibility of the website behind the maintenance screen.
- Strengthens the maintenance card shadow and adds a subtle lime halo for separation.
- Keeps only **BETA · READ-ONLY MAINTENANCE MODE**.
- Explicitly enables the **Open read-only website** action whenever the startup screen opens.
- Uses a stronger high-specificity selector so the normal button state remains solid `#073c2c` with white text.
- Disables glow animation for users who prefer reduced motion.
- Changes all maintenance cache-version strings so every browser requests the V5 files after deployment.
- Updates `assets/css/maintenance.css`, `assets/js/maintenance.js`, `index.html`, and `README.md`.
- Runs the complete repository quality checks before deployment.

### Maintenance Controls Refinement V4

The maintenance startup and read-only controls now use a cleaner, more compact layout.

Changes:

- Removes the duplicate **BETA — SYSTEM UPDATE IN PROGRESS** line.
- Keeps **BETA · READ-ONLY MAINTENANCE MODE** as the only startup badge.
- Forces the **Open read-only website** button to use a solid `#073c2c` background and readable white text in its normal, hover, focus, and disabled states.
- Explicitly keeps the read-only startup action enabled when the maintenance details screen opens.
- Moves the Maintenance Mode status from the top-center of the website into the existing bottom-right Help container.
- Places the compact Maintenance Mode pill immediately to the left of Help on desktop and tablet.
- Stacks the Maintenance Mode pill directly above Help on narrow mobile screens.
- Keeps the **Details** action available to reopen the maintenance startup screen.
- Preserves read-only protection, blocked data edits, protected browser storage, navigation, searching, viewing, printing, exporting, and Help.
- Changes all maintenance cache-version strings so browsers request the revised files after deployment.
- Updates `assets/js/maintenance.js`, `assets/css/maintenance.css`, `index.html`, and `README.md`.
- Runs the complete repository quality checks before deployment.

### Maintenance Screen Design Refinement V3

The forced maintenance startup screen now has clearer wording, stronger branding, and a single readable action.

Changes:

- Adds the badge **BETA · READ-ONLY MAINTENANCE MODE**.
- Adds the update label **BETA — SYSTEM UPDATE IN PROGRESS**.
- Changes the main heading to **We’re improving your Greenscape workspace**.
- Explains that the Plant Library and project records remain available in read-only mode.
- Recolors the maintenance Greenscape logo to exactly `#073c2c`.
- Uses `#073c2c` for the primary button with high-contrast white text.
- Adds clear hover and keyboard-focus states to the primary button.
- Removes the **Check again** button.
- Keeps **Open read-only website** as the only startup action.
- Preserves maintenance protection, read-only browsing, blocked data edits, and protected browser storage.
- Changes all maintenance cache-version strings so browsers request the refined screen after deployment.
- Updates `assets/js/maintenance-config.js`, `assets/js/maintenance.js`, `assets/css/maintenance.css`, `index.html`, and `README.md`.
- Runs the complete repository quality checks before deployment.

### Forced Maintenance Cache Refresh V2

Maintenance mode is now force-enabled for all visitors using a new uncached override file.

Changes:

- Confirms `enabled: true` in `assets/js/maintenance-config.js`.
- Adds `assets/js/maintenance-force.js`, which forces maintenance mode on even when a browser has cached the older disabled configuration.
- Loads the force script after the configuration file and before the maintenance controller.
- Changes the cache versions for `maintenance.css`, `maintenance-config.js`, `maintenance-force.js`, and `maintenance.js`.
- Forces browsers to request the new maintenance startup and read-only files after GitHub Pages redeploys.
- Keeps the maintenance startup screen, read-only browsing, blocked editing, and protected `localStorage` behavior.
- Updates `index.html`, `package.json`, `scripts/validate.mjs`, and `README.md`.
- Runs the complete repository quality checks before deployment.

To disable forced maintenance later:

1. Remove the `maintenance-force.js` script tag from `index.html`.
2. Change `enabled: true` to `enabled: false` in `assets/js/maintenance-config.js`.
3. Change the maintenance cache-version strings again.
4. Update `README.md` and deploy the change.

### Maintenance Startup and Read-Only Mode V1

The website now includes an optional maintenance startup page and read-only browsing mode.

Included behavior:

- Shows a branded maintenance startup page when maintenance mode is enabled.
- Allows visitors to continue into the website using **Open read-only website**.
- Keeps navigation, project viewing, plant details, searching, filtering, printing, exporting, and Help available.
- Disables editing, saving, adding, deleting, importing, restoring, and other data-changing controls.
- Blocks browser `localStorage` writes while maintenance mode is active, protecting existing plant, project, quotation, BOQ, and costing records.
- Shows a persistent **Maintenance mode — Read-only access** banner.
- Provides clear disabled-control states and a message when a blocked action is attempted.
- Supports desktop, tablet, mobile, keyboard navigation, and reduced-motion preferences.
- Adds `assets/js/maintenance-config.js`, `assets/js/maintenance.js`, and `assets/css/maintenance.css`.
- Updates `index.html`, `package.json`, `scripts/validate.mjs`, and `README.md`.
- Runs the complete repository quality checks before deployment.

#### Turn maintenance mode on or off

Open `assets/js/maintenance-config.js` and change:

```js
enabled: false
```

to:

```js
enabled: true
```

Change it back to `false` when maintenance is complete. The title, message, status, and expected-return text can also be edited in the same file.

For a temporary preview without enabling it for everyone, open the website with:

```text
?maintenance-preview=1
```

This read-only mode prevents accidental browser-side edits. It is not authentication or server-side access control.

### Project Card Summary V3

The compact Project List summary now keeps category and deadline information fully readable.

Changes:

- Keeps **Category** or **Categories** on one line.
- Uses singular or plural wording based on the category count.
- Gives the Deadline cell more horizontal space.
- Shows the complete deadline date without truncation or an ellipsis.
- Keeps the days-left or overdue status below the full date.
- On small mobile screens, the Deadline cell moves to a full-width second row.
- Preserves the compact card, whole-card click, touch, Enter, and Space behavior.
- Updated `assets/js/app.js`, `assets/css/styles.css`, `index.html`, and `README.md`.
- Runs the full repository quality checks before deployment.

### Project Card Compact Summary V2

The Project Lists summary cards now use a shorter and more readable information row.

Changes:

- Replaced the large **Quantity** summary cell with **Area Size**.
- Displays **Area Size, Categories, and Deadline** in three compact cells.
- Reduced cell height, spacing, padding, and typography.
- Preserved the whole-card click, touch, Enter, and Space interaction.
- Preserved all tools inside the Project Detail page.
- Updated `assets/js/app.js`, `assets/css/styles.css`, `index.html`, and `README.md`.
- Runs the complete repository quality checks before deployment.

### Project List Card Cleanup V1

The Project Lists page now uses cleaner summary cards without the crowded action-button row.

Changes:

- Removed **Open list**, **Add plants**, **Quotation**, **BOQ**, and **Costing** buttons from each Project List summary card.
- Made the entire project card open the selected project.
- Added keyboard access using **Enter** or **Space** while the card is focused.
- Kept project tools inside the Project Detail page, where they are easier to organize and use.
- Preserved Quotation, BOQ, Costing Suite, Add Plant, Edit Project, and View Schedule functionality.
- Updated `assets/js/app.js`, `assets/css/styles.css`, `index.html`, and `README.md`.
- The deployment runs `npm run quality` before pushing to `main`.

### Repository Quality Review V1

The latest repository update improves performance, responsive behavior, accessibility, metadata, validation, and code quality while preserving the existing design, workflows, and browser-local data.

#### Performance

- Consolidated duplicated BOQ enhancement CSS.
- Removed the continuous pointer-move collision listener.
- Preserved compact viewport-fixed BOQ zoom controls.
- Preserved Help hiding while scrolling or overlapping visible modal actions.
- Added `defer` to all six website JavaScript files.
- Added `content-visibility` for long plant-card lists where supported.
- Added contained momentum scrolling for large modal tables.
- Removed empty historical patch comments from `index.html`.

#### Responsive Design and Accessibility

- Added clear `:focus-visible` keyboard outlines.
- Added shared keyboard focus trapping for visible dialogs.
- Added reduced-motion support.
- Improved touch-target sizes.
- Improved long-text wrapping and overflow handling.
- Allowed project and modal action groups to wrap safely.
- Made toast messages atomic screen-reader announcements.
- Added `role="alert"` for error messages and `role="status"` for normal messages.
- Added explicit button types to prevent unintended form submission.

#### SEO and Privacy

- Improved the page description and social-sharing metadata.
- Added the Open Graph site name.
- Added Twitter image alternative text.
- Added a strict referrer policy.
- Preserved the canonical URL.
- Preserved `noindex`, `nofollow`, `noarchive`, and `nosnippet`.
- Kept crawler blocking because the website is an internal company tool.
- A sitemap is intentionally not published while indexing is disabled.

#### Code Quality and Security

- Extended syntax validation to every website JavaScript file.
- Added checks for button types and safe new-tab links.
- Added checks for deferred scripts, metadata, image loading, keyboard focus support, local assets, manifest icons, and CSV injection protection.
- Added `.env`, logs, editor folders, and `node_modules` to `.gitignore`.
- Added `npm run audit`.
- Added `npm run quality`.
- Updated GitHub Actions to run the expanded quality command on pushes and pull requests to `main`.

The review was implemented through these focused commits:

```text
perf: streamline BOQ enhancements and loading
fix: improve responsive and accessible interactions
test: expand quality checks and documentation
```

### Greenscape Project Costing Suite V1

The Project Costing Suite adds a complete project-costing workspace inside every Project List.

Included tools:

- Project Costing Summary
- 100%, 50%, and 35% BOQ Comparison
- Automatic Plant Quantity Calculator
- Plant Specification Matrix
- Density Specification Presets
- Cost Comparison Dashboard
- Maintenance Cost Calculator
- Water Consumption Calculator
- Consumables Calculator
- Manpower Calculator
- Projected Work Duration
- Tools and Equipment Budget
- Equipment Rental and Fuel Costing
- Admin, Profit, Safety, Tax, and VAT Controls
- Project Statement of Account
- Complete project export as HTML, printable PDF, JSON, and CSV

The Costing Suite connects to the selected project's plant list, quantities, BOQ draft, density scenarios, and reference prices. Open **Project Lists**, select a project, and click **Costing Suite**.

## Main Features

- On-device Plant Identifier with possible common and scientific name matches
- Optional Google Lens verification for uploaded plant photographs
- Searchable plant and landscape-material library
- Responsive bento workspace for desktop, tablet, and phone
- Glass magnetic phone dock with safe-area support
- Full-photo, 15-image Dashboard slideshow with feature glow
- Maintenance read-only mode with clear **Soon** destinations
- Plant List Editor with save and cancel confirmation
- Add and edit plant records, photos, sizes, notes, tags, and links
- Duplicate plant-code detection and required-field validation
- Project plant lists and plant schedules
- Project-based quotation creator
- Automatic landscape BOQ creator
- 100%, 50%, and 35% density and specification scenarios
- BOQ auto-sync for newly added project plants
- Compact viewport-fixed BOQ zoom controls
- Help widget that hides while scrolling or covering visible modal actions
- Complete Project Costing Suite
- Plant quantity, maintenance, water, manpower, equipment, and tax calculators
- Project Statement of Account
- A3 portrait and landscape mood-board creator
- Adjustable cards per row and cards per column
- PNG, CSV, JSON, HTML, Excel, and printable PDF exports
- Mobile home-screen support through the web app manifest

## Technology Stack

The project is a dependency-free static website built with:

- HTML
- CSS
- Vanilla JavaScript
- Browser `localStorage`
- GitHub Pages
- Node.js 20 or newer for repository validation only

The project does not use a frontend framework, package dependency, TypeScript, or generated build output.

## Important Data Note

Plant edits, project records, quotation drafts, BOQ drafts, and costing records created inside the live website are stored in the browser using **local storage**.

This means:

- Changes remain on the same browser and device.
- Changes do not automatically update the GitHub repository.
- Changes do not automatically appear on another computer or phone.
- Clearing browser data may remove locally saved records.
- Use the available export tools regularly to keep backups.

## How to Open the Published Website

1. Open Chrome, Safari, or another modern browser.
2. Go to:

   `https://nyxdcz.github.io/greenscape-plant-library/`

3. Bookmark the page for easier access.
4. On a phone, use **Add to Home Screen** to create an app-like shortcut.

## How to Use the Project Tools

1. Open **Project Lists**.
2. Create a project or open an existing project.
3. Add plants, quantities, spacing, and BOQ reference prices.
4. Use the project actions to open:
   - **Quotation**
   - **Create BOQ**
   - **Costing Suite**
   - **View Schedule**
5. Save or export the completed project documents.

## How to Publish or Check GitHub Pages

1. Open the repository:

   `https://github.com/nyxdcz/greenscape-plant-library`

2. Go to **Settings → Pages**.
3. Under **Build and deployment**, confirm:
   - **Source:** Deploy from a branch
   - **Branch:** `main`
   - **Folder:** `/ (root)`
4. Open the **Actions** tab.
5. Wait for **Website Checks** and **pages build and deployment** to show green check marks.
6. Open the live website.
7. Perform a hard refresh.

Hard-refresh shortcuts:

- **Mac:** `Command + Shift + R`
- **Windows:** `Ctrl + Shift + R`

## How to Update the Website

Website design and function updates normally involve one or more of these files:

- `index.html`
- `assets/css/styles.css`
- `assets/css/quotation.css`
- `assets/css/boq.css`
- `assets/css/boq-enhancements.css`
- `assets/css/project-costing.css`
- `assets/css/maintenance.css`
- `assets/css/feature-glow.css`
- `assets/js/app.js`
- `assets/js/data.js`
- `assets/js/quotation.js`
- `assets/js/boq.js`
- `assets/js/boq-enhancements.js`
- `assets/js/project-costing.js`
- `assets/js/maintenance.js`
- `assets/js/maintenance-config.js`
- `assets/js/maintenance-force.js`
- `scripts/validate.mjs`
- `scripts/audit.mjs`
- `package.json`
- `.github/workflows/ci.yml`
- `README.md`

To publish an update:

1. Edit only the files related to the change.
2. Update `README.md` in the same change.
3. Run the repository checks.
4. Commit the files with a clear commit message.
5. Push the change to `main` or merge an approved pull request.
6. Wait for GitHub Pages to redeploy.
7. Hard-refresh the live website and verify the affected views.

## README Update Policy

Every future website or repository change must also update `README.md`.

The README update should include, when applicable:

- Version or feature title
- Summary of what changed
- New or changed features
- Files affected
- Installation or usage notes
- Tests and checks performed
- Known limitations or remaining work

Documentation should be committed and deployed together with the related code changes.

## Repository Structure

```text
index.html
.nojekyll
README.md
package.json
favicon.svg
favicon.ico
site.webmanifest
robots.txt
assets/
├── css/
│   ├── styles.css
│   ├── maintenance.css
│   ├── feature-glow.css
│   ├── quotation.css
│   ├── boq.css
│   ├── boq-enhancements.css
│   └── project-costing.css
├── js/
│   ├── data.js
│   ├── app.js
│   ├── maintenance-config.js
│   ├── maintenance-force.js
│   ├── maintenance.js
│   ├── magnetic-dock.js
│   ├── quotation.js
│   ├── boq.js
│   ├── boq-enhancements.js
│   └── project-costing.js
├── icons/
│   ├── app icons
│   └── navigation/
└── images/
    ├── plant and interface images
    └── dashboard-slideshow/
scripts/
├── sync_plants_from_csv.mjs
├── validate.mjs
└── audit.mjs
.github/
└── workflows/
    ├── ci.yml
    └── sync-plant-csv.yml
```

## Local Validation

The project uses dependency-free Node.js checks so repository updates can be verified consistently.

```bash
npm run lint
npm test
npm run build
npm run check
npm run audit
npm run quality
```

- `npm run lint` checks every website JavaScript file for syntax errors.
- `npm test` validates HTML structure, metadata, accessibility hooks, security guards, manifest data, and local asset paths.
- `npm run build` runs the same validation in static-build mode.
- `npm run check` runs JavaScript syntax checks and the standard validation.
- `npm run audit` reports static HTML, CSS, JavaScript, script-loading, and image-loading metrics.
- `npm run quality` runs linting, tests, build validation, and the static audit.
- A TypeScript check is not applicable because the repository contains no TypeScript source or configuration.
- GitHub Pages serves the repository files directly.

## Quality Review Notes

- The website intentionally remains a dependency-free static application.
- Quotation, BOQ, Costing, plant records, and project data continue using the existing browser `localStorage` keys.
- The repository review preserved the existing visual direction and workflows.
- Search indexing remains disabled because this is an internal company tool.
- Real Core Web Vitals should be measured against the deployed website using Lighthouse or WebPageTest.
- The validation scripts provide static checks but do not replace manual browser testing.

## Privacy and Search Indexing

This is an internal company tool published on a public GitHub Pages URL.

The page metadata and `robots.txt` ask search engines not to index or archive it. This discourages discovery but does not provide authentication or access control. Anyone with the public URL may still open the website.

## Troubleshooting

### A new feature is missing

- Wait for the latest GitHub Pages deployment to finish.
- Confirm that the latest commit is on the `main` branch.
- Perform a hard refresh.
- Reopen the affected page or project tool.

### Website Checks fail

1. Open the failed workflow in the **Actions** tab.
2. Expand the failed step.
3. Read the exact validation message.
4. Fix the reported file or template.
5. Run `npm run quality` locally.
6. Commit and push the correction.

### The website shows a 404 page

Check that:

- `index.html` is located in the repository root.
- GitHub Pages is using `main` and `/ (root)`.
- The latest Pages deployment completed successfully.
- The repository name is exactly `greenscape-plant-library`.

### The website shows an older version

Wait a few minutes after committing, then perform a hard refresh.

### Images or styles are missing

Confirm that the full `assets` folder was uploaded and that file names and folder paths were not changed.

### Saved records disappeared

The website stores user-created records in the browser. Check whether browser data was cleared or whether the website was opened on another device or browser.

## Project Status

The website is actively maintained and updated as the Greenscape plant database, Plant Identifier, landscape workflow, project documentation, quotation, BOQ, and costing tools develop.

Forced maintenance mode is currently enabled. Dashboard and Plant Library browsing, Plant Detail, plant-image downloads, searching, filtering, Maintenance details, and Help remain available. The Plant Identifier remains visible but unavailable during maintenance. Plant List Editor, Mood Board Creator, and Project Lists are currently marked **Soon** and cannot be opened until maintenance mode is disabled.
