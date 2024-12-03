import { PrismaClient, PurchaseStatus, UserRole } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Clear existing data
  await prisma.groupPurchase.deleteMany();
  await prisma.user.deleteMany();

  // Create admin user
  const admin = await prisma.user.create({
    data: {
      email: 'admin@nestmarket.com',
      name: '관리자',
      role: UserRole.ADMIN,
    },
  });

  // Create sample products
  const products = [
    {
      title: '맥북 프로 16인치 M3 Pro 공동구매',
      description: '애플 공식 리셀러를 통한 대량 구매로 최저가 도전!',
      status: PurchaseStatus.RECRUITING,
      minParticipants: 10,
      maxParticipants: 50,
      currentParticipants: 5,
      expectedPrice: 2800000,
      imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca4?w=800&auto=format&fit=crop',
      creatorId: admin.id
    },
    {
      title: '다이슨 에어랩 공동구매',
      description: '다이슨 코리아 공식 루트를 통한 최저가 공동구매',
      status: PurchaseStatus.RECRUITING,
      minParticipants: 20,
      maxParticipants: 100,
      currentParticipants: 15,
      expectedPrice: 450000,
      imageUrl: 'https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=800&auto=format&fit=crop',
      creatorId: admin.id
    },
    {
      title: '닌텐도 스위치 OLED 공동구매',
      description: '닌텐도 공식 수입원을 통한 대량 구매',
      status: PurchaseStatus.RECRUITING,
      minParticipants: 30,
      maxParticipants: 150,
      currentParticipants: 25,
      expectedPrice: 330000,
      imageUrl: 'https://images.unsplash.com/photo-1578303512597-81e6cc155b3e?w=800&auto=format&fit=crop',
      creatorId: admin.id
    }
  ];

  for (const product of products) {
    await prisma.groupPurchase.create({
      data: product
    });
  }

  console.log('Seed data created successfully');
}

main()
  .catch((e) => {
    console.error('Error while seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
