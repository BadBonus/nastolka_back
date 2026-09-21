-- CreateTable
CREATE TABLE "countries" (
    "geoname_id" INTEGER NOT NULL,
    "iso_code" CHAR(2) NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "countries_pkey" PRIMARY KEY ("geoname_id")
);

-- CreateTable
CREATE TABLE "cities" (
    "geoname_id" INTEGER NOT NULL,
    "country_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "cities_pkey" PRIMARY KEY ("geoname_id")
);

-- CreateTable
CREATE TABLE "alternate_names" (
    "id" INTEGER NOT NULL,
    "city_id" INTEGER NOT NULL,
    "lang" VARCHAR(10) NOT NULL,
    "name" TEXT NOT NULL,
    "is_preferred_name" BOOLEAN NOT NULL DEFAULT false,
    "is_short_name" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "alternate_names_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "countries_iso_code_key" ON "countries"("iso_code");

-- CreateIndex
CREATE INDEX "cities_country_id_idx" ON "cities"("country_id");

-- CreateIndex
CREATE INDEX "alternate_names_city_id_lang_idx" ON "alternate_names"("city_id", "lang");

-- CreateIndex
CREATE INDEX "alternate_names_name_idx" ON "alternate_names"("name");

-- AddForeignKey
ALTER TABLE "cities" ADD CONSTRAINT "cities_country_id_fkey" FOREIGN KEY ("country_id") REFERENCES "countries"("geoname_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alternate_names" ADD CONSTRAINT "alternate_names_city_id_fkey" FOREIGN KEY ("city_id") REFERENCES "cities"("geoname_id") ON DELETE RESTRICT ON UPDATE CASCADE;
