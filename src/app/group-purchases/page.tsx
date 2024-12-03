'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import GroupPurchaseList from '@/components/group-purchase/GroupPurchaseList';
import { GroupPurchase } from '@prisma/client';

export default function GroupPurchasesPage() {
  const [purchases, setPurchases] = useState<GroupPurchase[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPurchases = async () => {
      try {
        const response = await fetch('/api/group-purchases');
        if (!response.ok) {
          throw new Error('Failed to fetch group purchases');
        }
        const data = await response.json();
        setPurchases(data.groupPurchases);
      } catch (err) {
        setError(err instanceof Error ? err.message : '공구 목록을 불러오는데 실패했습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPurchases();
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
        <GroupPurchaseList purchases={purchases} isLoading={isLoading} />
      )}
    </div>
  );
}
