import CommunitySidebar from '@/components/layout/CommunitySidebar';
import PostDetail from '@/components/community/PostDetail';

export async function generateStaticParams() {
  try {
    const res = await fetch('http://localhost:8000/api/board_list.php?category=review');
    const result = await res.json();
    return result.data.map((item: { id: number }) => ({ id: item.id.toString() }));
  } catch (error) {
    console.warn("Failed to generate static params for review, using dummy IDs:", error);
    return [1, 2, 3].map(id => ({ id: id.toString() }));
  }
}

export default async function ReviewDetailPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-6 py-[120px]">
        <div className="flex flex-col md:flex-row gap-[80px]">
          {/* Sidebar */}
          <CommunitySidebar />

          {/* Content Area */}
          <div className="flex-1">
            <PostDetail id={params.id} category="review" />
          </div>
        </div>
      </div>
    </div>
  );
}
