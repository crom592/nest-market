import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { NextRequestWithAuth } from 'next-auth/middleware';

// 인증이 필요한 경로 패턴
const authRequiredPaths = [
  '/profile',
  '/orders',
  '/purchases',
  '/admin',
];

// 인증이 필요하지 않은 API 경로 패턴
const publicApiPaths = [
  '/api/products',
  '/api/categories',
];

export default async function middleware(request: NextRequestWithAuth) {
  const token = await getToken({ req: request });
  const { pathname } = request.nextUrl;

  // public API 경로는 인증 체크 없이 허용
  if (publicApiPaths.some(path => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // 인증이 필요한 경로에 대한 체크
  if (authRequiredPaths.some(path => pathname.startsWith(path))) {
    if (!token) {
      const url = new URL('/auth/signin', request.url);
      url.searchParams.set('callbackUrl', encodeURI(request.url));
      return NextResponse.redirect(url);
    }
    
    // admin 경로는 ADMIN 역할만 접근 가능
    if (pathname.startsWith('/admin') && token.role !== 'ADMIN') {
      return new NextResponse('Unauthorized', { status: 403 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
};
