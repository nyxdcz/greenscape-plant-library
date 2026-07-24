(function () {
  'use strict';

  const PROJECT_STORAGE_KEY = 'greenscape-plant-library-projects-v1';
  const PLANT_STORAGE_KEY = 'greenscape-plant-library-plants-v1';
  const BOQ_STORAGE_KEY = 'greenscape-plant-library-boq-v1';
  const DENSITY_IDS = ['100', '50', '35'];
  const SECTION_ORDER = [
    'PRELIMINARIES',
    'PALMS AND TREES',
    'AGAVE / CYCAD / YUCCA',
    'SHRUBS / FOLIAGE / CLIMBERS',
    'GRASS / GROUND COVER',
    'EARTHWORKS AND OTHER LANDSCAPING MATERIALS',
    'OTHER LANDSCAPE ITEMS'
  ];

  let activeProjectId = '';
  let activeDraft = null;
  let returnFocus = null;
  let saveTimer = null;

  function escapeHTML(value) {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function numberValue(value) {
    const parsed = Number(String(value ?? '').replace(/,/g, '').trim());
    return Number.isFinite(parsed) ? parsed : 0;
  }

  function formatNumber(value, maximumFractionDigits = 2) {
    return new Intl.NumberFormat('en-PH', { maximumFractionDigits }).format(numberValue(value));
  }

  function currency(value) {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(numberValue(value));
  }

  function uid(prefix) {
    return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  }

  function readJSON(key, fallback) {
    try {
      const value = localStorage.getItem(key);
      return value ? JSON.parse(value) : fallback;
    } catch (error) {
      return fallback;
    }
  }

  function writeJSON(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function projects() {
    const records = readJSON(PROJECT_STORAGE_KEY, []);
    return Array.isArray(records) ? records : [];
  }

  function plants() {
    const stored = readJSON(PLANT_STORAGE_KEY, null);
    if (Array.isArray(stored)) return stored;
    return Array.isArray(window.GREENSCAPE_PLANT_DATA) ? window.GREENSCAPE_PLANT_DATA : [];
  }

  function projectById(projectId) {
    return projects().find(project => String(project.id) === String(projectId));
  }

  function plantById(plantId) {
    return plants().find(plant => String(plant.id) === String(plantId));
  }

  function drafts() {
    const records = readJSON(BOQ_STORAGE_KEY, {});
    return records && typeof records === 'object' && !Array.isArray(records) ? records : {};
  }

  function inputDate(value) {
    const raw = String(value || '').trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;
    const date = raw ? new Date(raw) : new Date();
    if (Number.isNaN(date.getTime())) return new Date().toISOString().slice(0, 10);
    return date.toISOString().slice(0, 10);
  }

  function displayDate(value) {
    const date = new Date(`${inputDate(value)}T00:00:00`);
    return date.toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' });
  }

  function sectionForCategory(category) {
    const value = String(category || '').toLowerCase();
    if (value.includes('palm') || value.includes('tree') || value.includes('bamboo')) return 'PALMS AND TREES';
    if (value.includes('cycad') || value.includes('agave') || value.includes('yucca')) return 'AGAVE / CYCAD / YUCCA';
    if (value.includes('grass') || value.includes('groundcover')) return 'GRASS / GROUND COVER';
    if (value.includes('material')) return 'EARTHWORKS AND OTHER LANDSCAPING MATERIALS';
    if (value.includes('shrub') || value.includes('climber') || value.includes('fern') || value.includes('indoor') || value.includes('heliconia') || value.includes('aquatic')) {
      return 'SHRUBS / FOLIAGE / CLIMBERS';
    }
    return 'OTHER LANDSCAPE ITEMS';
  }

  function scaleMeasurement(value, factorPercent) {
    const raw = String(value || '').trim();
    if (!raw || numberValue(factorPercent) === 100) return raw;
    const factor = numberValue(factorPercent) / 100;
    return raw.replace(/\d+(?:\.\d+)?/g, match => {
      const scaled = numberValue(match) * factor;
      const rounded = Math.abs(scaled) >= 100 ? Math.round(scaled / 10) * 10 : Math.round(scaled * 10) / 10;
      return String(rounded).replace(/\.0$/, '');
    });
  }

  function defaultPresets() {
    return {
      '100': { label: '100% Density and Specs', densityPercent: 100, specPercent: 100, spacingPercent: 100, pricePercent: 100 },
      '50': { label: '50% Density and Specs', densityPercent: 50, specPercent: 83, spacingPercent: 115, pricePercent: 85 },
      '35': { label: '35% Density and Specs', densityPercent: 35, specPercent: 67, spacingPercent: 130, pricePercent: 70 }
    };
  }

  function preliminaryRows() {
    return [
      'Mobilization/Demobilization',
      'Power Consumption',
      "Owner's Supply",
      'Water Consumption',
      'Safety Requirements',
      'Workers Barracks',
      'Delivery and Hauling from Farms to Site'
    ].map((description, index) => ({
      id: uid('boq-row'),
      section: 'PRELIMINARIES',
      itemNo: `1.${index + 1}`,
      description,
      botanicalName: '',
      sourceType: 'manual',
      base: { spec: '', height: '', spread: '', area: '', spacing: '', quantity: description.includes('Delivery') ? 1 : 1, unit: description.includes('Delivery') ? 'trips' : 'lot', materialCost: 0, laborCost: 0 }
    }));
  }

  function earthworkRows() {
    return [
      { description: 'Garden Soil', unit: 'cu.m.' },
      { description: 'Root Booster, Fungicides & Fertilizer', unit: 'lot' },
      { description: 'Other items (please specify)', unit: 'lot' }
    ].map((item, index) => ({
      id: uid('boq-row'),
      section: 'EARTHWORKS AND OTHER LANDSCAPING MATERIALS',
      itemNo: `6.${index + 1}`,
      description: item.description,
      botanicalName: '',
      sourceType: 'manual',
      base: { spec: '', height: '', spread: '', area: '', spacing: '', quantity: 1, unit: item.unit, materialCost: 0, laborCost: 0 }
    }));
  }

  function projectRows(project) {
    const sourceItems = Array.isArray(project?.items) ? project.items : [];
    return sourceItems.map((item, index) => {
      const plant = plantById(item.plantId) || {};
      const category = plant.category || item.category || '';
      const section = sectionForCategory(category);
      return {
        id: `project-${item.id || uid('item')}`,
        section,
        itemNo: '',
        description: plant.commonName || item.commonName || 'Landscape item',
        botanicalName: plant.scientificName || plant.material || item.scientificName || '',
        sourceType: 'project',
        plantId: item.plantId || '',
        base: {
          spec: item.sizeLabel || '',
          height: plant.matureHeight || '',
          spread: plant.matureSpread || '',
          area: '',
          spacing: item.spacing || plant.spacing || '',
          quantity: Math.max(0, numberValue(item.quantity)),
          unit: item.unit || 'pc/s',
          materialCost: 0,
          laborCost: 0
        }
      };
    });
  }

  function scenarioFromBase(row, preset) {
    const isDensityItem = !['PRELIMINARIES', 'EARTHWORKS AND OTHER LANDSCAPING MATERIALS'].includes(row.section);
    const densityFactor = isDensityItem ? numberValue(preset.densityPercent) / 100 : 1;
    const priceFactor = isDensityItem ? numberValue(preset.pricePercent) / 100 : 1;
    return {
      spec: scaleMeasurement(row.base.spec, preset.specPercent),
      height: scaleMeasurement(row.base.height, preset.specPercent),
      spread: scaleMeasurement(row.base.spread, preset.specPercent),
      area: row.base.area || '',
      spacing: scaleMeasurement(row.base.spacing, preset.spacingPercent),
      quantity: isDensityItem ? Math.ceil(numberValue(row.base.quantity) * densityFactor) : numberValue(row.base.quantity),
      unit: row.base.unit || 'pc/s',
      materialCost: Math.round(numberValue(row.base.materialCost) * priceFactor * 100) / 100,
      laborCost: Math.round(numberValue(row.base.laborCost) * priceFactor * 100) / 100
    };
  }

  function generateScenarios(rows, presets) {
    const scenarios = {};
    DENSITY_IDS.forEach(id => {
      scenarios[id] = {};
      rows.forEach(row => { scenarios[id][row.id] = scenarioFromBase(row, presets[id]); });
    });
    return scenarios;
  }

  function createDraft(project) {
    const presets = defaultPresets();
    const rows = [...preliminaryRows(), ...projectRows(project), ...earthworkRows()];
    return {
      version: 1,
      projectId: String(project?.id || ''),
      projectName: String(project?.name || ''),
      location: String(project?.location || ''),
      subjectPrefix: 'BOQ for Landscape Works',
      contractor: 'GREENSCAPE LANDSCAPING SERVICES',
      date: new Date().toISOString().slice(0, 10),
      preparedBy: '',
      activeDensity: '100',
      presets,
      rows,
      scenarios: generateScenarios(rows, presets),
      vatPercent: 12,
      vatInclusive: true,
      notes: 'Final quantities, plant sizes, specifications, and unit costs are subject to supplier confirmation and site verification.',
      updatedAt: new Date().toISOString()
    };
  }

  function normalizeRow(row) {
    const base = row?.base && typeof row.base === 'object' ? row.base : {};
    return {
      id: String(row?.id || uid('boq-row')),
      section: SECTION_ORDER.includes(row?.section) ? row.section : 'OTHER LANDSCAPE ITEMS',
      itemNo: String(row?.itemNo || ''),
      description: String(row?.description || ''),
      botanicalName: String(row?.botanicalName || ''),
      sourceType: String(row?.sourceType || 'manual'),
      plantId: String(row?.plantId || ''),
      base: {
        spec: String(base.spec || ''),
        height: String(base.height || ''),
        spread: String(base.spread || ''),
        area: String(base.area || ''),
        spacing: String(base.spacing || ''),
        quantity: Math.max(0, numberValue(base.quantity)),
        unit: String(base.unit || 'pc/s'),
        materialCost: Math.max(0, numberValue(base.materialCost)),
        laborCost: Math.max(0, numberValue(base.laborCost))
      }
    };
  }

  function normalizeDraft(source, project) {
    const fresh = createDraft(project);
    if (!source || typeof source !== 'object') return fresh;
    const presets = { ...fresh.presets };
    DENSITY_IDS.forEach(id => { presets[id] = { ...fresh.presets[id], ...(source.presets?.[id] || {}) }; });
    const rows = Array.isArray(source.rows) && source.rows.length ? source.rows.map(normalizeRow) : fresh.rows;
    const scenarios = {};
    DENSITY_IDS.forEach(id => {
      scenarios[id] = {};
      rows.forEach(row => {
        const stored = source.scenarios?.[id]?.[row.id];
        scenarios[id][row.id] = stored && typeof stored === 'object'
          ? { ...scenarioFromBase(row, presets[id]), ...stored }
          : scenarioFromBase(row, presets[id]);
      });
    });
    return {
      ...fresh,
      ...source,
      projectId: String(project?.id || source.projectId || ''),
      projectName: String(source.projectName ?? project?.name ?? ''),
      location: String(source.location ?? project?.location ?? ''),
      activeDensity: DENSITY_IDS.includes(String(source.activeDensity)) ? String(source.activeDensity) : '100',
      presets,
      rows,
      scenarios,
      vatPercent: Math.max(0, numberValue(source.vatPercent ?? 12)),
      vatInclusive: source.vatInclusive !== false
    };
  }

  function activeScenario() {
    return activeDraft?.scenarios?.[activeDraft.activeDensity] || {};
  }

  function rowValues(row) {
    return activeScenario()[row.id] || scenarioFromBase(row, activeDraft.presets[activeDraft.activeDensity]);
  }

  function rowAmount(values) {
    return Math.max(0, numberValue(values.quantity)) * (Math.max(0, numberValue(values.materialCost)) + Math.max(0, numberValue(values.laborCost)));
  }

  function totalsForDensity(densityId) {
    const scenario = activeDraft.scenarios[densityId] || {};
    const sectionTotals = {};
    let subtotal = 0;
    activeDraft.rows.forEach(row => {
      const amount = rowAmount(scenario[row.id] || scenarioFromBase(row, activeDraft.presets[densityId]));
      sectionTotals[row.section] = (sectionTotals[row.section] || 0) + amount;
      subtotal += amount;
    });
    const rate = Math.max(0, numberValue(activeDraft.vatPercent));
    const vat = activeDraft.vatInclusive ? (rate ? subtotal * rate / (100 + rate) : 0) : subtotal * rate / 100;
    const grandTotal = activeDraft.vatInclusive ? subtotal : subtotal + vat;
    return { sectionTotals, subtotal, vat, grandTotal };
  }

  function ensureBackdrop() {
    let backdrop = document.getElementById('boqCreatorBackdrop');
    if (backdrop) return backdrop;
    backdrop = document.createElement('div');
    backdrop.id = 'boqCreatorBackdrop';
    backdrop.className = 'boq-backdrop';
    backdrop.hidden = true;
    backdrop.innerHTML = '<section class="boq-dialog" role="dialog" aria-modal="true" aria-labelledby="boqDialogTitle" tabindex="-1"><div id="boqDialogContent"></div></section>';
    document.body.appendChild(backdrop);
    return backdrop;
  }

  function densityTabsHTML() {
    return DENSITY_IDS.map(id => {
      const preset = activeDraft.presets[id];
      const totals = totalsForDensity(id);
      return `<button type="button" class="boq-density-tab${activeDraft.activeDensity === id ? ' active' : ''}" data-boq-density="${id}">
        <strong>${escapeHTML(preset.label)}</strong><span>${currency(totals.grandTotal)}</span>
      </button>`;
    }).join('');
  }

  function presetPanelHTML() {
    const id = activeDraft.activeDensity;
    const preset = activeDraft.presets[id];
    return `<section class="boq-panel boq-preset-panel">
      <div class="boq-panel-heading"><div><span>Automatic preset</span><strong>${escapeHTML(preset.label)}</strong></div><button type="button" class="button secondary small" data-boq-apply-preset>Recalculate current BOQ</button></div>
      <p>These are starting factors based on the three BOQ versions in your sample. Every row remains editable for actual supplier sizes and prices.</p>
      <div class="boq-preset-grid">
        <label><span>Density / quantity %</span><input type="number" min="0" step="1" data-boq-preset-field="densityPercent" value="${escapeHTML(preset.densityPercent)}"></label>
        <label><span>Plant specification %</span><input type="number" min="0" step="1" data-boq-preset-field="specPercent" value="${escapeHTML(preset.specPercent)}"></label>
        <label><span>Spacing adjustment %</span><input type="number" min="1" step="1" data-boq-preset-field="spacingPercent" value="${escapeHTML(preset.spacingPercent)}"></label>
        <label><span>Unit price adjustment %</span><input type="number" min="0" step="1" data-boq-preset-field="pricePercent" value="${escapeHTML(preset.pricePercent)}"></label>
      </div>
    </section>`;
  }

  function projectPanelHTML() {
    return `<section class="boq-panel">
      <div class="boq-panel-heading"><div><span>Project details</span><strong>BOQ information</strong></div><button type="button" class="button ghost small" data-boq-sync-project>Reset from project</button></div>
      <div class="boq-project-grid">
        <label><span>Project name</span><input data-boq-draft-field="projectName" value="${escapeHTML(activeDraft.projectName)}"></label>
        <label><span>Location</span><input data-boq-draft-field="location" value="${escapeHTML(activeDraft.location)}"></label>
        <label><span>Date</span><input type="date" data-boq-draft-field="date" value="${escapeHTML(inputDate(activeDraft.date))}"></label>
        <label><span>Prepared by</span><input data-boq-draft-field="preparedBy" value="${escapeHTML(activeDraft.preparedBy)}" placeholder="Name or team"></label>
        <label class="wide"><span>Contractor</span><input data-boq-draft-field="contractor" value="${escapeHTML(activeDraft.contractor)}"></label>
        <label class="wide"><span>Notes</span><textarea rows="2" data-boq-draft-field="notes">${escapeHTML(activeDraft.notes)}</textarea></label>
      </div>
    </section>`;
  }

  function sectionRows(section) {
    return activeDraft.rows.filter(row => row.section === section);
  }

  function rowHTML(row, index) {
    const values = rowValues(row);
    return `<tr data-boq-row-id="${escapeHTML(row.id)}">
      <td class="boq-row-number">${index + 1}</td>
      <td class="boq-description-cell"><input data-boq-shared-field="description" value="${escapeHTML(row.description)}"><input class="boq-botanical-input" data-boq-shared-field="botanicalName" value="${escapeHTML(row.botanicalName)}" placeholder="Botanical name"></td>
      <td><input data-boq-row-field="spec" value="${escapeHTML(values.spec)}" placeholder="Size/spec"></td>
      <td><input data-boq-row-field="height" value="${escapeHTML(values.height)}" placeholder="mm"></td>
      <td><input data-boq-row-field="spread" value="${escapeHTML(values.spread)}" placeholder="mm"></td>
      <td><input data-boq-row-field="area" value="${escapeHTML(values.area)}" placeholder="sq.m"></td>
      <td><input data-boq-row-field="spacing" value="${escapeHTML(values.spacing)}" placeholder="O.C."></td>
      <td><input type="number" min="0" step="0.01" data-boq-row-field="quantity" value="${escapeHTML(values.quantity)}"></td>
      <td><input data-boq-row-field="unit" value="${escapeHTML(values.unit)}"></td>
      <td><input type="number" min="0" step="0.01" data-boq-row-field="materialCost" value="${escapeHTML(values.materialCost)}"></td>
      <td><input type="number" min="0" step="0.01" data-boq-row-field="laborCost" value="${escapeHTML(values.laborCost)}"></td>
      <td class="boq-row-total" data-boq-row-total>${currency(rowAmount(values))}</td>
      <td><button type="button" class="boq-remove-row" data-boq-remove-row="${escapeHTML(row.id)}" aria-label="Remove ${escapeHTML(row.description || 'row')}">×</button></td>
    </tr>`;
  }

  function sectionHTML(section) {
    const rows = sectionRows(section);
    if (!rows.length && section === 'OTHER LANDSCAPE ITEMS') return '';
    const total = totalsForDensity(activeDraft.activeDensity).sectionTotals[section] || 0;
    return `<tbody class="boq-section" data-boq-section="${escapeHTML(section)}">
      <tr class="boq-section-header"><th colspan="13"><div><span>${escapeHTML(section)}</span><button type="button" data-boq-add-row="${escapeHTML(section)}">+ Add row</button></div></th></tr>
      ${rows.map(rowHTML).join('')}
      <tr class="boq-section-subtotal"><td colspan="11">Subtotal for ${escapeHTML(section)}</td><td data-boq-section-total="${escapeHTML(section)}">${currency(total)}</td><td></td></tr>
    </tbody>`;
  }

  function boqTableHTML() {
    return `<section class="boq-panel boq-table-panel">
      <div class="boq-table-heading"><div><span>Editable BOQ</span><strong>${escapeHTML(activeDraft.presets[activeDraft.activeDensity].label)}</strong></div><span>Material + labor/indirect cost × quantity</span></div>
      <div class="boq-table-scroll">
        <table class="boq-editor-table">
          <thead><tr><th>#</th><th>Description / Botanical name</th><th>Specs</th><th>Height</th><th>Spread</th><th>Area</th><th>Spacing</th><th>Qty</th><th>Unit</th><th>Material</th><th>Labor & indirect</th><th>Amount</th><th></th></tr></thead>
          ${SECTION_ORDER.map(sectionHTML).join('')}
        </table>
      </div>
    </section>`;
  }

  function summaryHTML() {
    const totals = totalsForDensity(activeDraft.activeDensity);
    return `<section class="boq-panel boq-summary-panel">
      <div class="boq-vat-controls">
        <label><span>VAT %</span><input type="number" min="0" step="0.01" data-boq-draft-field="vatPercent" value="${escapeHTML(activeDraft.vatPercent)}"></label>
        <label class="boq-checkbox"><input type="checkbox" data-boq-draft-field="vatInclusive"${activeDraft.vatInclusive ? ' checked' : ''}><span>Prices are VAT inclusive</span></label>
      </div>
      <div class="boq-summary-values">
        <div><span>Subtotal</span><strong data-boq-subtotal>${currency(totals.subtotal)}</strong></div>
        <div><span>${activeDraft.vatInclusive ? 'VAT component' : 'VAT added'}</span><strong data-boq-vat>${currency(totals.vat)}</strong></div>
        <div class="grand"><span>Grand total</span><strong data-boq-grand-total>${currency(totals.grandTotal)}</strong></div>
      </div>
    </section>`;
  }

  function dialogHTML() {
    return `<header class="boq-dialog-header">
      <div><span class="boq-kicker">Project BOQ</span><h2 id="boqDialogTitle">Automatic BOQ Creator</h2><p>Create 100%, 50%, and 35% density and specification options from one Project List.</p></div>
      <button type="button" class="boq-dialog-close" data-boq-close aria-label="Close BOQ creator">×</button>
    </header>
    <div class="boq-density-tabs">${densityTabsHTML()}</div>
    <main class="boq-dialog-body">
      ${projectPanelHTML()}
      ${presetPanelHTML()}
      ${boqTableHTML()}
      ${summaryHTML()}
    </main>
    <footer class="boq-dialog-footer">
      <span id="boqSaveStatus" role="status" aria-live="polite">Drafts are saved in this browser.</span>
      <div>
        <button type="button" class="button secondary" data-boq-export>Export all density CSV</button>
        <button type="button" class="button secondary" data-boq-save>Save draft</button>
        <button type="button" class="button primary" data-boq-print>Print / Save current BOQ</button>
      </div>
    </footer>`;
  }

  function openCreator(projectId) {
    const project = projectById(projectId);
    if (!project) return;
    activeProjectId = String(project.id);
    returnFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    activeDraft = normalizeDraft(drafts()[activeProjectId], project);
    const backdrop = ensureBackdrop();
    document.getElementById('boqDialogContent').innerHTML = dialogHTML();
    backdrop.hidden = false;
    document.body.classList.add('boq-open');
    backdrop.querySelector('.boq-dialog')?.focus({ preventScroll: true });
  }

  function closeCreator() {
    clearTimeout(saveTimer);
    if (activeDraft) saveDraft(false);
    const backdrop = ensureBackdrop();
    backdrop.hidden = true;
    document.body.classList.remove('boq-open');
    activeProjectId = '';
    activeDraft = null;
    const target = returnFocus;
    returnFocus = null;
    if (target?.isConnected) requestAnimationFrame(() => target.focus({ preventScroll: true }));
  }

  function setStatus(message, error) {
    const node = document.getElementById('boqSaveStatus');
    if (!node) return;
    node.textContent = message;
    node.classList.toggle('is-error', Boolean(error));
  }

  function saveDraft(showMessage = true) {
    if (!activeDraft || !activeProjectId) return;
    try {
      activeDraft.updatedAt = new Date().toISOString();
      const allDrafts = drafts();
      allDrafts[activeProjectId] = activeDraft;
      writeJSON(BOQ_STORAGE_KEY, allDrafts);
      if (showMessage) setStatus(`Draft saved ${new Date().toLocaleTimeString('en-PH', { hour: 'numeric', minute: '2-digit' })}.`);
    } catch (error) {
      setStatus('Could not save the BOQ draft in this browser.', true);
    }
  }

  function queueSave() {
    clearTimeout(saveTimer);
    setStatus('Saving changes…');
    saveTimer = setTimeout(() => saveDraft(true), 650);
  }

  function rerender() {
    if (!activeDraft) return;
    document.getElementById('boqDialogContent').innerHTML = dialogHTML();
  }

  function updateVisibleTotals() {
    if (!activeDraft) return;
    const totals = totalsForDensity(activeDraft.activeDensity);
    document.querySelectorAll('[data-boq-row-id]').forEach(rowNode => {
      const row = activeDraft.rows.find(record => record.id === rowNode.dataset.boqRowId);
      if (!row) return;
      const totalNode = rowNode.querySelector('[data-boq-row-total]');
      if (totalNode) totalNode.textContent = currency(rowAmount(rowValues(row)));
    });
    document.querySelectorAll('[data-boq-section-total]').forEach(node => {
      node.textContent = currency(totals.sectionTotals[node.dataset.boqSectionTotal] || 0);
    });
    const subtotal = document.querySelector('[data-boq-subtotal]');
    const vat = document.querySelector('[data-boq-vat]');
    const grand = document.querySelector('[data-boq-grand-total]');
    if (subtotal) subtotal.textContent = currency(totals.subtotal);
    if (vat) vat.textContent = currency(totals.vat);
    if (grand) grand.textContent = currency(totals.grandTotal);
    document.querySelectorAll('.boq-density-tab').forEach(tab => {
      const id = tab.dataset.boqDensity;
      const span = tab.querySelector('span');
      if (span) span.textContent = currency(totalsForDensity(id).grandTotal);
    });
  }

  function applyPreset() {
    if (!activeDraft) return;
    const id = activeDraft.activeDensity;
    if (!confirm(`Recalculate ${activeDraft.presets[id].label} from the base project quantities and specifications? Manual edits in this density option will be replaced.`)) return;
    activeDraft.rows.forEach(row => { activeDraft.scenarios[id][row.id] = scenarioFromBase(row, activeDraft.presets[id]); });
    rerender();
    saveDraft(true);
  }

  function switchDensity(id) {
    if (!activeDraft || !DENSITY_IDS.includes(id)) return;
    activeDraft.activeDensity = id;
    rerender();
    queueSave();
  }

  function addRow(section) {
    if (!activeDraft || !SECTION_ORDER.includes(section)) return;
    const row = normalizeRow({ id: uid('boq-row'), section, description: '', sourceType: 'manual', base: { quantity: 1, unit: section === 'EARTHWORKS AND OTHER LANDSCAPING MATERIALS' ? 'lot' : 'pc/s' } });
    activeDraft.rows.push(row);
    DENSITY_IDS.forEach(id => { activeDraft.scenarios[id][row.id] = scenarioFromBase(row, activeDraft.presets[id]); });
    rerender();
    requestAnimationFrame(() => document.querySelector(`[data-boq-row-id="${CSS.escape(row.id)}"] [data-boq-shared-field="description"]`)?.focus());
    queueSave();
  }

  function removeRow(rowId) {
    if (!activeDraft) return;
    const row = activeDraft.rows.find(record => record.id === rowId);
    if (!row || !confirm(`Remove “${row.description || 'this row'}” from all three BOQ options?`)) return;
    activeDraft.rows = activeDraft.rows.filter(record => record.id !== rowId);
    DENSITY_IDS.forEach(id => { delete activeDraft.scenarios[id][rowId]; });
    rerender();
    queueSave();
  }

  function resetFromProject() {
    const project = projectById(activeProjectId);
    if (!project || !confirm('Reset the BOQ using the latest Project List plants and quantities? This replaces all saved BOQ edits for this project.')) return;
    activeDraft = createDraft(project);
    rerender();
    saveDraft(true);
  }

  function csvCell(value) {
    const text = String(value ?? '');
    const safe = /^[\s]*[=+\-@\t\r]/.test(text) ? `'${text}` : text;
    return `"${safe.replace(/"/g, '""')}"`;
  }

  function downloadBlob(content, filename, type) {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function slug(value) {
    return String(value || 'landscape-boq').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'landscape-boq';
  }

  function exportCSV() {
    if (!activeDraft) return;
    const headers = ['Density Option', 'Section', 'Description', 'Botanical Name', 'Specifications', 'Height', 'Spread', 'Area', 'Spacing', 'Quantity', 'Unit', 'Material Unit Cost', 'Labor & Indirect Unit Cost', 'Total Unit Cost', 'Amount'];
    const rows = [];
    DENSITY_IDS.forEach(id => {
      activeDraft.rows.forEach(row => {
        const values = activeDraft.scenarios[id][row.id];
        rows.push([
          activeDraft.presets[id].label, row.section, row.description, row.botanicalName, values.spec, values.height, values.spread,
          values.area, values.spacing, values.quantity, values.unit, values.materialCost, values.laborCost,
          numberValue(values.materialCost) + numberValue(values.laborCost), rowAmount(values)
        ]);
      });
    });
    const csv = [headers, ...rows].map(row => row.map(csvCell).join(',')).join('\r\n');
    downloadBlob(`\ufeff${csv}`, `${slug(activeDraft.projectName)}-boq-100-50-35.csv`, 'text/csv;charset=utf-8');
    setStatus('All three density options exported as CSV.');
  }

  function printableRowsHTML(densityId) {
    const scenario = activeDraft.scenarios[densityId];
    return SECTION_ORDER.map(section => {
      const rows = activeDraft.rows.filter(row => row.section === section);
      if (!rows.length) return '';
      const body = rows.map((row, index) => {
        const values = scenario[row.id];
        const unitCost = numberValue(values.materialCost) + numberValue(values.laborCost);
        return `<tr><td>${index + 1}</td><td><strong>${escapeHTML(row.description || 'Untitled item')}</strong>${row.botanicalName ? `<small>${escapeHTML(row.botanicalName)}</small>` : ''}</td><td>${escapeHTML(values.spec || '')}</td><td>${escapeHTML(values.height || '')}</td><td>${escapeHTML(values.spread || '')}</td><td>${escapeHTML(values.area || '')}</td><td>${escapeHTML(values.spacing || '')}</td><td>${formatNumber(values.quantity)}</td><td>${escapeHTML(values.unit || '')}</td><td>${currency(values.materialCost)}</td><td>${currency(values.laborCost)}</td><td>${currency(unitCost)}</td><td>${currency(rowAmount(values))}</td></tr>`;
      }).join('');
      const subtotal = totalsForDensity(densityId).sectionTotals[section] || 0;
      return `<tbody><tr class="print-section"><th colspan="13">${escapeHTML(section)}</th></tr>${body}<tr class="print-subtotal"><td colspan="12">SUBTOTAL FOR ${escapeHTML(section)}</td><td>${currency(subtotal)}</td></tr></tbody>`;
    }).join('');
  }

  function printStyles() {
    return `*{box-sizing:border-box}body{margin:0;color:#152e25;font-family:Arial,Helvetica,sans-serif;background:#fff}.page{width:297mm;min-height:210mm;margin:0 auto;padding:10mm}.header{display:grid;grid-template-columns:1fr 1.4fr;gap:8mm;border-bottom:2px solid #164f3a;padding-bottom:5mm}.logo{width:72mm}.company{font-size:8pt;line-height:1.45}.company strong{font-size:11pt}.title{text-align:right}.title h1{margin:0;color:#154c38;font-size:20pt}.meta{display:grid;grid-template-columns:28mm 1fr;gap:1mm 3mm;margin-top:3mm;font-size:8pt}.meta dt{color:#5e7069}.meta dd{margin:0;font-weight:700}.project{display:grid;grid-template-columns:1fr 1fr;gap:3mm 8mm;padding:4mm 0;font-size:8.5pt}.project div{border-bottom:1px solid #cfd9d4;padding-bottom:2mm}.project span{display:block;color:#65776f;font-size:7pt;text-transform:uppercase;letter-spacing:.06em}.project strong{display:block;margin-top:1mm}.boq{width:100%;border-collapse:collapse;font-size:6.2pt}.boq th,.boq td{border:1px solid #8fa69b;padding:1.4mm 1.2mm;vertical-align:top}.boq thead th{background:#174f3b;color:#fff;text-align:center}.boq td:nth-child(1),.boq td:nth-child(n+3){text-align:center}.boq td:nth-child(n+10){text-align:right;white-space:nowrap}.boq small{display:block;margin-top:.8mm;color:#53675e;font-style:italic}.print-section th{background:#c7d9cf;color:#123f2e;text-align:left;font-size:7pt}.print-subtotal td{background:#e7efeb;font-weight:700;text-align:right!important}.summary{width:92mm;margin:5mm 0 0 auto;border:1px solid #8fa69b}.summary div{display:flex;justify-content:space-between;padding:2mm 3mm;border-bottom:1px solid #cbd7d1;font-size:8pt}.summary div:last-child{border:0;background:#174f3b;color:#fff;font-size:10pt}.note{margin-top:5mm;font-size:7.5pt;line-height:1.45}.signature{display:grid;grid-template-columns:1fr 1fr;gap:30mm;margin-top:14mm;font-size:8pt}.signature div{border-top:1px solid #344e43;padding-top:2mm}@page{size:A4 landscape;margin:0}@media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact}.page{page-break-after:auto}}`;
  }

  function printCurrent() {
    if (!activeDraft) return;
    saveDraft(false);
    const id = activeDraft.activeDensity;
    const preset = activeDraft.presets[id];
    const totals = totalsForDensity(id);
    const logo = new URL('assets/images/greenscape-logo.png', location.href).href;
    const subject = `${activeDraft.subjectPrefix} (${preset.label})`;
    const html = `<!doctype html><html><head><meta charset="utf-8"><title>${escapeHTML(activeDraft.projectName)} - ${escapeHTML(preset.label)}</title><style>${printStyles()}</style></head><body><article class="page">
      <header class="header"><div><img class="logo" src="${escapeHTML(logo)}" alt="Greenscape"><div class="company"><strong>GREENSCAPE LANDSCAPING SERVICES</strong><br>Palawan, Philippines<br>greenscapepalawan@gmail.com<br>(048) 434-0911 / +63 917 844 3330</div></div><div class="title"><h1>BILL OF QUANTITIES</h1><dl class="meta"><dt>Date</dt><dd>${escapeHTML(displayDate(activeDraft.date))}</dd><dt>Density option</dt><dd>${escapeHTML(preset.label)}</dd></dl></div></header>
      <section class="project"><div><span>Project name</span><strong>${escapeHTML(activeDraft.projectName || '—')}</strong></div><div><span>Location</span><strong>${escapeHTML(activeDraft.location || '—')}</strong></div><div><span>Subject</span><strong>${escapeHTML(subject)}</strong></div><div><span>Contractor</span><strong>${escapeHTML(activeDraft.contractor || '—')}</strong></div></section>
      <table class="boq"><thead><tr><th>Item</th><th>Description / Botanical Name</th><th>Specs</th><th>Height</th><th>Spread</th><th>Area</th><th>Spacing</th><th>Qty</th><th>Unit</th><th>Material</th><th>Labor & Indirect</th><th>Total Unit Cost</th><th>Total Amount</th></tr></thead>${printableRowsHTML(id)}</table>
      <section class="summary"><div><span>Subtotal</span><strong>${currency(totals.subtotal)}</strong></div><div><span>${activeDraft.vatInclusive ? `VAT component (${formatNumber(activeDraft.vatPercent)}%)` : `VAT added (${formatNumber(activeDraft.vatPercent)}%)`}</span><strong>${currency(totals.vat)}</strong></div><div><span>GRAND TOTAL</span><strong>${currency(totals.grandTotal)}</strong></div></section>
      <p class="note"><strong>Notes:</strong> ${escapeHTML(activeDraft.notes || '—')} ${activeDraft.vatInclusive ? 'Amounts are VAT inclusive.' : 'VAT is added to the subtotal.'}</p>
      <footer class="signature"><div><strong>${escapeHTML(activeDraft.preparedBy || 'Prepared by')}</strong><br>Bidder / Authorized Representative</div><div><strong>Client approval</strong><br>Printed Name & Signature</div></footer>
    </article><script>window.addEventListener('load',()=>setTimeout(()=>window.print(),250));<\/script></body></html>`;
    const printWindow = window.open('', '_blank', 'noopener,noreferrer');
    if (!printWindow) { setStatus('Pop-up blocked. Allow pop-ups to print the BOQ.', true); return; }
    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
  }

  function ensureLaunchButtons() {
    document.querySelectorAll('.project-card-actions').forEach(actions => {
      if (actions.querySelector('[data-boq-open]')) return;
      const projectButton = actions.querySelector('[data-project-id]');
      const projectId = projectButton?.dataset.projectId;
      if (!projectId) return;
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'button secondary small boq-launch-button';
      button.dataset.boqOpen = projectId;
      button.textContent = 'BOQ';
      actions.appendChild(button);
    });
    document.querySelectorAll('.detail-actions').forEach(actions => {
      if (actions.querySelector('[data-boq-open]')) return;
      const projectButton = actions.querySelector('[data-project-id]');
      const projectId = projectButton?.dataset.projectId;
      if (!projectId) return;
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'button secondary boq-launch-button';
      button.dataset.boqOpen = projectId;
      button.textContent = 'Create BOQ';
      const quotationButton = actions.querySelector('[data-quotation-open]');
      if (quotationButton) quotationButton.after(button);
      else actions.insertBefore(button, actions.lastElementChild || null);
    });
  }

  document.addEventListener('click', event => {
    const openButton = event.target.closest('[data-boq-open]');
    if (openButton) { event.preventDefault(); event.stopPropagation(); openCreator(openButton.dataset.boqOpen); return; }
    if (!activeDraft) return;
    if (event.target.closest('[data-boq-close]')) { closeCreator(); return; }
    const density = event.target.closest('[data-boq-density]');
    if (density) { switchDensity(density.dataset.boqDensity); return; }
    if (event.target.closest('[data-boq-apply-preset]')) { applyPreset(); return; }
    if (event.target.closest('[data-boq-sync-project]')) { resetFromProject(); return; }
    const addRowButton = event.target.closest('[data-boq-add-row]');
    if (addRowButton) { addRow(addRowButton.dataset.boqAddRow); return; }
    const removeRowButton = event.target.closest('[data-boq-remove-row]');
    if (removeRowButton) { removeRow(removeRowButton.dataset.boqRemoveRow); return; }
    if (event.target.closest('[data-boq-save]')) { saveDraft(true); return; }
    if (event.target.closest('[data-boq-export]')) { exportCSV(); return; }
    if (event.target.closest('[data-boq-print]')) { printCurrent(); }
  }, true);

  document.addEventListener('input', event => {
    if (!activeDraft || !event.target.closest('#boqCreatorBackdrop')) return;
    const presetField = event.target.dataset.boqPresetField;
    if (presetField) {
      activeDraft.presets[activeDraft.activeDensity][presetField] = Math.max(0, numberValue(event.target.value));
      queueSave();
      return;
    }
    const draftField = event.target.dataset.boqDraftField;
    if (draftField) {
      activeDraft[draftField] = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
      updateVisibleTotals();
      queueSave();
      return;
    }
    const rowNode = event.target.closest('[data-boq-row-id]');
    if (!rowNode) return;
    const row = activeDraft.rows.find(record => record.id === rowNode.dataset.boqRowId);
    if (!row) return;
    const sharedField = event.target.dataset.boqSharedField;
    if (sharedField) row[sharedField] = event.target.value;
    const rowField = event.target.dataset.boqRowField;
    if (rowField) activeDraft.scenarios[activeDraft.activeDensity][row.id][rowField] = ['quantity', 'materialCost', 'laborCost'].includes(rowField) ? Math.max(0, numberValue(event.target.value)) : event.target.value;
    updateVisibleTotals();
    queueSave();
  });

  document.addEventListener('change', event => {
    if (!activeDraft || !event.target.closest('#boqCreatorBackdrop')) return;
    const draftField = event.target.dataset.boqDraftField;
    if (draftField && event.target.type === 'checkbox') {
      activeDraft[draftField] = event.target.checked;
      rerender();
      queueSave();
    }
  });

  document.addEventListener('keydown', event => {
    if (!activeDraft) return;
    if (event.key === 'Escape') { event.preventDefault(); closeCreator(); }
  });

  const content = document.getElementById('pageContent');
  if (content && 'MutationObserver' in window) {
    new MutationObserver(() => requestAnimationFrame(ensureLaunchButtons)).observe(content, { childList: true, subtree: true });
  }
  window.addEventListener('hashchange', () => requestAnimationFrame(ensureLaunchButtons));
  requestAnimationFrame(ensureLaunchButtons);
})();
