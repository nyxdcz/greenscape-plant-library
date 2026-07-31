(() => {
  'use strict';

  const staffAccess = window.GREENSCAPE_STAFF_ACCESS || {};

  window.GREENSCAPE_MAINTENANCE = Object.freeze({
    enabled: true,
    title: 'We’re improving your Greenscape workspace',
    message: 'You can continue browsing the Plant Library and project records in read-only mode while updates are being completed.',
    status: 'Editing, saving, importing, and deleting are temporarily disabled.',
    estimatedReturn: '',
    allowReadOnlyAccess: true,
    staffAccess: Object.freeze({
      salt: String(staffAccess.salt || ''),
      codeHash: String(staffAccess.codeHash || '').toLowerCase(),
      sessionMinutes: Math.max(1, Number(staffAccess.sessionMinutes) || 30),
      maxAttempts: Math.max(1, Number(staffAccess.maxAttempts) || 5),
      cooldownSeconds: Math.max(1, Number(staffAccess.cooldownSeconds) || 30)
    })
  });
})();
