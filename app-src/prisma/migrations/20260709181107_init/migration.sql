-- CreateTable
CREATE TABLE "customers" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "phone_normalized" TEXT,
    "email" TEXT,
    "marketing_consent" BOOLEAN NOT NULL DEFAULT false,
    "marketing_consent_at" DATETIME,
    "notes" TEXT,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "anonymized_at" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "machine_models" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "manufacturer" TEXT NOT NULL,
    "model_name" TEXT NOT NULL,
    "category" TEXT,
    "standard_warranty_months" INTEGER NOT NULL DEFAULT 24,
    "standard_service_interval_months" INTEGER NOT NULL DEFAULT 12,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "machines" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "model_id" TEXT NOT NULL,
    "serial_number" TEXT NOT NULL,
    "purchase_date" DATETIME,
    "warranty_end_date" DATETIME,
    "notes" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "machines_model_id_fkey" FOREIGN KEY ("model_id") REFERENCES "machine_models" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "machine_ownerships" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "machine_id" TEXT NOT NULL,
    "customer_id" TEXT NOT NULL,
    "owned_from" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "owned_until" DATETIME,
    "unlink_reason" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "machine_ownerships_machine_id_fkey" FOREIGN KEY ("machine_id") REFERENCES "machines" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "machine_ownerships_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "machine_models_manufacturer_model_name_key" ON "machine_models"("manufacturer", "model_name");

-- CreateIndex
CREATE UNIQUE INDEX "machines_serial_number_key" ON "machines"("serial_number");
