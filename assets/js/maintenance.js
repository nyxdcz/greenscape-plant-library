(function () {
  'use strict';

  const configured = window.GREENSCAPE_MAINTENANCE || {};
  const previewEnabled = new URLSearchParams(window.location.search).get('maintenance-preview') === '1';
  const enabled = Boolean(configured.enabled || previewEnabled);

  if (!enabled) return;

  const config = {
    title: String(configured.title || 'Website maintenance in progress'),
    message: String(configured.message || 'The website is temporarily operating in read-only mode.'),
    status: String(configured.status || 'Editing and saving are temporarily disabled.'),
    estimatedReturn: String(configured.estimatedReturn || ''),
    allowReadOnlyAccess: configured.allowReadOnlyAccess !== false
  };

  const nativeStorage = {
    setItem: Storage.prototype.setItem,
    removeItem: Storage.prototype.removeItem,
    clear: Storage.prototype.clear
  };

  const html = document.documentElement;
  html.classList.add('maintenance-enabled');

  function storageWriteIsBlocked(storage) {
    return storage === window.localStorage && html.classList.contains('maintenance-enabled');
  }

  Storage.prototype.setItem = function (key, value) {
    if (storageWriteIsBlocked(this)) {
      announceBlocked();
      return undefined;
    }
    return nativeStorage.setItem.call(this, key, value);
  };

  Storage.prototype.removeItem = function (key) {
    if (storageWriteIsBlocked(this)) {
      announceBlocked();
      return undefined;
    }
    return nativeStorage.removeItem.call(this, key);
  };

  Storage.prototype.clear = function () {
    if (storageWriteIsBlocked(this)) {
      announceBlocked();
      return undefined;
    }
    return nativeStorage.clear.call(this);
  };

  const allowedFieldIds = new Set([
    'librarySearch',
    'categoryFilter',
    'sheetSearch',
    'sheetCategoryFilter',
    'moodboardSearch',
    'moodboardCategoryFilter',
    'scheduleProjectSelect',
    'feedbackMessage'
  ]);

  const allowedActionNames = new Set([
    'close-modal',
    'open-project',
    'back-projects',
    'project-schedule',
    'plant-detail',
    'filter-category',
    'load-more',
    'clear-filter',
    'clear-sheet-filter',
    'export-csv',
    'export-excel',
    'moodboard-export-png',
    'moodboard-print',
    'moodboard-fullscreen',
    'print-schedule'
  ]);

  const allowedButtonSelectors = [
    '[data-view]',
    '[data-project-workspace-tab]',
    '[data-quotation-close]',
    '[data-quotation-print]',
    '[data-boq-close]',
    '[data-boq-density]',
    '[data-boq-export]',
    '[data-boq-print]',
    '[data-boq-zoom-out]',
    '[data-boq-zoom-in]',
    '[data-boq-zoom-label]',
    '[data-costing-close]',
    '[data-costing-tab]',
    '[data-costing-density-use]',
    '[data-costing-download-report]',
    '[data-costing-print-report]',
    '[data-costing-export-json]',
    '[data-costing-export-csv]',
    '#feedbackToggle',
    '#feedbackClose',
    '#feedbackCancel',
    '#feedbackForm button[type="submit"]'
  ].join(',');

  let blockedNoticeTimer = 0;
  let controlRefreshFrame = 0;

  function escapeHTML(value) {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function startupMarkup() {
    const estimated = config.estimatedReturn
      ? `<p class="maintenance-estimate"><span>Expected return</span><strong>${escapeHTML(config.estimatedReturn)}</strong></p>`
      : '';

    return `<section class="maintenance-startup-card" role="dialog" aria-modal="true" aria-labelledby="maintenanceTitle" aria-describedby="maintenanceMessage" tabindex="-1">
      <div class="maintenance-logo-wrap">
        <img src="assets/images/greenscape-logo.png" alt="Greenscape" width="600" height="70" decoding="async">
      </div>
      <span class="maintenance-kicker">BETA · READ-ONLY MAINTENANCE MODE</span>
      <h1 id="maintenanceTitle">${escapeHTML(config.title)}</h1>
      <p id="maintenanceMessage">${escapeHTML(config.message)}</p>
      <div class="maintenance-status">
        <span aria-hidden="true">🔒</span>
        <strong>${escapeHTML(config.status)}</strong>
      </div>
      ${estimated}
      <div class="maintenance-startup-actions">
        ${config.allowReadOnlyAccess ? '<button type="button" class="maintenance-primary" data-maintenance-continue>Open read-only website</button>' : ''}
      </div>
      <small>Your saved browser records remain unchanged.</small>
    </section>`;
  }

  function bannerMarkup() {
    return `<button type="button" class="maintenance-readonly-banner feedback-launcher" id="maintenanceReadonlyBanner" data-maintenance-show-startup aria-label="Maintenance mode. Read-only access. Open maintenance details.">
      <span class="maintenance-lock-icon maintenance-icon-mask" aria-hidden="true"></span>
      <span class="maintenance-banner-copy"><strong>Maintenance mode</strong><small>Read-only access — editing and saving are disabled.</small></span>
      <span class="maintenance-banner-details" aria-hidden="true">Details</span>
    </button>`;
  }

  function ensureStartup() {
    let overlay = document.getElementById('maintenanceStartup');
    if (overlay) return overlay;

    overlay = document.createElement('div');
    overlay.id = 'maintenanceStartup';
    overlay.className = 'maintenance-startup';
    overlay.innerHTML = startupMarkup();
    document.body.appendChild(overlay);
    return overlay;
  }

  function showStartup() {
    const overlay = ensureStartup();
    overlay.hidden = false;
    document.body.classList.add('maintenance-startup-open');
    document.querySelector('.app-shell')?.setAttribute('inert', '');
    document.getElementById('feedbackWidget')?.setAttribute('inert', '');
    const continueButton = overlay.querySelector('[data-maintenance-continue]');
    if (continueButton) {
      continueButton.disabled = false;
      continueButton.removeAttribute('disabled');
      continueButton.removeAttribute('aria-disabled');
      continueButton.dataset.maintenanceActionReady = 'true';
    }
    requestAnimationFrame(() => overlay.querySelector('.maintenance-startup-card')?.focus({ preventScroll: true }));
  }

  function hideStartup() {
    const overlay = ensureStartup();
    overlay.hidden = true;
    document.body.classList.remove('maintenance-startup-open');
    document.querySelector('.app-shell')?.removeAttribute('inert');
    document.getElementById('feedbackWidget')?.removeAttribute('inert');
    document.body.classList.add('maintenance-readonly');
    ensureBanner();
    scheduleControlRefresh();
  }

  function ensureBanner() {
    const existing = document.getElementById('maintenanceReadonlyBanner');
    const feedbackWidget = document.getElementById('feedbackWidget');

    if (existing) {
      if (feedbackWidget && existing.parentElement !== feedbackWidget) {
        feedbackWidget.insertBefore(existing, feedbackWidget.firstElementChild);
      }
      return existing;
    }

    const banner = document.createElement('div');
    banner.innerHTML = bannerMarkup();
    const node = banner.firstElementChild;

    if (feedbackWidget) {
      feedbackWidget.insertBefore(node, feedbackWidget.firstElementChild);
    } else {
      document.body.appendChild(node);
    }

    return node;
  }

  function isAllowedField(control) {
    if (!(control instanceof HTMLElement)) return false;
    if (control.closest('#feedbackForm')) return true;
    if (allowedFieldIds.has(control.id)) return true;
    if (control.matches('[type="search"]') && control.closest('.toolbar, .filters, .search-wrap')) return true;
    return false;
  }

  function actionName(control) {
    return String(control.closest('[data-action]')?.dataset.action || '');
  }

  function isAllowedButton(control) {
    if (!(control instanceof HTMLElement)) return false;
    if (control.matches(allowedButtonSelectors)) return true;
    const action = actionName(control);
    return allowedActionNames.has(action);
  }

  function setReadonlyControl(control) {
    if (!(control instanceof HTMLElement)) return;

    if (control.matches('input, textarea, select')) {
      if (isAllowedField(control)) return;
      control.disabled = true;
      control.setAttribute('aria-disabled', 'true');
      control.dataset.maintenanceDisabled = 'true';
      control.title = 'Unavailable while the website is under maintenance.';
      return;
    }

    if (control.matches('button, [role="button"], input[type="submit"]')) {
      if (isAllowedButton(control)) return;
      control.setAttribute('aria-disabled', 'true');
      control.dataset.maintenanceDisabled = 'true';
      control.title = 'Unavailable while the website is under maintenance.';
      if ('disabled' in control) control.disabled = true;
      return;
    }

    if (control.isContentEditable) {
      control.contentEditable = 'false';
      control.setAttribute('aria-readonly', 'true');
      control.dataset.maintenanceDisabled = 'true';
    }
  }

  function applyReadOnlyControls(root = document) {
    const selector = [
      '#pageContent input',
      '#pageContent textarea',
      '#pageContent select',
      '#pageContent button',
      '#pageContent [role="button"]',
      '#pageContent [contenteditable="true"]',
      '#modalRoot input',
      '#modalRoot textarea',
      '#modalRoot select',
      '#modalRoot button',
      '#modalRoot [role="button"]',
      '#quotationCreatorBackdrop input',
      '#quotationCreatorBackdrop textarea',
      '#quotationCreatorBackdrop select',
      '#quotationCreatorBackdrop button',
      '#boqCreatorBackdrop input',
      '#boqCreatorBackdrop textarea',
      '#boqCreatorBackdrop select',
      '#boqCreatorBackdrop button',
      '#costingSuiteBackdrop input',
      '#costingSuiteBackdrop textarea',
      '#costingSuiteBackdrop select',
      '#costingSuiteBackdrop button'
    ].join(',');

    root.querySelectorAll(selector).forEach(setReadonlyControl);
  }

  function scheduleControlRefresh() {
    if (controlRefreshFrame) return;
    controlRefreshFrame = requestAnimationFrame(() => {
      controlRefreshFrame = 0;
      if (document.body.classList.contains('maintenance-readonly')) applyReadOnlyControls();
    });
  }

  function ensureBlockedNotice() {
    let notice = document.getElementById('maintenanceBlockedNotice');
    if (notice) return notice;

    notice = document.createElement('div');
    notice.id = 'maintenanceBlockedNotice';
    notice.className = 'maintenance-blocked-notice';
    notice.setAttribute('role', 'status');
    notice.setAttribute('aria-live', 'polite');
    notice.textContent = 'This action is unavailable during maintenance. The website is read-only.';
    document.body.appendChild(notice);
    return notice;
  }

  function announceBlocked() {
    if (!document.body) return;
    const notice = ensureBlockedNotice();
    notice.classList.add('visible');
    clearTimeout(blockedNoticeTimer);
    blockedNoticeTimer = window.setTimeout(() => notice.classList.remove('visible'), 2600);
  }

  function mutatingTarget(target) {
    if (!(target instanceof Element)) return null;

    const disabled = target.closest('[data-maintenance-disabled="true"]');
    if (disabled) return disabled;

    const form = target.closest('form');
    if (form && !form.matches('#feedbackForm')) return form;

    return null;
  }

  document.addEventListener('click', event => {
    const continueButton = event.target.closest('[data-maintenance-continue]');
    if (continueButton) {
      event.preventDefault();
      hideStartup();
      return;
    }


    if (event.target.closest('[data-maintenance-show-startup]')) {
      event.preventDefault();
      showStartup();
      return;
    }

    if (!document.body.classList.contains('maintenance-readonly')) return;
    const blocked = mutatingTarget(event.target);
    if (!blocked) return;

    event.preventDefault();
    event.stopImmediatePropagation();
    announceBlocked();
  }, true);

  document.addEventListener('submit', event => {
    if (!document.body.classList.contains('maintenance-readonly')) return;
    if (event.target.matches('#feedbackForm')) return;

    event.preventDefault();
    event.stopImmediatePropagation();
    announceBlocked();
  }, true);

  document.addEventListener('beforeinput', event => {
    if (!document.body.classList.contains('maintenance-readonly')) return;
    if (isAllowedField(event.target)) return;
    if (!event.target.closest('#pageContent, #modalRoot, #quotationCreatorBackdrop, #boqCreatorBackdrop, #costingSuiteBackdrop')) return;

    event.preventDefault();
    announceBlocked();
  }, true);

  const observer = new MutationObserver(scheduleControlRefresh);

  function initialize() {
    document.body.classList.add('maintenance-mode');
    observer.observe(document.body, { childList: true, subtree: true });
    showStartup();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize, { once: true });
  } else {
    initialize();
  }
})();
