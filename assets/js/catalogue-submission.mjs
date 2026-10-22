import { escapeHtml, recordSummary } from './catalogue-records.mjs?v=catalogue-submissions1';

export const SUBMISSION_EMAIL = 'nyxdcz@gmail.com';
export const SUBMISSION_ENDPOINT = `https://formsubmit.co/${SUBMISSION_EMAIL}`;
export const MAX_IMAGE_BYTES = 10_000_000;
const FIELDS = [
  ['name', 'Common name', 160], ['latin', 'Scientific name', 240],
  ['category', 'Category', 80], ['code', 'Plant code', 80],
  ['image', 'Image', 0], ['sizes', 'Recorded sizes', 800]
];
const REQUIRED = ['name', 'latin', 'category', 'image'];
const IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const styleReady = typeof document === 'undefined' ? Promise.resolve() : new Promise(resolve => {
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = new URL('../css/catalogue-submission.css?v=catalogue-submissions1', import.meta.url).href;
  link.onload = () => resolve(true);
  link.onerror = () => resolve(false);
  document.head.append(link);
});

export async function inspectSubmissionImage(file) {
  if (!file?.size) return 'Upload an image of the plant.';
  if (file.size > MAX_IMAGE_BYTES) return 'Choose an image smaller than 10 MB.';
  if (!IMAGE_TYPES.has(file.type)) return 'Choose a JPEG, PNG, or WebP image.';
  try {
    const bytes = new Uint8Array(await file.slice(0, 12).arrayBuffer());
    const png = [137, 80, 78, 71, 13, 10, 26, 10].every((byte, index) => bytes[index] === byte);
    const jpeg = bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255;
    const webp = String.fromCharCode(...bytes.slice(0, 4)) === 'RIFF' && String.fromCharCode(...bytes.slice(8, 12)) === 'WEBP';
    if (!(file.type === 'image/png' && png || file.type === 'image/jpeg' && jpeg || file.type === 'image/webp' && webp)) return 'This file is not a matching JPEG, PNG, or WebP image.';
  } catch { return 'Could not read this image. Choose it again.'; }
  return '';
}

export function validateSubmission(values, categories, { correction = false, selected = [], imageError = '' } = {}) {
  const errors = [];
  const keys = correction ? selected : REQUIRED;
  if (correction && !keys.length) errors.push({ key: 'selection', message: 'Select at least one item to correct.' });
  for (const key of keys) {
    if (!FIELDS.some(field => field[0] === key)) { errors.push({ key: 'selection', message: 'Select a listed correction item.' }); continue; }
    const label = FIELDS.find(field => field[0] === key)[1];
    if (key === 'image') {
      if (!values.image?.size) errors.push({ key, message: 'Upload an image of the plant.' });
    } else if (!String(values[key] || '').trim()) errors.push({ key, message: `Enter ${label.toLowerCase()}.` });
  }
  if (values.image?.size && (!correction || keys.includes('image'))) {
    const message = values.image.size > MAX_IMAGE_BYTES ? 'Choose an image smaller than 10 MB.' : !IMAGE_TYPES.has(values.image.type) ? 'Choose a JPEG, PNG, or WebP image.' : imageError;
    if (message) errors.push({ key: 'image', message });
  }
  if ((!correction || keys.includes('category')) && values.category && !categories.includes(values.category)) errors.push({ key: 'category', message: 'Choose one of the existing catalogue categories.' });
  for (const [key, label, limit] of FIELDS) {
    if (limit && (!correction || keys.includes(key)) && String(values[key] || '').length > limit) errors.push({ key, message: `${label} is too long. Use at most ${limit} characters.` });
  }
  if (values.reference) {
    try {
      const url = new URL(values.reference);
      if (!['https:', 'http:'].includes(url.protocol) || values.reference.length > 2048) throw Error();
    } catch { errors.push({ key: 'reference', message: 'Enter a complete http:// or https:// reference link.' }); }
  }
  return errors;
}

