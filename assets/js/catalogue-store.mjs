export const STORAGE_KEYS = {
  edits: 'greenscape-plant-edits',
  added: 'greenscape-added-plants'
};

const isRecord = value => value && typeof value === 'object' && !Array.isArray(value)
  && typeof value.name === 'string'
  && ['latin', 'category', 'code', 'material', 'image'].every(key => value[key] === undefined || typeof value[key] === 'string')
  && (value.sizes === undefined || (Array.isArray(value.sizes) && value.sizes.every(size => typeof size === 'string')));

function readCollection(storage, key, fallback, valid) {
  try {
    const raw = storage.getItem(key);
    const value = raw === null ? fallback : JSON.parse(raw);
    if (!valid(value)) throw new Error('Invalid saved plant data');
    return { value, readable: true };
  } catch {
    return { value: fallback, readable: false };
  }
}

export class CatalogueStore {
  constructor(storage) {
    this.storage = storage;
    const edits = readCollection(storage, STORAGE_KEYS.edits, {}, value => value && typeof value === 'object'
      && !Array.isArray(value) && Object.values(value).every(isRecord));
    const added = readCollection(storage, STORAGE_KEYS.added, [], value => Array.isArray(value)
      && value.every(record => isRecord(record) && typeof record.id === 'string' && record.id.startsWith('custom-')));
    this.edits = edits.value;
    this.added = added.value;
    this.readable = { edits: edits.readable, added: added.readable };
  }

  get hasReadError() { return !this.readable.edits || !this.readable.added; }

  plants(basePlants) {
    return basePlants.concat(this.added).map(record => {
      const plant = { latin: '', category: 'Other', code: '', image: '', sizes: [], material: '', ...record };
      if (!Object.hasOwn(this.edits, plant.id)) return plant;
      const edit = this.edits[plant.id];
      return {
        ...plant,
        name: edit.name || plant.name,
        latin: edit.latin || '',
        category: edit.category || plant.category,
        code: edit.code || '',
        image: edit.image || '',
        sizes: Array.isArray(edit.sizes) ? edit.sizes : plant.sizes,
        material: edit.material || ''
      };
    }).sort((a, b) => a.name.localeCompare(b.name));
  }

  save(record) {
    if (!isRecord(record) || typeof record.id !== 'string' || !record.name.trim()) throw new Error('Enter a common name before saving.');
    const collection = record.id.startsWith('custom-') ? 'added' : 'edits';
    if (!this.readable[collection]) throw new Error('Previously saved plants could not be read. Existing data has been left untouched. Reload the page to try reading it again.');
    const savedRecord = { ...record, sizes: [...(record.sizes || [])] };
    const next = collection === 'added'
      ? this.added.filter(plant => plant.id !== record.id).concat(savedRecord)
      : { ...this.edits, [record.id]: savedRecord };
    try {
      // Commit in memory only after the browser accepts the complete storage write.
      this.storage.setItem(STORAGE_KEYS[collection], JSON.stringify(next));
    } catch {
      throw new Error('The browser could not save this plant. Free some browser storage or allow site storage, then retry.');
    }
    this[collection] = next;
  }
}
