'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface QnAItem {
  id: number;
  product_id: string; // JSON string
  title: string;
  author: string;
  is_private: number;
  status: string;
  views: number;
  created_at: string;
  answers?: { content: string, created_at: string }[];
}

interface Pagination {
  current_page: number;
  total_pages: number;
  total_items: number;
}

export default function QnAList() {
  const [list, setList] = useState<QnAItem[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Search and Pagination States
  const [page, setPage] = useState(1);
  const [searchType, setSearchType] = useState('title');
  const [searchQuery, setSearchQuery] = useState('');
  // API 전송용 실제 검색값
  const [appliedSearch, setAppliedSearch] = useState({ type: '', query: '' });

  // Password Modal for private posts
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [selectedQnAId, setSelectedQnAId] = useState<number | null>(null);
  const [passwordInput, setPasswordInput] = useState('');
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [expandedContent, setExpandedContent] = useState<any>(null);

  const fetchList = async () => {
    setLoading(true);
    try {
      let url = `/admin_products.php?action=get_qna_list&page=${page}`;
      if (appliedSearch.query) {
        url += `&search=${encodeURIComponent(appliedSearch.query)}`;
      }
      
      const res = await fetch(url);
      const result = await res.json();
      if (result.success) {
        setList(result.data);
        setPagination(result.pagination);
      }
    } catch (error) {
      console.error('Failed to load QnA list:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
  }, [page, appliedSearch]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setAppliedSearch({ type: searchType, query: searchQuery });
  };

  const handleReset = () => {
    setSearchQuery('');
    setSearchType('title');
    setPage(1);
    setAppliedSearch({ type: '', query: '' });
  };

  const handleTitleClick = async (item: QnAItem) => {
    if (expandedId === item.id) {
      setExpandedId(null);
      return;
    }

    if (item.is_private === 1) {
      setSelectedQnAId(item.id);
      setShowPasswordModal(true);
    } else {
      // Public view
      try {
        const res = await fetch(`/admin_products.php?action=view_qna&id=${item.id}`);
        const result = await res.json();
        if (result.success) {
          setExpandedId(item.id);
          setExpandedContent(result.data);
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handlePasswordSubmit = async () => {
    if (!selectedQnAId || !passwordInput) return;
    
    try {
      const res = await fetch('/admin_products.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          action: 'check_qna_auth',
          id: selectedQnAId.toString(),
          password: passwordInput,
        })
      });
      const result = await res.json();
      if (result.success) {
        setExpandedId(selectedQnAId);
        setExpandedContent(result.data);
        setShowPasswordModal(false);
        setPasswordInput('');
      } else {
        alert(result.message || '비밀번호가 일치하지 않습니다.');
      }
    } catch(err) {
       console.error(err);
    }
  };

  if (loading && list.length === 0) return (
    <div className="flex flex-col items-center py-40 gap-4">
        <div className="w-10 h-10 border-4 border-[#0A3D2E] border-t-transparent rounded-full animate-spin"></div>
        <div className="text-gray-400 font-medium">데이터를 불러오는 중입니다...</div>
    </div>
  );

  return (
    <div className="w-full font-sans">
      <table className="w-full text-[14px] border-t border-[#dfdfdf]">
        <thead>
          <tr className="bg-[#f2efe9] text-[#555] text-center border-b border-[#dfdfdf]">
            <th className="py-4 px-2 w-[80px] font-normal">번호</th>
            <th className="py-4 px-2 font-normal">제목</th>
            <th className="py-4 px-2 w-[120px] font-normal">작성자</th>
            <th className="py-4 px-2 w-[120px] font-normal">작성일</th>
            <th className="py-4 px-2 w-[80px] font-normal">조회</th>
          </tr>
        </thead>
        <tbody className="text-center">
          {list.length > 0 ? (
            list.map((item, idx) => {
              const displayId = pagination ? pagination.total_items - ((pagination.current_page - 1) * 10) - idx : item.id;
              const hasAnswer = item.status === 'answered' || (item.answers && item.answers.length > 0);
              return (
                <tr key={item.id} className="border-b border-[#f1f1f1] hover:bg-[#fafafa] transition-colors group">
                  <td className="py-5 text-gray-500">{displayId}</td>
                  <td className="py-5 text-left px-4">
                    <button 
                      onClick={() => handleTitleClick(item)}
                      className="hover:text-[#0A3D2E] font-medium flex items-center gap-2"
                    >
                      {item.is_private === 1 && (
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      )}
                      {item.title}
                      {hasAnswer && (
                        <span className="text-[10px] bg-[#0A3D2E] text-white px-2 py-0.5 rounded ml-1 font-bold">RE</span>
                      )}
                    </button>
                    {expandedId === item.id && expandedContent && (
                      <div className="mt-4 p-4 bg-[#f8f9f8] text-sm text-gray-700 whitespace-pre-wrap rounded">
                        <div className="mb-4 pb-4 border-b border-gray-200">
                          <strong>Q: </strong>{expandedContent.content}
                        </div>
                        {expandedContent.answers && expandedContent.answers.map((ans: any, i:number) => (
                          <div key={i} className="mt-2 text-[#0A3D2E]">
                            <strong>A: </strong>{ans.content}
                          </div>
                        ))}
                      </div>
                    )}
                  </td>
                  <td className="py-5 text-gray-600">
                    {item.author.length > 1 
                      ? item.author.substring(0, 1) + '***' 
                      : item.author}
                  </td>
                  <td className="py-5 text-gray-400">{item.created_at.substring(0, 10)}</td>
                  <td className="py-5 text-gray-400">{item.views}</td>
                </tr>
              )
            })
          ) : (
            <tr>
              <td colSpan={5} className="py-32 text-gray-400">
                <p className="text-lg mb-2">등록된 문의가 없습니다.</p>
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
                    className={`w-8 h-8 flex items-center justify-center text-[13px] font-bold transition-all
                        ${(page === i + 1) 
                            ? 'text-[#0A3D2E] border-b-2 border-[#0A3D2E]' 
                            : 'text-gray-400 hover:text-[#0A3D2E]'}`}
                >
                    {i + 1}
                </button>
            ))}
        </div>

        {/* Search Bar UI */}
        <div className="w-full flex justify-between items-center mt-12 gap-6 bg-[#f2efe9] p-4">
            <div className="flex items-center gap-4">
                <form onSubmit={handleSearch} className="flex gap-2 bg-white">
                    <input 
                        type="text" 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="px-4 py-2 text-[13px] w-[200px] outline-none border border-[#e5e5e5] placeholder:text-gray-300"
                        placeholder="검색어 입력"
                    />
                    <button 
                        type="submit"
                        className="bg-[#e5e5e5] text-[#555] px-6 py-2 text-[13px] font-bold transition-colors hover:bg-[#d4d4d4]"
                    >
                        찾기
                    </button>
                </form>
            </div>
            
            <Link href={`/community/qna/write`} className="bg-[#0A3D2E] text-white px-8 py-2 text-[13px] font-bold hover:bg-[#00331d] transition-all uppercase">
                글쓰기
            </Link>
        </div>
      </div>

      {/* Passsword Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-xl w-[400px]">
            <h3 className="text-xl font-bold text-[#0A3D2E] mb-4">비밀번호 확인</h3>
            <p className="text-sm text-gray-500 mb-6">비밀글입니다. 작성 시 입력한 비밀번호를 입력해주세요.</p>
            <input 
              type="password" 
              value={passwordInput}
              onChange={e => setPasswordInput(e.target.value)}
              className="w-full border border-gray-300 rounded px-4 py-3 mb-6 focus:outline-none focus:border-[#0A3D2E]"
              placeholder="비밀번호"
            />
            <div className="flex gap-2 justify-end">
              <button 
                onClick={() => { setShowPasswordModal(false); setPasswordInput(''); }}
                className="px-4 py-2 text-gray-500 bg-gray-100 rounded hover:bg-gray-200 font-bold text-sm"
              >
                취소
              </button>
              <button 
                onClick={handlePasswordSubmit}
                className="px-4 py-2 bg-[#0A3D2E] text-white rounded hover:bg-[#00331d] font-bold text-sm"
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
