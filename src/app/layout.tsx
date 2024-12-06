import type { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { SessionProvider } from '@/components/SessionProvider';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/layout/Footer';
import { NotificationProvider } from '@/contexts/NotificationContext';

export const metadata: Metadata = {
  title: '둥지마켓 - 소비자 주도형 공동구매 플랫폼',
  description: '소비자가 주도하는 혁신적인 공동구매 플랫폼',
  icons: {
    icon: '/favicon.ico',
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession();

  return (
    <html lang="ko">
      <body className="min-h-screen bg-gray-50 flex flex-col">
        <SessionProvider session={session}>
          <NotificationProvider>
            <Header />
            <main className="flex-grow w-full pt-16">
              {children}
            </main>
            <Footer />
          </NotificationProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
