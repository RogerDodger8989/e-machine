-- CreateTable
CREATE TABLE "categories" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "categories_name_key" ON "categories"("name");

-- Backfill: one Category row per distinct existing free-text value
INSERT INTO "categories" ("id", "name", "created_at")
SELECT lower(hex(randomblob(12))), category, CURRENT_TIMESTAMP
FROM (SELECT DISTINCT category FROM "machine_models" WHERE category IS NOT NULL AND TRIM(category) != '');

-- AlterTable: add the FK column
ALTER TABLE "machine_models" ADD COLUMN "category_id" TEXT REFERENCES "categories" ("id") ON DELETE SET NULL;

-- Point existing rows at their backfilled category
UPDATE "machine_models"
SET "category_id" = (SELECT "id" FROM "categories" WHERE "categories"."name" = "machine_models"."category")
WHERE category IS NOT NULL AND TRIM(category) != '';

-- Drop the old free-text column
ALTER TABLE "machine_models" DROP COLUMN "category";
