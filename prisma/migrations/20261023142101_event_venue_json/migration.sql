-- Wipe synthetic/legacy events (hard cutover to venue JSON)
DELETE FROM "event_reviews";
DELETE FROM "event_materials";
DELETE FROM "event_favorites";
DELETE FROM "event_requests";
DELETE FROM "event_telegram_messages";
DELETE FROM "events";

-- AlterTable
ALTER TABLE "events" DROP COLUMN "address",
DROP COLUMN "map_url",
ADD COLUMN "venue" JSONB NOT NULL;
