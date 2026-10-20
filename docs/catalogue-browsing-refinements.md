# Catalogue browsing refinements

Implemented and verified on 20 October 2026, following the user's selection of the Anti Slop refinement and approval of the five proposed improvements.

## Design decisions

Reading this as a working nursery catalogue for identifying plants and preparing landscape plans, in the approved cream-and-forest-green visual language: ENERGY 2 / RHYTHM 2 / MOTION 1.

- The narrow header puts the title and Add action on one row and omits the explanatory introduction because getting to the records matters more on a phone.
- The All / Plants / Materials controls expose the actual collection types and their counts; category options follow the selected type, and Add/Edit labels name the current record type.
- Exact code, name, and scientific-name matches precede prefixes and partial matches. Warm highlights show the literal match without introducing another accent color family.
- Larger mobile metadata supports reading categories, sizes, and codes; type controls retain approximately 44-pixel touch targets.
- Square thumbnails contain the full source photograph, avoiding arbitrary crops. Details offer an enlarged native photo dialog with fit, two-times zoom, scrolling, keyboard panning, and a reachable Close action.
- Copy record assembles the actual names, code, category, optional material, and recorded sizes as plain text for schedules or messages. Individual copy actions remain available.
- The new record helper holds the search/ranking, safe highlighting, type matching, and summary formatting so those behaviors can be verified without browser storage or DOM fixtures.

## Behavior

Type selection retains a search term and retains a selected category only when it exists in that type. When a type has fewer than two categories, its redundant category chooser is hidden and search uses the full width. Reset filters restores All, clears the category/search, and focuses search. Counts derive from actual records; the published catalogue contains 220 plants and 11 materials. Add material starts in Landscape Materials, and changing a form's category updates its identity label, title, and Save action without changing entered values.

Copy record omits absent optional fields and does not duplicate identical description/material text. Missing sizes are explicitly Not recorded. The existing clipboard fallback remains available, and feedback restores the original Copy or Copy record label.

The photo viewer opens only after a reference photo loads successfully. Escape or Close photo returns to the same details panel and its enlarge control. Zoom confines two-axis panning to the photo area, leaving the document free of horizontal overflow. The photo title and controls stay outside that scrolling area.

All 231 published records and their data revision remain unchanged. Seventeen records have no assigned photograph; their existing fallbacks remain because no replacement was verified. No images, libraries, or runtime services were added. Browser-local storage keys and record shape remain compatible.

## Verification

- `npm run quality` passes 19 storage/search/summary tests, 19 entry-point regression tests, import and CSV synchronization checks, lint, 1,010 shared/legacy-asset validations, static build validation, and audit.
- New tests cover exact-match priority, case/whitespace normalization, intersecting scope/category/search filters, material search, stable alphabetical results without source mutation, literal highlighting with escaped HTML, punctuation queries, and accurate plain-text summaries. Entry checks reject missing record helpers, photo dialogs, and incomplete type controls.
- Browser checks exercised All/Plants/Materials, compatible category options, Add material defaults, required-name validation, empty results, both reset controls, ranked/highlighted search, plant/material summaries, edit/cancel, and individual copy actions.
- The enlarged photo was checked in fit and zoomed states, including keyboard horizontal panning, Zoom out, Close photo, Escape, and return of focus to Enlarge reference photo. A layout check caught an intrinsic-image grid sizing problem; explicit constrained grid tracks now keep the fit image inside the viewing area.
- At a measured 360 x 780 CSS pixels, the first row began at about 391 pixels and three records were visible; the page had no horizontal overflow and the type controls measured approximately 101 x 44 pixels. A second narrow check at 358 pixels also had no horizontal overflow.
- At 1024 x 360 CSS pixels, details and editing retained visible action footers and scrolling bodies. The photo viewer retained its title and a 185-pixel image stage without document overflow. Ordinary desktop browsing and details were checked at 1910 x 1075.
- An isolated loopback fixture exercised material validation, a quota failure, draft preservation, successful retry, failed-image fallback, summary copy, and counts. Retry created one sample, with 12 materials out of 232 total fixture records. The sample existed only in fixture memory; normal preview data was unchanged. The temporary fixture is not shipped.
- Search-highlight text contrast is 10.98:1. Existing body, muted, action, and control-border pairings remain as documented in the scoped gate.

The older static audit omits `.mjs` files from its byte accounting; its totals are not performance evidence. Physical-device keyboard behavior, screen-reader speech, actual 200% browser zoom, and the on-screen keyboard remain untested. Earlier loading/storage failure coverage is recorded in `catalogue-interface-qa.md`; the load path remains unchanged in this pass.

The [scoped Anti Slop delivery gate](catalogue-interface-qa.md) covers the current refined catalogue. The separately requested style comparison remains available, with compatible type controls, highlights, and photo-dialog colors.
