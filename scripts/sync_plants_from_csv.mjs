import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const csvPath = path.join(root, 'data', 'Greenscape_Plant_Library.csv');
const dataPath = path.join(root, 'assets', 'js', 'data.js');
const indexPath = path.join(root, 'index.html');

const headers = [
  'Record ID',
  'Code',
  'Common Name',
  'Scientific Name',
  'Category',
  'Available Sizes',
  'Sun',
  'Water',
  'Spacing',
  'Mature Height',
  'Mature Spread',
  'Landscape Use',
  'Growing Condition',
  'Overview Description',
  'Planting Notes',
  'Tags',
  'Image Path / URL',
  'Plant Link'
];

const args = new Set(process.argv.slice(2));
const checkOnly = args.has('--check');
const bootstrap = args.has('--bootstrap');
const allowLargeDelete = args.has('--allow-large-delete');
const DATA_SCHEMA_VERSION = 'catalogue-sync1';

function fail(message) {
  console.error(`Plant CSV sync failed: ${message}`);
  process.exit(1);
}

function loadPublishedData() {
  if (!fs.existsSync(dataPath)) fail('assets/js/data.js is missing.');
  const source = fs.readFileSync(dataPath, 'utf8');
  const sandbox = { window: {} };
  try {
    vm.runInNewContext(source, sandbox, { filename: dataPath });
  } catch (error) {
    fail(`assets/js/data.js could not be read: ${error.message}`);
  }
  const plants = sandbox.window.GREENSCAPE_PLANT_DATA;
  const meta = sandbox.window.GREENSCAPE_PLANT_META;
  if (!Array.isArray(plants)) fail('GREENSCAPE_PLANT_DATA must be an array.');
  return { plants, meta: meta && typeof meta === 'object' ? meta : {} };
}

function csvEscape(value) {
  const text = String(value ?? '');
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function sizesToText(sizes) {
  return (Array.isArray(sizes) ? sizes : [])
    .map(size => {
      const label = String(size?.label || size?.size || '').trim();
      const unit = String(size?.unit || '').trim();
      if (!label && !unit) return '';
      return unit ? `${label || 'Unspecified'} | ${unit}` : label;
    })
    .filter(Boolean)
    .join('; ');
}

function publishedImageValue(value) {
  const image = String(value || '').trim();
  if (/^data:image\/(?:gif|jpe?g|png|webp);base64,\s*$/i.test(image)) return '';
  return image;
}

function publishedDataToCsv(plants) {
  const rows = [...plants]
    .sort((a, b) =>
      String(a.category || '').localeCompare(String(b.category || '')) ||
      String(a.commonName || '').localeCompare(String(b.commonName || ''))
    )
    .map(plant => [
      plant.id || '',
      plant.code || '',
      plant.commonName || '',
      plant.scientificName || plant.material || '',
      plant.category || 'Uncategorized',
      sizesToText(plant.sizes),
      plant.sun || '',
      plant.water || '',
      plant.spacing || '',
      plant.matureHeight || '',
      plant.matureSpread || '',
      plant.landscapeUse || '',
      plant.growingCondition || '',
      plant.overviewDescription || '',
      plant.plantingNotes || '',
      (Array.isArray(plant.tags) ? plant.tags : []).join(', '),
      publishedImageValue(plant.image),
      plant.link || ''
    ]);
  return [headers, ...rows].map(row => row.map(csvEscape).join(',')).join('\n') + '\n';
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = '';
  let quoted = false;

  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];

    if (quoted) {
      if (character === '"' && text[index + 1] === '"') {
        cell += '"';
        index += 1;
      } else if (character === '"') {
        quoted = false;
      } else {
        cell += character;
      }
      continue;
    }

    if (character === '"') {
      quoted = true;
    } else if (character === ',') {
      row.push(cell);
      cell = '';
    } else if (character === '\n') {
      row.push(cell.replace(/\r$/, ''));
      rows.push(row);
      row = [];
      cell = '';
    } else {
      cell += character;
    }
  }

  if (quoted) fail('The CSV contains an unclosed quoted cell.');
  if (cell.length || row.length) {
    row.push(cell.replace(/\r$/, ''));
    rows.push(row);
  }

  return rows.filter(values => values.some(value => String(value || '').trim()));
}

function normalizeHeader(value) {
  return String(value || '').trim().toLowerCase().replace(/[^a-z0-9]+/g, '');
}

