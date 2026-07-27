import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = relativePath => fs.readFileSync(path.join(root, relativePath), 'utf8');
const exists = relativePath => fs.existsSync(path.join(root, relativePath));
const failures = [];
const check = (condition, message) => {
  if (!condition) failures.push(message);
};

const html = read('index.html');
const styles = read('assets/css/styles.css');
const workflow = read('.github/workflows/ci.yml');
const jsPaths = [
  'assets/js/app.js',
  'assets/js/data.js',
  'assets/js/quotation.js',
  'assets/js/boq.js',
  'assets/js/boq-enhancements.js',
  'assets/js/project-costing.js',
  'assets/js/maintenance-config.js',
  'assets/js/maintenance-force.js',
  'assets/js/maintenance.js'
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

if (failures.length) {
  console.error(`Validation failed (${failures.length}):`);
  failures.forEach(message => console.error(`- ${message}`));
  process.exit(1);
}

check(exists('data/Greenscape_Plant_Library.csv'), 'The Google Sheets plant CSV is required.');
check(exists('scripts/sync_plants_from_csv.mjs'), 'The plant CSV sync script is required.');
check(exists('.github/workflows/sync-plant-csv.yml'), 'The Plant CSV Sync workflow is required.');
check(jsSources['assets/js/app.js'].includes('maintenanceModeAtStartup'), 'Maintenance mode must identify the published-data startup path.');
check(jsSources['assets/js/app.js'].includes("document.documentElement.classList.contains('maintenance-enabled')"), 'Maintenance mode must select published GitHub plant data before read-only access opens.');
check(!jsSources['assets/js/app.js'].includes('maintenanceReadOnlyAtStartup'), 'Maintenance startup must not depend on the late body read-only class.');
check(jsSources['assets/js/app.js'].includes("const maintenanceReadOnly = document.body.classList.contains('maintenance-readonly');"), 'Plant List editing controls must be hidden during maintenance.');
check(!jsSources['assets/js/maintenance.js'].includes("'export-excel',"), 'Excel export must remain blocked during maintenance.');

const mode = process.argv.includes('--build') ? 'Static build validation' : 'Validation';
console.log(`${mode} passed: all JavaScript files, HTML structure, metadata, accessibility hooks, manifest, security guards, and local assets.`);
