"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, Suspense, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Check, AlertCircle } from "lucide-react";

function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { login } = useAuth();
    
    const [isLoading, setIsLoading] = useState(false);
    const [isSocialLoading, setIsSocialLoading] = useState(false);
    const [error, setError] = useState("");
    const [formData, setFormData] = useState({
        username: "",
        password: "",
        remember: false
    });

    // OAuth 콜백 처리
    useEffect(() => {
        const code = searchParams.get("code");
        const provider = searchParams.get("provider");

        if (code && provider) {
            handleSocialCallback(provider, code);
        }
    }, [searchParams]);

    const handleSocialCallback = async (provider: string, code: string) => {
        setIsSocialLoading(true);
        setError("");
        
        try {
            const apiEndpoint = provider === 'google' ? '/api/oauth_google.php' : '/api/oauth_kakao.php';
            const response = await fetch(apiEndpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ code }),
            });

            const result = await response.json();

            if (result.success) {
                login(result.token, result.user, true);
                router.push("/");
            } else {
                setError(result.message || "소셜 로그인에 실패했습니다.");
            }
        } catch (err) {
            console.error("Social login error:", err);
            setError("서버와 통신 중 오류가 발생했습니다.");
        } finally {
            setIsSocialLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
        if (error) setError("");
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.username || !formData.password) {
            setError("아이디와 비밀번호를 모두 입력해주세요.");
            return;
        }

        setIsLoading(true);
        setError("");

        try {
            const response = await fetch("/api/login.php", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            const result = await response.json();

            if (result.success) {
                login(result.token, result.user, formData.remember);
                router.push("/");
            } else {
                setError(result.message || "로그인에 실패했습니다.");
            }
        } catch (err) {
            console.error("Login error:", err);
            setError("서버와 통신 중 오류가 발생했습니다.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSocialLogin = (provider: string) => {
        const currentUrl = window.location.origin + window.location.pathname;
        
        if (provider === 'Google') {
            const clientId = '214753280019-e4evt26r68b13f6dmikie5pt3keiec38.apps.googleusercontent.com';
            const scope = 'https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email';
            const redirectUri = `${currentUrl}?provider=google`;
            
            window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent(scope)}&access_type=offline`;
        } else if (provider === 'Kakao') {
            const clientId = 'ce0effd03ea10e1edb68f9eff21b47ae';
            const redirectUri = `${currentUrl}?provider=kakao`;
            
            window.location.href = `https://kauth.kakao.com/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code`;
        }
    };

    return (
        <div className="max-w-md mx-auto px-6">
            <div className="text-center mb-12">
                <h1 className="text-3xl md:text-4xl font-serif font-bold text-brand-primary mb-4 tracking-tight">LOGIN</h1>
                <p className="text-gray-400 text-sm tracking-widest font-medium">자연바람에 오신 것을 환영합니다.</p>
            </div>

            <form onSubmit={handleLogin} className="bg-white border-t-2 border-brand-primary pt-10 space-y-6">
                <div className="space-y-2">
                    <label className="text-xs font-bold text-brand-text uppercase tracking-wider">ID</label>
                    <input 
                        name="username"
                        type="text" 
                        value={formData.username}
                        onChange={handleChange}
                        className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:border-brand-primary focus:bg-white outline-none transition-all placeholder:text-gray-300"
                        placeholder="아이디를 입력해주세요"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-bold text-brand-text uppercase tracking-wider">PASSWORD</label>
                    <input 
                        name="password"
                        type="password" 
                        value={formData.password}
                        onChange={handleChange}
                        className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:border-brand-primary focus:bg-white outline-none transition-all placeholder:text-gray-300"
                        placeholder="비밀번호를 입력해주세요"
                    />
                </div>

                <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer group">
                        <div className={`w-5 h-5 rounded border ${formData.remember ? 'bg-brand-primary border-brand-primary' : 'bg-white border-gray-300'} flex items-center justify-center transition-all`}>
                            {formData.remember && <Check size={14} className="text-white" />}
                        </div>
                        <input 
                            name="remember"
                            type="checkbox" 
                            className="hidden" 
                            checked={formData.remember}
                            onChange={handleChange}
                        />
                        <span className="text-sm font-medium text-gray-400 group-hover:text-brand-primary transition-colors">로그인 유지</span>
                    </label>
                    <Link href="/myshop/find-password" title="비밀번호 찾기" className="text-sm text-gray-400 font-medium hover:text-brand-primary transition-colors">
                        비밀번호 찾기
                    </Link>
                </div>

                <AnimatePresence mode="wait">
                    {(error || isSocialLoading) && (
                        <motion.div 
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className={`p-4 rounded-xl flex items-center gap-3 text-sm font-medium border ${isSocialLoading ? 'bg-blue-50 text-blue-500 border-blue-100' : 'bg-red-50 text-red-500 border-red-100'}`}
                        >
                            <AlertCircle size={18} />
                            {isSocialLoading ? "소셜 로그인 처리 중..." : error}
                        </motion.div>
                    )}
                </AnimatePresence>

                <button 
                    type="submit"
                    disabled={isLoading || isSocialLoading}
                    className={`w-full py-5 ${(isLoading || isSocialLoading) ? 'bg-gray-300 cursor-not-allowed shadow-none' : 'bg-brand-primary shadow-xl shadow-brand-primary/20 hover:bg-[#2F3E2E]'} text-white text-base font-bold rounded-xl transition-all active:scale-[0.98]`}
                >
                    {isLoading ? "로그인 중..." : "LOGIN"}
                </button>

                <div className="flex items-center gap-4 py-4">
                    <div className="flex-1 h-px bg-gray-100" />
                    <span className="text-[10px] text-gray-300 font-bold uppercase tracking-widest">OR</span>
                    <div className="flex-1 h-px bg-gray-100" />
                </div>

                <div className="space-y-3">
                    <button 
                        type="button"
                        onClick={() => handleSocialLogin('Google')}
                        disabled={isSocialLoading}
                        className="w-full py-4 border border-gray-200 rounded-xl flex items-center justify-center gap-3 hover:bg-gray-50 transition-all active:scale-[0.98] disabled:opacity-50"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                        </svg>
                        <span className="text-sm font-bold text-gray-700">Google 계정으로 로그인</span>
                    </button>
                    <button 
                        type="button"
                        onClick={() => handleSocialLogin('Kakao')}
                        disabled={isSocialLoading}
                        className="w-full py-4 bg-[#FEE500] rounded-xl flex items-center justify-center gap-3 hover:bg-[#FDD835] transition-all active:scale-[0.98] disabled:opacity-50"
                    >
                        <svg className="w-5 h-5 text-[#191919]" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 3c-4.97 0-9 3.185-9 7.115 0 2.558 1.712 4.8 4.312 6.111l-.817 3.034c-.046.176.028.371.185.441.05.023.104.034.157.034.111 0 .216-.051.282-.143l3.522-4.86c.439.049.887.083 1.349.083 4.97 0 9-3.185 9-7.115S16.97 3 12 3z" />
                        </svg>
                        <span className="text-sm font-bold text-[#191919]">카카오 로그인</span>
                    </button>
                </div>

                <div className="pt-8 text-center border-t border-gray-50">
                    <p className="text-sm text-gray-400 font-medium">
                        아직 회원이 아니신가요?{" "}
                        <Link href="/myshop/register" className="text-brand-primary font-bold hover:underline underline-offset-4 ml-2">
                            회원가입
                        </Link>
                    </p>
                </div>
            </form>
        </div>
    );
}

export default function LoginPage() {
    return (
        <div className="min-h-screen bg-white pt-32 pb-24 font-sans text-brand-text">
            <Suspense fallback={<div className="text-center py-20 text-gray-400">Loading...</div>}>
                <LoginForm />
            </Suspense>
        </div>
    );
}
