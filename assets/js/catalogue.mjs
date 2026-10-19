import { CatalogueStore } from './catalogue-store.mjs?v=catalogue-polish1';

const ORDER = ['Shrubs', 'Indoor Plants', 'Palms', 'Trees', 'Climbers & Ferns', 'Cycads, Agaves & Yuccas', 'Grasses & Groundcovers', 'Bamboo', 'Landscape Materials'];
const searchEl = document.getElementById('search');
const categoryEl = document.getElementById('category');
const listEl = document.getElementById('list');
const countEl = document.getElementById('count');
const sheetEl = document.getElementById('sheet');
const addEl = document.getElementById('add');
const noticeEl = document.getElementById('storage-notice');
const resetEl = document.getElementById('reset-filters');
const columnsEl = document.getElementById('catalogue-columns');
let storage;
try { storage = window.localStorage; } catch { storage = null; }
const store = new CatalogueStore(storage);
let basePlants = [];
let plants = [];
let catalogueState = 'loading';
let activeRequest = 0;
let dataScript;
let slowTimer;
let currentId = '';
let editing = false;
let currentValues = [];
let opener;
let openerId;
let previousOverflow = '';
let nextSizeId = 0;

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
}

function imageSrc(image) {
  if (!image) return '';
  if (/^https?:\/\//i.test(image)) return image;
  return new URL(`assets/images/${image.replace(/^assets\/images\//, '')}`, location.href).href;
}

function photoMarkup(plant, large = false) {
  const source = imageSrc(plant.image);
  return `<div class="image-frame ${large ? 'hero-frame' : 'thumb-frame'}" data-state="${source ? 'loading' : 'missing'}" ${large ? 'role="group" aria-label="Plant photo"' : 'aria-hidden="true"'}>
    ${source ? `<img class="${large ? 'hero' : 'thumb'}" src="${escapeHtml(source)}" alt="${large ? escapeHtml(plant.name) : ''}" decoding="async" ${large ? '' : 'loading="lazy"'}>` : ''}
    <span class="photo-status">${source ? (large ? 'Loading photo...' : 'Loading') : (large ? 'No photo available' : 'No photo')}</span>
  </div>`;
}

function settlePhoto(image, failed) {
  const frame = image.closest('.image-frame');
  if (!frame) return;
  frame.dataset.state = failed ? 'error' : 'ready';
  image.hidden = failed;
  const status = frame.querySelector('.photo-status');
  status.hidden = !failed;
  if (failed) status.textContent = frame.classList.contains('hero-frame') ? 'Photo unavailable' : 'No photo';
}

function settleCachedPhotos(root) {
  root.querySelectorAll('.image-frame img').forEach(image => {
    if (image.complete) settlePhoto(image, image.naturalWidth === 0);
  });
}

for (const root of [listEl, sheetEl]) {
  root.addEventListener('load', event => {
    if (event.target.matches('.image-frame img')) settlePhoto(event.target, false);
  }, true);
  root.addEventListener('error', event => {
    if (event.target.matches('.image-frame img')) settlePhoto(event.target, true);
  }, true);
}

if (store.hasReadError) {
  noticeEl.hidden = false;
  noticeEl.innerHTML = '<p>Some saved plant changes could not be read. The published catalogue is still available. Existing saved data has been left untouched.</p><button class="ghost" type="button" id="reload-storage">Reload to try again</button>';
  document.getElementById('reload-storage').addEventListener('click', () => location.reload());
}

function rebuild() {
  plants = store.plants(basePlants);
  const selected = categoryEl.value;
  const names = [...new Set(ORDER.concat(plants.map(plant => plant.category)))].filter(name => plants.some(plant => plant.category === name));
  categoryEl.innerHTML = '<option value="All">All categories</option>' + names.map(name => `<option value="${escapeHtml(name)}">${escapeHtml(name)}</option>`).join('');
  categoryEl.value = names.includes(selected) ? selected : 'All';
}

function render() {
  listEl.setAttribute('aria-busy', String(catalogueState === 'loading'));
  resetEl.hidden = true;
  columnsEl.hidden = true;
  for (const control of [searchEl, categoryEl, addEl]) control.disabled = catalogueState !== 'ready';
  if (catalogueState !== 'ready') {
    const failed = catalogueState === 'error';
    countEl.textContent = failed ? 'Catalogue unavailable' : 'Loading catalogue';
    listEl.innerHTML = `<div class="empty" role="${failed ? 'alert' : 'status'}"><p>${failed ? 'The plant catalogue could not be loaded.' : 'Loading the plant catalogue...'}</p><p class="hint">${failed ? 'Check your connection, then try again. Saved plant data has not been changed.' : 'Plant records will appear here when they are ready.'}</p><button id="retry-catalogue" class="primary" type="button" ${failed ? '' : 'hidden'}>Retry loading</button></div>`;
    return;
  }
  const query = searchEl.value.trim().toLowerCase();
  const rows = plants.filter(plant => (categoryEl.value === 'All' || plant.category === categoryEl.value)
    && (!query || `${plant.name} ${plant.latin} ${plant.code}`.toLowerCase().includes(query)));
  const filtered = Boolean(query || categoryEl.value !== 'All');
  resetEl.hidden = !filtered;
  countEl.textContent = filtered ? `${rows.length} of ${plants.length} records` : `${plants.length} ${plants.length === 1 ? 'record' : 'records'}`;
  if (!rows.length) {
    listEl.innerHTML = `<div class="empty"><h2>${plants.length ? 'No plants match your filters' : 'Your catalogue is empty'}</h2><p class="hint">${plants.length ? 'Try a different name or code, or reset the filters to see every record.' : 'Use Add plant to save the first plant on this device.'}</p>${plants.length ? '<button class="primary" type="button" id="clear">Reset filters</button>' : ''}</div>`;
    return;
  }
  columnsEl.hidden = false;
  listEl.innerHTML = '<ul>' + rows.map(plant => `<li><button class="row" type="button" data-id="${escapeHtml(plant.id)}">
    ${photoMarkup(plant)}
    <span class="row-identity"><span class="name">${escapeHtml(plant.name)}</span><span class="latin">${escapeHtml(plant.latin || 'Scientific name not recorded')}</span></span>
    <span class="row-category">${escapeHtml(plant.category)}<span class="size-count">${plant.sizes.length ? `${plant.sizes.length} ${plant.sizes.length === 1 ? 'size' : 'sizes'} available` : 'Sizes not recorded'}</span></span>
    <span class="row-code"><span class="sr-only">Code: </span>${escapeHtml(plant.code || 'No code')}</span>
    <span class="row-action" aria-hidden="true">View details</span>
  </button></li>`).join('') + '</ul>';
  settleCachedPhotos(listEl);
}

function loadCatalogue() {
  const request = ++activeRequest;
  clearTimeout(slowTimer);
  dataScript?.remove();
  catalogueState = 'loading';
  render();
  dataScript = document.createElement('script');
  dataScript.src = document.getElementById('catalogue-app').dataset.catalogueSrc;
  dataScript.addEventListener('load', () => {
    if (request !== activeRequest) return;
    clearTimeout(slowTimer);
    const source = window.GREENSCAPE_PLANT_DATA;
    if (!Array.isArray(source) || !source.every(plant => plant && typeof plant.id === 'string' && typeof plant.commonName === 'string')) {
      catalogueState = 'error';
    } else {
      basePlants = source.map(plant => ({
        id: plant.id, name: plant.commonName, latin: plant.scientificName || '', category: plant.category || 'Other',
        code: plant.code || '', image: plant.image || '', material: plant.material || '',
        sizes: (Array.isArray(plant.sizes) ? plant.sizes : []).map(size => size.label || size.size).filter(Boolean)
      }));
      catalogueState = 'ready';
      rebuild();
    }
    render();
    if (request > 1) (catalogueState === 'ready' ? searchEl : document.getElementById('retry-catalogue')).focus();
  });
  dataScript.addEventListener('error', () => {
    if (request !== activeRequest) return;
    clearTimeout(slowTimer);
    catalogueState = 'error';
    render();
    if (request > 1) document.getElementById('retry-catalogue').focus();
  });
  slowTimer = setTimeout(() => {
    if (request !== activeRequest || catalogueState !== 'loading') return;
    listEl.querySelector('.hint').textContent = 'This is taking longer than usual. You can retry loading the catalogue.';
    document.getElementById('retry-catalogue').hidden = false;
  }, 12000);
  document.head.appendChild(dataScript);
}

function fieldRow(label, value) {
  if (!value) return '';
  const index = currentValues.push(value) - 1;
  return `<div class="copy-row"><div><p class="copy-label">${escapeHtml(label)}</p><p class="${label === 'Scientific name' ? 'latin' : ''}">${escapeHtml(value)}</p></div><button type="button" class="copy" data-copy="${index}" aria-label="Copy ${escapeHtml(label.toLowerCase())}"><span data-copy-label>Copy</span></button></div>`;
}

function sizeOption(value) {
  const index = currentValues.push(value) - 1;
  return `<button type="button" class="size-option" data-copy="${index}" aria-label="Copy size ${escapeHtml(value)}"><span>${escapeHtml(value)}</span><span data-copy-label>Copy</span></button>`;
}

function plantDetails(plant) {
  const identity = [fieldRow('Common name', plant.name), fieldRow('Scientific name', plant.latin), fieldRow('Category', plant.category), fieldRow('Plant code', plant.code), fieldRow('Material', plant.material)].join('');
  const sizes = plant.sizes.length ? `<div class="size-options">${plant.sizes.map(sizeOption).join('')}</div>` : '<p class="hint">No sizes have been recorded.</p>';
  const reference = plant.image ? `<details class="image-reference"><summary>Image reference</summary>${fieldRow('Image link', imageSrc(plant.image))}</details>` : '';
  return `<div class="detail-layout"><div class="detail-photo">${photoMarkup(plant, true)}<p class="photo-caption">Reference photo</p></div><div class="detail-information"><section class="detail-section" aria-labelledby="identity-title"><h3 id="identity-title">Plant information</h3>${identity}</section><section class="detail-section" aria-labelledby="sizes-title"><h3 id="sizes-title">Available sizes</h3>${sizes}</section>${reference}</div></div>`;
}

function editField(label, name, value, extra = '') {
  return `<label class="edit-label" for="edit-${name}">${label}<input id="edit-${name}" name="${name}" value="${escapeHtml(value)}" ${extra}></label>`;
}

function sizeRow(value) {
  const id = `size-${++nextSizeId}`;
  return `<div class="size-edit"><label for="${id}"><span class="size-label">Size</span><input id="${id}" name="size" value="${escapeHtml(value)}"></label><button class="ghost" type="button" data-remove-size>Remove</button></div>`;
}

function labelSizes() {
  sheetEl.querySelectorAll('.size-edit').forEach((row, index) => {
    row.querySelector('.size-label').textContent = `Size ${index + 1}`;
    row.querySelector('button').setAttribute('aria-label', `Remove size ${index + 1}`);
  });
}

function editForm(plant) {
  const names = [...new Set(ORDER.concat(plant.category))];
  return `<form id="edit-form" novalidate>
    <p class="hint">Changes are saved in this browser on this device. They do not update the shared catalogue.</p>
    <fieldset><legend>Plant identity</legend>
      ${editField('Common name (required)', 'name', plant.name, 'required')}
      <p id="name-error" class="error" role="alert" hidden>Enter a common name.</p>
      ${editField('Scientific name', 'latin', plant.latin)}
    </fieldset>
    <fieldset><legend>Classification</legend>
      <div class="edit-label"><label for="edit-category">Category</label><select id="edit-category" name="category">${names.map(name => `<option value="${escapeHtml(name)}" ${name === plant.category ? 'selected' : ''}>${escapeHtml(name)}</option>`).join('')}</select></div>
      ${editField('Code', 'code', plant.code)}${editField('Material', 'material', plant.material)}
    </fieldset>
    <fieldset><legend>Photo</legend>
      ${editField('Image filename or URL', 'image', plant.image, 'aria-describedby="image-hint"')}
      <p id="image-hint" class="hint">Use a catalogue image filename, such as ind-015.webp, or a full https:// image URL.</p>
    </fieldset>
    <fieldset><legend>Available sizes</legend>
      <p class="hint">Enter each size separately, for example Seedlings or 20 cm. Sizes are optional.</p>
      <div id="size-list">${(plant.sizes.length ? plant.sizes : ['']).map(sizeRow).join('')}</div>
      <button class="ghost add-size" type="button" id="add-size">Add size</button>
    </fieldset>
  </form>`;
}

function currentPlant() { return plants.find(plant => plant.id === currentId); }

function openPlant(plant, { edit = false, trigger = null, saved = false } = {}) {
  if (!plant) return;
  const opening = !sheetEl.open;
  if (opening) {
    opener = trigger || document.activeElement;
    openerId = trigger?.dataset.id || '';
    previousOverflow = document.body.style.overflow;
  }
  currentId = plant.id;
  editing = edit;
  currentValues = [];
  const title = edit ? (currentPlant() ? 'Edit plant' : 'Add plant') : plant.name;
  const body = edit ? editForm(plant) : plantDetails(plant);
  sheetEl.innerHTML = `<div class="panel ${edit ? 'panel-edit' : 'panel-detail'}">
    <div class="panel-header"><div>${!edit ? `<p class="dialog-category">${escapeHtml(plant.category)}</p>` : ''}<h2 id="plant-title" tabindex="-1" autofocus>${escapeHtml(title)}</h2>${!edit && plant.latin ? `<p class="hint latin">${escapeHtml(plant.latin)}</p>` : ''}</div><button class="ghost" type="button" id="close">Close</button></div>
    <div class="panel-scroll"><div class="panel-body">${body}</div></div>
    <div class="panel-footer"><p id="copy-status" class="feedback" role="status" ${saved ? '' : 'hidden'}>${saved ? 'Saved in this browser on this device.' : ''}</p><p id="save-error" class="error" role="alert" tabindex="-1" hidden></p><div class="actions">${edit ? '<button class="primary" type="submit" form="edit-form" id="save-plant">Save plant</button><button class="ghost" type="button" id="cancel-edit">Cancel</button>' : '<button class="primary" type="button" id="edit">Edit plant</button>'}</div></div>
  </div>`;
  document.body.style.overflow = 'hidden';
  if (opening) sheetEl.showModal();
  document.getElementById('plant-title').focus({ preventScroll: true });
  sheetEl.querySelector('.panel-scroll').scrollTop = 0;
  labelSizes();
  settleCachedPhotos(sheetEl);
}

function closePlant() { sheetEl.close(); }

sheetEl.addEventListener('close', () => {
  document.body.style.overflow = previousOverflow;
  editing = false;
  sheetEl.innerHTML = '';
  const replacement = openerId && Array.from(listEl.querySelectorAll('[data-id]')).find(button => button.dataset.id === openerId);
  const target = opener?.isConnected ? opener : replacement || addEl;
  target.focus({ preventScroll: true });
});

sheetEl.addEventListener('cancel', event => {
  event.preventDefault();
  if (editing && currentPlant()) openPlant(currentPlant());
  else closePlant();
});

async function copyField(button) {
  const value = currentValues[Number(button.dataset.copy)];
  if (!value) return;
  let copied = false;
  try { await navigator.clipboard.writeText(value); copied = true; } catch {
    const area = document.createElement('textarea');
    area.value = value;
    sheetEl.appendChild(area);
    area.select();
    try { copied = document.execCommand('copy'); } catch { copied = false; }
    area.remove();
    button.focus({ preventScroll: true });
  }
  const status = document.getElementById('copy-status');
  if (!status) return;
  status.hidden = false;
  status.textContent = copied ? `${button.getAttribute('aria-label').replace(/^Copy /, '')} copied.` : 'Could not copy. Select the field text and copy it manually.';
  if (copied) {
    const label = button.querySelector('[data-copy-label]') || button;
    label.textContent = 'Copied';
    setTimeout(() => { label.textContent = 'Copy'; }, 1200);
  }
}

function resetFilters() {
  searchEl.value = '';
  categoryEl.value = 'All';
  render();
  searchEl.focus();
}

listEl.addEventListener('click', event => {
  if (event.target.id === 'retry-catalogue') { loadCatalogue(); return; }
  if (event.target.id === 'clear') {
    resetFilters();
    return;
  }
  const button = event.target.closest('[data-id]');
  if (button) openPlant(plants.find(plant => plant.id === button.dataset.id), { trigger: button });
});

sheetEl.addEventListener('click', event => {
  const copyButton = event.target.closest('[data-copy]');
  if (copyButton) { void copyField(copyButton); return; }
  if (event.target === sheetEl || event.target.id === 'close') { closePlant(); return; }
  if (event.target.id === 'edit') { openPlant(currentPlant(), { edit: true }); return; }
  if (event.target.id === 'cancel-edit') {
    if (currentPlant()) openPlant(currentPlant());
    else closePlant();
    return;
  }
  if (event.target.id === 'add-size') {
    document.getElementById('size-list').insertAdjacentHTML('beforeend', sizeRow(''));
    labelSizes();
    sheetEl.querySelector('.size-edit:last-child input').focus();
    return;
  }
  const remove = event.target.closest('[data-remove-size]');
  if (remove) {
    const row = remove.closest('.size-edit');
    const target = row.nextElementSibling?.querySelector('input') || row.previousElementSibling?.querySelector('input') || document.getElementById('add-size');
    row.remove();
    labelSizes();
    target.focus();
  }
});

sheetEl.addEventListener('input', event => {
  if (event.target.name === 'name' && event.target.value.trim()) {
    event.target.removeAttribute('aria-invalid');
    event.target.removeAttribute('aria-describedby');
    document.getElementById('name-error').hidden = true;
  }
});

sheetEl.addEventListener('submit', event => {
  event.preventDefault();
  const form = event.target;
  const nameInput = form.elements.namedItem('name');
  const name = nameInput.value.trim();
  if (!name) {
    nameInput.setAttribute('aria-invalid', 'true');
    nameInput.setAttribute('aria-describedby', 'name-error');
    document.getElementById('name-error').hidden = false;
    nameInput.focus();
    return;
  }
  const value = key => form.elements.namedItem(key).value.trim();
  const record = { id: currentId, name, latin: value('latin'), category: value('category'), code: value('code'), material: value('material'), image: value('image'), sizes: Array.from(form.querySelectorAll('[name="size"]')).map(input => input.value.trim()).filter(Boolean) };
  try { store.save(record); } catch (error) {
    const feedback = document.getElementById('save-error');
    feedback.textContent = `${error.message} Your draft is still open.`;
    feedback.hidden = false;
    document.getElementById('save-plant').textContent = 'Retry save';
    feedback.focus({ preventScroll: true });
    return;
  }
  rebuild();
  render();
  openPlant(currentPlant(), { saved: true });
});

addEl.addEventListener('click', () => openPlant({ id: `custom-${crypto.randomUUID()}`, name: '', latin: '', category: ORDER[0], code: '', image: '', sizes: [''], material: '' }, { edit: true, trigger: addEl }));
searchEl.addEventListener('input', render);
categoryEl.addEventListener('change', render);
resetEl.addEventListener('click', resetFilters);
loadCatalogue();
