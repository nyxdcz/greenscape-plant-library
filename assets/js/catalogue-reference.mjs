import { PLANT_REFERENCES } from './catalogue-reference-data.mjs?v=catalogue-references1';

const normalized = value => String(value ?? '').trim().replace(/\s+/g, ' ').toLowerCase();

export function plantReference(record) {
  if (record.category === 'Landscape Materials') return null;
  const reference = Object.hasOwn(PLANT_REFERENCES, record.id) ? PLANT_REFERENCES[record.id] : null;
  if (reference && normalized(record.name) === normalized(reference.name)
    && normalized(record.latin) === normalized(reference.latin)) {
    return { kind: 'reference', url: reference.url, source: reference.source };
  }
  const query = [record.name, record.latin, 'plant'].filter(value => String(value ?? '').trim()).join(' ');
  return { kind: 'google', url: `https://www.google.com/search?${new URLSearchParams({ q: query })}` };
}
