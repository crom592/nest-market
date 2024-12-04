'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";

interface CreateGroupPurchaseFormData {
  title: string;
  description: string;
  minParticipants: number;
  maxParticipants: number;
  expectedPrice: number;
  auctionDuration: number; // 시간 단위
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

export default function CreateGroupPurchaseForm() {
  const router = useRouter();
  const { data: session } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CreateGroupPurchaseFormData>({
    defaultValues: {
      title: '',
      description: '',
      minParticipants: 2,
      maxParticipants: 10,
      expectedPrice: 0,
      auctionDuration: 24,
    },
    mode: 'onChange',
  });

  const minParticipants = form.watch('minParticipants');

  const onSubmit = async (data: CreateGroupPurchaseFormData) => {
    if (!session?.user) {
      toast.error('로그인이 필요합니다.');
      return;
    }

    try {
      setIsSubmitting(true);
      const auctionStartTime = new Date();
      const auctionEndTime = new Date(auctionStartTime.getTime() + data.auctionDuration * 60 * 60 * 1000);

      const response = await fetch('/api/group-purchases', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          auctionStartTime,
          auctionEndTime,
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
    <motion.div
      variants={formVariants}
      initial="hidden"
      animate="visible"
      className="w-full bg-white rounded-lg p-6"
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="title"
            rules={{ required: '제목을 입력해주세요.' }}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base">제목</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="공동구매 제목을 입력해주세요" 
                    className="h-11"
                    {...field} 
                  />
                </FormControl>
                <FormDescription className="text-sm text-gray-500">
                  원하시는 상품이나 서비스를 명확하게 표현해주세요.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            rules={{ required: '상세 설명을 입력해주세요.' }}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base">상세 설명</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="원하시는 상품이나 서비스에 대해 자세히 설명해주세요"
                    className="min-h-[150px] resize-none"
                    {...field}
                  />
                </FormControl>
                <FormDescription className="text-sm text-gray-500">
                  상품의 스펙, 원하는 조건 등을 상세히 적어주세요.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="expectedPrice"
            rules={{ 
              required: '예상 가격을 입력해주세요.',
              min: { value: 1000, message: '1,000원 이상이어야 합니다.' },
              max: { value: 100000000, message: '1억원 이하여야 합니다.' },
              validate: {
                isNumber: (value) => !isNaN(value) || '올바른 숫자를 입력해주세요.',
              }
            }}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base">예상 가격</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="50000"
                    className="h-11"
                    {...field}
                    onChange={e => field.onChange(e.target.valueAsNumber)}
                  />
                </FormControl>
                <FormDescription className="text-sm text-gray-500">
                  원하시는 가격대를 입력해주세요.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="minParticipants"
              rules={{ 
                required: '최소 참여자 수를 입력해주세요.',
                min: { value: 2, message: '최소 2명 이상이어야 합니다.' },
                max: { value: 100, message: '최대 100명까지 가능합니다.' },
                validate: {
                  isNumber: (value) => !isNaN(value) || '올바른 숫자를 입력해주세요.',
                }
              }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base">최소 참여자 수</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="2"
                      className="h-11"
                      {...field}
                      onChange={e => field.onChange(e.target.valueAsNumber)}
                    />
                  </FormControl>
                  <FormDescription className="text-sm text-gray-500">
                    공구가 성사되기 위한 최소 인원수입니다.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="maxParticipants"
              rules={{ 
                required: '최대 참여자 수를 입력해주세요.',
                min: { 
                  value: 2,
                  message: '최소 2명 이상이어야 합니다.'
                },
                max: { 
                  value: 100,
                  message: '최대 100명까지 가능합니다.'
                },
                validate: {
                  isGreaterThanMin: (value) => 
                    value > minParticipants || 
                    '최대 참여자 수는 최소 참여자 수보다 커야 합니다.',
                  isNumber: (value) => !isNaN(value) || '올바른 숫자를 입력해주세요.',
                }
              }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base">최대 참여자 수</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="10"
                      className="h-11"
                      {...field}
                      onChange={e => field.onChange(e.target.valueAsNumber)}
                    />
                  </FormControl>
                  <FormDescription className="text-sm text-gray-500">
                    공구에 참여할 수 있는 최대 인원수입니다.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="auctionDuration"
            rules={{ required: '입찰 기간을 선택해주세요.' }}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base">입찰 기간</FormLabel>
                <Select
                  onValueChange={val => field.onChange(parseInt(val))}
                  defaultValue={field.value.toString()}
                >
                  <FormControl>
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="입찰 기간을 선택해주세요" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="24">24시간</SelectItem>
                    <SelectItem value="48">48시간</SelectItem>
                    <SelectItem value="72">72시간</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription className="text-sm text-gray-500">
                  판매자들이 입찰할 수 있는 기간입니다.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end space-x-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              className="h-11 px-6"
            >
              취소
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="h-11 px-6 bg-primary hover:bg-primary-dark"
            >
              {isSubmitting && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
              공구 만들기
            </Button>
          </div>
        </form>
      </Form>
    </motion.div>
  );
}
