'use client';

import { useState, useEffect } from 'react';
import { X, Search, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Product {
  id: number;
  name: string;
  price: number;
  image_url: string;
  description?: string;
}

interface ProductSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (selected: number[]) => void;
  initialSelected?: number[];
  multiple?: boolean;
}

export default function ProductSelectModal({
  isOpen,
  onClose,
  onSelect,
  initialSelected = [],
  multiple = true
}: ProductSelectModalProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<number[]>(initialSelected);

  useEffect(() => {
    if (isOpen) {
      fetchProducts();
      setSelectedIds(initialSelected);
    }
  }, [isOpen, initialSelected]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch('/admin_products.php?action=get_products');
      const result = await res.json();
      if (result.success) {
        setProducts(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (id: number) => {
    if (multiple) {
      setSelectedIds(prev => 
        prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
      );
    } else {
      setSelectedIds([id]);
    }
  };

  const handleConfirm = () => {
    onSelect(selectedIds);
    onClose();
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal Container */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative bg-white w-full max-w-4xl max-h-[85vh] rounded-[32px] shadow-2xl overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
            <div>
              <h3 className="text-2xl font-bold text-[#0A3D2E]">상품 선택</h3>
              <p className="text-sm text-gray-400 mt-1 font-medium">대상 상품을 {multiple ? '여러 개 ' : '한 개 '}선택해주세요.</p>
            </div>
            <button 
              onClick={onClose}
              className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-900 transition-all"
            >
              <X size={24} />
            </button>
          </div>

          {/* Search Bar */}
          <div className="px-8 py-4 bg-gray-50/50 border-b border-gray-100">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#0A3D2E] transition-colors" size={18} />
              <input 
                type="text" 
                placeholder="찾으시는 상품명을 입력하세요..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-2xl outline-none focus:border-[#0A3D2E] focus:ring-4 focus:ring-[#0A3D2E]/5 transition-all text-[15px] font-medium"
              />
            </div>
          </div>

          {/* Product List */}
          <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <div className="w-10 h-10 border-4 border-[#0A3D2E] border-t-transparent rounded-full animate-spin"></div>
                <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Loading Products</p>
              </div>
            ) : filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 gap-3">
                {filteredProducts.map(product => {
                  const isSelected = selectedIds.includes(product.id);
                  return (
                    <div 
                      key={product.id}
                      onClick={() => handleToggle(product.id)}
                      className={`group flex items-center gap-6 p-5 rounded-2xl border-2 cursor-pointer transition-all duration-300
                        ${isSelected 
                          ? 'border-[#0A3D2E] bg-[#0A3D2E]/5 shadow-lg shadow-[#0A3D2E]/5' 
                          : 'border-transparent hover:border-gray-100 hover:bg-gray-50'}`}
                    >
                      {/* Selection Indicator */}
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all
                        ${isSelected ? 'bg-[#0A3D2E] border-[#0A3D2E]' : 'border-gray-200 group-hover:border-[#0A3D2E]'}`}>
                        {isSelected && <Check size={14} className="text-white" strokeWidth={4} />}
                      </div>

                      {/* Product Info */}
                      <div className="w-20 h-20 bg-white rounded-xl overflow-hidden border border-gray-100 shrink-0">
                        <img 
                          src={product.image_url} 
                          alt={product.name} 
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <h4 className="text-[17px] font-bold text-gray-900 group-hover:text-[#0A3D2E] transition-colors line-clamp-1">{product.name}</h4>
                        <p className="text-sm text-gray-400 mt-1 line-clamp-1 font-medium">{product.description || '자연바람 프리미엄 내추럴 케어 제품입니다.'}</p>
                      </div>

                      <div className="text-right shrink-0">
                        <p className="text-[18px] font-bold text-[#0A3D2E]">₩{product.price.toLocaleString()}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-20 text-center">
                <p className="text-gray-400 font-medium">검색 결과가 없습니다.</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-8 py-6 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
            <div className="text-sm">
              <span className="text-gray-400 font-medium">선택된 상품 : </span>
              <span className="text-[#0A3D2E] font-bold">{selectedIds.length}개</span>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={onClose}
                className="px-8 py-3 bg-white border border-gray-200 text-gray-500 font-bold rounded-xl hover:bg-gray-100 transition-all"
              >
                취소
              </button>
              <button 
                onClick={handleConfirm}
                disabled={selectedIds.length === 0}
                className="px-10 py-3 bg-[#0A3D2E] text-white font-bold rounded-xl hover:bg-[#00331d] transition-all shadow-lg shadow-[#0A3D2E]/20 disabled:opacity-50 disabled:shadow-none"
              >
                선택 완료
              </button>
            </div>
          </div>
        </motion.div>

        <style jsx>{`
          .custom-scrollbar::-webkit-scrollbar {
            width: 8px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: transparent;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: #e2e8f0;
            border-radius: 10px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: #cbd5e1;
          }
        `}</style>
      </div>
    </AnimatePresence>
  );
}
