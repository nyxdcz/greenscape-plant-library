# Catalogue performance

Implemented on 22 October 2026 for the approved first pass: list thumbnails and smoother search rendering.

## Photographs

The list uses 160-by-160 maximum-size WebP derivatives, fitted inside that box without cropping, stretching, or enlarging small sources. Details, the enlarged viewer, image reference, and Copy image continue to use the original photograph. Native lazy loading, asynchronous decoding, the fixed photo frame, missing-photo feedback, and the existing catalogue layout remain in place. An unavailable thumbnail retries its original photo once; failure of that original uses the existing No photo state. Custom filenames and external photo URLs without a generated derivative use their original source.

The 214 referenced originals total 10,820,430 bytes; their thumbnails total 1,507,608 bytes, 86.07% fewer image-file bytes across the complete collection. This is not an initial-page transfer measurement or a loading-time improvement claim. The generated application map adds 12,497 uncompressed JavaScript bytes. Original files and the canonical CSV/data payload are unchanged.

`scripts/catalogue-thumbnails.mjs` generates derivatives and a source/output-hash manifest from the published data. Source hashes appear in thumbnail filenames, so a newly generated image has a different URL when its source changes. The manifest records output dimensions and hashes; `npm run thumbnails:check` verifies completeness, settings, source/output bytes, and the exact application map using only Node's standard library. The full quality suite includes that check. The normal pull-request and deployment workflows require no package installation.

Generation requires Node 20.9 or later and Sharp 0.35.5. Install the generator in an isolated tool directory, keeping it outside the website's runtime dependencies:

```sh
npm install --prefix /tmp/greenscape-thumbnail-tools --no-package-lock --ignore-scripts sharp@0.35.5
npm run thumbnails -- --sharp-module /tmp/greenscape-thumbnail-tools/node_modules/sharp/dist/index.cjs
npm run thumbnails:check
```

When Sharp is already resolvable locally, `npm run thumbnails` also works. Commit the generated application module, manifest, and derivative files together with the catalogue update. The CSV-sync workflow performs installation in its temporary directory, generates thumbnails after CSV conversion, validates them before publication, and includes newly generated files in its commit. Its existing triggers and repository permissions remain unchanged. This generation tool is not loaded by browsers.

## Search and rendering

Rapid input events share one pending animation-frame update, using the latest query without a fixed debounce timer. Scope, category, reset, loading/error, and record-save actions render immediately and cancel pending search work. Composition input waits for composition to finish. Repeating a normalized query/filter state performs no redundant render.

The result list keeps record rows and photo nodes, updates escaped text highlights when the query changes, and reconciles matching order instead of replacing the whole list. Removed rows can be reused when filters are cleared. The cache is bounded by the current catalogue and reset when published/local records are rebuilt, so saved edits cannot reuse stale record content. Empty/loading/error panels still use their existing markup and recovery actions. Search matching, ranking, storage keys, and clipboard preparation are unchanged.

## Verification

The full `npm run quality` suite passes 72 tests, including 11 new scheduler and thumbnail regressions, plus CSV checks for all 231 published records, module/cache wiring, escaping and search ranking, storage rollback, clipboard behavior, shared assets, and workflow gates. Eight further browser DOM tests passed in Brave. Serve the repository locally and open `scripts/browser/catalogue-render.html` to exercise row reuse, relevance reordering, highlight-update callbacks, empty-panel recovery, and stale-record replacement against the browser's real DOM.

A local Brave comparison served the prior and optimized catalogue with caching disabled, using the same 1080-by-780 iframe. Both initially requested the same 25 images. Image resource body bytes fell from 1,117,089 to 176,373 (84.21% fewer bytes for that controlled set). This excludes the HTML, CSS, modules, fonts, and data; it is not a complete page-transfer or live-site timing claim.

A synthetic burst of 40 input events created 4,134 image nodes before the change and zero afterward, while retaining the same Adansonii photo element and applying the final query. Dispatching that burst took 110.5 ms before and 0.6 ms afterward; the latter defers actual rendering to the next animation frame, so those numbers must not be compared as total search latency or advertised as an equivalent speedup.

All 24 local browser assertions passed, including updated and cleared highlights, complete record counts, 11 materials/220 plants, composition stability and final-query application, original 560-by-560 photos in both dialogs, dialog focus recovery, missing-thumbnail fallback to the original, and no horizontal overflow in the catalogue, details, or viewer at an actual 360-pixel iframe width. The initial harness checked focus immediately after closing a dialog; it was corrected to wait for the asynchronous close event, then passed without changing production focus behavior.

