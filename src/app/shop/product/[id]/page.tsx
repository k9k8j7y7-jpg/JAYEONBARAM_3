import ProductDetailClient from "./ProductDetailClient";
import { API_URL } from "@/lib/utils";

// Static param generation for static export
export async function generateStaticParams() {
  try {
    const response = await fetch(`${API_URL}/get_products.php?category=all`);
    if (!response.ok) throw new Error("Fetch failed");
    const products = await response.json();

    return products.map((product: { id: number }) => ({
      id: product.id.toString(),
    }));
  } catch (error) {
    console.warn("Failed to generate static params, using dummy data for build:", error);
    // Return dummy IDs to allow the build to proceed and pages to be generated
    return [1, 2, 3, 4, 5].map(id => ({ id: id.toString() }));
  }
}

const Page = async (props: { params: Promise<{ id: string }> }) => {
  const params = await props.params;
  const { id } = params;

  return <ProductDetailClient id={id} />;
};

export default Page;
