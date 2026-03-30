"use client";

import { motion } from "framer-motion";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ChevronRight, Search as SearchIcon } from "lucide-react";

interface Product {
    id: number;
    name: string;
    description: string;
    price: number;
    image_url: string;
}

const SearchContent = () => {
    const searchParams = useSearchParams();
    const query = searchParams.get("q") || "";
    const [products, setProducts] = useState<Product[]>([]);
    const [recommendations, setRecommendations] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchResults = async () => {
            if (!query) return;
            setLoading(true);
            try {
                // 실시간 검색 API 재사용
                const response = await fetch(`/admin_products.php?action=search&keyword=${encodeURIComponent(query)}`);
                const data = await response.json();
                
                if (data.success) {
                    setProducts(data.data);
                    
                    // 결과가 없을 경우 추천 상품 로드 (전체 상품 중 일부)
                    if (data.data.length === 0) {
                        const recRes = await fetch(`/admin_products.php?action=get_products`);
                        const recData = await recRes.json();
                        if (recData.success) {
                            setRecommendations(recData.data.slice(0, 4));
                        }
                    }
                }
            } catch (error) {
                console.error("Failed to fetch search results:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchResults();
    }, [query]);

    return (
        <div className="min-h-screen bg-white pt-32 pb-20">
            <div className="max-w-7xl mx-auto px-6">
                {/* Breadcrumb */}
                <nav className="flex items-center gap-2 text-sm text-gray-400 mb-8 font-medium">
                    <Link href="/" className="hover:text-brand-primary transition-colors">Home</Link>
                    <ChevronRight size={14} />
                    <span className="text-brand-primary font-bold">Search</span>
                </nav>

                {/* Title Section */}
                <div className="mb-16">
                    <h1 className="text-4xl md:text-5xl font-serif font-bold text-brand-primary mb-4">
                        Search Results
                    </h1>
                    <p className="text-lg text-gray-500 font-medium">
                        {query ? (
                            <>"{query}" 에 대한 검색 결과 <span className="text-brand-primary font-bold">{products.length}</span>개를 찾았습니다.</>
                        ) : (
                            "검색어를 입력해주세요."
                        )}
                    </p>
                </div>

                {/* Product Grid */}
                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {[1, 2, 3, 4].map((n) => (
                            <div key={n} className="animate-pulse">
                                <div className="aspect-[4/5] bg-gray-100 rounded-2xl mb-4" />
                                <div className="h-4 bg-gray-100 rounded w-3/4 mb-2" />
                                <div className="h-3 bg-gray-100 rounded w-1/2" />
                            </div>
                        ))}
                    </div>
                ) : products.length > 0 ? (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12"
                    >
                        {products.map((product, index) => (
                            <motion.div
                                key={product.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="group cursor-pointer relative"
                            >
                                <Link href={`/shop/product/${product.id}/`}>
                                    <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-brand-secondary mb-6 shadow-sm">
                                        <Image
                                            src={product.image_url || "/images/placeholder.jpg"}
                                            alt={product.name}
                                            fill
                                            className="object-cover transition-transform duration-700 group-hover:scale-110"
                                            unoptimized={true}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <h3 className="text-lg font-bold text-brand-text group-hover:text-brand-primary transition-colors">
                                            {product.name}
                                        </h3>
                                        <p className="text-sm text-gray-500 leading-relaxed line-clamp-2">
                                            {product.description}
                                        </p>
                                        <p className="text-lg font-serif font-bold text-brand-primary pt-1">
                                            ₩ {Number(product.price).toLocaleString()}
                                        </p>
                                    </div>
                                </Link>
                            </motion.div>
                        ))}
                    </motion.div>
                ) : (
                    <div className="py-20 text-center flex flex-col items-center justify-center">
                        <div className="w-20 h-20 bg-brand-secondary/50 rounded-full flex items-center justify-center mb-6 text-brand-primary/30">
                            <SearchIcon size={40} />
                        </div>
                        <h2 className="text-2xl font-bold text-brand-text mb-2">검색 결과가 없습니다.</h2>
                        <p className="text-gray-400 mb-12">입력하신 검색어와 일치하는 제품을 찾을 수 없습니다.</p>

                        {/* 추천 상품 영역 */}
                        {recommendations.length > 0 && (
                            <div className="w-full mt-20">
                                <h3 className="text-xl font-bold text-brand-text mb-8 text-left">추천 상품</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                                    {recommendations.map((product) => (
                                        <Link key={product.id} href={`/shop/product/${product.id}/`} className="group text-left">
                                            <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-brand-secondary mb-4">
                                                <Image
                                                    src={product.image_url}
                                                    alt={product.name}
                                                    fill
                                                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                                                    unoptimized={true}
                                                />
                                            </div>
                                            <h4 className="font-bold text-brand-text group-hover:text-brand-primary transition-colors">{product.name}</h4>
                                            <p className="text-brand-primary font-bold mt-1">₩ {Number(product.price).toLocaleString()}</p>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default function SearchPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-brand-primary/20 border-t-brand-primary rounded-full animate-spin"></div>
            </div>
        }>
            <SearchContent />
        </Suspense>
    );
}
