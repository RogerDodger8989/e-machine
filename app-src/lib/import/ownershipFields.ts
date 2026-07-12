import type { TargetField } from "@/lib/import/mapping";

export const OWNERSHIP_TARGET_FIELDS: TargetField[] = [
  { key: "serialNumber", label: "Serienummer (maskin)", required: true },
  { key: "customerExternalId", label: "Kundnummer (Crona)", required: false },
  { key: "customerPhone", label: "Kundens telefon", required: false },
  { key: "customerEmail", label: "Kundens e-post", required: false },
  { key: "manufacturer", label: "Tillverkare (Stiga/Stihl)", required: false },
  { key: "modelName", label: "Modellnamn", required: false },
];
