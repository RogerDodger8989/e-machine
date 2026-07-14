-- Manufacturer som egen hanterad lista istället för fri sträng på
-- machine_models (samma mönster som categories-migrationen använde för
-- category). Samt kategori-baserade standard-serviceintervall (inkl. en
-- separat "första service"-variant) som modeller ärver om de inte satt ett
-- eget värde — standard_service_interval_months görs nullable för det
-- (null = ärv från kategorin).

-- 1) Manufacturer-tabell + backfill från befintliga fria strängar
CREATE TABLE "manufacturers" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX "manufacturers_name_key" ON "manufacturers"("name");

INSERT INTO "manufacturers" ("id", "name", "created_at")
SELECT lower(hex(randomblob(12))), "manufacturer", CURRENT_TIMESTAMP
FROM (SELECT DISTINCT "manufacturer" FROM "machine_models");

-- 2) Peka machine_models mot manufacturers istället för fri text
ALTER TABLE "machine_models" ADD COLUMN "manufacturer_id" TEXT REFERENCES "manufacturers" ("id") ON DELETE RESTRICT;

UPDATE "machine_models"
SET "manufacturer_id" = (SELECT "id" FROM "manufacturers" WHERE "manufacturers"."name" = "machine_models"."manufacturer");

DROP INDEX IF EXISTS "machine_models_manufacturer_model_name_key";
ALTER TABLE "machine_models" DROP COLUMN "manufacturer";
CREATE UNIQUE INDEX "machine_models_manufacturer_id_model_name_key" ON "machine_models"("manufacturer_id", "model_name");

-- 3) Kategori-baserade standard-serviceintervall
ALTER TABLE "categories" ADD COLUMN "default_service_interval_months" INTEGER;
ALTER TABLE "categories" ADD COLUMN "default_first_service_interval_months" INTEGER;

-- 4) standard_service_interval_months blir nullable (null = ärv från
-- kategori) — SQLite saknar ALTER COLUMN, så vi kopierar värdena via en
-- tillfällig kolumn istället för en hel tabellombyggnad.
ALTER TABLE "machine_models" ADD COLUMN "standard_service_interval_months_new" INTEGER;
UPDATE "machine_models" SET "standard_service_interval_months_new" = "standard_service_interval_months";
ALTER TABLE "machine_models" DROP COLUMN "standard_service_interval_months";
ALTER TABLE "machine_models" RENAME COLUMN "standard_service_interval_months_new" TO "standard_service_interval_months";

ALTER TABLE "machine_models" ADD COLUMN "first_service_interval_months" INTEGER;
