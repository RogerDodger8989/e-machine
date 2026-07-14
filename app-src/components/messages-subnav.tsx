"use client";

import { SubNav } from "@/components/sub-nav";

export function MessagesSubnav() {
  return (
    <SubNav
      items={[
        { href: "/messages", label: "Logg", description: "Samlad logg över alla utskick — servicepåminnelser, kampanjer, kampanjblad och Sms." },
        { href: "/messages/campaigns", label: "Kampanj", description: "Skicka kampanjer och hantera kampanjblad." },
        { href: "/messages/service", label: "Service", description: "Vilka kunder och maskiner är aktuella för en servicepåminnelse just nu." },
        { href: "/messages/statistics", label: "Statistik", description: "Detaljerad statistik över utskick — kanal, typ, status och maskinkategori." },
      ]}
    />
  );
}
