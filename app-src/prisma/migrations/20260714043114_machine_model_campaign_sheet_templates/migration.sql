-- Kampanjblad (campaign_sheet MessageTemplate) knyts nu till en MachineModel
-- istället för att varje enskild Machine ha en "erbjuder hämt-/lämnservice"-
-- flagga som osorterat visade ALLA aktiva kampanjblad-mallar. Explicit
-- jointabell, samma mönster som machine_ownerships.

-- 1) Jointabell
CREATE TABLE "machine_model_campaign_sheet_templates" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "machine_model_id" TEXT NOT NULL,
    "template_id" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "machine_model_campaign_sheet_templates_machine_model_id_fkey" FOREIGN KEY ("machine_model_id") REFERENCES "machine_models" ("id"),
    CONSTRAINT "machine_model_campaign_sheet_templates_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "message_templates" ("id")
);

CREATE UNIQUE INDEX "machine_model_campaign_sheet_templates_model_template_key" ON "machine_model_campaign_sheet_templates"("machine_model_id", "template_id");
CREATE INDEX "machine_model_campaign_sheet_templates_template_id_idx" ON "machine_model_campaign_sheet_templates"("template_id");

-- 2) Backfill: varje modell som idag har >=1 maskin med offers_pickup_service=1
-- får en länk till VARJE aktiv campaign_sheet-mall — motsvarar exakt dagens
-- beteende (alla aktiva mallar visas, oavsett maskin) för just den modellen,
-- så inget regredierar vid uppgraderingen. Går att gallra/justera efteråt
-- via det nya UI:t.
INSERT INTO "machine_model_campaign_sheet_templates" ("id", "machine_model_id", "template_id", "created_at")
SELECT lower(hex(randomblob(12))), m."model_id", t."id", CURRENT_TIMESTAMP
FROM (SELECT DISTINCT "model_id" FROM "machines" WHERE "offers_pickup_service" = 1) m
CROSS JOIN (SELECT "id" FROM "message_templates" WHERE "legal_basis" = 'campaign_sheet' AND "is_active" = 1) t;

-- 3) Ta bort den gamla per-maskin-flaggan (SQLite >=3.35 stödjer DROP COLUMN
-- direkt, ingen tabellombyggnad krävs).
ALTER TABLE "machines" DROP COLUMN "offers_pickup_service";
