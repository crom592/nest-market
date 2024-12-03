'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

type GroupPurchase = {
  id: string;
  title: string;
  description: string;
  currentPrice: number;
  minMembers: number;
  maxMembers: number;
  imageUrl: string;
  endDate: string;
  category: string;
  status: string;
  createdAt: string;
};

type ApiResponse = {
  products: GroupPurchase[];
  error?: string;
};

export default function ProductList() {
  const [products, setProducts] = useState<GroupPurchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/products');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: ApiResponse = await response.json();
        if (data.error) {
          throw new Error(data.error);
        }
        setProducts(data.products);
        setError(null);
      } catch (error) {
        console.error('Failed to fetch products:', error);
        setError('상품 목록을 불러오는데 실패했습니다. 잠시 후 다시 시도해주세요.');
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <p className="text-gray-500">현재 진행중인 공동구매가 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {products.map((product) => (
        <div
          key={product.id}
          className="bg-white/5 backdrop-blur-md rounded-xl overflow-hidden hover:transform hover:scale-[1.02] transition-all duration-300 border border-white/10 group"
        >
          <div className="relative h-48">
            <Image
              src={product.imageUrl || '/placeholder.jpg'}
              alt={product.title}
              fill
              className="object-cover"
            />
          </div>
          <div className="p-4">
            <h3 className="text-lg font-semibold mb-2 text-white/90">{product.title}</h3>
            <p className="text-sm text-white/60 mb-4">{product.description}</p>
            <div className="flex justify-between items-center">
              <span className="text-pink-500 font-bold">
                {product.currentPrice.toLocaleString()}원
              </span>
              <span className="text-sm text-white/60">
                {product.minMembers}명 구매 진행중
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
