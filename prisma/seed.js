const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const products = [
  {
    title: 'Apple 맥북 프로 14인치 공동구매',
    description: '최신 M3 프로 칩셋, 18GB 통합메모리, 512GB SSD',
    minMembers: 10,
    maxMembers: 100,
    currentPrice: 2490000,
    imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80',
    category: 'ELECTRONICS'
  },
  {
    title: 'LG 그램 Style 16인치 대량구매',
    description: 'Intel Core i5, 16GB RAM, 256GB SSD, 초경량 디자인',
    minMembers: 15,
    maxMembers: 80,
    currentPrice: 1590000,
    imageUrl: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80',
    category: 'ELECTRONICS'
  },
  {
    title: '다이슨 V15 디텍트 앱솔루트 공구',
    description: '최신형 무선청소기, 레이저 슬림 플루피 헤드 포함',
    minMembers: 20,
    maxMembers: 150,
    currentPrice: 890000,
    imageUrl: 'https://images.unsplash.com/photo-1558317374-067fb5f30001?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80',
    category: 'HOME_APPLIANCES'
  },
  {
    title: 'Apple 에어팟 프로 2세대 공동구매',
    description: '액티브 노이즈 캔슬링, USB-C 충전케이스',
    minMembers: 30,
    maxMembers: 200,
    currentPrice: 279000,
    imageUrl: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80',
    category: 'ELECTRONICS'
  },
  {
    title: '샤오미 로봇청소기 S10+ 공구',
    description: '자동 먼지통 비움, 물걸레 기능, LDS 센서',
    minMembers: 25,
    maxMembers: 120,
    currentPrice: 450000,
    imageUrl: 'https://images.unsplash.com/photo-1546054454-aa26e2b734c7?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80',
    category: 'HOME_APPLIANCES'
  },
  {
    title: '닌텐도 스위치 OLED 대량구매',
    description: '화이트 에디션, 도크 포함, 1년 보증',
    minMembers: 20,
    maxMembers: 100,
    currentPrice: 340000,
    imageUrl: 'https://images.unsplash.com/photo-1578303512597-81e6cc155b3e?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80',
    category: 'GAMING'
  }
];

async function main() {
  // Create sample users
  const user1 = await prisma.user.create({
    data: {
      email: 'admin@dungjimarket.com',
      name: '관리자',
      password: 'password123',
      phoneNumber: '01012345678',
      role: 'ADMIN',
    },
  });

  // Create sample group purchases
  for (const product of products) {
    await prisma.groupPurchase.create({
      data: {
        title: product.title,
        description: product.description,
        creatorId: user1.id,
        minMembers: product.minMembers,
        maxMembers: product.maxMembers,
        currentPrice: product.currentPrice,
        imageUrl: product.imageUrl,
        category: product.category,
        endDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7), // 7 days from now
        status: 'OPEN'
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
