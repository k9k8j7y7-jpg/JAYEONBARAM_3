"use client";

import { Instagram, MapPin, Phone, Clock } from "lucide-react";
import Link from "next/link";

const Footer = () => {
    return (
        <footer className="bg-brand-primary text-white pt-16 pb-8 px-6">
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 border-b border-white/10 pb-12 mb-12">
                <div className="space-y-6">
                    <Link href="/" className="text-3xl font-bold font-serif tracking-tighter">
                        자연바람
                    </Link>
                    <p className="text-white/60 text-sm leading-relaxed max-w-xs">
                        전국 2,000여 개 미용실이 선택한 프로페셔널 헤어케어 브랜드. 자연의 바람처럼 상쾌하고 건강한 머릿결을 약속합니다.
                    </p>
                    <div className="flex gap-4">
                        <Link href="https://www.instagram.com/naturia_life" target="_blank" className="bg-white/10 p-2 rounded-full hover:bg-white/20 transition-all">
                            <Instagram size={20} />
                        </Link>
                    </div>
                </div>

                <div className="space-y-4">
                    <h4 className="font-bold text-lg">Contact Info</h4>
                    <ul className="space-y-4">
                        <li className="flex items-start gap-3 text-sm text-white/70">
                            <MapPin size={18} className="shrink-0 text-white/40" />
                            <span>서울특별시 성동구 마장로39나길 13(마장동)</span>
                        </li>
                        <li className="flex items-center gap-3 text-sm text-white/70">
                            <Phone size={18} className="text-white/40" />
                            <span>02-6956-9904</span>
                        </li>
                        <li className="flex items-center gap-3 text-sm text-white/70">
                            <Clock size={18} className="text-white/40" />
                            <span>운영시간: 10:00 ~ 17:00 (주말/공휴일 휴무)</span>
                        </li>
                    </ul>
                </div>

                <div className="space-y-4">
                    <h4 className="font-bold text-lg">Business Info</h4>
                    <ul className="space-y-2 text-sm text-white/60">
                        <li><span className="text-white/40">상호명:</span> 자연바람</li>
                        <li><span className="text-white/40">사업자등록번호:</span> 761-28-00865</li>
                        <li><span className="text-white/40">통신판매신고번호:</span> 2020-의정부송산-0550호</li>
                    </ul>
                </div>
            </div>

            <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-white/40">
                <p>© 2026 자연바람 (Natural Breeze). All Rights Reserved.</p>
                <div className="flex gap-6">
                    <Link href="/terms" className="hover:text-white transition-colors">이용약관</Link>
                    <Link href="/privacy" className="hover:text-white transition-colors">개인정보처리방침</Link>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
