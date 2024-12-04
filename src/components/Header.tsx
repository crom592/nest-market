'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { useSession } from 'next-auth/react';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();
  const { data: session } = useSession();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { href: '/', label: '홈' },
    { href: '/group-purchases', label: '공구목록' },
    { href: '/about', label: '소개' },
    { href: '/inquiries', label: '문의하기' },
    ...(session?.user?.role === 'ADMIN' ? [{ href: '/admin', label: '관리자' }] : []),
  ];

  return (
    <header className={`fixed top-0 w-full z-50 transition-all duration-300 ${
      isScrolled ? 'bg-white/80 backdrop-blur-md shadow-sm' : 'bg-gradient-to-b from-gray-900/50 to-transparent'
    }`}>
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className={`text-2xl font-bold tracking-wider ${
          isScrolled ? 'text-gray-900' : 'text-white'
        }`}>
          둥지 마켓
        </Link>
        
        <nav className="hidden md:flex items-center space-x-8">
          <ul className="flex space-x-8">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link 
                  href={item.href} 
                  className={`transition-colors duration-300 text-lg ${
                    pathname === item.href 
                      ? 'text-primary font-medium' 
                      : isScrolled 
                        ? 'text-gray-700 hover:text-primary' 
                        : 'text-white hover:text-primary-200'
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          
          <div className="flex items-center space-x-4">
            {session ? (
              <Link
                href="/api/auth/signout"
                className={`px-4 py-2 rounded-lg border-2 transition-colors duration-300 ${
                  isScrolled
                    ? 'border-primary text-primary hover:bg-primary hover:text-white'
                    : 'border-white text-white hover:bg-white hover:text-gray-900'
                }`}
              >
                로그아웃
              </Link>
            ) : (
              <>
                <Link
                  href="/auth/signin"
                  className={`px-4 py-2 rounded-lg transition-colors duration-300 ${
                    isScrolled
                      ? 'text-gray-700 hover:text-primary'
                      : 'text-white hover:text-primary-200'
                  }`}
                >
                  로그인
                </Link>
                <Link
                  href="/auth/signup"
                  className={`px-4 py-2 rounded-lg border-2 transition-colors duration-300 ${
                    isScrolled
                      ? 'border-primary text-primary hover:bg-primary hover:text-white'
                      : 'border-white text-white hover:bg-white hover:text-gray-900'
                  }`}
                >
                  회원가입
                </Link>
              </>
            )}
          </div>
        </nav>

        <button
          className="md:hidden"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? (
            <X className={isScrolled ? 'text-gray-900' : 'text-white'} />
          ) : (
            <Menu className={isScrolled ? 'text-gray-900' : 'text-white'} />
          )}
        </button>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white">
          <nav className="container mx-auto px-4 py-4">
            <ul className="space-y-4">
              {navItems.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`block text-lg ${
                      pathname === item.href
                        ? 'text-primary font-medium'
                        : 'text-gray-700 hover:text-primary'
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
              {session ? (
                <li>
                  <Link
                    href="/api/auth/signout"
                    className="block px-4 py-2 text-lg text-center rounded-lg border-2 border-primary text-primary hover:bg-primary hover:text-white transition-colors duration-300"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    로그아웃
                  </Link>
                </li>
              ) : (
                <>
                  <li>
                    <Link
                      href="/auth/signin"
                      className="block text-lg text-gray-700 hover:text-primary"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      로그인
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/auth/signup"
                      className="block px-4 py-2 text-lg text-center rounded-lg border-2 border-primary text-primary hover:bg-primary hover:text-white transition-colors duration-300"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      회원가입
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </nav>
        </div>
      )}
    </header>
  );
}
