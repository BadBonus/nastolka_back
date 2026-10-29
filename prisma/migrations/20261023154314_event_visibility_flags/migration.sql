-- AlterTable
ALTER TABLE "events" ADD COLUMN     "show_location" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "show_materials" BOOLEAN NOT NULL DEFAULT true;
