"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Minus, ShoppingCart, CreditCard, ChevronRight } from "lucide-react";
import { API_URL } from "@/lib/utils";
import Link from "next/link";

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
    images: ImageItem[];
}

interface QuickViewModalProps {
    productId: number | null;
    onClose: () => void;
}

const QuickViewModal = ({ productId, onClose }: QuickViewModalProps) => {
    const [product, setProduct] = useState<ProductDetail | null>(null);
    const [loading, setLoading] = useState(false);
    const [quantity, setQuantity] = useState(1);
    const [selectedImage, setSelectedImage] = useState("");

    useEffect(() => {
        const fetchProductDetail = async () => {
            if (!productId) return;
            setLoading(true);
            try {
                const response = await fetch(`${API_URL}/get_product_detail.php?id=${productId}`);
                const data = await response.json();
                setProduct(data);
                setSelectedImage(data.image_url);
            } catch (error) {
                console.error("Failed to fetch product detail for QuickView:", error);
            } finally {
                setLoading(false);
            }
        };

        if (productId) {
            fetchProductDetail();
            // Reset quantity when opening new product
            setQuantity(1);
        } else {
            setProduct(null);
        }
    }, [productId]);

    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) onClose();
    };

    return (
        <AnimatePresence>
            {productId && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                    onClick={handleBackdropClick}
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        transition={{ type: "spring", duration: 0.5 }}
                        className="bg-white w-full max-w-4xl rounded-[32px] overflow-hidden shadow-2xl relative flex flex-col md:flex-row max-h-[90vh]"
                    >
                        {/* Close Button */}
                        <button
                            onClick={onClose}
                            className="absolute top-6 right-6 z-10 p-2 rounded-full bg-white/80 backdrop-blur-md text-gray-400 hover:text-brand-primary hover:scale-110 transition-all shadow-lg"
                        >
                            <X size={24} />
                        </button>

                        {loading ? (
                            <div className="flex-1 flex items-center justify-center min-vh-[50vh]">
                                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-brand-primary"></div>
                            </div>
                        ) : product ? (
                            <>
                                {/* Left: Image Section */}
                                <div className="md:w-1/2 p-8 bg-brand-secondary/30">
                                    <div className="relative aspect-square rounded-2xl overflow-hidden bg-white shadow-inner mb-6">
                                        <Image
                                            src={selectedImage || product.image_url}
                                            alt={product.name}
                                            fill
                                            className="object-cover"
                                            unoptimized
                                        />
                                    </div>
                                    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                                        {product.images?.map((img, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => setSelectedImage(img.image_path)}
                                                className={`relative w-20 aspect-square rounded-xl overflow-hidden flex-shrink-0 transition-all border-2 ${selectedImage === img.image_path ? "border-brand-primary" : "border-transparent"
                                                    }`}
                                            >
                                                <Image
                                                    src={img.image_path}
                                                    alt={`${product.name} thumbnail ${idx}`}
                                                    fill
                                                    className="object-cover"
                                                    unoptimized
                                                />
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Right: Info Section */}
                                <div className="md:w-1/2 p-10 flex flex-col justify-center">
                                    <div className="space-y-6">
                                        <div>
                                            <span className="text-brand-primary font-bold tracking-widest text-[10px] uppercase">JAYEONBARAM PREMIUM</span>
                                            <h2 className="text-3xl font-serif font-bold text-brand-text mt-1 leading-tight">
                                                {product.name}
                                            </h2>
                                            <p className="text-2xl font-serif font-bold text-brand-primary mt-3">
                                                ₩ {product.price.toLocaleString()}
                                            </p>
                                        </div>

                                        <p className="text-gray-500 leading-relaxed line-clamp-4 text-sm">
                                            {product.description}
                                        </p>

                                        <div className="py-6 border-y border-gray-100 flex items-center justify-between">
                                            <span className="text-sm font-bold text-gray-400">QUANTITY</span>
                                            <div className="flex items-center gap-4 bg-brand-secondary/50 px-4 py-2 rounded-xl">
                                                <button
                                                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                                                    className="text-brand-primary p-1 hover:bg-white rounded-lg transition-colors"
                                                >
                                                    <Minus size={16} />
                                                </button>
                                                <span className="w-8 text-center font-bold text-brand-text">{quantity}</span>
                                                <button
                                                    onClick={() => setQuantity(q => q + 1)}
                                                    className="text-brand-primary p-1 hover:bg-white rounded-lg transition-colors"
                                                >
                                                    <Plus size={16} />
                                                </button>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-bold text-gray-400">TOTAL</span>
                                            <span className="text-2xl font-serif font-bold text-brand-primary">
                                                ₩ {(product.price * quantity).toLocaleString()}
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 pt-4">
                                            <button className="bg-brand-secondary text-brand-primary py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-gray-200 transition-all active:scale-95">
                                                <ShoppingCart size={18} />
                                                장바구니
                                            </button>
                                            <button className="bg-brand-primary text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-brand-primary/90 transition-all shadow-lg shadow-brand-primary/20 active:scale-95">
                                                <CreditCard size={18} />
                                                구매하기
                                            </button>
                                        </div>

                                        <Link 
                                            href={`/shop/product/${product.id}`}
                                            onClick={onClose}
                                            className="flex items-center justify-center gap-1 text-xs text-gray-400 hover:text-brand-primary transition-colors font-medium mt-4 group"
                                        >
                                            제품 상세 정보 보기
                                            <ChevronRight size={12} className="group-hover:translate-x-1 transition-transform" />
                                        </Link>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="flex-1 p-20 text-center">
                                <p className="text-gray-400">상품 정보를 불러올 수 없습니다.</p>
                            </div>
                        )}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default QuickViewModal;
