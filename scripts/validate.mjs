import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = relativePath => fs.readFileSync(path.join(root, relativePath), 'utf8');
const exists = relativePath => fs.existsSync(path.join(root, relativePath));
const failures = [];
const check = (condition, message) => {
  if (!condition) failures.push(message);
};

const html = read('index.html');
const readme = read('README.md');
const styles = read('assets/css/styles.css');
const maintenanceStyles = read('assets/css/maintenance.css');
const sidebarAssistantStyles = read('assets/css/sidebar-assistant.css');
const plantLibraryStyles = read('assets/css/plant-library-refinements.css');
const workflow = read('.github/workflows/ci.yml');
const syncScript = read('scripts/sync_plants_from_csv.mjs');
const jsPaths = [
  'assets/js/app.js',
  'assets/js/data.js',
  'assets/js/quotation.js',
  'assets/js/boq.js',
  'assets/js/boq-enhancements.js',
  'assets/js/project-costing.js',
  'assets/js/maintenance-config.js',
  'assets/js/maintenance-force.js',
  'assets/js/maintenance.js',
  'assets/js/magnetic-dock.js',
  'assets/js/sidebar-assistant.js'
];
const jsSources = Object.fromEntries(jsPaths.map(file => [file, read(file)]));

for (const [file, source] of Object.entries(jsSources)) {
  try {
    new vm.Script(source, { filename: file });
  } catch (error) {
    failures.push(error.message);
  }
}

