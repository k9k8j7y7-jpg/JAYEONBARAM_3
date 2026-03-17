"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronRight, SlidersHorizontal } from "lucide-react";

interface Product {
    id: number;
    name: string;
    description: string;
    price: number;
    image_url: string;
}

interface ProductListProps {
    categorySlug: string;
    categoryName: string;
}

const ProductList = ({ categorySlug, categoryName }: ProductListProps) => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [sortBy, setSortBy] = useState("new");

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            try {
                // 로컬 개발 환경의 API 주소 사용
                const response = await fetch(`http://localhost:8000/get_products.php?category=${categorySlug}`);
                const data = await response.json();
                setProducts(data);
            } catch (error) {
                console.error("Failed to fetch products:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, [categorySlug]);

    const sortedProducts = [...products].sort((a, b) => {
        if (sortBy === "price-low") return a.price - b.price;
        if (sortBy === "price-high") return b.price - a.price;
        return 0; // default (new)
    });

    return (
        <div className="min-h-screen bg-white pt-32 pb-20">
            <div className="max-w-7xl mx-auto px-6">
                {/* Breadcrumb & Title */}
                <div className="mb-12">
                    <nav className="flex items-center gap-2 text-sm text-gray-400 mb-4 font-medium">
                        <Link href="/" className="hover:text-brand-primary transition-colors">Home</Link>
                        <ChevronRight size={14} />
                        <Link href="/shop" className="hover:text-brand-primary transition-colors">Shop</Link>
                        <ChevronRight size={14} />
                        <span className="text-brand-primary font-bold">{categoryName}</span>
                    </nav>
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <motion.h1 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-4xl md:text-5xl font-serif font-bold text-brand-primary"
                        >
                            {categoryName}
                        </motion.h1>
                        
                        {/* Sort Options */}
                        <div className="flex items-center gap-4 border-b border-gray-100 pb-2">
                            <SlidersHorizontal size={18} className="text-gray-400" />
                            <select 
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="bg-transparent text-sm font-medium text-gray-600 focus:outline-none cursor-pointer"
                            >
                                <option value="new">New in</option>
                                <option value="price-low">Price Low</option>
                                <option value="price-high">Price High</option>
                            </select>
                        </div>
                    </div>
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
                ) : (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5 }}
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12"
                    >
                        {sortedProducts.map((product, index) => (
                            <motion.div
                                key={product.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="group cursor-pointer"
                            >
                                <Link href={`/shop/product/${product.id}`}>
                                    <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-brand-secondary mb-6">
                                    <Image
                                        src={product.image_url || "/images/placeholder.jpg"}
                                        alt={product.name}
                                        fill
                                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                                        loading="lazy"
                                        unoptimized={true}
                                    />
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />
                                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 translate-y-10 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 w-11/12">
                                        <button className="w-full bg-white/90 backdrop-blur-md text-brand-primary py-3 rounded-xl text-sm font-bold shadow-xl active:scale-95 transition-transform">
                                            QUICK VIEW
                                        </button>
                                    </div>
                                </div>
                                    <div className="space-y-2">
                                        <h3 className="text-lg font-bold text-brand-text group-hover:text-brand-primary transition-colors">
                                            {product.name}
                                        </h3>
                                        <p className="text-sm text-gray-500 leading-relaxed line-clamp-2">
                                            {product.description}
                                        </p>
                                        <p className="text-lg font-serif font-bold text-brand-primary pt-1">
                                            ₩ {product.price.toLocaleString()}
                                        </p>
                                    </div>
                                </Link>
                            </motion.div>
                        ))}
                    </motion.div>
                )}

                {!loading && sortedProducts.length === 0 && (
                    <div className="py-40 text-center">
                        <p className="text-gray-400 font-medium">준비된 상품이 없습니다.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProductList;
