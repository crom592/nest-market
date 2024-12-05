import { NextAuthOptions } from 'next-auth';

export const authOptions: NextAuthOptions = {
  secret: 'test-secret',
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60,
    updateAge: 24 * 60 * 60,
  },
  providers: [],
  callbacks: {
    session: ({ session }) => {
      return {
        ...session,
        user: {
          ...session.user,
          id: '1',
        },
      };
    },
    jwt: ({ token }) => {
      return {
        ...token,
        id: '1',
      };
    },
  },
};

export const getServerSession = jest.fn(() => 
  Promise.resolve({
    user: {
      id: '1',
      name: 'Test User',
      email: 'test@example.com',
    },
  })
);
