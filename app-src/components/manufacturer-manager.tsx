"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Pencil, Trash2 } from "lucide-react";
import { createManufacturer, updateManufacturer, deleteManufacturer } from "@/app/settings/manufacturers/actions";

export interface ManufacturerRow {
  id: string;
  name: string;
  machineModelCount: number;
}

function ManufacturerEditRow({ manufacturer }: { manufacturer: ManufacturerRow }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(manufacturer.name);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  function handleSave() {
    setError(null);
    startTransition(async () => {
      try {
        const form = new FormData();
        form.set("name", name);
        await updateManufacturer(manufacturer.id, form);
        setEditing(false);
      } catch (e) {
        setError((e as Error).message);
      }
    });
  }

  function handleDelete() {
    setDeleteError(null);
    startTransition(async () => {
      try {
        await deleteManufacturer(manufacturer.id);
        setDeleteOpen(false);
      } catch (e) {
        setDeleteError((e as Error).message);
      }
    });
  }

  if (editing) {
    return (
      <TableRow>
        <TableCell colSpan={3}>
          <div className="flex items-center gap-2">
            <Input value={name} onChange={(e) => setName(e.target.value)} autoFocus className="max-w-xs" />
            <Button size="sm" onClick={handleSave} disabled={isPending}>
              {isPending ? "Sparar…" : "Spara"}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setName(manufacturer.name);
                setEditing(false);
                setError(null);
              }}
              disabled={isPending}
            >
              Avbryt
            </Button>
          </div>
          {error && <p className="text-sm text-destructive mt-1">{error}</p>}
        </TableCell>
      </TableRow>
    );
  }

  return (
    <TableRow>
      <TableCell className="font-medium">{manufacturer.name}</TableCell>
      <TableCell>{manufacturer.machineModelCount}</TableCell>
      <TableCell className="text-right">
        <div className="flex justify-end gap-2">
          <Button variant="outline" size="icon-sm" onClick={() => setEditing(true)} title="Redigera">
            <Pencil />
          </Button>
          <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
            <DialogTrigger render={<Button variant="outline" size="icon-sm" title="Ta bort"><Trash2 /></Button>} />
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Ta bort tillverkaren &quot;{manufacturer.name}&quot;?</DialogTitle>
                <DialogDescription>
                  {manufacturer.machineModelCount > 0
                    ? `${manufacturer.machineModelCount} maskinmodell${manufacturer.machineModelCount === 1 ? "" : "er"} använder den här tillverkaren — den kan inte tas bort förrän de bytt tillverkare eller tagits bort.`
                    : "Ingen maskinmodell använder den här tillverkaren just nu."}
                </DialogDescription>
              </DialogHeader>
              {deleteError && <p className="text-sm text-destructive">{deleteError}</p>}
              <DialogFooter>
                <Button variant="outline" onClick={() => setDeleteOpen(false)} disabled={isPending}>
                  Avbryt
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={isPending || manufacturer.machineModelCount > 0}
                >
                  {isPending ? "Tar bort…" : "Ta bort"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </TableCell>
    </TableRow>
  );
}

export function ManufacturerManager({ manufacturers }: { manufacturers: ManufacturerRow[] }) {
  const [newName, setNewName] = useState("");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleAdd() {
    setError(null);
    startTransition(async () => {
      try {
        const form = new FormData();
        form.set("name", newName);
        await createManufacturer(form);
        setNewName("");
      } catch (e) {
        setError((e as Error).message);
      }
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Namn på ny tillverkare"
          className="max-w-xs"
        />
        <Button onClick={handleAdd} disabled={isPending || !newName.trim()}>
          {isPending ? "Lägger till…" : "Lägg till"}
        </Button>
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Namn</TableHead>
            <TableHead>Antal modeller</TableHead>
            <TableHead />
          </TableRow>
        </TableHeader>
        <TableBody>
          {manufacturers.map((m) => (
            <ManufacturerEditRow key={m.id} manufacturer={m} />
          ))}
          {manufacturers.length === 0 && (
            <TableRow>
              <TableCell colSpan={3} className="text-center text-muted-foreground py-8">
                Inga tillverkare ännu.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
