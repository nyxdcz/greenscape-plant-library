async function imageAsPng(source) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  let objectUrl;
  try {
    const response = await fetch(source, { mode: 'cors', credentials: 'same-origin', signal: controller.signal });
    if (!response.ok) throw new Error('The photo could not be fetched.');
    const blob = await response.blob();
    if (blob.type === 'image/png') return blob;
    objectUrl = URL.createObjectURL(blob);
    const image = new Image();
    await new Promise((resolve, reject) => {
      image.onload = resolve;
      image.onerror = () => reject(new Error('The photo could not be decoded.'));
      image.src = objectUrl;
    });
    const canvas = document.createElement('canvas');
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;
    const context = canvas.getContext('2d');
    if (!context || !canvas.width || !canvas.height) throw new Error('The photo could not be prepared.');
    context.drawImage(image, 0, 0);
    return await new Promise((resolve, reject) => {
      canvas.toBlob(png => png ? resolve(png) : reject(new Error('The photo could not be converted.')), 'image/png');
    });
  } finally {
    clearTimeout(timeout);
    if (objectUrl) URL.revokeObjectURL(objectUrl);
  }
}

export function copyImageToClipboard(source, {
  clipboard = globalThis.navigator?.clipboard,
  ClipboardItem = globalThis.ClipboardItem,
  prepareImage = imageAsPng
} = {}) {
  if (!source) return Promise.reject(new Error('There is no photo to copy.'));
  if (!clipboard?.write || !ClipboardItem || (ClipboardItem.supports && !ClipboardItem.supports('image/png'))) {
    return Promise.reject(new Error('This browser cannot copy images.'));
  }
  const png = Promise.resolve().then(() => prepareImage(source));
  // WebKit requires the write during the click; image preparation can resolve afterward.
  png.catch(() => {});
  try {
    return Promise.resolve(clipboard.write([new ClipboardItem({ 'image/png': png })]));
  } catch (error) {
    return Promise.reject(error);
  }
}
