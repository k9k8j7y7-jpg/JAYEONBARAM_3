"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import Link from "next/link";
import { ChevronRight, Check, Search, X as XIcon } from "lucide-react";
import DaumPostcode from "react-daum-postcode";

import { useRouter } from "next/navigation";

export default function RegisterPage() {
    const router = useRouter();
    const [isPostcodeOpen, setIsPostcodeOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        username: "",
        password: "",
        confirmPassword: "",
        name: "",
        zipcode: "",
        address: "",
        detailAddress: "",
        phone1: "010",
        phone2: "",
        phone3: "",
        email: "",
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    const [agreements, setAgreements] = useState({
        all: false,
        terms: false,
        privacy: false,
        marketing: false,
    });

    const validateField = (name: string, value: string) => {
        let error = "";
        if (name === "username") {
            const regex = /^[a-z0-0]{4,16}$/;
            if (!regex.test(value)) error = "영문 소문자/숫자, 4~16자로 입력해주세요.";
        } else if (name === "password") {
            const regex = /^(?=.*[A-Za-z])(?=.*\d|.*[!@#$%^&*()_+])[A-Za-z\d!@#$%^&*()_+]{10,16}$/;
            if (!regex.test(value)) error = "영문/숫자/특수문자 중 2가지 이상 조합, 10~16자로 입력해주세요.";
        } else if (name === "confirmPassword") {
            if (value !== formData.password) error = "비밀번호가 일치하지 않습니다.";
        } else if (name === "email") {
            const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (value && !regex.test(value)) error = "올바른 이메일 형식이 아닙니다.";
        }
        setErrors(prev => ({ ...prev, [name]: error }));
    };

    const handleAllAgreement = (checked: boolean) => {
        setAgreements({
            all: checked,
            terms: checked,
            privacy: checked,
            marketing: checked,
        });
    };

    const handleSingleAgreement = (key: keyof typeof agreements, checked: boolean) => {
        const nextAgreements = { ...agreements, [key]: checked };
        const allChecked = nextAgreements.terms && nextAgreements.privacy;
        setAgreements({ ...nextAgreements, all: allChecked });
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => {
            const next = { ...prev, [name]: value };
            // 비밀번호가 변경되면 비밀번호 확인도 다시 검증
            if (name === "password") {
                validateField("confirmPassword", next.confirmPassword);
            }
            return next;
        });
        validateField(name, value);
    };

    const handleComplete = (data: any) => {
        let fullAddress = data.address;
        let extraAddress = "";

        if (data.addressType === "R") {
            if (data.bname !== "") {
                extraAddress += data.bname;
            }
            if (data.buildingName !== "") {
                extraAddress += extraAddress !== "" ? `, ${data.buildingName}` : data.buildingName;
            }
            fullAddress += extraAddress !== "" ? ` (${extraAddress})` : "";
        }

        setFormData(prev => ({
            ...prev,
            zipcode: data.zonecode,
            address: fullAddress,
        }));
        setIsPostcodeOpen(false);
    };

    const handleSubmit = async () => {
        // 필수 필드 체크
        const requiredFields = ["username", "password", "confirmPassword", "name", "zipcode", "address", "phone2", "phone3", "email"];
        for (const field of requiredFields) {
            if (!formData[field as keyof typeof formData]) {
                alert("모든 필수 항목을 입력해주세요.");
                return;
            }
        }
        
        if (Object.values(errors).some(error => error !== "")) {
            alert("입력 양식을 다시 확인해 주세요.");
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch("/api/register.php", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });

            const result = await response.json();

            if (result.success) {
                alert("자연바람의 회원이 되신 것을 축하드립니다! \n로그인 페이지로 이동합니다.");
                router.push("/myshop/login");
            } else {
                alert(result.message || "회원가입 중 오류가 발생했습니다.");
            }
        } catch (error) {
            console.error("Registration error:", error);
            alert("서버 통신 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white pt-32 pb-24 font-sans text-brand-text relative">
            <div className="max-w-4xl mx-auto px-6">
                {/* Header */}
                <div className="text-center mb-16">
                    <h1 className="text-3xl md:text-4xl font-serif font-bold text-brand-primary mb-4 tracking-tight">JOIN US</h1>
                    <p className="text-gray-400 text-sm tracking-widest font-medium uppercase">자연바람의 새로운 가족이 되어보세요.</p>
                </div>

                {/* Breadcrumb */}
                <nav className="flex items-center justify-center gap-2 text-[11px] text-gray-300 font-bold uppercase tracking-widest mb-16">
                    <span className="text-gray-400">01 약관동의</span>
                    <ChevronRight size={12} />
                    <span className="text-brand-primary">02 정보입력</span>
                    <ChevronRight size={12} />
                    <span className="text-gray-400">03 가입완료</span>
                </nav>

                <div className="bg-white border-t-2 border-brand-primary pt-10">
                    <div className="flex items-center justify-between mb-8 border-b border-gray-100 pb-4">
                        <h2 className="text-lg font-bold text-brand-text">기본정보</h2>
                        <span className="text-[11px] text-brand-primary font-bold">● 필수입력사항</span>
                    </div>

                    {/* Form Fields */}
                    <div className="space-y-0 text-sm">
                        {/* 아이디 */}
                        <div className="grid grid-cols-1 md:grid-cols-[160px_1fr] items-center border-b border-gray-100 py-5">
                            <label className="font-bold text-brand-text mb-2 md:mb-0">아이디 <span className="text-brand-primary">●</span></label>
                            <div className="space-y-2">
                                <input 
                                    name="username"
                                    value={formData.username}
                                    onChange={handleChange}
                                    type="text" 
                                    className={`w-full md:w-64 px-4 py-2.5 bg-gray-50 border ${errors.username ? 'border-red-400' : 'border-gray-200'} rounded-lg focus:border-brand-primary focus:bg-white outline-none transition-all`}
                                    placeholder="아이디를 입력해주세요"
                                />
                                {errors.username ? (
                                    <p className="text-[11px] text-red-500 font-bold flex items-center gap-1">
                                        <X size={10} className="" /> {errors.username}
                                    </p>
                                ) : (
                                    <p className="text-[11px] text-gray-400 font-medium">(영문소문자/숫자, 4~16자)</p>
                                )}
                            </div>
                        </div>

                        {/* 비밀번호 */}
                        <div className="grid grid-cols-1 md:grid-cols-[160px_1fr] items-center border-b border-gray-100 py-5">
                            <label className="font-bold text-brand-text mb-2 md:mb-0">비밀번호 <span className="text-brand-primary">●</span></label>
                            <div className="space-y-2">
                                <input 
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    type="password" 
                                    className={`w-full md:w-64 px-4 py-2.5 bg-gray-50 border ${errors.password ? 'border-red-400' : 'border-gray-200'} rounded-lg focus:border-brand-primary focus:bg-white outline-none transition-all`}
                                    placeholder="비밀번호"
                                />
                                {errors.password ? (
                                    <p className="text-[11px] text-red-500 font-bold flex items-center gap-1">
                                        <X size={10} className="" /> {errors.password}
                                    </p>
                                ) : (
                                    <p className="text-[11px] text-gray-400 font-medium">(영문 대소문자/숫자/특수문자 중 2가지 이상 조합, 10자~16자)</p>
                                )}
                            </div>
                        </div>

                        {/* 비밀번호 확인 */}
                        <div className="grid grid-cols-1 md:grid-cols-[160px_1fr] items-center border-b border-gray-100 py-5">
                            <label className="font-bold text-brand-text mb-2 md:mb-0">비밀번호 확인 <span className="text-brand-primary">●</span></label>
                            <div className="space-y-2">
                                <input 
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    type="password" 
                                    className={`w-full md:w-64 px-4 py-2.5 bg-gray-50 border ${errors.confirmPassword ? 'border-red-400' : 'border-gray-200'} rounded-lg focus:border-brand-primary focus:bg-white outline-none transition-all`}
                                    placeholder="비밀번호 확인"
                                />
                                {errors.confirmPassword && (
                                    <p className="text-[11px] text-red-500 font-bold flex items-center gap-1">
                                        <X size={10} className="" /> {errors.confirmPassword}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* 이름 */}
                        <div className="grid grid-cols-1 md:grid-cols-[160px_1fr] items-center border-b border-gray-100 py-5">
                            <label className="font-bold text-brand-text mb-2 md:mb-0">이름 <span className="text-brand-primary">●</span></label>
                            <input 
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                type="text" 
                                className="w-full md:w-64 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:border-brand-primary focus:bg-white outline-none transition-all"
                                placeholder="이름"
                            />
                        </div>

                        {/* 주소 */}
                        <div className="grid grid-cols-1 md:grid-cols-[160px_1fr] items-start border-b border-gray-100 py-5">
                            <label className="font-bold text-brand-text mt-3 mb-2 md:mb-0">주소 <span className="text-brand-primary">●</span></label>
                            <div className="space-y-3 w-full max-w-xl">
                                <div className="flex gap-2">
                                    <input 
                                        name="zipcode"
                                        value={formData.zipcode}
                                        type="text" 
                                        readOnly 
                                        placeholder="우편번호"
                                        className="w-24 px-4 py-2.5 bg-gray-100 border border-gray-200 rounded-lg outline-none cursor-not-allowed"
                                    />
                                    <button 
                                        type="button"
                                        onClick={() => setIsPostcodeOpen(true)}
                                        className="px-5 py-2.5 bg-brand-text text-white text-xs font-bold rounded-lg hover:bg-black transition-colors flex items-center gap-2"
                                    >
                                        <Search size={14} /> 주소검색
                                    </button>
                                </div>
                                <input 
                                    name="address"
                                    value={formData.address}
                                    type="text" 
                                    readOnly 
                                    placeholder="기본주소"
                                    className="w-full px-4 py-2.5 bg-gray-100 border border-gray-200 rounded-lg outline-none cursor-not-allowed"
                                />
                                <input 
                                    name="detailAddress"
                                    value={formData.detailAddress}
                                    onChange={handleChange}
                                    type="text" 
                                    placeholder="상세주소"
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:border-brand-primary focus:bg-white outline-none transition-all"
                                />
                            </div>
                        </div>

                        {/* 휴대전화 */}
                        <div className="grid grid-cols-1 md:grid-cols-[160px_1fr] items-center border-b border-gray-100 py-5">
                            <label className="font-bold text-brand-text mb-2 md:mb-0">휴대전화 <span className="text-brand-primary">●</span></label>
                            <div className="flex items-center gap-2">
                                <select 
                                    name="phone1"
                                    value={formData.phone1}
                                    onChange={handleChange}
                                    className="w-24 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg outline-none cursor-pointer"
                                >
                                    <option>010</option>
                                    <option>011</option>
                                    <option>016</option>
                                    <option>017</option>
                                </select>
                                <span className="text-gray-300">-</span>
                                <input 
                                    name="phone2"
                                    value={formData.phone2}
                                    onChange={handleChange}
                                    type="text" 
                                    className="w-20 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:border-brand-primary outline-none" 
                                    maxLength={4} 
                                />
                                <span className="text-gray-300">-</span>
                                <input 
                                    name="phone3"
                                    value={formData.phone3}
                                    onChange={handleChange}
                                    type="text" 
                                    className="w-20 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:border-brand-primary outline-none" 
                                    maxLength={4} 
                                />
                            </div>
                        </div>

                        {/* 이메일 */}
                        <div className="grid grid-cols-1 md:grid-cols-[160px_1fr] items-center border-b border-gray-100 py-5">
                            <label className="font-bold text-brand-text mb-2 md:mb-0">이메일 <span className="text-brand-primary">●</span></label>
                            <div className="space-y-2">
                                <input 
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    type="email" 
                                    className={`w-full md:w-80 px-4 py-2.5 bg-gray-50 border ${errors.email ? 'border-red-400' : 'border-gray-200'} rounded-lg focus:border-brand-primary focus:bg-white outline-none transition-all`}
                                    placeholder="이메일 주소"
                                />
                                {errors.email && (
                                    <p className="text-[11px] text-red-500 font-bold flex items-center gap-1">
                                        <X size={10} className="" /> {errors.email}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Agreement Section */}
                    <div className="mt-20 border-t border-gray-100 pts-12">
                        <div className="mb-10 flex items-center justify-between">
                            <h2 className="text-lg font-bold text-brand-text">이용약관 동의</h2>
                            <label className="flex items-center gap-2 cursor-pointer group">
                                <div className={`w-5 h-5 rounded border ${agreements.all ? 'bg-brand-primary border-brand-primary' : 'bg-white border-gray-300'} flex items-center justify-center transition-all`}>
                                    {agreements.all && <Check size={14} className="text-white" />}
                                </div>
                                <input 
                                    type="checkbox" 
                                    className="hidden" 
                                    checked={agreements.all}
                                    onChange={(e) => handleAllAgreement(e.target.checked)}
                                />
                                <span className="text-sm font-bold text-brand-text group-hover:text-brand-primary transition-colors">전체 약관에 동의합니다</span>
                            </label>
                        </div>

                        <div className="space-y-12">
                            {/* 이용약관 */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-sm font-bold text-gray-600">[필수] 이용약관 동의</h3>
                                    <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-500 hover:text-brand-primary transition-colors">
                                        이용약관에 동의하십니까? 
                                        <div className={`w-4 h-4 rounded border ${agreements.terms ? 'bg-brand-primary border-brand-primary' : 'bg-white border-gray-300'} flex items-center justify-center transition-all`}>
                                            {agreements.terms && <Check size={10} className="text-white" />}
                                        </div>
                                        <input type="checkbox" className="hidden" checked={agreements.terms} onChange={(e) => handleSingleAgreement('terms', e.target.checked)} />
                                        동의함
                                    </label>
                                </div>
                                <div className="h-40 overflow-y-auto p-5 bg-gray-50 border border-gray-100 rounded-xl text-[12px] leading-relaxed text-gray-500 font-medium custom-scrollbar">
                                    제1조(목적) 이 약관은 자연바람(전자상거래 사업자)이 운영하는 사이버 몰(이하 “몰”이라 한다)에서 제공하는 인터넷 관련 서비스(이하 “서비스”라 한다)를 이용함에 있어 사이버 몰과 이용자의 권리·의무 및 책임사항을 규정함을 목적으로 합니다.<br/><br/>
                                    제2조(정의) ①“몰”이란 자연바람 회사가 재화 또는 용역(이하 “재화 등”이라 함)을 이용자에게 제공하기 위하여 컴퓨터 등 정보통신설비를 이용하여 재화 등을 거래할 수 있도록 설정한 가상의 영업장을 말하며, 아울러 사이버몰을 운영하는 사업자의 의미로도 사용합니다.<br/><br/>
                                    ②“이용자”란 “몰”에 접속하여 이 약관에 따라 “몰”이 제공하는 서비스를 받는 회원 및 비회원을 말합니다.<br/><br/>
                                    ③“회원”이라 함은 “몰”에 회원등록을 한 자로서, 계속적으로 “몰”이 제공하는 서비스를 이용할 수 있는 자를 말합니다.
                                </div>
                            </div>

                            {/* 개인정보 처리방침 */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-sm font-bold text-gray-600">[필수] 개인정보 수집 및 이용 동의</h3>
                                    <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-500 hover:text-brand-primary transition-colors">
                                        개인정보 수집 및 이용에 동의하십니까? 
                                        <div className={`w-4 h-4 rounded border ${agreements.privacy ? 'bg-brand-primary border-brand-primary' : 'bg-white border-gray-300'} flex items-center justify-center transition-all`}>
                                            {agreements.privacy && <Check size={10} className="text-white" />}
                                        </div>
                                        <input type="checkbox" className="hidden" checked={agreements.privacy} onChange={(e) => handleSingleAgreement('privacy', e.target.checked)} />
                                        동의함
                                    </label>
                                </div>
                                <div className="h-40 overflow-y-auto p-5 bg-gray-50 border border-gray-100 rounded-xl text-[12px] leading-relaxed text-gray-500 font-medium custom-scrollbar">
                                    1. 개인정보 수집목적 및 이용방법<br/>
                                    가. 서비스 제공에 관한 계약 이행 및 서비스 제공에 따른 요금정산<br/>
                                    콘텐츠 제공, 구매 및 요금 결제, 물품배송 또는 청구지 등 발송, 금융거래 본인 인증 및 금융 서비스<br/><br/>
                                    2. 수집하는 개인정보 항목<br/>
                                    이름, 로그인ID, 비밀번호, 주소, 휴대전화번호, 이메일 주소, 서비스 이용기록, 접속 로그, 쿠키, 접속 IP 정보 등
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="mt-20 flex flex-col items-center gap-6">
                        <button 
                            onClick={handleSubmit}
                            disabled={!agreements.terms || !agreements.privacy || isLoading}
                            className={`w-full md:w-96 py-5 ${!agreements.terms || !agreements.privacy || isLoading ? 'bg-gray-300 cursor-not-allowed shadow-none' : 'bg-brand-primary shadow-xl shadow-brand-primary/20 hover:bg-[#2F3E2E]'} text-white text-base font-bold rounded-xl transition-all active:scale-[0.98]`}
                        >
                            {isLoading ? "처리 중..." : "회원가입 완료"}
                        </button>
                        <Link href="/myshop/login" className="text-sm text-gray-400 font-medium hover:text-brand-primary transition-colors border-b border-gray-200 pb-0.5">
                            이미 회원이신가요? 로그인하기
                        </Link>
                    </div>
                </div>
            </div>

            {/* Daum Postcode Modal */}
            <AnimatePresence>
                {isPostcodeOpen && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsPostcodeOpen(false)}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        />
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative w-full max-w-[500px] bg-white rounded-3xl overflow-hidden shadow-2xl"
                        >
                            <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gray-50/50">
                                <h3 className="font-bold text-brand-text flex items-center gap-2">
                                    <Search size={18} className="text-brand-primary" /> 주소 검색
                                </h3>
                                <button onClick={() => setIsPostcodeOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400">
                                    <XIcon size={20} />
                                </button>
                            </div>
                            <div className="h-[450px]">
                                <DaumPostcode
                                    onComplete={handleComplete}
                                    style={{ width: "100%", height: "100%" }}
                                />
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #E5E7EB;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #D1D5DB;
                }
            `}</style>
        </div>
    );
}

// X icon for error messages
const X = ({ size, className }: { size: number, className: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M18 6L6 18M6 6l12 12" />
    </svg>
);
