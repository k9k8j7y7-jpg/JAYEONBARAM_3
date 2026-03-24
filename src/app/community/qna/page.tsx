import CommunitySidebar from '@/components/layout/CommunitySidebar';
import QnAList from '@/components/community/QnAList';

export default function QnAPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-6 py-[120px]">
        <div className="flex flex-col md:flex-row gap-[80px]">
          {/* Sidebar */}
          <CommunitySidebar />

          {/* Content Area */}
          <div className="flex-1 w-full max-w-full overflow-hidden">
            <div className="border-b border-gray-100 pb-8 mb-12 flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <h3 className="text-3xl font-serif font-bold text-gray-900 tracking-tight">상품 Q&A</h3>
                <p className="text-gray-400 mt-3 font-medium">상품에 대한 문의를 남겨주시면 정성껏 답변해 드립니다.</p>
              </div>
            </div>

            {/* List Component */}
            <QnAList />
          </div>
        </div>
      </div>
    </div>
  );
}
