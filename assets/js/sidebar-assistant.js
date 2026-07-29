(function () {
  const POSITION_KEY = 'greenscape-greenie-position-v1';
  const DESKTOP_BREAKPOINT = 1024;
  const DRAG_THRESHOLD = 6;
  const NORMAL_GIF = 'assets/images/greenscape-pet.gif';
  const DRAG_GIF = 'assets/images/greenscape-pet-drag.gif';

  function qs(selector, root = document) {
    return root.querySelector(selector);
  }

  function qsa(selector, root = document) {
    return Array.from(root.querySelectorAll(selector));
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

  function readSavedPosition() {
    try {
      const value = JSON.parse(localStorage.getItem(POSITION_KEY) || 'null');
      if (!value || !Number.isFinite(value.left) || !Number.isFinite(value.top)) {
        return null;
      }
      return value;
    } catch (error) {
      return null;
    }
  }

  function savePosition(left, top) {
    try {
      localStorage.setItem(POSITION_KEY, JSON.stringify({ left, top }));
    } catch (error) {
      // Position memory is optional.
    }
  }

  function preloadPetAnimations() {
    [NORMAL_GIF, DRAG_GIF].forEach((source) => {
      const image = new Image();
      image.src = source;
    });
  }

  function viewportBounds(card) {
    const margin = 10;
    const width = card.offsetWidth;
    const height = card.offsetHeight;

    return {
      minLeft: margin,
      minTop: margin,
      maxLeft: Math.max(margin, window.innerWidth - width - margin),
      maxTop: Math.max(margin, window.innerHeight - height - margin)
    };
  }

  function clamp(value, minimum, maximum) {
    return Math.min(Math.max(value, minimum), maximum);
  }

  function applyFixedPosition(card, left, top, persist = false) {
    if (window.innerWidth < DESKTOP_BREAKPOINT) return;

    card.classList.add('is-floating');
    card.style.position = 'fixed';

    const bounds = viewportBounds(card);
    const safeLeft = clamp(left, bounds.minLeft, bounds.maxLeft);
    const safeTop = clamp(top, bounds.minTop, bounds.maxTop);

    card.style.left = `${safeLeft}px`;
    card.style.top = `${safeTop}px`;

    if (persist) {
      savePosition(safeLeft, safeTop);
    }
  }

  function restorePosition(card) {
    if (window.innerWidth < DESKTOP_BREAKPOINT) {
      card.classList.remove('is-floating', 'is-dragging');
      card.style.removeProperty('position');
      card.style.removeProperty('left');
      card.style.removeProperty('top');
      return;
    }

    const saved = readSavedPosition();
    if (!saved) return;

    applyFixedPosition(card, saved.left, saved.top, false);
  }

  function keepPositionVisible(card) {
    if (!card.classList.contains('is-floating')) return;

    const rectangle = card.getBoundingClientRect();
    applyFixedPosition(card, rectangle.left, rectangle.top, true);
  }

  function enableGreenieDragging(card) {
    const handle = qs('.sidebar-pet-avatar', card);
    const image = qs('.sidebar-pet-gif', card);

    if (!handle || !image || handle.dataset.dragReady === '1') return;

    handle.dataset.dragReady = '1';

    let pointerId = null;
    let startX = 0;
    let startY = 0;
    let startLeft = 0;
    let startTop = 0;
    let dragging = false;

    const finishDrag = () => {
      if (pointerId === null) return;

      if (dragging) {
        const rectangle = card.getBoundingClientRect();
        applyFixedPosition(card, rectangle.left, rectangle.top, true);
      }

      card.classList.remove('is-dragging');
      image.src = NORMAL_GIF;
      document.body.classList.remove('greenie-drag-active');

      try {
        handle.releasePointerCapture(pointerId);
      } catch (error) {
        // Pointer capture may already be released.
      }

      pointerId = null;
      dragging = false;
    };

    handle.addEventListener('pointerdown', (event) => {
      if (window.innerWidth < DESKTOP_BREAKPOINT || event.button !== 0) return;

      pointerId = event.pointerId;
      startX = event.clientX;
      startY = event.clientY;

      const rectangle = card.getBoundingClientRect();
      startLeft = rectangle.left;
      startTop = rectangle.top;

      handle.setPointerCapture(pointerId);
      event.preventDefault();
    });

    handle.addEventListener('pointermove', (event) => {
      if (pointerId !== event.pointerId) return;

      const deltaX = event.clientX - startX;
      const deltaY = event.clientY - startY;

      if (!dragging && Math.hypot(deltaX, deltaY) >= DRAG_THRESHOLD) {
        dragging = true;
        card.classList.add('is-dragging');
        document.body.classList.add('greenie-drag-active');
        image.src = DRAG_GIF;
        applyFixedPosition(card, startLeft, startTop, false);
      }

      if (!dragging) return;

      const bounds = viewportBounds(card);
      const left = clamp(startLeft + deltaX, bounds.minLeft, bounds.maxLeft);
      const top = clamp(startTop + deltaY, bounds.minTop, bounds.maxTop);

      card.style.left = `${left}px`;
      card.style.top = `${top}px`;
      event.preventDefault();
    });

    handle.addEventListener('pointerup', finishDrag);
    handle.addEventListener('pointercancel', finishDrag);
    handle.addEventListener('lostpointercapture', finishDrag);
  }

  function ensureGreenieAssistant() {
    const sidebar = qs('.sidebar');
    const navigation = qs('.nav-list', sidebar || document);

    if (!sidebar || !navigation) return null;

    let section = qs('.sidebar-utility-section', sidebar);

    if (!section) {
      section = document.createElement('div');
      section.className = 'sidebar-utility-section';
      navigation.insertAdjacentElement('afterend', section);
    }

    section.innerHTML = `
      <div class="sidebar-pet-card">
        <button type="button" class="sidebar-pet-speech" aria-label="Ask Greenie for help">
          <span class="sidebar-pet-cloud-copy">
            <strong>Hi! I’m Greenie 🌿</strong>
            <span>Need help finding the perfect plant?</span>
            <em>Ask me anything</em>
          </span>
        </button>

        <button type="button" class="sidebar-pet-avatar" aria-label="Drag Greenie">
          <img class="sidebar-pet-gif" src="${NORMAL_GIF}" alt="Greenie animated assistant" width="68" height="68">
        </button>
      </div>
    `;

    const card = qs('.sidebar-pet-card', section);
    const speech = qs('.sidebar-pet-speech', card);

    speech.addEventListener('click', openHelpPanel);
    enableGreenieDragging(card);
    restorePosition(card);

    return card;
  }

  function onReady() {
    document.body.classList.add('sidebar-assistant-enhanced');
    preloadPetAnimations();

    const card = ensureGreenieAssistant();
    reorderPlantNames();

    const observer = new MutationObserver(() => {
      ensureGreenieAssistant();
      reorderPlantNames();
    });

    const pageContent = qs('#pageContent') || document.body;
    observer.observe(pageContent, {
      childList: true,
      subtree: true
    });

    window.addEventListener('resize', () => {
      const currentCard = qs('.sidebar-pet-card');

      if (!currentCard) return;

      if (window.innerWidth < DESKTOP_BREAKPOINT) {
        restorePosition(currentCard);
      } else if (currentCard.classList.contains('is-floating')) {
        keepPositionVisible(currentCard);
      }
    });

    if (card) {
      window.setTimeout(() => keepPositionVisible(card), 100);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', onReady, { once: true });
  } else {
    onReady();
  }
})();
