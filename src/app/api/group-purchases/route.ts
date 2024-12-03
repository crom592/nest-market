import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const {
      title,
      description,
      minParticipants,
      maxParticipants,
      expectedPrice,
      auctionStartTime,
      auctionEndTime,
    } = body;

    // 한 계정당 두 개 공구 동시 진행 제한 확인
    const activeGroupPurchases = await prisma.groupPurchase.count({
      where: {
        creatorId: session.user.id,
        status: {
          in: ['RECRUITING', 'BIDDING', 'VOTING'],
        },
      },
    });

    if (activeGroupPurchases >= 2) {
      return NextResponse.json(
        { error: '한 계정당 최대 2개의 공구만 동시에 진행할 수 있습니다.' },
        { status: 400 }
      );
    }

    const groupPurchase = await prisma.groupPurchase.create({
      data: {
        title,
        description,
        minParticipants,
        maxParticipants,
        expectedPrice,
        auctionStartTime,
        auctionEndTime,
        status: 'RECRUITING',
        creatorId: session.user.id,
        currentParticipants: 1,
      },
      include: {
        creator: true,
      },
    });

    // 생성자를 자동으로 참여자로 등록
    await prisma.participation.create({
      data: {
        userId: session.user.id,
        groupPurchaseId: groupPurchase.id,
      },
    });

    // 채팅방 생성
    await prisma.chatRoom.create({
      data: {
        groupPurchaseId: groupPurchase.id,
      },
    });

    return NextResponse.json({ groupPurchase }, { status: 201 });
  } catch (error) {
    console.error('Failed to create group purchase:', error);
    return NextResponse.json(
      { error: '공구 생성에 실패했습니다.' },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    const where = status ? { status } : {};

    const [groupPurchases, total] = await Promise.all([
      prisma.groupPurchase.findMany({
        where,
        include: {
          creator: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          _count: {
            select: {
              participants: true,
              bids: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
      prisma.groupPurchase.count({ where }),
    ]);

    return NextResponse.json({
      groupPurchases,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        page,
        limit,
      },
    });
  } catch (error) {
    console.error('Failed to fetch group purchases:', error);
    return NextResponse.json(
      { error: '공구 목록을 불러오는데 실패했습니다.' },
      { status: 500 }
    );
  }
}
