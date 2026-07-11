-- orders-tabellen är tom (funktionen precis byggd om) — säkert att bygga om
-- rakt av istället för att migrera bort en kundkoppling som aldrig använts.
DROP TABLE "orders";

CREATE TABLE "orders" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "phone_number" TEXT NOT NULL,
    "article_description" TEXT NOT NULL,
    "amount_due" INTEGER,
    "picked_up" BOOLEAN NOT NULL DEFAULT false,
    "picked_up_at" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE INDEX "orders_created_at_idx" ON "orders"("created_at");
