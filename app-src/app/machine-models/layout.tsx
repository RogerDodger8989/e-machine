import { MachinesSubnav } from "@/components/machines-subnav";

export default function MachineModelsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <MachinesSubnav />
      {children}
    </div>
  );
}
