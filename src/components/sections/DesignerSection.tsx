"use client";

import { motion } from "framer-motion";
import { CheckCircle2, UserCheck, BookOpen } from "lucide-react";

const steps = [
    {
        title: "전문가 인증",
        desc: "미용실 사업자 인증을 통해 프로페셔널 회원이 되세요.",
        icon: <UserCheck className="w-6 h-6" />
    },
    {
        title: "기술 가이드",
        desc: "신데렐라 클리닉 등 고난도 시술의 정석을 확인하세요.",
        icon: <BookOpen className="w-6 h-6" />
    },
    {
        title: "전용 구매",
        desc: "디자이너 전용 특가와 한정판 구성을 만나보세요.",
        icon: <CheckCircle2 className="w-6 h-6" />
    }
];

const DesignerSection = () => {
    return (
        <section id="designer" className="py-24 px-6 bg-brand-secondary">
            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                <motion.div
                    initial={{ opacity: 0, x: -30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: true }}
                    className="relative"
                >
                    <div className="relative z-10 rounded-3xl overflow-hidden shadow-2xl">
                        <img
                            src="https://images.unsplash.com/photo-1560066914-1f2249b775a2?q=80&w=2024&auto=format&fit=crop"
                            alt="Professional Hair Designer"
                            className="w-full h-[600px] object-cover"
                        />
                        <div className="absolute inset-0 bg-brand-primary/20 mix-blend-multiply" />
                    </div>
                    <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-brand-primary rounded-3xl -z-0 hidden md:block" />

                    <div className="absolute top-10 right-10 z-20 bg-white/90 backdrop-blur-md p-6 rounded-2xl shadow-xl max-w-[240px]">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                            <span className="text-sm font-bold text-brand-primary">LIVE EDUCATION</span>
                        </div>
                        <p className="text-xs text-brand-text font-medium leading-relaxed">
                            현재 1,240명의 디자이너가 신데렐라 클리닉 가이드를 시청 중입니다.
                        </p>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, x: 30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: true }}
                    className="space-y-10"
                >
                    <div className="space-y-6">
                        <h2 className="text-4xl md:text-5xl font-bold font-serif leading-tight">
                            디자이너의 기술에 <br />
                            <span className="text-brand-primary underline decoration-green-300 underline-offset-8">확신을 더하다</span>
                        </h2>
                        <p className="text-gray-600 text-lg leading-relaxed">
                            자연바람은 단순한 제품 공급을 넘어, 전국 미용실 리더들과 함께 성장합니다. 전문가만의 특권을 누리세요.
                        </p>
                    </div>

                    <div className="space-y-6">
                        {steps.map((step, idx) => (
                            <div key={idx} className="flex gap-4 p-4 rounded-2xl bg-white shadow-sm border border-brand-secondary transition-all hover:shadow-md">
                                <div className="w-12 h-12 rounded-xl bg-brand-secondary flex items-center justify-center text-brand-primary shrink-0">
                                    {step.icon}
                                </div>
                                <div>
                                    <h4 className="font-bold text-brand-primary mb-1">{step.title}</h4>
                                    <p className="text-sm text-gray-500">{step.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 pt-4">
                        <button className="px-8 py-4 bg-brand-primary text-white rounded-xl font-bold hover:bg-green-900 transition-all flex items-center justify-center gap-2">
                            디자이너 인증하기
                        </button>
                        <button className="px-8 py-4 bg-white border border-brand-primary text-brand-primary rounded-xl font-bold hover:bg-brand-secondary transition-all flex items-center justify-center gap-2">
                            커뮤니티 입장
                        </button>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};

export default DesignerSection;
