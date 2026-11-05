-- CreateEnum
CREATE TYPE "CostFormat" AS ENUM ('payment', 'donate');

-- AlterTable
ALTER TABLE "orgs" ADD COLUMN "cost_format" "CostFormat" NOT NULL DEFAULT 'payment';
