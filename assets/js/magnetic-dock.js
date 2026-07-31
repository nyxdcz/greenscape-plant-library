(() => {
  'use strict';
  /* GREENSCAPE_PHONE_DOCK_NO_HELP_V1_1 */
  /* GREENSCAPE_PHONE_DOCK_MAINTENANCE_ITEM_V1 */
  /* GREENSCAPE_PHONE_DOCK_FREEZE_HOTFIX_V1_2 */
  /* GREENSCAPE_PHONE_STAFF_MENU_STATE_V1 */

  const phoneQuery = window.matchMedia('(max-width: 760px)');
  const glassDockQuery = window.matchMedia('(max-width: 760px)');
  const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  const dock = document.querySelector('.sidebar .nav-list');
  const glowTimers = new WeakMap();

  if (!dock) return;

  const getItems = () => Array.from(dock.querySelectorAll('.nav-item:not(.phone-dock-hidden), .dock-utility'));

  const resetItems = () => {
    getItems().forEach((item) => {
      item.style.setProperty('--dock-scale', '1');
      item.style.setProperty('--dock-lift', '0px');
    });
  };

  const updateItems = (clientX) => {
    if (!phoneQuery.matches || glassDockQuery.matches || reducedMotionQuery.matches) {
      resetItems();
      return;
    }

    getItems().forEach((item) => {
      if (item.disabled) {
        item.style.setProperty('--dock-scale', '1');
        item.style.setProperty('--dock-lift', '0px');
        return;
      }

      const bounds = item.getBoundingClientRect();
      const distance = Math.abs(clientX - (bounds.left + bounds.width / 2));
      const influence = Math.max(0, 1 - distance / 82);
      item.style.setProperty('--dock-scale', '1');
      item.style.setProperty('--dock-lift', `${(-influence * 4).toFixed(2)}px`);
    });
  };



  const dockIcon = (kind) => {
    if (kind === 'identifier') {
      return '<span class="phone-dock-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M4 7.5h3l1.3-2h7.4l1.3 2h3v11H4z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><circle cx="12" cy="13" r="3.2" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M15.8 3.8c-2.4.1-4.1 1.1-4.8 2.8 1.9.2 3.6-.5 4.8-2.8Z" fill="currentColor"/></svg></span>';
    }
    return '<span class="phone-dock-more-dots" aria-hidden="true"><i></i><i></i><i></i></span>';
  };

  const ensurePhoneButton = (id, className, label, kind) => {
    let button = document.getElementById(id);
    if (!button) {
      button = document.createElement('button');
      button.id = id;
      button.type = 'button';
      button.className = `dock-utility ${className}`;
      button.setAttribute('aria-label', label);
      button.dataset.dockLabel = label;
      button.innerHTML = dockIcon(kind);
    }
    return button;
  };

  const phoneMaintenanceState = () => {
    const authorized = document.body.classList.contains('maintenance-staff-authorized')
      || document.documentElement.classList.contains('maintenance-authorized');
    return authorized
      ? {
          label: 'Staff tools unlocked',
          detail: 'Staff access active',
          state: 'staff-tools-unlocked'
        }
      : {
          label: 'Maintenance Mode',
          detail: 'Read-only access',
          state: 'maintenance-mode'
        };
  };

  const syncPhoneMaintenanceItem = (menu = document.getElementById('phoneDockMoreMenu')) => {
    const item = menu?.querySelector('[data-phone-maintenance-status]');
    if (!item) return;

    const state = phoneMaintenanceState();
    const accessibleLabel = `${state.label}. ${state.detail}. Open maintenance details.`;
    const label = item.querySelector('[data-phone-maintenance-label]');
    const detail = item.querySelector('[data-phone-maintenance-detail]');

    if (item.dataset.maintenanceState !== state.state) {
      item.dataset.maintenanceState = state.state;
    }
    if (item.getAttribute('aria-label') !== accessibleLabel) {
      item.setAttribute('aria-label', accessibleLabel);
    }
    if (label && label.textContent !== state.label) {
      label.textContent = state.label;
    }
    if (detail && detail.textContent !== state.detail) {
      detail.textContent = state.detail;
    }
  };

  const phoneStaffState = () => {
    const authorized = document.body.classList.contains('maintenance-staff-authorized')
      || document.documentElement.classList.contains('maintenance-authorized');
    return authorized
      ? { label: 'Open', state: 'open' }
      : { label: 'Locked', state: 'locked' };
  };

  const syncPhoneStaffItems = (menu = document.getElementById('phoneDockMoreMenu')) => {
    if (!menu) return;
    const state = phoneStaffState();

    menu.querySelectorAll('[data-phone-staff-view]').forEach(item => {
      const viewName = String(item.querySelector('span')?.textContent || 'Staff tool').trim();
      const detail = item.querySelector('small');
      const accessibleLabel = `${viewName}. ${state.label}.`;

      if (item.dataset.phoneStaffState !== state.state) {
        item.dataset.phoneStaffState = state.state;
      }
      if (detail && detail.textContent !== state.label) {
        detail.textContent = state.label;
      }
      if (item.getAttribute('aria-label') !== accessibleLabel) {
        item.setAttribute('aria-label', accessibleLabel);
      }
    });
  };

  const ensureMoreMenu = () => {
    let menu = document.getElementById('phoneDockMoreMenu');
    if (menu) {
      syncPhoneMaintenanceItem(menu);
      syncPhoneStaffItems(menu);
      return menu;
    }

    menu = document.createElement('div');
    menu.id = 'phoneDockMoreMenu';
    menu.className = 'phone-dock-more-menu';
    menu.setAttribute('aria-label', 'More Greenscape tools');
    menu.hidden = true;
    menu.innerHTML = `
      <button type="button" data-view="sheet" data-phone-staff-view><span>Plant List Editor</span><small>Locked</small></button>
      <button type="button" data-view="moodboard" data-phone-staff-view><span>Mood Board Creator</span><small>Locked</small></button>
      <button type="button" data-view="projects" data-phone-staff-view><span>Project Lists</span><small>Locked</small></button>
      <button type="button" class="phone-dock-maintenance-item" data-maintenance-show-startup data-phone-maintenance-status aria-label="Maintenance Mode. Read-only access. Open maintenance details."><span class="phone-dock-maintenance-copy"><i class="phone-dock-maintenance-icon" aria-hidden="true"></i><b data-phone-maintenance-label>Maintenance Mode</b></span><small data-phone-maintenance-detail>Read-only access</small></button>
      <a href="https://greenscapelandscapingph.com/" target="_blank" rel="noopener"><span>Visit Greenscape website</span><small>↗</small></a>`;
    document.body.appendChild(menu);
    syncPhoneMaintenanceItem(menu);
    syncPhoneStaffItems(menu);
    return menu;
  };

  const closeMoreMenu = () => {
    const menu = document.getElementById('phoneDockMoreMenu');
    const button = document.getElementById('phoneDockMoreButton');
    if (menu) menu.hidden = true;
    if (button) button.setAttribute('aria-expanded', 'false');
  };

  const attachPhoneUtilities = () => {
    const identifier = ensurePhoneButton('phoneDockIdentifierButton', 'dock-utility-identifier', 'Plant Identifier', 'identifier');
    const more = ensurePhoneButton('phoneDockMoreButton', 'dock-utility-more', 'More', 'more');
    const moreMenu = ensureMoreMenu();
    syncPhoneMaintenanceItem(moreMenu);
    syncPhoneStaffItems(moreMenu);

    identifier.dataset.action = 'open-google-lens-identifier';
    more.setAttribute('aria-expanded', moreMenu.hidden ? 'false' : 'true');
    more.setAttribute('aria-controls', moreMenu.id);
    if (more.dataset.dockClickBound !== 'true') {
      more.dataset.dockClickBound = 'true';
      more.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        const menu = ensureMoreMenu();
        menu.hidden = !menu.hidden;
        more.setAttribute('aria-expanded', menu.hidden ? 'false' : 'true');
      });
    }

    dock.querySelectorAll('[data-view="sheet"], [data-view="moodboard"], [data-view="projects"]').forEach((item) => {
      item.classList.add('phone-dock-hidden');
    });

    if (identifier.parentElement !== dock) dock.appendChild(identifier);
    if (more.parentElement !== dock) dock.appendChild(more);

  };

  const restoreDesktopUtilities = () => {
    const identifier = document.getElementById('phoneDockIdentifierButton');
    const more = document.getElementById('phoneDockMoreButton');
    const moreMenu = document.getElementById('phoneDockMoreMenu');

    dock.querySelectorAll('.phone-dock-hidden').forEach((item) => item.classList.remove('phone-dock-hidden'));
    identifier?.remove();
    more?.remove();
    moreMenu?.remove();
    resetItems();
  };

  const syncUtilities = () => {
    if (phoneQuery.matches) attachPhoneUtilities();
    else restoreDesktopUtilities();
  };

  dock.addEventListener('pointermove', (event) => {
    if (event.pointerType !== 'touch') updateItems(event.clientX);
  });
  dock.addEventListener('pointerleave', resetItems);
  dock.addEventListener('pointercancel', resetItems);
  dock.addEventListener('pointerdown', (event) => {
    const item = event.target.closest('.nav-item:not(:disabled), .dock-utility:not(:disabled)');
    if (!phoneQuery.matches || !item) return;
    item.style.setProperty('--dock-scale', glassDockQuery.matches ? '.94' : '1');
    item.style.setProperty('--dock-lift', glassDockQuery.matches ? '0px' : '-2px');
    item.classList.remove('dock-click-glow');
    requestAnimationFrame(() => item.classList.add('dock-click-glow'));
    clearTimeout(glowTimers.get(item));
    glowTimers.set(item, setTimeout(() => {
      item.classList.remove('dock-click-glow');
      glowTimers.delete(item);
    }, glassDockQuery.matches ? 260 : 540));
  });
  dock.addEventListener('pointerup', resetItems);
  document.addEventListener('click', (event) => {
    if (!phoneQuery.matches) return;
    if (event.target.closest('#phoneDockMoreButton')) return;
    if (event.target.closest('#phoneDockMoreMenu button, #phoneDockMoreMenu a')) {
      closeMoreMenu();
      return;
    }
    if (event.target.closest('#phoneDockMoreMenu')) return;
    closeMoreMenu();
  });

  phoneQuery.addEventListener('change', syncUtilities);
  glassDockQuery.addEventListener('change', resetItems);
  reducedMotionQuery.addEventListener('change', resetItems);

  const startDock = () => {
    syncUtilities();

    const maintenanceStateObserver = new MutationObserver(() => {
      if (!phoneQuery.matches) return;
      syncPhoneMaintenanceItem();
      syncPhoneStaffItems();
    });
    maintenanceStateObserver.observe(document.body, {
      attributes: true,
      attributeFilter: ['class']
    });
    maintenanceStateObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startDock, { once: true });
  } else {
    startDock();
  }
})();
