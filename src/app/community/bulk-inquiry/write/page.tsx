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

export default function BulkInquiryWritePage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<{id: number, quantity: number}[]>([]);
  const [formData, setFormData] = useState({
    author: '',
    email: '',
    phone: '',
    title: '',
    content: '',
  });

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // 상품 목록 가져오기
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
            <div className="border-b border-gray-100 pb-8 mb-12">
              <h3 className="text-3xl font-serif font-bold text-[#0A3D2E] tracking-tight">Write Inquiry</h3>
              <p className="text-gray-400 mt-3 font-medium">자연바람의 대량구매 및 단체 주문 상담 서비스입니다.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-12">
              {/* Product Selection Section */}
              <div className="bg-gray-50 p-10 rounded-3xl">
                <label className="block text-[#0A3D2E] text-[16px] font-bold mb-6">대상 상품 선택 (다중 선택 가능) <span className="text-red-500">*</span></label>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-h-[400px] overflow-y-auto p-2">
                  {products.map(product => {
                    const isSelected = selectedProducts.some(p => p.id === product.id);
                    return (
                      <label 
                        key={product.id} 
                        className={`relative flex flex-col items-center p-4 border-2 rounded-2xl cursor-pointer transition-all hover:border-[#0A3D2E]
                          ${isSelected ? 'border-[#0A3D2E] bg-white shadow-lg' : 'border-gray-100 bg-white'}`}
                      >
                        <input 
                          type="checkbox" 
                          className="absolute top-3 right-3 accent-[#0A3D2E]"
                          checked={isSelected}
                          onChange={() => handleProductToggle(product.id)}
                        />
                        <img src={product.image_url} alt={product.name} className="w-16 h-16 object-cover rounded-md mb-3" />
                        <div className="text-[12px] font-bold text-gray-700 text-center line-clamp-2">{product.name}</div>
                      </label>
                    );
                  })}
                </div>
                {selectedProducts.length > 0 && (
                    <div className="mt-6 flex flex-col gap-3 border-t border-gray-100 pt-6">
                        <label className="text-[#0A3D2E] text-[14px] font-bold">선택된 상품 및 수량</label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {selectedProducts.map(sel => {
                                const p = products.find(prod => prod.id === sel.id);
                                return p ? (
                                    <div key={sel.id} className="flex flex-row items-center justify-between p-3 bg-white border border-[#0A3D2E]/20 rounded-xl shadow-sm">
                                        <span className="text-[13px] font-bold text-gray-800 break-keep mr-2 line-clamp-1">{p.name}</span>
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
                    placeholder="성함을 입력해 주세요."
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
                    placeholder="example@email.com"
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
                    placeholder="010-0000-0000"
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
                    placeholder="제목을 입력해 주세요."
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
                    placeholder="희망 제품, 납기일, 포장 옵션 등 상세 문의 내용을 입력해 주세요."
                    className="w-full px-5 py-4 bg-gray-50 border border-transparent rounded-xl outline-none focus:border-[#0A3D2E] focus:bg-white transition-all text-sm font-medium"
                  />
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
                  {isLoading ? 'Sending...' : 'Register Inquiry'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
