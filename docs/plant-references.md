# Plant references

Checked on 22 October 2026. The details panel replaces the raw Image reference / Image link accordion with a Plant reference section on phone and desktop. Read plant reference opens a researched information page and names its source. Search Google appears where no confident match was confirmed. Both actions open a new tab; their accessible names include the plant name and this behavior.

## Selection

All 220 published plant identities were searched against NParks Flora & Fauna Web. Candidate information pages were checked for their scientific identity and description or plant-care content. NC State Extension Plant Toolbox supplied additional matches where available. The resulting set has 117 references: 97 NParks Flora & Fauna Web pages, one NParks GardeningSG page, and 19 NC State Extension pages. The other 103 records use Google. The 11 landscape materials do not receive plant references.

The search and review inventory is [data/plant-reference-review.json](../data/plant-reference-review.json). It records each identity, decision, date, selected source and URL, or fallback reason. The runtime map is [catalogue-reference-data.mjs](../assets/js/catalogue-reference-data.mjs). No remote HTML, descriptions or photographs are copied into the application; links open the source's own page.

Unverified cultivars, colour/dwarf forms, conflicting common/scientific names, genus-only records, and missing matches retain the Google fallback. Song of India and Silver Bismarck use explicitly named source pages. Palmera and Manila Palm use pages that explicitly list the catalogue's scientific names as synonyms. Catalogue names, photos and source CSV records are not corrected or relabeled by this work. Matching a named source page does not authenticate the existing photograph or guarantee nursery stock identification.

For example, [NParks' Silver Bismarck page](https://www.nparks.gov.sg/florafaunaweb/flora/2/6/2600) explicitly names the silver form. The generic species page was not substituted for an unconfirmed colour form. [NC State's Palmera reference](https://plants.ces.ncsu.edu/plants/chrysalidocarpus-lutescens/) documents Dypsis lutescens as a former name.

## Runtime behavior and maintenance

Reference lookup requires the record ID, common name and scientific name to match the reviewed identity. Case and repeated whitespace are ignored. A name or scientific-name edit switches to Google rather than retaining a stale source. Changes only to sizes or photos retain the checked identity. New/custom records get Google automatically. Google queries combine the current common name, scientific name if present, and the word plant using URLSearchParams. No browsing history or local record data is sent until the user follows that external link.

References are independent of image availability. The original photograph, enlargement and Copy image are retained. The photo editor's filename/URL field remains available because it controls the actual photograph. The runtime makes no reference-provider API requests and performs no remote searches automatically. The two small static reference modules share the entry page's cache tag.

To curate additional records, verify an appropriate information page from a botanical authority, check the named form or documented synonym where needed, and add the exact catalogue identity, HTTPS page URL, source label and review date to the runtime map and inventory together. Uncertain records can remain on Google. External pages can change after the review date; links are not monitored in the browser.

## Verification

The full npm run quality suite passes 87 tests, including 11 reference tests for identity changes, safe query encoding, prototype-like IDs, missing names/photos, materials, uncertain forms, documented synonyms, allowed HTTPS sources and inventory consistency. The existing CSV, thumbnail, module/cache graph, storage, image clipboard, workflow and build checks pass.

In local Brave, 37 browser assertions passed at 320, 390, 640 and 1080 CSS pixels. They cover source attribution, exact link destinations, safe new tabs, accessible names, minimum 44-pixel button height, overflow, removal of raw image-link UI, Google fallback queries, references without photos, original photo/Copy image availability, materials, saved identity changes and new records containing punctuation and markup-like text. The test origin's prior local storage was restored afterward. The first fixture run reopened a dialog before its asynchronous close cleanup; waiting for cleanup fixed the test harness without changing production modal code.

These are local browser and source checks. Physical-device behavior and live deployment of this branch are not verified. Source pages were reviewed as public botanical references; source statements are not republished as Greenscape-authored care advice.

## Interface scope

The selected Anti Slop refinement remains in place: cream and forest green, Outfit type, real catalogue photos, existing detail sections and button styling. The new link uses the existing Ghost control treatment with a 44-pixel minimum target. Native keyboard navigation, visible keyboard focus, pointer focus suppression, named dialogs and sticky actions remain intact. This change adds one useful reference action per plant without new decorative elements.
