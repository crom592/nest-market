import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const groupPurchase = await prisma.groupPurchase.findUnique({
      where: { id: params.id },
      select: {
        status: true,
        auctionStartTime: true,
        auctionEndTime: true,
      },
    });

    if (!groupPurchase) {
      return NextResponse.json(
        { error: '공구를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    if (groupPurchase.status !== 'BIDDING') {
      return NextResponse.json(
        { error: '현재 입찰이 불가능한 상태입니다.' },
        { status: 400 }
      );
    }

    const now = new Date();
    if (
      now < groupPurchase.auctionStartTime ||
      now > groupPurchase.auctionEndTime
    ) {
      return NextResponse.json(
        { error: '입찰 기간이 아닙니다.' },
        { status: 400 }
      );
    }

    // Check if user is a seller
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (user?.role !== 'SELLER') {
      return NextResponse.json(
        { error: '판매자만 입찰할 수 있습니다.' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { price, description } = body;

    // Check if seller has already bid
    const existingBid = await prisma.bid.findFirst({
      where: {
        sellerId: session.user.id,
        groupPurchaseId: params.id,
      },
    });

    if (existingBid) {
      // Update existing bid
      const updatedBid = await prisma.bid.update({
        where: { id: existingBid.id },
        data: {
          price,
          description,
          status: 'PENDING',
        },
        include: {
          seller: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      return NextResponse.json({ bid: updatedBid });
    }

    // Create new bid
    const bid = await prisma.bid.create({
      data: {
        price,
        description,
        sellerId: session.user.id,
        groupPurchaseId: params.id,
        status: 'PENDING',
      },
      include: {
        seller: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json({ bid }, { status: 201 });
  } catch (error) {
    console.error('Failed to create bid:', error);
    return NextResponse.json(
      { error: '입찰에 실패했습니다.' },
      { status: 500 }
    );
  }
}

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const bids = await prisma.bid.findMany({
      where: {
        groupPurchaseId: params.id,
      },
      include: {
        seller: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        price: 'asc',
      },
    });

    return NextResponse.json({ bids });
  } catch (error) {
    console.error('Failed to fetch bids:', error);
    return NextResponse.json(
      { error: '입찰 목록을 불러오는데 실패했습니다.' },
      { status: 500 }
    );
  }
}
