/**
 * Data Export Utility — CSV and Excel-compatible exports
 */

export interface ExportColumn<T> {
  header: string;
  accessor: keyof T | ((row: T) => string | number | boolean | null | undefined);
}

function formatValue(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (value instanceof Date) return value.toISOString();
  const str = String(value);
  // Escape CSV: wrap in quotes if contains comma, quote, or newline
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/** Auto-export: infers columns from object keys */
export function autoExportCSV<T extends Record<string, any>>(data: T[], filename: string) {
  if (!data.length) return;
  const keys = Object.keys(data[0]);
  const columns: ExportColumn<T>[] = keys.map(k => ({
    header: k.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase()),
    accessor: k as keyof T,
  }));
  exportToCSV(data, columns, filename);
}

export function exportToCSV<T extends Record<string, any>>(
  data: T[],
  columns: ExportColumn<T>[],
  filename: string
) {
  const headerRow = columns.map((c) => formatValue(c.header)).join(",");

  const rows = data.map((row) =>
    columns
      .map((col) => {
        const value =
          typeof col.accessor === "function"
            ? col.accessor(row)
            : row[col.accessor as string];
        return formatValue(value);
      })
      .join(",")
  );

  const csvContent = [headerRow, ...rows].join("\n");
  const BOM = "\uFEFF"; // UTF-8 BOM for Excel compatibility
  const blob = new Blob([BOM + csvContent], { type: "text/csv;charset=utf-8;" });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${filename}_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Parse a CSV string into an array of objects using the first row as headers
 */
export function parseCSV(csvText: string): { headers: string[]; rows: Record<string, string>[] } {
  const lines = csvText.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length === 0) return { headers: [], rows: [] };

  const parseRow = (line: string): string[] => {
    const result: string[] = [];
    let current = "";
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === "," && !inQuotes) {
        result.push(current.trim());
        current = "";
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result;
  };

  const headers = parseRow(lines[0]);
  const rows = lines.slice(1).map((line) => {
    const values = parseRow(line);
    const obj: Record<string, string> = {};
    headers.forEach((h, i) => {
      obj[h] = values[i] || "";
    });
    return obj;
  });

  return { headers, rows };
}

/**
 * Validate imported rows against required fields
 */
export interface ValidationResult {
  valid: Record<string, string>[];
  errors: { row: number; field: string; message: string }[];
}

export function validateImport(
  rows: Record<string, string>[],
  requiredFields: string[]
): ValidationResult {
  const valid: Record<string, string>[] = [];
  const errors: { row: number; field: string; message: string }[] = [];

  rows.forEach((row, index) => {
    let rowValid = true;
    requiredFields.forEach((field) => {
      if (!row[field] || !row[field].trim()) {
        errors.push({ row: index + 2, field, message: `Missing required field "${field}"` });
        rowValid = false;
      }
    });
    if (rowValid) valid.push(row);
  });

  return { valid, errors };
}
