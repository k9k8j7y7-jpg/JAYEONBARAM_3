"use client";

import { motion } from "framer-motion";
import { ChevronRight, Sparkles, MoveRight } from "lucide-react";
import { cn } from "@/lib/utils";

const Hero = () => {
    return (
        <section className="relative h-screen w-full flex items-center justify-center overflow-hidden bg-brand-primary">
            {/* Background with Ambient Motion */}
            <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-black/40 z-10" /> {/* Dark Overlay for readability */}
                <motion.div 
                    initial={{ scale: 1.1 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 10, repeat: Infinity, repeatType: "reverse" }}
                    className="w-full h-full bg-[url('https://images.unsplash.com/photo-1562322140-8baeececf3df?q=80&w=2069&auto=format&fit=crop')] bg-cover bg-center" 
                />
            </div>

            <div className="relative z-20 text-center px-6 max-w-5xl mx-auto space-y-10 pt-24 md:pt-0">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/10 text-white border border-white/20 backdrop-blur-md text-xs font-bold mb-4 tracking-widest uppercase"
                >
                    <Sparkles size={14} className="text-green-400 animate-pulse" />
                    <span>Premium Professional Hair Care</span>
                </motion.div>

                <div className="space-y-6">
                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, delay: 0.2 }}
                        className="text-5xl md:text-9xl font-bold text-white font-sans tracking-tight leading-tight"
                    >
                        당신의 헤어에 <br />
                        <span className="text-green-300">자연의 리듬</span>을
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                        className="text-lg md:text-2xl text-white/80 max-w-3xl mx-auto font-light leading-relaxed"
                    >
                        인위적임을 넘어선 본연의 건강함. <br className="hidden md:block" />
                        전국 2,000여 개 살롱이 선택한 자연바람의 혁신적인 케어 시스템을 만나보세요.
                    </motion.p>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.6 }}
                    className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-10"
                >
                    <button className="px-12 py-5 bg-transparent border-2 border-white/30 text-white rounded-2xl font-bold text-xl hover:bg-white/10 transition-all backdrop-blur-sm active:scale-95">
                        브랜드 스토리
                    </button>
                </motion.div>

                <div className="pt-20 grid grid-cols-3 gap-12 border-t border-white/10">
                    {[
                        { label: "Partner Salons", value: "2,000+" },
                        { label: "Natural Ingredients", value: "98%" },
                        { label: "Designers Choice", value: "Premium" },
                    ].map((stat, i) => (
                        <motion.div 
                            key={i}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 1 + i * 0.1 }}
                            className="space-y-1"
                        >
                            <p className="text-2xl md:text-4xl font-serif font-bold text-green-300">{stat.value}</p>
                            <p className="text-[10px] md:text-xs text-white/50 font-bold uppercase tracking-widest">{stat.label}</p>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Ambient Background Elements */}
            <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-brand-primary/20 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-green-500/10 rounded-full blur-[120px] pointer-events-none" />
            
            {/* Scroll Indicator */}
            <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="absolute bottom-10 left-1/2 -translate-x-1/2 text-white/30 hidden md:block"
            >
                <div className="w-[1px] h-16 bg-gradient-to-b from-white to-transparent mx-auto" />
            </motion.div>
        </section>
    );
};

export default Hero;
