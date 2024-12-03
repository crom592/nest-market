import type { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { SessionProvider } from '@/components/SessionProvider';
import './globals.css';
import Header from '@/components/Header';

export const metadata: Metadata = {
  title: '둥지마켓 - 소비자 주도형 공동구매 플랫폼',
  description: '소비자가 주도하는 혁신적인 공동구매 플랫폼',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession();

  return (
    <html lang="ko">
      <body className="min-h-screen bg-gray-50">
        <SessionProvider session={session}>
          <Header />
          <main className="w-full">
            {children}
          </main>
        </SessionProvider>
      </body>
    </html>
  );
}
