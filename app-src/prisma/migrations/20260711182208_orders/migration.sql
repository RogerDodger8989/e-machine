-- CreateTable
CREATE TABLE "orders" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "customer_id" TEXT NOT NULL,
    "article_description" TEXT NOT NULL,
    "shelf_info" TEXT,
    "picked_up" BOOLEAN NOT NULL DEFAULT false,
    "picked_up_at" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "orders_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "orders_customer_id_created_at_idx" ON "orders"("customer_id", "created_at");

-- AlterTable
ALTER TABLE "message_log" ADD COLUMN "order_id" TEXT REFERENCES "orders" ("id");
