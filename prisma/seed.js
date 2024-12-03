const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const groupPurchases = [
  {
    title: 'Apple 맥북 프로 14인치 공동구매',
    description: '최신 M3 프로 칩셋, 18GB 통합메모리, 512GB SSD',
    minParticipants: 10,
    maxParticipants: 100,
    expectedPrice: 2490000,
    status: 'RECRUITING'
  },
  {
    title: 'LG 그램 Style 16인치 대량구매',
    description: 'Intel Core i5, 16GB RAM, 256GB SSD, 초경량 디자인',
    minParticipants: 15,
    maxParticipants: 80,
    expectedPrice: 1590000,
    status: 'RECRUITING'
  },
  {
    title: '다이슨 V15 디텍트 앱솔루트 공구',
    description: '최신형 무선청소기, 레이저 슬림 플루피 헤드 포함',
    minParticipants: 20,
    maxParticipants: 150,
    expectedPrice: 890000,
    status: 'RECRUITING'
  },
  {
    title: 'Apple 에어팟 프로 2세대 공동구매',
    description: '액티브 노이즈 캔슬링, USB-C 충전케이스',
    minParticipants: 30,
    maxParticipants: 200,
    expectedPrice: 279000,
    status: 'RECRUITING'
  },
  {
    title: '샤오미 로봇청소기 S10+ 공구',
    description: '자동 먼지통 비움, 물걸레 기능, LDS 센서',
    minParticipants: 25,
    maxParticipants: 120,
    expectedPrice: 450000,
    status: 'RECRUITING'
  },
  {
    title: '닌텐도 스위치 OLED 대량구매',
    description: '화이트 에디션, 도크 포함, 1년 보증',
    minParticipants: 20,
    maxParticipants: 100,
    expectedPrice: 340000,
    status: 'RECRUITING'
  }
];

async function main() {
  // Create sample admin user
  const admin = await prisma.user.create({
    data: {
      email: 'admin@nestmarket.com',
      name: '관리자',
      password: 'password123',
      phone: '01012345678',
      role: 'ADMIN',
    },
  });

  // Create sample group purchases
  for (const purchase of groupPurchases) {
    await prisma.groupPurchase.create({
      data: {
        title: purchase.title,
        description: purchase.description,
        creatorId: admin.id,
        minParticipants: purchase.minParticipants,
        maxParticipants: purchase.maxParticipants,
        expectedPrice: purchase.expectedPrice,
        status: purchase.status,
        currentParticipants: 1
      },
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
