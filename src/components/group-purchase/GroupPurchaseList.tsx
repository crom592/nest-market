'use client';

import { useRef } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { GroupPurchase } from '@prisma/client';

interface GroupPurchaseListProps {
  purchases?: GroupPurchase[];
  isLoading?: boolean;
}

export default function GroupPurchaseList({ 
  purchases = [], 
  isLoading = false 
}: GroupPurchaseListProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  if (isLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((index) => (
          <div 
            key={index} 
            className="bg-white rounded-lg shadow-md p-4 animate-pulse"
          >
            <div className="h-48 w-full bg-gray-200 rounded-md mb-4" />
            <div className="h-6 w-3/4 bg-gray-200 rounded mb-2" />
            <div className="h-4 w-1/2 bg-gray-200 rounded mb-4" />
            <div className="h-4 w-1/4 bg-gray-200 rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (purchases.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg mb-4">아직 진행중인 공구가 없습니다.</p>
        <Link
          href="/group-purchases/create"
          className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-sm font-medium text-white shadow transition-colors hover:bg-primary/90"
        >
          첫 공구 만들기
        </Link>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {purchases.map((purchase, index) => (
        <motion.div
          key={purchase.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
          className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
        >
          <Link href={`/group-purchases/${purchase.id}`}>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {purchase.title}
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                {purchase.description}
              </p>
              <div className="flex justify-between items-center text-sm">
                <span className="text-primary font-medium">
                  예상가 {purchase.expectedPrice.toLocaleString()}원
                </span>
                <span className="text-gray-600">
                  {purchase.currentParticipants}/{purchase.maxParticipants}명
                </span>
              </div>
              <div className="mt-4 text-xs text-gray-500">
                마감일: {new Date(purchase.auctionEndTime).toLocaleDateString()}
              </div>
            </div>
          </Link>
        </motion.div>
      ))}
    </div>
  );
}
