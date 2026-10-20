const preview = document.getElementById('catalogue-preview');
const options = [...document.querySelectorAll('[data-style]')];
const status = document.getElementById('style-status');
let selectedStyle = 'refined';

function applyStyle() {
  const page = preview.contentDocument;
  if (!page?.body || !page.getElementById('catalogue-app')) return;
  if (!page.getElementById('ai-demo-styles')) {
    const stylesheet = page.createElement('link');
    stylesheet.id = 'ai-demo-styles';
    stylesheet.rel = 'stylesheet';
    stylesheet.href = 'assets/css/catalogue-ai-demo.css?v=comparison2';
    page.head.appendChild(stylesheet);
  }
  const aiStyle = selectedStyle === 'ai';
  page.body.classList.toggle('ai-style-demo', aiStyle);
  preview.title = aiStyle ? 'AI-style Greenscape catalogue demo' : 'Refined Greenscape catalogue';
  options.forEach(button => {
    button.disabled = false;
    button.setAttribute('aria-pressed', String(button.dataset.style === selectedStyle));
  });
  status.textContent = aiStyle
    ? 'AI-style demo: gradients, glowing accents, glass cards, and pill controls.'
    : 'Anti Slop refinement: cream surfaces, a scannable list, and forest-green actions.';
}

options.forEach(button => button.addEventListener('click', () => {
  selectedStyle = button.dataset.style;
  applyStyle();
}));
preview.addEventListener('load', applyStyle);
if (preview.contentDocument?.readyState === 'complete') applyStyle();
