import ProductList from "@/components/shop/ProductList";

export const metadata = {
  title: "Shop | JAYEONBARAM",
  description: "자연바람의 모든 제품을 만나보세요",
};

export default function ShopPage() {
  return <ProductList categorySlug="all" categoryName="전체 상품" />;
}
