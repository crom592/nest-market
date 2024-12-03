import 'next-auth';
import { UserRole } from '@prisma/client';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      image?: string | null;
      role: UserRole;
      phone?: string | null;
    };
  }

  interface User {
    id: string;
    email: string;
    name: string;
    image?: string | null;
    role: UserRole;
    phone?: string | null;
    emailVerified?: Date | null;
    password?: string | null;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: UserRole;
    provider?: string;
  }
}
