'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const communityMenus = [
  { name: '공지사항', href: '/community/notice' },
  { name: '상품사용후기', href: '/community/review' },
  { name: '상품 Q&A', href: '/community/qna' },
  { name: '단체/대량구매 문의', href: '/community/bulk-inquiry' },
];

export default function CommunitySidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-[200px] shrink-0">
      <h2 className="text-[24px] font-bold text-[#0A3D2E] mb-8 font-serif uppercase tracking-tight">Community</h2>
      <nav>
        <ul className="space-y-4">
          {communityMenus.map((menu) => {
            const isActive = pathname === menu.href;
            return (
              <li key={menu.href}>
                <Link
                  href={menu.href}
                  className={`block py-2 text-[15px] border-b border-transparent transition-all hover:text-[#0A3D2E] ${
                    isActive 
                      ? 'text-[#0A3D2E] font-bold border-b-[#0A3D2E]' 
                      : 'text-gray-500'
                  }`}
                >
                  {menu.name}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
