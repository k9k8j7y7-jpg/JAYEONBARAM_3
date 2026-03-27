"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface ProtectedRouteProps {
    children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
    const { isLoggedIn, isLoading } = useAuth();
    const router = useRouter();
    const [isVerified, setIsVerified] = useState(false);

    useEffect(() => {
        if (!isLoading) {
            if (!isLoggedIn) {
                alert("로그인이 필요한 서비스입니다.\n로그인 페이지로 이동합니다.");
                router.push("/myshop/login/");
            } else {
                setIsVerified(true);
            }
        }
    }, [isLoggedIn, isLoading, router]);

    if (isLoading || !isVerified) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-4 border-brand-primary/20 border-t-brand-primary rounded-full animate-spin"></div>
                    <p className="text-sm text-gray-400 font-medium">인증 상태 확인 중...</p>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}
