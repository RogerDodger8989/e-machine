"use client";

import { useEffect } from "react";
import { TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

/**
 * Fångar oväntade fel i sidträdet så en enskild krasch (t.ex. ett fel i en
 * server action utan egen felhantering) visar ett vänligt meddelande med
 * en "Försök igen"-knapp istället för Next.js generiska felsida — resten
 * av appen (navigering, andra flikar) fortsätter fungera som vanligt.
 */
export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="max-w-lg mx-auto mt-12">
      <Card>
        <CardHeader className="flex flex-row items-center gap-2">
          <TriangleAlert className="text-destructive" />
          <CardTitle>Något gick fel</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Ett oväntat fel inträffade. Ingen data har gått förlorad — försök igen, eller gå
            tillbaka och prova en gång till.
          </p>
          {error.message && (
            <p className="text-xs text-muted-foreground bg-muted rounded-md p-2 font-mono break-words">
              {error.message}
            </p>
          )}
          <div className="flex gap-2">
            <Button onClick={reset}>Försök igen</Button>
            <Button variant="outline" onClick={() => (window.location.href = "/")}>
              Till startsidan
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
