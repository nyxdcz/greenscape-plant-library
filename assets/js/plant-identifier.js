const TRANSFORMERS_URL = 'https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.8.1';
const MODEL_ID = 'Xenova/clip-vit-base-patch32';
const GOOGLE_LENS_URL = 'https://lens.google.com/';
const PLANT_STORAGE_KEY = 'greenscape-plant-library-plants-v1';
const MAX_FILE_BYTES = 20 * 1024 * 1024;
const RESULT_LIMIT = 5;

const pageContent = document.getElementById('pageContent');
const pageTitle = document.getElementById('pageTitle');

let identifierOpen = false;
let selectedImage = null;
let classifier = null;
let classifierPromise = null;
let lastMatches = [];
let runNumber = 0;

const escapeHTML = value => String(value ?? '')
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#039;');

function safeImage(value) {
  const url = String(value || '').trim();
  if (/^(assets\/|data:image\/|https?:\/\/)/i.test(url)) return escapeHTML(url);
  return '';
}

function aiMark() {
  return '<span class="identifier-ai-mark" aria-hidden="true">AI</span>';
}

function installDashboardButton(root = document) {
  const actions = root.matches?.('.hero-actions') ? root : root.querySelector?.('.hero-actions');
  if (!actions || actions.querySelector('[data-identifier-open]')) return;

  actions.querySelector('[data-action="open-google-lens-identifier"]')?.remove();
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'button secondary greenscape-identifier-hero-button';
  button.dataset.identifierOpen = '';
  button.innerHTML = `${aiMark()}<span>Plant Identifier</span>`;
  actions.appendChild(button);
}

function identifierPageHTML() {
  return `
    <section class="plant-id-page" aria-label="Plant Identifier">
      <header class="plant-id-hero">
        <div>
          <span class="plant-id-kicker">${aiMark()} On-device plant matching</span>
          <h2>Upload a photo. Discover possible plant matches.</h2>
          <p>The recognition model downloads to your browser, compares the photo with the Greenscape plant library on this device, and ranks likely common and scientific names.</p>
        </div>
        <div class="plant-id-privacy-card" role="note">
          <strong>Your photo stays private</strong>
          <span>The image is processed in this browser. It is not uploaded to Greenscape or an identification server.</span>
        </div>
      </header>

      <div class="plant-id-flow">
        <section class="plant-id-card plant-id-upload-card">
          <header class="plant-id-card-header">
            <div>
              <h3>Upload plant photo</h3>
              <p>Use a clear photo of the leaf, flower, fruit, bark, or whole plant.</p>
            </div>
            <span class="plant-id-step">01</span>
          </header>
          <div class="plant-id-upload-body">
            <div class="plant-id-dropzone" id="plantIdentifierDropzone" aria-label="Plant photo upload area">
              <div id="plantIdentifierEmptyUpload">
                <span class="plant-id-camera" aria-hidden="true">PHOTO</span>
                <strong>Choose a plant photo</strong>
                <p>JPG, PNG, WEBP, HEIC, or another supported phone image · maximum 20 MB</p>
                <div class="plant-id-upload-actions">
                  <button class="button primary" type="button" data-identifier-action="choose-photo">Choose photo</button>
                </div>
              </div>
              <div class="plant-id-preview" id="plantIdentifierPreview" hidden>
                <img id="plantIdentifierPreviewImage" alt="Selected plant photo">
                <div class="plant-id-preview-actions">
                  <button class="button secondary small" type="button" data-identifier-action="replace-photo">Replace</button>
                  <button class="button secondary small" type="button" data-identifier-action="remove-photo">Remove</button>
                </div>
              </div>
            </div>
            <input id="plantIdentifierFileInput" type="file" accept="image/*" hidden>

            <div class="plant-id-tip"><strong>Photo tip</strong><span>Fill most of the frame with one plant and avoid busy backgrounds for a stronger comparison.</span></div>

            <div class="plant-id-progress" id="plantIdentifierProgress" aria-live="polite" hidden>
              <div class="plant-id-progress-copy">
                <span id="plantIdentifierProgressText">Preparing on-device model…</span>
                <span id="plantIdentifierProgressValue">0%</span>
              </div>
              <div class="plant-id-progress-track" aria-hidden="true"><div class="plant-id-progress-bar" id="plantIdentifierProgressBar"></div></div>
            </div>

            <div class="plant-id-error" id="plantIdentifierError" role="alert" hidden></div>
            <button class="button primary plant-id-analyze-button" id="plantIdentifierAnalyzeButton" type="button" disabled>Identify plant</button>
            <div class="plant-id-privacy-note"><strong>First use</strong><span>The browser downloads and caches a recognition model of about 160 MB. Later identifications reuse the cached model when available.</span></div>
          </div>
        </section>

        <section class="plant-id-card">
          <header class="plant-id-card-header">
            <div>
              <h3>Possible matches</h3>
              <p>Ranked against plant records currently available in the Greenscape library.</p>
            </div>
            <span class="plant-id-step">02</span>
          </header>
          <div class="plant-id-results-body" id="plantIdentifierResults">
            ${emptyResultsHTML()}
          </div>
        </section>
      </div>
    </section>`;
}

