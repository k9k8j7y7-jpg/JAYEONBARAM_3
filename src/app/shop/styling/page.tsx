import ProductList from "@/components/shop/ProductList";

export const metadata = {
  title: "스타일링 | JAYEONBARAM",
  description: "자연바람의 프리미엄 스타일링 라인업",
};

export default function StylingPage() {
  return <ProductList categorySlug="styling" categoryName="스타일링" />;
}
