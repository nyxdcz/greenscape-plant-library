(function () {
  const DESKTOP_BREAKPOINT = 1024;
  const DRAG_THRESHOLD = 6;
  const RETURN_DURATION = 220;
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

  function preloadPetAnimations() {
    [NORMAL_GIF, DRAG_GIF].forEach((source) => {
      const image = new Image();
      image.src = source;
    });
  }

  function viewportBounds(card) {
    const margin = 10;

    return {
      minLeft: margin,
      minTop: margin,
      maxLeft: Math.max(margin, window.innerWidth - card.offsetWidth - margin),
      maxTop: Math.max(margin, window.innerHeight - card.offsetHeight - margin)
    };
  }

  function clamp(value, minimum, maximum) {
    return Math.min(Math.max(value, minimum), maximum);
  }

  function clearTemporaryPosition(card) {
    card.classList.remove('is-floating', 'is-dragging', 'is-returning');
    card.style.removeProperty('position');
    card.style.removeProperty('left');
    card.style.removeProperty('top');
    card.style.removeProperty('width');
    card.style.removeProperty('transition');
  }

  function returnToSidebar(card, origin) {
    card.classList.remove('is-dragging');
    card.classList.add('is-returning');
    card.style.transition = `left ${RETURN_DURATION}ms ease, top ${RETURN_DURATION}ms ease`;
    card.style.left = `${origin.left}px`;
    card.style.top = `${origin.top}px`;

    window.setTimeout(() => {
      clearTemporaryPosition(card);
    }, RETURN_DURATION + 30);
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
    let origin = null;
    let dragging = false;

    function finishPointer(event) {
      if (pointerId === null) return;
      if (event && event.pointerId !== undefined && event.pointerId !== pointerId) return;

      const activePointerId = pointerId;
      pointerId = null;

      try {
        handle.releasePointerCapture(activePointerId);
      } catch (error) {
        // Pointer capture may already be released.
      }

      image.src = NORMAL_GIF;
      document.body.classList.remove('greenie-drag-active');

      if (dragging && origin) {
        returnToSidebar(card, origin);
      } else {
        clearTemporaryPosition(card);
        openHelpPanel();
      }

      dragging = false;
      origin = null;
    }

    handle.addEventListener('pointerdown', (event) => {
      if (window.innerWidth < DESKTOP_BREAKPOINT || event.button !== 0) return;

      pointerId = event.pointerId;
      startX = event.clientX;
      startY = event.clientY;

      const rectangle = card.getBoundingClientRect();
      origin = {
        left: rectangle.left,
        top: rectangle.top,
        width: rectangle.width
      };
      startLeft = rectangle.left;
      startTop = rectangle.top;

      handle.setPointerCapture(pointerId);
      event.preventDefault();
    });

    handle.addEventListener('pointermove', (event) => {
      if (pointerId !== event.pointerId || !origin) return;

      const deltaX = event.clientX - startX;
      const deltaY = event.clientY - startY;

      if (!dragging && Math.hypot(deltaX, deltaY) >= DRAG_THRESHOLD) {
        dragging = true;
        card.classList.add('is-floating', 'is-dragging');
        card.style.position = 'fixed';
        card.style.width = `${origin.width}px`;
        card.style.left = `${startLeft}px`;
        card.style.top = `${startTop}px`;
        image.src = DRAG_GIF;
        document.body.classList.add('greenie-drag-active');
      }

      if (!dragging) return;

      const bounds = viewportBounds(card);
      const left = clamp(startLeft + deltaX, bounds.minLeft, bounds.maxLeft);
      const top = clamp(startTop + deltaY, bounds.minTop, bounds.maxTop);

      card.style.left = `${left}px`;
      card.style.top = `${top}px`;
      event.preventDefault();
    });

    handle.addEventListener('pointerup', finishPointer);
    handle.addEventListener('pointercancel', finishPointer);
    handle.addEventListener('lostpointercapture', finishPointer);

    handle.addEventListener('click', (event) => {
      if (event.detail === 0) {
        openHelpPanel();
      }
    });
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

    const existingCard = qs('.sidebar-pet-card', section);

    if (existingCard) {
      enableGreenieDragging(existingCard);
      return existingCard;
    }

    section.innerHTML = `
      <div class="sidebar-pet-card">
        <button type="button" class="sidebar-pet-speech" aria-label="Ask Greenie for help">
          <strong>Hi! I’m Greenie 🌿</strong>
          <span>Need help finding the perfect plant?</span>
          <em>Ask me anything</em>
        </button>

        <button type="button" class="sidebar-pet-avatar" aria-label="Open Help or drag Greenie">
          <img class="sidebar-pet-gif" src="${NORMAL_GIF}" alt="Greenie animated assistant" width="68" height="68">
        </button>
      </div>
    `;

    const card = qs('.sidebar-pet-card', section);
    const speech = qs('.sidebar-pet-speech', card);

    speech.addEventListener('click', openHelpPanel);
    enableGreenieDragging(card);

    return card;
  }

  function resetLegacyPosition() {
    try {
      localStorage.removeItem('greenscape-greenie-position-v1');
    } catch (error) {
      // Legacy position data is optional.
    }
  }

  function onReady() {
    document.body.classList.add('sidebar-assistant-enhanced');
    resetLegacyPosition();
    preloadPetAnimations();
    ensureGreenieAssistant();
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
      const card = qs('.sidebar-pet-card');

      if (!card) return;

      if (window.innerWidth < DESKTOP_BREAKPOINT) {
        clearTemporaryPosition(card);
        qs('.sidebar-pet-gif', card)?.setAttribute('src', NORMAL_GIF);
        document.body.classList.remove('greenie-drag-active');
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', onReady, { once: true });
  } else {
    onReady();
  }
})();
