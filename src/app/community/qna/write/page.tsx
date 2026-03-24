'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import CommunitySidebar from '@/components/layout/CommunitySidebar';

interface Product {
  id: number;
  name: string;
  price: number;
  image_url: string;
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
    fetch('/api/get_products.php')
      .then(res => res.json())
      .then(result => {
        if (result.success) setProducts(result.data);
      });
  }, []);

  const handleProductToggle = (id: number) => {
    setSelectedProducts(prev => 
      prev.some(p => p.id === id) 
        ? prev.filter(p => p.id !== id) 
        : [...prev, { id, quantity: 1 }]
    );
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
            <div className="border-b border-gray-100 pb-8 mb-12">
              <h3 className="text-3xl font-serif font-bold text-[#0A3D2E] tracking-tight">상품 Q&A ✍️</h3>
              <p className="text-gray-400 mt-3 font-medium">상품에 궁금한 점을 작성해주세요.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-12">
              {/* Product Selection Button and List */}
              <div className="bg-gray-50 p-10 rounded-3xl">
                <label className="block text-[#0A3D2E] text-[16px] font-bold mb-4">대상 상품</label>
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(true)}
                  className="bg-white border-2 border-gray-200 px-6 py-3 rounded-xl font-bold text-[#0A3D2E] hover:border-[#0A3D2E] transition-all"
                >
                  상품 선택하기
                </button>
                
                {selectedProducts.length > 0 && (
                    <div className="mt-8 flex flex-col gap-3 border-t border-gray-100 pt-6">
                        <label className="text-gray-500 text-[13px] font-bold mb-2">선택된 상품 및 희망 구매 수량</label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {selectedProducts.map(sel => {
                                const p = products.find(prod => prod.id === sel.id);
                                return p ? (
                                    <div key={sel.id} className="flex flex-row items-center justify-between p-3 bg-white border border-[#0A3D2E]/20 rounded-xl shadow-sm">
                                        <div className="flex items-center gap-3">
                                          <img src={p.image_url} alt="" className="w-10 h-10 rounded object-cover" />
                                          <span className="text-[13px] font-bold text-gray-800 break-keep line-clamp-1">{p.name}</span>
                                        </div>
                                        <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-1 shrink-0">
                                            <button type="button" onClick={() => handleQuantityChange(sel.id, -1)} className="w-7 h-7 flex items-center justify-center bg-white border border-gray-200 rounded-md text-gray-500 hover:text-[#0A3D2E] font-bold shadow-sm">-</button>
                                            <span className="text-[13px] font-bold w-6 text-center">{sel.quantity}</span>
                                            <button type="button" onClick={() => handleQuantityChange(sel.id, 1)} className="w-7 h-7 flex items-center justify-center bg-white border border-gray-200 rounded-md text-gray-500 hover:text-[#0A3D2E] font-bold shadow-sm">+</button>
                                        </div>
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
                    className="w-full px-5 py-4 bg-gray-50 border border-transparent rounded-xl outline-none focus:border-[#0A3D2E] focus:bg-white transition-all text-sm font-medium"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-[#0A3D2E] text-[14px] font-bold mb-3">이메일 <span className="text-red-500">*</span></label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-5 py-4 bg-gray-50 border border-transparent rounded-xl outline-none focus:border-[#0A3D2E] focus:bg-white transition-all text-sm font-medium"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-[#0A3D2E] text-[14px] font-bold mb-3">연락처 <span className="text-red-500">*</span></label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-5 py-4 bg-gray-50 border border-transparent rounded-xl outline-none focus:border-[#0A3D2E] focus:bg-white transition-all text-sm font-medium"
                  />
                </div>

                {/* Title */}
                <div className="col-span-2">
                  <label className="block text-[#0A3D2E] text-[14px] font-bold mb-3">문의 제목 <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-5 py-4 bg-gray-50 border border-transparent rounded-xl outline-none focus:border-[#0A3D2E] focus:bg-white transition-all text-sm font-medium"
                  />
                </div>

                {/* Content */}
                <div className="col-span-2">
                  <label className="block text-[#0A3D2E] text-[14px] font-bold mb-3">문의 내용 <span className="text-red-500">*</span></label>
                  <textarea
                    rows={8}
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    className="w-full px-5 py-4 bg-gray-50 border border-transparent rounded-xl outline-none focus:border-[#0A3D2E] focus:bg-white transition-all text-sm font-medium"
                  />
                </div>

                {/* Private Checkbox & Password */}
                <div className="col-span-2 flex flex-col gap-4 p-6 bg-[#f2efe9] rounded-2xl border border-[#0A3D2E]/10">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="w-5 h-5 accent-[#0A3D2E]"
                      checked={formData.is_private}
                      onChange={(e) => setFormData({ ...formData, is_private: e.target.checked })}
                    />
                    <span className="font-bold text-[#0A3D2E]">비밀글로 문의하기</span>
                  </label>

                  {formData.is_private && (
                    <div className="mt-2 animate-fade-in">
                      <label className="block text-[#0A3D2E] text-[13px] font-bold mb-2">비밀번호 <span className="text-red-500">*</span></label>
                      <input
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        placeholder="비밀번호 설정"
                        maxLength={20}
                        className="w-[250px] px-4 py-3 bg-white border border-gray-200 rounded-lg outline-none focus:border-[#0A3D2E]"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-4 pt-10 border-t border-gray-100">
                <button
                    type="button"
                    onClick={() => router.back()}
                    className="flex-1 max-w-[200px] px-10 py-5 bg-white border-2 border-gray-100 text-[#0A3D2E] font-bold rounded-2xl hover:border-[#0A3D2E] transition-all tracking-wider uppercase"
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

      {/* Product Selection Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm shadow-2xl">
          <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden">
            <div className="py-6 px-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h4 className="text-xl font-bold text-[#0A3D2E]">대상 상품 선택 다중</h4>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-900 transition-colors w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-200">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-8 overflow-y-auto flex-1 custom-scrollbar">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {products.map(product => {
                  const isSelected = selectedProducts.some(p => p.id === product.id);
                  return (
                    <label 
                      key={product.id} 
                      className={`relative flex flex-col items-center p-4 border-2 rounded-2xl cursor-pointer transition-all hover:border-[#0A3D2E] group
                        ${isSelected ? 'border-[#0A3D2E] bg-white shadow-lg ring-4 ring-[#0A3D2E]/10' : 'border-gray-100 bg-white hover:shadow-md'}`}
                    >
                      <input 
                        type="checkbox" 
                        className="absolute top-4 right-4 w-5 h-5 accent-[#0A3D2E] cursor-pointer"
                        checked={isSelected}
                        onChange={() => handleProductToggle(product.id)}
                      />
                      <div className="w-24 h-24 mb-4 rounded-xl overflow-hidden bg-gray-50 border border-gray-100">
                        <img src={product.image_url} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      </div>
                      <div className="text-[13px] font-bold text-gray-800 text-center line-clamp-2 px-2 leading-relaxed">{product.name}</div>
                      <div className="text-[#0A3D2E] font-bold text-[12px] mt-2 bg-[#0A3D2E]/5 px-3 py-1 rounded-full">
                        ₩{product.price.toLocaleString()}
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="py-6 px-8 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="px-8 py-3 bg-white border border-gray-200 text-gray-700 font-bold justify-center rounded-xl hover:bg-gray-100 transition-colors"
              >
                선택 완료
              </button>
            </div>
          </div>
        </div>
      )}

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
