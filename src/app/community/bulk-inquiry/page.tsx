'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import CommunitySidebar from '@/components/layout/CommunitySidebar';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

interface BulkInquiryItem {
  id: number;
  title: string;
  author: string;
  created_at: string;
}

export default function BulkInquiryPage() {
  const [list, setList] = useState<BulkInquiryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ current_page: 1, total_pages: 1 });

  const fetchList = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/get_bulk_inquiries.php?page=${page}`);
      const result = await res.json();
      if (result.success) {
        setList(result.data);
        setPagination(result.pagination);
      }
    } catch (error) {
      console.error('Failed to load bulk inquiry list:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
  }, [page]);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-white">
        <div className="container mx-auto px-6 py-[120px]">
          <div className="flex flex-col md:flex-row gap-[80px]">
            <CommunitySidebar />

            <div className="flex-1 font-sans">
              <div className="border-b border-gray-100 pb-8 mb-12 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                  <h3 className="text-3xl font-serif font-bold text-[#0A3D2E] tracking-tight">단체/대량구매 문의</h3>
                  <p className="text-gray-400 mt-3 font-medium">자연바람의 대량구매 및 단체 주문 상담 서비스입니다.</p>
                </div>
              </div>

              <table className="w-full border-t-2 border-[#0A3D2E] border-collapse text-[14px]">
                <thead>
                  <tr className="bg-[#f8f9f8] text-[#0A3D2E] text-center border-b border-gray-200">
                    <th className="py-4 px-2 w-[80px] font-bold uppercase">NO</th>
                    <th className="py-4 px-2 font-bold uppercase tracking-wider text-left pl-10">TITLE</th>
                    <th className="py-4 px-2 w-[120px] font-bold uppercase">NAME</th>
                    <th className="py-4 px-2 w-[120px] font-bold uppercase">DATE</th>
                  </tr>
                </thead>
                <tbody className="text-center">
                  {loading ? (
                    <tr><td colSpan={4} className="py-20 text-gray-400">불러오는 중...</td></tr>
                  ) : list.length > 0 ? (
                    list.map((item) => (
                      <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors group cursor-pointer">
                        <td className="py-5 text-gray-400 font-medium">{item.id}</td>
                        <td className="py-5 text-left px-10">
                          <span className="font-medium text-gray-800 hover:text-[#0A3D2E] transition-colors">{item.title}</span>
                        </td>
                        <td className="py-5 text-gray-600">{item.author}</td>
                        <td className="py-5 text-gray-400">{item.created_at.slice(0, 10)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan={4} className="py-32 text-gray-400 font-medium text-lg">등록된 문의사항이 없습니다.</td></tr>
                  )}
                </tbody>
              </table>

              <div className="mt-12 flex flex-col items-center">
                <div className="flex gap-2">
                  {[...Array(pagination.total_pages)].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setPage(i + 1)}
                      className={`w-10 h-10 border rounded flex items-center justify-center text-[14px] font-bold transition-all
                        ${(page === i + 1) 
                          ? 'bg-[#0A3D2E] text-white border-[#0A3D2E] shadow-lg shadow-[#0A3D2E]/20' 
                          : 'bg-white text-gray-400 border-gray-200 hover:border-[#0A3D2E] hover:text-[#0A3D2E]'}`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>

                <div className="w-full flex justify-end py-10 border-t border-gray-100 mt-12">
                  <Link 
                    href="/community/bulk-inquiry/write" 
                    className="bg-[#0A3D2E] text-white px-10 py-3 text-[13px] font-bold rounded-lg hover:bg-[#00331d] transition-all shadow-lg shadow-[#0A3D2E]/20 uppercase tracking-widest"
                  >
                    Write
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
