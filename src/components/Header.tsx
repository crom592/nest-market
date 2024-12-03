'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, ShoppingBag } from 'lucide-react';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { href: '/', label: '홈' },
    { href: '/products', label: '상품' },
    { href: '/about', label: '소개' },
    { href: '/inquiries', label: '문의하기' },
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
        
        <nav className="hidden md:block">
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
        </nav>

        <div className="flex items-center space-x-4">
          <Link
            href="/group-purchases/create"
            className={`hidden md:block px-4 py-2 rounded-lg font-medium ${
              isScrolled
                ? 'bg-primary text-white hover:bg-primary-600'
                : 'bg-white text-primary hover:bg-gray-100'
            }`}
          >
            공구 만들기
          </Link>
          <button className="hover:text-primary transition-colors duration-300">
            <ShoppingBag className="w-6 h-6" />
          </button>
          <button 
            className="md:hidden hover:text-primary transition-colors duration-300"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`md:hidden transition-all duration-300 ${
        isMenuOpen ? 'max-h-64 opacity-100' : 'max-h-0 opacity-0'
      } overflow-hidden`}>
        <nav className={`${
          isScrolled ? 'bg-white/80 backdrop-blur-md' : 'bg-gray-900/90 backdrop-blur-sm'
        }`}>
          <ul className="flex flex-col">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link 
                  href={item.href} 
                  className={`block py-3 px-4 hover:bg-primary/10 transition-colors duration-300 ${
                    pathname === item.href ? 'text-primary' : ''
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
