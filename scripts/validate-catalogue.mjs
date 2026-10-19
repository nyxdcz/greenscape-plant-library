import path from 'node:path';
import { execFileSync } from 'node:child_process';

function tags(source, name) {
  return [...source.matchAll(new RegExp(`<${name}\\b([^>]*)>`, 'gi'))].map(match => {
    const attributes = {};
    for (const attribute of match[1].matchAll(/([\w:-]+)\s*=\s*(["'])(.*?)\2/g)) attributes[attribute[1].toLowerCase()] = attribute[3];
    return attributes;
  });
}

function localFile(reference) {
  if (!reference || /^(?:[a-z][\w+.-]*:|\/\/|\/)/i.test(reference)) return null;
  const file = path.posix.normalize(reference.split(/[?#]/)[0]);
  return file === '..' || file.startsWith('../') ? null : file;
}

const version = reference => new URL(reference, 'https://catalogue.invalid/').searchParams.get('v');

export function validateCataloguePage({ html, read, exists }) {
  const failures = [];
  const check = (condition, message) => { if (!condition) failures.push(message); };
  const scripts = tags(html, 'script');
  const app = scripts.find(script => script.id === 'catalogue-app');
  check(tags(html, 'html')[0]?.['data-app'] === 'catalogue', 'The compact catalogue must declare data-app="catalogue".');
  check(app?.type === 'module' && localFile(app.src) === 'assets/js/catalogue.mjs', 'The catalogue entry must load its local ES module.');
  check(scripts.length === 1 && scripts[0] === app, 'The compact catalogue must load only its own application entry script.');

  const stylesheet = tags(html, 'link').find(link => link.rel === 'stylesheet' && localFile(link.href) === 'assets/css/catalogue.css');
  check(Boolean(stylesheet), 'The compact catalogue stylesheet must be linked.');
  check(Boolean(app?.src && version(app.src)) && Boolean(stylesheet?.href && version(stylesheet.href))
    && version(app.src) === version(stylesheet.href), 'Catalogue script and stylesheet cache versions must be present and agree.');

  const dataReference = app?.['data-catalogue-src'];
  check(localFile(dataReference) === 'assets/js/data.js', 'The catalogue data source must reference the published local data.js.');
  if (localFile(dataReference) === 'assets/js/data.js' && exists('assets/js/data.js')) {
    try {
      const metadata = read('assets/js/data.js').match(/window\.GREENSCAPE_PLANT_META\s*=\s*(\{[^\n]+\});/);
      const revision = metadata && JSON.parse(metadata[1]).sourceRevision;
      check(Boolean(revision) && version(dataReference) === `csv-${revision}-catalogue-sync1`, 'The catalogue data cache must match its published source revision.');
    } catch {
      failures.push('The catalogue data metadata must be valid JSON.');
    }
  } else {
    check(false, 'Published catalogue data.js must exist.');
  }

  const sources = new Map();
  const visitModule = file => {
    if (sources.has(file)) return;
    if (!exists(file)) { failures.push(`Missing catalogue module: ${file}`); return; }
    const source = read(file);
    sources.set(file, source);
    try {
      execFileSync(process.execPath, ['--input-type=module', '--check'], { input: source, encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] });
    } catch (error) {
      const detail = String(error.stderr || error.message).match(/SyntaxError:[^\n]+/)?.[0] || 'syntax check failed';
      failures.push(`Invalid catalogue module ${file}: ${detail}`);
    }
    for (const match of source.matchAll(/^\s*import\s+(?:[^'";]*?\s+from\s+)?['"]([^'"]+)['"]/gm)) {
      const reference = match[1];
      if (!reference.startsWith('.')) { failures.push(`Catalogue module imports must be local: ${reference}`); continue; }
      const dependency = localFile(path.posix.join(path.posix.dirname(file), reference));
      if (!dependency || !dependency.endsWith('.mjs')) { failures.push(`Invalid catalogue module import: ${reference}`); continue; }
      check(Boolean(version(reference)) && version(reference) === version(app.src), `Catalogue import cache version must match the entry: ${reference}`);
      visitModule(dependency);
    }
  };
  if (app && localFile(app.src) === 'assets/js/catalogue.mjs') visitModule('assets/js/catalogue.mjs');
  check(sources.has('assets/js/catalogue-store.mjs'), 'The catalogue entry must import its storage module.');
  check(exists('assets/css/catalogue.css'), 'The catalogue stylesheet must exist.');

  const ids = new Set(tags(html, '[a-z][\\w-]*').map(tag => tag.id).filter(Boolean));
  for (const id of ['add', 'search', 'category', 'count', 'list', 'storage-notice', 'sheet']) {
    check(ids.has(id), `Missing catalogue control or feedback region: ${id}`);
  }
  const dialog = tags(html, 'dialog').find(tag => tag.id === 'sheet');
  check(Boolean(dialog?.['aria-labelledby']), 'The catalogue must provide a named native dialog.');
  const markup = `${html}\n${[...sources.values()].join('\n')}`;
  if (dialog?.['aria-labelledby']) {
    const renderedIds = new Set(tags(markup, '[a-z][\\w-]*').map(tag => tag.id).filter(Boolean));
    check(dialog['aria-labelledby'].split(/\s+/).every(id => renderedIds.has(id)), 'The catalogue dialog title must exist in its rendered markup.');
  }
  const labels = new Set(tags(markup, 'label').map(label => label.for).filter(Boolean));
  for (const control of tags(markup, '(?:input|select)')) {
    check(Boolean(control['aria-label']) || Boolean(control.id && labels.has(control.id)), `Catalogue input needs an associated label: ${control.id || control.name || 'unnamed input'}`);
  }
  const count = tags(html, 'p').find(tag => tag.id === 'count');
  check(count?.['aria-live'] === 'polite' && count?.['aria-atomic'] === 'true', 'Catalogue result announcements must be polite and atomic.');
  const list = tags(html, 'div').find(tag => tag.id === 'list');
  check(list?.['aria-busy'] === 'true' && /<[^>]+role="status"[^>]*>/.test(html), 'The initial catalogue page must expose its loading state.');
  check(/<noscript\b/i.test(html), 'The catalogue must explain its JavaScript requirement.');
  return failures;
}
