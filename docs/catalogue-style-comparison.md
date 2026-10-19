# Catalogue style comparison

The user requested both an Anti Slop refinement and a deliberately AI-styled version on 19 October 2026. The comparison is available at `style-comparison.html`; `index.html` continues to open the refined catalogue.

## Refined catalogue

Design Read: a working nursery catalogue for identifying plants and materials, using Greenscape's cream surfaces, forest-green actions, real wordmark, and photographs. ENERGY 2 / RHYTHM 2 / MOTION 1.

The additional review found two factual labeling problems and one control-visibility issue:

1. The catalogue knows recorded sizes, not current stock. Row counts and detail/form headings now say recorded sizes rather than implying availability.
2. Landscape material descriptions such as Concrete were labeled Scientific name. Material records now have Material information, Description, Name, and Record code labels as appropriate; descriptions use upright text. Identical description/material values appear once. Existing stored values and keys are preserved. The form's secondary-field label updates when its category changes.
3. Copy, Close, and secondary form controls now have explicit contrasting boundaries, using the existing control-border token.

The cream/green palette and list composition remain deliberate: staff can scan names, categories, sizes, and codes with several records visible. The updated copy names facts the catalogue actually contains. The photo caption is omitted when no photo has been recorded.

## Deliberate AI-style demo

Design Read: an explicitly requested style experiment on the same working catalogue. ENERGY 3 / RHYTHM 2 / MOTION 1.

The dark purple/cyan gradient, oversized gradient heading, glass surfaces, glowing primary action, pill controls, capsule codes, and repeated photo cards intentionally demonstrate the visual vocabulary the Anti Slop guidance normally filters. These choices serve the user's comparison request. This demo is not presented as an Anti Slop-compliant design or an AI-powered product. It adds no invented features, stock information, statistics, or testimonials, and it has no perpetual animation.

The comparison embeds the actual `index.html` and loads a scoped stylesheet in that same-origin frame. Switching styles changes a body class and preserves the search, record data, and open dialog. Both views use the same browser-local storage. The normal catalogue does not load the comparison module or demo stylesheet; the current data revision and app markup have one source.

## Checks and scope

- Both style selectors work by click and Enter, expose their pressed state, update the frame title/status, and preserve a filtered result set while switching.
- Search, reset, details, copy, material editing, category-label changes, unsaved cancellation, and Escape were exercised in the comparison. Copying Material returned Concrete, and copying the 20 cm size retained its value and returned the expected clipboard text.
- The AI card list had no horizontal overflow at measured frame widths of 360, 769, and 1910 CSS pixels; the intermediate width used two columns. Narrow modal checks used a measured 599-pixel frame with a scrollable body and visible footer. The native preview resized its embedded modal viewport during testing, so a 360-pixel modal check is not claimed for this demo.
- The original refined catalogue's broader responsive and failure-state checks remain recorded in `catalogue-interface-qa.md` and `catalogue-visual-polish.md`.
- Checked demo contrast ratios: muted text on the purple background 8.02:1; control boundaries against the card surface 5.64:1; accent text on chips 6.52:1; dark text against the purple end of the primary gradient 12.23:1. Image fallback text uses the existing dark muted color on white. Brand text explicitly uses the light ink color.
- The comparison module passes `node --check`. The complete `npm run quality` sequence passes its existing 26 tests, validation, build, import/sync/lint checks, and audit. The audit's byte accounting does not include `.mjs` modules and is not performance evidence.
- The automated browser reported MutationObserver errors without a source URL while inspecting the embedded preview. None of the shipped comparison, catalogue, or storage modules instantiates MutationObserver. The exercised controls remained functional; an independent-browser console check is still appropriate, and an error-free comparison console is not claimed.
- This is browser-based verification. Physical-device keyboard behavior, screen-reader speech, actual 200% zoom, and a real on-screen keyboard remain untested.

The [scoped Anti Slop gate](catalogue-interface-qa.md) applies to the refined catalogue. The demo's deliberate visual departures are the requested comparison, not changes to the default product direction.
