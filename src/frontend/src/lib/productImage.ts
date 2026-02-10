const PRODUCT_IMAGE_BASE = '/assets/products';

// Normalize product name to expected filename format
function normalizeProductName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}

export function getProductImageUrl(productName: string): string {
  const normalized = normalizeProductName(productName);
  // Try common image extensions
  return `${PRODUCT_IMAGE_BASE}/${normalized}.jpg`;
}

export function getProductImageFallback(): string {
  return 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400"%3E%3Crect width="400" height="400" fill="%23f0f0f0"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="18" fill="%23999"%3ENo Image%3C/text%3E%3C/svg%3E';
}
