import Link from "next/link";

export interface BreadcrumbItem {
  label: string;
  href: string;
}

export function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav className="flex items-center gap-1.5 text-sm text-muted-foreground mb-1">
      {items.map((item, i) => (
        <span key={item.href} className="flex items-center gap-1.5">
          {i > 0 && <span className="text-muted-foreground/50">/</span>}
          <Link href={item.href} className="hover:text-foreground hover:underline">
            {item.label}
          </Link>
        </span>
      ))}
    </nav>
  );
}
