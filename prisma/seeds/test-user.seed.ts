import { PrismaClient } from '../../src/shared/prisma/generated/client';
import { EAccProviders } from '../../src/shared/prisma/generated/enums';
import * as argon2 from 'argon2';
import { createUniqueSlug } from '../../src/common/utils/createUniqueSlug';

const TEST_EMAIL = 'test@gmail.com';
const TEST_PASSWORD = '12341234';
const TEST_NICKNAME = 'test';

export async function seedTestUser(prisma: PrismaClient) {
  const passwordHash = await argon2.hash(TEST_PASSWORD);

  const existing = await prisma.user.findUnique({
    where: { email: TEST_EMAIL },
  });

  if (existing) {
    await prisma.user.update({
      where: { id: existing.id },
      data: { isVerified: true },
    });

    await prisma.account.upsert({
      where: {
        provider_idx: {
          provider: EAccProviders.EMAIL,
          providerAccountId: TEST_EMAIL,
          userId: existing.id,
        },
      },
      update: { passwordHash },
      create: {
        userId: existing.id,
        provider: EAccProviders.EMAIL,
        providerAccountId: TEST_EMAIL,
        passwordHash,
      },
    });

    return;
  }

  await prisma.user.create({
    data: {
      nickname: TEST_NICKNAME,
      email: TEST_EMAIL,
      slug: createUniqueSlug(TEST_NICKNAME),
      timezone: 'UTC+3',
      isVerified: true,
      roles: {
        connect: [{ slug: 'USER' }],
      },
      accounts: {
        create: {
          provider: EAccProviders.EMAIL,
          providerAccountId: TEST_EMAIL,
          passwordHash,
        },
      },
    },
  });
}
