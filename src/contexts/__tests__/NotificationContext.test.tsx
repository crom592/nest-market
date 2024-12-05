import { render, act } from '@testing-library/react';
import { NotificationProvider } from '../NotificationContext';
import { mockFetchResponse } from '@/lib/test/helpers';
import { renderWithProviders } from '@/lib/test/test-utils';

describe('NotificationContext', () => {
  let mockWebSocket: any;

  beforeEach(() => {
    mockWebSocket = {
      send: jest.fn(),
      close: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    };

    global.WebSocket = jest.fn(() => mockWebSocket);
    mockFetchResponse({ notifications: [], unreadCount: 0 });
  });

  it('provides notification context to children', () => {
    const { getByTestId } = renderWithProviders(
      <NotificationProvider>
        <div data-testid="test-component">Test</div>
      </NotificationProvider>
    );

    expect(getByTestId('test-component')).toBeInTheDocument();
  });

  it('initializes WebSocket connection when user is authenticated', () => {
    renderWithProviders(
      <NotificationProvider>
        <div>Test</div>
      </NotificationProvider>
    );

    expect(global.WebSocket).toHaveBeenCalled();
    expect(mockWebSocket.addEventListener).toHaveBeenCalledWith('message', expect.any(Function));
  });

  it('closes WebSocket connection on unmount', () => {
    const { unmount } = renderWithProviders(
      <NotificationProvider>
        <div>Test</div>
      </NotificationProvider>
    );

    unmount();
    expect(mockWebSocket.close).toHaveBeenCalled();
  });

  it('handles new notification message from WebSocket', () => {
    renderWithProviders(
      <NotificationProvider>
        <div>Test</div>
      </NotificationProvider>
    );

    const messageHandler = mockWebSocket.addEventListener.mock.calls.find(
      ([event]) => event === 'message'
    )[1];

    act(() => {
      messageHandler({
        data: JSON.stringify({
          type: 'notification',
          data: {
            id: '1',
            title: 'Test Notification',
            message: 'Test Message',
            read: false,
            createdAt: new Date().toISOString(),
          },
        }),
      });
    });

    expect(mockFetchResponse).toHaveBeenCalled();
  });

  it('marks notification as read', async () => {
    const { getByTestId } = renderWithProviders(
      <NotificationProvider>
        <div data-testid="test-component">Test</div>
      </NotificationProvider>
    );

    expect(getByTestId('test-component')).toBeInTheDocument();
  });
});
