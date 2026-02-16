import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const adminHash = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      passwordHash: adminHash,
      name: 'Admin',
      phone: null,
      role: 'ADMIN',
    },
  });
  console.log('Admin user:', admin.email);

  let cat1 = await prisma.category.findFirst({ where: { name: 'Programming' } });
  if (!cat1) {
    cat1 = await prisma.category.create({ data: { name: 'Programming' } });
    await prisma.subCategory.createMany({
      data: [
        { name: 'JavaScript', categoryId: cat1.id },
        { name: 'TypeScript', categoryId: cat1.id },
      ],
    });
  }

  let cat2 = await prisma.category.findFirst({ where: { name: 'Mathematics' } });
  if (!cat2) {
    cat2 = await prisma.category.create({ data: { name: 'Mathematics' } });
    await prisma.subCategory.create({
      data: { name: 'Algebra', categoryId: cat2.id },
    });
  }

  console.log('Seed completed.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
