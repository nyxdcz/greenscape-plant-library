# Greenscape Plant Library — Optimized GitHub Pages Build

This version keeps the same website features while moving the large embedded plant photos into separate WebP files.

## Size improvements

- Original `index.html`: 16.37 MB
- Optimized `index.html`: 2.2 KB
- Extracted plant images: 217
- Original embedded image data: 12.02 MB
- Optimized image files: 10.51 MB

## Repository structure

```
index.html
.nojekyll
assets/
  css/styles.css
  js/data.js
  js/app.js
  images/*.webp
```

## Updating the existing GitHub Pages repository

GitHub Desktop is recommended because this build contains more than 200 image files.

1. Clone `nyxdcz-pixel/greenscape-plant-library` in GitHub Desktop.
2. Delete the old site files from the local repository folder.
3. Copy everything from this optimized folder into the repository folder.
4. Commit with a message such as `Optimize website assets`.
5. Push to the `main` branch.
6. GitHub Pages will redeploy automatically.

Plant edits made inside the live website are still stored in the current browser using local storage. They do not automatically update the GitHub repository.
