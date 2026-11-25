/** Parses CSV text (quoted cells, "" escapes, CRLF or LF, optional BOM) into objects keyed by the header row. */
export function parseCsv(text: string): Record<string, string>[] {
  const rows: string[][] = [];
  let row: string[] = [], cell = '', quoted = false;
  const s = text.replace(/^﻿/, '');
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (quoted) {
      if (c === '"' && s[i + 1] === '"') { cell += '"'; i++; }
      else if (c === '"') quoted = false;
      else cell += c;
    } else if (c === '"') quoted = true;
    else if (c === ',') { row.push(cell); cell = ''; }
    else if (c === '\n' || c === '\r') {
      if (c === '\r' && s[i + 1] === '\n') i++;
      row.push(cell); rows.push(row); row = []; cell = '';
    } else cell += c;
  }
  if (cell || row.length) { row.push(cell); rows.push(row); }
  const [head = [], ...body] = rows.filter((r) => r.some((v) => v.trim()));
  const keys = head.map((h) => h.trim().toLowerCase());
  // Export prefixes formula-like cells with ' so spreadsheets don't run them; take it off again.
  return body.map((r) => Object.fromEntries(keys.map((k, i) => [k, (r[i] ?? '').trim().replace(/^'(?=[=+\-@])/, '')])));
}
