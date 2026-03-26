'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Star, Upload, X, Plus } from 'lucide-react';
import ProductSelectModal from '@/components/community/ProductSelectModal';

interface Product {
    id: number;
    name: string;
    image_url: string;
    price: number;
}

export default function ReviewWrite() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [products, setProducts] = useState<Product[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    // Form States
    const [selectedProducts, setSelectedProducts] = useState<{id: number, quantity: number}[]>([]);
    const [rating, setRating] = useState(5);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [authorName, setAuthorName] = useState('');
    const [image, setImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const res = await fetch('/api/get_products.php');
            const data = await res.json();
            if (data.success) {
                setProducts(data.data);
            }
        } catch (error) {
            console.error('Failed to fetch products:', error);
        }
    };

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

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedProducts.length === 0) return alert('상품을 선택해주세요.');
        if (!title.trim()) return alert('제목을 입력해주세요.');
        if (!content.trim()) return alert('내용을 입력해주세요.');
        if (!authorName.trim()) return alert('작성자명을 입력해주세요.');

        setLoading(true);
        const formData = new FormData();
        formData.append('action', 'add_review');
        // Q&A와 동일하게 JSON 형식으로 ID 리스트 전송
        formData.append('product_id', JSON.stringify(selectedProducts));
        formData.append('rating', rating.toString());
        formData.append('title', title);
        formData.append('content', content);
        formData.append('author_name', authorName);
        if (image) formData.append('image', image);

        try {
            const res = await fetch('/api/review_actions.php', {
                method: 'POST',
                body: formData
            });
            const result = await res.json();
            if (result.success) {
                alert('후기가 등록되었습니다.');
                router.push('/community/review');
            } else {
                alert(result.message || '등록에 실패했습니다.');
            }
        } catch (error) {
            console.error('Submit error:', error);
            alert('서버 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto py-20 px-4">
            <div className="mb-12 border-b border-gray-100 pb-8">
                <h1 className="text-4xl font-serif font-bold text-[#0A3D2E] mb-3 tracking-tight">Write Review ✨</h1>
                <p className="text-gray-400 font-medium tracking-wide">자연바람 상품에 대한 소중한 후기를 남겨주세요.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-10">
                {/* Product Selection Section */}
                <div className="bg-gray-50 p-10 rounded-3xl shadow-sm">
                    <label className="block text-[#0A3D2E] text-[16px] font-bold mb-6">구매하신 상품 <span className="text-red-500">*</span></label>
                    
                    <button 
                        type="button" 
                        onClick={() => setIsModalOpen(true)}
                        className="bg-white border-2 border-gray-100 px-8 py-4 rounded-2xl font-bold text-[#0A3D2E] hover:border-[#0A3D2E] hover:bg-[#0A3D2E]/5 transition-all flex items-center gap-3 shadow-sm group"
                    >
                        <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                        상품 선택하기
                    </button>

                    {selectedProducts.length > 0 && (
                        <div className="mt-8 flex flex-col gap-4 border-t border-gray-200 pt-8">
                            <label className="text-gray-400 text-[12px] font-bold uppercase tracking-widest">Selected Products</label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {selectedProducts.map(sel => {
                                    const p = products.find(prod => prod.id === sel.id);
                                    return p ? (
                                        <div key={sel.id} className="flex flex-row items-center justify-between p-4 bg-white border border-[#0A3D2E]/10 rounded-2xl shadow-sm group/item">
                                            <div className="flex items-center gap-4 min-w-0">
                                                <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 border border-gray-50">
                                                    <img src={p.image_url} alt="" className="w-full h-full object-cover" />
                                                </div>
                                                <div className="min-w-0">
                                                    <span className="block text-[14px] font-bold text-gray-800 truncate">{p.name}</span>
                                                    <span className="text-[12px] text-[#0A3D2E] font-bold">₩{p.price.toLocaleString()}</span>
                                                </div>
                                            </div>
                                            <button 
                                                type="button" 
                                                onClick={() => handleRemoveProduct(sel.id)} 
                                                className="w-10 h-10 flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
                                            >
                                                <X size={20} />
                                            </button>
                                        </div>
                                    ) : null;
                                })}
                            </div>
                        </div>
                    )}
                </div>

                {/* Rating */}
                <div className="bg-white p-10 rounded-3xl border border-gray-100 shadow-sm">
                    <label className="block text-[#0A3D2E] text-[16px] font-bold mb-6">상품의 만족도는 어떠셨나요? <span className="text-red-500">*</span></label>
                    <div className="flex gap-4">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                type="button"
                                onClick={() => setRating(star)}
                                className="group transition-all active:scale-95"
                            >
                                <Star 
                                    size={48} 
                                    fill={star <= rating ? "#FFC107" : "none"} 
                                    color={star <= rating ? "#FFC107" : "#E5E7EB"}
                                    strokeWidth={star <= rating ? 0 : 2}
                                    className="filter drop-shadow-sm group-hover:scale-110 transition-transform"
                                />
                            </button>
                        ))}
                    </div>
                    <p className="mt-4 text-sm font-bold text-gray-400">
                        {rating === 5 ? "매우 만족스러워요! ⭐⭐⭐⭐⭐" : 
                         rating === 4 ? "만족스러워요! ⭐⭐⭐⭐" : 
                         rating === 3 ? "보통이에요. ⭐⭐⭐" : 
                         rating === 2 ? "조금 아쉬워요. ⭐⭐" : "아쉬워요. ⭐"}
                    </p>
                </div>

                {/* Author & Title */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                        <label className="block text-[#0A3D2E] text-[14px] font-bold">작성자 <span className="text-red-500">*</span></label>
                        <input 
                            type="text" 
                            value={authorName}
                            onChange={(e) => setAuthorName(e.target.value)}
                            className="w-full px-6 py-4 bg-gray-50 border border-transparent rounded-2xl outline-none focus:border-[#0A3D2E] focus:bg-white transition-all font-medium text-sm shadow-inner"
                            placeholder="성함을 입력해주세요."
                        />
                    </div>
                    <div className="space-y-3">
                        <label className="block text-[#0A3D2E] text-[14px] font-bold">제목 <span className="text-red-500">*</span></label>
                        <input 
                            type="text" 
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full px-6 py-4 bg-gray-50 border border-transparent rounded-2xl outline-none focus:border-[#0A3D2E] focus:bg-white transition-all font-medium text-sm shadow-inner"
                            placeholder="제목을 입력해주세요."
                        />
                    </div>
                </div>

                {/* Content */}
                <div className="space-y-3">
                    <label className="block text-[#0A3D2E] text-[14px] font-bold">내용 <span className="text-red-500">*</span></label>
                    <textarea 
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        className="w-full min-h-[300px] px-6 py-6 bg-gray-50 border border-transparent rounded-3xl outline-none focus:border-[#0A3D2E] focus:bg-white transition-all font-medium text-sm shadow-inner resize-none"
                        placeholder="전달하고 싶은 후기 내용을 작성해주세요."
                    />
                </div>

                {/* Image Upload */}
                <div className="bg-gray-50 p-10 rounded-3xl">
                    <label className="block text-[#0A3D2E] text-[16px] font-bold mb-6">사진 첨부 (선택)</label>
                    <div className="flex items-start gap-4">
                        <label className="cursor-pointer w-28 h-28 bg-white border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center text-gray-400 hover:border-[#0A3D2E] hover:text-[#0A3D2E] transition-all group">
                            <Upload size={28} className="group-hover:-translate-y-1 transition-transform" />
                            <span className="text-[11px] font-bold mt-2 uppercase tracking-widest">Upload</span>
                            <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                        </label>
                        {imagePreview && (
                            <div className="relative w-28 h-28 group">
                                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover rounded-2xl border border-gray-200 shadow-sm" />
                                <button 
                                    type="button"
                                    onClick={() => { setImage(null); setImagePreview(null); }}
                                    className="absolute -top-3 -right-3 bg-white text-gray-400 hover:text-red-500 rounded-full shadow-lg p-2 transition-all"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Submit Buttons */}
                <div className="flex gap-4 pt-10 border-t border-gray-100">
                    <button 
                        type="button" 
                        onClick={() => router.back()}
                        className="flex-1 py-5 bg-white border-2 border-gray-100 rounded-2xl font-bold text-[#0A3D2E] hover:border-[#0A3D2E] transition-all tracking-widest text-sm uppercase"
                    >
                        Cancel
                    </button>
                    <button 
                        type="submit"
                        disabled={loading}
                        className="flex-[2] py-5 bg-[#0A3D2E] text-white rounded-2xl font-bold hover:bg-[#00331d] transition-all shadow-xl shadow-[#0A3D2E]/20 tracking-widest text-sm uppercase disabled:opacity-50"
                    >
                        {loading ? 'Submitting...' : 'Register Review'}
                    </button>
                </div>
            </form>

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
