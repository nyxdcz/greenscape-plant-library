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
  const configuredStaffAccess = configured.staffAccess || {};
  const staffAccess = Object.freeze({
    salt: String(configuredStaffAccess.salt || ''),
    codeHash: String(configuredStaffAccess.codeHash || '').toLowerCase(),
    sessionMinutes: Math.max(1, Number(configuredStaffAccess.sessionMinutes) || 30),
    maxAttempts: Math.max(1, Number(configuredStaffAccess.maxAttempts) || 5),
    cooldownSeconds: Math.max(1, Number(configuredStaffAccess.cooldownSeconds) || 30)
  });
  const ACCESS_SESSION_KEY = 'greenscape-maintenance-staff-access-v1';
  const ACCESS_ATTEMPTS_KEY = 'greenscape-maintenance-staff-attempts-v1';

  const nativeStorage = {
    getItem: Storage.prototype.getItem,
    setItem: Storage.prototype.setItem,
    removeItem: Storage.prototype.removeItem,
    clear: Storage.prototype.clear
  };

  const html = document.documentElement;
  html.classList.add('maintenance-enabled');

  function readSessionJSON(key) {
    try {
      return JSON.parse(nativeStorage.getItem.call(window.sessionStorage, key) || 'null');
    } catch (error) {
      return null;
    }
  }

  function writeSessionJSON(key, value) {
    nativeStorage.setItem.call(window.sessionStorage, key, JSON.stringify(value));
  }

  function clearSessionKey(key) {
    nativeStorage.removeItem.call(window.sessionStorage, key);
  }

  function accessSession() {
    const value = readSessionJSON(ACCESS_SESSION_KEY);
    if (!value || value.version !== 1 || !Number.isFinite(value.expiresAt) || value.expiresAt <= Date.now()) {
      clearSessionKey(ACCESS_SESSION_KEY);
      return null;
    }
    return value;
  }

  function isStaffAuthorized() {
    return Boolean(accessSession());
  }

  function syncAuthorizationClass() {
    html.classList.toggle('maintenance-authorized', isStaffAuthorized());
  }

  syncAuthorizationClass();
  window.GREENSCAPE_MAINTENANCE_ACCESS = Object.freeze({
    isAuthorized: isStaffAuthorized
  });

  function storageWriteIsBlocked(storage) {
    return storage === window.localStorage
      && html.classList.contains('maintenance-enabled')
      && !staffWorkspaceIsActive();
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
    'sunlightFilter',
    'librarySort',
    'sheetSearch',
    'sheetCategoryFilter',
    'moodboardSearch',
    'moodboardCategoryFilter',
    'scheduleProjectSelect',
    'feedbackMessage'
  ]);
  const maintenanceLockedViews = new Set(['sheet', 'moodboard', 'projects']);

  function staffWorkspaceIsActive() {
    return isStaffAuthorized() && maintenanceLockedViews.has(location.hash.slice(1));
  }

  const allowedActionNames = new Set([
    'close-modal',
    'open-project',
    'back-projects',
    'project-schedule',
    'plant-detail',
    'download-plant-image',
    'filter-category',
    'load-more',
    'clear-filter',
    'library-view',
    'library-quick-filter',
    'clear-library-category',
    'clear-sheet-filter',
    'export-csv',
    'moodboard-export-png',
    'moodboard-print',
    'moodboard-fullscreen',
    'print-schedule'
  ]);

  const allowedButtonSelectors = [
    '[data-view="dashboard"]',
    '[data-view="library"]',
    '[data-project-workspace-tab]',
    '[data-plant-image-download]',
    '[data-action="download-plant-image"]',
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
  let expiryTimer = 0;

  function escapeHTML(value) {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function startupMarkup() {
    const authorized = isStaffAuthorized();
    const estimated = config.estimatedReturn
      ? `<p class="maintenance-estimate"><span>Expected return</span><strong>${escapeHTML(config.estimatedReturn)}</strong></p>`
      : '';
    const status = authorized
      ? 'Staff tools are unlocked in this browser tab.'
      : config.status;
    const accessPanel = authorized
      ? `<div class="maintenance-staff-access-active" role="status">
          <strong>Staff access active</strong>
          <span>Plant List Editor, Mood Board Creator, and Project Lists are available for ${escapeHTML(staffAccess.sessionMinutes)} minutes.</span>
          <button type="button" class="maintenance-secondary" data-maintenance-lock>Lock staff tools</button>
        </div>`
      : `<div class="maintenance-staff-access">
          <button type="button" class="maintenance-access-toggle" data-maintenance-access-toggle aria-expanded="false" aria-controls="maintenanceAccessForm">Staff access</button>
          <form id="maintenanceAccessForm" data-maintenance-access-form hidden>
            <label for="maintenanceAccessCode">Maintenance access code</label>
            <div class="maintenance-access-entry">
              <input id="maintenanceAccessCode" name="maintenanceAccessCode" type="password" autocomplete="off" autocapitalize="none" spellcheck="false" maxlength="64" required>
              <button type="submit" class="maintenance-secondary">Unlock tools</button>
            </div>
            <p class="maintenance-access-status" data-maintenance-access-status role="status" aria-live="polite" aria-atomic="true"></p>
          </form>
        </div>`;

    return `<section class="maintenance-startup-card" role="dialog" aria-modal="true" aria-labelledby="maintenanceTitle" aria-describedby="maintenanceMessage" tabindex="-1">
      <div class="maintenance-logo-wrap">
        <img src="assets/images/greenscape-logo.png" alt="Greenscape" width="600" height="70" decoding="async">
      </div>
      <span class="maintenance-kicker">BETA · READ-ONLY MAINTENANCE MODE</span>
      <h1 id="maintenanceTitle">${escapeHTML(config.title)}</h1>
      <p id="maintenanceMessage">${escapeHTML(config.message)}</p>
      <div class="maintenance-status">
        <span aria-hidden="true">${authorized ? '✓' : '🔒'}</span>
        <strong>${escapeHTML(status)}</strong>
      </div>
      ${estimated}
      <div class="maintenance-startup-actions">
        ${config.allowReadOnlyAccess ? `<button type="button" class="maintenance-primary" data-maintenance-continue>${authorized ? 'Continue with staff access' : 'Open read-only website'}</button>` : ''}
      </div>
      ${accessPanel}
      <div class="maintenance-startup-pet" aria-hidden="true">
        <img src="assets/images/greenscape-pet-jumping-happy.gif" alt="" width="69" height="69" loading="eager" decoding="async">
      </div>
    </section>`;
  }

  function bannerMarkup() {
    const authorized = isStaffAuthorized();
    const bannerClass = authorized ? ' is-authorized' : '';
    const label = authorized ? 'Staff tools unlocked' : 'Maintenance mode';
    const detail = authorized
      ? 'Editor, mood board, and projects are available.'
      : 'Read-only access — editing and saving are disabled.';
    const compact = authorized ? 'Staff access' : 'Read-only access';
    return `<button type="button" class="maintenance-readonly-banner feedback-launcher${bannerClass}" id="maintenanceReadonlyBanner" data-maintenance-show-startup aria-label="${escapeHTML(label)}. Open maintenance details.">
      <span class="maintenance-lock-icon maintenance-icon-mask" aria-hidden="true"></span>
      <span class="maintenance-banner-copy"><strong>${escapeHTML(label)}</strong><small>${escapeHTML(detail)}</small><span class="maintenance-banner-compact-copy">${escapeHTML(compact)}</span></span>
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
    syncMaintenanceModeForView();
    ensureBanner();
    scheduleControlRefresh();
  }

  function syncMaintenanceModeForView() {
    const authorized = isStaffAuthorized();
    const writableWorkspace = staffWorkspaceIsActive();
    document.body.classList.toggle('maintenance-readonly', !writableWorkspace);
    document.body.classList.toggle('maintenance-staff-authorized', authorized);
    if (!writableWorkspace) scheduleControlRefresh();
  }

  function accessAttemptState() {
    const value = readSessionJSON(ACCESS_ATTEMPTS_KEY);
    return {
      attempts: Math.max(0, Number(value?.attempts) || 0),
      cooldownUntil: Math.max(0, Number(value?.cooldownUntil) || 0)
    };
  }

  function setAccessStatus(form, message, isError = false) {
    const status = form.querySelector('[data-maintenance-access-status]');
    if (!status) return;
    status.textContent = message;
    status.classList.toggle('is-error', isError);
  }

  async function digestAccessCode(value) {
    const data = new TextEncoder().encode(`${staffAccess.salt}:${value}`);
    const digest = await window.crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, '0')).join('');
  }

  function equalHash(left, right) {
    if (left.length !== right.length) return false;
    let difference = 0;
    for (let index = 0; index < left.length; index += 1) {
      difference |= left.charCodeAt(index) ^ right.charCodeAt(index);
    }
    return difference === 0;
  }

  async function handleAccessSubmit(form) {
    const input = form.querySelector('#maintenanceAccessCode');
    const candidate = String(input?.value || '').trim();
    const attempts = accessAttemptState();
    const now = Date.now();

    if (attempts.cooldownUntil > now) {
      const seconds = Math.max(1, Math.ceil((attempts.cooldownUntil - now) / 1000));
      setAccessStatus(form, `Too many attempts. Try again in ${seconds} seconds.`, true);
      return;
    }

    if (!candidate) {
      setAccessStatus(form, 'Enter the maintenance access code.', true);
      input?.focus();
      return;
    }

    if (!window.crypto?.subtle || !staffAccess.salt || !/^[a-f0-9]{64}$/.test(staffAccess.codeHash)) {
      setAccessStatus(form, 'Staff access is not configured correctly.', true);
      return;
    }

    form.setAttribute('aria-busy', 'true');
    try {
      const candidateHash = await digestAccessCode(candidate);
      if (equalHash(candidateHash, staffAccess.codeHash)) {
        clearSessionKey(ACCESS_ATTEMPTS_KEY);
        writeSessionJSON(ACCESS_SESSION_KEY, {
          version: 1,
          expiresAt: now + staffAccess.sessionMinutes * 60 * 1000
        });
        setAccessStatus(form, 'Access confirmed. Loading staff tools.');
        window.setTimeout(() => window.location.reload(), 250);
        return;
      }

      const nextAttempts = attempts.attempts + 1;
      if (nextAttempts >= staffAccess.maxAttempts) {
        writeSessionJSON(ACCESS_ATTEMPTS_KEY, {
          attempts: 0,
          cooldownUntil: now + staffAccess.cooldownSeconds * 1000
        });
        setAccessStatus(form, `Too many attempts. Try again in ${staffAccess.cooldownSeconds} seconds.`, true);
      } else {
        writeSessionJSON(ACCESS_ATTEMPTS_KEY, { attempts: nextAttempts, cooldownUntil: 0 });
        setAccessStatus(form, `Code not recognized. ${staffAccess.maxAttempts - nextAttempts} attempts remaining.`, true);
      }
      if (input) {
        input.value = '';
        input.focus();
      }
    } catch (error) {
      setAccessStatus(form, 'The access code could not be checked. Try again.', true);
    } finally {
      form.removeAttribute('aria-busy');
    }
  }

  function lockStaffAccess() {
    clearSessionKey(ACCESS_SESSION_KEY);
    syncAuthorizationClass();
    if (maintenanceLockedViews.has(location.hash.slice(1))) {
      history.replaceState(null, '', '#library');
    }
    window.location.reload();
  }

  function scheduleAccessExpiry() {
    clearTimeout(expiryTimer);
    const session = accessSession();
    if (!session) return;
    expiryTimer = window.setTimeout(lockStaffAccess, Math.max(0, session.expiresAt - Date.now()));
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
    const view = String(control.closest('[data-view]')?.dataset.view || '');
    if (maintenanceLockedViews.has(view) && !isStaffAuthorized()) return false;
    if (control.matches(allowedButtonSelectors)) return true;
    const action = actionName(control);
    return allowedActionNames.has(action);
  }

  function markUnavailableNavigation() {
    if (isStaffAuthorized()) return;
    document.querySelectorAll('.nav-item[data-view]').forEach(button => {
      const view = String(button.dataset.view || '');
      if (!maintenanceLockedViews.has(view)) return;

      button.dataset.maintenanceSoon = 'true';
      button.dataset.maintenanceDisabled = 'true';
      button.setAttribute('aria-disabled', 'true');
      button.removeAttribute('aria-current');
      button.classList.remove('active');
      button.disabled = true;
      button.title = 'Coming soon after maintenance.';

      if (!button.querySelector('.maintenance-soon-label')) {
        const badge = document.createElement('span');
        badge.className = 'maintenance-soon-label';
        badge.textContent = 'Soon';
        badge.setAttribute('aria-hidden', 'true');
        const icon = button.querySelector('.nav-icon');
        if (icon) icon.insertAdjacentElement('afterend', badge);
        else button.prepend(badge);
      }
    });
  }

  function enforceAvailableView() {
    if (isStaffAuthorized()) return;
    const requestedView = location.hash.slice(1);
    if (!maintenanceLockedViews.has(requestedView)) return;
    history.replaceState(null, '', '#library');
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
      if (document.body.classList.contains('maintenance-readonly')) {
        markUnavailableNavigation();
        applyReadOnlyControls();
      }
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
    if (target.closest('[data-maintenance-access-form]')) return null;

    const disabled = target.closest('[data-maintenance-disabled="true"]');
    if (disabled) return disabled;

    const form = target.closest('form');
    if (form && !form.matches('#feedbackForm')) return form;

    return null;
  }

  document.addEventListener('click', event => {
    const requestedStaffView = event.target.closest('.nav-item[data-view]')?.dataset.view;
    if (requestedStaffView && isStaffAuthorized()) {
      document.body.classList.toggle('maintenance-readonly', !maintenanceLockedViews.has(requestedStaffView));
    }

    const accessToggle = event.target.closest('[data-maintenance-access-toggle]');
    if (accessToggle) {
      event.preventDefault();
      const form = document.getElementById(accessToggle.getAttribute('aria-controls'));
      if (!form) return;
      const expanded = accessToggle.getAttribute('aria-expanded') === 'true';
      accessToggle.setAttribute('aria-expanded', String(!expanded));
      form.hidden = expanded;
      if (!expanded) requestAnimationFrame(() => form.querySelector('input')?.focus());
      return;
    }

    if (event.target.closest('[data-maintenance-lock]')) {
      event.preventDefault();
      lockStaffAccess();
      return;
    }

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
    if (event.target.matches('[data-maintenance-access-form]')) {
      event.preventDefault();
      event.stopImmediatePropagation();
      void handleAccessSubmit(event.target);
      return;
    }

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
    if (isStaffAuthorized()) {
      observer.observe(document.body, { childList: true, subtree: true });
      syncMaintenanceModeForView();
      ensureBanner();
      scheduleAccessExpiry();
      window.addEventListener('hashchange', syncMaintenanceModeForView);
      return;
    }
    markUnavailableNavigation();
    enforceAvailableView();
    observer.observe(document.body, { childList: true, subtree: true });
    showStartup();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize, { once: true });
  } else {
    initialize();
  }
})();
