(function () {
  const DESKTOP_BREAKPOINT = 1024;
  const DRAG_THRESHOLD = 6;
  const RETURN_DURATION = 220;
  const FLOATING_Z_INDEX = 2147483000;
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

  function closeHelpPanel() {
    const panel = qs('#feedbackPanel');
    const toggle = qs('#feedbackToggle');

    if (!panel || !toggle) return;

    panel.hidden = true;
    toggle.setAttribute('aria-expanded', 'false');
  }

  function setSpeechOpen(card, open) {
    if (!card) return;

    card.classList.toggle('is-speech-open', Boolean(open));
    qs('.sidebar-pet-avatar', card)?.setAttribute(
      'aria-expanded',
      open ? 'true' : 'false'
    );
  }

  function showSpeechBox(card) {
    closeHelpPanel();
    setSpeechOpen(card, true);
  }

  function hideSpeechBox(card) {
    setSpeechOpen(card, false);
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
    card.style.removeProperty('z-index');
    card.style.removeProperty('transition');
  }

  function restoreCardToPlaceholder(card) {
    const placeholder = qs('.sidebar-pet-placeholder');

    if (placeholder?.isConnected) {
      placeholder.replaceWith(card);
    } else {
      qs('.sidebar-utility-section')?.appendChild(card);
    }

    clearTemporaryPosition(card);
  }

  function returnToSidebar(card) {
    const placeholder = qs('.sidebar-pet-placeholder');

    if (!placeholder?.isConnected) {
      restoreCardToPlaceholder(card);
      return;
    }

    const target = placeholder.getBoundingClientRect();

    card.classList.remove('is-dragging');
    card.classList.add('is-returning');
    card.style.transition = `left ${RETURN_DURATION}ms ease, top ${RETURN_DURATION}ms ease`;
    card.style.left = `${target.left}px`;
    card.style.top = `${target.top}px`;

    window.setTimeout(() => {
      restoreCardToPlaceholder(card);
    }, RETURN_DURATION + 30);
  }

  function createDragPlaceholder(card, rectangle) {
    qs('.sidebar-pet-placeholder')?.remove();

    const placeholder = document.createElement('div');
    placeholder.className = 'sidebar-pet-placeholder';
    placeholder.setAttribute('aria-hidden', 'true');
    placeholder.style.width = `${rectangle.width}px`;
    placeholder.style.height = `${rectangle.height}px`;

    card.insertAdjacentElement('beforebegin', placeholder);
    return placeholder;
  }

  function beginDrag(card, image, origin, startLeft, startTop) {
    hideSpeechBox(card);
    closeHelpPanel();

    createDragPlaceholder(card, origin);
    document.body.appendChild(card);

    card.classList.add('is-floating', 'is-dragging');
    card.style.position = 'fixed';
    card.style.width = `${origin.width}px`;
    card.style.left = `${startLeft}px`;
    card.style.top = `${startTop}px`;
    card.style.zIndex = String(FLOATING_Z_INDEX);

    image.src = DRAG_GIF;
    document.body.classList.add('greenie-drag-active');
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
      const shouldShowSpeech = !dragging && event?.type === 'pointerup';
      pointerId = null;

      try {
        handle.releasePointerCapture(activePointerId);
      } catch (error) {
        // Pointer capture may already be released.
      }

      image.src = NORMAL_GIF;
      document.body.classList.remove('greenie-drag-active');

      if (dragging) {
        hideSpeechBox(card);
        closeHelpPanel();
        returnToSidebar(card);
      } else {
        restoreCardToPlaceholder(card);
        if (shouldShowSpeech) showSpeechBox(card);
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
        width: rectangle.width,
        height: rectangle.height
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
        beginDrag(card, image, origin, startLeft, startTop);
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
        showSpeechBox(card);
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

    const existingCard = qs('.sidebar-pet-card');

    if (existingCard) {
      enableGreenieDragging(existingCard);
      return existingCard;
    }

    section.innerHTML = `
      <div class="sidebar-pet-card">
        <button id="greenieSpeechBox" type="button" class="sidebar-pet-speech" aria-label="Open Greenie Help">
          <strong>Hi! I’m Greenie 🌿</strong>
          <span>Need help finding the perfect plant?</span>
          <em>Ask me anything</em>
        </button>

        <button type="button" class="sidebar-pet-avatar" aria-label="Show Greenie message or drag Greenie" aria-controls="greenieSpeechBox" aria-expanded="false">
          <img class="sidebar-pet-gif" src="${NORMAL_GIF}" alt="Greenie animated assistant" width="68" height="68">
        </button>
      </div>
    `;

    const card = qs('.sidebar-pet-card', section);
    const speech = qs('.sidebar-pet-speech', card);

    speech.addEventListener('click', (event) => {
      event.stopPropagation();
      hideSpeechBox(card);
      openHelpPanel();
    });

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

    document.addEventListener('click', (event) => {
      const card = qs('.sidebar-pet-card');
      if (!card || card.contains(event.target)) return;
      hideSpeechBox(card);
    });

    document.addEventListener('keydown', (event) => {
      if (event.key !== 'Escape') return;
      hideSpeechBox(qs('.sidebar-pet-card'));
    });

    window.addEventListener('resize', () => {
      const card = qs('.sidebar-pet-card');

      if (!card) return;

      if (window.innerWidth < DESKTOP_BREAKPOINT) {
        qs('.sidebar-pet-gif', card)?.setAttribute('src', NORMAL_GIF);
        document.body.classList.remove('greenie-drag-active');
        hideSpeechBox(card);
        closeHelpPanel();
        restoreCardToPlaceholder(card);
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', onReady, { once: true });
  } else {
    onReady();
  }
})();
