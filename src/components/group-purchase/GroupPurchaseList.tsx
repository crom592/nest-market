'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';

interface User {
  id: string;
  name: string;
  email: string;
}

interface GroupPurchase {
  id: string;
  title: string;
  description: string;
  currentPrice: number;
  minMembers: number;
  maxMembers: number;
  imageUrl: string | null;
  endDate: string;
  category: string;
  status: 'OPEN' | 'CLOSED' | 'CANCELLED';
  creator: User;
  _count: {
    participations: number;
  };
}

export default function GroupPurchaseList({ purchases }: { purchases: GroupPurchase[] }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      {
        threshold: 0.1,
      }
    );

    const elements = document.querySelectorAll('.scroll-section');
    elements.forEach((el) => observer.observe(el));

    return () => {
      elements.forEach((el) => observer.unobserve(el));
    };
  }, []);

  return (
    <div ref={containerRef} className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {purchases.map((purchase, index) => (
        <motion.div
          key={purchase.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="scroll-section"
        >
          <Link
            href={`/group-purchases/${purchase.id}`}
            className="block"
          >
            <div className="card-hover bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
              {purchase.imageUrl && (
                <div className="relative aspect-product">
                  <Image
                    src={purchase.imageUrl}
                    alt={purchase.title}
                    fill
                    className="object-cover image-hover"
                  />
                </div>
              )}
              <div className="p-6">
                <div className="flex justify-between items-start">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {purchase.title}
                  </h3>
                  <span
                    className={`px-3 py-1 text-xs font-medium rounded-full ${
                      purchase.status === 'OPEN'
                        ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100'
                        : purchase.status === 'CLOSED'
                        ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100'
                        : 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
                    }`}
                  >
                    {purchase.status === 'OPEN' ? '진행중' : 
                     purchase.status === 'CLOSED' ? '마감' : '취소됨'}
                  </span>
                </div>
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2">
                  {purchase.description}
                </p>
                
                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600 dark:text-gray-400">
                      참여 인원
                    </span>
                    <span className="text-primary font-medium">
                      {purchase._count.participations} / {purchase.maxMembers}명
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all duration-500"
                      style={{
                        width: `${(purchase._count.participations / purchase.maxMembers) * 100}%`
                      }}
                    />
                  </div>
                </div>

                <div className="flex justify-between items-center text-sm">
                  <div className="text-gray-600 dark:text-gray-400">
                    {new Date(purchase.endDate).toLocaleDateString('ko-KR')} 마감
                  </div>
                  <div className="text-primary font-medium">
                    {purchase.currentPrice.toLocaleString()}원
                  </div>
                </div>
              </div>
            </div>
          </Link>
        </motion.div>
      ))}
    </div>
  );
}
