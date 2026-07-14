"use client";

import { useMemo, useState } from "react";
import { AudienceFilterControls } from "@/components/audience-filters";
import { EMPTY_AUDIENCE_FILTER, isAudienceFilterActive, matchesAudienceFilter, type AudienceFilterValue } from "@/lib/audienceFilter";
import type { AudienceCustomer, AudienceFilterOptions } from "@/lib/audienceBuilder";

/**
 * Filterkontroller + klientsidig filtrering av en redan hämtad kundlista
 * (inga serverrundturer vid filterbyte). Delas av kampanj-utskick
 * (components/campaign-send.tsx) och kampanjblad-bulkutskick
 * (components/campaign-sheet-bulk-send.tsx) — de skiljer sig bara i hur de
 * VISAR/väljer bland den filtrerade listan (kund- respektive maskinrader),
 * så filtreringen returneras via en render-prop istället för att den här
 * komponenten själv bestämmer tabellutseendet.
 */
export function AudienceBuilder({
  customers,
  manufacturers,
  categories,
  models,
  children,
}: AudienceFilterOptions & {
  customers: AudienceCustomer[];
  children: (filtered: AudienceCustomer[]) => React.ReactNode;
}) {
  const [filters, setFilters] = useState<AudienceFilterValue>(EMPTY_AUDIENCE_FILTER);

  const filtered = useMemo(() => {
    if (!isAudienceFilterActive(filters)) return customers;
    return customers
      .map((c) => ({ ...c, machines: c.machines.filter((m) => matchesAudienceFilter(m, filters)) }))
      .filter((c) => c.machines.length > 0);
  }, [customers, filters]);

  return (
    <div className="space-y-4">
      <AudienceFilterControls value={filters} onChange={setFilters} manufacturers={manufacturers} categories={categories} models={models} />
      {children(filtered)}
    </div>
  );
}
