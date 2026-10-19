# Catalogue visual polish

Implemented and checked on 19 October 2026. This builds on the compact catalogue's dialog and recovery fixes.

## Design read

Reading this as a working nursery catalogue for people identifying plants and preparing landscape plans, using the approved cream-and-forest-green palette and real plant photography: ENERGY 2 / RHYTHM 2 / MOTION 1.

## Decisions

- The forest-green brand strip uses the existing Greenscape wordmark to give the catalogue a recognizable owner without introducing new artwork.
- The wider desktop list exposes category, size count, and code because these distinguish records before opening details.
- Larger square thumbnails support visual identification; the detail photo uses `object-fit: contain` to show the full reference image.
- A consistent row structure supports scanning 231 records; the details panel changes to a photo-and-information composition because identification and copying are different tasks.
- Outfit and italic botanical names preserve the established catalogue's typographic character.
- Visible filter labels explain the controls, and the search hint names all three supported fields: common name, scientific name, and code.
- Sticky filters keep search and category reachable in a long catalogue; Reset filters clears both and returns focus to search.
- The introduction stays short so browsing remains the main task. Add plant is labeled explicitly instead of relying on a plus sign.
- Plant information and Available sizes are separate sections because sizes are repeated values with their own copy actions.
- Image reference uses a native disclosure to keep a long technical URL out of the initial details view while preserving its copy action.
- The mobile list stacks identity and classification beside the photo; desktop column headings appear only where there is room for columns.
- Rem-based spacing separates the header, filters, rows, and detail groups; solid surfaces and varied corner radii distinguish controls, photos, lists, and dialogs.
- The original fixed light theme remains part of the approved cream catalogue direction. No animation, decorative shadows, generated imagery, or new runtime dependency is added.

## Behavior and verification

The underlying 231 published records, local storage format, data revision, and CSV source remain unchanged. Result counts and size counts derive from the current records, including local additions. Missing scientific names, codes, photos, and sizes have explicit text rather than fabricated values.

Browser checks covered name/code search, combined search and category filtering, both Reset filters controls, zero results, long plant names, multiword categories, material records without sizes, the full-photo details layout, edit/cancel, Escape, and focus restoration. The Image reference disclosure responds to Enter. Copying common name, material, image reference, and a size produced the expected clipboard text; size feedback changes only the Copy label and preserves the displayed size. Background catalogue controls are excluded from the accessibility tree while the native modal is open.

The longest published common name, Variegated Ficus triangularis, was checked at 360 CSS pixels. Details had no horizontal body overflow at 360 x 780 and 389 x 843. Editing had no horizontal page/body overflow at 769 x 769 and 1024 x 360; the short-window body remained scrollable with its header and action footer visible. The ordinary desktop layout was checked at 1910 x 1075. These are measured browser viewport dimensions, not claims about physical devices.

An isolated loopback fixture repeated required-name validation, storage-quota failure, draft preservation, Retry save, successful feedback, and the missing-photo state under the new styles. Retry produced one sample and a total of 232 fixture records; it did not alter the normal preview or published data. This fixture is outside the repository and is not shipped.

`npm run quality` passes all import/sync/lint checks, 10 storage tests, 16 entry-point regression tests, repository validation (1,010 shared/legacy-asset checks), build validation, and the static audit. The normal preview produced no console errors or warnings. The audit's older byte accounting omits `.mjs` files, so it is not performance evidence.

The [delivery gate and broader failure-state verification](catalogue-interface-qa.md) cover this pass and the earlier behavior fixes. Physical-device keyboard behavior, screen-reader speech, and actual 200% zoom remain untested. The twelve-second slow-request branch is source-reviewed; HTTP-failure retry was exercised in the earlier pass.
