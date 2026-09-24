## 2026-09-24 - Plant ID Map lookups in app.js
**Learning:** `getPlant(id)` was called extensively across application loops using linear `plants.find()`, resulting in unnecessary O(N) overhead during rendering, filtering, and schedule calculations.
**Action:** Maintain a persistent `plantByIdMap` (`Map`) and sync it whenever `plants` is updated or mutated, bringing `getPlant(id)` lookup time down to O(1).
