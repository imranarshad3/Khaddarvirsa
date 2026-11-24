// Filler words shoppers type that never appear in product names.
const STOP = new Set(['and', 'the', 'for', 'of', 'in', 'with', 'a', 'suit', 'suits']);

/**
 * Turns a search box query into LIKE terms: lower-case, no SQL wildcards, filler words dropped,
 * plurals trimmed ("shawls" → "shawl"), and every spelling of khaddar/khaddi/khadi/khadar → "khad".
 */
export function searchWords(q: string) {
  return q.toLowerCase().replace(/[%_&]/g, ' ').split(/[\s\-,./]+/)
    .filter((w) => w && !STOP.has(w))
    .map((w) => (/^kh?add?[aei]?r?$/.test(w) ? 'khad' : w.length > 3 && /[^s]s$/.test(w) ? w.slice(0, -1) : w))
    .slice(0, 6);
}
