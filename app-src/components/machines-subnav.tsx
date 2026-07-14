"use client";

import { SubNav } from "@/components/sub-nav";

export function MachinesSubnav() {
  return (
    <SubNav
      items={[
        { href: "/machines", label: "Maskiner" },
        { href: "/machine-models", label: "Modeller" },
      ]}
    />
  );
}
