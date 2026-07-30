(() => {
  'use strict';

  const phoneQuery = window.matchMedia('(max-width: 760px)');
  const glassDockQuery = window.matchMedia('(max-width: 760px)');
  const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  const dock = document.querySelector('.sidebar .nav-list');
  const feedbackWidget = document.getElementById('feedbackWidget');
  const glowTimers = new WeakMap();

  if (!dock || !feedbackWidget) return;

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

  const markUtility = (element, className, label) => {
    element.classList.add('dock-utility', className);
    element.dataset.dockLabel = label;
    if (!Object.prototype.hasOwnProperty.call(element.dataset, 'dockPreviousAriaLabel')) {
      element.dataset.dockPreviousAriaLabel = element.getAttribute('aria-label') || '';
    }
    element.setAttribute('aria-label', label);
  };

  const unmarkUtility = (element, className) => {
    element.classList.remove('dock-utility', className);
    delete element.dataset.dockLabel;
    if (element.dataset.dockPreviousAriaLabel) {
      element.setAttribute('aria-label', element.dataset.dockPreviousAriaLabel);
    } else {
      element.removeAttribute('aria-label');
    }
    delete element.dataset.dockPreviousAriaLabel;
    element.style.removeProperty('--dock-scale');
    element.style.removeProperty('--dock-lift');
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

  const ensureMoreMenu = () => {
    let menu = document.getElementById('phoneDockMoreMenu');
    if (menu) return menu;

    menu = document.createElement('div');
    menu.id = 'phoneDockMoreMenu';
    menu.className = 'phone-dock-more-menu';
    menu.setAttribute('aria-label', 'More Greenscape tools');
    menu.hidden = true;
    menu.innerHTML = `
      <button type="button" data-view="sheet"><span>Plant List Editor</span><small>Soon</small></button>
      <button type="button" data-view="moodboard"><span>Mood Board Creator</span><small>Soon</small></button>
      <button type="button" data-view="projects"><span>Project Lists</span><small>Soon</small></button>
      <a href="https://greenscapelandscapingph.com/" target="_blank" rel="noopener"><span>Visit Greenscape website</span><small>↗</small></a>`;
    document.body.appendChild(menu);
    return menu;
  };

  const closeMoreMenu = () => {
    const menu = document.getElementById('phoneDockMoreMenu');
    const button = document.getElementById('phoneDockMoreButton');
    if (menu) menu.hidden = true;
    if (button) button.setAttribute('aria-expanded', 'false');
  };

  const attachPhoneUtilities = () => {
    const help = document.getElementById('feedbackToggle');
    const identifier = ensurePhoneButton('phoneDockIdentifierButton', 'dock-utility-identifier', 'Plant Identifier', 'identifier');
    const more = ensurePhoneButton('phoneDockMoreButton', 'dock-utility-more', 'More', 'more');
    const moreMenu = ensureMoreMenu();

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

    if (help) {
      markUtility(help, 'dock-utility-help', 'Help');
      if (help.parentElement !== dock) dock.appendChild(help);
    }

    document.body.classList.toggle('dock-utilities-attached', Boolean(help));
  };

  const restoreDesktopUtilities = () => {
    const help = document.getElementById('feedbackToggle');
    const panel = document.getElementById('feedbackPanel');
    const identifier = document.getElementById('phoneDockIdentifierButton');
    const more = document.getElementById('phoneDockMoreButton');
    const moreMenu = document.getElementById('phoneDockMoreMenu');

    dock.querySelectorAll('.phone-dock-hidden').forEach((item) => item.classList.remove('phone-dock-hidden'));
    identifier?.remove();
    more?.remove();
    moreMenu?.remove();

    if (help) {
      unmarkUtility(help, 'dock-utility-help');
      if (help.parentElement !== feedbackWidget) {
        feedbackWidget.insertBefore(help, panel || null);
      }
    }

    document.body.classList.remove('dock-utilities-attached');
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

  dock.addEventListener('click', (event) => {
    if (event.target.closest('#feedbackToggle') && phoneQuery.matches) {
      closeMoreMenu();
      event.stopPropagation();
    }
  });

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
    const utilityObserver = new MutationObserver(syncUtilities);
    utilityObserver.observe(document.body, { childList: true, subtree: true });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startDock, { once: true });
  } else {
    startDock();
  }
})();
