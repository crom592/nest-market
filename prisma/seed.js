const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Clear existing data
  await prisma.message.deleteMany();
  await prisma.vote.deleteMany();
  await prisma.bid.deleteMany();
  await prisma.participant.deleteMany();
  await prisma.groupPurchase.deleteMany();
  await prisma.user.deleteMany();

  // Create admin user
  const admin = await prisma.user.create({
    data: {
      email: 'admin@nestmarket.com',
      name: '관리자',
      role: 'ADMIN',
    },
  });

  // Create a seller
  const seller = await prisma.user.create({
    data: {
      email: 'seller@nestmarket.com',
      name: '판매자',
      role: 'SELLER',
      points: 1000,
      rating: 4.5,
    },
  });

  // Create a consumer
  const consumer = await prisma.user.create({
    data: {
      email: 'consumer@nestmarket.com',
      name: '소비자',
      role: 'CONSUMER',
    },
  });

  // Create sample group purchases
  const groupPurchases = [
    {
      title: '맥북 프로 16인치 M3 Pro 공동구매',
      description: '애플 공식 리셀러를 통한 대량 구매로 최저가 도전!',
      status: 'RECRUITING',
      minParticipants: 10,
      maxParticipants: 50,
      currentParticipants: 1,
      imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca4?w=800&auto=format&fit=crop',
      creatorId: consumer.id,
      voteThreshold: 0.5,
    },
    {
      title: '다이슨 에어랩 공동구매',
      description: '다이슨 코리아 공식 루트를 통한 최저가 공동구매',
      status: 'BIDDING',
      minParticipants: 20,
      maxParticipants: 100,
      currentParticipants: 15,
      imageUrl: 'https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=800&auto=format&fit=crop',
      creatorId: consumer.id,
      voteThreshold: 0.5,
      auctionStartTime: new Date(),
      auctionEndTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    },
    {
      title: '닌텐도 스위치 OLED 공동구매',
      description: '닌텐도 공식 수입원을 통한 대량 구매',
      status: 'VOTING',
      minParticipants: 30,
      maxParticipants: 150,
      currentParticipants: 25,
      imageUrl: 'https://images.unsplash.com/photo-1578303512597-81e6cc155b3e?w=800&auto=format&fit=crop',
      creatorId: consumer.id,
      voteThreshold: 0.5,
      voteStartTime: new Date(),
      voteEndTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
    }
  ];

  for (const purchase of groupPurchases) {
    const createdPurchase = await prisma.groupPurchase.create({
      data: purchase
    });

    // Add creator as first participant
    await prisma.participant.create({
      data: {
        userId: purchase.creatorId,
        groupPurchaseId: createdPurchase.id,
      }
    });

    // Add some bids for the BIDDING purchase
    if (purchase.status === 'BIDDING') {
      await prisma.bid.create({
        data: {
          sellerId: seller.id,
          groupPurchaseId: createdPurchase.id,
          price: 450000,
          description: '다이슨 코리아 공식 딜러입니다. 최저가로 모시겠습니다.',
          status: 'PENDING',
        }
      });
    }

    // Add some votes for the VOTING purchase
    if (purchase.status === 'VOTING') {
      await prisma.vote.create({
        data: {
          userId: consumer.id,
          groupPurchaseId: createdPurchase.id,
          approved: true,
        }
      });
    }
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
