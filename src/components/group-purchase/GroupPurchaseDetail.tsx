'use client';

import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { format } from 'date-fns';

interface User {
  id: string;
  name: string;
  email: string;
}

interface Participation {
  id: string;
  user: User;
}

interface Bid {
  id: string;
  price: number;
  seller: User;
}

interface Vote {
  id: string;
  user: User;
}

interface GroupPurchaseData {
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
  participations: Participation[];
  bids: Bid[];
  votes: Vote[];
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0
  }
};

export default function GroupPurchaseDetail({ data }: { data: GroupPurchaseData }) {
  const { data: session } = useSession();
  const participationProgress = (data.participations.length / data.maxMembers) * 100;
  const timeLeft = format(new Date(data.endDate), 'yyyy년 MM월 dd일 HH:mm');
  const lowestBid = data.bids.length > 0 
    ? Math.min(...data.bids.map(bid => bid.price))
    : data.currentPrice;

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-4xl mx-auto space-y-8"
    >
      {/* Hero Section */}
      <motion.div variants={itemVariants} className="relative h-96 rounded-2xl overflow-hidden">
        {data.imageUrl ? (
          <Image
            src={data.imageUrl}
            alt={data.title}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-primary to-secondary opacity-20" />
        )}
        <div className="absolute inset-0 bg-black bg-opacity-40 flex items-end">
          <div className="p-8 text-white">
            <h1 className="text-4xl font-bold mb-4">{data.title}</h1>
            <p className="text-lg opacity-90">{data.description}</p>
          </div>
        </div>
      </motion.div>

      {/* Status and Progress */}
      <motion.div variants={itemVariants} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <p className="text-gray-600 dark:text-gray-400 text-sm">현재 가격</p>
            <p className="text-2xl font-bold text-primary">{lowestBid.toLocaleString()}원</p>
          </div>
          <div className="text-center">
            <p className="text-gray-600 dark:text-gray-400 text-sm">참여 인원</p>
            <p className="text-2xl font-bold text-secondary">
              {data.participations.length} / {data.maxMembers}명
            </p>
          </div>
          <div className="text-center">
            <p className="text-gray-600 dark:text-gray-400 text-sm">마감일</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{timeLeft}</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-6">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-600 dark:text-gray-400">진행률</span>
            <span className="text-primary font-medium">{Math.round(participationProgress)}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-500"
              style={{ width: `${participationProgress}%` }}
            />
          </div>
        </div>
      </motion.div>

      {/* Details */}
      <motion.div variants={itemVariants} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">상세 정보</h2>
          <dl className="space-y-6">
            <div className="grid grid-cols-3 gap-4">
              <dt className="text-sm font-medium text-gray-600 dark:text-gray-400">주최자</dt>
              <dd className="text-sm text-gray-900 dark:text-white col-span-2">
                {data.creator.name} ({data.creator.email})
              </dd>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <dt className="text-sm font-medium text-gray-600 dark:text-gray-400">카테고리</dt>
              <dd className="text-sm text-gray-900 dark:text-white col-span-2">
                {data.category}
              </dd>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <dt className="text-sm font-medium text-gray-600 dark:text-gray-400">참여자</dt>
              <dd className="text-sm text-gray-900 dark:text-white col-span-2">
                <div className="space-y-2">
                  {data.participations.map((participation) => (
                    <div key={participation.id} className="flex items-center space-x-2">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        {participation.user.name[0]}
                      </div>
                      <span>{participation.user.name}</span>
                    </div>
                  ))}
                </div>
              </dd>
            </div>
          </dl>
        </div>
      </motion.div>

      {/* Actions */}
      {session && (
        <motion.div variants={itemVariants} className="flex justify-end space-x-4">
          {session.user.id === data.creator.id ? (
            <button className="button-hover px-6 py-3 bg-primary text-white rounded-lg font-medium">
              공구 수정하기
            </button>
          ) : (
            <button className="button-hover px-6 py-3 bg-secondary text-white rounded-lg font-medium">
              참여하기
            </button>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}
