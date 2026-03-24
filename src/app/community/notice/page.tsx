import CommunitySidebar from '@/components/layout/CommunitySidebar';
import NoticeList from '@/components/community/NoticeList';

export default function NoticePage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-6 py-[120px]">
        <div className="flex flex-col md:flex-row gap-[80px]">
          {/* Sidebar */}
          <CommunitySidebar />

          {/* Content Area */}
          <div className="flex-1">
            <div className="border-b border-gray-100 pb-8 mb-12 flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <h3 className="text-3xl font-serif font-bold text-gray-900 tracking-tight">공지사항</h3>
                <p className="text-gray-400 mt-3 font-medium">자연바람의 새로운 소식과 안내사항을 전달해 드립니다.</p>
              </div>
            </div>

            {/* List Table */}
            <NoticeList category="notice" />
          </div>
        </div>
      </div>
    </div>
  );
}
