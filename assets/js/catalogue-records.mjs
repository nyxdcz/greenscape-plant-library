export function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
}

export function isMaterial(record) { return record.category === 'Landscape Materials'; }

export function inScope(record, scope) {
  return scope === 'all' || (scope === 'materials' ? isMaterial(record) : !isMaterial(record));
}

const normalized = value => String(value ?? '').trim().toLowerCase();

function matchRank(record, query) {
  const fields = [record.code, record.name, record.latin].map(normalized);
  const exact = fields.indexOf(query);
  if (exact !== -1) return exact;
  const prefix = [fields[1], fields[0], fields[2]].findIndex(value => value.startsWith(query));
  return prefix === -1 ? 6 : prefix + 3;
}

export function selectRecords(records, { scope = 'all', category = 'All', query = '' } = {}) {
  const term = normalized(query);
  return records.filter(record => inScope(record, scope)
    && (category === 'All' || record.category === category)
    && (!term || [record.name, record.latin, record.code, isMaterial(record) ? record.material : ''].some(value => normalized(value).includes(term))))
    .sort((a, b) => (term ? matchRank(a, term) - matchRank(b, term) : 0) || a.name.localeCompare(b.name));
}

export function highlightedText(value, query) {
  const text = String(value ?? '');
  const term = normalized(query);
  if (!term) return escapeHtml(text);
  const lower = text.toLowerCase();
  let start = 0;
  let result = '';
  let match = lower.indexOf(term);
  while (match !== -1) {
    result += escapeHtml(text.slice(start, match)) + `<mark>${escapeHtml(text.slice(match, match + term.length))}</mark>`;
    start = match + term.length;
    match = lower.indexOf(term, start);
  }
  return result + escapeHtml(text.slice(start));
}

export function recordSummary(record) {
  return [
    record.name,
    record.latin,
    record.code && `Code: ${record.code}`,
    record.category && `Category: ${record.category}`,
    record.material && record.material !== record.latin && `Material: ${record.material}`,
    `Recorded sizes: ${record.sizes?.length ? record.sizes.join(', ') : 'Not recorded'}`
  ].filter(Boolean).join('\n');
}
