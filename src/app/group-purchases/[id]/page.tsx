// src/app/group-purchases/[id]/page.tsx

import { PrismaClient, GroupPurchase } from '@prisma/client';
import { notFound } from 'next/navigation';
import GroupPurchaseDetail from '@/components/group-purchase/GroupPurchaseDetail';
import type { Metadata } from 'next';

// PrismaClient 인스턴스를 전역으로 관리하여 여러 인스턴스 생성을 방지
const globalForPrisma = global as unknown as { prisma: PrismaClient };

const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ['query'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// 데이터 페칭 함수
async function getGroupPurchase(id: string): Promise<GroupPurchase | null> {
  const groupPurchase = await prisma.groupPurchase.findUnique({
    where: { id },
    include: {
      creator: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      participations: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
      bids: {
        include: {
          seller: {
            select: {
              id: true,
              name: true,
              sellerProfile: true,
            },
          },
        },
      },
      votes: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
  });

  return groupPurchase;
}

// Props 인터페이스 정의
interface GroupPurchasePageProps {
  params: Promise<{
    id: string;
  }>;
}

// 페이지 컴포넌트
export default async function GroupPurchasePage({ params }: GroupPurchasePageProps) {
  const resolvedParams = await params;
  const groupPurchase = await getGroupPurchase(resolvedParams.id);

  if (!groupPurchase) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <GroupPurchaseDetail data={groupPurchase} />
    </div>
  );
}

// generateMetadata 함수 정의
export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}): Promise<Metadata> {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const { id } = resolvedParams;
  const query = resolvedSearchParams.query;

  const groupPurchase = await getGroupPurchase(id);

  return {
    title: groupPurchase ? `${groupPurchase.title} - Nest Market` : 'Nest Market',
    description: groupPurchase ? `Details about ${groupPurchase.title}` : 'Nest Market Description',
  };
}