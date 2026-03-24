"use client";

import { motion } from "framer-motion";
import { Search, HelpCircle, MessageCircle, Phone, ArrowRight } from "lucide-react";

const FAQ = [
    { q: "신데렐라 클리닉의 지속 기간은 어느 정도인가요?", a: "모발 상태에 따라 다르지만, 평균적으로 1~2개월 정도 지속되며 전용 홈케어 제품 사용 시 더욱 오래 유지됩니다." },
    { q: "포레스트 샴푸는 임산부도 사용 가능한가요?", a: "네, 포레스트 라인은 세정 성분부터 향료까지 자연 유래 성분을 우선시하여 모든 가족이 안심하고 사용하실 수 있습니다." },
    { q: "제품 유통기한은 어떻게 되나요?", a: "미개봉 시 제조일로부터 3년, 개봉 후에는 12개월 이내 사용을 권장합니다." }
];

const Support = () => {
    return (
        <section id="support" className="py-32 px-6 bg-brand-secondary/30 relative overflow-hidden">
            {/* Background Accent */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-primary/5 rounded-full blur-[120px] -mr-64 -mt-64" />
            
            <div className="max-w-6xl mx-auto relative z-10">
                <div className="grid lg:grid-cols-2 gap-20 items-start">
                    {/* Left: Contact Info */}
                    <div className="space-y-12">
                        <div className="space-y-6">
                            <motion.span 
                                initial={{ opacity: 0 }}
                                whileInView={{ opacity: 1 }}
                                className="inline-block px-4 py-1.5 rounded-full bg-brand-primary/10 text-brand-primary text-xs font-black tracking-widest uppercase"
                            >
                                Help & Support
                            </motion.span>
                            <h2 className="text-5xl md:text-6xl font-bold font-serif leading-tight text-brand-text">
                                전문가의 서포트가 <br />필요하신가요?
                            </h2>
                            <p className="text-gray-500 text-xl font-medium max-w-md">
                                제품 사용법부터 대량 구매 문의까지, <br />
                                궁금하신 점을 언제든 물어보세요.
                            </p>
                        </div>

                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-1">
                            <motion.div 
                                whileHover={{ scale: 1.02 }}
                                className="p-8 rounded-[2.5rem] bg-brand-primary text-white shadow-2xl shadow-brand-primary/20 flex flex-col justify-between aspect-square lg:aspect-auto lg:h-64 group cursor-pointer"
                            >
                                <div className="space-y-4">
                                    <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center">
                                        <MessageCircle size={28} />
                                    </div>
                                    <h3 className="text-2xl font-bold">카카오톡 상담</h3>
                                    <p className="text-white/70 text-sm leading-relaxed">평일 10:00 - 17:00 (점심 12-13)</p>
                                </div>
                                <div className="flex items-center gap-2 font-bold group-hover:gap-4 transition-all">
                                    문의하기 <ArrowRight size={20} />
                                </div>
                            </motion.div>

                            <motion.div 
                                whileHover={{ scale: 1.02 }}
                                className="p-8 rounded-[2.5rem] bg-white border border-brand-secondary shadow-xl flex flex-col justify-between aspect-square lg:aspect-auto lg:h-64 group cursor-pointer"
                            >
                                <div className="space-y-4">
                                    <div className="w-14 h-14 rounded-2xl bg-brand-secondary flex items-center justify-center text-brand-primary">
                                        <Phone size={28} />
                                    </div>
                                    <h3 className="text-2xl font-bold text-brand-text">고객센터</h3>
                                    <p className="text-gray-400 text-sm leading-relaxed font-medium">02-6956-9904</p>
                                </div>
                                <div className="flex items-center gap-2 font-bold text-brand-primary group-hover:gap-4 transition-all">
                                    전화 연결 <ArrowRight size={20} />
                                </div>
                            </motion.div>
                        </div>
                    </div>

                    {/* Right: Search & FAQ */}
                    <div className="space-y-12 bg-white p-10 md:p-16 rounded-[3rem] shadow-2xl shadow-brand-text/5">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="무엇을 찾고 계신가요?"
                                className="w-full pl-6 pr-16 py-6 bg-brand-secondary/50 rounded-2xl border-2 border-transparent focus:border-brand-primary/20 focus:bg-white transition-all text-lg outline-none font-medium"
                            />
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-brand-primary text-white rounded-xl flex items-center justify-center shadow-lg cursor-pointer hover:scale-105 transition-transform">
                                <Search size={20} />
                            </div>
                        </div>

                        <div className="space-y-8">
                            <div className="flex items-center justify-between border-b-2 border-brand-secondary pb-6">
                                <h4 className="text-2xl font-bold font-serif text-brand-text italic">FAQ</h4>
                                <span className="text-sm font-bold text-gray-400 cursor-pointer hover:text-brand-primary transition-colors">전체보기</span>
                            </div>
                            <div className="space-y-4">
                                {FAQ.map((item, idx) => (
                                    <motion.div 
                                        key={idx}
                                        initial={{ opacity: 0, x: 20 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.1 }}
                                        className="group cursor-pointer p-6 rounded-2xl bg-brand-secondary/30 hover:bg-brand-primary/5 transition-all"
                                    >
                                        <div className="flex justify-between items-center">
                                            <p className="font-bold text-brand-text group-hover:text-brand-primary transition-colors pr-8 leading-snug">
                                                {item.q}
                                            </p>
                                            <ArrowRight size={18} className="text-brand-secondary group-hover:text-brand-primary group-hover:translate-x-1 transition-all flex-shrink-0" />
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Support;
