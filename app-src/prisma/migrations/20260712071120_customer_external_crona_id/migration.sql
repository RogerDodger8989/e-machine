-- AlterTable
ALTER TABLE "customers" ADD COLUMN "external_crona_id" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "customers_external_crona_id_key" ON "customers"("external_crona_id");
