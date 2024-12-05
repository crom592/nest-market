import React from 'react';
import { render } from '@testing-library/react';
import { SessionProvider } from 'next-auth/react';

const mockSession = {
  user: {
    id: '1',
    name: 'Test User',
    email: 'test@example.com',
  },
  expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
};

export function renderWithSession(ui: React.ReactElement, session = mockSession) {
  return render(
    <SessionProvider session={session}>{ui}</SessionProvider>
  );
}

export function renderWithProviders(ui: React.ReactElement, session = mockSession) {
  return render(
    <SessionProvider session={session}>
      {ui}
    </SessionProvider>
  );
}
