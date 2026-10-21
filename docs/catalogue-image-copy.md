# Copy catalogue photographs

Implemented on 22 October 2026 following the request to add a copy button for images.

## Behavior and design

Copy image is available below a loaded record photo beside Enlarge reference photo, and beside Zoom in in the enlarged viewer. It copies the photograph as PNG image data, preserving its full pixel dimensions. It does not copy the image URL, a screenshot of the page, the displayed crop, or a text summary. The existing image-link and record-copy actions remain separate.

The implementation fetches the source with normal CORS rules. Existing PNGs pass through; other supported browser image formats are decoded into a temporary canvas and exported to PNG. The object URL is released afterward. A 15-second fetch timeout prevents an unresponsive request from waiting indefinitely. No image proxy, dependency, new photo, or service is introduced.

The clipboard write starts directly during the click and receives a promise for the PNG. This retains the user gesture while image preparation finishes, as described in [WebKit's clipboard documentation](https://webkit.org/blog/10855/async-clipboard-api/). The [Clipboard API](https://developer.mozilla.org/en-US/docs/Web/API/Clipboard/write) requires a secure context and browser permission. The public site uses HTTPS; localhost supports development checks. Actual support and pasting into a particular destination application remain browser/application dependent.

While copying, the button says Copying image, is disabled against duplicate clicks, and exposes its busy state. A local status region announces preparation, success, or failure. On failure, Open original photo points to the captured source so the user can copy/save manually. Failure never reports success or silently substitutes a text link on the clipboard. Focus returns to the button when disabling it dropped focus, without interrupting another focused control. Detached dialogs do not receive focus.

Actions appear after the photo loads; an absent or failed photo has no usable copy action. The current photo source/name are captured before the asynchronous operation so a later record cannot substitute a different photo.

The approved cream/forest-green direction remains ENERGY 2 / RHYTHM 2 / MOTION 1. Copy image uses the existing secondary-button treatment because it acts on the photo; Copy record retains the primary footer action. Wrapping photo controls use the available width, and feedback stays next to the action. Existing contrast, focus, spacing, and dialog conventions are reused. Catalogue records, storage keys, and the centered header remain unchanged. Application/module/stylesheet cache keys advance together.

## Verification

- `npm run quality` passes 51 tests: 25 catalogue/storage/image tests and 26 entry/sharing tests, plus CSV sync for 231 records, lint, repository validation, static build validation, and audit.
- Six new tests verify immediate clipboard invocation before asynchronous preparation, waiting for the prepared PNG, unsupported API behavior, absent photos, preparation failure, denied access, and synchronous rejection followed by a rejected preparation promise. No text fallback is written.
- The local browser copied the actual Adansonii WebP from both details and the enlarged viewer. Pasting into an isolated local editable field produced a PNG of 560 by 560 pixels, matching the source dimensions, with 459,818 bytes in that paste check.
- Isolated local fixtures simulated rejected clipboard permission and a browser with no image-write API. Both showed the original-photo link and restored the Copy image control; denied access was checked in both dialogs. Fixtures are not shipped.
- Keyboard Enter activated copying, success was announced, and focus returned to Copy image. Escape from the enlarged viewer returned to Enlarge reference photo in the details dialog.
- At an actual 360-by-780 iframe viewport, details and the enlarged viewer had no horizontal document overflow. The details action measured approximately 320 by 44 CSS pixels, and the viewer action was about 46 pixels high with a roughly 548-pixel image stage. Copying succeeded in that narrow viewer. Browser viewport overrides were reset afterward.
- A record with no assigned image, Ponytail Palm, showed No photo available and no Copy image button. The image-error path also hides/disables image actions in source; a broken-image browser case was not newly exercised in this pass.
- `git diff --check` passes. The screenshot in the task's `output/interface-previews/copy-image-button.jpg` shows the actual local details panel and success message.

Physical iPhone/Android behavior, external-app pasting (including Messenger), and blocked cross-origin image hosts were not tested. The feature reports a failure and offers the source photo if those environments reject copying. This note covers local implementation evidence; publication follows merge.

## Scoped Anti Slop delivery gate

The [existing catalogue gate](catalogue-interface-qa.md) remains the baseline. These findings apply to the added image-copy behavior.

- R-01 PASS: existing solid secondary-button colors; no gradients added.
- R-02 PASS: new interface copy contains no em dash.
- R-03 PASS: actual 360-by-780 details/viewer checks retained controls with no horizontal overflow.
- R-04 PASS: the action uses a plain text label, with no new icon family.
- R-05 PASS: image actions sit with the image they operate on.
- R-06 PASS: existing Outfit typography is retained.
- R-07 PASS: no decorative background pattern added.
- R-08 PASS: no decorative button arrow added.
- R-09 PASS: no promotional badge added.
- R-10 PASS: no glass effect added.
- R-11 PASS: existing secondary-button radius reused.
- R-12 PASS: no component shadow added.
- R-13 PASS: no glow added.
- R-14 PASS: no feature cards added.
- R-15 PASS: Copy image and Open original photo name their actual actions.
- R-16 PASS: feedback describes preparation, copying, and manual recovery plainly.
- R-17 PASS: no statistics added to the interface.
- R-18 PASS: no fictional people or testimonials added.
- R-19 PASS: no animation added; native busy/disabled feedback shows progress.
- R-20 PASS: existing nursery palette and real catalogue photo remain the identity.
- R-21 PASS: existing theme selection remains unchanged.
- R-22 PASS: no unrelated illustration added.
- R-23 PASS: the user explicitly requested the image action; existing photographs are reused.
- R-24 PASS: the fallback uses the actual captured source URL.
- R-25 PASS: existing text, muted, forest, and control-border tokens are reused with baseline contrast evidence.
- R-26 PASS: both copy buttons were exercised, and a local paste confirmed PNG image data.
- R-27 PASS: preparation, successful copy, rejected copy, unsupported API, and absent-photo cases are covered.
- R-28 PASS: no FAQ added.
- R-29 PASS: no new palette color added.
- R-30 PASS: changes extend the existing catalogue layout.
- R-31 PASS: placement, secondary emphasis, wrapping, and feedback have reasons above.
- R-32 PASS: native buttons, busy state, local status regions, visible baseline focus, Enter, and focus recovery were checked.
- R-33 PASS: feature HTML/CSS/modules are authored directly; temporary QA fixtures do not patch production source.
- R-34 PASS: controls reuse existing shared theme tokens and secondary-button styles; no theme added.
- R-35 PASS: full quality command and actual browser copy/paste checks executed.
- R-36 PASS: no security, compliance, performance, or customer claims added.
- R-37 PASS: accepted direction and restrained dials retained.
- R-38 PASS: actual catalogue photographs and source dimensions supply the evidence.
- Liveliness PASS: image remains the focal point, secondary actions group below it, and green/cream and real photography retain the identity.
- C-1 PASS: the action's placement and feedback support the user's requested workflow.
- C-2 PASS: success is shown only after clipboard writing resolves; failure offers recovery.
- C-3 PASS: only image-specific controls/status are added.
- C-4 PASS: tested narrow, keyboard, absent-image, unsupported, and denied paths stay usable within the limits above.
- C-5 PASS: copied-image claims were verified by an actual local paste.