function emptyResultsHTML() {
  return `
    <div class="plant-id-results-empty">
      <div>
        ${aiMark()}
        <h4>Your matches will appear here</h4>
        <p>Choose a plant photo, then select <strong>Identify plant</strong>. The first analysis takes longer while the model downloads.</p>
      </div>
    </div>
    <div class="plant-id-warning"><strong>Important</strong><span>Results are visual suggestions, not a botanical confirmation. Never use them alone for edible, toxic, medicinal, or safety-critical decisions.</span></div>`;
}

function showIdentifierPage(pushHistory = true) {
  if (!pageContent || !pageTitle) return;
  identifierOpen = true;
  document.querySelectorAll('.nav-item').forEach(button => {
    button.classList.toggle('active', button.hasAttribute('data-identifier-nav'));
  });
  pageTitle.textContent = 'Plant Identifier';
  pageContent.innerHTML = identifierPageHTML();
  bindIdentifierPage();
  renderSelectedImage();
  if (lastMatches.length) renderMatches(lastMatches);
  if (pushHistory && location.hash !== '#identifier') {
    history.pushState({ greenscapeIdentifier: true }, '', '#identifier');
  }
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function bindIdentifierPage() {
  const input = document.getElementById('plantIdentifierFileInput');
  const analyzeButton = document.getElementById('plantIdentifierAnalyzeButton');
  const dropzone = document.getElementById('plantIdentifierDropzone');

  input?.addEventListener('change', event => handleFiles(event.target.files));
  analyzeButton?.addEventListener('click', analyzeSelectedImage);

  if (!dropzone) return;
  ['dragenter', 'dragover'].forEach(type => dropzone.addEventListener(type, event => {
    event.preventDefault();
    dropzone.classList.add('is-dragging');
  }));
  ['dragleave', 'drop'].forEach(type => dropzone.addEventListener(type, event => {
    event.preventDefault();
    dropzone.classList.remove('is-dragging');
  }));
  dropzone.addEventListener('drop', event => handleFiles(event.dataTransfer?.files));
  dropzone.addEventListener('click', event => {
    if (event.target.closest('button')) return;
    input?.click();
  });
}

async function handleFiles(fileList) {
  const file = fileList?.[0];
  if (!file) return;
  clearError();

  if (!String(file.type || '').startsWith('image/')) {
    showError('Choose an image file such as JPG, PNG, WEBP, HEIC, or HEIF.');
    clearFileInput();
    return;
  }
  if (file.size > MAX_FILE_BYTES) {
    showError('Choose a photo smaller than 20 MB.');
    clearFileInput();
    return;
  }

  try {
    selectedImage = await prepareImage(file);
    lastMatches = [];
    runNumber += 1;
    renderSelectedImage();
    resetResults();
  } catch (error) {
    selectedImage = null;
    renderSelectedImage();
    showError('This browser could not read the selected image. Try a JPG or PNG version.');
  }
}

function prepareImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      const source = String(reader.result || '');
      const image = new Image();
      image.onerror = reject;
      image.onload = () => {
        const maxSide = 1280;
        const scale = Math.min(1, maxSide / Math.max(image.naturalWidth, image.naturalHeight));
        const width = Math.max(1, Math.round(image.naturalWidth * scale));
        const height = Math.max(1, Math.round(image.naturalHeight * scale));
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const context = canvas.getContext('2d', { alpha: false });
        context.fillStyle = '#ffffff';
        context.fillRect(0, 0, width, height);
        context.drawImage(image, 0, 0, width, height);
        resolve({
          dataUrl: canvas.toDataURL('image/jpeg', .9),
          originalName: file.name,
          width,
          height
        });
      };
      image.src = source;
    };
    reader.readAsDataURL(file);
  });
}

