-- Remove deprecated X key from stored soclinks JSON
UPDATE "users"
SET "soclinks" = "soclinks" - 'X'
WHERE "soclinks" IS NOT NULL
  AND "soclinks" ? 'X';

UPDATE "orgs"
SET "soclinks" = "soclinks" - 'X'
WHERE "soclinks" IS NOT NULL
  AND "soclinks" ? 'X';

-- Recreate ESocLinks enum (not used as a column type)
DROP TYPE "ESocLinks";
CREATE TYPE "ESocLinks" AS ENUM (
  'VK',
  'TELEGRAM',
  'DISCORD',
  'INSTAGRAM',
  'REDDIT',
  'YOUTUBE',
  'THREADS'
);
