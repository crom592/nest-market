import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const products = await prisma.groupPurchase.findMany({
      where: {
        status: 'OPEN',
      },
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        title: true,
        description: true,
        currentPrice: true,
        minMembers: true,
        maxMembers: true,
        imageUrl: true,
        endDate: true,
        category: true,
        status: true,
        createdAt: true,
      }
    }) || [];

    return new NextResponse(
      JSON.stringify({ products }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (err) {
    console.error('Failed to fetch products:', err);
    return new NextResponse(
      JSON.stringify({ error: 'Failed to fetch products' }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
}
