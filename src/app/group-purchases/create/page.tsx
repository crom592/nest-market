import CreateGroupPurchaseForm from '@/components/group-purchase/CreateGroupPurchaseForm';

export default function CreateGroupPurchasePage() {
  return (
    <div className="container mx-auto px-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">새로운 공구 만들기</h1>
          <p className="mt-2 text-gray-600">
            원하는 상품이나 서비스에 대한 공구를 만들어보세요.
            판매자들이 입찰을 통해 최적의 조건을 제시할 것입니다.
          </p>
        </div>
        <CreateGroupPurchaseForm />
      </div>
    </div>
  );
}
