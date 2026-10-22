const navigationKeys = new Set(['Tab', 'Enter', ' ', 'Escape', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Home', 'End', 'PageUp', 'PageDown']);

export function trackInputModality(document) {
  document.addEventListener('pointerdown', () => {
    document.documentElement.dataset.inputModality = 'pointer';
  }, true);
  document.addEventListener('keydown', event => {
    if (!event.altKey && !event.ctrlKey && !event.metaKey && navigationKeys.has(event.key)) {
      document.documentElement.dataset.inputModality = 'keyboard';
    }
  }, true);
}
