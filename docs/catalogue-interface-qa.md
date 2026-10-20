# Catalogue interface verification

Verified locally on 18 October 2026 and extended for the visual polish on 19 October 2026. This report covers the compact catalogue, not the older dashboard application. The [visual polish notes](catalogue-visual-polish.md) record the current design decisions and additional browser checks.

The subsequent [two-style comparison](catalogue-style-comparison.md) records an additional refinement: factual recorded-size labels, accurate material labels, and explicit secondary-control boundaries. This gate applies to the refined catalogue at `index.html`. The separately requested AI-style demo is an intentional visual counterexample with its own documented checks and scope.

The [20 October browsing refinements](catalogue-browsing-refinements.md) add compact mobile spacing, type filters, ranked/highlighted search, Copy record, and an enlarged photo dialog. The current full quality run includes 19 storage/record tests and 19 entry-point tests. The scoped PASS findings below continue to apply, with the new evidence in that note.

## Executed checks

- `npm run test:catalogue`: 10 tests passed, including save rollback, retry without duplicate additions, denied storage, malformed data preservation, legacy records, and optional-field defaults.
- `npm test`: 16 entry-point regression tests passed, followed by the catalogue page contract and 1,010 shared/legacy-asset assertions in the polished entry.
- Plant import check, CSV sync check, and JavaScript lint passed as the initial stages of `npm run quality`. The 231 published records remain synchronized.
- `npm run audit` completed. Its older asset accounting does not include the new .mjs files, so its byte counts are not used as performance evidence.
- `git diff --check` passed.
- Browser search by code, category filtering, zero results, reset, Add/Edit, field entry, size addition/removal, required-name feedback, cancellation, Escape, Close, all copy-field action types, and successful saves were exercised.
- A temporary loopback-only fixture simulated quota failure, catalogue HTTP failure, malformed catalogue data, an empty catalogue, unreadable saved data, denied storage, and a missing image. The fixture is outside the repository and is not shipped.
- A failed save preserved the draft and left the catalogue at 231 records; Retry save succeeded and produced exactly one test addition. A subsequent edit succeeded. The sample lived only in fixture memory.
- Catalogue HTTP failure displayed Retry loading; retry restored 231 records and search focus. Empty and malformed catalogue responses had distinct empty/error states.
- Keyboard focus started on the details heading. Tabbing from the last action returned to dialog controls rather than the background. Close restored the source row, including after a save rebuilt it; Add/Cancel and Add/Escape restored Add plant.
- The browser reported no console errors or warnings on the normal preview. Deliberate fixture failures generated expected network errors only in the fixture.
- Measured form layout sizes: 360 × 780, 389 × 843, 769 × 769, and 1024 × 360 CSS pixels. All had no horizontal page overflow, a visible header/footer, and a usable scrolling body. Details were also checked at 1024 × 576 and the normal desktop viewport.
- The polish adds the existing wordmark, desktop record columns, larger photos, visible filter labels, a skip link, grouped details, size-copy buttons, and an image-reference disclosure. New reset controls, Enter on the disclosure, copy feedback that preserves size text, long-name wrapping, material records without sizes, and the updated required-name/quota-retry flow were exercised. Responsive details and editing were checked again at the sizes documented in the visual polish notes.

## Repository-wide CI validation

`npm run quality` now passes the complete import, CSV sync, lint, storage tests, entry-point regression tests, repository validation, static build validation, and audit sequence.

The CI failure was caused by four missing metadata fields and 37 page requirements tied to the older dashboard. The canonical URL, description, noindex policy, and referrer policy are restored. Of the dashboard requirements, 34 markup/cache assertions now apply only to a served dashboard entry; three mixed checks retain their JavaScript/permission assertions while applying the HTML portion to the appropriate entry. All shared data/security and legacy JavaScript/CSS asset checks continue to run.

The catalogue has its own entry-point checks for module syntax and dependency resolution, local/versioned data, stylesheet/cache coherence, labeled controls, a native dialog and resolvable title, and loading/live regions. Sixteen regression cases demonstrate that missing or malformed modules, stylesheet/data/cache errors, remote or escaping imports, mixed application entries, and missing accessibility hooks are rejected. Unknown or missing entry selection still fails validation rather than silently skipping both application contracts.

Real-device keyboard behavior, screen-reader speech, and actual 200% browser zoom were not tested. Dynamic viewport units, scrollable form content, rem-based controls, semantic labels, and native modal behavior are implemented, but those device-specific checks remain appropriate before a production release. The twelve-second slow-request retry branch is source-reviewed; recovery through the same retry control was exercised using an HTTP failure.

## Scoped Anti Slop delivery gate

