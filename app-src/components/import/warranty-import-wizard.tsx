"use client";

import { useState, useTransition } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileUploadStep } from "@/components/import/file-upload-step";
import { ColumnMapper } from "@/components/import/column-mapper";
import { ImportPreviewTable, type PreviewRow } from "@/components/import/import-preview-table";
import { WARRANTY_TARGET_FIELDS } from "@/lib/import/warrantyFields";
import type { ColumnMapping } from "@/lib/import/mapping";
import type { ParsedSpreadsheet } from "@/lib/import/parseSpreadsheet";
import { previewWarrantyImport, commitWarrantyImport, type CommitWarrantyImportResult } from "@/app/settings/import/warranty/actions";

type Step = "upload" | "map" | "preview" | "done";

export function WarrantyImportWizard({ manufacturers }: { manufacturers: { id: string; name: string }[] }) {
  const [manufacturer, setManufacturer] = useState<string>(manufacturers[0]?.name ?? "");
  const [step, setStep] = useState<Step>("upload");
  const [parsed, setParsed] = useState<ParsedSpreadsheet | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [mapping, setMapping] = useState<ColumnMapping>({});
  const [previewRows, setPreviewRows] = useState<PreviewRow[]>([]);
  const [commitResult, setCommitResult] = useState<CommitWarrantyImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleParsed(data: ParsedSpreadsheet, name: string) {
    setParsed(data);
    setFileName(name);
    setMapping({});
    setStep("map");
  }

  function handlePreview() {
    if (!parsed) return;
    setError(null);
    startTransition(async () => {
      try {
        const rows = await previewWarrantyImport(parsed.rows, mapping, manufacturer);
        setPreviewRows(rows);
        setStep("preview");
      } catch (err) {
        setError((err as Error).message);
      }
    });
  }

  function handleCommit() {
    if (!parsed) return;
    setError(null);
    startTransition(async () => {
      try {
        const result = await commitWarrantyImport(parsed.rows, mapping, manufacturer);
        setCommitResult(result);
        setStep("done");
      } catch (err) {
        setError((err as Error).message);
      }
    });
  }

  function handleReset() {
    setStep("upload");
    setParsed(null);
    setFileName("");
    setMapping({});
    setPreviewRows([]);
    setCommitResult(null);
    setError(null);
  }

  const serialMapped = !!mapping["serialNumber"];
  const modelMapped = !!mapping["modelName"];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Importera garantiprodukter</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1.5">
          <p className="text-sm font-medium">Tillverkare</p>
          {manufacturers.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Inga tillverkare finns ännu — skapa en under Inställningar → Tillverkare.
            </p>
          ) : (
            <Select
              value={manufacturer}
              onValueChange={(v) => v && setManufacturer(v)}
              disabled={step !== "upload"}
              items={Object.fromEntries(manufacturers.map((m) => [m.name, m.name]))}
            >
              <SelectTrigger className="w-full sm:w-64">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {manufacturers.map((m) => (
                  <SelectItem key={m.id} value={m.name}>
                    {m.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        {step === "upload" && <FileUploadStep onParsed={handleParsed} />}

        {step === "map" && parsed && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Fil: <span className="font-medium text-foreground">{fileName}</span> ({parsed.rows.length} rader),
              tillverkare: <span className="font-medium text-foreground">{manufacturer}</span>.
              Koppla varje fält till rätt kolumn i din fil.
            </p>
            <ColumnMapper
              detectedColumns={parsed.headers}
              targetFields={WARRANTY_TARGET_FIELDS}
              mapping={mapping}
              onChange={setMapping}
            />
            <div className="flex items-center gap-2 flex-wrap">
              <Button variant="outline" onClick={handleReset} disabled={isPending}>
                Välj annan fil
              </Button>
              <Button onClick={handlePreview} disabled={!serialMapped || !modelMapped || isPending}>
                {isPending ? "Förhandsgranskar…" : "Förhandsgranska"}
              </Button>
              {(!serialMapped || !modelMapped) && (
                <p className="text-xs text-muted-foreground">Serienummer och modellnamn måste mappas.</p>
              )}
            </div>
          </div>
        )}

        {step === "preview" && (
          <div className="space-y-4">
            <ImportPreviewTable rows={previewRows} />
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => setStep("map")} disabled={isPending}>
                Ändra mappning
              </Button>
              <Button onClick={handleCommit} disabled={isPending}>
                {isPending ? "Importerar…" : "Bekräfta import"}
              </Button>
            </div>
          </div>
        )}

        {step === "done" && commitResult && (
          <div className="space-y-4">
            <p className="text-sm">
              Klart: <strong className="tabular-nums">{commitResult.machinesCreated}</strong> nya maskiner,{" "}
              <strong className="tabular-nums">{commitResult.machinesUpdated}</strong> uppdaterade,{" "}
              <strong className="tabular-nums">{commitResult.customersCreated}</strong> nya kunder skapade,{" "}
              <strong className="tabular-nums">{commitResult.skipped}</strong> hoppades över.
            </p>
            <Button variant="outline" onClick={handleReset}>
              Importera en till fil
            </Button>
          </div>
        )}

        {error && <p className="text-sm text-destructive">{error}</p>}
      </CardContent>
    </Card>
  );
}
