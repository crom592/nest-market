'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';

interface CreateGroupPurchaseForm {
  title: string;
  description: string;
  expectedPrice: number;
  minParticipants: number;
  maxParticipants: number;
  auctionStartTime: string;
  auctionEndTime: string;
}

export default function CreateGroupPurchasePage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<CreateGroupPurchaseForm>();

  const onSubmit = async (data: CreateGroupPurchaseForm) => {
    try {
      setIsSubmitting(true);
      const response = await fetch('/api/group-purchases', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          expectedPrice: Number(data.expectedPrice),
          minParticipants: Number(data.minParticipants),
          maxParticipants: Number(data.maxParticipants),
          auctionStartTime: new Date(data.auctionStartTime).toISOString(),
          auctionEndTime: new Date(data.auctionEndTime).toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error('공구 생성에 실패했습니다.');
      }

      const result = await response.json();
      toast.success('공구가 생성되었습니다!');
      router.push(`/group-purchases/${result.groupPurchase.id}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '공구 생성에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">새 공구 만들기</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl space-y-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">
            제목
          </label>
          <input
            type="text"
            id="title"
            {...register('title', { required: '제목을 입력해주세요' })}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
          {errors.title && (
            <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            설명
          </label>
          <textarea
            id="description"
            rows={4}
            {...register('description', { required: '설명을 입력해주세요' })}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="expectedPrice" className="block text-sm font-medium text-gray-700">
            예상 가격 (원)
          </label>
          <input
            type="number"
            id="expectedPrice"
            {...register('expectedPrice', { 
              required: '예상 가격을 입력해주세요',
              min: { value: 1000, message: '최소 1,000원 이상이어야 합니다' }
            })}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
          {errors.expectedPrice && (
            <p className="mt-1 text-sm text-red-600">{errors.expectedPrice.message}</p>
          )}
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label htmlFor="minParticipants" className="block text-sm font-medium text-gray-700">
              최소 참여 인원
            </label>
            <input
              type="number"
              id="minParticipants"
              {...register('minParticipants', { 
                required: '최소 참여 인원을 입력해주세요',
                min: { value: 2, message: '최소 2명 이상이어야 합니다' }
              })}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
            {errors.minParticipants && (
              <p className="mt-1 text-sm text-red-600">{errors.minParticipants.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="maxParticipants" className="block text-sm font-medium text-gray-700">
              최대 참여 인원
            </label>
            <input
              type="number"
              id="maxParticipants"
              {...register('maxParticipants', { 
                required: '최대 참여 인원을 입력해주세요',
                min: { value: 2, message: '최소 2명 이상이어야 합니다' }
              })}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
            {errors.maxParticipants && (
              <p className="mt-1 text-sm text-red-600">{errors.maxParticipants.message}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label htmlFor="auctionStartTime" className="block text-sm font-medium text-gray-700">
              경매 시작 시간
            </label>
            <input
              type="datetime-local"
              id="auctionStartTime"
              {...register('auctionStartTime', { required: '경매 시작 시간을 입력해주세요' })}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
            {errors.auctionStartTime && (
              <p className="mt-1 text-sm text-red-600">{errors.auctionStartTime.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="auctionEndTime" className="block text-sm font-medium text-gray-700">
              경매 종료 시간
            </label>
            <input
              type="datetime-local"
              id="auctionEndTime"
              {...register('auctionEndTime', { required: '경매 종료 시간을 입력해주세요' })}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
            {errors.auctionEndTime && (
              <p className="mt-1 text-sm text-red-600">{errors.auctionEndTime.message}</p>
            )}
          </div>
        </div>

        <div className="pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-md bg-primary px-4 py-3 text-sm font-medium text-white shadow-sm hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? '생성 중...' : '공구 만들기'}
          </button>
        </div>
      </form>
    </div>
  );
}
