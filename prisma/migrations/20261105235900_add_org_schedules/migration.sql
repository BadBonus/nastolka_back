-- AlterTable
ALTER TABLE "orgs" ADD COLUMN "schedules" JSONB NOT NULL DEFAULT '[]';
