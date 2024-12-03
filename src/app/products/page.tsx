import ProductList from '@/components/ProductList';

export default function ProductsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">상품 목록</h1>
      <ProductList />
    </div>
  );
}
