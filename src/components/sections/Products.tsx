"use client";

import { motion } from "framer-motion";
import { Sparkles, Trees, Scissors } from "lucide-react";

const collections = [
    {
        title: "신데렐라 라인",
        subtitle: "손상고민 케어",
        description: "클리닉 시술의 한계를 넘어서는 압도적 회복력. 단 한 번의 시술로 마법 같은 머릿결을 선사합니다.",
        icon: <Sparkles className="w-8 h-8" />,
        color: "bg-blue-50 text-blue-900 border-blue-100",
        image: "https://images.unsplash.com/photo-1562322140-8baeececf3df?q=80&w=2069&auto=format&fit=crop"
    },
    {
        title: "포레스트 라인",
        subtitle: "두피 & 탈모 케어",
        description: "숲의 생명력을 담은 샴푸, 워시, 토닉. 건강한 두피 환경으로부터 시작되는 진정한 모발 건강.",
        icon: <Trees className="w-8 h-8" />,
        color: "bg-green-50 text-green-900 border-green-100",
        image: "https://images.unsplash.com/photo-1559599101-f09722fb4948?q=80&w=2069&auto=format&fit=crop"
    },
    {
        title: "스타일링 라인",
        subtitle: "피니쉬 & 텍스처",
        description: "폴리머 오일과 전문 스타일링 제품으로 완성하는 디자이너의 감각. 일상을 예술로 바꾸는 텍스처.",
        icon: <Scissors className="w-8 h-8" />,
        color: "bg-orange-50 text-orange-900 border-orange-100",
        image: "https://images.unsplash.com/photo-1527799820374-d888a966b424?q=80&w=2000&auto=format&fit=crop"
    }
];

const Products = () => {
    return (
        <section id="products" className="py-24 px-6 bg-white">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
                    <div className="space-y-4">
                        <span className="text-brand-primary font-bold tracking-widest text-sm uppercase">Curated Collection</span>
                        <h2 className="text-4xl md:text-5xl font-bold font-serif">시각적 솔루션으로 <br />만나는 제품 라인업</h2>
                    </div>
                    <p className="text-gray-500 max-w-md text-lg leading-relaxed">
                        비주얼씽킹을 통해 직관적으로 설계된 각 라인업은 여러분의 모발 고민에 가장 완벽한 해답을 제시합니다.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {collections.map((item, index) => (
                        <motion.div
                            key={item.title}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            viewport={{ once: true }}
                            className="group cursor-pointer"
                        >
                            <div className="relative h-[400px] rounded-3xl overflow-hidden mb-6 shadow-xl transition-transform duration-500 group-hover:scale-[1.02]">
                                <img
                                    src={item.image}
                                    alt={item.title}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                                <div className="absolute bottom-8 left-8 right-8 text-white">
                                    <div className="p-3 inline-block rounded-2xl bg-white/20 backdrop-blur-md mb-4">
                                        {item.icon}
                                    </div>
                                    <h3 className="text-2xl font-bold mb-1">{item.title}</h3>
                                    <p className="text-white/70 font-medium">{item.subtitle}</p>
                                </div>
                            </div>
                            <div className="px-2 space-y-3">
                                <p className="text-gray-600 leading-relaxed text-sm">
                                    {item.description}
                                </p>
                                <div className="flex items-center gap-2 text-brand-primary font-bold text-sm group-hover:gap-3 transition-all">
                                    상세보기 <span className="text-lg">→</span>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Products;
