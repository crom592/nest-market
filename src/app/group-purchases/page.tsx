'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import GroupPurchaseGrid from '@/components/group-purchase/GroupPurchaseGrid';
import ParticipatingPurchases from '@/components/group-purchase/ParticipatingPurchases';
import CompletedPurchases from '@/components/group-purchase/CompletedPurchases';
import { GroupPurchase } from '@prisma/client';

interface GroupPurchaseWithCounts extends GroupPurchase {
  _count: {
    participants: number;
    bids: number;
    votes: number;
  };
  creator: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

interface PaginatedResponse {
  groupPurchases: GroupPurchaseWithCounts[];
  pagination: {
    total: number;
    pages: number;
    page: number;
    limit: number;
  };
}

export default function GroupPurchasesPage() {
  const [activeGroupPurchases, setActiveGroupPurchases] = useState<GroupPurchaseWithCounts[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGroupPurchases = async () => {
      try {
        const response = await fetch('/api/group-purchases');
        if (!response.ok) {
          throw new Error('Failed to fetch group purchases');
        }
        const data: PaginatedResponse = await response.json();
        setActiveGroupPurchases(data.groupPurchases);
      } catch (err) {
        setError(err instanceof Error ? err.message : '공구 목록을 불러오는데 실패했습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchGroupPurchases();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">공구 목록</h1>
        <Link
          href="/group-purchases/create"
          className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-sm font-medium text-white shadow transition-colors hover:bg-primary/90"
        >
          새 공구 만들기
        </Link>
      </div>

      {error ? (
        <div className="text-center py-12">
          <p className="text-red-500 text-lg">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-sm font-medium text-white shadow transition-colors hover:bg-primary/90"
          >
            다시 시도
          </button>
        </div>
      ) : (
        <Tabs defaultValue="active" className="space-y-6">
          <TabsList>
            <TabsTrigger value="active">진행중인 공구</TabsTrigger>
            <TabsTrigger value="participating">참여중인 공구</TabsTrigger>
            <TabsTrigger value="completed">완료된 공구</TabsTrigger>
          </TabsList>

          <TabsContent value="active">
            <GroupPurchaseGrid purchases={activeGroupPurchases} isLoading={isLoading} />
          </TabsContent>

          <TabsContent value="participating">
            <ParticipatingPurchases />
          </TabsContent>

          <TabsContent value="completed">
            <CompletedPurchases />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
