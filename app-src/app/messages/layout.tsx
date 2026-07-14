import { MessagesSubnav } from "@/components/messages-subnav";

export default function MessagesLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <MessagesSubnav />
      {children}
    </div>
  );
}
