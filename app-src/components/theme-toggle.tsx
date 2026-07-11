"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Temat kan bara läsas säkert efter mount (localStorage/systempreferens
  // finns inte på servern) — undviker hydration-mismatch.
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return <Button variant="outline" size="icon" aria-hidden className="opacity-0" />;
  }

  const isDark = resolvedTheme === "dark";

  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      title={isDark ? "Byt till ljust läge" : "Byt till mörkt läge"}
      aria-label={isDark ? "Byt till ljust läge" : "Byt till mörkt läge"}
    >
      {isDark ? <Sun /> : <Moon />}
    </Button>
  );
}
