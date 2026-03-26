'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import CommunitySidebar from '@/components/layout/CommunitySidebar';
import ProductSelectModal from '@/components/community/ProductSelectModal';
import { X, Plus } from 'lucide-react';

interface Product {
  id: number;
  name: string;
  price: number;
  image_url: string;
  description?: string;
}

export default function QnAWritePage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<{id: number, quantity: number}[]>([]);
  
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    author: '',
    email: '',
    phone: '',
    title: '',
    content: '',
    password: '',
    is_private: false,
  });

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetch('/admin_products.php?action=get_products')
      .then(res => res.json())
      .then(result => {
        if (result.success) setProducts(result.data);
      });
  }, []);

  const handleProductSelect = (selectedIds: number[]) => {
    // 단일 선택 모드: 가장 마지막에 선택된 ID만 유지 (일반적으로 1개만 들어옴)
    const lastId = selectedIds[selectedIds.length - 1];
    if (lastId) {
      setSelectedProducts([{ id: lastId, quantity: 1 }]);
    } else {
      setSelectedProducts([]);
    }
  };

  const handleRemoveProduct = (id: number) => {
    setSelectedProducts(prev => prev.filter(p => p.id !== id));
  };

  const handleQuantityChange = (id: number, delta: number) => {
    setSelectedProducts(prev => prev.map(p => {
      if (p.id === id) {
        return { ...p, quantity: Math.max(1, p.quantity + delta) };
      }
      return p;
    }));
  };

  const isFormValid = 
    formData.author && 
    formData.email && 
    formData.phone && 
    formData.title && 
    formData.content && 
    (!formData.is_private || formData.password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;

    setIsLoading(true);
    try {
      const payload = new URLSearchParams({
        action: 'save_qna',
        author: formData.author,
        email: formData.email,
        phone: formData.phone,
        title: formData.title,
        content: formData.content,
        password: formData.password,
        is_private: formData.is_private ? 'true' : 'false',
        product_ids: JSON.stringify(selectedProducts),
      });

      const res = await fetch('/admin_products.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: payload
      });

      const result = await res.json();
      if (result.success) {
        alert('문의가 등록되었습니다.');
        router.push('/community/qna');
      } else {
        alert('오류가 발생했습니다: ' + result.message);
      }
    } catch (error) {
      alert('문의 제출에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-6 py-[120px]">
        <div className="flex flex-col md:flex-row gap-[80px]">
          <CommunitySidebar />

          <div className="flex-1 font-sans">
            <div className="border-b border-gray-100 pb-8 mb-12 flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <h3 className="text-3xl font-serif font-bold text-[#0A3D2E] tracking-tight">상품 Q&A ✍️</h3>
                <p className="text-gray-400 mt-3 font-medium">상품에 궁금한 점을 작성해주세요.</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-12">
              <div className="bg-gray-50 p-10 rounded-3xl">
                <label className="block text-[#0A3D2E] text-[16px] font-bold mb-6">대상 상품</label>
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(true)}
                  className="bg-white border-2 border-gray-100 px-8 py-4 rounded-2xl font-bold text-[#0A3D2E] hover:border-[#0A3D2E] hover:bg-[#0A3D2E]/5 transition-all flex items-center gap-3 shadow-sm group"
                >
                  <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                  상품 선택하기
                </button>
                
                {selectedProducts.length > 0 && (
                  <div className="mt-8 flex flex-col gap-4 border-t border-gray-100 pt-8">
                    <label className="text-gray-400 text-[12px] font-bold uppercase tracking-widest">Selected Product</label>
                    <div className="grid grid-cols-1 gap-4">
                      {selectedProducts.map(sel => {
                        const p = products.find(prod => prod.id === sel.id);
                        return p ? (
                          <div key={sel.id} className="flex flex-row items-center justify-between p-5 bg-white border border-[#0A3D2E]/10 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-center gap-6 min-w-0">
                              <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 border border-gray-100">
                                <img src={p.image_url} alt="" className="w-full h-full object-cover" />
                              </div>
                              <div className="min-w-0">
                                <span className="block text-[17px] font-bold text-gray-900 truncate">{p.name}</span>
                                <span className="text-[13px] text-[#0A3D2E] font-bold mt-1 inline-block">₩{p.price.toLocaleString()}</span>
                              </div>
                            </div>
                            <button 
                              type="button" 
                              onClick={() => handleRemoveProduct(sel.id)} 
                              className="w-10 h-10 flex items-center justify-center bg-gray-50 border border-transparent rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all font-bold group"
                            >
                              <X size={20} className="group-hover:rotate-90 transition-transform" />
                            </button>
                          </div>
                        ) : null;
                      })}
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Author */}
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-[#0A3D2E] text-[14px] font-bold mb-3">작성자 성함 <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={formData.author}
                    onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                    className="w-full px-5 py-4 bg-gray-50 border border-transparent rounded-xl outline-none focus:border-[#0A3D2E] focus:bg-white transition-all text-sm font-medium shadow-inner"
                  />
                </div>

                {/* Email */}
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-[#0A3D2E] text-[14px] font-bold mb-3">이메일 <span className="text-red-500">*</span></label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-5 py-4 bg-gray-50 border border-transparent rounded-xl outline-none focus:border-[#0A3D2E] focus:bg-white transition-all text-sm font-medium shadow-inner"
                  />
                </div>

                {/* Phone */}
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-[#0A3D2E] text-[14px] font-bold mb-3">연락처 <span className="text-red-500">*</span></label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-5 py-4 bg-gray-50 border border-transparent rounded-xl outline-none focus:border-[#0A3D2E] focus:bg-white transition-all text-sm font-medium shadow-inner"
                  />
                </div>

                {/* Title */}
                <div className="col-span-2">
                  <label className="block text-[#0A3D2E] text-[14px] font-bold mb-3">문의 제목 <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-5 py-4 bg-gray-50 border border-transparent rounded-xl outline-none focus:border-[#0A3D2E] focus:bg-white transition-all text-sm font-medium shadow-inner"
                  />
                </div>

                {/* Content */}
                <div className="col-span-2">
                  <label className="block text-[#0A3D2E] text-[14px] font-bold mb-3">문의 내용 <span className="text-red-500">*</span></label>
                  <textarea
                    rows={8}
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    className="w-full px-5 py-4 bg-gray-50 border border-transparent rounded-xl outline-none focus:border-[#0A3D2E] focus:bg-white transition-all text-sm font-medium shadow-inner resize-none"
                  />
                </div>

                {/* Private Checkbox & Password */}
                <div className="col-span-2 flex flex-col gap-4 p-8 bg-[#f2efe9] rounded-3xl border border-[#0A3D2E]/5 shadow-sm">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input 
                      type="checkbox" 
                      className="w-6 h-6 accent-[#0A3D2E] cursor-pointer"
                      checked={formData.is_private}
                      onChange={(e) => setFormData({ ...formData, is_private: e.target.checked })}
                    />
                    <span className="font-bold text-[#0A3D2E] group-hover:text-[#004d33] transition-colors">비밀글로 문의하기</span>
                  </label>

                  {formData.is_private && (
                    <div className="mt-2 animate-fade-in pl-9">
                      <label className="block text-[#0A3D2E] text-[13px] font-bold mb-2">비밀번호 <span className="text-red-500">*</span></label>
                      <input
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        placeholder="비밀번호 설정"
                        maxLength={20}
                        className="w-[280px] px-5 py-4 bg-white border border-gray-200 rounded-xl outline-none focus:border-[#0A3D2E] shadow-sm"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-4 pt-10 border-t border-gray-100">
                <button
                    type="button"
                    onClick={() => router.back()}
                    className="flex-1 max-w-[200px] px-10 py-5 bg-white border-2 border-gray-100 text-[#0A3D2E] font-bold rounded-2xl hover:border-[#0A3D2E] transition-all tracking-wider uppercase shadow-sm"
                >
                    Cancel
                </button>
                <button
                  type="submit"
                  disabled={!isFormValid || isLoading}
                  className={`flex-1 px-10 py-5 font-bold rounded-2xl transition-all tracking-widest uppercase shadow-xl
                    ${isFormValid && !isLoading 
                      ? 'bg-[#0A3D2E] text-white hover:bg-[#00331d] shadow-[#0A3D2E]/20' 
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'}`}
                >
                  {isLoading ? 'Sending...' : 'Register QnA'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <ProductSelectModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelect={handleProductSelect}
        initialSelected={selectedProducts.map(p => p.id)}
        multiple={false}
      />

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
        .animate-fade-in {
          animation: fadeIn 0.3s ease-in-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-5px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
