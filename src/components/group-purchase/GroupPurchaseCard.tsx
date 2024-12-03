import Image from 'next/image';
import Link from 'next/link';
import { formatDistance } from 'date-fns';

interface GroupPurchaseCardProps {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  currentPrice: number;
  targetPrice: number;
  deadline: Date;
  participants: number;
  targetParticipants: number;
}

export default function GroupPurchaseCard({
  id,
  title,
  description,
  imageUrl,
  currentPrice,
  targetPrice,
  deadline,
  participants,
  targetParticipants,
}: GroupPurchaseCardProps) {
  const progress = (participants / targetParticipants) * 100;
  const timeLeft = formatDistance(deadline, new Date(), { addSuffix: true });
  const priceProgress = ((targetPrice - currentPrice) / targetPrice) * 100;

  return (
    <Link href={`/group-purchases/${id}`}>
      <div className="card-hover bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
        <div className="relative aspect-product">
          <Image
            src={imageUrl}
            alt={title}
            fill
            className="object-cover image-hover"
          />
        </div>
        <div className="p-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {title}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
            {description}
          </p>
          
          <div className="space-y-3">
            {/* Price Progress */}
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600 dark:text-gray-400">Current Price</span>
                <span className="font-medium text-primary">${currentPrice}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all duration-500"
                  style={{ width: `${priceProgress}%` }}
                />
              </div>
            </div>

            {/* Participants Progress */}
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600 dark:text-gray-400">
                  {participants} of {targetParticipants} joined
                </span>
                <span className="text-primary">{Math.round(progress)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-secondary h-2 rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>

          <div className="mt-4 flex justify-between items-center text-sm">
            <span className="text-gray-600 dark:text-gray-400">
              Ends {timeLeft}
            </span>
            <span className="text-primary font-medium">
              Save ${(targetPrice - currentPrice).toFixed(2)}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
