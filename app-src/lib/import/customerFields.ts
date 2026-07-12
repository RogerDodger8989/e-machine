import type { TargetField } from "@/lib/import/mapping";

export const CUSTOMER_TARGET_FIELDS: TargetField[] = [
  { key: "externalId", label: "Kundnummer (Crona)", required: false },
  { key: "name", label: "Namn/Kontaktperson", required: true },
  { key: "company", label: "Företag", required: false },
  { key: "phone", label: "Telefon", required: false },
  { key: "email", label: "E-post", required: false },
  { key: "address", label: "Adress", required: false },
  { key: "postalCode", label: "Postnummer", required: false },
  { key: "city", label: "Ort", required: false },
];
