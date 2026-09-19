export function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function csvCell(row: Record<string, string>, ...keys: string[]): string {
  for (const key of keys) {
    const value = row[key] ?? row[key.toLowerCase()];
    if (value != null && value !== "") {
      return value.trim();
    }
  }
  return "";
}

export function parseCsv(text: string): Record<string, string>[] {
  const lines = text
    .replace(/^\uFEFF/, "")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
  if (lines.length < 2) {
    return [];
  }
  const headers = splitCsvRow(lines[0] ?? "").map((h) => h.trim());
  const rows: Record<string, string>[] = [];
  for (const line of lines.slice(1)) {
    const fields = splitCsvRow(line);
    const row: Record<string, string> = {};
    for (let i = 0; i < headers.length; i += 1) {
      const header = headers[i];
      if (!header) {
        continue;
      }
      row[header] = fields[i] ?? "";
    }
    rows.push(row);
  }
  return rows;
}

function splitCsvRow(row: string): string[] {
  const fields: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < row.length; i += 1) {
    const ch = row[i];
    if (inQuotes) {
      if (ch === '"') {
        if (row[i + 1] === '"') {
          current += '"';
          i += 1;
          continue;
        }
        inQuotes = false;
        continue;
      }
      current += ch;
      continue;
    }
    if (ch === '"') {
      inQuotes = true;
      continue;
    }
    if (ch === ",") {
      fields.push(current.trim());
      current = "";
      continue;
    }
    current += ch;
  }
  fields.push(current.trim());
  return fields;
}
