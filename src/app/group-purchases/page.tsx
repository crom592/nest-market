import { PrismaClient } from '@prisma/client';
import GroupPurchaseList from '@/components/group-purchase/GroupPurchaseList';

const prisma = new PrismaClient();

async function getGroupPurchases() {
  const groupPurchases = await prisma.groupPurchase.findMany({
    include: {
      creator: {
        select: {
          name: true,
          email: true,
        },
      },
      participations: {
        select: {
          id: true,
          userId: true,
          status: true,
        },
      },
      bids: {
        select: {
          id: true,
          price: true,
          status: true,
          seller: {
            select: {
              name: true,
              sellerProfile: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return groupPurchases;
}

export default async function GroupPurchasesPage() {
  const groupPurchases = await getGroupPurchases();

  return (
    <div className="container mx-auto px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">공구 목록</h1>
        <p className="mt-2 text-gray-600">
          현재 진행 중인 모든 공구 목록입니다. 원하는 공구에 참여하거나 새로운
          공구를 만들어보세요.
        </p>
      </div>
      <GroupPurchaseList groupPurchases={groupPurchases} />
    </div>
  );
}
