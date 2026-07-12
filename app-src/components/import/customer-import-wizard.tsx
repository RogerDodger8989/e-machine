"use client";

import { useState, useTransition } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileUploadStep } from "@/components/import/file-upload-step";
import { ColumnMapper } from "@/components/import/column-mapper";
import { ImportPreviewTable, type PreviewRow } from "@/components/import/import-preview-table";
import { CUSTOMER_TARGET_FIELDS } from "@/lib/import/customerFields";
import type { ColumnMapping } from "@/lib/import/mapping";
import type { ParsedSpreadsheet } from "@/lib/import/parseSpreadsheet";
import { previewCustomerImport, commitCustomerImport, type CommitCustomerImportResult } from "@/app/settings/import/customers/actions";

type Step = "upload" | "map" | "preview" | "done";

export function CustomerImportWizard() {
  const [step, setStep] = useState<Step>("upload");
  const [parsed, setParsed] = useState<ParsedSpreadsheet | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [mapping, setMapping] = useState<ColumnMapping>({});
  const [previewRows, setPreviewRows] = useState<PreviewRow[]>([]);
  const [commitResult, setCommitResult] = useState<CommitCustomerImportResult | null>(null);
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
        const rows = await previewCustomerImport(parsed.rows, mapping);
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
        const result = await commitCustomerImport(parsed.rows, mapping);
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

  const nameMapped = !!mapping["name"];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Importera kunder från Crona</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {step === "upload" && <FileUploadStep onParsed={handleParsed} />}

        {step === "map" && parsed && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Fil: <span className="font-medium text-foreground">{fileName}</span> ({parsed.rows.length} rader).
              Koppla varje fält till rätt kolumn i din fil.
            </p>
            <ColumnMapper
              detectedColumns={parsed.headers}
              targetFields={CUSTOMER_TARGET_FIELDS}
              mapping={mapping}
              onChange={setMapping}
            />
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={handleReset} disabled={isPending}>
                Välj annan fil
              </Button>
              <Button onClick={handlePreview} disabled={!nameMapped || isPending}>
                {isPending ? "Förhandsgranskar…" : "Förhandsgranska"}
              </Button>
              {!nameMapped && <p className="text-xs text-muted-foreground">Namn måste mappas.</p>}
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
              Klart: <strong className="tabular-nums">{commitResult.created}</strong> nya kunder,{" "}
              <strong className="tabular-nums">{commitResult.updated}</strong> uppdaterade,{" "}
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
