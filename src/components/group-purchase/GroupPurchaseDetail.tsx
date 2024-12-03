'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'react-toastify';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { GroupPurchase, Bid, User, PurchaseStatus } from '@prisma/client';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import BidForm from './BidForm';
import ChatRoom from './ChatRoom';

interface ExtendedBid extends Bid {
  seller: User & {
    rating: number;
    bidCount: number;
    points: number;
  };
}

interface ExtendedUser extends User {
  role: 'CONSUMER' | 'SELLER' | 'ADMIN';
  penaltyCount: number;
  penaltyEndTime: Date | null;
}

interface GroupPurchaseDetailProps {
  groupPurchase: GroupPurchase & {
    creator: ExtendedUser;
    participants: { user: ExtendedUser }[];
    bids: ExtendedBid[];
    votes: { user: { id: string; name: string } }[];
    messages: {
      sender: {
        id: string;
        name: string;
        role: string;
      };
      content: string;
      createdAt: Date;
    }[];
  };
  isParticipant: boolean;
  hasVoted: boolean;
  canBid: boolean;
  canVote: boolean;
  canParticipate: boolean;
}

const STATUS_MAP: Record<PurchaseStatus, { label: string; color: string }> = {
  RECRUITING: { label: '모집중', color: 'bg-blue-500' },
  BIDDING: { label: '입찰중', color: 'bg-yellow-500' },
  VOTING: { label: '투표중', color: 'bg-purple-500' },
  CONFIRMED: { label: '확정', color: 'bg-green-500' },
  COMPLETED: { label: '완료', color: 'bg-gray-500' },
  CANCELLED: { label: '취소됨', color: 'bg-red-500' },
};

