"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { createCategory, updateCategory, deleteCategory } from "@/app/settings/categories/actions";

export interface CategoryRow {
  id: string;
  name: string;
  machineModelCount: number;
  defaultServiceIntervalMonths: number | null;
  defaultFirstServiceIntervalMonths: number | null;
}

function monthsLabel(months: number | null): string {
  return months === null ? "—" : `${months} mån`;
}

function CategoryEditRow({ category }: { category: CategoryRow }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(category.name);
  const [serviceMonths, setServiceMonths] = useState(category.defaultServiceIntervalMonths?.toString() ?? "");
  const [firstMonths, setFirstMonths] = useState(category.defaultFirstServiceIntervalMonths?.toString() ?? "");
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSave() {
    setError(null);
    startTransition(async () => {
      try {
        const form = new FormData();
        form.set("name", name);
        form.set("defaultServiceIntervalMonths", serviceMonths);
        form.set("defaultFirstServiceIntervalMonths", firstMonths);
        await updateCategory(category.id, form);
        setEditing(false);
      } catch (e) {
        setError((e as Error).message);
      }
    });
  }

  function handleDelete() {
    startTransition(async () => {
      await deleteCategory(category.id);
      setDeleteOpen(false);
    });
  }

  if (editing) {
    return (
      <TableRow>
        <TableCell colSpan={4}>
          <div className="flex flex-wrap items-end gap-2">
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Namn</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} autoFocus className="w-40" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Serviceintervall (mån)</Label>
              <Input
                type="number"
                min={1}
                value={serviceMonths}
                onChange={(e) => setServiceMonths(e.target.value)}
                placeholder="12"
                className="w-32"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Första servicen (mån)</Label>
              <Input
                type="number"
                min={1}
                value={firstMonths}
                onChange={(e) => setFirstMonths(e.target.value)}
                placeholder="Samma som ovan"
                className="w-36"
              />
            </div>
            <Button size="sm" onClick={handleSave} disabled={isPending}>
              {isPending ? "Sparar…" : "Spara"}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setName(category.name);
                setServiceMonths(category.defaultServiceIntervalMonths?.toString() ?? "");
                setFirstMonths(category.defaultFirstServiceIntervalMonths?.toString() ?? "");
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
      <TableCell className="font-medium">{category.name}</TableCell>
      <TableCell>{monthsLabel(category.defaultServiceIntervalMonths)}</TableCell>
      <TableCell>{monthsLabel(category.defaultFirstServiceIntervalMonths)}</TableCell>
      <TableCell className="text-right">
        <div className="flex justify-end gap-2">
          <Button variant="outline" size="icon-sm" onClick={() => setEditing(true)} title="Redigera">
            <Pencil />
          </Button>
          <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
            <DialogTrigger render={<Button variant="outline" size="icon-sm" title="Ta bort"><Trash2 /></Button>} />
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Ta bort kategorin &quot;{category.name}&quot;?</DialogTitle>
                <DialogDescription>
                  {category.machineModelCount > 0
                    ? `${category.machineModelCount} maskinmodell${category.machineModelCount === 1 ? "" : "er"} använder den här kategorin och blir okategoriserade om du tar bort den.`
                    : "Ingen maskinmodell använder den här kategorin just nu."}
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDeleteOpen(false)} disabled={isPending}>
                  Avbryt
                </Button>
                <Button variant="destructive" onClick={handleDelete} disabled={isPending}>
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

export function CategoryManager({ categories }: { categories: CategoryRow[] }) {
  const [newName, setNewName] = useState("");
  const [newServiceMonths, setNewServiceMonths] = useState("");
  const [newFirstMonths, setNewFirstMonths] = useState("");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleAdd() {
    setError(null);
    startTransition(async () => {
      try {
        const form = new FormData();
        form.set("name", newName);
        form.set("defaultServiceIntervalMonths", newServiceMonths);
        form.set("defaultFirstServiceIntervalMonths", newFirstMonths);
        await createCategory(form);
        setNewName("");
        setNewServiceMonths("");
        setNewFirstMonths("");
      } catch (e) {
        setError((e as Error).message);
      }
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-2">
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Namn på ny kategori</Label>
          <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="t.ex. Cyklar" className="w-40" />
        </div>
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Serviceintervall (mån)</Label>
          <Input
            type="number"
            min={1}
            value={newServiceMonths}
            onChange={(e) => setNewServiceMonths(e.target.value)}
            placeholder="12"
            className="w-32"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Första servicen (mån)</Label>
          <Input
            type="number"
            min={1}
            value={newFirstMonths}
            onChange={(e) => setNewFirstMonths(e.target.value)}
            placeholder="Samma som ovan"
            className="w-36"
          />
        </div>
        <Button onClick={handleAdd} disabled={isPending || !newName.trim()}>
          {isPending ? "Lägger till…" : "Lägg till"}
        </Button>
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Namn</TableHead>
            <TableHead>Serviceintervall</TableHead>
            <TableHead>Första servicen</TableHead>
            <TableHead />
          </TableRow>
        </TableHeader>
        <TableBody>
          {categories.map((c) => (
            <CategoryEditRow key={c.id} category={c} />
          ))}
          {categories.length === 0 && (
            <TableRow>
              <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                Inga kategorier ännu.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