check(!/<style\b/i.test(html), 'index.html should not contain inline style blocks.');
check(!/<script(?![^>]*\bsrc=)[^>]*>/i.test(html), 'index.html should not contain inline executable scripts.');
check(Buffer.byteLength(html) < 20_000, 'index.html should remain below 20 KB.');
check(/<link\s+rel="canonical"/i.test(html), 'A canonical URL is required.');
check(/<meta\s+name="description"\s+content="[^"]{70,180}"/i.test(html), 'Meta description should be 70–180 characters.');
check(/<meta\s+name="robots"\s+content="noindex/i.test(html), 'The internal site must retain its noindex policy.');
check(/<meta\s+name="referrer"\s+content="strict-origin-when-cross-origin"/i.test(html), 'A strict referrer policy is required.');
check(!/GREENSCAPE_[A-Z0-9_]+_(?:START|END)|MOODBOARD_BULK_ADD_SEARCH_FIT_(?:START|END)/.test(html), 'Empty historical marker comments should be removed.');

const externalScripts = [...html.matchAll(/<script\b[^>]*\bsrc="[^"]+"[^>]*>/gi)];
const scriptsWithoutDefer = externalScripts.filter(match => !/\bdefer\b/i.test(match[0]));
check(scriptsWithoutDefer.length === 0, `${scriptsWithoutDefer.length} external script tag(s) are missing defer.`);

const renderedMarkup = `${html}\n${Object.values(jsSources).join('\n')}`;
const buttonsWithoutType = [...renderedMarkup.matchAll(/<button\b[^>]*>/gi)]
  .filter(match => !/\btype\s*=/.test(match[0]));
check(buttonsWithoutType.length === 0, `${buttonsWithoutType.length} button template(s) are missing an explicit type.`);

const unsafeBlankLinks = [...renderedMarkup.matchAll(/<a\b[^>]*\btarget="_blank"[^>]*>/gi)]
  .filter(match => !/\brel="[^"]*noopener[^"]*"/i.test(match[0]));
check(unsafeBlankLinks.length === 0, `${unsafeBlankLinks.length} external link template(s) open a new tab without rel="noopener".`);

check(/class="brand-logo-official"[^>]*\bwidth="\d+"[^>]*\bheight="\d+"/i.test(html), 'The sidebar logo must declare intrinsic dimensions.');
check(/id="toastRoot"[^>]*\baria-live="polite"[^>]*\baria-atomic="true"/i.test(html), 'Toast announcements must be polite and atomic.');
check(!jsSources['assets/js/app.js'].includes('.moodboard-page-toolbar > strong'), 'Mood board labels should be omitted at render time, not removed by an observer.');
check(jsSources['assets/js/app.js'].includes('MAX_IMAGE_FILE_BYTES = 20 * 1024 * 1024'), 'Image uploads must retain the 20 MB size limit.');
check(jsSources['assets/js/app.js'].includes('MAX_EXCEL_FILE_BYTES = 10 * 1024 * 1024'), 'Excel imports must retain the 10 MB size limit.');
check(/const safeText = \/\^\[\\s\]\*\[=\+\\-@\\t\\r\]\//.test(jsSources['assets/js/app.js']), 'CSV exports must guard against spreadsheet formula injection.');
check(jsSources['assets/js/app.js'].includes('loading="${index < 3 ? \'eager\' : \'lazy\'}"'), 'Only the first visible Plant Library row should load eagerly.');
check(jsSources['assets/js/app.js'].includes('decoding="async"'), 'Rendered images should use asynchronous decoding.');
check(jsSources['assets/js/app.js'].includes('GREENSCAPE_DIALOG_KEYBOARD_SUPPORT_START'), 'Shared dialog keyboard support is required.');
check(jsSources['assets/js/app.js'].includes('ensureProjectToolsLoaded()'), 'Project-only tools must use the deferred feature loader.');
check(!/(?:quotation|boq|boq-enhancements|project-costing)\.(?:css|js)[^"]*"[^>]*(?:rel="stylesheet"|defer)/i.test(html), 'Project-only CSS and JavaScript must not block the initial page.');
check(/aria-label="View details for \$\{escapeHTML\(plant\.commonName/i.test(jsSources['assets/js/app.js']), 'Plant detail actions must include the plant name in their accessible label.');
check(styles.includes('REPOSITORY_QUALITY_REVIEW_V2_TOUCH_TARGETS_START'), 'Touch target safeguards are required.');
check(/permissions:\s*\n\s+contents:\s+read/.test(workflow), 'Website Checks must use read-only repository permissions.');
check(/timeout-minutes:\s*10/.test(workflow), 'Website Checks must have a bounded timeout.');

const dashboardSlides = [...jsSources['assets/js/app.js'].matchAll(/'(assets\/images\/dashboard-slideshow\/[^']+\.jpg)'/g)]
  .map(match => match[1]);
check(new Set(dashboardSlides).size === 15, 'The Dashboard slideshow must contain 15 unique images.');
for (const slide of new Set(dashboardSlides)) {
  check(exists(slide), `Missing Dashboard slideshow image: ${slide}`);
  check(exists(slide.replace(/\.jpg$/i, '-900.jpg')), `Missing responsive Dashboard slideshow image: ${slide}`);
}
check(jsSources['assets/js/app.js'].includes("matchMedia('(prefers-reduced-motion: reduce)')"), 'The Dashboard slideshow must respect reduced-motion preferences.');
check(jsSources['assets/js/app.js'].includes('DASHBOARD_HERO_INTERVAL_MS = 3000'), 'The Dashboard slideshow must advance every three seconds.');
check(jsSources['assets/js/app.js'].includes('DASHBOARD_HERO_SIZES'), 'The Dashboard slideshow must provide responsive image sizes.');
check(styles.includes('.hero-photo.is-active'), 'The Dashboard slideshow crossfade style is required.');
check(/rel="preload"[^>]*dashboard-slideshow\/01-david-genelhu\.jpg[^>]*imagesrcset=/i.test(html), 'The first Dashboard slideshow image must have a responsive preload.');

const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map(match => match[1]);
const duplicateIds = ids.filter((id, index) => ids.indexOf(id) !== index);
check(duplicateIds.length === 0, `Duplicate static IDs: ${[...new Set(duplicateIds)].join(', ')}`);

const staticReferences = [...html.matchAll(/(?:src|href)="([^"#]+)"/g)]
  .map(match => match[1].split('?')[0])
  .filter(value => value && !/^(?:https?:|mailto:|data:)/i.test(value) && !value.includes('${'));

for (const reference of new Set(staticReferences)) {
  check(exists(reference), `Missing local asset: ${reference}`);
}

try {
  const manifest = JSON.parse(read('site.webmanifest'));
  check(Boolean(manifest.name && manifest.short_name && manifest.start_url), 'Manifest is missing required app metadata.');
  for (const icon of manifest.icons || []) {
    check(exists(icon.src), `Missing manifest icon: ${icon.src}`);
  }
} catch (error) {
  failures.push(`Invalid site.webmanifest: ${error.message}`);
}

check(exists('robots.txt'), 'robots.txt is required.');
check(/Disallow:\s*\//i.test(read('robots.txt')), 'robots.txt must match the internal noindex policy.');
check(exists('.gitignore') && /^\.env(?:\.\*)?$/m.test(read('.gitignore')), '.gitignore must exclude environment files.');

check(exists('data/Greenscape_Plant_Library.csv'), 'The Google Sheets plant CSV is required.');
check(exists('scripts/sync_plants_from_csv.mjs'), 'The plant CSV sync script is required.');
check(exists('.github/workflows/sync-plant-csv.yml'), 'The Plant CSV Sync workflow is required.');
check(jsSources['assets/js/app.js'].includes('maintenanceModeAtStartup'), 'Maintenance mode must identify the published-data startup path.');
check(jsSources['assets/js/app.js'].includes("document.documentElement.classList.contains('maintenance-enabled')"), 'Maintenance mode must select published GitHub plant data before read-only access opens.');
check(!jsSources['assets/js/app.js'].includes('maintenanceReadOnlyAtStartup'), 'Maintenance startup must not depend on the late body read-only class.');
check(
  jsSources['assets/js/app.js'].includes("plantsSourceRevision: 'greenscape-plant-library-plants-source-revision-v1'"),
  'Maintenance and staff modes must share a revision-scoped plant catalogue snapshot.'
);
check(
  jsSources['assets/js/app.js'].includes('storedPlantSourceRevision === publishedPlantSourceRevision'),
  'Maintenance must ignore browser plant snapshots from older published catalogue revisions.'
);
check(
  jsSources['assets/js/app.js'].includes('synchronizedMaintenancePlantRecords'),
  'Maintenance and staff modes must initialize from the same synchronized plant records.'
);
check(
  jsSources['assets/js/app.js'].includes('localStorage.setItem(STORAGE.plantsSourceRevision'),
  'Staff plant edits must be saved with the active published catalogue revision.'
);
check(
  /"sourceRevision":"[a-f0-9]{12}"/.test(jsSources['assets/js/data.js']),
  'Published plant metadata must include a stable CSV source revision.'
);
check(
  syncScript.includes("const DATA_SCHEMA_VERSION = 'catalogue-sync1'"),
  'Plant data cache versions must include the catalogue synchronization schema.'
);
check(jsSources['assets/js/app.js'].includes("const maintenanceReadOnly = document.body.classList.contains('maintenance-readonly');"), 'Plant List editing controls must be hidden during maintenance.');
check(!jsSources['assets/js/maintenance.js'].includes("'export-excel',"), 'Excel export must remain blocked during maintenance.');
check(
  /codeHash:\s*'[a-f0-9]{64}'/.test(jsSources['assets/js/maintenance-config.js']),
  'Maintenance staff access must store a SHA-256 hash instead of a readable code.'
);
check(
  !Object.values(jsSources).some(source => source.toLowerCase().includes('greenscapeco')),
  'The readable maintenance access code must not be committed to JavaScript.'
);
check(
  jsSources['assets/js/maintenance.js'].includes("window.crypto.subtle.digest('SHA-256'"),
  'Maintenance staff access must verify the code with Web Crypto SHA-256.'
);
check(
  jsSources['assets/js/maintenance.js'].includes('window.sessionStorage'),
  'Maintenance staff authorization must be limited to browser session storage.'
);
check(
  jsSources['assets/js/maintenance.js'].includes("const maintenanceLockedViews = new Set(['sheet', 'moodboard', 'projects'])"),
  'Maintenance staff access must remain scoped to the three approved workspaces.'
);
check(
  jsSources['assets/js/app.js'].includes('maintenanceAccessIsAuthorized'),
  'App navigation must respect the verified maintenance staff session.'
);
check(
  jsSources['assets/js/maintenance.js'].includes('!staffWorkspaceIsActive()'),
  'Maintenance data writes must remain scoped to verified staff workspaces.'
);
check(
  plantLibraryStyles.includes('GREENSCAPE_PHONE_VIEW_ONLY_ACTION_V1_START')
    && plantLibraryStyles.includes('.maintenance-readonly #plantGrid .plant-card-actions')
    && plantLibraryStyles.includes('grid-template-columns: minmax(0, 1fr) !important;'),
  'Phone Plant Library cards must use a single full-width action column.'
);
check(
  /#plantGrid \.plant-card-actions \.plant-add-list,[\s\S]*?#plantGrid \.plant-list-actions \.plant-add-list\s*\{[\s\S]*?display:\s*none\s*!important/.test(plantLibraryStyles),
  'Add to List must be hidden in phone Grid and List views.'
);
check(
  /#plantGrid \.plant-card-actions \.plant-view-details,[\s\S]*?#plantGrid \.plant-list-actions \.plant-view-details\s*\{[\s\S]*?min-height:\s*44px\s*!important/.test(plantLibraryStyles),
  'The phone View action must retain a 44px minimum touch target.'
);
check(
  /@media\s*\(max-width:\s*760px\)[\s\S]*?#maintenanceReadonlyBanner\s*\{[\s\S]*?display:\s*none\s*!important/.test(maintenanceStyles),
  'The floating maintenance status must be hidden on phone screens.'
);
check(
  html.includes('maintenance.css?v=20260731-phone-dock-maintenance1')
    && html.includes('plant-library-refinements.css?v=20260731-phone-library-refinement2'),
  'Phone Plant Library and maintenance styles must use the current cache key.'
);
check(
  !/(?:^|})\s*\.maintenance-staff-authorized\s*(?:,|\{)/m.test(maintenanceStyles),
  'The body authorization class must not receive startup-panel layout styles.'
);
check(
  jsSources['assets/js/maintenance.js'].includes('class="maintenance-staff-access-active"'),
  'The authorized startup panel must use a class distinct from the body authorization state.'
);
check(
  jsSources['assets/js/maintenance.js'].includes('class="maintenance-startup-pet"'),
  'The maintenance startup must place Greenie in a dedicated bottom container.'
);
check(
  jsSources['assets/js/maintenance.js'].includes('assets/images/greenscape-pet-jumping-happy.gif'),
  'The maintenance startup must use the approved happy-jumping Greenie animation.'
);
check(
  !jsSources['assets/js/maintenance.js'].includes('Your saved browser records remain unchanged.'),
  'The removed browser-record status sentence must not return.'
);
check(
  !(jsSources['assets/js/maintenance.js'].match(/<div class="maintenance-startup-actions">([\s\S]*?)<\/div>/)?.[1] || '')
    .includes('maintenance-startup-pet'),
  'Greenie must not share the maintenance primary-action row.'
);
check(
  maintenanceStyles.includes('.maintenance-startup-pet'),
  'The bottom maintenance Greenie requires responsive styling.'
);
check(jsSources['assets/js/app.js'].includes('assignBotanicalPlantCodes'), 'Automatic botanical plant-code assignment is required.');
check(jsSources['assets/js/app.js'].includes('codeConflict'), 'Same-initial plant codes must expose their conflict state.');
check(jsSources['assets/js/app.js'].includes('codeIncomplete'), 'Incomplete scientific names must expose a warning state.');
check(jsSources['assets/js/app.js'].includes("scientific[0]?.[1]"), 'One-word scientific names must use the genus second letter.');
check(syncScript.includes("scientific[0]?.[1]"), 'CSV synchronization must use the one-word genus second-letter rule.');
check(styles.includes('.plant-code.duplicate-code'), 'Same-initial plant codes must have a red Library and Detail state.');
check(styles.includes('.plant-code.incomplete-code'), 'Incomplete plant codes must have an amber warning state.');
check(jsSources['assets/js/app.js'].includes('function effectivePlantTags(plant)'), 'Plant details and searches must use automatic effective tags.');
check(jsSources['assets/js/app.js'].includes('function firstDescriptionSentence(value)'), 'Overview descriptions must support first-sentence extraction.');
check(jsSources['assets/js/app.js'].includes('function effectivePlantingNotes(plant)'), 'Planting notes must use the overview fallback helper.');
check(jsSources['assets/js/app.js'].includes('manualNotes || firstDescriptionSentence(plant?.overviewDescription)'), 'Manual planting notes must take priority over an overview description.');
check(!jsSources['assets/js/app.js'].includes('class="plant-badges"'), 'Plant Library cards must not render tag badges.');
check(jsSources['assets/js/app.js'].includes('class="detail-tags"'), 'Automatic tags must remain visible in Plant Detail.');
check(!styles.includes('.plant-badge'), 'Unused Plant Library badge styling should be removed.');
check(jsSources['assets/js/app.js'].includes('cardColors: {}'), 'Mood boards must store per-plant card color overrides.');
check(jsSources['assets/js/app.js'].includes('function safeMoodboardHexColor(value)'), 'Mood board colors must be validated before use in inline styles.');
check(jsSources['assets/js/app.js'].includes('function moodboardTextColor(background)'), 'Custom mood board colors must receive contrast-aware text.');
check(jsSources['assets/js/app.js'].includes('data-moodboard-color'), 'Selected mood board plants must expose an accessible color control.');
check(jsSources['assets/js/app.js'].includes("data-action=\"moodboard-reset-color\""), 'Mood board color overrides must provide an automatic-color reset.');
check(styles.includes('.moodboard-picker-color-controls'), 'Mood board color controls require responsive picker styling.');
check(
  /class="plant-card-body">[\s\S]{0,260}class="plant-common-name"[\s\S]{0,260}class="scientific"[\s\S]{0,260}class="plant-code-body"[\s\S]{0,260}class="plant-meta"/.test(jsSources['assets/js/app.js']),
  'Grid cards must render common name, scientific name, code, then sizes.'
);
check(
  /class="plant-list-copy">[\s\S]{0,300}class="plant-common-name"[\s\S]{0,300}class="scientific"[\s\S]{0,300}class="plant-code-body"[\s\S]{0,300}class="plant-list-size"/.test(jsSources['assets/js/app.js']),
  'List cards must render common name, scientific name, code, then sizes.'
);
check(
  plantLibraryStyles.includes('@media (min-width: 1600px)')
    && plantLibraryStyles.includes('@media (min-width: 1181px) and (max-width: 1599px)'),
  'Plant card columns must preserve readable actions at medium desktop widths.'
);
check(
  plantLibraryStyles.includes('#plantGrid .plant-card-actions .plant-view-details > span')
    && plantLibraryStyles.includes('overflow-wrap: normal;'),
  'Plant card action labels must not break letter by letter.'
);
check(
  /plant-library-refinements\.css\?v=20260731-phone-library-refinement2/.test(html)
    && /app\.js\?v=20260731-greenie-scroll-loading1/.test(html),
  'Plant card layout and phone-action cache keys must be current.'
);
check(!jsSources['assets/js/sidebar-assistant.js'].includes('reorderPlantNames'), 'The sidebar assistant must not reorder Plant Library DOM nodes.');
check(!jsSources['assets/js/sidebar-assistant.js'].includes("qs('#pageContent')"), 'The sidebar assistant must not observe Plant Library content.');
check(
  sidebarAssistantStyles.includes('@media (min-width: 761px) and (max-width: 1023px)')
    && sidebarAssistantStyles.includes('body.sidebar-assistant-enhanced .sidebar-utility-section'),
  'Greenie must remain visible throughout the intermediate full-sidebar range.'
);
check(
  sidebarAssistantStyles.includes('@media (max-width: 760px)')
    && sidebarAssistantStyles.includes('body.sidebar-assistant-enhanced .sidebar-utility-section {\n    display: none !important;'),
  'Greenie must remain hidden when the phone glass dock replaces the sidebar.'
);
check(
  /sidebar-assistant\.css\?v=20260730-greenie-intermediate1/.test(html),
  'Intermediate Greenie visibility cache key must be current.'
);
check(styles.includes('GREENSCAPE_PHONE_GLASS_TAB_BAR_V1_START'), 'The small-phone shared glass tab bar styles are required.');
check(
  styles.includes('width: min(calc(100vw - 24px), 360px) !important;'),
  'The small-phone glass tab bar must remain responsive with a 360px maximum width.'
);
check(
  styles.includes('inset: auto auto calc(16px + env(safe-area-inset-bottom)) 50% !important;'),
  'The small-phone glass tab bar must preserve additive iPhone safe-area clearance.'
);
check(
  styles.includes('height: 64px !important;') && styles.includes('background: transparent !important;'),
  'The glass tab bar must use a compact shared shell with transparent inactive controls.'
);
check(
  jsSources['assets/js/magnetic-dock.js'].includes("const glassDockQuery = window.matchMedia('(max-width: 760px)')"),
  'Glass tab motion must use the full phone-navigation breakpoint.'
);
check(
  jsSources['assets/js/magnetic-dock.js'].includes("item.style.setProperty('--dock-scale', glassDockQuery.matches ? '.94' : '1')"),
  'Phone tab feedback must animate only the pressed control.'
);
check(
  jsSources['assets/js/magnetic-dock.js'].includes("button.setAttribute('aria-label', label)")
    && jsSources['assets/js/magnetic-dock.js'].includes('button.dataset.dockLabel = label'),
  'Phone dock utilities must retain accessible names when their visual labels are hidden.'
);
check(
  !jsSources['assets/js/magnetic-dock.js'].includes('feedbackToggle')
    && jsSources['assets/js/magnetic-dock.js'].includes('closeMoreMenu'),
  'The phone dock must retain More-menu behavior without a standalone Help utility.'
);
check(
  maintenanceStyles.includes('GREENSCAPE_PHONE_MAINTENANCE_BANNER_HIDE_V1_START')
    && /@media\s*\(max-width:\s*760px\)[\s\S]*?#maintenanceReadonlyBanner\s*\{[\s\S]*?display:\s*none\s*!important/.test(maintenanceStyles),
  'The maintenance and staff status must remain hidden when the phone glass tab bar is active.'
);
check(
  /styles\.css\?v=20260731-safe-cleanup1-3/.test(html)
    && /magnetic-dock\.js\?v=20260731-phone-dock-maintenance2/.test(html),
  'Phone Glass Tab Bar cache keys must be current.'
);
// DUPLICATE_PLANT_CONSOLIDATION_V1_VALIDATION
check(jsSources['assets/js/app.js'].includes('DUPLICATE_PLANT_CONSOLIDATION_V1_START'), 'Duplicate plant consolidation migration is required.');
check(jsSources['assets/js/app.js'].includes("'bam-012': 'bam-006'"), 'Variegated Bamboo duplicate migration is required.');
check(jsSources['assets/js/app.js'].includes("'bam-007': 'bam-008'"), 'Yellow Bamboo duplicate migration is required.');
check(jsSources['assets/js/app.js'].includes("'pal-025': 'pal-037'"), 'Bunga duplicate migration is required.');
check(jsSources['assets/js/app.js'].includes("'shr-035': 'shr-010'"), 'Golden Miagos duplicate migration is required.');
check(jsSources['assets/js/app.js'].includes('migrateDuplicateProjectRecords'), 'Saved project plant IDs must be migrated.');
check(jsSources['assets/js/app.js'].includes('migrateDuplicateMoodboardRecord'), 'Saved mood-board plant IDs must be migrated.');
check(syncScript.includes("'Overview Description'"), 'The Google Sheets CSV must include the Overview Description column.');
check(jsSources['assets/js/app.js'].includes("button.dataset.action = 'download-plant-image'"), 'The photograph overlay must remain the image-download control.');
check(!jsSources['assets/js/app.js'].includes('data-action="download-plant-image"'), 'Plant Detail must not render a duplicate image-download button in the modal footer.');
check(styles.includes('background: rgba(7, 60, 44, .90) !important;'), 'The photograph download control must retain a readable high-contrast background.');

try {
  const helperSource = jsSources['assets/js/app.js'].match(
    /  function firstDescriptionSentence\(value\) \{[\s\S]*?\n  \}\n\n  function effectivePlantingNotes\(plant\) \{[\s\S]*?\n  \}/
  )?.[0];
  check(Boolean(helperSource), 'The planting-note helper functions must remain testable.');
  if (helperSource) {
    const sandbox = {};
    vm.runInNewContext(`${helperSource}
      result = {
        first: firstDescriptionSentence('First verified sentence. Second sentence.'),
        manual: effectivePlantingNotes({ plantingNotes: 'Manual instruction.', overviewDescription: 'Overview fallback.' }),
        fallback: effectivePlantingNotes({ plantingNotes: '', overviewDescription: 'Overview fallback. More detail.' }),
        unpunctuated: effectivePlantingNotes({ overviewDescription: 'Short verified description' })
      };`, sandbox, { filename: 'planting-note-helpers.js' });
    check(sandbox.result.first === 'First verified sentence.', 'Overview planting notes must use only the first complete sentence.');
    check(sandbox.result.manual === 'Manual instruction.', 'Manual planting notes must override the overview fallback.');
    check(sandbox.result.fallback === 'Overview fallback.', 'An empty manual note must use the overview sentence.');
    check(sandbox.result.unpunctuated === 'Short verified description', 'A short unpunctuated overview must remain usable.');
  }
} catch (error) {
  failures.push(`Overview planting-note validation failed: ${error.message}`);
}

try {
  const sandbox = { window: {} };
  vm.runInNewContext(jsSources['assets/js/data.js'], sandbox, { filename: 'assets/js/data.js' });
  const plantData = sandbox.window.GREENSCAPE_PLANT_DATA;
  check(Array.isArray(plantData), 'Published plant data must be an array.');

  if (Array.isArray(plantData)) {
    check(plantData.every(plant => Object.hasOwn(plant, 'overviewDescription')), 'Every published record must include an Overview Description field.');
    const removedDuplicateIds = ['bam-012', 'bam-007', 'pal-025', 'shr-035'];
    const survivingDuplicateIds = ['bam-006', 'bam-008', 'pal-037', 'shr-010'];
    check(plantData.length === 231, `Published plant data must contain 231 consolidated entries, found ${plantData.length}.`);
    removedDuplicateIds.forEach(id => check(!plantData.some(plant => plant.id === id), `${id}: removed duplicate must not be published.`));
    survivingDuplicateIds.forEach(id => check(plantData.some(plant => plant.id === id), `${id}: surviving consolidated plant is required.`));
    const consolidatedById = new Map(plantData.map(plant => [plant.id, plant]));
    check(consolidatedById.get('bam-006')?.scientificName === "Bambusa multiplex 'Variegata'", 'Variegated Bamboo must retain the approved cultivar name.');
    check((consolidatedById.get('bam-006')?.sizes || []).length === 6, 'Variegated Bamboo must retain six merged size options.');
    check((consolidatedById.get('bam-008')?.sizes || []).length === 5, 'Yellow Bamboo must retain five merged size options.');
    check((consolidatedById.get('pal-037')?.sizes || []).length === 5, 'Bunga must retain five merged size options.');
    check((consolidatedById.get('shr-010')?.sizes || []).length === 7, 'Golden Miagos must retain seven merged size options.');
    const words = value => String(value || '').match(/[A-Za-z]+/g) || [];
    const baseCode = plant => {
      if (plant.category === 'Landscape Materials' || plant.isPlant === false) return '';
      const common = words(plant.commonName);
      const scientific = words(plant.scientificName);
      if (!common[0] || !scientific[0]) return '';
      const third = scientific[1]?.[0] || scientific[0]?.[1];
      return third
        ? `${common[0][0].toUpperCase()}${scientific[0][0].toUpperCase()}${third.toLowerCase()}`
        : '';
    };
    const groups = new Map();
    plantData.forEach(plant => {
      const base = baseCode(plant);
      if (!base) return;
      if (!groups.has(base)) groups.set(base, []);
      groups.get(base).push(plant);
    });

    const codeKeys = plantData.map(plant => String(plant.code || '').toLowerCase());
    check(new Set(codeKeys).size === codeKeys.length, 'Every published plant and material code must be unique.');

    plantData.forEach(plant => {
      const base = baseCode(plant);
      if (plant.category === 'Landscape Materials' || plant.isPlant === false) return;
      if (!base) {
        check(plant.codeIncomplete === true, `${plant.id}: incomplete scientific names must be marked.`);
        return;
      }
      const group = groups.get(base) || [];
      check(plant.codeBase === base, `${plant.id}: codeBase must match the botanical initials ${base}.`);
      if (group.length === 1) {
        check(plant.code === base, `${plant.id}: unique botanical code must be ${base}.`);
        check(plant.codeConflict === false, `${plant.id}: a unique botanical code must not be marked as a conflict.`);
      } else {
        check(new RegExp(`^${base}-\\d{2}$`).test(plant.code), `${plant.id}: same-initial code must use ${base}-NN.`);
        check(plant.codeConflict === true, `${plant.id}: same-initial code must be marked as a conflict.`);
      }
    });
  }
} catch (error) {
  failures.push(`Automatic botanical plant-code validation failed: ${error.message}`);
}

// GREENSCAPE_SHARED_DASHBOARD_LIBRARY_HEADER_V1_2_VALIDATION
check(
  styles.includes('GREENSCAPE_SHARED_DASHBOARD_LIBRARY_HEADER_V1_2_START')
    && /@media\s*\(min-width:\s*761px\)\s*and\s*\(max-width:\s*1180px\)[\s\S]*?body:has\(#plantGrid\)\s+\.topbar\s*\{[\s\S]*?min-height:\s*88px\s*!important;[\s\S]*?padding:\s*15px 24px 14px\s*!important;/.test(styles)
    && /body:has\(#plantGrid\)\s+\.topbar h1\s*\{[\s\S]*?font-size:\s*clamp\(28px,\s*3\.4vw,\s*34px\)\s*!important;/.test(styles),
  'Plant Library must mirror the Dashboard tablet header geometry.'
);
check(
  plantLibraryStyles.includes('GREENSCAPE_SHARED_HEADER_LIBRARY_OFFSET_V1_2_START')
    && plantLibraryStyles.includes('--library-sticky-top: 114px;')
    && plantLibraryStyles.includes('top: var(--library-sticky-top) !important;'),
  'The Plant Library sticky toolbar must remain below the standardized header.'
);
check(
  !/body:has\(#plantGrid\)\s+\.topbar\s*\{[\s\S]{0,180}?min-height:\s*82px\s*!important;/.test(plantLibraryStyles)
    && !/body:has\(#plantGrid\)\s+\.company-use-notice\s*\{[\s\S]{0,140}?padding:\s*8px 11px\s*!important;/.test(plantLibraryStyles),
  'Plant Library must not restore the previous desktop header or notice-card overrides.'
);
check(
  /@media\s*\(max-width:\s*760px\)[\s\S]*?body:has\(#plantGrid\)\s+\.topbar\s*\{[\s\S]*?min-height:\s*58px\s*!important;[\s\S]*?padding:\s*10px 13px 9px\s*!important;/.test(plantLibraryStyles)
    && /body:has\(#plantGrid\)\s+\.topbar h1\s*\{[\s\S]*?font-size:\s*25px\s*!important;/.test(plantLibraryStyles),
  'The existing phone Plant Library header must remain unchanged.'
);
check(
  html.includes('styles.css?v=20260731-safe-cleanup1-3')
    && html.includes('plant-library-refinements.css?v=20260731-phone-library-refinement2'),
  'Shared header styles must use the V1.2 cache key.'
);

// GREENSCAPE_DESKTOP_COMPACT_ADD_ACTION_V1_VALIDATION
check(
  plantLibraryStyles.includes('GREENSCAPE_DESKTOP_COMPACT_ADD_ACTION_V1_START')
    && plantLibraryStyles.includes('@media (min-width: 761px)')
    && plantLibraryStyles.includes('grid-template-columns: minmax(0, 1fr) 44px !important;'),
  'Tablet and desktop Plant Library actions must reserve a compact 44px Add column.'
);
check(
  plantLibraryStyles.includes('#plantGrid .plant-card-actions .plant-add-list > span')
    && plantLibraryStyles.includes('#plantGrid .plant-list-actions .plant-add-list > span')
    && /GREENSCAPE_DESKTOP_COMPACT_ADD_ACTION_V1_START[\s\S]*?\.plant-add-list > span[\s\S]*?display:\s*none\s*!important/.test(plantLibraryStyles),
  'Tablet and desktop Add to List text must be visually replaced by the plus icon.'
);
check(
  /GREENSCAPE_DESKTOP_COMPACT_ADD_ACTION_V1_START[\s\S]*?\.plant-add-list,[\s\S]*?width:\s*44px\s*!important;[\s\S]*?min-width:\s*44px\s*!important;[\s\S]*?min-height:\s*44px\s*!important;/.test(plantLibraryStyles),
  'The compact plus action must retain a 44px touch target.'
);
check(
  /@media\s*\(max-width:\s*760px\)[\s\S]*?#plantGrid \.plant-card-actions \.plant-add-list,[\s\S]*?#plantGrid \.plant-list-actions \.plant-add-list\s*\{[\s\S]*?display:\s*none\s*!important/.test(plantLibraryStyles),
  'Phone Plant Library cards must remain View-only.'
);
check(
  jsSources['assets/js/app.js'].includes('class="button primary small plant-add-list"')
    && jsSources['assets/js/app.js'].includes('data-action="add-to-project"')
    && jsSources['assets/js/app.js'].includes('aria-label="Add ${escapeHTML(plantName)} to list"'),
  'The compact plus button must preserve its Add-to-Project action and accessible plant label.'
);
check(
  /plant-library-refinements\.css\?v=20260731-phone-library-refinement2/.test(html),
  'Compact Add Button styles must use the current cache key.'
);

// GREENSCAPE_PLANT_INFORMATION_ORDER_V1_1_VALIDATION
check(
  plantLibraryStyles.includes('GREENSCAPE_PLANT_INFORMATION_ORDER_V1_1_START')
    && /#plantGrid \.plant-code-body\s*\{[\s\S]*?text-transform:\s*none\s*!important;/.test(plantLibraryStyles),
  'Plant codes must preserve their stored mixed capitalization.'
);
check(
  !jsSources['assets/js/app.js'].includes('class="plant-list-category"')
    && !plantLibraryStyles.includes('#plantGrid .plant-list-category'),
  'The duplicate List-view category text and unused styling must remain removed.'
);
check(
  jsSources['assets/js/app.js'].includes('class="category-pill"'),
  'Plant category pills must remain available on Plant Library images.'
);
check(
  /class="plant-list-copy">[\s\S]{0,320}class="plant-list-size"/.test(jsSources['assets/js/app.js'])
    && !/#plantGrid \.plant-list-size\s*\{\s*display:\s*none/.test(plantLibraryStyles),
  'Available sizes must remain visible within every List-view plant entry.'
);
check(
  plantLibraryStyles.includes('GREENSCAPE_DESKTOP_COMPACT_ADD_ACTION_V1_START')
    && plantLibraryStyles.includes('GREENSCAPE_PHONE_VIEW_ONLY_ACTION_V1_START'),
  'Compact tablet/desktop Add actions and phone View-only behavior must remain unchanged.'
);
check(
  html.includes('plant-library-refinements.css?v=20260731-phone-library-refinement2')
    && html.includes('app.js?v=20260731-greenie-scroll-loading1'),
  'Plant information order assets must use the current V1.1 cache keys.'
);

// GREENSCAPE_PLANT_INFORMATION_SPACING_V1_3_VALIDATION
check(
  plantLibraryStyles.includes('GREENSCAPE_PLANT_INFORMATION_SPACING_V1_3_START')
    && plantLibraryStyles.includes('#plantGrid .plant-card h2.plant-common-name,')
    && plantLibraryStyles.includes('margin-bottom: 2px !important;'),
  'Plant common names must use the final compact spacing override.'
);
check(
  plantLibraryStyles.includes('#plantGrid .plant-card .scientific,')
    && plantLibraryStyles.includes('min-height: 0 !important;')
    && plantLibraryStyles.includes('margin: 0 !important;'),
  'Scientific names must use the final zero-height and zero-margin override.'
);
check(
  plantLibraryStyles.includes('#plantGrid .plant-card .scientific + .plant-code-body,')
    && plantLibraryStyles.includes('margin-top: 2px !important;'),
  'Plant codes must remain closely grouped beneath scientific names.'
);
check(
  plantLibraryStyles.includes('#plantGrid .plant-card .plant-meta {')
    && plantLibraryStyles.includes('margin-top: 12px !important;')
    && plantLibraryStyles.includes('#plantGrid .plant-list-copy .plant-list-size {'),
  'Available sizes must retain the larger Grid and List separation.'
);
check(
  plantLibraryStyles.includes('GREENSCAPE_PLANT_INFORMATION_ORDER_V1_1_START')
    && plantLibraryStyles.includes('GREENSCAPE_DESKTOP_COMPACT_ADD_ACTION_V1_START')
    && plantLibraryStyles.includes('GREENSCAPE_PHONE_VIEW_ONLY_ACTION_V1_START'),
  'Information order, compact Add actions, and phone View-only behavior must remain unchanged.'
);
check(
  html.includes('plant-library-refinements.css?v=20260731-phone-library-refinement2'),
  'Plant information spacing styles must use the V1.3 cache key.'
);

// GREENSCAPE_INTERMEDIATE_VIEW_ONLY_V1_VALIDATION
check(
  plantLibraryStyles.includes('GREENSCAPE_INTERMEDIATE_VIEW_ONLY_V1_START')
    && plantLibraryStyles.includes('@media (max-width: 1200px)'),
  'The intermediate View-only responsive override is required.'
);
check(
  /GREENSCAPE_INTERMEDIATE_VIEW_ONLY_V1_START[\s\S]*?grid-template-columns:\s*minmax\(0,\s*1fr\)\s*!important;/.test(plantLibraryStyles),
  'Plant card actions must use one full-width column at 1200px and below.'
);
check(
  /GREENSCAPE_INTERMEDIATE_VIEW_ONLY_V1_START[\s\S]*?\.plant-add-list,[\s\S]*?data-action="add-to-project"[\s\S]*?display:\s*none\s*!important;/.test(plantLibraryStyles),
  'Add actions, including maintenance-mode actions, must remain hidden at 1200px and below.'
);
check(
  /GREENSCAPE_INTERMEDIATE_VIEW_ONLY_V1_START[\s\S]*?\.plant-view-details[\s\S]*?width:\s*100%\s*!important;[\s\S]*?min-height:\s*44px\s*!important;/.test(plantLibraryStyles),
  'View must fill the action row and retain its 44px touch target.'
);
check(
  plantLibraryStyles.includes('GREENSCAPE_DESKTOP_COMPACT_ADD_ACTION_V1_START')
    && plantLibraryStyles.includes('@media (min-width: 761px)')
    && plantLibraryStyles.includes('grid-template-columns: minmax(0, 1fr) 44px !important;'),
  'The compact Add action must remain defined for layouts above the View-only override.'
);
check(
  plantLibraryStyles.includes('GREENSCAPE_PLANT_INFORMATION_SPACING_V1_3_START')
    && plantLibraryStyles.includes('GREENSCAPE_PHONE_VIEW_ONLY_ACTION_V1_START'),
  'Plant information spacing and the existing phone safeguard must remain unchanged.'
);
check(
  html.includes('plant-library-refinements.css?v=20260731-phone-library-refinement2'),
  'Intermediate View-only styles must use the current cache key.'
);

// GREENSCAPE_GREENIE_ONLY_HELP_V1_4_VALIDATION
check(
  !html.includes('id="feedbackToggle"')
    && !html.includes('feedback-launcher-label">Help')
    && !html.includes('feedback-beta-badge'),
  'The standalone Help BETA launcher must be removed from every static view.'
);
check(
  html.includes('id="feedbackPanel"')
    && html.includes('id="feedbackForm"')
    && html.includes('id="feedbackMessage"'),
  'The feedback dialog and form must remain available for Greenie.'
);
const greenieFeedbackControllerSource = jsSources['assets/js/app.js'].match(
  /GREENSCAPE_GREENIE_ONLY_HELP_V1_4_START([\s\S]*?)GREENSCAPE_GREENIE_ONLY_HELP_V1_4_END/
)?.[1] || '';

check(
  Boolean(greenieFeedbackControllerSource)
    && greenieFeedbackControllerSource.includes('window.GREENSCAPE_FEEDBACK')
    && !greenieFeedbackControllerSource.includes('feedbackToggle'),
  'The marked feedback controller must be programmatic and independent of the removed launcher.'
);
check(
  jsSources['assets/js/sidebar-assistant.js'].includes('GREENSCAPE_GREENIE_DIRECT_HELP_V1_4_START')
    && jsSources['assets/js/sidebar-assistant.js'].includes('window.GREENSCAPE_FEEDBACK')
    && !jsSources['assets/js/sidebar-assistant.js'].includes("qs('#feedbackToggle')"),
  'Greenie must open the feedback dialog directly.'
);
check(
  jsSources['assets/js/magnetic-dock.js'].includes('GREENSCAPE_PHONE_DOCK_NO_HELP_V1_1')
    && !jsSources['assets/js/magnetic-dock.js'].includes('feedbackToggle')
    && jsSources['assets/js/magnetic-dock.js'].includes('phoneDockIdentifierButton')
    && jsSources['assets/js/magnetic-dock.js'].includes('phoneDockMoreButton'),
  'Phone navigation must remove Help while preserving Identifier and More.'
);
check(
  jsSources['assets/js/maintenance.js'].includes("const label = authorized ? 'Staff tools unlocked' : 'Maintenance mode'")
    && jsSources['assets/js/maintenance.js'].includes("data-maintenance-state=\"${authorized ? 'staff-tools-unlocked' : 'maintenance-mode'}\"")
    && !jsSources['assets/js/maintenance.js'].includes("'#feedbackToggle'"),
  'Maintenance must expose explicit Maintenance mode and Staff tools unlocked states without Help.'
);
check(
  styles.includes('GREENSCAPE_GREENIE_ONLY_HELP_STYLE_V1_4_START')
    && maintenanceStyles.includes('GREENSCAPE_GREENIE_ONLY_HELP_MAINTENANCE_V1_4_START'),
  'Greenie-only Help and single-status-pill CSS safeguards are required.'
);
check(
  /@media\s*\(max-width:\s*760px\)[\s\S]*?#maintenanceReadonlyBanner\s*\{[\s\S]*?display:\s*none\s*!important/.test(maintenanceStyles),
  'The existing phone maintenance-banner safeguard must remain active.'
);
check(
  html.includes('maintenance.css?v=20260731-phone-dock-maintenance1')
    && html.includes('styles.css?v=20260731-safe-cleanup1-3')
    && html.includes('app.js?v=20260731-greenie-scroll-loading1')
    && html.includes('maintenance.js?v=20260731-greenie-only-help1-4')
    && html.includes('magnetic-dock.js?v=20260731-phone-dock-maintenance2')
    && html.includes('sidebar-assistant.js?v=20260731-greenie-only-help1-4'),
  'Greenie-only Help assets must use the current cache keys.'
);

// GREENSCAPE_SAFE_REPOSITORY_CLEANUP_V1_VALIDATION
const obsoleteHelpCssTokens = [
  '#feedbackToggle',
  '.feedback-help-icon',
  '.feedback-launcher-label',
  '.feedback-beta-badge',
  '.dock-utilities-attached',
  '.help-hidden-while-scrolling'
];

check(
  obsoleteHelpCssTokens.every(token => !styles.includes(token))
    && obsoleteHelpCssTokens.every(token => !maintenanceStyles.includes(token)),
  'Obsolete standalone-Help CSS selectors must remain removed.'
);
check(
  !jsSources['assets/js/app.js'].includes('feedbackToggle')
    && !jsSources['assets/js/app.js'].includes('Temporarily hide Help while scrolling')
    && jsSources['assets/js/app.js'].includes('window.GREENSCAPE_FEEDBACK'),
  'The unreachable Help-scrolling controller must remain removed without damaging Greenie feedback.'
);
check(
  !jsSources['assets/js/magnetic-dock.js'].includes('markUtility')
    && !jsSources['assets/js/magnetic-dock.js'].includes('unmarkUtility')
    && !jsSources['assets/js/magnetic-dock.js'].includes('dock-utilities-attached')
    && jsSources['assets/js/magnetic-dock.js'].includes('phoneDockIdentifierButton')
    && jsSources['assets/js/magnetic-dock.js'].includes('phoneDockMoreButton'),
  'Unused Help dock helpers must remain removed while Identifier and More stay available.'
);
check(
  styles.includes('#feedbackWidget > .feedback-panel[hidden]')
    && styles.includes('#feedbackWidget.is-feedback-open > .feedback-panel')
    && maintenanceStyles.includes('#maintenanceReadonlyBanner'),
  'Feedback-panel and maintenance-status styles must remain available.'
);
check(
  html.includes('maintenance.css?v=20260731-phone-dock-maintenance1')
    && html.includes('styles.css?v=20260731-safe-cleanup1-3')
    && html.includes('app.js?v=20260731-greenie-scroll-loading1')
    && html.includes('magnetic-dock.js?v=20260731-phone-dock-maintenance2'),
  'Safe-cleanup assets must use the current cache keys.'
);
check(
  readme.includes('### Safe Repository Cleanup V1')
    && readme.includes('Greenie Help assistant and feedback form'),
  'README must record the safe cleanup and current Help entry point.'
);


// GREENSCAPE_GREENIE_SCROLL_LOADING_V1_VALIDATION
const greenieScrollLoaderPath = 'assets/images/greenie/dig-to-plant.gif';
const greenieScrollLoaderBytes = exists(greenieScrollLoaderPath)
  ? fs.readFileSync(path.join(root, greenieScrollLoaderPath))
  : Buffer.alloc(0);
const greenieScrollLoaderHash = createHash('sha256')
  .update(greenieScrollLoaderBytes)
  .digest('hex');

check(
  exists(greenieScrollLoaderPath)
    && greenieScrollLoaderBytes.subarray(0, 6).toString('ascii') === 'GIF89a'
    && greenieScrollLoaderHash === '80f81c2cff5a86fa18974c455a6119e528bf3e55a4ec9246fecdfdbd8044875d',
  'The exact approved dig-to-plant Greenie GIF must remain unchanged.'
);
check(
  jsSources['assets/js/app.js'].includes('GREENSCAPE_GREENIE_SCROLL_LOADING_V1_START')
    && jsSources['assets/js/app.js'].includes('const LIBRARY_BATCH_SIZE = 48;')
    && jsSources['assets/js/app.js'].includes('new IntersectionObserver')
    && jsSources['assets/js/app.js'].includes('state.libraryLimit += LIBRARY_BATCH_SIZE;'),
  'Plant Library scrolling must load one protected 48-entry batch at a time.'
);
check(
  jsSources['assets/js/app.js'].includes('data-library-load-trigger')
    && jsSources['assets/js/app.js'].includes('assets/images/greenie/dig-to-plant.gif')
    && jsSources['assets/js/app.js'].includes('role="status" aria-live="polite" aria-atomic="true"')
    && jsSources['assets/js/app.js'].includes('Loading more plants'),
  'The exact Greenie loader and polite accessible status must remain in the Plant Library footer.'
);
check(
  jsSources['assets/js/app.js'].includes('data-action="load-more"')
    && jsSources['assets/js/app.js'].includes("if (action === 'load-more') requestLibraryBatch();")
    && jsSources['assets/js/app.js'].includes("typeof IntersectionObserver === 'undefined'"),
  'Show more must remain available as the keyboard and unsupported-browser fallback.'
);
check(
  plantLibraryStyles.includes('GREENSCAPE_GREENIE_SCROLL_LOADING_V1_START')
    && plantLibraryStyles.includes('#plantGrid .library-scroll-loader')
    && plantLibraryStyles.includes('image-rendering: pixelated;')
    && /prefers-reduced-motion:\s*reduce[\s\S]*?library-scroll-loader img[\s\S]*?display:\s*none/.test(plantLibraryStyles),
  'Greenie scroll-loading styles must remain scoped, pixel-crisp, and reduced-motion aware.'
);
check(
  html.includes('plant-library-refinements.css?v=20260731-phone-library-refinement2')
    && html.includes('app.js?v=20260731-greenie-scroll-loading1'),
  'Greenie scroll-loading assets must use the current cache keys.'
);
check(
  readme.includes('### Greenie Scroll Loading V1')
    && readme.includes('assets/images/greenie/dig-to-plant.gif'),
  'README must record the Greenie scroll-loading release and exact GIF asset.'
);


// GREENSCAPE_PHONE_DOCK_MAINTENANCE_STATUS_V1_VALIDATION
check(
  maintenanceStyles.includes('GREENSCAPE_NON_PHONE_MAINTENANCE_STATUS_V2_START')
    && /@media\s*\(min-width:\s*761px\)[\s\S]*?body\.maintenance-readonly #maintenanceReadonlyBanner,[\s\S]*?body\.maintenance-staff-authorized #maintenanceReadonlyBanner[\s\S]*?display:\s*inline-flex\s*!important/.test(maintenanceStyles)
    && !/@media\s*\(min-width:\s*1440px\)[\s\S]*?#maintenanceReadonlyBanner[\s\S]*?display:\s*none\s*!important/.test(maintenanceStyles),
  'Maintenance Mode and Staff tools unlocked must be visible on every non-phone layout.'
);
check(
  /@media\s*\(max-width:\s*760px\)[\s\S]*?#maintenanceReadonlyBanner\s*\{[\s\S]*?display:\s*none\s*!important/.test(maintenanceStyles),
  'The large floating maintenance status must remain hidden on the phone dock layout.'
);
check(
  jsSources['assets/js/magnetic-dock.js'].includes('GREENSCAPE_PHONE_DOCK_MAINTENANCE_ITEM_V1')
    && jsSources['assets/js/magnetic-dock.js'].includes('data-phone-maintenance-status')
    && jsSources['assets/js/magnetic-dock.js'].includes('data-maintenance-show-startup')
    && jsSources['assets/js/magnetic-dock.js'].includes('Maintenance Mode')
    && jsSources['assets/js/magnetic-dock.js'].includes('Staff tools unlocked')
    && jsSources['assets/js/magnetic-dock.js'].includes('Read-only access')
    && jsSources['assets/js/magnetic-dock.js'].includes('Staff access active'),
  'The phone More menu must expose both dynamic maintenance states and open existing maintenance details.'
);
check(
  /data-phone-maintenance-status[\s\S]*?Visit Greenscape website/.test(jsSources['assets/js/magnetic-dock.js']),
  'The phone maintenance status must appear directly before Visit Greenscape website.'
);
check(
  maintenanceStyles.includes('GREENSCAPE_PHONE_DOCK_MAINTENANCE_ITEM_V1_START')
    && maintenanceStyles.includes('icon-maintenance.png')
    && maintenanceStyles.includes('.phone-dock-maintenance-copy'),
  'The phone More-menu maintenance item must use the approved icon and compact layout.'
);
check(
  jsSources['assets/js/magnetic-dock.js'].includes("window.matchMedia('(max-width: 760px)')")
    && jsSources['assets/js/magnetic-dock.js'].includes("attributeFilter: ['class']"),
  'The phone maintenance item must follow the floating dock breakpoint and update with authorization state.'
);
check(
  plantLibraryStyles.includes('GREENSCAPE_PHONE_LIBRARY_POSITION_AND_CATEGORY_V2_START')
    && /body:has\(#plantGrid\) \.page-content\s*\{[\s\S]*?padding-top:\s*0\s*!important/.test(plantLibraryStyles)
    && /library-reference-toolbar\s*\{[\s\S]*?top:\s*44px\s*!important/.test(plantLibraryStyles),
  'The approved higher phone Plant Library filter position must remain unchanged.'
);
check(
  html.includes('maintenance.css?v=20260731-phone-dock-maintenance1')
    && html.includes('magnetic-dock.js?v=20260731-phone-dock-maintenance2')
    && html.includes('plant-library-refinements.css?v=20260731-phone-library-refinement2'),
  'Phone maintenance menu and higher phone-filter assets must use the current cache keys.'
);
check(
  readme.includes('### Phone Dock Maintenance Status V1'),
  'README must record the phone dock maintenance status update.'
);
// GREENSCAPE_PHONE_DOCK_FREEZE_HOTFIX_V1_2_VALIDATION
check(
  jsSources['assets/js/magnetic-dock.js'].includes('GREENSCAPE_PHONE_DOCK_FREEZE_HOTFIX_V1_2'),
  'The phone-dock freeze hotfix marker is required.'
);
check(
  !jsSources['assets/js/magnetic-dock.js'].includes('const utilityObserver = new MutationObserver(syncUtilities);')
    && !jsSources['assets/js/magnetic-dock.js'].includes('utilityObserver.observe(document.body, { childList: true, subtree: true });'),
  'The phone dock must not observe all body child mutations or recursively resynchronize utilities.'
);
check(
  jsSources['assets/js/magnetic-dock.js'].includes('if (item.dataset.maintenanceState !== state.state)')
    && jsSources['assets/js/magnetic-dock.js'].includes("if (item.getAttribute('aria-label') !== accessibleLabel)")
    && jsSources['assets/js/magnetic-dock.js'].includes('if (label && label.textContent !== state.label)')
    && jsSources['assets/js/magnetic-dock.js'].includes('if (detail && detail.textContent !== state.detail)'),
  'Phone maintenance status updates must be idempotent and avoid repeated DOM mutations.'
);
check(
  jsSources['assets/js/magnetic-dock.js'].includes('maintenanceStateObserver.observe(document.body')
    && jsSources['assets/js/magnetic-dock.js'].includes('maintenanceStateObserver.observe(document.documentElement')
    && jsSources['assets/js/magnetic-dock.js'].includes("attributeFilter: ['class']"),
  'Phone maintenance status must observe only authorization class changes.'
);
check(
  jsSources['assets/js/magnetic-dock.js'].includes("phoneQuery.addEventListener('change', syncUtilities)")
    && !jsSources['assets/js/magnetic-dock.js'].includes('new MutationObserver(syncUtilities)'),
  'Phone dock utilities must synchronize only at startup and breakpoint changes.'
);
check(
  html.includes('magnetic-dock.js?v=20260731-phone-dock-maintenance2'),
  'The phone-dock freeze hotfix must use the current JavaScript cache key.'
);
check(
  readme.includes('### Phone Dock Freeze Hotfix V1.2'),
  'README must record the phone-dock freeze hotfix.'
);

if (failures.length) {
  console.error(`Validation failed (${failures.length}):`);
  failures.forEach(message => console.error(`- ${message}`));
  process.exit(1);
}

const mode = process.argv.includes('--build') ? 'Static build validation' : 'Validation';
console.log(`${mode} passed: all JavaScript files, HTML structure, metadata, accessibility hooks, manifest, security guards, and local assets.`);