function renderSelectedImage() {
  const empty = document.getElementById('plantIdentifierEmptyUpload');
  const preview = document.getElementById('plantIdentifierPreview');
  const image = document.getElementById('plantIdentifierPreviewImage');
  const analyzeButton = document.getElementById('plantIdentifierAnalyzeButton');
  if (!empty || !preview || !image || !analyzeButton) return;

  if (selectedImage?.dataUrl) {
    empty.hidden = true;
    preview.hidden = false;
    image.src = selectedImage.dataUrl;
    analyzeButton.disabled = false;
    analyzeButton.textContent = lastMatches.length ? 'Identify again' : 'Identify plant';
  } else {
    empty.hidden = false;
    preview.hidden = true;
    image.removeAttribute('src');
    analyzeButton.disabled = true;
    analyzeButton.textContent = 'Identify plant';
  }
}

function clearFileInput() {
  const input = document.getElementById('plantIdentifierFileInput');
  if (input) input.value = '';
}

function removeSelectedImage() {
  selectedImage = null;
  lastMatches = [];
  runNumber += 1;
  clearFileInput();
  clearError();
  hideProgress();
  renderSelectedImage();
  resetResults();
}

function resetResults() {
  const results = document.getElementById('plantIdentifierResults');
  if (results) results.innerHTML = emptyResultsHTML();
}

