'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface BoardItem {
  id: number;
  title: string;
  name: string;
  date: string;
  hit: number;
}

interface Pagination {
  current_page: number;
  total_pages: number;
}

export default function NoticeList({ category }: { category: string }) {
  const [list, setList] = useState<BoardItem[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Search and Pagination States
  const [page, setPage] = useState(1);
  const [searchType, setSearchType] = useState('title');
  const [searchQuery, setSearchQuery] = useState('');
  // API 전송용 실제 검색값
  const [appliedSearch, setAppliedSearch] = useState({ type: '', query: '' });

  const fetchList = async () => {
    setLoading(true);
    try {
      let url = `/api/review_actions.php?action=get_reviews&page=${page}`;
      if (appliedSearch.query) {
        url += `&search_type=${appliedSearch.type}&search_query=${encodeURIComponent(appliedSearch.query)}`;
      }
      
      const res = await fetch(url);
      const result = await res.json();
      if (result.success) {
        setList(result.data);
        setPagination(result.pagination);
      }
    } catch (error) {
      console.error('Failed to load board list:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
  }, [category, page, appliedSearch]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1); // 검색 시 1페이지로 리셋
    setAppliedSearch({ type: searchType, query: searchQuery });
  };

  const handleReset = () => {
    setSearchQuery('');
    setSearchType('title');
    setPage(1);
    setAppliedSearch({ type: '', query: '' });
  };

  if (loading && list.length === 0) return (
    <div className="flex flex-col items-center py-40 gap-4">
        <div className="w-10 h-10 border-4 border-[#0A3D2E] border-t-transparent rounded-full animate-spin"></div>
        <div className="text-gray-400 font-medium">데이터를 불러오는 중입니다...</div>
    </div>
  );

  return (
    <div className="w-full font-sans">
      <table className="w-full border-t-2 border-[#0A3D2E] border-collapse text-[14px]">
        <thead>
          <tr className="bg-[#f8f9f8] text-[#0A3D2E] text-center border-b border-gray-200">
            <th className="py-4 px-2 w-[80px] font-bold">NO</th>
            <th className="py-4 px-2 font-bold uppercase tracking-wider">TITLE</th>
            <th className="py-4 px-2 w-[120px] font-bold">NAME</th>
            <th className="py-4 px-2 w-[120px] font-bold">DATE</th>
            <th className="py-4 px-2 w-[100px] font-bold">HIT</th>
          </tr>
        </thead>
        <tbody className="text-center">
          {list.length > 0 ? (
            list.map((item) => (
              <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors group">
                <td className="py-5 text-gray-400 font-medium">{item.id}</td>
                <td className="py-5 text-left px-4">
                  <Link href={`/community/${category}/${item.id}`} className="hover:text-[#0A3D2E] font-medium overflow-hidden whitespace-nowrap text-ellipsis block transition-colors">
                    {item.title}
                  </Link>
                </td>
                <td className="py-5 text-gray-600">{item.name}</td>
                <td className="py-5 text-gray-400">{item.date}</td>
                <td className="py-5 text-gray-400 font-mono tracking-tighter">{item.hit}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={5} className="py-32 text-gray-400">
                <p className="text-lg mb-2">검색 결과가 없습니다.</p>
                <button 
                    onClick={handleReset}
                    className="text-[#0A3D2E] underline font-bold"
                >
                    전체 리스트 보기
                </button>
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Pagination & Search Area */}
      <div className="mt-12 flex flex-col items-center">
        {/* Pagination Dots/Numbers */}
        <div className="flex gap-2">
            {pagination && pagination.total_pages > 0 && [...Array(pagination.total_pages)].map((_, i) => (
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

        {/* Search Bar UI */}
        <div className="w-full flex flex-col md:flex-row justify-between items-center py-10 border-t border-gray-100 mt-12 gap-6">
            <form onSubmit={handleSearch} className="flex gap-2 border border-gray-200 p-1 rounded-xl bg-white shadow-sm overflow-hidden focus-within:border-[#0A3D2E] transition-all">
                <select 
                    value={searchType}
                    onChange={(e) => setSearchType(e.target.value)}
                    className="bg-transparent px-4 text-[13px] border-none focus:ring-0 outline-none text-gray-600 font-bold"
                >
                    <option value="title">제목</option>
                    <option value="content">내용</option>
                    <option value="author">글쓴이</option>
                </select>
                <div className="w-px h-6 bg-gray-100 self-center"></div>
                <input 
                    type="text" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-transparent px-4 py-3 text-[13px] w-[280px] outline-none placeholder:text-gray-300" 
                    placeholder="검색어를 입력해 주세요." 
                />
                <button 
                    type="submit"
                    className="bg-[#0A3D2E] text-white px-8 py-2 text-[13px] font-bold rounded-lg hover:bg-[#00331d] transition-all tracking-widest uppercase"
                >
                    Find
                </button>
            </form>
            
            <div className="flex gap-4">
                {appliedSearch.query && (
                    <button 
                        onClick={handleReset}
                        className="bg-gray-100 px-6 py-3 text-[13px] text-gray-500 hover:bg-gray-200 transition-all font-bold rounded-lg"
                    >
                        RESET
                    </button>
                )}
                <Link href={`/community/${category}`} className="bg-white border-2 border-gray-200 px-8 py-3 text-[13px] text-gray-800 hover:border-[#0A3D2E] hover:text-[#0A3D2E] transition-all font-bold rounded-lg uppercase tracking-tight">
                    All List
                </Link>
                {category === 'review' && (
                    <Link href={`/community/${category}/write`} className="bg-[#0A3D2E] text-white px-10 py-3 text-[13px] font-bold rounded-lg hover:bg-[#00331d] transition-all shadow-lg shadow-[#0A3D2E]/20 uppercase tracking-widest">
                        Write
                    </Link>
                )}
            </div>
        </div>
      </div>
    </div>
  );
}

