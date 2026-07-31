import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const additionsDir = path.join(root, 'data', 'ADD_PLANTS_HERE');
const csvPath = path.join(root, 'data', 'Greenscape_Plant_Library.csv');
const checkOnly = process.argv.includes('--check');

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

const allowedKeys = new Set([
  'recordId',
  'code',
  'commonName',
  'scientificName',
  'category',
  'availableSizes',
  'sun',
  'water',
  'spacing',
  'matureHeight',
  'matureSpread',
  'landscapeUse',
  'growingCondition',
  'overviewDescription',
  'plantingNotes',
  'tags',
  'image',
  'plantLink'
]);

function fail(message) {
  console.error(`Plant folder import failed: ${message}`);
  process.exit(1);
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

  if (quoted) fail('The plant CSV contains an unclosed quoted cell.');
  if (cell.length || row.length) {
    row.push(cell.replace(/\r$/, ''));
    rows.push(row);
  }
  return rows.filter(values => values.some(value => String(value || '').trim()));
}

function csvEscape(value) {
  const text = String(value ?? '');
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function serializeCsv(rows) {
  return rows.map(row => row.map(csvEscape).join(',')).join('\n') + '\n';
}

function normalizeHeader(value) {
  return String(value || '').trim().toLowerCase().replace(/[^a-z0-9]+/g, '');
}

function cleanText(value, fileName, fieldName) {
  const text = String(value ?? '').trim();
  if (/^[\t\r\n ]*[=+@]/.test(text) || /^-\s*(?:\d|[A-Za-z_]+\s*\()/.test(text)) {
    fail(`${fileName}, ${fieldName}: spreadsheet formulas are not allowed.`);
  }
  return text;
}

function plantWords(value) {
  return String(value || '').match(/[A-Za-z]+/g) || [];
}

function botanicalBaseCode(commonName, scientificName) {
  const common = plantWords(commonName);
  const scientific = plantWords(scientificName);
  if (!common[0] || !scientific[0]) return '';
  const third = scientific[1]?.[0] || scientific[0]?.[1];
  return third
    ? `${common[0][0].toUpperCase()}${scientific[0][0].toUpperCase()}${third.toLowerCase()}`
    : '';
}

function formatSizes(value, fileName) {
  if (value === undefined) return undefined;
  if (typeof value === 'string') return cleanText(value, fileName, 'availableSizes');
  if (!Array.isArray(value)) fail(`${fileName}, availableSizes: use an array or a semicolon-separated string.`);

  return value.map((item, index) => {
    if (typeof item === 'string') {
      const text = cleanText(item, fileName, `availableSizes[${index}]`);
      if (!text) fail(`${fileName}, availableSizes[${index}]: size cannot be blank.`);
      return text.includes('|') ? text : `${text} | pc/s`;
    }

    if (!item || typeof item !== 'object' || Array.isArray(item)) {
      fail(`${fileName}, availableSizes[${index}]: use text or {"label":"100 cm","unit":"pc/s"}.`);
    }

    const label = cleanText(item.label ?? item.size, fileName, `availableSizes[${index}].label`);
    const unit = cleanText(item.unit ?? 'pc/s', fileName, `availableSizes[${index}].unit`);
    if (!label) fail(`${fileName}, availableSizes[${index}]: label is required.`);
    return `${label} | ${unit || 'pc/s'}`;
  }).join('; ');
}

function formatTags(value, fileName) {
  if (value === undefined) return undefined;
  if (typeof value === 'string') return cleanText(value, fileName, 'tags');
  if (!Array.isArray(value)) fail(`${fileName}, tags: use an array or comma-separated text.`);
  return value
    .map((tag, index) => cleanText(tag, fileName, `tags[${index}]`))
    .filter(Boolean)
    .join(', ');
}

function validateImage(value, fileName) {
  if (value === undefined) return undefined;
  const image = cleanText(value, fileName, 'image');
  if (!image) return '';

  if (/^https:\/\//i.test(image)) return image;
  if (!image.startsWith('assets/') ||
      image.includes('..') ||
      image.includes('\\') ||
      !/\.(?:gif|heic|heif|jpe?g|png|webp)$/i.test(image)) {
    fail(`${fileName}, image: use a safe assets/ image path or an HTTPS URL.`);
  }

  const resolved = path.resolve(root, image);
  const assetsRoot = path.resolve(root, 'assets') + path.sep;
  if (!resolved.startsWith(assetsRoot)) fail(`${fileName}, image: local images must stay inside assets/.`);
  if (!fs.existsSync(resolved)) fail(`${fileName}, image: ${image} does not exist.`);
  return image;
}

function validatePlantLink(value, fileName) {
  if (value === undefined) return undefined;
  const link = cleanText(value, fileName, 'plantLink');
  if (link && !/^https:\/\//i.test(link)) fail(`${fileName}, plantLink: only HTTPS links are allowed.`);
  return link;
}

function valueOrExisting(record, key, existingValue, fileName, fieldName = key) {
  return Object.hasOwn(record, key)
    ? cleanText(record[key], fileName, fieldName)
    : String(existingValue ?? '');
}

if (!fs.existsSync(additionsDir)) fail('data/ADD_PLANTS_HERE is missing.');
if (!fs.existsSync(csvPath)) fail('data/Greenscape_Plant_Library.csv is missing.');

const additionFiles = fs.readdirSync(additionsDir, { withFileTypes: true })
  .filter(entry =>
    entry.isFile() &&
    entry.name.toLowerCase().endsWith('.json') &&
    !entry.name.startsWith('_')
  )
  .map(entry => entry.name)
  .sort((left, right) => left.localeCompare(right));

const csvText = fs.readFileSync(csvPath, 'utf8').replace(/^\uFEFF/, '');
const rows = parseCsv(csvText);
if (!rows.length) fail('The plant CSV is empty.');

const expectedHeaders = headers.map(normalizeHeader);
const actualHeaders = rows[0].map(normalizeHeader);
if (actualHeaders.length !== expectedHeaders.length ||
    expectedHeaders.some((header, index) => actualHeaders[index] !== header)) {
  fail(`The plant CSV header must contain exactly: ${headers.join(', ')}`);
}

if (!additionFiles.length) {
  console.log('Plant folder check passed: no plant JSON files are waiting in data/ADD_PLANTS_HERE.');
  process.exit(0);
}

const rowById = new Map();
rows.slice(1).forEach((row, index) => {
  const id = String(row[0] || '').trim();
  const key = id.toLowerCase();
  if (!id) fail(`CSV row ${index + 2}: Record ID is required.`);
  if (rowById.has(key)) fail(`CSV row ${index + 2}: duplicate Record ID "${id}".`);
  while (row.length < headers.length) row.push('');
  rowById.set(key, row);
});

const additionIds = new Set();
let changedRecords = 0;

for (const fileName of additionFiles) {
  const filePath = path.join(additionsDir, fileName);
  let record;
  try {
    record = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (error) {
    fail(`${fileName}: invalid JSON (${error.message}).`);
  }

  if (!record || typeof record !== 'object' || Array.isArray(record)) {
    fail(`${fileName}: the JSON root must be an object.`);
  }

  const unknownKeys = Object.keys(record).filter(key => !allowedKeys.has(key));
  if (unknownKeys.length) fail(`${fileName}: unsupported field(s): ${unknownKeys.join(', ')}.`);

  const recordId = cleanText(record.recordId, fileName, 'recordId');
  if (!/^[A-Za-z0-9][A-Za-z0-9._-]{1,79}$/.test(recordId)) {
    fail(`${fileName}, recordId: use 2–80 letters, numbers, periods, underscores, or hyphens.`);
  }

  const expectedFileName = `${recordId}.json`;
  if (fileName !== expectedFileName) {
    fail(`${fileName}: rename the file to exactly ${expectedFileName}.`);
  }

  const idKey = recordId.toLowerCase();
  if (additionIds.has(idKey)) fail(`${fileName}: duplicate Record ID "${recordId}" in the folder.`);
  additionIds.add(idKey);

  const existing = rowById.get(idKey) || Array(headers.length).fill('');
  const commonName = valueOrExisting(record, 'commonName', existing[2], fileName);
  const scientificName = valueOrExisting(record, 'scientificName', existing[3], fileName);
  const category = valueOrExisting(record, 'category', existing[4], fileName);

  if (!commonName) fail(`${fileName}, commonName: required.`);
  if (!scientificName) fail(`${fileName}, scientificName: required.`);
  if (!category) fail(`${fileName}, category: required.`);

  let code = Object.hasOwn(record, 'code')
    ? cleanText(record.code, fileName, 'code')
    : String(existing[1] || '').trim();

  if (!code && category !== 'Landscape Materials') {
    code = botanicalBaseCode(commonName, scientificName);
  }
  if (!code) fail(`${fileName}, code: required for Landscape Materials or incomplete botanical names.`);
  if (!/^[A-Za-z0-9][A-Za-z0-9._-]{1,31}$/.test(code)) {
    fail(`${fileName}, code: use 2–32 letters, numbers, periods, underscores, or hyphens.`);
  }

  const sizes = formatSizes(record.availableSizes, fileName);
  const tags = formatTags(record.tags, fileName);
  const image = validateImage(record.image, fileName);
  const plantLink = validatePlantLink(record.plantLink, fileName);

  const next = [
    recordId,
    code,
    commonName,
    scientificName,
    category,
    sizes === undefined ? String(existing[5] || '') : sizes,
    valueOrExisting(record, 'sun', existing[6], fileName),
    valueOrExisting(record, 'water', existing[7], fileName),
    valueOrExisting(record, 'spacing', existing[8], fileName),
    valueOrExisting(record, 'matureHeight', existing[9], fileName),
    valueOrExisting(record, 'matureSpread', existing[10], fileName),
    valueOrExisting(record, 'landscapeUse', existing[11], fileName),
    valueOrExisting(record, 'growingCondition', existing[12], fileName),
    valueOrExisting(record, 'overviewDescription', existing[13], fileName),
    valueOrExisting(record, 'plantingNotes', existing[14], fileName),
    tags === undefined ? String(existing[15] || '') : tags,
    image === undefined ? String(existing[16] || '') : image,
    plantLink === undefined ? String(existing[17] || '') : plantLink
  ];

  if (rowById.has(idKey)) {
    const rowIndex = rows.indexOf(rowById.get(idKey));
    if (rowIndex < 1) fail(`${fileName}: existing CSV row could not be located.`);
    rows[rowIndex] = next;
  } else {
    rows.push(next);
  }

  rowById.set(idKey, next);
  changedRecords += 1;
}

const nextCsv = serializeCsv(rows);

if (checkOnly) {
  if (nextCsv !== csvText) {
    fail(`${changedRecords} folder plant record(s) are not imported. Run npm run import:plants.`);
  }
  console.log(`Plant folder check passed: ${changedRecords} JSON record(s) are synchronized.`);
  process.exit(0);
}

if (nextCsv === csvText) {
  console.log(`Plant folder import completed: ${changedRecords} JSON record(s) were already synchronized.`);
} else {
  fs.writeFileSync(csvPath, nextCsv, 'utf8');
  console.log(`Plant folder import completed: ${changedRecords} JSON record(s) merged into the plant CSV.`);
}
