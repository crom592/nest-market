'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useRef,
} from 'react';
import { useSession } from 'next-auth/react';

interface Notification {
  id: string;
  type: 
    | 'GROUP_PURCHASE' 
    | 'PARTICIPANT' 
    | 'POINT' 
    | 'SYSTEM'
    | 'AUCTION_START'
    | 'AUCTION_END'
    | 'VOTE_START'
    | 'VOTE_REMINDER'
    | 'VOTE_END'
    | 'GROUP_CONFIRMED'
    | 'GROUP_CANCELED'
    | 'REVIEW_REQUEST'
    | 'PENALTY';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
  link?: string;
  data?: {
    groupPurchaseId?: string;
    voteEndTime?: string;
    currentVotes?: number;
    totalVotes?: number;
    penaltyEndTime?: string;
  };
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt' | 'isRead'>) => void;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { data: session } = useSession();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (session?.user) {
      fetchNotifications();
      setupWebSocket();
    }
    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [session]);

  const setupWebSocket = () => {
    ws.current = new WebSocket(process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001');

    ws.current.onmessage = (event) => {
      const notification = JSON.parse(event.data);
      if (notification.userId === session?.user?.id) {
        handleNewNotification(notification);
      }
    };

    ws.current.onclose = () => {
      // Try to reconnect in 5 seconds
      setTimeout(setupWebSocket, 5000);
    };
  };

  const fetchNotifications = async () => {
    try {
      const response = await fetch('/api/notifications');
      if (!response.ok) throw new Error('알림을 불러오는데 실패했습니다');
      const data = await response.json();
      setNotifications(data);
      updateUnreadCount(data);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  };

  const handleNewNotification = (notification: Notification) => {
    setNotifications(prev => [notification, ...prev]);
    setUnreadCount(prev => prev + 1);
    
    // Show browser notification if permission is granted
    if (Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/icon.png'
      });
    }

    // Handle vote reminders
    if (notification.type === 'VOTE_REMINDER' && notification.data?.voteEndTime) {
      const voteEnd = new Date(notification.data.voteEndTime);
      const timeLeft = voteEnd.getTime() - Date.now();
      if (timeLeft > 0) {
        setTimeout(() => {
          addNotification({
            type: 'VOTE_END',
            title: '투표가 종료되었습니다',
            message: `공구 투표가 종료되었습니다. 결과를 확인해주세요.`,
            link: `/group-purchases/${notification.data?.groupPurchaseId}`,
          });
        }, timeLeft);
      }
    }
  };

  const updateUnreadCount = (notifs: Notification[]) => {
    const count = notifs.filter(n => !n.isRead).length;
    setUnreadCount(count);
  };

  const addNotification = async (
    notification: Omit<Notification, 'id' | 'createdAt' | 'isRead'>
  ) => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(notification),
      });

      if (!response.ok) throw new Error('알림 생성에 실패했습니다');
      
      const newNotification = await response.json();
      handleNewNotification(newNotification);
    } catch (error) {
      console.error('Failed to create notification:', error);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'POST',
      });
      if (!response.ok) throw new Error('알림 읽음 처리에 실패했습니다');
      
      setNotifications(prev =>
        prev.map(n =>
          n.id === notificationId ? { ...n, isRead: true } : n
        )
      );
      updateUnreadCount(notifications);
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const response = await fetch('/api/notifications/read-all', {
        method: 'POST',
      });
      if (!response.ok) throw new Error('알림 읽음 처리에 실패했습니다');
      
      setNotifications(prev =>
        prev.map(n => ({ ...n, isRead: true }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('알림 삭제에 실패했습니다');
      
      setNotifications(prev =>
        prev.filter(n => n.id !== notificationId)
      );
      updateUnreadCount(notifications);
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        addNotification,
        markAsRead,
        markAllAsRead,
        deleteNotification,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
}
