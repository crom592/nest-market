'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Loader2 } from 'lucide-react';

interface BidFormProps {
  groupPurchaseId: string;
  onBidSubmitted: (bid: any) => void;
}

interface BidFormData {
  price: number;
  description: string;
}

export default function BidForm({ groupPurchaseId, onBidSubmitted }: BidFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<BidFormData>({
    defaultValues: {
      price: 0,
      description: '',
    },
  });

  const onSubmit = async (data: BidFormData) => {
    try {
      setIsSubmitting(true);
      const response = await fetch(`/api/group-purchases/${groupPurchaseId}/bid`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('입찰에 실패했습니다.');
      }

      const result = await response.json();
      onBidSubmitted(result.bid);
      toast.success('입찰이 완료되었습니다!');
      form.reset();
    } catch (error) {
      console.error('Failed to submit bid:', error);
      toast.error('입찰 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
      <h2 className="text-xl font-semibold mb-6">입찰하기</h2>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>입찰 가격</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={0}
                    placeholder="가격을 입력하세요"
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value))}
                  />
                </FormControl>
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
                    placeholder="제품/서비스에 대한 상세 설명을 입력하세요"
                    className="h-32"
                    {...field}
                  />
                </FormControl>
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
                입찰 중...
              </>
            ) : (
              '입찰하기'
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
}
