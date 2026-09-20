export function toGoogleSheetCsvUrl(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) {
    return trimmed;
  }

  if (/\/spreadsheets\/d\/e\//.test(trimmed)) {
    return withCsvOutput(trimmed);
  }

  const match = trimmed.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (!match?.[1]) {
    return trimmed;
  }

  const url = new URL(`https://docs.google.com/spreadsheets/d/${match[1]}/export`);
  url.searchParams.set("format", "csv");
  const gid = gidFromUrl(trimmed);
  if (gid) {
    url.searchParams.set("gid", gid);
  }
  return url.toString();
}

function withCsvOutput(raw: string): string {
  const url = new URL(raw);
  if (!url.searchParams.get("output") && !url.searchParams.get("format")) {
    url.searchParams.set("output", "csv");
  }
  return url.toString();
}

function gidFromUrl(raw: string): string | undefined {
  try {
    const url = new URL(raw);
    const fromQuery = url.searchParams.get("gid");
    if (fromQuery) {
      return fromQuery;
    }
    const hash = url.hash.startsWith("#") ? url.hash.slice(1) : url.hash;
    return new URLSearchParams(hash).get("gid") ?? undefined;
  } catch {
    return undefined;
  }
}
