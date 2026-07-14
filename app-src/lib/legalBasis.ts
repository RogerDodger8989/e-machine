/**
 * Delad etikett-lista för MessageLog/MessageTemplate.legalBasis — tidigare
 * duplicerad separat i app/statistik/page.tsx, components/message-log-filters.tsx
 * och components/message-log-table.tsx (drev isär: campaign_sheet saknades
 * i alla tre, sedan den lades till som egen legalBasis för kampanjblad).
 */
export const LEGAL_BASIS_LABEL: Record<string, string> = {
  service_reminder: "Servicepåminnelse",
  marketing: "Marknadsföring",
  order_ready: "Sms",
  campaign_sheet: "Kampanjblad",
};
