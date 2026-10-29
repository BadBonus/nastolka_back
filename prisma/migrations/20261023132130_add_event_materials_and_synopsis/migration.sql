-- CreateEnum
CREATE TYPE "EventMaterialType" AS ENUM ('FILE', 'NOTE');

-- AlterTable
ALTER TABLE "events" ADD COLUMN     "synopsis" TEXT;

-- CreateTable
CREATE TABLE "event_materials" (
    "id" TEXT NOT NULL,
    "event_id" TEXT NOT NULL,
    "type" "EventMaterialType" NOT NULL,
    "title" VARCHAR(120) NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_public" BOOLEAN NOT NULL DEFAULT true,
    "storage_key" VARCHAR(512),
    "original_name" VARCHAR(255),
    "mime_type" VARCHAR(120),
    "size_bytes" INTEGER,
    "checksum" VARCHAR(64),
    "body" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "event_materials_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "event_materials_event_id_sort_order_idx" ON "event_materials"("event_id", "sort_order");

-- AddForeignKey
ALTER TABLE "event_materials" ADD CONSTRAINT "event_materials_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CHECK: FILE requires storage fields; NOTE requires body
ALTER TABLE "event_materials" ADD CONSTRAINT "event_materials_type_fields_check" CHECK (
  ("type" = 'FILE' AND "storage_key" IS NOT NULL AND "size_bytes" IS NOT NULL AND "body" IS NULL)
  OR
  ("type" = 'NOTE' AND "body" IS NOT NULL AND "storage_key" IS NULL AND "original_name" IS NULL
   AND "mime_type" IS NULL AND "size_bytes" IS NULL AND "checksum" IS NULL)
);
