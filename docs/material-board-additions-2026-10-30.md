# Material-board catalogue additions

Added 45 plant entries/forms and 10 landscape-material entries from the eight boards supplied on 30 October 2026. The catalogue increases from 231 to 286 records: 265 plants and 21 materials.

## Source and scope

Names and reference photos come from the supplied material boards. Photos were extracted from the photo areas of the boards and saved as WebP; no generative replacements or retouching were used. Original board files remain unchanged. Crop coordinates and source-file hashes are recorded in `data/material-board-additions-2026-10-30.json`.

These are catalogue references, not verified nursery stock or independent botanical identifications. No stock quantities, recorded sizes, growing requirements, prices, or maturity dimensions were invented. New plants keep the existing Plant reference Google fallback.

Existing categories are reused. Herbal plants use the closest existing Shrubs or Grasses & Groundcovers category and carry the Herbs tag; no new category was introduced.

Golden Pandakaki is recorded as the golden-foliage form shown on the board without inventing a cultivar name. Origano retains the board scientific label and a note that identity and photo need confirmation. Banana retains the scientific label on board 2 without inventing a cultivar. Board 2 Putat Tree (Barringtonia racemosa) is separate from the existing Bitoon Tree (Barringtonia asiatica).

## Deferred items

White Picara; Pitogo labelled Cycas rumphii; Calachuchi White labelled Plumeria alba; Peanut Creeper labelled Arachis glabrata; Silver Wall cultivar; Coconut/Dwarf Coconut variety; Golden Bamboo variety; generic Yucca; native Jatropha form; tree-form Bougainvillea; Angus Pot Xlarge. These need identity, variety, form, or size confirmation, or may duplicate existing records. Existing records for these were not edited.

The Ylang-Ylang / Alstonia scholaris board-label conflict was not imported as a new record.

## Plant codes

The repository automatic code generator adds suffixes when new names share an existing botanical code. Four existing records receive disambiguated codes; their record IDs, names, scientific names, images, and sizes remain unchanged.

| Existing record | Previous code | Updated code |
|---|---|---|
| Ponytail Palm | PBr | PBr-02 |
| Homalomena Red | HHr | HHr-03 |
| Dwarf Kamuning | DMp | DMp-02 |
| Balitbitan Tree | BCr | BCr-02 |

## Added records

| Name | Scientific name or material description | Category | Code |
|---|---|---|---|
| Alocasia | Alocasia macrorrhiza | Shrubs | AAm |
| Angel hand | Xiphidium caeruleum | Shrubs | AXc |
| Avocado Tree | Persea americana | Trees | APa |
| Banana | Musa × paradisiaca | Trees | BMp |
| Bay Bean Grass | Canavalia rosea | Grasses & Groundcovers | BCr-01 |
| Beach Naupaka | Scaevola taccada | Shrubs | BSt |
| Black pebbles | Black stone pebbles | Landscape Materials | MAT-018 |
| Boulders | Stone | Landscape Materials | MAT-020 |
| Calamansi | Citrus × microcarpa | Trees | CCm |
| Canna Lily | Canna indica | Shrubs | CCi |
| Chico | Manilkara zapota | Trees | CMz |
| Citronella | Cymbopogon nardus | Grasses & Groundcovers | CCn |
| Concrete movable bench | Concrete bench | Landscape Materials | MAT-019 |
| Dill | Anethum graveolens | Grasses & Groundcovers | DAg |
| Doña Aurora | Mussaenda philippica | Shrubs | DMp-01 |
| Exposed aggregate | Aggregate | Landscape Materials | MAT-014 |
| Exposed aggregate concrete | Concrete with exposed aggregate | Landscape Materials | MAT-015 |
| Fire Tree | Delonix regia | Trees | FDr |
| Golden Pandakaki | Tabernaemontana pandacaqui | Shrubs | GTp |
| Grass grid | Concrete grass paver | Landscape Materials | MAT-012 |
| Gravel | Gravel | Landscape Materials | MAT-021 |
| Green Crinum | Crinum asiaticum | Shrubs | GCa |
| Heliconia Lobster Claw | Heliconia rostrata | Shrubs | HHr-01 |
| Heliconia Tomato Red | Heliconia bihai | Shrubs | HHb |
| Hibiscus (assorted) | Hibiscus rosa-sinensis | Shrubs | HHr-02 |
| Kamias | Averrhoa bilimbi | Trees | KAb |
| Karagumoy | Pandanus simplex | Cycads, Agaves & Yuccas | KPs |
| Lemon Balm | Melissa officinalis | Grasses & Groundcovers | LMo |
| Lemon Bromeliad | Aechmea blanchetiana | Shrubs | LAb |
| Lemon Tree | Citrus × limon | Trees | LCl |
| Lemon Verbena | Aloysia citrodora | Shrubs | LAc |
| Madre de Cacao / Kakawate | Gliricidia sepium | Trees | MGs |
| Malunggay | Moringa oleifera | Trees | MMo |
| Mango | Mangifera indica | Trees | MMi |
| Nedra | Conocarpus erectus | Shrubs | NCe |
| Orchid Tree | Bauhinia variegata | Trees | OBv |
| Origano | Origanum vulgare | Grasses & Groundcovers | OOv |
| Pandanus | Pandanus tectorius | Cycads, Agaves & Yuccas | PPt |
| Pebbles stone | Stone | Landscape Materials | MAT-013 |
| Persian Shield | Strobilanthes dyerianus | Shrubs | PSd |
| Plumbago | Plumbago auriculata | Shrubs | PPa |
| Putat Tree | Barringtonia racemosa | Trees | PBr-01 |
| Red Button | Costus woodsonii | Shrubs | RCw |
| Riverstone | River stone | Landscape Materials | MAT-017 |
| Rondeleta | Rondeletia odorata | Shrubs | RRo |
| Rubra Grass | Imperata cylindrica | Grasses & Groundcovers | RIc |
| Sage | Salvia officinalis | Shrubs | SSo |
| Selloum | Thaumatophyllum bipinnatifidum | Shrubs | STb |
| Silver Button | Conocarpus erectus var. sericeus | Shrubs | SCe |
| Stepping stones | Stepping stone paver | Landscape Materials | MAT-016 |
| Swamp Palm | Mauritia flexuosa | Palms | SMf |
| Thyme | Thymus vulgaris | Shrubs | TTv |
| Tiring Bamboo | Bambusa blumeana | Bamboo | TBb |
| Traveller's Palm | Ravenala madagascariensis | Palms | TRm |
| Yellow Candle | Pachystachys lutea | Shrubs | YPl |

## Validation

The old validator required exactly 231 records. It now permits additions above the consolidated baseline and checks that published plant, material, and overall totals match the actual records. The duplicate-removal and retained-record guards remain in place.

Run `npm run quality`. The batch acceptance check additionally verifies 55 additions, unique IDs and codes, valid images, existing categories, empty unprovided sizes, and preservation of all existing record content apart from automatic code metadata and CSV row numbers.
