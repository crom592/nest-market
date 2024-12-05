import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { jest } from '@jest/globals';
import NotificationCenter from '../NotificationCenter';
import { useSession } from 'next-auth/react';
import { useNotification } from '@/contexts/NotificationContext';
import { renderWithProviders } from '@/lib/test/test-utils';

// Mock next-auth
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(),
}));

// Mock NotificationContext
jest.mock('@/contexts/NotificationContext', () => ({
  useNotification: jest.fn(),
}));

// Mock WebSocket
class MockWebSocket {
  constructor(url: string) {}
  close() {}
  addEventListener() {}
  removeEventListener() {}
  send() {}
}

global.WebSocket = MockWebSocket as any;

const mockNotifications = [
  {
    id: '1',
    type: 'GROUP_PURCHASE',
    title: '새로운 공구 참여자',
    message: '홍길동님이 아이폰 공구에 참여했습니다.',
    isRead: false,
    createdAt: new Date('2024-01-01'),
  },
  {
    id: '2',
    type: 'POINT',
    title: '포인트 적립',
    message: '공구 참여로 100P가 적립되었습니다.',
    isRead: true,
    createdAt: new Date('2024-01-02'),
  },
];

describe('NotificationCenter', () => {
  beforeEach(() => {
    // Mock session
    (useSession as jest.Mock).mockReturnValue({
      data: { user: { id: '1', name: 'Test User' } },
      status: 'authenticated',
    });

    // Mock notification context
    (useNotification as jest.Mock).mockReturnValue({
      notifications: mockNotifications,
      unreadCount: 1,
      markAsRead: jest.fn(),
      markAllAsRead: jest.fn(),
      deleteNotification: jest.fn(),
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders notification bell with unread count', () => {
    const { getByText } = renderWithProviders(<NotificationCenter />);
    
    const badge = getByText('1');
    expect(badge).toBeInTheDocument();
  });

  it('opens notification popover when bell is clicked', async () => {
    const { getByRole } = renderWithProviders(<NotificationCenter />);
    
    const bell = getByRole('button');
    fireEvent.click(bell);
    
    await waitFor(() => {
      expect(screen.getByText('알림')).toBeInTheDocument();
    });
  });

  it('displays notifications with correct formatting', async () => {
    const { getByRole } = renderWithProviders(<NotificationCenter />);
    
    const bell = getByRole('button');
    fireEvent.click(bell);
    
    await waitFor(() => {
      expect(screen.getByText('새로운 공구 참여자')).toBeInTheDocument();
      expect(screen.getByText('포인트 적립')).toBeInTheDocument();
    });
  });

  it('filters notifications by type', async () => {
    const { getByRole } = renderWithProviders(<NotificationCenter />);
    
    const bell = getByRole('button');
    fireEvent.click(bell);
    
    await waitFor(() => {
      const pointsTab = screen.getByRole('tab', { name: '포인트' });
      fireEvent.click(pointsTab);
      
      expect(screen.getByText('포인트 적립')).toBeInTheDocument();
      expect(screen.queryByText('새로운 공구 참여자')).not.toBeInTheDocument();
    });
  });

  it('marks notification as read when check button is clicked', async () => {
    const mockMarkAsRead = jest.fn();
    (useNotification as jest.Mock).mockReturnValue({
      ...useNotification(),
      markAsRead: mockMarkAsRead,
    });

    const { getByRole } = renderWithProviders(<NotificationCenter />);
    
    const bell = getByRole('button');
    fireEvent.click(bell);
    
    await waitFor(() => {
      const checkButton = screen.getByRole('button', { name: /읽음/ });
      fireEvent.click(checkButton);
      
      expect(mockMarkAsRead).toHaveBeenCalledWith('1');
    });
  });

  it('deletes notification when delete button is clicked', async () => {
    const mockDeleteNotification = jest.fn();
    (useNotification as jest.Mock).mockReturnValue({
      ...useNotification(),
      deleteNotification: mockDeleteNotification,
    });

    const { getByRole } = renderWithProviders(<NotificationCenter />);
    
    const bell = getByRole('button');
    fireEvent.click(bell);
    
    await waitFor(() => {
      const deleteButtons = screen.getAllByRole('button', { name: /삭제/ });
      fireEvent.click(deleteButtons[0]);
      
      expect(mockDeleteNotification).toHaveBeenCalledWith('1');
    });
  });

  it('marks all notifications as read', async () => {
    const mockMarkAllAsRead = jest.fn();
    (useNotification as jest.Mock).mockReturnValue({
      ...useNotification(),
      markAllAsRead: mockMarkAllAsRead,
    });

    const { getByRole } = renderWithProviders(<NotificationCenter />);
    
    const bell = getByRole('button');
    fireEvent.click(bell);
    
    await waitFor(() => {
      const markAllButton = screen.getByText('모두 읽음');
      fireEvent.click(markAllButton);
      
      expect(mockMarkAllAsRead).toHaveBeenCalled();
    });
  });

  it('shows empty state when no notifications', async () => {
    (useNotification as jest.Mock).mockReturnValue({
      ...useNotification(),
      notifications: [],
      unreadCount: 0,
    });

    const { getByRole } = renderWithProviders(<NotificationCenter />);
    
    const bell = getByRole('button');
    fireEvent.click(bell);
    
    await waitFor(() => {
      expect(screen.getByText('알림이 없습니다')).toBeInTheDocument();
    });
  });
});
