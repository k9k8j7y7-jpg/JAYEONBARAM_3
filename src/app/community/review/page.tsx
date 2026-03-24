import CommunitySidebar from '@/components/layout/CommunitySidebar';
import NoticeList from '@/components/community/NoticeList';

export default function ReviewPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section or Breadcrumb can be added here if needed */}
      <div className="container mx-auto px-6 py-[120px]">
        <div className="flex flex-col md:flex-row gap-[80px]">
          {/* Sidebar */}
          <CommunitySidebar />

          {/* Content Area */}
          <div className="flex-1">
            <div className="border-b border-gray-100 pb-8 mb-12 flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <h3 className="text-3xl font-serif font-bold text-[#0A3D2E] tracking-tight">상품사용후기</h3>
                <p className="text-gray-400 mt-3 font-medium">자연바람 제품을 사용해보신 고객님들의 소중한 후기입니다.</p>
              </div>
            </div>

            {/* List Table */}
            <NoticeList category="review" />
          </div>
        </div>
      </div>
    </div>
  );
}
