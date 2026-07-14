"use client";

import { Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function CampaignSheetPreviewCell({
  templateKey,
  subject,
  body,
}: {
  templateKey: string;
  subject: string | null;
  body: string;
}) {
  return (
    <div className="flex items-center gap-1.5 max-w-[240px]">
      <span className="truncate text-muted-foreground" title={body}>
        {body}
      </span>
      <Dialog>
        <DialogTrigger
          render={
            <Button variant="outline" size="icon-sm" title="Visa förhandsgranskning" aria-label="Visa förhandsgranskning">
              <Eye />
            </Button>
          }
        />
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{templateKey}</DialogTitle>
            <DialogDescription>Förhandsgranskning med exempeldata från variabeltabellen ovan.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            {subject && (
              <div>
                <div className="text-xs font-medium text-muted-foreground mb-1">Ämne</div>
                <div className="text-sm font-medium">{subject}</div>
              </div>
            )}
            <div>
              <div className="text-xs font-medium text-muted-foreground mb-1">Innehåll</div>
              <div className="text-sm whitespace-pre-line max-h-96 overflow-auto border rounded-md p-3 bg-muted/30">
                {body}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
