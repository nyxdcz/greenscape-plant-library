# Catalogue interface first pass

This change applies to the compact catalogue currently served by index.html. Its styles and behavior live in assets/css/catalogue.css and assets/js/catalogue.mjs; the older dashboard application remains separate.

## Design decisions

Reading this as a practical nursery catalogue for staff, in the existing cream-and-forest-green visual language: ENERGY 2 / RHYTHM 2 / MOTION 1.

- Retain the cream surfaces and green actions to keep the catalogue's existing identity and let plant photography carry the character.
- Retain Outfit because its rounded letterforms match the existing approachable product style.
- Keep the compact list and current navigation. This pass repairs the dialogs and feedback states; it does not restore the older dashboard.
- Use a native modal dialog to keep the background inert and keyboard navigation inside the open task.
- Keep a header and action footer outside the scrolling region so plant identity, Close, Save, and Cancel remain reachable in short windows.
- Group fields by identity, classification, photo, and size because those are distinct editing decisions.
- Use darker input borders to make control boundaries visible against the cream surface.
- Use text for loading and failure feedback, with no invented progress percentages or decorative animation.
- Keep individual image dimensions reserved while loading or showing a fallback so rows do not jump.

## Behavior

The initial page has a loading message. The module loads the existing versioned data.js file, distinguishes failure from an empty catalogue or empty search, and offers retry. A request taking longer than twelve seconds also exposes retry. The CSV sync script continues to update the data-source reference in index.html.

Plant details open at the top with the identity heading focused. Close returns focus to the originating row, including after a successful save has rebuilt the list. Escape from an existing plant's editor returns to its details; Escape from an unsaved Add form or from details closes the dialog.

Add/Edit has explicit titles, required-name feedback, individual size labels, contextual Remove labels, and image-input guidance. Saves are explicitly described as device-local. A storage failure leaves the form and draft in place and offers Retry save. In-memory records update only after storage accepts the write. Invalid existing saved data is left untouched and is not silently replaced by a save.

The storage keys and saved record shape remain compatible with existing compact-catalogue edits and additions. There are no new runtime dependencies.

## Checks

Run `npm run test:catalogue` for syntax checks and storage behavior tests, including failure rollback, retry, existing records, malformed storage, denied storage, and empty names.

Run `npm test` for 16 catalogue entry-point regression tests and repository validation. Run `npm run quality` for the full import, synchronization, lint, storage-test, validation, build, and audit sequence.

The entry page declares `data-app="catalogue"`. Validation requires the actual catalogue entry module, stylesheet, storage import, current data revision, labeled controls, named native dialog, and loading/live regions. It syntax-checks the imported module graph and rejects missing dependencies, stale cache combinations, remote data sources, and imports outside the project.

The original entry page was missing its canonical URL, description, noindex policy, and referrer policy; those metadata omissions are repaired. Dashboard-only page assertions now apply when the dashboard entry is served. The shared security/data checks and the older dashboard's JavaScript/CSS asset assertions still run for the compact catalogue. This resolves the CI mismatch without restoring unused dashboard markup or disabling repository validation.
