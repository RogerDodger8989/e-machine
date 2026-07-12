export type ColumnMapping = Record<string, string | null>; // målfält -> källkolumn (eller null om ej mappad)

export interface TargetField {
  key: string;
  label: string;
  required: boolean;
}

/** Läser ut värdet för ett målfält ur en rad, enligt vald kolumnmappning. */
export function applyMapping(row: Record<string, string>, mapping: ColumnMapping, fieldKey: string): string {
  const sourceColumn = mapping[fieldKey];
  if (!sourceColumn) return "";
  return (row[sourceColumn] ?? "").trim();
}
