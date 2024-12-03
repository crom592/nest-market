import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: '로그인이 필요합니다.' },
        { status: 401 }
      );
    }

    const data = await request.json();
    const groupPurchase = await prisma.groupPurchase.create({
      data: {
        ...data,
        creatorId: session.user.id,
      },
    });

    return NextResponse.json(groupPurchase);
  } catch (err) {
    console.error('Failed to create group purchase:', err);
    return NextResponse.json(
      { message: '공동구매 생성에 실패했습니다.' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const category = searchParams.get('category');

    const where = {
      ...(status && { status }),
      ...(category && { category }),
    };

    const groupPurchases = await prisma.groupPurchase.findMany({
      where,
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
      },
    });

    return NextResponse.json(groupPurchases);
  } catch (err) {
    console.error('Failed to fetch group purchases:', err);
    return NextResponse.json(
      { message: '공동구매 목록을 가져오는데 실패했습니다.' },
      { status: 500 }
    );
  }
}
