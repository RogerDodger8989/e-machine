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
import { createCategory, updateCategory, deleteCategory } from "@/app/settings/categories/actions";

export interface CategoryRow {
  id: string;
  name: string;
  machineModelCount: number;
}

function CategoryEditRow({ category }: { category: CategoryRow }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(category.name);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSave() {
    setError(null);
    startTransition(async () => {
      try {
        const form = new FormData();
        form.set("name", name);
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
        <TableCell colSpan={3}>
          <div className="flex items-center gap-2">
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
              className="max-w-xs"
            />
            <Button size="sm" onClick={handleSave} disabled={isPending}>
              {isPending ? "Sparar…" : "Spara"}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setName(category.name);
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
      <TableCell>{category.machineModelCount}</TableCell>
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
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleAdd() {
    setError(null);
    startTransition(async () => {
      try {
        const form = new FormData();
        form.set("name", newName);
        await createCategory(form);
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
          placeholder="Namn på ny kategori"
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
          {categories.map((c) => (
            <CategoryEditRow key={c.id} category={c} />
          ))}
          {categories.length === 0 && (
            <TableRow>
              <TableCell colSpan={3} className="text-center text-muted-foreground py-8">
                Inga kategorier ännu.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
