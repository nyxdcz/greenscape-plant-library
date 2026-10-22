export function createFrameScheduler(render, requestFrame, cancelFrame) {
  let pending = null;
  return {
    schedule() {
      if (pending !== null) return;
      pending = requestFrame(() => { pending = null; render(); });
    },
    cancel() {
      if (pending !== null) cancelFrame(pending);
      pending = null;
    }
  };
}

export function createRecordList(root, createRow, updateRow) {
  const cache = new Map();
  let list;
  return {
    reset() { cache.clear(); },
    render(records, query) {
      if (!list || list.parentNode !== root) {
        list = root.ownerDocument.createElement('ul');
        root.replaceChildren(list);
      }
      const nodes = records.map(record => {
        let entry = cache.get(record.id);
        if (!entry || entry.record !== record) {
          const node = createRow(record, query);
          entry = { record, node, query };
          cache.set(record.id, entry);
        } else if (entry.query !== query) {
          updateRow(entry.node, record, query);
          entry.query = query;
        }
        return entry.node;
      });
      const wanted = new Set(nodes);
      for (const node of [...list.children]) {
        if (!wanted.has(node)) node.remove();
      }
      let cursor = list.firstElementChild;
      for (const node of nodes) {
        if (node === cursor) cursor = cursor.nextElementSibling;
        else list.insertBefore(node, cursor);
      }
    }
  };
}
