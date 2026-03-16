import ProductList from "@/components/shop/ProductList";

export const metadata = {
  title: "트리트먼트 | JAYEONBARAM",
  description: "자연바람의 프리미엄 트리트먼트 라인업",
};

export default function TreatmentPage() {
  return <ProductList categorySlug="treatment" categoryName="트리트먼트" />;
}
