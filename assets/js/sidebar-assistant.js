(function () {
  const STORAGE_KEYS = {
    view: 'greenscape-library-default-view',
    sort: 'greenscape-library-default-sort',
    petHidden: 'greenscape-sidebar-pet-hidden'
  };

  const PANEL_ID = 'sidebarSettingsPanel';

  function qs(sel, root = document) { return root.querySelector(sel); }
  function qsa(sel, root = document) { return Array.from(root.querySelectorAll(sel)); }

  function currentPageTitle() {
    return (qs('#pageTitle')?.textContent || '').trim().toLowerCase();
  }

  function isLibraryViewActive() {
    return currentPageTitle() === 'plant library' || location.hash === '#library' || !!qs('#plantGrid');
  }

  function openHelpPanel() {
    const panel = qs('#feedbackPanel');
    const toggle = qs('#feedbackToggle');
    if (!panel || !toggle) return;
    if (panel.hidden) {
      toggle.click();
    } else {
      panel.hidden = false;
      toggle.setAttribute('aria-expanded', 'true');
    }
  }

  function savePref(key, value) {
    try { localStorage.setItem(key, value); } catch (e) {}
  }

  function readPref(key, fallback) {
    try { return localStorage.getItem(key) || fallback; } catch (e) { return fallback; }
  }

  function ensureSettingsPanel() {
    if (qs('#' + PANEL_ID)) return qs('#' + PANEL_ID);
    const panel = document.createElement('section');
    panel.id = PANEL_ID;
    panel.className = 'sidebar-settings-panel';
    panel.hidden = true;
    panel.innerHTML = `
      <div class="sidebar-settings-backdrop" data-sidebar-close="settings"></div>
      <div class="sidebar-settings-dialog" role="dialog" aria-modal="true" aria-labelledby="sidebarSettingsTitle">
        <button class="sidebar-settings-close" type="button" aria-label="Close settings" data-sidebar-close="settings">×</button>
        <p class="sidebar-settings-kicker">Interface preferences</p>
        <h2 id="sidebarSettingsTitle">Settings</h2>
        <div class="sidebar-settings-group">
          <label for="sidebarDefaultView">Default Plant Library view</label>
          <select id="sidebarDefaultView">
            <option value="grid">Grid</option>
            <option value="list">List</option>
          </select>
        </div>
        <div class="sidebar-settings-group">
          <label for="sidebarDefaultSort">Default Plant Library sort</label>
          <select id="sidebarDefaultSort">
            <option value="az">Sort: A–Z</option>
            <option value="za">Sort: Z–A</option>
          </select>
        </div>
        <div class="sidebar-settings-actions">
          <button type="button" class="button secondary" id="sidebarResetSettings">Restore defaults</button>
          <button type="button" class="button primary" id="sidebarSaveSettings">Save settings</button>
        </div>
      </div>
    `;
    document.body.appendChild(panel);

    qs('#sidebarDefaultView', panel).value = readPref(STORAGE_KEYS.view, 'grid');
    qs('#sidebarDefaultSort', panel).value = readPref(STORAGE_KEYS.sort, 'az');

    panel.addEventListener('click', (event) => {
      const close = event.target.closest('[data-sidebar-close="settings"]');
      if (close) hideSettingsPanel();
    });

    qs('#sidebarResetSettings', panel).addEventListener('click', () => {
      qs('#sidebarDefaultView', panel).value = 'grid';
      qs('#sidebarDefaultSort', panel).value = 'az';
    });

    qs('#sidebarSaveSettings', panel).addEventListener('click', () => {
      savePref(STORAGE_KEYS.view, qs('#sidebarDefaultView', panel).value);
      savePref(STORAGE_KEYS.sort, qs('#sidebarDefaultSort', panel).value);
      applyLibraryDefaults(true);
      hideSettingsPanel();
    });

    return panel;
  }

  function showSettingsPanel() {
    const panel = ensureSettingsPanel();
    qs('#sidebarDefaultView', panel).value = readPref(STORAGE_KEYS.view, 'grid');
    qs('#sidebarDefaultSort', panel).value = readPref(STORAGE_KEYS.sort, 'az');
    panel.hidden = false;
    document.body.classList.add('sidebar-settings-open');
  }

  function hideSettingsPanel() {
    const panel = qs('#' + PANEL_ID);
    if (!panel) return;
    panel.hidden = true;
    document.body.classList.remove('sidebar-settings-open');
  }

  function applyLibraryDefaults(force) {
    if (!isLibraryViewActive()) return;
    const toolbar = qs('.library-reference-toolbar, .library-toolbar, .toolbar');
    if (!toolbar) return;
    if (toolbar.dataset.sidebarDefaultsApplied === '1' && !force) return;

    const sort = readPref(STORAGE_KEYS.sort, 'az');
    const view = readPref(STORAGE_KEYS.view, 'grid');

    const sortSelect = qs('#librarySort');
    if (sortSelect && sortSelect.value !== sort) {
      sortSelect.value = sort;
      sortSelect.dispatchEvent(new Event('change', { bubbles: true }));
    }

    const viewButton = qs(`[data-action="library-view"][data-library-view="${view}"]`);
    if (viewButton && viewButton.getAttribute('aria-pressed') !== 'true') {
      viewButton.click();
    }

    toolbar.dataset.sidebarDefaultsApplied = '1';
  }

  function reorderPlantNames(root = document) {
    qsa('#plantGrid .plant-card, #plantGrid .plant-list-card', root).forEach((card) => {
      const name = qs('.plant-common-name', card) || qs('h2', card);
      const scientific = qs('.scientific', card);
      if (!name || !scientific) return;
      if (scientific.previousElementSibling === name) return;
      const parent = name.parentElement;
      if (!parent) return;
      parent.insertBefore(scientific, name);
      scientific.classList.add('scientific-name-top');
      name.classList.add('common-name-bottom');
    });
  }

  function petIsHidden() {
    return readPref(STORAGE_KEYS.petHidden, '0') === '1';
  }

  function hidePetCard() {
    savePref(STORAGE_KEYS.petHidden, '1');
    qs('.sidebar-pet-card')?.setAttribute('hidden', 'hidden');
  }

  function ensureSidebarUtilities() {
    const sidebar = qs('.sidebar');
    const nav = qs('.nav-list', sidebar || document);
    if (!sidebar || !nav || qs('.sidebar-utility-section', sidebar)) return;

    const section = document.createElement('div');
    section.className = 'sidebar-utility-section';
    section.innerHTML = `
      <div class="sidebar-utility-divider" aria-hidden="true"></div>
      <button type="button" class="sidebar-utility-button" data-sidebar-action="settings">
        <span class="sidebar-utility-icon">⚙</span>
        <span>Settings</span>
      </button>
      <button type="button" class="sidebar-utility-button" data-sidebar-action="help">
        <span class="sidebar-utility-icon">?</span>
        <span>Help &amp; Support</span>
      </button>
      <div class="sidebar-pet-card" ${petIsHidden() ? 'hidden' : ''}>
        <button type="button" class="sidebar-pet-close" aria-label="Hide Greenie assistant" data-sidebar-action="hide-pet">×</button>
        <img class="sidebar-pet-gif" src="assets/images/greenscape-pet.gif" alt="Greenie animated assistant" width="64" height="64">
        <h3>Hi! I’m Greenie 🌿</h3>
        <p>Need help finding the perfect plant?</p>
        <button type="button" class="sidebar-pet-cta" data-sidebar-action="help">Ask me anything</button>
      </div>
    `;

    nav.insertAdjacentElement('afterend', section);

    section.addEventListener('click', (event) => {
      const button = event.target.closest('[data-sidebar-action]');
      if (!button) return;
      const action = button.dataset.sidebarAction;
      if (action === 'settings') showSettingsPanel();
      if (action === 'help') openHelpPanel();
      if (action === 'hide-pet') hidePetCard();
    });
  }

  function onReady() {
    document.body.classList.add('sidebar-assistant-enhanced');
    ensureSettingsPanel();
    ensureSidebarUtilities();
    reorderPlantNames();
    applyLibraryDefaults(false);

    const observer = new MutationObserver(() => {
      ensureSidebarUtilities();
      reorderPlantNames();
      applyLibraryDefaults(false);
    });

    const pageContent = qs('#pageContent') || document.body;
    observer.observe(pageContent, { childList: true, subtree: true });

    window.addEventListener('hashchange', () => {
      setTimeout(() => {
        reorderPlantNames();
        applyLibraryDefaults(true);
      }, 80);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', onReady, { once: true });
  } else {
    onReady();
  }
})();
