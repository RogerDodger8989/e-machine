import * as XLSX from "xlsx";

export interface ParsedSpreadsheet {
  headers: string[];
  rows: Record<string, string>[];
}

function cellToString(value: unknown): string {
  if (value === undefined || value === null) return "";
  if (value instanceof Date) {
    // xlsx tolkar datum som lokal midnatt — .toISOString() skulle konvertera
    // till UTC och kunde då hoppa en dag bakåt (t.ex. "2025-01-15" blir
    // "2025-01-14" i UTC+1). Läs därför ut kalenderdatumet i lokal tid.
    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, "0");
    const day = String(value.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }
  return String(value).trim();
}

/**
 * Tolkar en CSV- eller Excel-fil (samma funktion hanterar båda — xlsx
 * känner av formatet från filens innehåll) till rader nyckl­ade på
 * kolumnrubrik. Första raden i filen tolkas alltid som rubriker. Tomma
 * rader hoppas över. Datumceller i Excel omvandlas till ISO-datumsträngar
 * istället för att lämnas som Excels interna serienummer.
 */
export function parseSpreadsheet(buffer: Buffer): ParsedSpreadsheet {
  const workbook = XLSX.read(buffer, { type: "buffer", cellDates: true });
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) return { headers: [], rows: [] };
  const sheet = workbook.Sheets[sheetName];

  const raw = XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1, blankrows: false });
  if (raw.length === 0) return { headers: [], rows: [] };

  const headers = (raw[0] as unknown[]).map((h) => cellToString(h)).filter((h) => h.length > 0);

  const rows: Record<string, string>[] = [];
  for (let i = 1; i < raw.length; i++) {
    const rowArr = raw[i] as unknown[];
    if (!rowArr) continue;
    const row: Record<string, string> = {};
    let hasValue = false;
    (raw[0] as unknown[]).forEach((h, idx) => {
      const header = cellToString(h);
      if (!header) return;
      const value = cellToString(rowArr[idx]);
      row[header] = value;
      if (value) hasValue = true;
    });
    if (hasValue) rows.push(row);
  }

  return { headers, rows };
}
