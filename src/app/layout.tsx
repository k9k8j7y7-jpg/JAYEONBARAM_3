import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "자연바람(Natural Breeze) | 프로페셔널 헤어케어",
  description: "전국 2,000여 개 미용실이 선택한 프로페셔널 헤어케어 브랜드, 자연바람(구 나투리아) 공식 웹사이트입니다. 비주얼씽킹으로 만나는 전문적인 헤어 솔루션.",
  keywords: ["자연바람", "나투리아", "신데렐라 클리닉", "포레스트 라인", "헤어케어", "미용실 전용 샴푸"],
  openGraph: {
    title: "자연바람(Natural Breeze)",
    description: "전문가가 제안하는 프리미엄 헤어케어 솔루션",
    type: "website",
    locale: "ko_KR",
  }
};

import { AuthProvider } from "@/contexts/AuthContext";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        <link
          rel="stylesheet"
          as="style"
          crossOrigin="anonymous"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css"
        />
        <link href="https://fonts.googleapis.com/css2?family=Noto+Serif+KR:wght@400;700&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased">
        <AuthProvider>
          <Navbar />
          <main className="min-h-screen">
            {children}
          </main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
