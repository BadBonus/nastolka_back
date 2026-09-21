import { createReadStream, existsSync, readFileSync } from 'fs';
import { createInterface } from 'readline';
import path from 'path';
import { PrismaClient } from '../../src/shared/prisma/generated/client';

const DATA_DIR = path.join(__dirname, '..', 'data', 'geonames');
const COUNTRY_YAML_PATH = path.join(DATA_DIR, 'country.yaml');
const MIN_POPULATION = 10_000;
const ALT_LANGS = new Set(['ru', 'en']);
const BATCH_SIZE = 500;

/** Countries to import: ISO code → dump filename (without path). */
const COUNTRIES: Array<{
  isoCode: string;
  file: string;
  fallbackGeonameId: number;
  name: string;
}> = [
  {
    isoCode: 'BY',
    file: 'BY.txt',
    fallbackGeonameId: 630336,
    name: 'Belarus',
  },
];

type GeoRow = {
  geonameId: number;
  name: string;
  asciiname: string;
  featureClass: string;
  featureCode: string;
  countryCode: string;
  population: number;
};

type AltRow = {
  id: number;
  cityId: number;
  lang: string;
  name: string;
  isPreferredName: boolean;
  isShortName: boolean;
};

/** Parses simple `ISO: Name` / `ISO: 'Name'` YAML map. */
function loadCountryRuNames(filePath: string): Map<string, string> {
  const map = new Map<string, string>();
  if (!existsSync(filePath)) {
    throw new Error(`Missing country names file: ${filePath}`);
  }

  for (const raw of readFileSync(filePath, 'utf8').split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;

    const match = line.match(/^([A-Za-z]{2})\s*:\s*(.+)$/);
    if (!match) continue;

    let name = match[2].trim();
    if (
      (name.startsWith("'") && name.endsWith("'")) ||
      (name.startsWith('"') && name.endsWith('"'))
    ) {
      name = name.slice(1, -1);
    }
    map.set(match[1].toUpperCase(), name);
  }

  return map;
}

function parseGeoLine(line: string): GeoRow | null {
  if (!line.trim()) return null;
  const cols = line.split('\t');
  if (cols.length < 15) return null;
  return {
    geonameId: Number(cols[0]),
    name: cols[1],
    asciiname: cols[2],
    featureClass: cols[6],
    featureCode: cols[7],
    countryCode: cols[8],
    population: Number(cols[14]) || 0,
  };
}

async function* readLines(filePath: string): AsyncGenerator<string> {
  const rl = createInterface({
    input: createReadStream(filePath, { encoding: 'utf8' }),
    crlfDelay: Infinity,
  });
  for await (const line of rl) {
    yield line;
  }
}

async function flushAltBatch(
  prisma: PrismaClient,
  batch: AltRow[],
): Promise<void> {
  if (batch.length === 0) return;
  await prisma.alternateName.createMany({
    data: batch,
    skipDuplicates: true,
  });
  batch.length = 0;
}

export async function seedGeo(prisma: PrismaClient): Promise<void> {
  const altPath = path.join(DATA_DIR, 'alternateNames.txt');
  if (!existsSync(altPath)) {
    throw new Error(`Missing GeoNames dump: ${altPath}`);
  }

  const countryRuNames = loadCountryRuNames(COUNTRY_YAML_PATH);
  const allCityIds = new Set<number>();

  for (const country of COUNTRIES) {
    const dumpPath = path.join(DATA_DIR, country.file);
    if (!existsSync(dumpPath)) {
      throw new Error(`Missing GeoNames dump: ${dumpPath}`);
    }

    let countryGeonameId = country.fallbackGeonameId;
    let englishName = country.name;
    const cities: Array<{ geonameId: number; name: string }> = [];

    for await (const line of readLines(dumpPath)) {
      const row = parseGeoLine(line);
      if (!row) continue;

      if (row.featureCode === 'PCLI' || row.featureCode === 'PCLS') {
        countryGeonameId = row.geonameId;
        englishName = row.name || country.name;
      }

      if (row.featureClass === 'P' && row.population >= MIN_POPULATION) {
        cities.push({
          geonameId: row.geonameId,
          name: row.asciiname || row.name,
        });
      }
    }

    const ruName = countryRuNames.get(country.isoCode);
    if (!ruName) {
      console.warn(
        `[geo] no RU name in country.yaml for ${country.isoCode}, fallback: ${englishName}`,
      );
    }
    const countryName = ruName ?? englishName;

    await prisma.country.upsert({
      where: { geonameId: countryGeonameId },
      create: {
        geonameId: countryGeonameId,
        isoCode: country.isoCode,
        name: countryName,
      },
      update: {
        isoCode: country.isoCode,
        name: countryName,
      },
    });

    await prisma.city.createMany({
      data: cities.map((city) => ({
        geonameId: city.geonameId,
        countryId: countryGeonameId,
        name: city.name,
      })),
      skipDuplicates: true,
    });

    for (const city of cities) {
      allCityIds.add(city.geonameId);
    }

    console.log(
      `[geo] ${country.isoCode} (${countryName}): ${cities.length} cities (population >= ${MIN_POPULATION})`,
    );
  }

  let altCount = 0;
  const batch: AltRow[] = [];

  for await (const line of readLines(altPath)) {
    if (!line.trim()) continue;
    const cols = line.split('\t');
    if (cols.length < 4) continue;

    const id = Number(cols[0]);
    const cityId = Number(cols[1]);
    const lang = cols[2];
    const name = cols[3];
    if (!allCityIds.has(cityId) || !ALT_LANGS.has(lang) || !name) continue;

    batch.push({
      id,
      cityId,
      lang,
      name,
      isPreferredName: cols[4] === '1',
      isShortName: cols[5] === '1',
    });
    altCount += 1;

    if (batch.length >= BATCH_SIZE) {
      await flushAltBatch(prisma, batch);
    }
  }

  await flushAltBatch(prisma, batch);
  console.log(`[geo] alternate names imported: ${altCount}`);
}
