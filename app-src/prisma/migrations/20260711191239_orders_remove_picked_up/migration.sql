-- Appen ska inte hålla reda på uthämtningsstatus — tar bort fälten helt
-- (inte bara dölja i UI). DROP COLUMN istället för tabellombyggnad, för att
-- undvika FOREIGN KEY-konflikten med message_log.order_id.
ALTER TABLE "orders" DROP COLUMN "picked_up";
ALTER TABLE "orders" DROP COLUMN "picked_up_at";
