/*
  Warnings:

  - The values [SESSION_ZERO] on the enum `SessionType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "SessionType_new" AS ENUM ('ONE_SHOT', 'CAMPAIGN');
ALTER TABLE "events" ALTER COLUMN "session_type" TYPE "SessionType_new" USING ("session_type"::text::"SessionType_new");
ALTER TYPE "SessionType" RENAME TO "SessionType_old";
ALTER TYPE "SessionType_new" RENAME TO "SessionType";
DROP TYPE "public"."SessionType_old";
COMMIT;

-- AlterTable
ALTER TABLE "orgs" ADD COLUMN     "preferred_formats" "EventFormat"[],
ADD COLUMN     "preferred_genres" "GameGenres"[],
ADD COLUMN     "preferred_systems" "GameSystem"[];