A real click on Copy image in Brave, followed by a paste into an isolated local field, produced PNG image data at 560 by 560 pixels (427,438 bytes), confirming the original photo dimensions rather than the 160-pixel thumbnail.

Four further isolated local browser checks passed: a saved name updates the cached row, a saved image refreshes the thumbnail, reset cancels a pending search, and a custom external photo URL uses its original source. The fixture restored the local test origin's previous storage values afterward; the live site's saved data was not touched.

Sharp 0.35.5 was installed in an isolated temporary directory from npm, and all 214 derivatives were regenerated and validated with that installed version. The CSV workflow parsed successfully as YAML. The automatic CSV generation workflow has not yet run on GitHub with this change. Physical phones, real mobile networks, throttled-network/CPU traces, and live deployment are not covered by the local checks.

## Scoped Anti Slop delivery gate

The existing [catalogue design and accessibility baseline](catalogue-interface-qa.md) applies. The accepted cream/forest-green palette, Outfit type, real plant photography, spacing, controls, and ENERGY 2 / RHYTHM 2 / MOTION 1 direction remain unchanged. The smaller derivatives serve download size; row reuse serves interaction responsiveness. Neither adds decoration, animation, promotional text, fictional content, new controls, or new layout. Existing named native dialogs, focus styles, labels, polite result announcements, and photo failure feedback are retained. Performance claims in this report distinguish file sizes, controlled local measurements, and untested live/device behavior.

## Shared category selector

The follow-up desktop request uses the phone reference's paired up/down chevrons on the category selector at every viewport width. The native select, its existing label, menu options, filtering, disabled/loading state, focus outline, and single-category visibility behavior are preserved. A noninteractive SVG supplies the same closed-control indicator across operating systems; forced-colors mode restores the native indicator. The wrapper flexes beside the label on phones and fills the category column on desktop. The established control colors, border, radius, type, and minimum height remain unchanged. The arrow identifies the existing menu rather than adding a new action.

Verification: the full quality suite still passes all 72 tests. Sixteen local Brave assertions passed at 1080- and 360-pixel iframe widths, covering the associated label, paired noninteractive indicator, consistent appearance, all nine published category options plus All categories, no horizontal overflow, control fit/minimum height, filtering, and reset. A real keyboard selection in the desktop menu selected Trees and showed 28 of 231 records. Forced-colors fallback was reviewed in CSS but not exercised on a physical high-contrast device. The desktop preview is saved with the task's output artifacts.

## Phone filter labels

At widths below 640 CSS pixels, Search catalogue (including its Plants/Materials variants) and Category are visually hidden while their associated label elements remain accessible to screen readers. The category selector fills the space previously occupied by its inline label. At 640 pixels and wider the labels remain visible. Inputs, placeholders, native menu behavior, and the rest of the layout are unchanged.

Verification: the full quality suite still passes 72 tests. Forty-eight local Brave assertions passed at 320, 390, 639, 640, and 1080 pixels, checking the label visibility boundary, full-width phone dropdown, preserved labels/options, filtering/reset, touch target, and overflow. The 390-pixel phone preview was visually inspected and saved in the task output.

## Focus outlines after touch

The record sheet automatically focuses its heading and returns focus to the opener when closed. Browser focus-visible heuristics can carry the outline into those programmatic moves, producing the heading/row boxes reported in the phone screenshots. Focus placement and restoration remain intact. Record/photo headings are noninteractive focus destinations and no longer draw an outline. Pointer-down interactions suppress the focus-visible outline; Tab, Enter, Space, Escape, and navigation keys restore keyboard mode. This applies to touch, pen, and mouse without treating screen width as evidence of input method. Typing and browser shortcuts do not change that navigation mode.

The full quality suite passes 76 tests, including four input-modality regressions. A local Brave fixture at 390 pixels passed six assertions for heading focus, unoutlined record/photo titles, focus restoration after touching Close, unoutlined returned rows, and the retained keyboard focus rule. Real Tab and Escape presses then produced a visible 3px solid indicator on Close and the restored record row, respectively. A real pointer click reopened African Oil Palm without a heading box; the preview and browser evidence are saved in the task output. Native iPhone Safari and physical touch have not been retested in this environment.

This follows the [focus-visible specification](https://www.w3.org/TR/selectors/#the-focus-visible-pseudo) while retaining the existing dialog labels, keyboard order, and high-contrast keyboard indicator. The accepted design and its other colors and controls are unchanged.