- R-01 PASS: existing cream surfaces and green primary actions retain the catalogue identity; no gradients or glows were added.
- R-02 PASS: application HTML, CSS, and modules contain no em-dash text.
- R-03 PASS: the measured narrow and short layouts above had no page overflow and retained visible dialog actions.
- R-04 PASS: no new icon set was added; the existing search glyph and Add mark retain their direct functions.
- R-05 PASS: the screen remains a plant list, and form groups follow the actual stored record fields.
- R-06 PASS: Outfit is retained for continuity with the existing approachable catalogue; botanical names remain italic.
- R-07 PASS: no decorative background pattern is present.
- R-08 PASS: no decorative button arrows were added.
- R-09 PASS: no promotional badges were added.
- R-10 PASS: the interface uses solid surfaces and a modal backdrop, with no glass effects.
- R-11 PASS: inputs/buttons use 0.5rem radii, thumbnails 0.4rem, lists/detail photos 0.75rem, and detail dialogs 1.25rem. The full-screen photo viewer has square edges to use the viewing area.
- R-12 PASS: no decorative component shadows were added.
- R-13 PASS: no glow effects are present.
- R-14 PASS: the repeated list rows represent equal catalogue records; no feature-card system was introduced.
- R-15 PASS: actions name their work: Add size, Save plant, Retry save, Retry loading, Close, and Cancel.
- R-16 PASS: added UI copy describes local saves, fields, loading, and recovery without marketing claims; size counts say recorded rather than implying live stock.
- R-17 PASS: result counts come from the actual filtered records; no invented statistics were added.
- R-18 PASS: no testimonials or fictional people were introduced.
- R-19 PASS: there is no new animation; only hover/focus feedback is used.
- R-20 PASS: the existing nursery palette, real plant photographs, and botanical naming remain the visual identity.
- R-21 PASS: the existing fixed light theme is retained for continuity with the approved cream catalogue direction.
- R-22 PASS: no unrelated illustrations were added.
- R-23 PASS: the existing wordmark and plant photos are reused; the visual changes follow the approved catalogue-polish scope.
- R-24 PASS: the new skip link resolves to the real catalogue section; there are no placeholder destinations.
- R-25 PASS: checked text ratios are 13.92:1 (body/paper), 5.12:1 (muted/paper), 5.74:1 (muted/card), 4.90:1 (muted/chip), 7.13:1 (error/card), 10.59:1 (primary text/button), and 10.98:1 (search highlights). Input and secondary-control boundaries use the same token, at 3.86:1 against the card surface.
- R-26 PASS: the new controls and existing catalogue action types were exercised in the browser, including type filtering, summary copy, photo enlarge/zoom/close, retry, individual copy, cancellation, and form saves.
- R-27 PASS: initial loading, empty catalogue, zero results, load failure, image failure, storage-read warning, and failed-save recovery have explicit text states.
- R-28 PASS: no FAQ was introduced.
- R-29 PASS: cream surfaces and forest green remain the main palette; a restrained brown-red is used only for textual errors.
- R-30 PASS: the existing catalogue layout was preserved rather than replaced with another product's design.
- R-31 PASS: the first-pass and visual polish notes record the purpose of palette, typography, layout, photo sizing, spacing, field grouping, controls, and state feedback.
- R-32 PASS: native modal containment, heading focus, Escape, visible focus indicators, size labels, keyboard photo panning, and focus restoration from the photo viewer to details and from details to its source control were verified.
- R-33 PASS: changes are authored directly in HTML, CSS, and modules; no source-rewriting feature scripts are shipped.
- R-34 PASS: the only shipped theme is the existing light theme, checked in the preview.
- R-35 PASS: the actual local app was run and exercised; storage/entry-point tests and the full CI command passed, and the normal-preview console was clear.
- R-36 PASS: no security, compliance, performance, or customer claims were added.
- R-37 PASS: the accepted direction preserves the existing nursery catalogue style; the Design Read is recorded in the implementation note.
- R-38 PASS: production content comes from the existing catalogue; QA sample data exists only in a temporary fixture.
- Liveliness PASS: ENERGY 2 / RHYTHM 2 / MOTION 1 are explicit; plant identity is the dialog focal point, spacing groups form tasks, forest green marks the primary action, and real plant photography supplies the repeated identity motif.
- C-1 PASS: the implementation note gives a purpose for each major visual decision.
- C-2 PASS: controls provide working behaviors and visible feedback; no feature placeholders were added.
- C-3 PASS: the list and form sections follow the catalogue data and editing task.
- C-4 PASS: tested responsive, loading, empty, failure, cancellation, and keyboard paths remain usable within the stated verification limits.
- C-5 PASS: catalogue facts and result counts are derived from existing records, with no fabricated product claims.
