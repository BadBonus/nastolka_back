-- CreateEnum
CREATE TYPE "OrgFormatMode" AS ENUM ('HYBRID', 'ONLINE', 'OFFLINE');

-- AlterTable
ALTER TABLE "orgs" ADD COLUMN "format_mode" "OrgFormatMode" NOT NULL DEFAULT 'HYBRID';
ALTER TABLE "orgs" ADD COLUMN "country_id" INTEGER;
ALTER TABLE "orgs" ADD COLUMN "city_id" INTEGER;

-- Map preferred_formats → format_mode
UPDATE "orgs"
SET "format_mode" = CASE
  WHEN "preferred_formats" @> ARRAY['ONLINE']::"EventFormat"[]
   AND "preferred_formats" @> ARRAY['OFFLINE']::"EventFormat"[] THEN 'HYBRID'::"OrgFormatMode"
  WHEN "preferred_formats" @> ARRAY['ONLINE']::"EventFormat"[]
   AND NOT ("preferred_formats" @> ARRAY['OFFLINE']::"EventFormat"[]) THEN 'ONLINE'::"OrgFormatMode"
  WHEN "preferred_formats" @> ARRAY['OFFLINE']::"EventFormat"[]
   AND NOT ("preferred_formats" @> ARRAY['ONLINE']::"EventFormat"[]) THEN 'OFFLINE'::"OrgFormatMode"
  ELSE 'HYBRID'::"OrgFormatMode"
END;

-- Backfill country (Belarus) for existing orgs
UPDATE "orgs" SET "country_id" = 630336 WHERE "country_id" IS NULL;

-- HYBRID/OFFLINE without city → ONLINE until profile is updated
UPDATE "orgs"
SET "format_mode" = 'ONLINE'::"OrgFormatMode"
WHERE "format_mode" IN ('HYBRID'::"OrgFormatMode", 'OFFLINE'::"OrgFormatMode")
  AND "city_id" IS NULL;

ALTER TABLE "orgs" ALTER COLUMN "country_id" SET NOT NULL;

ALTER TABLE "orgs" DROP COLUMN "preferred_formats";

-- CreateIndex
CREATE INDEX "orgs_country_id_idx" ON "orgs"("country_id");
CREATE INDEX "orgs_city_id_idx" ON "orgs"("city_id");
CREATE INDEX "orgs_format_mode_idx" ON "orgs"("format_mode");

-- AddForeignKey
ALTER TABLE "orgs" ADD CONSTRAINT "orgs_country_id_fkey" FOREIGN KEY ("country_id") REFERENCES "countries"("geoname_id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "orgs" ADD CONSTRAINT "orgs_city_id_fkey" FOREIGN KEY ("city_id") REFERENCES "cities"("geoname_id") ON DELETE SET NULL ON UPDATE CASCADE;
