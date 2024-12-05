import React from 'react';

export const useNotification = jest.fn(() => ({
  notifications: [],
  addNotification: jest.fn(),
  removeNotification: jest.fn(),
  clearNotifications: jest.fn(),
}));

export const NotificationProvider = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};
