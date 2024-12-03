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
};

export default function ProductList() {
  const [products, setProducts] = useState<GroupPurchase[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/products');
        const data = await response.json();
        setProducts(data);
      } catch (error) {
        console.error('Failed to fetch products:', error);
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

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {products.map((product) => (
        <div
          key={product.id}
          className="bg-white/5 backdrop-blur-md rounded-xl overflow-hidden hover:transform hover:scale-[1.02] transition-all duration-300 border border-white/10 group"
        >
          <div className="relative h-48 w-full overflow-hidden">
            <Image
              src={product.imageUrl}
              alt={product.title}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-300"
            />
            <div className="absolute top-2 right-2 bg-pink-500 text-white px-2 py-1 rounded-full text-sm">
              {product.category}
            </div>
          </div>
          
          <div className="p-6">
            <h2 className="text-xl font-bold mb-2 text-white group-hover:text-pink-400 transition-colors">
              {product.title}
            </h2>
            <p className="text-gray-300 text-sm mb-4">{product.description}</p>
            
            <div className="flex justify-between items-end">
              <div>
                <p className="text-pink-400 font-semibold text-lg">
                  {product.currentPrice.toLocaleString()}원
                </p>
                <p className="text-gray-400 text-sm">
                  참여인원: {product.minMembers}/{product.maxMembers}명
                </p>
              </div>
              <button className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-lg transition-colors">
                참여하기
              </button>
            </div>

            <div className="mt-4 text-sm text-gray-400">
              마감일: {new Date(product.endDate).toLocaleDateString()}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
