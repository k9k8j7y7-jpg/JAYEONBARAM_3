"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, Plus, Minus, ShoppingCart, CreditCard, ChevronLeft } from "lucide-react";
import { useParams } from "next/navigation";

interface ImageItem {
    image_path: string;
    is_main: number;
}

interface ProductDetail {
    id: number;
    name: string;
    description: string;
    price: number;
    image_url: string;
    full_description: string;
    usage_guide: string;
    ingredients: string;
    main_features: string;
    images: ImageItem[];
}

const ProductDetailPage = () => {
    const params = useParams();
    const id = params.id;
    
    const [product, setProduct] = useState<ProductDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [activeTab, setActiveTab] = useState("info"); // info, usage, ingredients
    const [selectedImage, setSelectedImage] = useState("");

    useEffect(() => {
        const fetchProductDetail = async () => {
            if (!id) return;
            try {
                const response = await fetch(`http://52.78.157.86/api/get_product_detail.php?id=${id}`);
                const data = await response.json();
                setProduct(data);
                setSelectedImage(data.image_url);
            } catch (error) {
                console.error("Failed to fetch product detail:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProductDetail();
    }, [id]);

    if (loading) return (
        <div className="min-h-screen bg-white pt-40 flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-brand-primary"></div>
        </div>
    );

    if (!product) return (
        <div className="min-h-screen bg-white pt-40 text-center">
            <p className="text-gray-500">상품을 찾을 수 없습니다.</p>
            <Link href="/shop" className="text-brand-primary font-bold mt-4 inline-block underline">돌아가기</Link>
        </div>
    );

    const totalPrice = product.price * quantity;

    const tabs = [
        { id: "info", title: "제품 상세" },
        { id: "usage", title: "사용 방법" },
        { id: "ingredients", title: "전성분" }
    ];

    return (
        <div className="min-h-screen bg-white pt-32 pb-20">
            <div className="max-w-7xl mx-auto px-6">
                {/* Breadcrumb */}
                <nav className="flex items-center gap-2 text-sm text-gray-400 mb-12 font-medium">
                    <Link href="/" className="hover:text-brand-primary transition-colors">Home</Link>
                    <ChevronRight size={14} />
                    <Link href="/shop" className="hover:text-brand-primary transition-colors">Shop</Link>
                    <ChevronRight size={14} />
                    <span className="text-brand-primary font-bold">{product.name}</span>
                </nav>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
                    {/* Left: Image Gallery */}
                    <div className="space-y-6">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="relative aspect-square rounded-3xl overflow-hidden bg-brand-secondary"
                        >
                            <Image
                                src={selectedImage}
                                alt={product.name}
                                fill
                                className="object-cover"
                                priority
                                unoptimized
                            />
                        </motion.div>
                        
                        {/* Thumbnails */}
                        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                            {product.images.map((img, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setSelectedImage(img.image_path)}
                                    className={`relative w-24 aspect-square rounded-xl overflow-hidden flex-shrink-0 transition-all border-2 ${
                                        selectedImage === img.image_path ? "border-brand-primary" : "border-transparent"
                                    }`}
                                >
                                    <Image
                                        src={img.image_path}
                                        alt={`${product.name} shadow ${idx}`}
                                        fill
                                        className="object-cover"
                                        unoptimized
                                    />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Right: Product Info */}
                    <div className="space-y-8">
                        <div>
                            <motion.span 
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="text-brand-primary font-bold tracking-widest text-xs uppercase"
                            >
                                JAYEONBARAM PREMIUM
                            </motion.span>
                            <motion.h1 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-4xl md:text-5xl font-serif font-bold text-brand-text mt-2 leading-tight"
                            >
                                {product.name}
                            </motion.h1>
                            <p className="text-gray-500 mt-4 leading-relaxed max-w-lg">
                                {product.description}
                            </p>
                        </div>

                        <div className="py-8 border-y border-gray-100 space-y-6">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-400 font-medium">판매가</span>
                                <span className="text-2xl font-serif font-bold text-brand-primary">
                                    ₩ {product.price.toLocaleString()}
                                </span>
                            </div>

                            <div className="flex justify-between items-center">
                                <span className="text-gray-400 font-medium">수량 선택</span>
                                <div className="flex items-center gap-4 bg-brand-secondary px-4 py-2 rounded-xl">
                                    <button 
                                        onClick={() => setQuantity(q => Math.max(1, q - 1))}
                                        className="text-brand-primary hover:opacity-50 transition-all"
                                    >
                                        <Minus size={18} />
                                    </button>
                                    <span className="w-8 text-center font-bold text-brand-text">{quantity}</span>
                                    <button 
                                        onClick={() => setQuantity(q => q + 1)}
                                        className="text-brand-primary hover:opacity-50 transition-all"
                                    >
                                        <Plus size={18} />
                                    </button>
                                </div>
                            </div>

                            <div className="pt-4 flex justify-between items-end">
                                <span className="text-gray-400 font-medium">최종 결제 금액</span>
                                <span className="text-4xl font-serif font-bold text-brand-primary">
                                    ₩ {totalPrice.toLocaleString()}
                                </span>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <button className="flex-1 bg-brand-secondary text-brand-primary py-5 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-gray-200 transition-all active:scale-95 text-lg">
                                <ShoppingCart size={20} />
                                장바구니
                            </button>
                            <button className="flex-[1.5] bg-brand-primary text-white py-5 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-brand-primary/90 transition-all shadow-xl shadow-brand-primary/20 active:scale-95 text-lg">
                                <CreditCard size={20} />
                                바로 구매하기
                            </button>
                        </div>

                        <div className="pt-8 space-y-4">
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                                <span className="w-20 font-bold text-gray-400">배송정보</span>
                                <span>무료배송 (3만원 이상 구매시)</span>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                                <span className="w-20 font-bold text-gray-400">포인트적립</span>
                                <span>구매 금액의 1% 적립</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Content: Tabs */}
                <div className="mt-32">
                    <div className="flex justify-center gap-12 border-b border-gray-100">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`pb-6 text-lg font-bold transition-all relative ${
                                    activeTab === tab.id ? "text-brand-primary" : "text-gray-300 hover:text-gray-500"
                                }`}
                            >
                                {tab.title}
                                {activeTab === tab.id && (
                                    <motion.div 
                                        layoutId="tab-underline"
                                        className="absolute bottom-0 left-0 right-0 h-1 bg-brand-primary rounded-full"
                                    />
                                )}
                            </button>
                        ))}
                    </div>

                    <div className="py-20 max-w-4xl mx-auto">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.3 }}
                                className="text-brand-text leading-loose"
                            >
                                {activeTab === "info" && (
                                    <div className="space-y-8">
                                        <div className="bg-brand-secondary/30 p-10 rounded-3xl">
                                            <h4 className="text-xl font-bold text-brand-primary mb-6">주요 특징</h4>
                                            <p className="text-gray-600 italic leading-relaxed">
                                                "{product.main_features}"
                                            </p>
                                        </div>
                                        <div className="whitespace-pre-line text-lg">
                                            {product.full_description}
                                        </div>
                                    </div>
                                )}
                                {activeTab === "usage" && (
                                    <div className="bg-white border border-gray-100 p-10 rounded-3xl shadow-sm">
                                        <h4 className="text-xl font-bold text-brand-primary mb-6">USAGE GUIDE</h4>
                                        <div className="text-lg leading-relaxed">
                                            {product.usage_guide}
                                        </div>
                                    </div>
                                )}
                                {activeTab === "ingredients" && (
                                    <div className="bg-gray-50 p-10 rounded-3xl">
                                        <h4 className="text-xl font-semibold text-gray-400 mb-6 uppercase tracking-widest text-sm">Full Ingredients</h4>
                                        <div className="text-gray-600 text-sm leading-relaxed">
                                            {product.ingredients}
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>

                {/* Related Products Placeholder */}
                <div className="mt-32 border-t border-gray-100 pt-32">
                    <h2 className="text-3xl font-serif font-bold text-brand-primary text-center mb-20">
                        함께 사용하면 좋은 제품
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {/* 4열 추천 리스트 (추후 동적 데이터 연동 가능) */}
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="group cursor-pointer">
                                <div className="aspect-[3/4] bg-brand-secondary rounded-2xl mb-4 overflow-hidden relative">
                                    <div className="absolute inset-0 bg-gray-200 animate-pulse" />
                                </div>
                                <div className="h-4 bg-gray-100 rounded w-3/4 mb-2 animate-pulse" />
                                <div className="h-4 bg-gray-100 rounded w-1/4 animate-pulse" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetailPage;
