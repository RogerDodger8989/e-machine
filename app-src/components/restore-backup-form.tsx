"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const CONFIRM_PHRASE = "ÅTERSTÄLL";

export function RestoreBackupForm() {
  const [file, setFile] = useState<File | null>(null);
  const [open, setOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleRestore() {
    if (!file) return;
    setLoading(true);
    setError(null);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/backup/restore", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Återställning misslyckades");
      setDone(true);
      setOpen(false);
      router.refresh();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <Label>Välj backupfil (.db)</Label>
        <div className="flex items-center gap-2">
          <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
            Välj fil
          </Button>
          <span className="text-sm text-muted-foreground truncate">
            {file ? file.name : "Ingen fil vald"}
          </span>
          <input
            ref={fileInputRef}
            type="file"
            accept=".db"
            className="hidden"
            onChange={(e) => {
              setFile(e.target.files?.[0] ?? null);
              setDone(false);
              setError(null);
            }}
          />
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger
          render={
            <Button variant="destructive" disabled={!file}>
              Återställ från fil
            </Button>
          }
        />
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Återställ databasen?</DialogTitle>
            <DialogDescription>
              Detta skriver över ALL nuvarande data (kunder, maskiner, servicehistorik)
              med innehållet i den valda filen. Den nuvarande databasen
              sparas som säkerhet innan återställningen, men detta bör bara göras om
              du är säker. Andra som använder programmet just nu bör vara utloggade/
              stänga sina flikar under tiden.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-1.5">
            <Label htmlFor="confirm">
              Skriv <span className="font-mono font-semibold">{CONFIRM_PHRASE}</span> för att bekräfta
            </Label>
            <Input id="confirm" value={confirmText} onChange={(e) => setConfirmText(e.target.value)} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
              Avbryt
            </Button>
            <Button
              variant="destructive"
              disabled={confirmText !== CONFIRM_PHRASE || loading}
              onClick={handleRestore}
            >
              {loading ? "Återställer…" : "Återställ nu"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {error && <p className="text-sm text-destructive">{error}</p>}
      {done && <p className="text-sm text-green-700">Återställning klar.</p>}
    </div>
  );
}
