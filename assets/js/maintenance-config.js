window.GREENSCAPE_MAINTENANCE = Object.freeze({
  enabled: true,
  title: 'We’re improving your Greenscape workspace',
  message: 'You can continue browsing the Plant Library and project records in read-only mode while updates are being completed.',
  status: 'Editing, saving, importing, and deleting are temporarily disabled.',
  estimatedReturn: '',
  allowReadOnlyAccess: true,
  staffAccess: Object.freeze({
    salt: 'greenscape-maintenance-staff-v1-20260730',
    codeHash: 'd2efa9c3608dad5ea518589b63c51377d58e2a20d32ba8a3c8c92774bd0cf9b0',
    sessionMinutes: 30,
    maxAttempts: 5,
    cooldownSeconds: 30
  })
});
