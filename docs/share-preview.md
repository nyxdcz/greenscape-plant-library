# Website sharing preview

Prepared on 21 October 2026 in response to the Messenger screenshot showing an enlarged, cropped header wordmark. The entry page previously provided no Open Graph or Twitter image metadata, leaving clients to select an image themselves. The screenshot is consistent with selection of the narrow header logo; Messenger's internal selection was not inspected.

## Current card

`index.html` now declares a title, description, canonical sharing URL, site name, image URL, image dimensions/type, and descriptive alternative text in its initial HTML. Open Graph and Twitter metadata refer to the same absolute HTTPS PNG URL. This follows the [Open Graph protocol](https://ogp.me/).

The public asset is `assets/images/greenscape-share-card-v1.png`, an opaque sRGB image measuring 1200 by 630 pixels. As requested, the artwork contains only the actual Greenscape logo, centered at its native 600 by 70 pixels. No title or subtitle is drawn into the image. The wide canvas provides space around the complete logo instead of asking sharing clients to crop the narrow original. Page titles and descriptions remain available as ordinary sharing metadata.

The editable composition is `assets/images/greenscape-share-card.svg`. Its local logo reference must be embedded when rasterizing with Sharp: read `greenscape-logo.png` as base64, replace `xlink:href="greenscape-logo.png"` in memory with `xlink:href="data:image/png;base64,..."`, render the SVG at its intrinsic size, flatten over `#0b4632`, and export PNG. The bundled authoring runtime supplied Sharp; no package or runtime service was added to the website. Both source and rendered asset are committed. Future artwork updates should use a new versioned PNG filename and update all sharing image references together.

Design direction continues the approved forest-green catalogue: ENERGY 2 / RHYTHM 2 / MOTION 1. Green provides brand continuity and the existing white logo is the sole focal point. Centering the intact logo on a wide canvas protects its proportions and gives sharing clients space around it. There is no additional type, animation, gradient, shadow, decorative icon, or invented plant photography.

## Verification and publication

- `npm run quality` passed all 45 tests (19 catalogue/storage, 19 entry, 7 sharing), CSV synchronization for 231 records, lint, 1,010 shared/legacy-asset assertions, static build validation, and audit.
- Sharing regression tests reject absent or duplicate metadata, inconsistent card fields, a stale canonical sharing URL, relative/remote/outside-project image URLs, a missing asset, non-PNG content, mismatched dimensions, and the original narrow header logo. The same image/header validation runs during the static build.
- Sharp decoded the rendered PNG as 1200 by 630, sRGB, three channels, and no alpha. The rendered card was visually inspected for a complete centered wordmark, spacing, and clipping. White against brand green exceeds 10:1 contrast.
- `git diff --check` passed. Catalogue body markup, CSS, JavaScript, data, and storage behavior were not changed in this pass.

The new metadata and asset must be published before a sharing service can fetch them. Actual Messenger rendering and its cached previews have not been verified. An already-sent message is not guaranteed to update. The new versioned asset URL helps distinguish this artwork from earlier image URLs, but it cannot force a service to refresh its cached page metadata.

## Scoped Anti Slop delivery gate

This gate covers the new static share graphic and metadata. Existing interactive behavior retains the separately documented [catalogue gate](catalogue-interface-qa.md); this pass makes no new claims of device or keyboard testing.

- R-01 PASS: solid brand green with the existing white logo, no gradients.
- R-02 PASS: graphic and sharing copy contain no em dash.
- R-03 PASS: inspected 1200-by-630 graphic has no clipped logo; it stays within the center 600 pixels. Actual client crops remain service-controlled.
- R-04 PASS: no decorative icons added.
- R-05 PASS: composition contains only the requested logo.
- R-06 PASS: original wordmark retained with no additional type.
- R-07 PASS: no background pattern.
- R-08 PASS: no decorative arrows.
- R-09 PASS: no badges.
- R-10 PASS: opaque solid surface, no glass.
- R-11 PASS: no new interface radii; outer card shape belongs to the sharing client.
- R-12 PASS: no shadows.
- R-13 PASS: no glows.
- R-14 PASS: no feature-card grid.
- R-15 PASS: no invented CTA or action added to the graphic.
- R-16 PASS: no marketing copy appears in the graphic; sharing metadata describes the actual catalogue.
- R-17 PASS: no statistics shown.
- R-18 PASS: no testimonials or people added.
- R-19 PASS: static PNG, no animation.
- R-20 PASS: approved green and actual Greenscape lettering identify the brand.
- R-21 PASS: this branded artwork adds no website theme.
- R-22 PASS: no unrelated illustration.
- R-23 PASS: user's reported sharing problem authorizes the replacement composition; the existing logo is reused intact.
- R-24 PASS: canonical URL and local image path are checked by validation.
- R-25 PASS: white logo against green exceeds 10:1 contrast.
- R-26 PASS: the graphic introduces no interactive controls.
- R-27 PASS: no application state or loading path changed.
- R-28 PASS: no FAQ added.
- R-29 PASS: existing green and white logo only.
- R-30 PASS: composition follows the actual brand and requested link-card purpose.
- R-31 PASS: palette, typography, hierarchy, margins, and image sizing have written reasons above.
- R-32 PASS: no keyboard behavior changed; descriptive image alternative text is supplied.
- R-33 PASS: source authored directly; in-memory logo embedding only rasterizes the authored SVG.
- R-34 PASS: no new theme or toggle.
- R-35 PASS: static build and all tests pass; rendered output decoded and visually inspected. Messenger remains an explicit publication verification gap.
- R-36 PASS: no security, compliance, performance, or customer claims.
- R-37 PASS: approved catalogue direction and dials retained.
- R-38 PASS: existing brand and real catalogue subject only.
- Liveliness PASS: declared dials remain restrained; the logo is the sole focal point, centered whitespace protects its proportions, and brand green carries identity.
- C-1 PASS: every major composition decision has a stated purpose.
- C-2 PASS: static asset and absolute metadata references resolve in repository validation.
- C-3 PASS: only the requested existing logo appears in the image.
- C-4 PASS: wide opaque raster and centered safe content reduce crop sensitivity; no unverified Messenger result is claimed.
- C-5 PASS: artwork and metadata contain no invented product claims.
