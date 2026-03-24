import ProductList from "@/components/shop/ProductList";

export const metadata = {
  title: "웨이브펌 | JAYEONBARAM",
  description: "자연바람의 프리미엄 웨이브펌 라인업",
};

export default function WavePermPage() {
  return <ProductList categorySlug="wave-perm" categoryName="웨이브펌" />;
}
