(function () {
  const STORAGE_KEYS = {
    view: 'greenscape-library-default-view',
    sort: 'greenscape-library-default-sort'
  };

  const SESSION_KEYS = {
    petHidden: 'greenscape-sidebar-pet-hidden'
  };

  const PANEL_ID = 'sidebarSettingsPanel';

  function qs(selector, root = document) {
    return root.querySelector(selector);
  }

  function qsa(selector, root = document) {
    return Array.from(root.querySelectorAll(selector));
  }

  function currentPageTitle() {
    return (qs('#pageTitle')?.textContent || '').trim().toLowerCase();
  }

  function isLibraryViewActive() {
    return currentPageTitle() === 'plant library'
      || location.hash === '#library'
      || Boolean(qs('#plantGrid'));
  }

  function savePreference(key, value) {
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      // Local preferences are optional.
    }
  }

  function readPreference(key, fallback) {
    try {
      return localStorage.getItem(key) || fallback;
    } catch (error) {
      return fallback;
    }
  }

  function saveSessionValue(key, value) {
    try {
      sessionStorage.setItem(key, value);
    } catch (error) {
      // Session preferences are optional.
    }
  }

  function readSessionValue(key, fallback) {
    try {
      return sessionStorage.getItem(key) || fallback;
    } catch (error) {
      return fallback;
    }
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

    window.setTimeout(() => {
      qs('#feedbackMessage')?.focus();
    }, 80);
  }

  function ensureSettingsPanel() {
    const existing = qs('#' + PANEL_ID);
    if (existing) return existing;

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

    qs('#sidebarDefaultView', panel).value = readPreference(STORAGE_KEYS.view, 'grid');
    qs('#sidebarDefaultSort', panel).value = readPreference(STORAGE_KEYS.sort, 'az');

    panel.addEventListener('click', (event) => {
      if (event.target.closest('[data-sidebar-close="settings"]')) {
        hideSettingsPanel();
      }
    });

    qs('#sidebarResetSettings', panel).addEventListener('click', () => {
      qs('#sidebarDefaultView', panel).value = 'grid';
      qs('#sidebarDefaultSort', panel).value = 'az';
    });

    qs('#sidebarSaveSettings', panel).addEventListener('click', () => {
      savePreference(STORAGE_KEYS.view, qs('#sidebarDefaultView', panel).value);
      savePreference(STORAGE_KEYS.sort, qs('#sidebarDefaultSort', panel).value);
      applyLibraryDefaults(true);
      hideSettingsPanel();
    });

    return panel;
  }

  function showSettingsPanel() {
    const panel = ensureSettingsPanel();
    qs('#sidebarDefaultView', panel).value = readPreference(STORAGE_KEYS.view, 'grid');
    qs('#sidebarDefaultSort', panel).value = readPreference(STORAGE_KEYS.sort, 'az');
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

    const sort = readPreference(STORAGE_KEYS.sort, 'az');
    const view = readPreference(STORAGE_KEYS.view, 'grid');

    const sortSelect = qs('#librarySort');
    if (sortSelect && sortSelect.value !== sort) {
      sortSelect.value = sort;
      sortSelect.dispatchEvent(new Event('change', { bubbles: true }));
    }

    const viewButton = qs(
      `[data-action="library-view"][data-library-view="${view}"]`
    );

    if (viewButton && viewButton.getAttribute('aria-pressed') !== 'true') {
      viewButton.click();
    }

    toolbar.dataset.sidebarDefaultsApplied = '1';
  }

  function reorderPlantNames(root = document) {
    qsa('#plantGrid .plant-card, #plantGrid .plant-list-card', root).forEach((card) => {
      const commonName = qs('.plant-common-name', card) || qs('h2', card);
      const scientificName = qs('.scientific', card);

      if (!commonName || !scientificName) return;

      const parent = commonName.parentElement;
      if (!parent || scientificName.parentElement !== parent) return;

      if (commonName.previousElementSibling !== scientificName) {
        parent.insertBefore(scientificName, commonName);
      }

      scientificName.classList.add('scientific-name-top');
      commonName.classList.add('common-name-bottom');
    });
  }

  function petIsHidden() {
    return readSessionValue(SESSION_KEYS.petHidden, '0') === '1';
  }

  function hidePetCard() {
    saveSessionValue(SESSION_KEYS.petHidden, '1');
    qs('.sidebar-pet-card')?.setAttribute('hidden', 'hidden');
  }

  function ensureSidebarUtilities() {
    const sidebar = qs('.sidebar');
    const navigation = qs('.nav-list', sidebar || document);

    if (!sidebar || !navigation || qs('.sidebar-utility-section', sidebar)) {
      return;
    }

    const section = document.createElement('div');
    section.className = 'sidebar-utility-section';
    section.innerHTML = `
      <div class="sidebar-utility-divider" aria-hidden="true"></div>

      <button type="button" class="sidebar-utility-button" data-sidebar-action="settings">
        <span class="sidebar-utility-icon" aria-hidden="true">⚙</span>
        <span>Settings</span>
      </button>

      <button type="button" class="sidebar-utility-button" data-sidebar-action="help">
        <span class="sidebar-utility-icon" aria-hidden="true">?</span>
        <span>Help &amp; Support</span>
      </button>

      <div class="sidebar-pet-card" ${petIsHidden() ? 'hidden' : ''}>
        <button type="button" class="sidebar-pet-close" aria-label="Hide Greenie assistant" data-sidebar-action="hide-pet">×</button>

        <button type="button" class="sidebar-pet-speech" data-sidebar-action="help" aria-label="Ask Greenie for help">
          <strong>Hi! I’m Greenie 🌿</strong>
          <span>Need help finding the perfect plant?</span>
          <em>Ask me anything</em>
        </button>

        <button type="button" class="sidebar-pet-avatar" data-sidebar-action="help" aria-label="Open Greenie help">
          <img class="sidebar-pet-gif" src="assets/images/greenscape-pet.gif" alt="" width="68" height="68">
        </button>
      </div>
    `;

    navigation.insertAdjacentElement('afterend', section);

    section.addEventListener('click', (event) => {
      const control = event.target.closest('[data-sidebar-action]');
      if (!control) return;

      const action = control.dataset.sidebarAction;

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
    observer.observe(pageContent, {
      childList: true,
      subtree: true
    });

    window.addEventListener('hashchange', () => {
      window.setTimeout(() => {
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
