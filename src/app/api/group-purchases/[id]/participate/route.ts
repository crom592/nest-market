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
        maxParticipants: true,
        currentParticipants: true,
      },
    });

    if (!groupPurchase) {
      return NextResponse.json(
        { error: '공구를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    if (groupPurchase.status !== 'RECRUITING') {
      return NextResponse.json(
        { error: '현재 참여가 불가능한 상태입니다.' },
        { status: 400 }
      );
    }

    if (groupPurchase.currentParticipants >= groupPurchase.maxParticipants) {
      return NextResponse.json(
        { error: '최대 참여 인원을 초과했습니다.' },
        { status: 400 }
      );
    }

    // Check if user is already participating
    const existingParticipation = await prisma.participation.findUnique({
      where: {
        userId_groupPurchaseId: {
          userId: session.user.id,
          groupPurchaseId: params.id,
        },
      },
    });

    if (existingParticipation) {
      return NextResponse.json(
        { error: '이미 참여 중입니다.' },
        { status: 400 }
      );
    }

    // Create participation and update participant count in a transaction
    const [participation] = await prisma.$transaction([
      prisma.participation.create({
        data: {
          userId: session.user.id,
          groupPurchaseId: params.id,
        },
      }),
      prisma.groupPurchase.update({
        where: { id: params.id },
        data: {
          currentParticipants: {
            increment: 1,
          },
        },
      }),
    ]);

    return NextResponse.json({ participation }, { status: 201 });
  } catch (error) {
    console.error('Failed to participate in group purchase:', error);
    return NextResponse.json(
      { error: '공구 참여에 실패했습니다.' },
      { status: 500 }
    );
  }
}

export async function DELETE(
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
        creatorId: true,
      },
    });

    if (!groupPurchase) {
      return NextResponse.json(
        { error: '공구를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // Creator cannot leave the group purchase
    if (groupPurchase.creatorId === session.user.id) {
      return NextResponse.json(
        { error: '공구 생성자는 참여를 취소할 수 없습니다.' },
        { status: 400 }
      );
    }

    if (groupPurchase.status !== 'RECRUITING') {
      return NextResponse.json(
        { error: '현재 참여 취소가 불가능한 상태입니다.' },
        { status: 400 }
      );
    }

    // Delete participation and update participant count in a transaction
    await prisma.$transaction([
      prisma.participation.delete({
        where: {
          userId_groupPurchaseId: {
            userId: session.user.id,
            groupPurchaseId: params.id,
          },
        },
      }),
      prisma.groupPurchase.update({
        where: { id: params.id },
        data: {
          currentParticipants: {
            decrement: 1,
          },
        },
      }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to leave group purchase:', error);
    return NextResponse.json(
      { error: '공구 참여 취소에 실패했습니다.' },
      { status: 500 }
    );
  }
}
