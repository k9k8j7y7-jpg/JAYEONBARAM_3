import ProductList from "@/components/shop/ProductList";

export const metadata = {
  title: "클렌징 | JAYEONBARAM",
  description: "자연바람의 프리미엄 클렌징 라인업",
};

export default function CleansingPage() {
  return <ProductList categorySlug="cleansing" categoryName="클렌징" />;
}
