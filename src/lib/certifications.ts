/**
 * Utility functions for handling single or multiple certification documents/images.
 * Supports:
 * - Single image URL: "/uploads/cert1.png"
 * - JSON array: '["/uploads/cert1.png", "/uploads/cert2.png"]'
 * - Comma or newline separated URLs: "/uploads/cert1.png\n/uploads/cert2.png"
 * - Array input directly: ["/uploads/cert1.png", "/uploads/cert2.png"]
 */

export function parseCertificateImages(input: unknown): string[] {
  if (!input) return [];

  if (Array.isArray(input)) {
    return input
      .filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
      .map((item) => item.trim());
  }

  if (typeof input !== 'string') return [];

  const trimmed = input.trim();
  if (!trimmed) return [];

  // Check if string is a JSON array
  if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        return parsed
          .filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
          .map((item) => item.trim());
      }
    } catch {
      // fallback to delimiter split if JSON parse fails
    }
  }

  // Check newline separation
  if (trimmed.includes('\n')) {
    return trimmed
      .split('\n')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
  }

  // Check comma separation
  if (trimmed.includes(',')) {
    return trimmed
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
  }

  return [trimmed];
}

/**
 * Format multiple images into a clean string to be saved in the database.
 * If 0 images: returns null.
 * If 1 image: returns the single image string.
 * If > 1 image: returns JSON string array.
 */
export function serializeCertificateImages(images: string[]): string | null {
  const clean = images.map((img) => img.trim()).filter(Boolean);
  if (clean.length === 0) return null;
  if (clean.length === 1) return clean[0];
  return JSON.stringify(clean);
}