export async function openSubmission({ plant = null, categories, trigger, category = '' }) {
  await styleReady;
  if (document.getElementById('submission-sheet')) return;
  const correction = Boolean(plant);
  const allowedCategories = [...new Set(categories)];
  const dialog = document.createElement('dialog');
  dialog.id = 'submission-sheet';
  dialog.className = 'sheet submission-sheet';
  dialog.setAttribute('aria-labelledby', 'submission-title');
  const title = correction ? 'Suggest a correction' : 'Add plant';
  const before = key => key === 'sizes' ? plant?.sizes?.join(', ') : plant?.[key];
  const rows = FIELDS.map(([key, label, limit]) => {
    const id = `suggest-${key}`;
    const checked = correction && key === 'name';
    const required = !correction && REQUIRED.includes(key) || checked;
    const disabled = correction && !checked;
    const options = `${required ? 'required' : ''} ${disabled ? 'disabled' : ''}`;
    const control = key === 'category' ? `<select id="${id}" name="category" aria-label="${label}${required ? ' (required)' : ''}" ${options}><option value="">Choose existing category</option>${allowedCategories.map(name => `<option value="${escapeHtml(name)}" ${!correction && category === name ? 'selected' : ''}>${escapeHtml(name)}</option>`).join('')}</select>`
      : key === 'image' ? `<input id="${id}" type="file" name="attachment" aria-label="Upload plant image${required ? ' (required)' : ''}" accept="image/jpeg,image/png,image/webp" ${options}><p class="hint">JPEG, PNG, or WebP. Maximum 10 MB.</p>`
        : `<input id="${id}" name="${key}" aria-label="${label}${required ? ' (required)' : ''}" maxlength="${limit}" placeholder="${key === 'sizes' ? 'Sizes, separated by commas' : `Enter ${correction ? 'correct ' : ''}${label.toLowerCase()}`}" ${options}>`;
    return `<div class="submission-field submission-${key}"><div class="submission-label">${correction ? `<label for="correct-${key}"><input type="checkbox" id="correct-${key}" data-correct="${key}" aria-label="Correct ${label.toLowerCase()}" ${checked ? 'checked' : ''}>${label}</label>${key !== 'image' ? `<p class="hint">${escapeHtml(before(key) || 'Not recorded')}</p>` : ''}` : `<label for="${id}">${label}${required ? ' <span class="submission-required">(required)</span>' : ''}</label>`}</div><div class="submission-value">${control}<p class="error" id="error-${key}" hidden></p></div></div>`;
  }).join('');
  dialog.innerHTML = `<div class="panel submission-panel ${correction ? 'submission-correction' : 'submission-add'}">
    <header class="panel-header"><div><h2 id="submission-title" tabindex="-1">${title}</h2><p class="hint">${correction ? 'Help us keep this plant record accurate.' : 'Suggest a new plant for the shared catalogue.'}</p></div><button type="button" class="ghost" data-dismiss>Close</button></header>
    <form id="submission-form" action="${SUBMISSION_ENDPOINT}" method="POST" enctype="multipart/form-data" target="_blank" rel="noopener" novalidate>
      <div class="panel-scroll"><div class="panel-body">
        ${correction ? `<div class="submission-identity"><strong>${escapeHtml(plant.name)}</strong><span class="hint">${escapeHtml(plant.latin)} · ${escapeHtml(plant.code || plant.id)}</span></div>` : ''}
        <fieldset><legend>${correction ? 'What needs correcting?' : 'Plant information'}</legend><p class="hint">${correction ? 'Select an item, then enter its correction beside it.' : 'Common name, scientific name, category, and an uploaded image are required.'}</p><div class="submission-fields">${rows}</div></fieldset>
        <label class="edit-label" for="suggest-reference">Reference link <span class="submission-required">(optional)</span><input id="suggest-reference" name="reference" type="url" maxlength="2048" placeholder="https://" aria-label="Reference link (optional)"></label><p class="error" id="error-reference" hidden></p>
        <p class="submission-recipient">Send to <strong>${SUBMISSION_EMAIL}</strong></p><p class="hint">Your suggestion and image are sent through <a href="https://formsubmit.co/" target="_blank" rel="noopener noreferrer">FormSubmit</a> for review. The shared catalogue changes after review.</p>
        <p id="submission-feedback" class="feedback" role="status" aria-live="polite"></p><p id="submission-error" class="error" role="alert" hidden></p>
        <input type="hidden" aria-label="Email subject" name="_subject" value="${escapeHtml(correction ? `Greenscape correction: ${plant.name}` : 'Greenscape: new plant suggestion')}">
        <input type="hidden" aria-label="Email format" name="_template" value="table">
        <input type="hidden" aria-label="Submission type" name="request_type" value="${correction ? 'Plant correction' : 'New plant suggestion'}">
        ${correction ? `<input type="hidden" aria-label="Original record" name="original_record" value="${escapeHtml(recordSummary(plant))}"><input type="hidden" aria-label="Record identifier" name="record_id" value="${escapeHtml(plant.id)}">` : ''}
      </div></div>
      <footer class="panel-footer"><div class="actions"><button type="button" class="ghost" data-dismiss>Cancel</button><button type="submit" class="primary" id="send-suggestion">${correction ? 'Send correction' : 'Send plant suggestion'}</button></div></footer>
    </form>
  </div>`;
  document.body.append(dialog);
  const form = dialog.querySelector('form');
  const feedback = dialog.querySelector('#submission-feedback');
  const submit = dialog.querySelector('#send-suggestion');
  let imageError = '';
  let imagePending = false;
  let imageRevision = 0;
  const selectedKeys = () => [...form.querySelectorAll('[data-correct]:checked')].map(input => input.dataset.correct);
  const clearErrors = () => {
    dialog.querySelectorAll('.error').forEach(item => { item.hidden = true; });
    form.querySelectorAll('[aria-invalid]').forEach(input => { input.removeAttribute('aria-invalid'); input.removeAttribute('aria-describedby'); });
  };
  form.addEventListener('change', async event => {
    const checkbox = event.target.closest('[data-correct]');
    if (checkbox) {
      const input = form.querySelector(`#suggest-${checkbox.dataset.correct}`);
      input.disabled = !checkbox.checked;
      input.required = checkbox.checked;
      if (checkbox.checked) input.focus();
    }
    if (event.target.id === 'suggest-image') {
      const revision = ++imageRevision;
      imagePending = true;
      submit.disabled = true;
      feedback.textContent = 'Checking the selected image...';
      const result = await inspectSubmissionImage(event.target.files[0]);
      if (revision !== imageRevision || !dialog.isConnected) return;
      imageError = result;
      imagePending = false;
      submit.disabled = false;
      feedback.textContent = result || 'Image ready to send.';
    }
  });
  form.addEventListener('submit', event => {
    clearErrors();
    const values = Object.fromEntries(FIELDS.map(([key]) => [key, key === 'image' ? form.elements.attachment.files[0] : form.elements[key].value.trim()]));
    values.reference = form.elements.reference.value.trim();
    const errors = validateSubmission(values, allowedCategories, { correction, selected: selectedKeys(), imageError });
    if (imagePending) errors.unshift({ key: 'image', message: 'Wait for the image check to finish.' });
    if (errors.length) {
      event.preventDefault();
      for (const { key, message } of errors) {
        const input = form.querySelector(`#suggest-${key}`);
        const target = dialog.querySelector(`#error-${key}`) || dialog.querySelector('#submission-error');
        target.textContent = message;
        target.hidden = false;
        if (input) { input.setAttribute('aria-invalid', 'true'); input.setAttribute('aria-describedby', target.id); }
      }
      (form.querySelector(`#suggest-${errors[0].key}`) || form.querySelector('[data-correct]'))?.focus();
      return;
    }
    for (const input of form.querySelectorAll('input:not([type=file]):not([type=checkbox]), select')) input.value = input.value.trim();
    feedback.textContent = 'Finish sending in the new tab, including any verification shown there. Your draft stays here. This page cannot confirm email delivery.';
  });
  dialog.addEventListener('click', event => { if (event.target === dialog || event.target.closest('[data-dismiss]')) dialog.close(); });
  const previousOverflow = document.body.style.overflow;
  document.body.style.overflow = 'hidden';
  dialog.addEventListener('close', () => { imageRevision += 1; document.body.style.overflow = previousOverflow; dialog.remove(); if (trigger?.isConnected) trigger.focus({ preventScroll: true }); }, { once: true });
  dialog.showModal();
  dialog.querySelector('#submission-title').focus({ preventScroll: true });
  dialog.querySelector('.panel-scroll').scrollTop = 0;
}
