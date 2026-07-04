import { prisma } from '../src/lib/prisma';
import bcrypt from 'bcryptjs';

async function main() {
  const passwordHash = await bcrypt.hash('admin', 10);

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {
      username: 'admin',
      role: 'SUPERADMIN',
      passwordHash,
    },
    create: {
      email: 'admin@example.com',
      username: 'admin',
      name: 'Super Admin',
      role: 'SUPERADMIN',
      passwordHash,
    },
  });

  const org = await prisma.organization.upsert({
    where: { slug: 'acme-corp' },
    update: { name: 'Acme Corp' },
    create: {
      name: 'Acme Corp',
      slug: 'acme-corp',
    },
  });

  await prisma.organizationMember.upsert({
    where: {
      organizationId_userId: {
        organizationId: org.id,
        userId: adminUser.id,
      },
    },
    update: {
      role: 'OWNER',
    },
    create: {
      organizationId: org.id,
      userId: adminUser.id,
      role: 'OWNER',
    },
  });

  console.log({ adminUser, org });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
