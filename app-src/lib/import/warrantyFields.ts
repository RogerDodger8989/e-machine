import type { TargetField } from "@/lib/import/mapping";

export const WARRANTY_TARGET_FIELDS: TargetField[] = [
  { key: "serialNumber", label: "Serienummer (maskin)", required: true },
  { key: "modelName", label: "Modellnamn", required: true },
  { key: "purchaseDate", label: "Inköpsdatum", required: false },
  { key: "warrantyEndDate", label: "Garanti t.o.m.", required: false },
  { key: "customerName", label: "Kundnamn", required: false },
  { key: "customerPhone", label: "Kundens telefon", required: false },
  { key: "customerEmail", label: "Kundens e-post", required: false },
];
