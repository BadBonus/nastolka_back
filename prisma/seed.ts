import { PrismaClient } from './../src/shared/prisma/generated/client';
import {
  AppPermission,
  permissions,
} from '../src/common/constants/permissions.constant';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);

export const prisma = new PrismaClient({ adapter });

async function main() {
  const allPermissions = Array.from(
    new Set(
      Object.values(permissions)
        .flat()
        .filter((p): p is AppPermission => Boolean(p)),
    ),
  );

  for (const slug of allPermissions) {
    await prisma.permission.upsert({
      where: { slug },
      update: {},
      create: { slug },
    });
  }

  for (const [roleName, rolePermissions] of Object.entries(permissions)) {
    if (!rolePermissions) continue;

    const role = await prisma.role.upsert({
      where: { name: roleName },
      update: {},
      create: { name: roleName },
    });

    const dbPermissions = await prisma.permission.findMany({
      where: { slug: { in: rolePermissions } },
      select: { id: true },
    });

    await prisma.rolesOnPermissions.deleteMany({
      where: { roleId: role.id },
    });

    await prisma.rolesOnPermissions.createMany({
      data: dbPermissions.map((p: { id: string }) => ({
        roleId: role.id,
        permissionId: p.id,
      })),
    });
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
