import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Sample Users
  const user1 = await prisma.user.create({
    data: {
      email: 'sparrow1@example.com',
      name: '참새1',
      password: 'password123',
      phoneNumber: '01012345678',
      role: 'CONSUMER',
    },
  });

  const user2 = await prisma.user.create({
    data: {
      email: 'sparrow2@example.com',
      name: '참새2',
      password: 'password123',
      phoneNumber: '01087654321',
      role: 'CONSUMER',
    },
  });

  // Sample Group Purchase
  await prisma.groupPurchase.create({
    data: {
      title: 'LG전자 울트라기어 27GP750 공구',
      description: 'LG전자 모니터 공동 구매',
      creatorId: user1.id,
      minMembers: 3,
      maxMembers: 50,
      endDate: new Date(Date.now() + 1000 * 60 * 60 * 24), // 24 hours from now
    },
  });

  // Sample Penalty
  await prisma.penalty.create({
    data: {
      userId: user2.id,
      reason: 'No-show',
      duration: 24,
      endDate: new Date(Date.now() + 1000 * 60 * 60 * 24), // 24 hours from now
    },
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
