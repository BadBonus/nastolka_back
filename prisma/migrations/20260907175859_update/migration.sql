/*
  Warnings:

  - The values [WIKIPEDIA_RULES] on the enum `KindOfRate` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
ALTER TYPE "GameGenres" ADD VALUE 'OTHER';

-- AlterEnum
ALTER TYPE "GamePlatform" ADD VALUE 'OTHER';

-- AlterEnum
ALTER TYPE "GameSystem" ADD VALUE 'OTHER';

-- AlterEnum
BEGIN;
CREATE TYPE "KindOfRate_new" AS ENUM ('CREATIVITY', 'STORYTELLING', 'PLAYER_EDUCATION', 'THEATRICALISE');
ALTER TABLE "event_reviews" ALTER COLUMN "rates" TYPE "KindOfRate_new"[] USING ("rates"::text::"KindOfRate_new"[]);
ALTER TYPE "KindOfRate" RENAME TO "KindOfRate_old";
ALTER TYPE "KindOfRate_new" RENAME TO "KindOfRate";
DROP TYPE "public"."KindOfRate_old";
COMMIT;
