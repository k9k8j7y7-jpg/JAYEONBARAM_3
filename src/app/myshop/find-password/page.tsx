"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronRight, Check, AlertCircle, Lock, Mail, User } from "lucide-react";

export default function FindPasswordPage() {
    const router = useRouter();
    const [step, setStep] = useState(1); // 1: 본인확인, 2: 비밀번호 재설정, 3: 완료
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        newPassword: "",
        confirmPassword: ""
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
        if (error) setError("");
    };

    // Step 1: 본인 확인
    const handleVerifyUser = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.username || !formData.email) {
            setError("아이디와 이메일을 모두 입력해주세요.");
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch("/api/find_password.php", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username: formData.username, email: formData.email }),
            });
            const result = await response.json();
            if (result.success) {
                setStep(2);
            } else {
                setError(result.message || "일치하는 정보가 없습니다.");
            }
        } catch (err) {
            setError("서버 통신 중 오류가 발생했습니다.");
        } finally {
            setIsLoading(false);
        }
    };

    // Step 2: 비밀번호 재설정
    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // 유효성 검사 (회원가입과 동일한 로직)
        const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d|.*[!@#$%^&*()_+])[A-Za-z\d!@#$%^&*()_+]{10,16}$/;
        if (!passwordRegex.test(formData.newPassword)) {
            setError("영문/숫자/특수문자 중 2가지 이상 조합, 10~16자로 입력해주세요.");
            return;
        }
        if (formData.newPassword !== formData.confirmPassword) {
            setError("비밀번호가 일치하지 않습니다.");
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch("/api/reset_password.php", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });
            const result = await response.json();
            if (result.success) {
                setStep(3);
            } else {
                setError(result.message || "비밀번호 변경에 실패했습니다.");
            }
        } catch (err) {
            setError("서버 통신 중 오류가 발생했습니다.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white pt-32 pb-24 font-sans text-brand-text">
            <div className="max-w-md mx-auto px-6">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-3xl md:text-4xl font-serif font-bold text-brand-primary mb-4 tracking-tight uppercase">Find Password</h1>
                    <p className="text-gray-400 text-sm tracking-widest font-medium">
                        {step === 1 && "가입 시 등록한 정보로 본인을 확인합니다."}
                        {step === 2 && "새로운 비밀번호를 설정해주세요."}
                        {step === 3 && "비밀번호 변경이 완되되었습니다."}
                    </p>
                </div>

                {/* Progress Dots */}
                <div className="flex justify-center gap-3 mb-12">
                    {[1, 2, 3].map((s) => (
                        <div 
                            key={s} 
                            className={`w-2 h-2 rounded-full transition-all duration-300 ${step === s ? 'w-8 bg-brand-primary' : 'bg-gray-200'}`} 
                        />
                    ))}
                </div>

                <div className="bg-white border-t-2 border-brand-primary pt-10">
                    <AnimatePresence mode="wait">
                        {step === 1 && (
                            <motion.form 
                                key="step1"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                onSubmit={handleVerifyUser}
                                className="space-y-6"
                            >
                                <div className="space-y-4">
                                    <div className="relative">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                                        <input 
                                            name="username"
                                            type="text"
                                            placeholder="아이디"
                                            value={formData.username}
                                            onChange={handleChange}
                                            className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:border-brand-primary focus:bg-white outline-none transition-all"
                                        />
                                    </div>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                                        <input 
                                            name="email"
                                            type="email"
                                            placeholder="이메일 주소"
                                            value={formData.email}
                                            onChange={handleChange}
                                            className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:border-brand-primary focus:bg-white outline-none transition-all"
                                        />
                                    </div>
                                </div>
                                {error && (
                                    <div className="p-4 bg-red-50 text-red-500 text-xs font-bold rounded-xl flex items-center gap-2 border border-red-100">
                                        <AlertCircle size={14} /> {error}
                                    </div>
                                )}
                                <button 
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full py-5 bg-brand-primary text-white font-bold rounded-xl shadow-xl shadow-brand-primary/20 hover:bg-[#2F3E2E] transition-all disabled:bg-gray-300"
                                >
                                    {isLoading ? "확인 중..." : "다음 단계로"}
                                </button>
                            </motion.form>
                        )}

                        {step === 2 && (
                            <motion.form 
                                key="step2"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                onSubmit={handleResetPassword}
                                className="space-y-6"
                            >
                                <div className="space-y-4">
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                                        <input 
                                            name="newPassword"
                                            type="password"
                                            placeholder="새 비밀번호"
                                            value={formData.newPassword}
                                            onChange={handleChange}
                                            className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:border-brand-primary focus:bg-white outline-none transition-all"
                                        />
                                    </div>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                                        <input 
                                            name="confirmPassword"
                                            type="password"
                                            placeholder="비밀번호 확인"
                                            value={formData.confirmPassword}
                                            onChange={handleChange}
                                            className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:border-brand-primary focus:bg-white outline-none transition-all"
                                        />
                                    </div>
                                    <p className="text-[11px] text-gray-400 font-medium px-1">
                                        * 영문/숫자/특수문자 중 2가지 이상 조합, 10~16자
                                    </p>
                                </div>
                                {error && (
                                    <div className="p-4 bg-red-50 text-red-500 text-xs font-bold rounded-xl flex items-center gap-2 border border-red-100">
                                        <AlertCircle size={14} /> {error}
                                    </div>
                                )}
                                <button 
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full py-5 bg-brand-primary text-white font-bold rounded-xl shadow-xl shadow-brand-primary/20 hover:bg-[#2F3E2E] transition-all disabled:bg-gray-300"
                                >
                                    {isLoading ? "변경 중..." : "비밀번호 변경 완료"}
                                </button>
                            </motion.form>
                        )}

                        {step === 3 && (
                            <motion.div 
                                key="step3"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="text-center py-8 space-y-8"
                            >
                                <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto text-green-500 mb-6">
                                    <Check size={40} strokeWidth={3} />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-xl font-bold text-brand-text">변경이 완료되었습니다.</h3>
                                    <p className="text-sm text-gray-400">새로운 비밀번호로 다시 로그인해주세요.</p>
                                </div>
                                <Link 
                                    href="/myshop/login"
                                    className="inline-block w-full py-5 bg-brand-primary text-white font-bold rounded-xl shadow-xl shadow-brand-primary/20 hover:bg-[#2F3E2E] transition-all"
                                >
                                    로그인 페이지로 이동
                                </Link>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <div className="mt-12 text-center">
                    <Link href="/myshop/login" className="text-sm text-gray-400 hover:text-brand-primary flex items-center justify-center gap-1 transition-colors font-medium">
                        로그인 페이지로 돌아가기
                    </Link>
                </div>
            </div>
        </div>
    );
}
