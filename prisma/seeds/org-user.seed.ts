import { PrismaClient } from '../../src/shared/prisma/generated/client';
import {
  EAccProviders,
  OrgFormatMode,
} from '../../src/shared/prisma/generated/enums';
import * as argon2 from 'argon2';
import { createUniqueSlug } from '../../src/common/utils/createUniqueSlug';

const ORG_EMAIL = 'org@gmail.com';
const ORG_PASSWORD = '12341234';
const ORG_NICKNAME = 'org';
const ORG_PROFILE_NICKNAME = 'Org Demo';

export async function seedOrgUser(prisma: PrismaClient) {
  const passwordHash = await argon2.hash(ORG_PASSWORD);

  const country = await prisma.country.findFirst({
    where: { isoCode: 'BY' },
  });

  if (!country) {
    throw new Error(
      'Geo seed required before org user seed (country BY missing)',
    );
  }

  const existing = await prisma.user.findUnique({
    where: { email: ORG_EMAIL },
    include: { org: true },
  });

  if (existing) {
    await prisma.user.update({
      where: { id: existing.id },
      data: {
        isVerified: true,
        roles: {
          connect: [{ slug: 'USER' }, { slug: 'ORG' }],
        },
      },
    });

    await prisma.account.upsert({
      where: {
        provider_idx: {
          provider: EAccProviders.EMAIL,
          providerAccountId: ORG_EMAIL,
          userId: existing.id,
        },
      },
      update: { passwordHash },
      create: {
        userId: existing.id,
        provider: EAccProviders.EMAIL,
        providerAccountId: ORG_EMAIL,
        passwordHash,
      },
    });

    if (!existing.org) {
      await prisma.org.create({
        data: {
          userId: existing.id,
          nickname: ORG_PROFILE_NICKNAME,
          email: ORG_EMAIL,
          slug: createUniqueSlug(ORG_PROFILE_NICKNAME),
          formatMode: OrgFormatMode.ONLINE,
          countryId: country.geonameId,
          cityId: null,
        },
      });
    }

    return;
  }

  await prisma.user.create({
    data: {
      nickname: ORG_NICKNAME,
      email: ORG_EMAIL,
      slug: createUniqueSlug(ORG_NICKNAME),
      timezone: 'UTC+3',
      isVerified: true,
      roles: {
        connect: [{ slug: 'USER' }, { slug: 'ORG' }],
      },
      accounts: {
        create: {
          provider: EAccProviders.EMAIL,
          providerAccountId: ORG_EMAIL,
          passwordHash,
        },
      },
      org: {
        create: {
          nickname: ORG_PROFILE_NICKNAME,
          email: ORG_EMAIL,
          slug: createUniqueSlug(ORG_PROFILE_NICKNAME),
          formatMode: OrgFormatMode.ONLINE,
          countryId: country.geonameId,
          cityId: null,
        },
      },
    },
  });
}
