import {
  EventFormat,
  SessionType,
  GameGenres,
  GameSystem,
  GamePlatform,
  EventStatus,
  Currency,
  EAccProviders,
  OrgFormatMode,
} from '../../src/shared/prisma/generated/enums';
import { PrismaClient } from '../../src/shared/prisma/generated/client';
import { fakerRU as faker } from '@faker-js/faker';
import * as argon2 from 'argon2';
import { createUniqueSlug } from '../../src/common/utils/createUniqueSlug';

function getRandomEnum<T extends object>(anEnum: T): T[keyof T] {
  const enumValues = Object.values(anEnum) as unknown as T[keyof T][];
  const randomIndex = Math.floor(Math.random() * enumValues.length);
  return enumValues[randomIndex];
}

function getRandomEnums<T extends object>(
  anEnum: T,
  count: number,
): T[keyof T][] {
  const enumValues = Object.values(anEnum) as unknown as T[keyof T][];
  const shuffled = [...enumValues].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

export async function seedMocks(prisma: PrismaClient) {
  await prisma.eventReview.deleteMany({});
  await prisma.eventRequest.deleteMany({});
  await prisma.event.deleteMany({});
  await prisma.org.deleteMany({});
  await prisma.account.deleteMany({});
  await prisma.user.deleteMany({});

  const country = await prisma.country.findFirst({
    where: { isoCode: 'BY' },
    include: { cities: { take: 20 } },
  });

  if (!country || country.cities.length === 0) {
    throw new Error(
      'Geo seed required before mock seed (country BY with cities)',
    );
  }

  const passwordHash = await argon2.hash('12341234');
  const createdOrgs: { id: string }[] = [];

  for (let i = 0; i < 70; i++) {
    const nickname =
      faker.internet.username() + Math.floor(Math.random() * 1000);
    const email = faker.internet.email({ firstName: nickname }).toLowerCase();
    const userSlug = createUniqueSlug(nickname);
    const formatMode = getRandomEnum(OrgFormatMode);
    const randomCity = faker.helpers.arrayElement(country.cities);
    const cityId =
      formatMode === OrgFormatMode.ONLINE
        ? faker.datatype.boolean()
          ? randomCity.geonameId
          : null
        : randomCity.geonameId;

    const user = await prisma.user.create({
      data: {
        nickname,
        email,
        slug: userSlug,
        timezone: 'UTC+3',
        roles: {
          connect: [{ slug: 'USER' }, { slug: 'ORG' }],
        },
        isVerified: true,
        accounts: {
          create: {
            provider: EAccProviders.EMAIL,
            providerAccountId: email,
            passwordHash,
          },
        },
        org: {
          create: {
            nickname: `Org ${nickname}`,
            email: `org_${email}`,
            slug: createUniqueSlug(`org-${nickname}`),
            description: faker.lorem.paragraph(),
            previewDescr: faker.lorem.sentence(),
            gameStyleDescr: faker.lorem.paragraph(),
            preferredSystems: getRandomEnums(GameSystem, 2),
            preferredGenres: getRandomEnums(GameGenres, 3),
            formatMode,
            countryId: country.geonameId,
            cityId,
          },
        },
      },
      include: {
        org: true,
      },
    });

    if (user.org) {
      createdOrgs.push(user.org);
    }
  }

  const demoRangeFrom = new Date('2026-10-01T00:00:00.000Z');
  const demoRangeTo = new Date('2026-12-31T23:59:59.999Z');
  const eventCount = 220;

  for (let i = 0; i < eventCount; i++) {
    const randomOrg =
      createdOrgs[Math.floor(Math.random() * createdOrgs.length)];
    const eventName = faker.lorem.words({ min: 2, max: 4 });
    const format = getRandomEnum(EventFormat);
    const platforms = getRandomEnums(GamePlatform, 1);
    // Плотная лента/календарь: в основном ACTIVE
    const status = faker.helpers.weightedArrayElement([
      { value: EventStatus.ACTIVE, weight: 8 },
      { value: EventStatus.PREPARE, weight: 1 },
      { value: EventStatus.FINISHED, weight: 1 },
    ]);

    const startsAt = faker.date.between({
      from: demoRangeFrom,
      to: demoRangeTo,
    });
    const endsAt = new Date(startsAt.getTime() + 3 * 60 * 60 * 1000);

    const venue =
      format === EventFormat.ONLINE
        ? {
            type: 'ONLINE' as const,
            links: platforms.map((platform) => ({
              platform,
              label: platform,
              url: faker.internet.url(),
            })),
          }
        : {
            type: 'OFFLINE' as const,
            address: faker.location.streetAddress(),
            lat: Number(faker.location.latitude()),
            lng: Number(faker.location.longitude()),
            mapUrl: faker.internet.url(),
          };

    await prisma.event.create({
      data: {
        orgId: randomOrg.id,
        name: eventName,
        slug: createUniqueSlug(eventName),
        description: faker.lorem.paragraphs(2),
        synopsis: faker.lorem.sentence(),
        addInfo: faker.lorem.sentence(),
        minUsers: 2,
        maxUsers: faker.number.int({ min: 4, max: 8 }),
        isBeginnerFriendly: faker.datatype.boolean(),
        ageLimit: faker.helpers.arrayElement([12, 16, 18]),
        autoApprove: faker.datatype.boolean(),
        costValue: faker.number.int({ min: 500, max: 3000 }),
        costCurrency: Currency.RUB,
        format,
        sessionType: getRandomEnum(SessionType),
        status,
        startsAt,
        endsAt,
        gameSystem: getRandomEnum(GameSystem),
        genres: getRandomEnums(GameGenres, 2),
        platforms,
        venue,
      },
    });
  }
}
