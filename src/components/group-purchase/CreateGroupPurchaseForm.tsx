'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';

interface FormData {
  title: string;
  description: string;
  minMembers: number;
  maxMembers: number;
  endDate: string;
  imageUrl?: string;
}

const formVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.16, 1, 0.3, 1]
    }
  }
};

const inputVariants = {
  focus: {
    scale: 1.02,
    transition: {
      duration: 0.2
    }
  }
};

export default function CreateGroupPurchaseForm() {
  const router = useRouter();
  const { data: session } = useSession();
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    minMembers: 2,
    maxMembers: 10,
    endDate: '',
    imageUrl: '',
  });
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);

    if (!session) {
      setErrorMessage('로그인이 필요합니다.');
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch('/api/group-purchase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || '공구 생성에 실패했습니다.');
      }

      router.push('/group-purchases');
    } catch (err) {
      console.error('Failed to create group purchase:', err);
      setErrorMessage(err instanceof Error ? err.message : '공구 생성에 실패했습니다.');
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={formVariants}
      className="max-w-2xl mx-auto"
    >
      <form onSubmit={handleSubmit} className="space-y-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">새로운 공구 만들기</h2>
          <p className="text-gray-600 dark:text-gray-400">함께 구매하고 싶은 상품을 공유해보세요.</p>
        </div>

        <div className="space-y-6">
          <motion.div variants={inputVariants} whileFocus="focus">
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              공구 제목
            </label>
            <input
              type="text"
              id="title"
              required
              className="mt-1 block w-full rounded-lg border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary focus:ring-primary dark:bg-gray-700 dark:text-white sm:text-sm transition-all duration-200"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="상품명을 입력해주세요"
            />
          </motion.div>

          <motion.div variants={inputVariants} whileFocus="focus">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              상세 설명
            </label>
            <textarea
              id="description"
              rows={4}
              required
              className="mt-1 block w-full rounded-lg border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary focus:ring-primary dark:bg-gray-700 dark:text-white sm:text-sm transition-all duration-200"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="상품에 대한 상세한 설명을 입력해주세요"
            />
          </motion.div>

          <motion.div variants={inputVariants} whileFocus="focus">
            <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              상품 이미지 URL
            </label>
            <input
              type="url"
              id="imageUrl"
              className="mt-1 block w-full rounded-lg border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary focus:ring-primary dark:bg-gray-700 dark:text-white sm:text-sm transition-all duration-200"
              value={formData.imageUrl}
              onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
              placeholder="https://example.com/image.jpg"
            />
          </motion.div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <motion.div variants={inputVariants} whileFocus="focus">
              <label htmlFor="minMembers" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                최소 인원
              </label>
              <input
                type="number"
                id="minMembers"
                min="2"
                required
                className="mt-1 block w-full rounded-lg border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary focus:ring-primary dark:bg-gray-700 dark:text-white sm:text-sm transition-all duration-200"
                value={formData.minMembers}
                onChange={(e) => setFormData({ ...formData, minMembers: parseInt(e.target.value) })}
              />
            </motion.div>

            <motion.div variants={inputVariants} whileFocus="focus">
              <label htmlFor="maxMembers" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                최대 인원
              </label>
              <input
                type="number"
                id="maxMembers"
                min={formData.minMembers}
                required
                className="mt-1 block w-full rounded-lg border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary focus:ring-primary dark:bg-gray-700 dark:text-white sm:text-sm transition-all duration-200"
                value={formData.maxMembers}
                onChange={(e) => setFormData({ ...formData, maxMembers: parseInt(e.target.value) })}
              />
            </motion.div>
          </div>

          <motion.div variants={inputVariants} whileFocus="focus">
            <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              마감일
            </label>
            <input
              type="datetime-local"
              id="endDate"
              required
              className="mt-1 block w-full rounded-lg border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary focus:ring-primary dark:bg-gray-700 dark:text-white sm:text-sm transition-all duration-200"
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
            />
          </motion.div>
        </div>

        {errorMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-red-500 text-sm bg-red-50 dark:bg-red-900/20 p-3 rounded-lg"
          >
            {errorMessage}
          </motion.div>
        )}

        <motion.button
          type="submit"
          disabled={isSubmitting}
          className="button-hover w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {isSubmitting ? '처리중...' : '공구 만들기'}
        </motion.button>
      </form>
    </motion.div>
  );
}
