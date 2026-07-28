(() => {
  const phoneQuery = window.matchMedia('(max-width: 760px)');
  const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  const dock = document.querySelector('.sidebar .nav-list');
  const feedbackWidget = document.getElementById('feedbackWidget');
  const glowTimers = new WeakMap();

  if (!dock || !feedbackWidget) return;

  const getItems = () => Array.from(dock.querySelectorAll('.nav-item, .dock-utility'));

  const resetItems = () => {
    getItems().forEach((item) => {
      item.style.setProperty('--dock-scale', '1');
      item.style.setProperty('--dock-lift', '0px');
    });
  };

  const updateItems = (clientX) => {
    if (!phoneQuery.matches || reducedMotionQuery.matches) {
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
  };

  const unmarkUtility = (element, className) => {
    element.classList.remove('dock-utility', className);
    delete element.dataset.dockLabel;
    element.style.removeProperty('--dock-scale');
    element.style.removeProperty('--dock-lift');
  };

  const attachPhoneUtilities = () => {
    const maintenance = document.getElementById('maintenanceReadonlyBanner');
    const help = document.getElementById('feedbackToggle');

    if (maintenance) {
      markUtility(maintenance, 'dock-utility-maintenance', 'Maintenance mode');
      if (maintenance.parentElement !== dock) dock.appendChild(maintenance);
    }

    if (help) {
      markUtility(help, 'dock-utility-help', 'Help');
      if (help.parentElement !== dock) dock.appendChild(help);
    }

    if (maintenance && help && maintenance.nextElementSibling !== help) {
      dock.appendChild(maintenance);
      dock.appendChild(help);
    }

    document.body.classList.toggle(
      'dock-utilities-attached',
      Boolean(maintenance && help)
    );
  };

  const restoreDesktopUtilities = () => {
    const maintenance = document.getElementById('maintenanceReadonlyBanner');
    const help = document.getElementById('feedbackToggle');
    const panel = document.getElementById('feedbackPanel');

    if (maintenance) {
      unmarkUtility(maintenance, 'dock-utility-maintenance');
      if (maintenance.parentElement !== feedbackWidget) {
        feedbackWidget.insertBefore(maintenance, feedbackWidget.firstElementChild);
      }
    }

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
    if (phoneQuery.matches) {
      attachPhoneUtilities();
    } else {
      restoreDesktopUtilities();
    }
  };

  dock.addEventListener('pointermove', (event) => {
    if (event.pointerType !== 'touch') updateItems(event.clientX);
  });
  dock.addEventListener('pointerleave', resetItems);
  dock.addEventListener('pointercancel', resetItems);
  dock.addEventListener('pointerdown', (event) => {
    const item = event.target.closest('.nav-item:not(:disabled), .dock-utility:not(:disabled)');
    if (!phoneQuery.matches || !item) return;
    item.style.setProperty('--dock-scale', '1');
    item.style.setProperty('--dock-lift', '-2px');
    item.classList.remove('dock-click-glow');
    requestAnimationFrame(() => item.classList.add('dock-click-glow'));
    clearTimeout(glowTimers.get(item));
    glowTimers.set(item, setTimeout(() => {
      item.classList.remove('dock-click-glow');
      glowTimers.delete(item);
    }, 540));
  });
  dock.addEventListener('pointerup', resetItems);

  const help = document.getElementById('feedbackToggle');
  if (help) {
    help.addEventListener('click', (event) => {
      if (phoneQuery.matches) event.stopPropagation();
    });
  }

  phoneQuery.addEventListener('change', syncUtilities);
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
