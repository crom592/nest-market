'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function Home() {
  const observerRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const observers = observerRefs.current.map((ref, index) => {
      if (!ref) return null;

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('animate-fade-in');
              entry.target.classList.remove('opacity-0', 'translate-y-10');
            }
          });
        },
        {
          threshold: 0.1,
          rootMargin: '0px 0px -10% 0px',
        }
      );

      observer.observe(ref);
      return observer;
    });

    return () => {
      observers.forEach((observer) => observer?.disconnect());
    };
  }, []);

  const popularProducts = [
    {
      id: 1,
      title: "애플 맥북 프로 공동구매",
      image: "/images/macbook.jpg",
      price: "2,500,000원부터",
      participants: 128
    },
    {
      id: 2,
      title: "다이슨 에어랩 공동구매",
      image: "/images/dyson.jpg",
      price: "450,000원부터",
      participants: 256
    },
    {
      id: 3,
      title: "닌텐도 스위치 OLED 공동구매",
      image: "/images/switch.jpg",
      price: "330,000원부터",
      participants: 89
    }
  ];

  return (
    <div className="relative">
      {/* Hero Section */}
      <div 
        ref={el => observerRefs.current[0] = el}
        className="min-h-screen flex items-center justify-center opacity-0 translate-y-10 transition-all duration-1000 ease-out bg-gradient-to-b from-primary/5 via-primary/10 to-transparent"
      >
        <div className="text-center max-w-4xl mx-auto px-4">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-gray-900 mb-8">
            소비자가 주도하는
            <br />
            새로운 공구 플랫폼
          </h1>
          <p className="text-xl md:text-2xl text-gray-700 mb-12">
            원하는 상품을 제안하고, 판매자의 입찰을 받아보세요.
            <br />
            더 투명하고 효율적인 공구 쇼핑을 경험하실 수 있습니다.
          </p>
          <div className="flex items-center justify-center gap-6">
            <Link
              href="/group-purchases/create"
              className="rounded-full bg-primary px-8 py-4 text-lg font-medium text-white hover:bg-primary-dark transition-colors"
            >
              공구 만들기
            </Link>
            <Link
              href="/group-purchases"
              className="text-lg font-medium text-gray-900 hover:text-primary transition-colors"
            >
              공구 둘러보기 →
            </Link>
          </div>
        </div>
      </div>

      {/* Popular Products Section */}
      <div 
        ref={el => observerRefs.current[1] = el}
        className="py-24 bg-gray-50 opacity-0 translate-y-10 transition-all duration-1000 ease-out"
      >
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-gray-900 text-center mb-16">인기 공동구매</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {popularProducts.map((product, index) => (
              <div
                key={product.id}
                ref={el => observerRefs.current[index + 2] = el}
                className="bg-white rounded-2xl overflow-hidden shadow-lg opacity-0 translate-y-10 transition-all duration-1000 ease-out"
                style={{ transitionDelay: `${index * 200}ms` }}
              >
                <div className="aspect-w-16 aspect-h-9 relative">
                  <Image
                    src={product.image}
                    alt={product.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{product.title}</h3>
                  <p className="text-primary-600 font-medium mb-2">{product.price}</p>
                  <p className="text-gray-700">{product.participants}명 참여중</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div 
        ref={el => observerRefs.current[5] = el}
        className="py-24 opacity-0 translate-y-10 transition-all duration-1000 ease-out"
      >
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-gray-900 text-center mb-16">둥지마켓의 특징</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div 
              ref={el => observerRefs.current[6] = el}
              className="opacity-0 translate-y-10 transition-all duration-1000 ease-out"
              style={{ transitionDelay: '0ms' }}
            >
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">소비자 주도 공구</h3>
              <p className="text-gray-700">
                원하는 상품을 직접 제안하고, 판매자들의 다양한 입찰을 받아보세요.
                더 이상 판매자가 제시하는 상품만 기다리지 않아도 됩니다.
              </p>
            </div>
            <div 
              ref={el => observerRefs.current[7] = el}
              className="opacity-0 translate-y-10 transition-all duration-1000 ease-out"
              style={{ transitionDelay: '200ms' }}
            >
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">투명한 경매 시스템</h3>
              <p className="text-gray-700">
                판매자들의 입찰 내역을 실시간으로 확인하고, 투표를 통해
                최적의 조건을 선택할 수 있습니다.
              </p>
            </div>
            <div 
              ref={el => observerRefs.current[8] = el}
              className="opacity-0 translate-y-10 transition-all duration-1000 ease-out"
              style={{ transitionDelay: '400ms' }}
            >
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">신뢰할 수 있는 거래</h3>
              <p className="text-gray-700">
                페널티 시스템과 신뢰도 점수를 통해 안전하고 신뢰할 수 있는
                거래 환경을 제공합니다.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
