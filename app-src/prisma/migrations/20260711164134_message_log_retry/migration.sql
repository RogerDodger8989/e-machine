-- AlterTable
ALTER TABLE "message_log" ADD COLUMN "retry_of_id" TEXT REFERENCES "message_log" ("id");
