# Add Plants Here

Use this folder to add or update a plant through GitHub without editing the full CSV.

## Add a plant

1. Duplicate `_PLANT_TEMPLATE.json`.
2. Rename the copy to the exact Record ID, such as `pal-038.json`.
3. Set the same value in `"recordId"`.
4. Complete the plant information.
5. Upload the matching image to `assets/images/`, such as `assets/images/pal-038.webp`.
6. Commit the JSON and image together to `main`.

The **Plant CSV Sync** workflow will:

- validate every JSON file in this folder
- merge new or updated records into `data/Greenscape_Plant_Library.csv`
- calculate the botanical code through the existing synchronization system
- regenerate `assets/js/data.js`
- update the plant-data browser cache key
- run the complete website quality checks
- publish only when all checks pass

## Important rules

- Keep `_PLANT_TEMPLATE.json` unchanged; files beginning with `_` are ignored.
- The JSON filename must exactly match its Record ID.
- Record IDs may contain letters, numbers, periods, underscores, and hyphens.
- Local images must be inside `assets/` and must already exist in the same commit.
- Plant links must use HTTPS.
- Existing JSON files remain the source for those specific plants. Edit the same file to update a plant.
- An invalid JSON file, missing image, or duplicate Record ID stops publication safely.
