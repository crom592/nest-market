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
import wsClient from '@/lib/utils/websocket';

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

  useEffect(() => {
    if (session?.user) {
      fetchNotifications();
      wsClient.connect();

      // Listen for new notifications
      wsClient.on('notification', handleNewNotification);

      // Request notification permission
      if ('Notification' in window) {
        Notification.requestPermission();
      }
    }

    return () => {
      wsClient.disconnect();
    };
  }, [session]);

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
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/icon.png'
      });
    }

    // Play notification sound
    const audio = new Audio('/notification.mp3');
    audio.play().catch(console.error);
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
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isRead: true }),
      });

      if (response.ok) {
        setNotifications(prev =>
          prev.map(n =>
            n.id === notificationId ? { ...n, isRead: true } : n
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const response = await fetch('/api/notifications/mark-all-read', {
        method: 'POST',
      });

      if (response.ok) {
        setNotifications(prev =>
          prev.map(n => ({ ...n, isRead: true }))
        );
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
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
