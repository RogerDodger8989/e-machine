-- CreateTable
CREATE TABLE "work_orders" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "machine_id" TEXT NOT NULL,
    "order_number" TEXT NOT NULL,
    "opened_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "closed_at" DATETIME,
    "work_performed" TEXT,
    "status" TEXT NOT NULL DEFAULT 'open',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "work_orders_machine_id_fkey" FOREIGN KEY ("machine_id") REFERENCES "machines" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "work_order_parts" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "work_order_id" TEXT NOT NULL,
    "spare_part_id" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "unit_price_ore" INTEGER,
    CONSTRAINT "work_order_parts_work_order_id_fkey" FOREIGN KEY ("work_order_id") REFERENCES "work_orders" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "work_order_parts_spare_part_id_fkey" FOREIGN KEY ("spare_part_id") REFERENCES "spare_parts" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "message_templates" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "key" TEXT NOT NULL,
    "channel" TEXT NOT NULL,
    "legal_basis" TEXT NOT NULL,
    "subject" TEXT,
    "body" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "message_log" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "customer_id" TEXT,
    "machine_id" TEXT,
    "template_key" TEXT,
    "channel" TEXT NOT NULL,
    "legal_basis" TEXT NOT NULL,
    "recipient_address" TEXT,
    "subject" TEXT,
    "body_sent" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "provider_message_id" TEXT,
    "error_message" TEXT,
    "sent_at" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "message_log_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "message_log_machine_id_fkey" FOREIGN KEY ("machine_id") REFERENCES "machines" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "settings" (
    "key" TEXT NOT NULL PRIMARY KEY,
    "value" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "work_orders_order_number_key" ON "work_orders"("order_number");

-- CreateIndex
CREATE UNIQUE INDEX "message_templates_key_key" ON "message_templates"("key");

-- CreateIndex
CREATE INDEX "message_log_customer_id_created_at_idx" ON "message_log"("customer_id", "created_at");

-- CreateIndex
CREATE INDEX "message_log_machine_id_created_at_idx" ON "message_log"("machine_id", "created_at");
