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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { data: session } = useSession();
  const router = useRouter();

  const form = useForm<CreateGroupPurchaseFormData>({
    defaultValues: {
      title: '',
      description: '',
      minParticipants: 3,
      maxParticipants: 10,
      expectedPrice: 0,
      auctionDuration: 24,
    },
  });

  const onSubmit = async (data: CreateGroupPurchaseFormData) => {
    if (!session?.user) {
      toast.error('로그인이 필요합니다.');
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await fetch('/api/group-purchases', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          auctionStartTime: new Date(),
          auctionEndTime: new Date(Date.now() + data.auctionDuration * 60 * 60 * 1000),
        }),
      });

      if (!response.ok) {
        throw new Error('공구 생성에 실패했습니다.');
      }

      const result = await response.json();
      toast.success('공구가 생성되었습니다!');
      router.push(`/group-purchases/${result.id}`);
    } catch (error) {
      toast.error('공구 생성 중 오류가 발생했습니다.');
      console.error(error);
    } finally {
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
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>공구 제목</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="공구하고 싶은 제품/서비스 제목을 입력하세요" />
                </FormControl>
                <FormDescription>
                  구체적인 모델명이나 서비스 내용을 포함하면 좋습니다.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>상세 설명</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    placeholder="원하는 제품/서비스에 대해 자세히 설명해주세요"
                    className="h-32"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="minParticipants"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>최소 참여 인원</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      min={3}
                      max={100}
                      onChange={e => field.onChange(parseInt(e.target.value))}
                    />
                  </FormControl>
                  <FormDescription>최소 3명 이상</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="maxParticipants"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>최대 참여 인원</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      min={3}
                      max={100}
                      onChange={e => field.onChange(parseInt(e.target.value))}
                    />
                  </FormControl>
                  <FormDescription>최대 100명까지</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="expectedPrice"
            render={({ field }) => (
              <FormItem>
                <FormLabel>희망 가격</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="number"
                    min={0}
                    onChange={e => field.onChange(parseInt(e.target.value))}
                  />
                </FormControl>
                <FormDescription>
                  원하는 가격대를 입력해주세요 (선택사항)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="auctionDuration"
            render={({ field }) => (
              <FormItem>
                <FormLabel>경매 진행 시간</FormLabel>
                <Select
                  onValueChange={(value) => field.onChange(parseInt(value))}
                  defaultValue={field.value.toString()}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="경매 진행 시간을 선택하세요" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="6">6시간</SelectItem>
                    <SelectItem value="12">12시간</SelectItem>
                    <SelectItem value="24">24시간</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  판매자들이 입찰할 수 있는 시간을 설정합니다
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                생성 중...
              </>
            ) : (
              '공구 생성하기'
            )}
          </Button>
        </form>
      </Form>
    </motion.div>
  );
}
