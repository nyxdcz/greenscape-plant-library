export function validateSharePreview({ html, exists, readBytes }) {
  const failures = [];
  const metadata = new Map();
  for (const tag of html.match(/<meta\b[^>]*>/gi) || []) {
    const attributes = Object.fromEntries([...tag.matchAll(/([\w:-]+)\s*=\s*["']([^"']*)["']/g)].map(([, key, value]) => [key, value]));
    const key = attributes.property || attributes.name;
    if (!key?.startsWith('og:') && !key?.startsWith('twitter:')) continue;
    if (metadata.has(key)) failures.push(`Duplicate sharing metadata: ${key}`);
    metadata.set(key, attributes.content);
  }
  const required = ['og:type', 'og:title', 'og:description', 'og:url', 'og:site_name', 'og:image', 'og:image:secure_url', 'og:image:type', 'og:image:width', 'og:image:height', 'og:image:alt', 'twitter:card', 'twitter:title', 'twitter:description', 'twitter:image', 'twitter:image:alt'];
  for (const key of required) {
    if (!metadata.get(key)?.trim()) failures.push(`Missing sharing metadata: ${key}`);
  }
  const canonical = html.match(/<link\b[^>]*rel="canonical"[^>]*href="([^"]+)"/i)?.[1];
  if (metadata.get('og:url') !== canonical) failures.push('Sharing URL must match the canonical page URL.');
  if (metadata.get('og:type') !== 'website' || metadata.get('twitter:card') !== 'summary_large_image') failures.push('Sharing cards must select website and summary_large_image types.');
  for (const [key, other] of [['og:image', 'twitter:image'], ['og:image', 'og:image:secure_url'], ['og:title', 'twitter:title'], ['og:description', 'twitter:description'], ['og:image:alt', 'twitter:image:alt']]) {
    if (metadata.get(key) !== metadata.get(other)) failures.push(`Sharing metadata must agree: ${key} and ${other}`);
  }
  let imagePath;
  try {
    const page = new URL(canonical);
    const image = new URL(metadata.get('og:image'));
    const imageDirectory = new URL('assets/images/', page).pathname;
    if (image.protocol !== 'https:' || image.origin !== page.origin || !image.pathname.startsWith(imageDirectory) || !image.pathname.endsWith('.png') || image.search || image.hash) throw new Error();
    imagePath = decodeURIComponent(image.pathname.slice(page.pathname.length));
    if (!/^assets\/images\/[\w-]+\.png$/.test(imagePath)) throw new Error();
  } catch {
    failures.push('Sharing image must be an absolute HTTPS PNG URL inside the published assets/images directory.');
    return failures;
  }
  if (!exists(imagePath)) {
    failures.push(`Missing sharing image: ${imagePath}`);
    return failures;
  }
  const bytes = readBytes(imagePath);
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  if (bytes.length < 33 || !bytes.subarray(0, 8).equals(signature) || bytes.toString('ascii', 12, 16) !== 'IHDR') {
    failures.push('Sharing image must contain a PNG image header.');
    return failures;
  }
  const width = bytes.readUInt32BE(16);
  const height = bytes.readUInt32BE(20);
  if (width < 1200 || height < 630 || width / height < 1.9 || width / height > 2) failures.push('Sharing image must be a wide card of at least 1200 by 630 pixels, rather than the narrow header logo.');
  if (metadata.get('og:image:type') !== 'image/png' || Number(metadata.get('og:image:width')) !== width || Number(metadata.get('og:image:height')) !== height) failures.push('Sharing image type and dimensions must match the actual PNG.');
  return failures;
}
