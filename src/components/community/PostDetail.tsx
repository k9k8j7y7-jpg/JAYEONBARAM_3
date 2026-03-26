'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronUp, ChevronDown, User, Calendar, Eye, Star } from 'lucide-react';
import { motion } from 'framer-motion';

interface ProductInfo {
  id: number;
  name: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface PostData {
  id: number;
  title: string;
  author: string;
  content: string;
  hit: number;
  date: string;
  rating?: number;
  thumbnail_url?: string;
  review_image?: string;
  products?: ProductInfo[];
  // Deprecated fields but kept for safety
  product_id?: number;
  product_name?: string;
  product_image?: string;
  product_price?: number;
}

interface Navigation {
  prev: { id: number; title: string } | null;
  next: { id: number; title: string } | null;
}

export default function PostDetail({ id, category }: { id: string; category: string }) {
  const router = useRouter();
  const [data, setData] = useState<{ post: PostData; products?: ProductInfo[]; navigation: Navigation } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        let apiUrl = `/api/view_post.php?id=${id}`;
        if (category === 'review') {
          apiUrl = `/api/review_actions.php?action=view_review&id=${id}`;
        }
        
        const res = await fetch(apiUrl);
        const result = await res.json();
        if (result.success) {
          setData(result.data);
        }
      } catch (error) {
        console.error('Failed to load post:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [id, category]);

  if (loading) {
    return (
      <div className="animate-pulse px-4">
        <div className="h-10 bg-gray-100 rounded w-3/4 mb-4"></div>
        <div className="h-4 bg-gray-50 rounded w-1/4 mb-12"></div>
        <div className="space-y-4">
          <div className="h-4 bg-gray-50 rounded w-full"></div>
          <div className="h-4 bg-gray-50 rounded w-full"></div>
          <div className="h-4 bg-gray-50 rounded w-5/6"></div>
        </div>
      </div>
    );
  }

  if (!data) return <div className="text-center py-20 text-gray-400 font-medium">게시글을 찾을 수 없습니다.</div>;

  const { post, products, navigation } = data;
  const isReview = category === 'review';
  const displayProducts = products || post.products || [];

  return (
    <div className="font-sans max-w-4xl mx-auto px-4">
      {/* Header Area */}
      <div className="border-b-2 border-gray-900 pb-10 mb-10">
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-[#0A3D2E] text-white text-[11px] font-bold tracking-widest uppercase rounded">
              {category}
            </span>
            {isReview && post.rating !== undefined && (
                <div className="flex text-[#FFD700] gap-1">
                    {[...Array(5)].map((_, i) => (
                        <Star key={i} size={16} fill={i < (post.rating ?? 0) ? "#FFD700" : "none"} strokeWidth={i < (post.rating ?? 0) ? 0 : 2} className={i < (post.rating ?? 0) ? "" : "text-gray-200"} />
                    ))}
                </div>
            )}
          </div>
          
          <h2 className="text-[32px] md:text-[40px] font-bold text-gray-900 leading-tight font-serif tracking-tight">
            {post.title}
          </h2>
          
          <div className="flex flex-wrap items-center gap-6 text-[14px] text-gray-500 font-medium">
            <div className="flex items-center gap-2">
              <User size={16} className="text-gray-400" />
              <span className="text-gray-900">{post.author || (post as any).author_name}</span>
            </div>
            <span className="w-px h-3 bg-gray-200" />
            <div className="flex items-center gap-2">
              <Calendar size={16} className="text-gray-400" />
              <span>{post.date || (post as any).created_at?.substring(0, 10)}</span>
            </div>
            <span className="w-px h-3 bg-gray-200" />
            <div className="flex items-center gap-2">
              <Eye size={16} className="text-gray-400" />
              <span>{(post as any).hit_count || post.hit || 0} views</span>
            </div>
          </div>
        </div>
      </div>

      {/* Multiple Products Display Section */}
      {displayProducts.length > 0 && (
        <div className="mb-12">
            <p className="text-[12px] text-gray-400 font-bold tracking-widest uppercase mb-4 px-1">Related Products</p>
            <div className="grid grid-cols-1 gap-4">
                {displayProducts.map((p) => (
                    <motion.div 
                        key={p.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-center gap-5 group cursor-pointer hover:bg-white hover:shadow-xl hover:shadow-[#0A3D2E]/5 transition-all duration-500 border-l-4 border-l-transparent hover:border-l-[#0A3D2E]"
                        onClick={() => router.push(`/shop/product/${p.id}`)}
                    >
                        <div className="w-20 h-20 bg-white rounded-xl overflow-hidden border border-gray-100 shrink-0">
                            <img src={p.image_url} alt={p.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h4 className="text-[16px] font-bold text-gray-900 group-hover:text-[#0A3D2E] transition-colors truncate">{p.name}</h4>
                            <p className="text-[14px] text-[#0A3D2E] font-bold mt-1">₩{Number(p.price).toLocaleString()} <span className="text-gray-300 font-medium ml-2">/ {p.quantity}개</span></p>
                        </div>
                        <div className="px-4 text-[12px] font-bold text-gray-300 group-hover:text-[#0A3D2E] shrink-0">VIEW →</div>
                    </motion.div>
                ))}
            </div>
        </div>
      )}

      {/* Content Area */}
      <div className="mb-20">
        {(post.review_image || post.thumbnail_url) && (
            <div className="mb-12 rounded-[32px] overflow-hidden shadow-2xl border border-gray-100">
                <img src={post.review_image || post.thumbnail_url} alt="Review attachment" className="w-full h-auto" />
            </div>
        )}
        <div 
          className="text-[17px] md:text-[18px] leading-[1.8] text-gray-700 whitespace-pre-wrap break-words font-light px-1"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      </div>

      {/* Navigation (Prev/Next) */}
      <div className="border border-gray-100 mb-10 overflow-hidden rounded-[24px]">
        {navigation.next && (
          <Link href={`/community/${category}/${navigation.next.id}`} className="flex items-center gap-6 py-6 px-8 hover:bg-gray-50 transition-all border-b border-gray-100 group">
            <div className="flex items-center gap-2 text-gray-300 font-bold text-[11px] uppercase tracking-widest w-[80px] shrink-0">
              <ChevronUp size={16} />
              Next
            </div>
            <span className="text-gray-600 group-hover:text-gray-900 font-bold transition-colors line-clamp-1">{navigation.next.title}</span>
          </Link>
        )}
        {navigation.prev && (
          <Link href={`/community/${category}/${navigation.prev.id}`} className="flex items-center gap-6 py-6 px-8 hover:bg-gray-50 transition-all group">
            <div className="flex items-center gap-2 text-gray-300 font-bold text-[11px] uppercase tracking-widest w-[80px] shrink-0">
              <ChevronDown size={16} />
              Prev
            </div>
            <span className="text-gray-600 group-hover:text-gray-900 font-bold transition-colors line-clamp-1">{navigation.prev.title}</span>
          </Link>
        )}
      </div>

      {/* Buttons */}
      <div className="flex justify-center mb-24">
        <Link 
          href={`/community/${category}`}
          className="inline-flex items-center justify-center bg-gray-900 text-white px-14 py-5 text-[14px] font-bold hover:bg-[#0A3D2E] rounded-2xl transition-all duration-300 tracking-widest uppercase shadow-xl shadow-gray-900/10"
        >
          Back to List
        </Link>
      </div>
    </div>
  );
}