function currentPlants() {
  const seeds = Array.isArray(window.GREENSCAPE_PLANT_DATA) ? window.GREENSCAPE_PLANT_DATA : [];
  const seedById = new Map(seeds.map(plant => [String(plant.id || ''), plant]));
  let stored = [];

  try {
    const parsed = JSON.parse(localStorage.getItem(PLANT_STORAGE_KEY) || '[]');
    if (Array.isArray(parsed)) stored = parsed;
  } catch (error) {
    stored = [];
  }

  const records = stored.length
    ? stored.map(plant => {
      const seed = seedById.get(String(plant.id || '')) || {};
      return { ...seed, ...plant, image: plant.image || seed.image || '' };
    })
    : seeds;

  const seen = new Set();
  return records.filter(plant => {
    const commonName = String(plant.commonName || '').trim();
    const scientificName = String(plant.scientificName || '').trim();
    if (plant.isPlant === false || !commonName || !scientificName) return false;
    const key = scientificName.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function labelForPlant(plant) {
  return `${plant.commonName}, botanical name ${plant.scientificName}`;
}

async function analyzeSelectedImage() {
  if (!selectedImage?.dataUrl) {
    showError('Choose a plant photo first.');
    return;
  }

  const plants = currentPlants();
  if (!plants.length) {
    showError('No plant records with both common and scientific names are available for comparison.');
    return;
  }

  const activeRun = ++runNumber;
  clearError();
  setBusy(true);
  showProgress('Preparing the on-device recognition model…', 3);

  try {
    const model = await getClassifier();
    if (activeRun !== runNumber || !selectedImage) return;

    showProgress(`Analyzing photo against ${plants.length} library plants…`, 88);
    const labelMap = new Map(plants.map(plant => [labelForPlant(plant), plant]));
    const output = await model(selectedImage.dataUrl, [...labelMap.keys()]);
    if (activeRun !== runNumber || !selectedImage) return;

    lastMatches = output
      .slice(0, RESULT_LIMIT)
      .map(result => ({ plant: labelMap.get(result.label), score: Number(result.score || 0) }))
      .filter(match => match.plant);

    showProgress('Possible matches ready.', 100);
    renderMatches(lastMatches);
    window.setTimeout(() => {
      if (activeRun === runNumber) hideProgress();
    }, 700);
  } catch (error) {
    console.error('Plant Identifier model error:', error);
    showError('The on-device model could not load or run. Check the internet connection for the first download, then try again. Google Lens is still available as a separate verification option.');
    renderModelFailure();
    hideProgress();
  } finally {
    if (activeRun === runNumber) setBusy(false);
  }
}

async function getClassifier() {
  if (classifier) return classifier;
  if (classifierPromise) return classifierPromise;

  classifierPromise = (async () => {
    const { pipeline, env } = await import(TRANSFORMERS_URL);
    env.allowLocalModels = false;
    env.useBrowserCache = true;

    const model = await pipeline('zero-shot-image-classification', MODEL_ID, {
      dtype: 'q8',
      progress_callback: updateModelProgress
    });
    classifier = model;
    return model;
  })();

  try {
    return await classifierPromise;
  } catch (error) {
    classifierPromise = null;
    throw error;
  }
}

function updateModelProgress(event) {
  if (!identifierOpen || !event) return;
  const status = String(event.status || '');
  const progress = Number(event.progress);

  if (status === 'progress' && Number.isFinite(progress)) {
    const file = String(event.file || '').split('/').pop() || 'model file';
    showProgress(`Downloading ${file}…`, Math.max(4, Math.min(82, progress * .78)));
    return;
  }
  if (status === 'initiate') {
    showProgress('Checking the browser model cache…', 4);
    return;
  }
  if (status === 'done') {
    showProgress('Preparing the model for private on-device analysis…', 82);
  }
}

function showProgress(message, percent) {
  const root = document.getElementById('plantIdentifierProgress');
  const text = document.getElementById('plantIdentifierProgressText');
  const value = document.getElementById('plantIdentifierProgressValue');
  const bar = document.getElementById('plantIdentifierProgressBar');
  if (!root || !text || !value || !bar) return;
  const bounded = Math.max(0, Math.min(100, Number(percent) || 0));
  root.hidden = false;
  text.textContent = message;
  value.textContent = `${Math.round(bounded)}%`;
  bar.style.width = `${Math.max(4, bounded)}%`;
}

function hideProgress() {
  const root = document.getElementById('plantIdentifierProgress');
  if (root) root.hidden = true;
}

function setBusy(isBusy) {
  const button = document.getElementById('plantIdentifierAnalyzeButton');
  if (!button) return;
  button.disabled = isBusy || !selectedImage;
  button.textContent = isBusy ? 'Analyzing on this device…' : (lastMatches.length ? 'Identify again' : 'Identify plant');
  button.setAttribute('aria-busy', isBusy ? 'true' : 'false');
}

function renderMatches(matches) {
  const results = document.getElementById('plantIdentifierResults');
  if (!results) return;

  if (!matches.length) {
    results.innerHTML = `
      <div class="plant-id-results-empty">
        <div>${aiMark()}<h4>No strong library match found</h4><p>Try another angle or a closer photo. You can also check the photo separately in Google Lens.</p></div>
      </div>
      ${resultsFooterHTML()}`;
    return;
  }

  results.innerHTML = `
    <div class="plant-id-result-list" aria-label="Ranked plant matches">
      ${matches.map((match, index) => resultHTML(match, index)).join('')}
    </div>
    <div class="plant-id-warning"><strong>Review first</strong><span>Similarity scores compare this photo only with named plants in the Greenscape library. The correct species may be outside the current library.</span></div>
    ${resultsFooterHTML()}`;
}

function resultHTML(match, index) {
  const { plant, score } = match;
  const image = safeImage(plant.image);
  const initials = String(plant.commonName || 'PL')
    .split(/\s+/)
    .slice(0, 2)
    .map(part => part[0] || '')
    .join('')
    .toUpperCase();
  const scoreText = `${(score * 100).toFixed(score >= .1 ? 0 : 1)}%`;

  return `
    <article class="plant-id-result">
      <div class="plant-id-result-photo">
        ${image ? `<img src="${image}" alt="${escapeHTML(plant.commonName)}">` : `<span>${escapeHTML(initials)}</span>`}
        <b class="plant-id-rank">${index + 1}</b>
      </div>
      <div class="plant-id-result-content">
        <div class="plant-id-result-heading">
          <div>
            <h4>${escapeHTML(plant.commonName)}</h4>
            <p class="scientific">${escapeHTML(plant.scientificName)}</p>
          </div>
          <span class="plant-id-score" title="Visual similarity score">${scoreText}</span>
        </div>
        <div class="plant-id-result-meta">
          <span>${escapeHTML(plant.code || 'No code')}</span><span>·</span><span>${escapeHTML(plant.category || 'Plant')}</span>
        </div>
        <div class="plant-id-result-actions">
          <button class="button secondary small" type="button" data-action="plant-detail" data-plant-id="${escapeHTML(plant.id)}">View library record</button>
          <button class="button ghost small" type="button" data-identifier-action="copy-match" data-plant-id="${escapeHTML(plant.id)}">Copy names</button>
        </div>
      </div>
    </article>`;
}

function resultsFooterHTML() {
  return `
    <div class="plant-id-results-footer">
      <p>Google Lens opens separately and may process the photo under Google's services. You will need to choose the same image again there.</p>
      <button class="button secondary small" type="button" data-identifier-action="open-google-lens">Check in Google Lens ↗</button>
    </div>`;
}

function renderModelFailure() {
  const results = document.getElementById('plantIdentifierResults');
  if (!results) return;
  results.innerHTML = `
    <div class="plant-id-results-empty">
      <div>${aiMark()}<h4>On-device model unavailable</h4><p>Retry when the connection is stable, or use Google Lens as a separate fallback.</p></div>
    </div>
    ${resultsFooterHTML()}`;
}

function copyMatch(plantId) {
  const match = lastMatches.find(item => String(item.plant.id) === String(plantId));
  if (!match) return;
  const text = `${match.plant.commonName} — ${match.plant.scientificName}`;

  if (navigator.clipboard?.writeText) {
    navigator.clipboard.writeText(text)
      .then(() => showToast('Plant names copied.'))
      .catch(() => fallbackCopy(text));
    return;
  }
  fallbackCopy(text);
}

function fallbackCopy(text) {
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.setAttribute('readonly', '');
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.select();
  const copied = document.execCommand('copy');
  textarea.remove();
  showToast(copied ? 'Plant names copied.' : text);
}

function openGoogleLens() {
  const opened = window.open(GOOGLE_LENS_URL, '_blank', 'noopener,noreferrer');
  if (!opened) window.location.href = GOOGLE_LENS_URL;
}

function showError(message) {
  const error = document.getElementById('plantIdentifierError');
  if (!error) return;
  error.hidden = false;
  error.textContent = message;
}

function clearError() {
  const error = document.getElementById('plantIdentifierError');
  if (!error) return;
  error.hidden = true;
  error.textContent = '';
}

function showToast(message) {
  document.querySelector('.plant-id-toast')?.remove();
  const toast = document.createElement('div');
  toast.className = 'plant-id-toast';
  toast.setAttribute('role', 'status');
  toast.textContent = message;
  document.body.appendChild(toast);
  window.setTimeout(() => toast.remove(), 2600);
}

document.addEventListener('click', event => {
  const openButton = event.target.closest('[data-identifier-open], [data-identifier-nav]');
  if (openButton) {
    event.preventDefault();
    showIdentifierPage(true);
    return;
  }

  const viewButton = event.target.closest('[data-view]');
  if (viewButton && identifierOpen) identifierOpen = false;

  const actionTarget = event.target.closest('[data-identifier-action]');
  if (!actionTarget) return;
  const action = actionTarget.dataset.identifierAction;

  if (action === 'choose-photo' || action === 'replace-photo') {
    document.getElementById('plantIdentifierFileInput')?.click();
  }
  if (action === 'remove-photo') removeSelectedImage();
  if (action === 'copy-match') copyMatch(actionTarget.dataset.plantId);
  if (action === 'open-google-lens') openGoogleLens();
}, true);

const dashboardObserver = new MutationObserver(mutations => {
  mutations.forEach(mutation => mutation.addedNodes.forEach(node => {
    if (!(node instanceof Element)) return;
    if (node.matches('.hero-actions')) installDashboardButton(node);
    node.querySelectorAll?.('.hero-actions').forEach(installDashboardButton);
  }));
});

dashboardObserver.observe(pageContent || document.body, { childList: true, subtree: true });

function syncRoute() {
  if (location.hash === '#identifier') {
    if (identifierOpen && document.querySelector('.plant-id-page')) return;
    showIdentifierPage(false);
    return;
  }
  const wasIdentifierOpen = identifierOpen;
  identifierOpen = false;
  if (wasIdentifierOpen) {
    const view = location.hash.slice(1) || 'dashboard';
    const nav = document.querySelector(`[data-view="${CSS.escape(view)}"]`)
      || document.querySelector('[data-view="dashboard"]');
    nav?.click();
  }
}

window.addEventListener('popstate', syncRoute);
window.addEventListener('hashchange', syncRoute);

requestAnimationFrame(() => {
  installDashboardButton(document);
  if (location.hash === '#identifier') showIdentifierPage(false);
});
