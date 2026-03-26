"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Instagram, ChevronDown, Search } from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const NAV_DATA = [
    {
        name: "SHOP",
        href: "/shop",
        subItems: [
            { name: "클렌징", href: "/shop/cleansing" },
            { name: "스타일링", href: "/shop/styling" },
            { name: "트리트먼트", href: "/shop/treatment" },
            { name: "웨이브펌", href: "/shop/wave-perm" },
        ]
    },
    {
        name: "SOLUTION",
        href: "/solution",
    },
    {
        name: "COMMUNITY",
        href: "/community",
        subItems: [
            { name: "공지사항", href: "/community/notice" },
            { name: "상품사용후기", href: "/community/review" },
            { name: "상품 Q&A", href: "/community/qna" },
            { name: "단체/대량구매 문의", href: "/community/bulk-inquiry" },
        ]
    },
    {
        name: "ABOUT",
        href: "/about",
    },
    {
        name: "MYSHOP",
        href: "/myshop",
        subItems: [
            { name: "로그인", href: "/login" },
            { name: "회원가입", href: "/signup" },
        ]
    },
];

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const [hoveredMenu, setHoveredMenu] = useState<string | null>(null);

    const pathname = usePathname();
    const isHomePage = pathname === "/";

    useEffect(() => {
        const handleScroll = () => {
            if (!isHomePage) {
                setIsScrolled(true);
                return;
            }
            setIsScrolled(window.scrollY > 50);
        };
        
        handleScroll();
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, [isHomePage]);

    // Step 2: 실시간 검색 로직 (Debounce 적용)
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (searchQuery.trim().length >= 2) {
                setIsLoading(true);
                try {
                    const res = await fetch(`/admin_products.php?action=search&keyword=${encodeURIComponent(searchQuery)}`);
                    const result = await res.json();
                    if (result.success) {
                        setSearchResults(result.data);
                    }
                } catch (error) {
                    console.error("Search failed:", error);
                } finally {
                    setIsLoading(false);
                }
            } else {
                setSearchResults([]);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    // 검색어 강조 함수 (Step 3)
    const highlightKeyword = (text: string, keyword: string) => {
        if (!keyword.trim()) return text;
        const parts = text.split(new RegExp(`(${keyword})`, 'gi'));
        return parts.map((part, i) => 
            part.toLowerCase() === keyword.toLowerCase() 
                ? <span key={i} className="text-brand-primary font-bold">{part}</span> 
                : part
        );
    };

    return (
        <nav
            className={cn(
                "fixed top-0 left-0 right-0 z-50 transition-all duration-500 px-6",
                isScrolled 
                    ? "bg-white/90 backdrop-blur-xl shadow-lg border-b border-brand-secondary py-3" 
                    : "bg-transparent text-white py-6"
            )}
        >
            <div className="max-w-7xl mx-auto flex justify-between items-center relative">
                {/* Logo */}
                <Link href="/" className="text-2xl font-bold tracking-tighter font-serif flex items-center gap-3 group">
                    <motion.div 
                        whileHover={{ rotate: 180 }}
                        className={cn("w-10 h-10 rounded-full border-2 flex items-center justify-center text-xs font-sans transition-colors duration-300",
                        isScrolled ? "border-brand-primary text-brand-primary bg-brand-secondary/50" : "border-white text-white bg-white/10")}
                    >
                        NB
                    </motion.div>
                    <span className="relative overflow-hidden group">
                        자연바람
                        <span className={cn(
                            "absolute bottom-0 left-0 w-0 h-0.5 transition-all duration-300 group-hover:w-full",
                            isScrolled ? "bg-brand-primary" : "bg-white"
                        )} />
                    </span>
                </Link>

                {/* Desktop Nav */}
                <div className="hidden lg:flex items-center gap-10">
                    {NAV_DATA.map((menu) => (
                        <div 
                            key={menu.name}
                            className="relative py-2"
                            onMouseEnter={() => setHoveredMenu(menu.name)}
                            onMouseLeave={() => setHoveredMenu(null)}
                        >
                            <Link
                                href={menu.href}
                                className={cn(
                                    "flex items-center gap-1 text-[13px] font-bold tracking-widest transition-all hover:opacity-70",
                                    isScrolled ? "text-brand-text" : "text-white/90"
                                )}
                            >
                                {menu.name}
                                {menu.subItems && (
                                    <ChevronDown size={14} className={cn("transition-transform duration-300", hoveredMenu === menu.name && "rotate-180")} />
                                )}
                            </Link>

                            {/* Dropdown Menu */}
                            <AnimatePresence>
                                {menu.subItems && hoveredMenu === menu.name && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                        transition={{ duration: 0.2 }}
                                        className="absolute top-full left-1/2 -translate-x-1/2 pt-4 w-48"
                                    >
                                        <div className="bg-white rounded-2xl shadow-2xl border border-brand-secondary overflow-hidden py-2 p-1">
                                            {menu.subItems.map((sub) => (
                                                <Link
                                                    key={sub.name}
                                                    href={sub.href}
                                                    target={('target' in sub) ? (sub.target as string) : undefined}
                                                    className="block px-5 py-3 text-sm text-brand-text hover:bg-brand-secondary hover:text-brand-primary rounded-xl transition-all font-medium"
                                                >
                                                    {sub.name}
                                                </Link>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ))}
                </div>

                {/* Icons & Actions */}
                <div className="hidden lg:flex items-center gap-6">
                    <button 
                        onClick={() => { setIsSearchOpen(!isSearchOpen); setIsOpen(false); }}
                        className={cn(
                            "p-2.5 rounded-full transition-all hover:scale-110",
                            isScrolled ? "bg-brand-secondary/50 text-brand-primary hover:bg-brand-primary hover:text-white" : "bg-white/20 text-white backdrop-blur-md hover:bg-white/30"
                        )}
                    >
                        <Search size={18} />
                    </button>
                    <Link
                        href="https://www.instagram.com/naturia_life"
                        target="_blank"
                        className={cn(
                            "p-2.5 rounded-full transition-all hover:scale-110",
                            isScrolled ? "bg-brand-primary text-white shadow-md shadow-brand-primary/20" : "bg-white/20 text-white backdrop-blur-md"
                        )}
                    >
                        <Instagram size={18} />
                    </Link>
                    <button className={cn(
                        "px-6 py-2.5 rounded-full text-sm font-bold transition-all",
                        isScrolled 
                            ? "bg-brand-primary text-white hover:bg-brand-primary/90" 
                            : "bg-white text-brand-primary hover:bg-white/90"
                    )}>
                        시작하기
                    </button>
                </div>

                {/* Mobile Toggle */}
                <div className="flex items-center gap-2 lg:hidden">
                    <button 
                        className={cn("p-2 rounded-xl transition-colors", isScrolled ? "text-brand-text hover:bg-brand-secondary" : "text-white hover:bg-white/10")} 
                        onClick={() => { setIsSearchOpen(!isSearchOpen); setIsOpen(false); }}
                    >
                        <Search size={24} />
                    </button>
                    <button 
                        className={cn("p-2 rounded-xl transition-colors", isScrolled ? "text-brand-text hover:bg-brand-secondary" : "text-white hover:bg-white/10")} 
                        onClick={() => { setIsOpen(!isOpen); setIsSearchOpen(false); }}
                    >
                        {isOpen ? <X size={28} /> : <Menu size={28} />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="lg:hidden absolute top-full left-0 right-0 bg-white border-b border-brand-secondary shadow-2xl overflow-hidden font-sans"
                    >
                        <div className="px-6 py-8 flex flex-col gap-8">
                            {NAV_DATA.map((menu) => (
                                <div key={menu.name} className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <Link
                                            href={menu.href}
                                            className="text-xl font-bold text-brand-text flex items-center gap-2"
                                            onClick={() => setIsOpen(false)}
                                        >
                                            {menu.name}
                                        </Link>
                                    </div>
                                    {menu.subItems && (
                                        <div className="grid grid-cols-2 gap-3 pl-2">
                                            {menu.subItems.map((sub) => (
                                                <Link
                                                    key={sub.name}
                                                    href={sub.href}
                                                    target={('target' in sub) ? (sub.target as string) : undefined}
                                                    className="text-sm text-gray-500 font-medium py-2 px-3 bg-brand-secondary/50 rounded-lg hover:bg-brand-secondary transition-colors"
                                                    onClick={() => setIsOpen(false)}
                                                >
                                                    {sub.name}
                                                </Link>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                            <hr className="border-brand-secondary" />
                            <div className="flex justify-between items-center pb-4">
                                <div className="space-y-1">
                                    <p className="text-xs text-gray-400 font-medium">CONTACT US</p>
                                    <p className="font-bold text-brand-primary">02-6956-9904</p>
                                </div>
                                <Link href="https://www.instagram.com/naturia_life" target="_blank" className="p-3 bg-brand-primary text-white rounded-full">
                                    <Instagram size={20} />
                                </Link>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Search Overlay */}
            <AnimatePresence>
                {isSearchOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="absolute top-full left-0 right-0 min-h-[40vh] bg-white/95 backdrop-blur-xl border-t border-brand-secondary/50 shadow-2xl overflow-y-auto z-40"
                    >
                        <div className="max-w-4xl mx-auto px-6 pt-12 pb-16 flex flex-col">
                            <div className="w-full relative shadow-sm hover:shadow-md transition-shadow duration-300 rounded-full">
                                <Search size={24} className="absolute left-6 top-1/2 -translate-y-1/2 text-brand-primary" />
                                <input 
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter" && searchQuery.trim()) {
                                            window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`;
                                            setIsSearchOpen(false);
                                        }
                                    }}
                                    placeholder="찾으시는 제품명이나 효능을 입력해주세요."
                                    className="w-full pl-16 pr-6 py-5 rounded-full border-2 border-brand-primary/20 focus:border-brand-primary bg-white text-brand-text text-lg outline-none transition-colors placeholder:text-gray-400"
                                    autoFocus
                                />
                                {isLoading && (
                                    <div className="absolute right-6 top-1/2 -translate-y-1/2">
                                        <div className="w-5 h-5 border-2 border-brand-primary/30 border-t-brand-primary rounded-full animate-spin"></div>
                                    </div>
                                )}
                            </div>

                            {/* 실시간 검색 결과 (Step 3) */}
                            <AnimatePresence mode="wait">
                                {searchResults.length > 0 ? (
                                    <motion.div 
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 10 }}
                                        className="mt-6 bg-white rounded-3xl border border-brand-secondary overflow-hidden shadow-xl"
                                    >
                                        <div className="p-4 border-b border-brand-secondary bg-brand-secondary/30">
                                            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">검색 결과 ({searchResults.length})</span>
                                        </div>
                                        <div className="max-h-[40vh] overflow-y-auto">
                                            {searchResults.map((item: any) => (
                                                <Link 
                                                    key={item.id}
                                                    href={`/shop/detail/${item.id}`}
                                                    onClick={() => setIsSearchOpen(false)}
                                                    className="flex items-center gap-4 p-4 hover:bg-brand-secondary transition-colors group"
                                                >
                                                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-50 flex-shrink-0 border border-gray-100">
                                                        <img src={item.image_url} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="font-bold text-brand-text line-clamp-1">{highlightKeyword(item.name, searchQuery)}</h4>
                                                        <p className="text-sm text-gray-500 line-clamp-1 mt-0.5">{item.description}</p>
                                                    </div>
                                                    <div className="text-right flex-shrink-0">
                                                        <span className="font-bold text-brand-primary">₩{Number(item.price).toLocaleString()}</span>
                                                    </div>
                                                </Link>
                                            ))}
                                        </div>
                                    </motion.div>
                                ) : searchQuery.length >= 2 && !isLoading ? (
                                    <motion.div 
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="mt-12 text-center py-12"
                                    >
                                        <p className="text-gray-400 text-lg">"{searchQuery}"에 대한 검색 결과가 없습니다.</p>
                                    </motion.div>
                                ) : (
                                    <motion.div 
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="mt-8 flex flex-wrap gap-2 items-center text-sm"
                                    >
                                        <span className="font-bold text-brand-primary mr-3">인기 검색어</span>
                                        {["트리트먼트", "두피스파", "스타일링", "웨이브펌"].map((tag) => (
                                            <button 
                                                key={tag}
                                                onClick={() => setSearchQuery(tag)}
                                                className="px-5 py-2 rounded-full border border-gray-200 text-brand-text bg-white hover:border-brand-primary hover:text-brand-primary hover:bg-brand-secondary/30 transition-colors"
                                            >
                                                {tag}
                                            </button>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
};

export default Navbar;

