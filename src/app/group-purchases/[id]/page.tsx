// src/app/group-purchases/[id]/page.tsx

import { PrismaClient, GroupPurchase } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { notFound } from 'next/navigation';
import GroupPurchaseDetail from '@/components/group-purchase/GroupPurchaseDetail';
import { authOptions } from '@/lib/auth';
import type { Metadata } from 'next';

// PrismaClient 인스턴스를 전역으로 관리
const globalForPrisma = global as unknown as { prisma: PrismaClient };
const prisma = globalForPrisma.prisma || new PrismaClient({ log: ['query'] });
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// 데이터 페칭 함수
async function getGroupPurchase(id: string, userId: string | undefined): Promise<{
  groupPurchase: GroupPurchase;
  isParticipant: boolean;
  hasVoted: boolean;
  isSeller: boolean;
  canBid: boolean;
  canVote: boolean;
  canParticipate: boolean;
} | null> {
  const groupPurchase = await prisma.groupPurchase.findUnique({
    where: { id },
    include: {
      creator: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
      participants: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              role: true,
              penaltyCount: true,
              penaltyEndTime: true,
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
              email: true,
              role: true,
              rating: true,
              bidCount: true,
              points: true,
            },
          },
        },
        orderBy: {
          price: 'asc',
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
      messages: {
        include: {
          sender: {
            select: {
              id: true,
              name: true,
              role: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 50,
      },
    },
  });

  if (!groupPurchase || !userId) {
    return null;
  }

  // Check user role and status
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      role: true,
      penaltyCount: true,
      penaltyEndTime: true,
      points: true,
    },
  });

  if (!user) {
    return null;
  }

  const isParticipant = groupPurchase.participants.some(
    (participant) => participant.user.id === userId
  );

  const hasVoted = groupPurchase.votes.some(
    (vote) => vote.user.id === userId
  );

  const isSeller = user.role === 'SELLER';
  const now = new Date();

  // Check if user can participate
  const canParticipate = 
    user.role === 'CONSUMER' &&
    groupPurchase.status === 'RECRUITING' &&
    !isParticipant &&
    groupPurchase.currentParticipants < groupPurchase.maxParticipants &&
    (!user.penaltyEndTime || user.penaltyEndTime < now);

  // Check if seller can bid
  const canBid =
    user.role === 'SELLER' &&
    groupPurchase.status === 'BIDDING' &&
    (!groupPurchase.auctionEndTime || groupPurchase.auctionEndTime > now) &&
    (user.points ?? 0) >= 100;

  // Check if participant can vote
  const canVote =
    isParticipant &&
    groupPurchase.status === 'VOTING' &&
    !hasVoted &&
    (!groupPurchase.voteEndTime || groupPurchase.voteEndTime > now);

  return {
    groupPurchase,
    isParticipant,
    hasVoted,
    isSeller,
    canBid,
    canVote,
    canParticipate,
  };
}

// Props 인터페이스 정의
interface GroupPurchasePageProps {
  params: Promise<{
    id: string;
  }>;
}

// 페이지 컴포넌트
export default async function GroupPurchasePage({ params }: GroupPurchasePageProps) {
  const session = await getServerSession(authOptions);
  const resolvedParams = await params;
  const data = await getGroupPurchase(resolvedParams.id, session?.user?.id);

  if (!data) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <GroupPurchaseDetail
        groupPurchase={data.groupPurchase}
        isParticipant={data.isParticipant}
        hasVoted={data.hasVoted}
        isSeller={data.isSeller}
        canBid={data.canBid}
        canVote={data.canVote}
        canParticipate={data.canParticipate}
      />
    </div>
  );
}

// Metadata 생성 함수
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const resolvedParams = await params;
  const session = await getServerSession(authOptions);
  const data = await getGroupPurchase(resolvedParams.id, session?.user?.id);

  if (!data) {
    return {
      title: '공동구매를 찾을 수 없습니다',
    };
  }

  return {
    title: `${data.groupPurchase.title} | Nest Market`,
    description: data.groupPurchase.description,
  };
}