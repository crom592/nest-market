'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'react-toastify';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GroupPurchase, Bid, User } from '@prisma/client';
import BidForm from './BidForm';
import ChatRoom from './ChatRoom';

interface ExtendedBid extends Bid {
  seller: User;
}

interface GroupPurchaseDetailProps {
  groupPurchase: GroupPurchase;
  initialBids: ExtendedBid[];
  isParticipant: boolean;
  hasVoted: boolean;
}

export default function GroupPurchaseDetail({
  groupPurchase: initialGroupPurchase,
  initialBids,
  isParticipant: initialIsParticipant,
  hasVoted: initialHasVoted,
}: GroupPurchaseDetailProps) {
  const { data: session } = useSession();
  const [groupPurchase, setGroupPurchase] = useState(initialGroupPurchase);
  const [bids, setBids] = useState(initialBids);
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [isParticipant, setIsParticipant] = useState(initialIsParticipant);
  const [hasVoted, setHasVoted] = useState(initialHasVoted);

  useEffect(() => {
    if (!groupPurchase?.auctionEndTime) return;

    const timer = setInterval(() => {
      const end = new Date(groupPurchase.auctionEndTime).getTime();
      const now = new Date().getTime();
      const distance = end - now;

      if (distance < 0) {
        setTimeLeft('경매 종료');
        clearInterval(timer);
        return;
      }

      const hours = Math.floor(distance / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      setTimeLeft(`${hours}시간 ${minutes}분 ${seconds}초`);
    }, 1000);

    return () => clearInterval(timer);
  }, [groupPurchase?.auctionEndTime]);

  const handleParticipate = async () => {
    if (!session?.user) {
      toast.error('로그인이 필요합니다.');
      return;
    }

    try {
      const response = await fetch(`/api/group-purchases/${groupPurchase.id}/participate`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('참여에 실패했습니다.');
      }

      const data = await response.json();
      setGroupPurchase(data.groupPurchase);
      setIsParticipant(true);
      toast.success('공구에 참여했습니다!');
    } catch (error) {
      console.error('Failed to participate:', error);
      toast.error('참여 중 오류가 발생했습니다.');
    }
  };

  const handleVote = async (approved: boolean) => {
    if (!session?.user) {
      toast.error('로그인이 필요합니다.');
      return;
    }

    try {
      const response = await fetch(`/api/group-purchases/${groupPurchase.id}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ approved }),
      });

      if (!response.ok) {
        throw new Error('투표에 실패했습니다.');
      }

      setHasVoted(true);
      toast.success('투표가 완료되었습니다!');
    } catch (error) {
      console.error('Failed to vote:', error);
      toast.error('투표 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="space-y-8">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h1 className="text-3xl font-bold mb-4">{groupPurchase.title}</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-semibold mb-2">상세 설명</h2>
                <p className="text-gray-600 dark:text-gray-300">{groupPurchase.description}</p>
              </div>

              <div>
                <h2 className="text-lg font-semibold mb-2">참여 현황</h2>
                <p className="text-gray-600 dark:text-gray-300">
                  {groupPurchase.currentParticipants} / {groupPurchase.maxParticipants} 명
                </p>
              </div>

              {groupPurchase.expectedPrice && (
                <div>
                  <h2 className="text-lg font-semibold mb-2">희망 가격</h2>
                  <p className="text-gray-600 dark:text-gray-300">
                    {groupPurchase.expectedPrice.toLocaleString()}원
                  </p>
                </div>
              )}

              {timeLeft && (
                <div>
                  <h2 className="text-lg font-semibold mb-2">남은 시간</h2>
                  <p className="text-gray-600 dark:text-gray-300">{timeLeft}</p>
                </div>
              )}
            </div>

            {!isParticipant && groupPurchase.status === 'RECRUITING' && (
              <Button
                onClick={handleParticipate}
                className="w-full mt-6"
              >
                공구 참여하기
              </Button>
            )}
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">입찰 현황</h2>
            {bids.length > 0 ? (
              <div className="space-y-4">
                {bids.map((bid) => (
                  <div
                    key={bid.id}
                    className="p-4 border rounded-lg dark:border-gray-700"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium">판매자: {bid.seller.name}</span>
                      <span className="text-lg font-bold">
                        {bid.price.toLocaleString()}원
                      </span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300">{bid.description}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">아직 입찰이 없습니다.</p>
            )}
          </div>
        </div>
      </div>

      {groupPurchase.status === 'VOTING' && isParticipant && !hasVoted && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">최종 입찰 투표</h2>
          <p className="mb-4">
            가장 낮은 입찰가의 판매자가 선정되었습니다. 해당 판매자와 거래를 진행하시겠습니까?
          </p>
          <div className="flex space-x-4">
            <Button
              onClick={() => handleVote(true)}
              variant="default"
              className="flex-1"
            >
              찬성
            </Button>
            <Button
              onClick={() => handleVote(false)}
              variant="outline"
              className="flex-1"
            >
              반대
            </Button>
          </div>
        </div>
      )}

      {session?.user?.role === 'SELLER' && groupPurchase.status === 'BIDDING' && (
        <BidForm 
          groupPurchaseId={groupPurchase.id} 
          onBidSubmitted={(newBid) => setBids([...bids, newBid as ExtendedBid])} 
        />
      )}

      {isParticipant && <ChatRoom groupPurchaseId={groupPurchase.id} />}
    </div>
  );
}
