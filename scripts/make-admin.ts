import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const email = process.argv[2];

  if (!email) {
    console.error('Please provide an email address');
    console.log('Usage: npx tsx scripts/make-admin.ts user@example.com');
    process.exit(1);
  }

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    console.error(`User with email ${email} not found`);
    process.exit(1);
  }

  await prisma.user.update({
    where: { email },
    data: { role: 'admin' },
  });

  console.log(`✅ User ${email} is now an admin`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