function safeCell(value, rowNumber, header) {
  const text = String(value ?? '').trim();
  if (/^[\t\r\n ]*[=+@]/.test(text) || /^-\s*(?:\d|[A-Za-z_]+\s*\()/.test(text)) {
    fail(`Row ${rowNumber}, ${header}: spreadsheet formulas are not allowed.`);
  }
  return text;
}

function slug(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function plantWords(value) {
  return String(value || '').match(/[A-Za-z]+/g) || [];
}

function botanicalBaseCode(commonName, scientificName) {
  const common = plantWords(commonName);
  const scientific = plantWords(scientificName);
  if (!common[0] || !scientific[0]) return '';
  const third = scientific[1]?.[0] || scientific[0]?.[1];
  if (!third) return '';
  return `${common[0][0].toUpperCase()}${scientific[0][0].toUpperCase()}${third.toLowerCase()}`;
}

function assignBotanicalCodes(records) {
  const groups = new Map();

  records.forEach(record => {
    record.codeBase = '';
    record.codeConflict = false;
    record.codeIncomplete = false;

    if (record.category === 'Landscape Materials') return;

    const base = botanicalBaseCode(record.commonName, record.scientificName);
    if (!base) {
      record.codeIncomplete = true;
      return;
    }

    record.codeBase = base;
    if (!groups.has(base)) groups.set(base, []);
    groups.get(base).push(record);
  });

  groups.forEach((group, base) => {
    if (group.length === 1) {
      group[0].code = base;
      group[0].codeManual = false;
      return;
    }

    const used = new Set();
    const pending = [];
    const suffixPattern = new RegExp(`^${base}-(\\d{2})$`);

    group.forEach(record => {
      const match = String(record.code || '').match(suffixPattern);
      const suffix = match ? Number(match[1]) : 0;
      if (suffix > 0 && !used.has(suffix)) {
        used.add(suffix);
        record.code = `${base}-${String(suffix).padStart(2, '0')}`;
      } else {
        pending.push(record);
      }
    });

    pending
      .sort((a, b) => String(a.id).localeCompare(String(b.id)))
      .forEach(record => {
        let suffix = 1;
        while (used.has(suffix)) suffix += 1;
        used.add(suffix);
        record.code = `${base}-${String(suffix).padStart(2, '0')}`;
      });

    group.forEach(record => {
      record.codeConflict = true;
      record.codeManual = false;
    });
  });

  const finalCodes = new Set();
  records.forEach(record => {
    const key = String(record.code || '').toLowerCase();
    if (!key) fail(`Record ID "${record.id}" has no usable code.`);
    if (finalCodes.has(key)) fail(`Generated code "${record.code}" is not unique.`);
    finalCodes.add(key);
  });

  return records;
}

function parseSizes(value, rowNumber) {
  const text = String(value || '').trim();
  if (!text) return [];
  return text.split(';').map(item => item.trim()).filter(Boolean).map(item => {
    const pieces = item.split('|');
    if (pieces.length > 2) fail(`Row ${rowNumber}, Available Sizes: use "size | unit; size | unit".`);
    const label = String(pieces[0] || '').trim();
    const unit = String(pieces[1] || 'pc/s').trim();
    if (!label) fail(`Row ${rowNumber}, Available Sizes: every size needs a label.`);
    return { label, size: label, variant: '', unit: unit || 'pc/s' };
  });
}

function validateImage(value, rowNumber) {
  const image = String(value || '').trim();
  if (!image) return '';

  // Some historical records contain only a MIME prefix without image bytes.
  // Treat these placeholders as an empty image instead of failing publication.
  if (/^data:image\/(?:gif|jpe?g|png|webp);base64,\s*$/i.test(image)) return '';

  if (/^data:image\/(?:gif|jpe?g|png|webp);base64,[a-z0-9+/=\s]+$/i.test(image)) {
    if (Buffer.byteLength(image, 'utf8') > 8 * 1024 * 1024) {
      fail(`Row ${rowNumber}, Image Path / URL: embedded image data is larger than 8 MB.`);
    }
    return image;
  }

  if (/^https?:\/\//i.test(image)) {
    try {
      const url = new URL(image);
      if (!['http:', 'https:'].includes(url.protocol)) throw new Error('Unsupported protocol');
      return image;
    } catch {
      fail(`Row ${rowNumber}, Image Path / URL: "${image.slice(0, 120)}" is not a valid web URL.`);
    }
  }

  if (!image.startsWith('assets/') ||
      image.includes('..') ||
      image.includes('\\') ||
      /[\u0000-\u001f\u007f]/.test(image) ||
      !/\.(?:gif|heic|heif|jpe?g|png|webp)$/i.test(image)) {
    fail(
      `Row ${rowNumber}, Image Path / URL: "${image.slice(0, 120)}" must be a safe assets/ image path, an HTTP(S) URL, or a supported data image.`
    );
  }

  const resolved = path.resolve(root, image);
  const assetsRoot = path.resolve(root, 'assets') + path.sep;
  if (!resolved.startsWith(assetsRoot)) {
    fail(`Row ${rowNumber}, Image Path / URL: the local path must stay inside the assets folder.`);
  }
  if (!fs.existsSync(resolved)) {
    fail(`Row ${rowNumber}, Image Path / URL: "${image}" does not exist in the repository.`);
  }

  return image;
}

function validateLink(value, rowNumber) {
  const link = String(value || '').trim();
  if (!link) return '';
  if (!/^https:\/\//i.test(link)) fail(`Row ${rowNumber}, Plant Link: only HTTPS links are allowed.`);
  return link;
}

function recordsFromCsv(csvText, existingPlants) {
  const rows = parseCsv(csvText);
  if (!rows.length) fail('The CSV is empty.');

  const normalizedExpected = headers.map(normalizeHeader);
  const normalizedActual = rows[0].map(normalizeHeader);
  if (normalizedActual.length !== normalizedExpected.length ||
      normalizedExpected.some((header, index) => normalizedActual[index] !== header)) {
    fail(`The header row must contain exactly: ${headers.join(', ')}`);
  }

  const existingById = new Map(existingPlants.map(plant => [String(plant.id || '').trim(), plant]));
  const existingByCode = new Map();
  existingPlants.forEach(plant => {
    const key = String(plant.code || '').trim().toLowerCase();
    if (key && !existingByCode.has(key)) existingByCode.set(key, plant);
  });

  const ids = new Set();
  const records = [];

  rows.slice(1).forEach((values, rowIndex) => {
    const rowNumber = rowIndex + 2;
    const data = Object.fromEntries(headers.map((header, index) => [
      header,
      safeCell(values[index] ?? '', rowNumber, header)
    ]));

    if (!Object.values(data).some(Boolean)) return;

    const code = data['Code'];
    const commonName = data['Common Name'];
    const scientificName = data['Scientific Name'];
    const category = data['Category'];

    if (!code) fail(`Row ${rowNumber}: Code is required.`);
    if (!/^[A-Za-z0-9][A-Za-z0-9._-]{1,31}$/.test(code)) {
      fail(`Row ${rowNumber}: Code may use letters, numbers, periods, underscores, and hyphens.`);
    }
    if (!commonName) fail(`Row ${rowNumber}: Common Name is required.`);
    if (!category) fail(`Row ${rowNumber}: Category is required.`);

    const codeKey = code.toLowerCase();

    const matchingExisting = existingByCode.get(codeKey);
    let id = data['Record ID'] || matchingExisting?.id || `plant-${slug(code)}`;
    id = String(id || '').trim();

    if (!id) fail(`Row ${rowNumber}: a Record ID could not be generated.`);
    if (!/^[A-Za-z0-9][A-Za-z0-9._-]{1,79}$/.test(id)) {
      fail(`Row ${rowNumber}: Record ID contains unsupported characters.`);
    }
    if (matchingExisting && data['Record ID'] && matchingExisting.id !== id) {
      fail(`Row ${rowNumber}: Code "${code}" belongs to Record ID "${matchingExisting.id}". Keep the existing ID.`);
    }
    if (ids.has(id.toLowerCase())) fail(`Row ${rowNumber}: duplicate Record ID "${id}".`);
    ids.add(id.toLowerCase());

    const existing = existingById.get(id) || matchingExisting || {};
    const image = validateImage(data['Image Path / URL'], rowNumber);
    const link = validateLink(data['Plant Link'], rowNumber);
    const isMaterial = category === 'Landscape Materials';

    records.push({
      ...existing,
      id,
      code,
      codeManual: true,
      commonName,
      scientificName,
      category,
      isPlant: !isMaterial,
      material: isMaterial ? scientificName : '',
      image,
      sizes: parseSizes(data['Available Sizes'], rowNumber),
      sun: data['Sun'],
      water: data['Water'],
      spacing: data['Spacing'],
      matureHeight: data['Mature Height'],
      matureSpread: data['Mature Spread'],
      landscapeUse: data['Landscape Use'],
      growingCondition: data['Growing Condition'],
      overviewDescription: data['Overview Description'],
      plantingNotes: data['Planting Notes'],
      tags: data['Tags'].split(/[,;]/).map(value => value.trim()).filter(Boolean),
      link,
      sourceSheet: 'Google Sheets CSV',
      sourceNumber: String(rowNumber - 1),
      custom: false
    });
  });

  if (!records.length) fail('The CSV contains no plant rows.');

  const minimumSafeCount = Math.floor(existingPlants.length * 0.75);
  if (!allowLargeDelete && existingPlants.length >= 20 && records.length < minimumSafeCount) {
    fail(`The CSV has ${records.length} rows, below the deletion safety limit of ${minimumSafeCount}. Restore missing rows or run manually with --allow-large-delete.`);
  }

  return assignBotanicalCodes(records);
}

function sourceRevision(csvText) {
  return crypto.createHash('sha256').update(csvText).digest('hex').slice(0, 12);
}

function metadata(records, revision) {
  const categories = {};
  records.forEach(record => {
    categories[record.category] = (categories[record.category] || 0) + 1;
  });
  const materialCount = records.filter(record => record.category === 'Landscape Materials').length;
  return {
    name: 'Greenscape Plant Library',
    sourceFile: 'data/Greenscape_Plant_Library.csv',
    sourceRevision: revision,
    plantCount: records.length - materialCount,
    materialCount,
    totalCount: records.length,
    withImages: records.filter(record => record.image).length,
    categories
  };
}

function generatedDataSource(records, csvText) {
  const revision = sourceRevision(csvText);
  return `window.GREENSCAPE_PLANT_DATA=${JSON.stringify(records)};\nwindow.GREENSCAPE_PLANT_META=${JSON.stringify(metadata(records, revision))};\n`;
}

function generatedIndexSource(indexSource, csvText) {
  const hash = sourceRevision(csvText);
  const cacheVersion = `csv-${hash}-${DATA_SCHEMA_VERSION}`;
  const next = indexSource.replace(
    /assets\/js\/data\.js\?v=[^"]+/,
    `assets/js/data.js?v=${cacheVersion}`
  );
  if (next === indexSource && !indexSource.includes(`assets/js/data.js?v=${cacheVersion}`)) {
    fail('index.html does not contain the expected data.js script reference.');
  }
  return next;
}

const published = loadPublishedData();

if (bootstrap) {
  fs.mkdirSync(path.dirname(csvPath), { recursive: true });
  fs.writeFileSync(csvPath, publishedDataToCsv(published.plants), 'utf8');
  console.log(`Created ${path.relative(root, csvPath)} with ${published.plants.length} records.`);
}

if (!fs.existsSync(csvPath)) fail('data/Greenscape_Plant_Library.csv is missing.');

const csvText = fs.readFileSync(csvPath, 'utf8').replace(/^\uFEFF/, '');
const records = recordsFromCsv(csvText, published.plants);
const canonicalCsv = publishedDataToCsv(records);
const expectedData = generatedDataSource(records, canonicalCsv);
const currentIndex = fs.readFileSync(indexPath, 'utf8');
const expectedIndex = generatedIndexSource(currentIndex, canonicalCsv);

if (checkOnly) {
  const currentData = fs.readFileSync(dataPath, 'utf8');
  const failures = [];
  if (csvText !== canonicalCsv) failures.push('The plant CSV does not contain the canonical automatic codes.');
  if (currentData !== expectedData) failures.push('assets/js/data.js is not synchronized with the CSV.');
  if (currentIndex !== expectedIndex) failures.push('index.html has an outdated data.js cache version.');
  if (failures.length) fail(failures.join(' '));
  console.log(`Plant CSV check passed: ${records.length} records are synchronized.`);
  process.exit(0);
}

if (csvText !== canonicalCsv) fs.writeFileSync(csvPath, canonicalCsv, 'utf8');
fs.writeFileSync(dataPath, expectedData, 'utf8');
if (currentIndex !== expectedIndex) fs.writeFileSync(indexPath, expectedIndex, 'utf8');
console.log(`Plant CSV sync completed: ${records.length} records published.`);
