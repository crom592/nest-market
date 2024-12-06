'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import HeroSection from '@/components/hero/HeroSection';

export default function Home() {
  const observerRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const observers = observerRefs.current.map((ref) => {
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
      image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1026&q=80",
      price: "2,500,000원부터",
      participants: 128
    },
    {
      id: 2,
      title: "다이슨 에어랩 공동구매",
      image: "https://images.unsplash.com/photo-1522338140262-f46f5913618a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=988&q=80",
      price: "450,000원부터",
      participants: 256
    }
  ];

  return (
    <div className="min-h-screen">
      <HeroSection />
      
      <section className="py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">인기 공동구매</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {popularProducts.map((product, index) => (
              <div
                key={product.id}
                ref={(el) => (observerRefs.current[index] = el)}
                className="bg-white rounded-lg shadow-lg overflow-hidden opacity-0 translate-y-10 transition-all duration-700 ease-out"
              >
                <div className="relative h-64">
                  <Image
                    src={product.image}
                    alt={product.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-2">{product.title}</h3>
                  <p className="text-gray-600 mb-4">{product.price}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">
                      {product.participants}명 참여중
                    </span>
                    <Link
                      href={`/group-purchases/${product.id}`}
                      className="text-indigo-600 hover:text-indigo-500"
                    >
                      자세히 보기 →
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
