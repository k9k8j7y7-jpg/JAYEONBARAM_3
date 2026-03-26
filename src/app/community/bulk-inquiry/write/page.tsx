'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import CommunitySidebar from '@/components/layout/CommunitySidebar';
import ProductSelectModal from '@/components/community/ProductSelectModal';
import { X, Plus, ShoppingBag } from 'lucide-react';

interface Product {
  id: number;
  name: string;
  price: number;
  image_url: string;
}

export default function BulkInquiryWritePage() {
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
  });

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetch('/api/get_products.php')
      .then(res => res.json())
      .then(result => {
        if (result.success) setProducts(result.data);
      });
  }, []);

  const handleProductSelect = (selectedIds: number[]) => {
    setSelectedProducts(prev => {
      const next = selectedIds.map(id => {
        const existing = prev.find(p => p.id === id);
        return existing || { id, quantity: 1 };
      });
      return next;
    });
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
    selectedProducts.length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;

    setIsLoading(true);
    try {
      const res = await fetch('/api/save_bulk_inquiry.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          product_ids: selectedProducts,
          quantity: selectedProducts.reduce((sum, p) => sum + p.quantity, 0),
        }),
      });

      const result = await res.json();
      if (result.success) {
        alert('단체/대량구매 문의가 접수되었습니다.');
        router.push('/community/bulk-inquiry');
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
                <h3 className="text-3xl font-serif font-bold text-[#0A3D2E] tracking-tight">단체/대량구매 문의 🤝</h3>
                <p className="text-gray-400 mt-3 font-medium">자연바람의 대량구매 및 단체 주문 상담 서비스입니다.</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-12">
              {/* Product Selection Section */}
              <div className="bg-gray-50 p-10 rounded-3xl">
                <label className="block text-[#0A3D2E] text-[16px] font-bold mb-6">대상 상품 선택 (다중 선택 가능) <span className="text-red-500">*</span></label>
                
                {!selectedProducts.length ? (
                  <button 
                    type="button" 
                    onClick={() => setIsModalOpen(true)}
                    className="w-full py-16 bg-white border-2 border-dashed border-gray-200 rounded-3xl text-gray-400 hover:border-[#0A3D2E] hover:text-[#0A3D2E] transition-all flex flex-col items-center gap-4 group"
                  >
                    <div className="p-4 bg-gray-50 rounded-full group-hover:bg-[#0A3D2E]/10 transition-colors">
                      <ShoppingBag size={40} className="group-hover:scale-110 transition-transform" />
                    </div>
                    <span className="font-bold text-lg">문의하실 상품을 선택해주세요.</span>
                  </button>
                ) : (
                  <div className="flex flex-col gap-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {selectedProducts.map(sel => {
                        const p = products.find(prod => prod.id === sel.id);
                        return p ? (
                          <div key={sel.id} className="flex flex-row items-center justify-between p-4 bg-white border border-[#0A3D2E]/5 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-center gap-4 min-w-0">
                              <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 border border-gray-100">
                                <img src={p.image_url} alt="" className="w-full h-full object-cover" />
                              </div>
                              <div className="min-w-0">
                                <span className="block text-[15px] font-bold text-gray-800 truncate">{p.name}</span>
                                <span className="text-[12px] text-[#0A3D2E] font-bold">₩{p.price.toLocaleString()}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 bg-gray-50 rounded-xl p-1 shrink-0 ml-4">
                              <button type="button" onClick={() => handleQuantityChange(sel.id, -1)} className="w-8 h-8 flex items-center justify-center bg-white border border-gray-100 rounded-lg text-gray-400 hover:text-[#0A3D2E] hover:border-[#0A3D2E] font-bold transition-all shadow-sm">-</button>
                              <span className="text-[14px] font-bold w-8 text-center text-[#0A3D2E]">{sel.quantity}</span>
                              <button type="button" onClick={() => handleQuantityChange(sel.id, 1)} className="w-8 h-8 flex items-center justify-center bg-white border border-gray-100 rounded-lg text-gray-400 hover:text-[#0A3D2E] hover:border-[#0A3D2E] font-bold transition-all shadow-sm">+</button>
                              <button type="button" onClick={() => handleRemoveProduct(sel.id)} className="ml-2 w-8 h-8 flex items-center justify-center text-gray-300 hover:text-red-500 transition-colors">
                                <X size={18} />
                              </button>
                            </div>
                          </div>
                        ) : null;
                      })}
                    </div>
                    <button 
                      type="button" 
                      onClick={() => setIsModalOpen(true)}
                      className="mt-4 self-start flex items-center gap-2 text-[14px] font-bold text-[#0A3D2E] hover:underline"
                    >
                      <Plus size={16} /> 상품 추가하기
                    </button>
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
                    placeholder="성함을 입력해 주세요."
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
                    placeholder="example@email.com"
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
                    placeholder="010-0000-0000"
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
                    placeholder="제목을 입력해 주세요."
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
                    placeholder="희망 제품, 납기일, 포장 옵션 등 상세 문의 내용을 입력해 주세요."
                    className="w-full px-5 py-4 bg-gray-50 border border-transparent rounded-xl outline-none focus:border-[#0A3D2E] focus:bg-white transition-all text-sm font-medium shadow-inner resize-none"
                  />
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
                  {isLoading ? 'Sending...' : 'Register Inquiry'}
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
        multiple={true}
      />
    </div>
  );
}
