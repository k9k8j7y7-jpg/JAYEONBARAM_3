'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Star, Upload, Package, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
    const [showProductModal, setShowProductModal] = useState(false);
    
    // Form States
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
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
            const res = await fetch('/api/get_products.php'); // 기존 API 재활용 또는 신규 생성 필요
            const data = await res.json();
            if (data.success) {
                setProducts(data.data);
            }
        } catch (error) {
            console.error('Failed to fetch products:', error);
        }
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
        if (!selectedProduct) return alert('상품을 선택해주세요.');
        if (!title.trim()) return alert('제목을 입력해주세요.');
        if (!content.trim()) return alert('내용을 입력해주세요.');
        if (!authorName.trim()) return alert('작성자명을 입력해주세요.');

        setLoading(true);
        const formData = new FormData();
        formData.append('action', 'add_review');
        formData.append('product_id', selectedProduct.id.toString());
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
        <div className="max-w-4xl mx-auto py-10 px-4">
            <h1 className="text-3xl font-bold text-[#0A3D2E] mb-2">Write Review</h1>
            <p className="text-gray-500 mb-10">자연바람 상품에 대한 소중한 후기를 남겨주세요.</p>

            <form onSubmit={handleSubmit} className="space-y-8 bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                {/* Product Selection */}
                <div className="space-y-3">
                    <label className="block text-sm font-bold text-gray-700">대상 상품 <span className="text-red-500">*</span></label>
                    {selectedProduct ? (
                        <div className="flex items-center justify-between p-4 border-2 border-[#0A3D2E] rounded-xl bg-[#0A3D2E]/5">
                            <div className="flex items-center gap-4">
                                <img src={selectedProduct.image_url} alt="" className="w-16 h-16 object-cover rounded-lg border border-gray-200" />
                                <div>
                                    <p className="font-bold text-[#0A3D2E]">{selectedProduct.name}</p>
                                    <p className="text-sm text-gray-400">{selectedProduct.price.toLocaleString()}원</p>
                                </div>
                            </div>
                            <button type="button" onClick={() => setSelectedProduct(null)} className="text-gray-400 hover:text-red-500 transition-colors">
                                <X size={20} />
                            </button>
                        </div>
                    ) : (
                        <button 
                            type="button"
                            onClick={() => setShowProductModal(true)}
                            className="w-full py-10 border-2 border-dashed border-gray-200 rounded-xl text-gray-400 hover:border-[#0A3D2E] hover:text-[#0A3D2E] transition-all flex flex-col items-center gap-2"
                        >
                            <Package size={32} />
                            <span className="font-medium">리뷰할 상품을 선택해주세요.</span>
                        </button>
                    )}
                </div>

                {/* Rating */}
                <div className="space-y-3">
                    <label className="block text-sm font-bold text-gray-700">평점 <span className="text-red-500">*</span></label>
                    <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                type="button"
                                onClick={() => setRating(star)}
                                className="transition-transform active:scale-90"
                            >
                                <Star 
                                    size={32} 
                                    fill={star <= rating ? "#FFC107" : "none"} 
                                    color={star <= rating ? "#FFC107" : "#E5E7EB"}
                                    strokeWidth={2}
                                />
                            </button>
                        ))}
                    </div>
                </div>

                {/* Title & Author */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="block text-sm font-bold text-gray-700">작성자 <span className="text-red-500">*</span></label>
                        <input 
                            type="text" 
                            value={authorName}
                            onChange={(e) => setAuthorName(e.target.value)}
                            className="w-full border-b-2 border-gray-100 py-2 focus:border-[#0A3D2E] outline-none transition-colors"
                            placeholder="작성자 성함을 입력해주세요."
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="block text-sm font-bold text-gray-700">제목 <span className="text-red-500">*</span></label>
                        <input 
                            type="text" 
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full border-b-2 border-gray-100 py-2 focus:border-[#0A3D2E] outline-none transition-colors"
                            placeholder="제목을 입력해주세요."
                        />
                    </div>
                </div>

                {/* Content */}
                <div className="space-y-2">
                    <label className="block text-sm font-bold text-gray-700">내용 <span className="text-red-500">*</span></label>
                    <textarea 
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        className="w-full min-h-[300px] border-2 border-gray-100 p-4 rounded-xl focus:border-[#0A3D2E] outline-none transition-colors resize-none"
                        placeholder="상품에 대한 진솔한 후기를 들려주세요 (최소 10자 이상)."
                    />
                </div>

                {/* Image Upload */}
                <div className="space-y-3">
                    <label className="block text-sm font-bold text-gray-700">사진 첨부 (선택)</label>
                    <div className="flex items-start gap-4">
                        <label className="cursor-pointer w-24 h-24 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center text-gray-400 hover:border-[#0A3D2E] hover:text-[#0A3D2E] transition-all">
                            <Upload size={24} />
                            <span className="text-[11px] font-bold mt-1 uppercase">Upload</span>
                            <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                        </label>
                        {imagePreview && (
                            <div className="relative w-24 h-24">
                                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover rounded-xl border border-gray-200" />
                                <button 
                                    type="button"
                                    onClick={() => { setImage(null); setImagePreview(null); }}
                                    className="absolute -top-2 -right-2 bg-white rounded-full shadow-md p-1 hover:text-red-500 transition-colors"
                                >
                                    <X size={14} />
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Submit Buttons */}
                <div className="flex gap-4 pt-6 border-t border-gray-100">
                    <button 
                        type="button" 
                        onClick={() => router.back()}
                        className="flex-1 py-4 border-2 border-gray-200 rounded-xl font-bold text-gray-500 hover:bg-gray-50 transition-all uppercase tracking-widest"
                    >
                        Cancel
                    </button>
                    <button 
                        type="submit"
                        disabled={loading}
                        className="flex-[2] py-4 bg-[#0A3D2E] text-white rounded-xl font-bold hover:bg-[#00331d] transition-all shadow-lg shadow-[#0A3D2E]/20 uppercase tracking-widest disabled:opacity-50"
                    >
                        {loading ? 'Submitting...' : 'Register Review'}
                    </button>
                </div>
            </form>

            {/* Product Selection Modal */}
            <AnimatePresence>
                {showProductModal && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
                        onClick={() => setShowProductModal(false)}
                    >
                        <motion.div 
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="bg-white w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-[#f8f9f8]">
                                <h2 className="text-xl font-bold text-[#0A3D2E]">Select Product</h2>
                                <button onClick={() => setShowProductModal(false)} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
                            </div>
                            <div className="max-h-[500px] overflow-y-auto p-4 space-y-2">
                                {products.map((product) => (
                                    <button
                                        key={product.id}
                                        onClick={() => {
                                            setSelectedProduct(product);
                                            setShowProductModal(false);
                                        }}
                                        className="w-full flex items-center gap-4 p-3 rounded-2xl hover:bg-[#0A3D2E]/5 transition-all text-left group"
                                    >
                                        <img src={product.image_url} alt="" className="w-16 h-16 object-cover rounded-xl border border-gray-100" />
                                        <div className="flex-1">
                                            <p className="font-bold text-gray-800 group-hover:text-[#0A3D2E] transition-colors">{product.name}</p>
                                            <p className="text-sm text-gray-400">{product.price.toLocaleString()}원</p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
