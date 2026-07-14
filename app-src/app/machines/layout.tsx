import { MachinesSubnav } from "@/components/machines-subnav";

export default function MachinesLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <MachinesSubnav />
      {children}
    </div>
  );
}
