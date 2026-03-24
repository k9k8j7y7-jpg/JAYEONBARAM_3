"use client";

import { motion } from "framer-motion";
import { CheckCircle, PenTool, Database, MessageSquare } from "lucide-react";

const steps = [
    { title: "고민 파악", desc: "고객의 생생한 목소리를 수집합니다.", icon: <MessageSquare className="w-6 h-6" /> },
    { title: "비주얼 설계", desc: "직관적인 사용 시나리오를 설계합니다.", icon: <PenTool className="w-6 h-6" /> },
    { title: "포뮬러 개발", desc: "검증된 논문을 바탕으로 성분을 조합합니다.", icon: <Database className="w-6 h-6" /> },
    { title: "필드 테스트", desc: "2,000개 미용실의 검증을 거칩니다.", icon: <CheckCircle className="w-6 h-6" /> }
];

const VisualThinking = () => {
    return (
        <section id="about" className="py-24 px-6 bg-white overflow-hidden">
            <div className="max-w-7xl mx-auto">
                <div className="text-center space-y-4 mb-20">
                    <span className="text-brand-primary font-bold tracking-widest text-sm uppercase">Our Philosophy</span>
                    <h2 className="text-4xl md:text-5xl font-bold font-serif leading-tight">
                        우리는 머릿결을 <br className="md:hidden" /> <span className="text-gradient">시각화(Visualize)</span> 합니다
                    </h2>
                    <p className="text-gray-500 max-w-2xl mx-auto text-lg">
                        복잡한 화학적 시술 과정을 누구나 이해할 수 있는 직관적인 비주얼로 표현하여 더 나은 헤어 라이프스타일을 제안합니다.
                    </p>
                </div>

                <div className="relative">
                    {/* Connector Line (Desktop) */}
                    <div className="absolute top-1/2 left-0 right-0 h-[2px] bg-brand-secondary -translate-y-1/2 hidden lg:block" />

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
                        {steps.map((step, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.5, delay: idx * 0.1 }}
                                viewport={{ once: true }}
                                className="bg-white p-8 rounded-3xl border border-brand-secondary shadow-sm hover:shadow-xl transition-all group text-center flex flex-col items-center"
                            >
                                <div className="w-20 h-20 rounded-full bg-brand-secondary flex items-center justify-center text-brand-primary mb-6 transition-all group-hover:bg-brand-primary group-hover:text-white group-hover:rotate-[10deg]">
                                    {step.icon}
                                </div>
                                <div className="absolute -top-3 -left-3 w-10 h-10 rounded-full bg-white border border-brand-secondary flex items-center justify-center font-bold text-brand-primary text-xs shadow-sm">
                                    0{idx + 1}
                                </div>
                                <h4 className="text-xl font-bold mb-3">{step.title}</h4>
                                <p className="text-sm text-gray-500 leading-relaxed">{step.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>

                <div className="mt-20 p-12 bg-brand-primary rounded-[3rem] relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                    <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
                        <div className="md:w-1/2 space-y-6">
                            <h3 className="text-3xl font-bold text-white font-serif">디자이너와 함께 만드는 <br />인포그래픽 케어</h3>
                            <p className="text-white/60 leading-relaxed">
                                자연바람의 모든 제품은 단순한 생산이 아닌, 현직 디자이너들의 비주얼 피드백을 통해 탄생합니다. 어떻게 하면 더 직관적으로 시술 결과를 보여줄 수 있을지, 우리는 매일 비주얼씽킹을 통해 고민합니다.
                            </p>
                            <div className="flex gap-4">
                                <div className="flex -space-x-3">
                                    {[1, 2, 3, 4].map((i) => (
                                        <div key={i} className="w-10 h-10 rounded-full border-2 border-brand-primary bg-gray-200 overflow-hidden">
                                            <img src={`https://i.pravatar.cc/150?u=${i + 10}`} alt="avatar" />
                                        </div>
                                    ))}
                                </div>
                                <p className="text-white text-sm font-medium flex items-center">2,000+ 전문가 참여</p>
                            </div>
                        </div>
                        <div className="md:w-1/2 bg-white/10 rounded-2xl p-4 backdrop-blur-md border border-white/20">
                            <img
                                src="https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=2070&auto=format&fit=crop"
                                alt="Visual Thinking Process"
                                className="rounded-lg shadow-inner grayscale opacity-80"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default VisualThinking;
