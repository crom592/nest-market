import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is a participant
    const participation = await prisma.participation.findUnique({
      where: {
        userId_groupPurchaseId: {
          userId: session.user.id,
          groupPurchaseId: params.id,
        },
      },
    });

    if (!participation) {
      return NextResponse.json(
        { error: '참여자만 채팅을 볼 수 있습니다.' },
        { status: 403 }
      );
    }

    const messages = await prisma.message.findMany({
      where: {
        chatRoom: {
          groupPurchaseId: params.id,
        },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    return NextResponse.json({ messages });
  } catch (error) {
    console.error('Failed to fetch messages:', error);
    return NextResponse.json(
      { error: '메시지를 불러오는데 실패했습니다.' },
      { status: 500 }
    );
  }
}

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is a participant
    const participation = await prisma.participation.findUnique({
      where: {
        userId_groupPurchaseId: {
          userId: session.user.id,
          groupPurchaseId: params.id,
        },
      },
    });

    if (!participation) {
      return NextResponse.json(
        { error: '참여자만 메시지를 보낼 수 있습니다.' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { content } = body;

    const chatRoom = await prisma.chatRoom.findUnique({
      where: {
        groupPurchaseId: params.id,
      },
    });

    if (!chatRoom) {
      return NextResponse.json(
        { error: '채팅방을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    const message = await prisma.message.create({
      data: {
        content,
        userId: session.user.id,
        chatRoomId: chatRoom.id,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json({ message }, { status: 201 });
  } catch (error) {
    console.error('Failed to create message:', error);
    return NextResponse.json(
      { error: '메시지 전송에 실패했습니다.' },
      { status: 500 }
    );
  }
}
