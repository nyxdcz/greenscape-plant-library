# Greenscape Plant Library

Greenscape’s catalogue of plants and landscape materials for landscape planning.
[Open the live website](https://nyxdcz.github.io/greenscape-plant-library/) · [Documentation](docs/README.md) · [Add plants to the shared catalogue](data/ADD_PLANTS_HERE/README.md)

## What you can do

- Search by common name, scientific name, or plant code.
- Browse All, Plants, or Materials and filter by category.
- View original reference photos, enlarge them, and copy an image.
- Read recorded sizes and copy individual fields or a complete record.
- Expand Plant reference to open a researched botanical page or search Google when the identity is uncertain.
- Suggest a new plant or a correction for review by email.

## Suggestions and shared updates

**Add plant and Suggest a correction send proposals to nyxdcz@gmail.com through FormSubmit.** Add plant requires a common name, scientific name, existing category, and uploaded image. Corrections send only selected fields with the original record for comparison. See [submission setup and email verification](docs/catalogue-submissions.md).
To update the shared catalogue, use the repository’s plant-data publishing process below. Changes to the shared website become available after validation and deployment.

## Add or update a shared plant

1. Follow the [plant-folder instructions](data/ADD_PLANTS_HERE/README.md) and start with the supplied JSON template.
2. Use the correct record ID and image filename. Include confirmed plant details; leave uncertain details unconfirmed.
3. Follow the plant-folder instructions to commit the JSON and image together to `main`.
4. Confirm that Plant CSV Sync and deployment succeed in GitHub Actions.
Plant CSV Sync validates submitted records, updates the canonical CSV and website data, and generates catalogue thumbnails. The detailed instructions explain the required fields and image rules.

## Project structure

| Path | Purpose |
| --- | --- |
| `index.html` | Current compact catalogue entry page |
| `assets/` | Website styles, scripts, original photos, and thumbnails |
| `data/` | Shared catalogue data, plant submissions, and reference-review records |
| `docs/` | Catalogue guides, implementation notes, verification, and history |
| `scripts/` | Data conversion, validation, tests, and thumbnail generation |
| `.github/workflows/` | GitHub quality checks, publishing, and catalogue synchronization |
| `staff-access/` and `tools/` | Supporting staff-access instructions and local tools |
| `style-comparison.html` | Design comparison demo, separate from the published catalogue |
The repository also retains assets from an earlier dashboard and project workspace. The current `index.html` loads the compact catalogue. Historical dashboard features are documented in the [archived README](docs/archive/README-before-cleanup-2026-10-22.md).

## Preview and check changes

Use Node.js 20 or later for the repository checks. Normal quality checks do not require installing dependencies.
```sh
npm run test:catalogue
npm test
npm run quality
```
For a local preview, serve the repository folder with a static web server and open `index.html` through that server. For example:
```sh
python3 -m http.server 8765
```
Then visit `http://localhost:8765/`.
Thumbnail generation has separate tooling requirements; see [performance and thumbnail maintenance](docs/catalogue-performance.md).