export default function GroupPurchaseDetail({
  groupPurchase: initialGroupPurchase,
  isParticipant: initialIsParticipant,
  hasVoted: initialHasVoted,
  canBid,
  canVote,
  canParticipate,
}: GroupPurchaseDetailProps) {
  const { data: session } = useSession();
  const [groupPurchase, setGroupPurchase] = useState(initialGroupPurchase);
  const [isParticipant, setIsParticipant] = useState(initialIsParticipant);
  const [hasVoted, setHasVoted] = useState(initialHasVoted);
  const [timeLeft, setTimeLeft] = useState<string>('');

  // Timer for auction/vote end time
  useEffect(() => {
    const endTime = groupPurchase.status === 'VOTING' 
      ? groupPurchase.voteEndTime 
      : groupPurchase.auctionEndTime;

    if (!endTime) return;

    const timer = setInterval(() => {
      const end = new Date(endTime).getTime();
      const now = new Date().getTime();
      const distance = end - now;

      if (distance < 0) {
        setTimeLeft('종료됨');
        clearInterval(timer);
        return;
      }

      const hours = Math.floor(distance / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      setTimeLeft(`${hours}시간 ${minutes}분 ${seconds}초`);
    }, 1000);

    return () => clearInterval(timer);
  }, [groupPurchase?.status, groupPurchase?.auctionEndTime, groupPurchase?.voteEndTime]);

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
        const error = await response.json();
        throw new Error(error.message || '참여에 실패했습니다.');
      }

      const data = await response.json();
      setGroupPurchase(data.groupPurchase);
      setIsParticipant(true);
      toast.success('공구에 참여했습니다!');
    } catch (error) {
      console.error('Failed to participate:', error);
      toast.error(error instanceof Error ? error.message : '참여 중 오류가 발생했습니다.');
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
        const error = await response.json();
        throw new Error(error.message || '투표에 실패했습니다.');
      }

      const data = await response.json();
      setGroupPurchase(data.groupPurchase);
      setHasVoted(true);
      toast.success('투표가 완료되었습니다!');
    } catch (error) {
      console.error('Failed to vote:', error);
      toast.error(error instanceof Error ? error.message : '투표 중 오류가 발생했습니다.');
    }
  };

  const renderStatus = () => {
    const status = STATUS_MAP[groupPurchase.status];
    return (
      <Badge className={`${status.color} text-white`}>
        {status.label}
      </Badge>
    );
  };

  const renderParticipationProgress = () => {
    const progress = (groupPurchase.currentParticipants / groupPurchase.maxParticipants) * 100;
    return (
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>참여자 현황</span>
          <span>{groupPurchase.currentParticipants}/{groupPurchase.maxParticipants}명</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>
    );
  };

  const renderBids = () => {
    if (groupPurchase.bids.length === 0) {
      return <p className="text-gray-500">아직 입찰이 없습니다.</p>;
    }

    return (
      <div className="space-y-4">
        {groupPurchase.bids.map((bid) => (
          <div key={bid.id} className="p-4 border rounded-lg">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-semibold">{bid.seller.name}</p>
                <p className="text-sm text-gray-600">
                  평점: {bid.seller.rating.toFixed(1)} | 입찰 수: {bid.seller.bidCount}
                </p>
              </div>
              <p className="text-lg font-bold">{bid.price.toLocaleString()}원</p>
            </div>
            <p className="mt-2 text-gray-700">{bid.description}</p>
            <p className="mt-1 text-sm text-gray-500">
              {formatDistanceToNow(new Date(bid.createdAt), { addSuffix: true, locale: ko })}
            </p>
          </div>
        ))}
      </div>
    );
  };

  const renderVotingStatus = () => {
    if (groupPurchase.status !== 'VOTING') return null;

    const approvedCount = groupPurchase.votes.filter(v => v.approved).length;
    const totalVotes = groupPurchase.votes.length;
    const progress = (totalVotes / groupPurchase.currentParticipants) * 100;

    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>투표 현황</span>
            <span>{totalVotes}/{groupPurchase.currentParticipants}명</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
        <p className="text-center">
          찬성: {approvedCount}명 | 반대: {totalVotes - approvedCount}명
        </p>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">{groupPurchase.title}</h1>
          {renderStatus()}
        </div>
        
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <span>작성자: {groupPurchase.creator.name}</span>
          <span>•</span>
          <span>
            {formatDistanceToNow(new Date(groupPurchase.createdAt), {
              addSuffix: true,
              locale: ko,
            })}
          </span>
        </div>

        <p className="text-gray-700 whitespace-pre-line">{groupPurchase.description}</p>

        {timeLeft && (
          <p className="text-lg font-semibold text-center">
            {groupPurchase.status === 'VOTING' ? '투표' : '입찰'} 종료까지: {timeLeft}
          </p>
        )}

        {renderParticipationProgress()}

        {canParticipate && (
          <Button
            onClick={handleParticipate}
            className="w-full"
          >
            참여하기
          </Button>
        )}
      </div>

      {groupPurchase.status === 'BIDDING' && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">입찰 현황</h2>
          {renderBids()}
          {canBid && <BidForm groupPurchaseId={groupPurchase.id} onBidSubmitted={(bid) => {
            setGroupPurchase(prev => ({
              ...prev,
              bids: [...prev.bids, bid],
            }));
          }} />}
        </div>
      )}

      {groupPurchase.status === 'VOTING' && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">투표</h2>
          {renderVotingStatus()}
          {canVote && !hasVoted && (
            <div className="flex space-x-4">
              <Button
                onClick={() => handleVote(true)}
                className="flex-1 bg-green-500 hover:bg-green-600"
              >
                찬성
              </Button>
              <Button
                onClick={() => handleVote(false)}
                className="flex-1 bg-red-500 hover:bg-red-600"
              >
                반대
              </Button>
            </div>
          )}
        </div>
      )}

      {isParticipant && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">채팅</h2>
          <ChatRoom
            groupPurchaseId={groupPurchase.id}
            initialMessages={groupPurchase.messages}
          />
        </div>
      )}
    </div>
  );
}
