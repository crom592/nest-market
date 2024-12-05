import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth';

export const prisma = new PrismaClient();

// Mock fetch responses
export const mockFetchResponse = (data: any) => {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve(data),
    })
  );
};

// Mock error response
export const mockFetchError = (status: number, message: string) => {
  global.fetch = jest.fn().mockImplementation(() =>
    Promise.resolve({
      ok: false,
      status,
      json: () => Promise.resolve({ error: message }),
    })
  );
};

// Mock next-auth session
export const mockSession = {
  user: {
    id: '1',
    name: 'Test User',
    email: 'test@example.com',
  },
};

export const mockAuthOptions = {
  secret: 'test-secret',
  providers: [],
};

export async function createTestUser(data: {
  email: string;
  name?: string;
  image?: string;
  emailVerified?: Date;
}) {
  const existingUser = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (existingUser) {
    return existingUser;
  }

  return await prisma.user.create({
    data: {
      ...data,
      emailVerified: new Date(),
    },
  });
}

export async function createTestGroupPurchase({
  title,
  description,
  creatorId,
  targetPrice,
  minParticipants,
  maxParticipants,
  endTime,
  status,
  imageUrl,
  currentParticipants,
  auctionStartTime,
  auctionEndTime,
  voteStartTime,
  voteEndTime,
  voteThreshold,
}: {
  title: string;
  description: string;
  creatorId: string;
  targetPrice: number;
  minParticipants: number;
  maxParticipants: number;
  endTime: Date;
  status?: string;
  imageUrl?: string;
  currentParticipants?: number;
  auctionStartTime?: Date;
  auctionEndTime?: Date;
  voteStartTime?: Date;
  voteEndTime?: Date;
  voteThreshold?: number;
}) {
  return await prisma.groupPurchase.create({
    data: {
      title,
      description,
      creatorId,
      targetPrice,
      minParticipants,
      maxParticipants,
      endTime,
      status: status || 'ACTIVE',
      imageUrl,
      currentParticipants: currentParticipants || 0,
      auctionStartTime,
      auctionEndTime,
      voteStartTime,
      voteEndTime,
      voteThreshold,
    },
  });
}

export async function cleanupDatabase() {
  const tablenames = await prisma.$queryRaw<
    Array<{ tablename: string }>
  >`SELECT tablename FROM pg_tables WHERE schemaname='public'`;

  for (const { tablename } of tablenames) {
    if (tablename !== '_prisma_migrations') {
      try {
        await prisma.$executeRawUnsafe(
          `TRUNCATE TABLE "public"."${tablename}" CASCADE;`
        );
      } catch (error) {
        console.log({ error });
      }
    }
  }
}

jest.mock('next-auth', () => ({
  ...jest.requireActual('next-auth'),
  getServerSession: jest.fn(),
}));
