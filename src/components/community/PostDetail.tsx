'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronUp, ChevronDown, User, Calendar, Eye } from 'lucide-react';
import { motion } from 'framer-motion';

interface PostData {
  id: number;
  title: string;
  author: string;
  content: string;
  hit: number;
  date: string;
  rating?: number;
  review_image?: string;
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
  const [data, setData] = useState<{ post: PostData; navigation: Navigation } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await fetch(`/api/view_post.php?id=${id}`);
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
  }, [id]);

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

  const { post, navigation } = data;
  const isReview = category === 'review';

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
                <div className="flex text-[#FFD700]">
                    {[...Array(5)].map((_, i) => (
                        <span key={i} className={i < (post.rating ?? 0) ? "opacity-100" : "opacity-20"}>★</span>
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
              <span className="text-gray-900">{post.author}</span>
            </div>
            <span className="w-px h-3 bg-gray-200" />
            <div className="flex items-center gap-2">
              <Calendar size={16} className="text-gray-400" />
              <span>{post.date}</span>
            </div>
            <span className="w-px h-3 bg-gray-200" />
            <div className="flex items-center gap-2">
              <Eye size={16} className="text-gray-400" />
              <span>{post.hit} views</span>
            </div>
          </div>
        </div>
      </div>

      {/* Review Product Info Section */}
      {isReview && post.product_name && (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12 p-6 bg-gray-50 rounded-2xl border border-gray-100 flex items-center gap-6 group cursor-pointer hover:bg-white hover:shadow-xl transition-all duration-500"
            onClick={() => router.push(`/shop/product/${post.product_id}`)}
        >
            <div className="w-24 h-24 bg-white rounded-xl overflow-hidden border border-gray-100 shrink-0">
                <img src={post.product_image} alt={post.product_name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
            </div>
            <div className="flex-1">
                <p className="text-[12px] text-gray-400 font-bold tracking-wider uppercase mb-1">Purchased Product</p>
                <h4 className="text-[18px] font-bold text-gray-900 group-hover:text-[#0A3D2E] transition-colors">{post.product_name}</h4>
                <p className="text-[15px] text-[#0A3D2E] font-bold">₩{Number(post.product_price).toLocaleString()}</p>
            </div>
            <div className="px-4 text-[13px] font-bold text-gray-400 group-hover:text-[#0A3D2E]">VIEW PRODUCT →</div>
        </motion.div>
      )}

      {/* Content Area */}
      <div className="mb-20">
        {isReview && post.review_image && (
            <div className="mb-12 rounded-2xl overflow-hidden shadow-2xl">
                <img src={post.review_image} alt="Review attachment" className="w-full h-auto" />
            </div>
        )}
        <div 
          className="text-[17px] md:text-[18px] leading-[1.8] text-gray-700 whitespace-pre-wrap break-words font-light"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      </div>

      {/* Navigation (Prev/Next) */}
      <div className="border-t border-b border-gray-100 mb-10 overflow-hidden rounded-xl border-x">
        {navigation.next && (
          <Link href={`/community/${category}/${navigation.next.id}`} className="flex items-center gap-6 py-6 px-6 hover:bg-gray-50 transition-all border-b border-gray-100 group">
            <div className="flex items-center gap-2 text-gray-300 font-bold text-[12px] uppercase tracking-widest w-[100px] shrink-0">
              <ChevronUp size={16} />
              Next
            </div>
            <span className="text-gray-600 group-hover:text-gray-900 font-medium transition-colors line-clamp-1">{navigation.next.title}</span>
          </Link>
        )}
        {navigation.prev && (
          <Link href={`/community/${category}/${navigation.prev.id}`} className="flex items-center gap-6 py-6 px-6 hover:bg-gray-50 transition-all group">
            <div className="flex items-center gap-2 text-gray-300 font-bold text-[12px] uppercase tracking-widest w-[100px] shrink-0">
              <ChevronDown size={16} />
              Prev
            </div>
            <span className="text-gray-600 group-hover:text-gray-900 font-medium transition-colors line-clamp-1">{navigation.prev.title}</span>
          </Link>
        )}
      </div>

      {/* Buttons */}
      <div className="flex justify-center mb-24">
        <Link 
          href={`/community/${category}`}
          className="inline-flex items-center justify-center bg-white border-2 border-gray-900 text-gray-900 px-12 py-4 text-[14px] font-bold hover:bg-gray-900 hover:text-white transition-all duration-300 tracking-widest uppercase"
        >
          Back to List
        </Link>
      </div>
    </div>
  );
}

