'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import GlassCard from '../../components/GlassCard';
import { uploadToImgBB } from '../../utils/uploadToImgBB';
import { 
  Sparkles, 
  Heart, 
  MessageSquare, 
  Share2, 
  Plus, 
  Image as ImageIcon, 
  Video, 
  Award, 
  Trophy, 
  Calendar, 
  ThumbsUp, 
  ChevronLeft, 
  ChevronRight, 
  Megaphone,
  Upload,
  X,
  Send,
  User,
  Tag,
  Bookmark,
  Edit3,
  Trash2
} from 'lucide-react';

interface Comment {
  id: number;
  user_name: string;
  user_role: string;
  avatar_url?: string;
  text: string;
  created_at: string;
}

interface ActivityPost {
  id: number;
  title: string;
  category: 'KAIZEN ดีเด่น' | 'กิจกรรมคลังสินค้า' | 'กีฬาสีโรงงาน' | 'ความปลอดภัย' | 'ประกาศข่าวสาร';
  content: string;
  author_name: string;
  author_role: string;
  author_avatar?: string;
  created_at: string;
  media_url?: string;
  media_type?: 'image' | 'video';
  likes_count: number;
  user_liked?: boolean;
  comments: Comment[];
  is_featured?: boolean;
}

export default function DepartmentActivitiesPage() {
  const { user } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [posts, setPosts] = useState<ActivityPost[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('ALL');
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingPost, setEditingPost] = useState<ActivityPost | null>(null);
  const [commentInputs, setCommentInputs] = useState<{ [key: number]: string }>({});

  useEffect(() => {
    setMounted(true);
  }, []);

  // Form State for creating / editing post
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState<ActivityPost['category']>('กิจกรรมคลังสินค้า');
  const [formContent, setFormContent] = useState('');
  const [formMediaUrl, setFormMediaUrl] = useState('');
  const [formMediaType, setFormMediaType] = useState<'image' | 'video'>('image');
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);

  // Default Initial Activities Seed
  const defaultPosts: ActivityPost[] = [
    {
      id: 1,
      title: '🏆 ประกาศรางวัล KAIZEN ดีเด่นประจำเดือน!',
      category: 'KAIZEN ดีเด่น',
      content: 'ขอแสดงความยินดีกับผลงาน KAIZEN จากทีมคลังสินค้าแผนก Packing เรื่อง "การลดเวลาค้นหากล่องพัสดุด้วยระบบบาร์โค้ดโซน 4" ช่วยเพิ่มประสิทธิภาพการจัดส่งขึ้น 35%! ขอปรบมือให้ นายสมปอง ลุยงาน (EMP006) ที่ได้รับเงินรางวัล 3,000 บาท พร้อมเกียรติบัตรประจำเดือนนี้ครับ 👏🎉✨',
      author_name: 'ผู้ดูแลระบบ (Admin)',
      author_role: 'Admin',
      created_at: '29 ก.ค. 2026 • 14:30 น.',
      media_url: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&q=80',
      media_type: 'image',
      likes_count: 24,
      user_liked: false,
      is_featured: true,
      comments: [
        { id: 101, user_name: 'วิภาดา สายสนับสนุน', user_role: 'Staff', text: 'ยินดีด้วยนะคะพี่สมปอง ไอเดียดีมากช่วยทีมงานได้เยอะเลยค่ะ 👍', created_at: '14:45 น.' },
        { id: 102, user_name: 'สมปอง ลุยงาน', user_role: 'Employee', text: 'ขอบคุณหัวหน้าและเพื่อนๆ ทีมคลังทุกคนที่ช่วยกันทดสอบระบบครับ! 🙏', created_at: '15:10 น.' }
      ]
    },
    {
      id: 2,
      title: '⚽ กิจกรรมแข่งกีฬาสีเชื่อมสัมพันธ์โรงงาน Swan Warehouse Games 2026',
      category: 'กีฬาสีโรงงาน',
      content: 'ขอเชิญชวนพี่น้องคลังสินค้าทุกท่านเข้าร่วมแข่งขันกีฬาสีประจำปี! ประเภทกีฬา: ฟุตซอล 5 คน, แบดมินตัน, วอลเลย์บอล และชักกะเย่อคลังสินค้า เปิดรับสมัครทีมประจำโซนคลังแล้ววันนี้ ชิงถ้วยรางวัลและเงินรางวัลรวมกว่า 20,000 บาท! มาส่งเสียงเชียร์และสร้างความสามัคคีกันครับ 🏆⚽🏸',
      author_name: 'HR & กิจกรรมองค์กร',
      author_role: 'Staff',
      created_at: '28 ก.ค. 2026 • 10:00 น.',
      media_url: 'https://images.unsplash.com/photo-1526232761682-d26e03ac148e?w=800&q=80',
      media_type: 'image',
      likes_count: 38,
      user_liked: true,
      is_featured: true,
      comments: [
        { id: 201, user_name: 'มานะ ขยันจัด', user_role: 'Employee', text: 'ทีมโซน Picking พร้อมลงแข่งฟุตซอลแล้วครับ! ⚽🔥', created_at: '10:30 น.' }
      ]
    },
    {
      id: 3,
      title: '📦 ภาพบรรยากาศกิจกรรม 5ส & Big Cleaning Day โซนคลังสินค้าวัตถุดิบ',
      category: 'กิจกรรมคลังสินค้า',
      content: 'ขอขอบคุณทีมงานคลังสินค้าทุกคนที่ร่วมมือร่วมใจจัดระเบียบพื้นที่เก็บสินค้า Racking A-D และทำความสะอาดคลังสินค้าเพื่อความปลอดภัยสูงสุดในการทำงาน! คลังสินค้าของเราสะอาด เป็นระเบียบ เรียบร้อยขึ้นอย่างเห็นได้ชัดครับ 🧹✨',
      author_name: 'ชาติชาย ทรงอำนาจ',
      author_role: 'Warehouse Manager',
      created_at: '25 ก.ค. 2026 • 16:20 น.',
      media_url: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&q=80',
      media_type: 'image',
      likes_count: 19,
      user_liked: false,
      is_featured: true,
      comments: []
    },
    {
      id: 4,
      title: '🥽 ภาพการฝึกซ้อมอพยพหนีไฟและสาธิตการใช้ถังดับเพลิงประจำปี',
      category: 'ความปลอดภัย',
      content: 'ทบทวนความรู้ขั้นตอนการรับมือเหตุฉุกเฉินและการปฏิบัติงานอย่างปลอดภัยร่วมกับทีมบรรเทาสาธารณภัย เพื่อให้พนักงานคลังสินค้าทุกคนปฏิบัติงานด้วยความมั่นใจและปลอดภัย 100% 🚒🔥',
      author_name: 'ทีมงาน Safety คลังสินค้า',
      author_role: 'Staff',
      created_at: '20 ก.ค. 2026 • 11:15 น.',
      media_url: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&q=80',
      media_type: 'image',
      likes_count: 31,
      user_liked: false,
      is_featured: false,
      comments: []
    }
  ];

  useEffect(() => {
    // Load persisted posts from localStorage directly so user edits/creations/deletions are 100% permanent
    const STORAGE_KEY = 'swan_department_activities_v4';
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setPosts(parsed);
          return;
        }
      } catch (e) {
        console.error('Failed to parse saved activities:', e);
      }
    }

    // Fallback if key v3 exists
    const storedV3 = localStorage.getItem('swan_department_activities_v3');
    if (storedV3) {
      try {
        const parsedV3 = JSON.parse(storedV3);
        if (Array.isArray(parsedV3) && parsedV3.length > 0) {
          setPosts(parsedV3);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(parsedV3));
          return;
        }
      } catch (e) {}
    }

    // Seed defaults if no saved data
    setPosts(defaultPosts);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultPosts));
  }, []);

  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const savePosts = (updatedPosts: ActivityPost[]) => {
    setPosts(updatedPosts);
    try {
      localStorage.setItem('swan_department_activities_v4', JSON.stringify(updatedPosts));
    } catch (err) {
      console.warn('LocalStorage quota exceeded, trimming large base64 strings to protect state', err);
      try {
        const trimmed = updatedPosts.map(p => ({
          ...p,
          media_url: (p.media_url && p.media_url.startsWith('data:') && p.media_url.length > 300000)
            ? 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&q=80'
            : p.media_url
        }));
        localStorage.setItem('swan_department_activities_v4', JSON.stringify(trimmed));
      } catch (e) {
        console.error('Final fallback storage save error:', e);
      }
    }
  };

  // Canvas Image Compression Helper (Downscales large photos to lightweight JPEG)
  const compressImage = (file: File, maxWidth = 1000, quality = 0.75): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            resolve(canvas.toDataURL('image/jpeg', quality));
          } else {
            resolve(e.target?.result as string);
          }
        };
        img.onerror = () => resolve(e.target?.result as string || '');
        img.src = e.target?.result as string;
      };
      reader.onerror = () => resolve('');
      reader.readAsDataURL(file);
    });
  };

  // Image Upload Handling (ImgBB Cloud Upload + Canvas Compression Fallback)
  const handleImageFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);
    try {
      // 1. Attempt fast ImgBB cloud upload
      const cloudUrl = await uploadToImgBB(file);
      setMediaPreview(cloudUrl);
      setFormMediaUrl(cloudUrl);
    } catch (err) {
      console.warn('ImgBB cloud upload failed, compressing image locally via Canvas...');
      const compressedBase64 = await compressImage(file);
      setMediaPreview(compressedBase64);
      setFormMediaUrl(compressedBase64);
    } finally {
      setIsUploadingImage(false);
    }
  };

  // Open Edit Modal
  const openEditModal = (post: ActivityPost) => {
    setEditingPost(post);
    setFormTitle(post.title);
    setFormCategory(post.category);
    setFormContent(post.content);
    setFormMediaUrl(post.media_url || '');
    setFormMediaType(post.media_type || 'image');
    setMediaPreview(post.media_url || null);
  };

  // Delete Post
  const handleDeletePost = (postId: number) => {
    if (confirm('คุณแน่ใจหรือไม่ว่าต้องการลบโพสต์กิจกรรมนี้?')) {
      const updated = posts.filter(p => p.id !== postId);
      savePosts(updated);
    }
  };

  // Create or Update Post Form Handler
  const handleSavePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formContent.trim()) {
      alert('กรุณากรอกหัวข้อและเนื้อหากิจกรรมให้ครบถ้วน');
      return;
    }

    if (editingPost) {
      // Edit mode
      const updated = posts.map(p => {
        if (p.id === editingPost.id) {
          return {
            ...p,
            title: formTitle,
            category: formCategory,
            content: formContent,
            media_url: mediaPreview || formMediaUrl || undefined,
            media_type: formMediaType
          };
        }
        return p;
      });
      savePosts(updated);
      setEditingPost(null);
    } else {
      // Create mode
      const now = new Date();
      const dateStr = `${now.getDate()} ${['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'][now.getMonth()]} ${now.getFullYear() + 543} • ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')} น.`;

      const newPost: ActivityPost = {
        id: Date.now(),
        title: formTitle,
        category: formCategory,
        content: formContent,
        author_name: user?.name || 'ผู้ดูแลระบบ',
        author_role: user?.role === 'admin' ? 'Admin' : 'Staff',
        created_at: dateStr,
        media_url: mediaPreview || formMediaUrl || undefined,
        media_type: formMediaType,
        likes_count: 1,
        user_liked: true,
        is_featured: true,
        comments: []
      };

      const updated = [newPost, ...posts];
      savePosts(updated);
      setShowCreateModal(false);
    }

    // Reset Form
    setFormTitle('');
    setFormCategory('กิจกรรมคลังสินค้า');
    setFormContent('');
    setFormMediaUrl('');
    setMediaPreview(null);
  };

  // Toggle Like on Post
  const handleToggleLike = (postId: number) => {
    const updated = posts.map(p => {
      if (p.id === postId) {
        const user_liked = !p.user_liked;
        const likes_count = user_liked ? p.likes_count + 1 : Math.max(0, p.likes_count - 1);
        return { ...p, user_liked, likes_count };
      }
      return p;
    });
    savePosts(updated);
  };

  // Add Comment to Post
  const handleAddComment = (postId: number) => {
    const text = commentInputs[postId]?.trim();
    if (!text) return;

    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')} น.`;

    const newComment: Comment = {
      id: Date.now(),
      user_name: user?.name || 'ผู้ดูแลระบบ',
      user_role: user?.role === 'admin' ? 'Admin' : 'Staff',
      text,
      created_at: timeStr
    };

    const updated = posts.map(p => {
      if (p.id === postId) {
        return {
          ...p,
          comments: [...(p.comments || []), newComment]
        };
      }
      return p;
    });

    savePosts(updated);
    setCommentInputs(prev => ({ ...prev, [postId]: '' }));
  };

  // Delete Comment from Post
  const handleDeleteComment = (postId: number, commentId: number) => {
    if (confirm('คุณต้องการลบความคิดเห็นนี้ใช่หรือไม่?')) {
      const updated = posts.map(p => {
        if (p.id === postId) {
          return {
            ...p,
            comments: (p.comments || []).filter(c => c.id !== commentId)
          };
        }
        return p;
      });
      savePosts(updated);
    }
  };

  // Filter Posts
  const featuredPosts = Array.isArray(posts) ? posts.filter(post => post && post.is_featured) : [];
  const filteredPosts = Array.isArray(posts) ? posts.filter(post => {
    if (activeCategory === 'ALL') return true;
    return post.category === activeCategory;
  }) : [];

  const getCategoryBadgeClass = (cat: string) => {
    if (cat === 'KAIZEN ดีเด่น') return 'bg-amber-500/15 text-amber-500 border border-amber-500/30';
    if (cat === 'กีฬาสีโรงงาน') return 'bg-emerald-500/15 text-emerald-500 border border-emerald-500/30';
    if (cat === 'กิจกรรมคลังสินค้า') return 'bg-indigo-500/15 text-indigo-500 border border-indigo-500/30';
    if (cat === 'ความปลอดภัย') return 'bg-rose-500/15 text-rose-500 border border-rose-500/30';
    return 'bg-sky-500/15 text-sky-500 border border-sky-500/30';
  };

  if (!mounted) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-4 border-slate-300 border-t-warehouse-orange rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-16">
      
      {/* Header Info */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2.5">
            <Sparkles className="text-warehouse-orange" size={26} />
            <span>กิจกรรมภายในแผนก (Department Social Feed)</span>
          </h2>
          <p className="text-slate-400 text-sm mt-1">พื้นที่แบ่งปันผลงาน KAIZEN ข่าวสารกีฬาสี และภาพบรรยากาศกิจกรรมของชาวแผนกคลังสินค้า</p>
        </div>

        {/* Create Post Button (Visible for Admin / Staff) */}
        {(user?.role === 'admin' || user?.role === 'staff') && (
          <button
            onClick={() => {
              setEditingPost(null);
              setFormTitle('');
              setFormCategory('กิจกรรมคลังสินค้า');
              setFormContent('');
              setFormMediaUrl('');
              setMediaPreview(null);
              setShowCreateModal(true);
            }}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-warehouse-orange to-amber-500 hover:from-warehouse-orange/95 hover:to-amber-500/95 text-white text-xs font-bold transition-all shadow-lg shadow-warehouse-orange/20 flex items-center justify-center gap-2"
          >
            <Plus size={16} />
            <span>สร้างโพสต์กิจกรรมใหม่</span>
          </button>
        )}
      </div>

      {/* 1. HERO SLIDER BANNER (สไลด์ภาพและกิจกรรมไฮไลท์) */}
      {featuredPosts.length > 0 && (
        <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-slate-200/50 dark:border-white/10 group">
          <div className="relative h-64 sm:h-80 md:h-96 w-full">
            {featuredPosts.map((slide, idx) => (
              <div
                key={slide.id}
                className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                  idx === currentSlideIndex ? 'opacity-100 z-10 pointer-events-auto' : 'opacity-0 z-0 pointer-events-none'
                }`}
              >
                {/* Background Image / Video Overlay */}
                <img
                  src={slide.media_url || 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=1200&q=80'}
                  alt={slide.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />

                {/* Banner Content */}
                <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 space-y-3">
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-[10px] uppercase tracking-wider font-extrabold ${getCategoryBadgeClass(slide.category)}`}>
                      {slide.category}
                    </span>
                    <span className="text-[11px] text-slate-300 font-medium">{slide.created_at}</span>
                  </div>

                  <h3 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white leading-tight drop-shadow-md">
                    {slide.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-200 line-clamp-2 max-w-3xl leading-relaxed">
                    {slide.content}
                  </p>

                  <div className="flex items-center gap-4 pt-2 text-xs font-semibold text-white/90">
                    <span className="flex items-center gap-1.5 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/15">
                      <Heart size={14} className="text-rose-400 fill-rose-400" />
                      <span>{slide.likes_count} ไลก์</span>
                    </span>
                    <span className="flex items-center gap-1.5 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/15">
                      <MessageSquare size={14} className="text-sky-400" />
                      <span>{slide.comments ? slide.comments.length : 0} ความคิดเห็น</span>
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Slider Prev / Next Controls */}
          {featuredPosts.length > 1 && (
            <>
              <button
                onClick={() => setCurrentSlideIndex(prev => (prev === 0 ? featuredPosts.length - 1 : prev - 1))}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2.5 rounded-full bg-slate-950/40 hover:bg-slate-950/70 text-white backdrop-blur-md border border-white/10 opacity-0 group-hover:opacity-100 transition-all"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={() => setCurrentSlideIndex(prev => (prev + 1) % featuredPosts.length)}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2.5 rounded-full bg-slate-950/40 hover:bg-slate-950/70 text-white backdrop-blur-md border border-white/10 opacity-0 group-hover:opacity-100 transition-all"
              >
                <ChevronRight size={20} />
              </button>

              {/* Slide Indicators Dots */}
              <div className="absolute bottom-4 right-6 z-20 flex items-center gap-1.5">
                {featuredPosts.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentSlideIndex(idx)}
                    className={`h-2 rounded-full transition-all ${
                      idx === currentSlideIndex ? 'w-6 bg-warehouse-orange' : 'w-2 bg-white/40 hover:bg-white/70'
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* 2. CATEGORY FILTER BAR */}
      <div className="flex flex-wrap items-center gap-2 pb-2 border-b border-slate-200/50 dark:border-white/5">
        {[
          { id: 'ALL', label: 'กิจกรรมทั้งหมด' },
          { id: 'KAIZEN ดีเด่น', label: '🏆 KAIZEN ดีเด่น' },
          { id: 'กีฬาสีโรงงาน', label: '⚽ กีฬาสีโรงงาน' },
          { id: 'กิจกรรมคลังสินค้า', label: '📦 กิจกรรมคลังสินค้า' },
          { id: 'ความปลอดภัย', label: '🥽 ความปลอดภัย' },
          { id: 'ประกาศข่าวสาร', label: '📢 ประกาศข่าวสาร' }
        ].map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeCategory === cat.id
                ? 'bg-warehouse-orange text-white shadow-md shadow-warehouse-orange/20'
                : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* 3. SOCIAL NEWSFEED POST CARDS */}
      <div className="space-y-6 max-w-4xl mx-auto">
        {filteredPosts.map(post => (
          <GlassCard key={post.id} className="p-0 overflow-hidden border border-slate-200/50 dark:border-white/5 space-y-0">
            
            {/* Post Header */}
            <div className="p-5 flex items-center justify-between border-b border-slate-200/40 dark:border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-warehouse-orange to-amber-500 text-white font-bold flex items-center justify-center text-sm shadow-md">
                  {(post.author_name || 'U')[0]}
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-800 dark:text-white flex items-center gap-2">
                    <span>{post.author_name}</span>
                    <span className="px-2 py-0.5 rounded text-[9px] bg-slate-200 dark:bg-white/10 text-slate-600 dark:text-slate-300 font-extrabold uppercase">
                      {post.author_role}
                    </span>
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">{post.created_at}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-[10px] uppercase font-extrabold ${getCategoryBadgeClass(post.category)}`}>
                  {post.category}
                </span>

                {/* Edit & Delete Buttons for Admin / Staff */}
                {(user?.role === 'admin' || user?.role === 'staff') && (
                  <div className="flex items-center gap-1 border-l border-slate-200 dark:border-white/10 pl-2 ml-1">
                    <button
                      onClick={() => openEditModal(post)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-warehouse-orange hover:bg-warehouse-orange/10 transition-colors"
                      title="แก้ไขโพสต์กิจกรรม"
                    >
                      <Edit3 size={15} />
                    </button>
                    <button
                      onClick={() => handleDeletePost(post.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                      title="ลบโพสต์กิจกรรม"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Post Content */}
            <div className="p-5 space-y-3">
              <h3 className="text-base sm:text-lg font-bold text-slate-800 dark:text-white leading-snug">
                {post.title}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                {post.content}
              </p>
            </div>

            {/* Post Media Attachment */}
            {post.media_url && (
              <div className="w-full max-h-[480px] bg-slate-950 overflow-hidden">
                {post.media_type === 'video' ? (
                  <video src={post.media_url} controls className="w-full h-full object-contain max-h-[450px]" />
                ) : (
                  <img src={post.media_url} alt={post.title} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                )}
              </div>
            )}

            {/* Like & Comment Stats Bar */}
            <div className="px-5 py-3 border-t border-slate-200/40 dark:border-white/5 flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1.5 font-semibold">
                <span className="w-5 h-5 rounded-full bg-rose-500 text-white flex items-center justify-center text-[10px]">❤️</span>
                <span>{post.likes_count} คนถูกใจสิ่งนี้</span>
              </span>

              <span className="font-semibold">
                {post.comments ? post.comments.length : 0} ความคิดเห็น
              </span>
            </div>

            {/* Post Action Buttons (Like / Comment) */}
            <div className="px-5 py-2 border-t border-b border-slate-200/40 dark:border-white/5 grid grid-cols-2 gap-2 text-xs font-bold">
              <button
                onClick={() => handleToggleLike(post.id)}
                className={`py-2 rounded-xl flex items-center justify-center gap-2 transition-all ${
                  post.user_liked
                    ? 'text-rose-500 bg-rose-500/10'
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5'
                }`}
              >
                <Heart size={16} className={post.user_liked ? 'fill-rose-500' : ''} />
                <span>{post.user_liked ? 'ถูกใจแล้ว' : 'ถูกใจ'}</span>
              </button>

              <button
                onClick={() => {
                  const inputEl = document.getElementById(`comment-input-${post.id}`);
                  inputEl?.focus();
                }}
                className="py-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 flex items-center justify-center gap-2 transition-all"
              >
                <MessageSquare size={16} />
                <span>แสดงความคิดเห็น</span>
              </button>
            </div>

            {/* Comments List & Input */}
            <div className="p-5 bg-slate-50/50 dark:bg-white/[0.02] space-y-4">
              {Array.isArray(post.comments) && post.comments.length > 0 && (
                <div className="space-y-3">
                  {post.comments.map(c => (
                    <div key={c.id} className="flex items-start gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-slate-300 dark:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                        {(c.user_name || 'U')[0]}
                      </div>
                      <div className="bg-white dark:bg-white/5 border border-slate-200/60 dark:border-white/5 p-3 rounded-2xl flex-1 text-xs space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
                            {c.user_name}
                            <span className="text-[8px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-white/10 text-slate-400 uppercase font-extrabold">
                              {c.user_role}
                            </span>
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-slate-400 font-mono">{c.created_at}</span>
                            {(user?.role === 'admin' || user?.role === 'staff') && (
                              <button
                                onClick={() => handleDeleteComment(post.id, c.id)}
                                className="text-slate-400 hover:text-rose-500 transition-colors p-0.5"
                                title="ลบความคิดเห็น"
                              >
                                <Trash2 size={12} />
                              </button>
                            )}
                          </div>
                        </div>
                        <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{c.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Type New Comment Input */}
              <div className="flex items-center gap-2">
                <input
                  id={`comment-input-${post.id}`}
                  type="text"
                  value={commentInputs[post.id] || ''}
                  onChange={(e) => setCommentInputs({ ...commentInputs, [post.id]: e.target.value })}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddComment(post.id)}
                  placeholder="เขียนความคิดเห็นของคุณ..."
                  className="flex-1 px-4 py-2.5 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-warehouse-orange"
                />
                <button
                  onClick={() => handleAddComment(post.id)}
                  className="px-3.5 py-2.5 rounded-xl bg-warehouse-orange hover:bg-warehouse-orange/90 text-white text-xs font-bold transition-all shadow-sm shadow-warehouse-orange/20"
                >
                  <Send size={14} />
                </button>
              </div>
            </div>

          </GlassCard>
        ))}
      </div>

      {/* 4. MODAL: CREATE / EDIT ACTIVITY POST */}
      {(showCreateModal || editingPost !== null) && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <GlassCard className="w-full max-w-xl p-6 border border-slate-200/50 dark:border-white/10 space-y-5 animate-fadeIn">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200/50 dark:border-white/5">
              <h3 className="font-bold text-base text-slate-800 dark:text-white flex items-center gap-2">
                <Sparkles size={18} className="text-warehouse-orange" />
                <span>{editingPost ? 'แก้ไขโพสต์กิจกรรม' : 'โพสต์กิจกรรมแผนกคลังสินค้าใหม่'}</span>
              </h3>
              <button 
                onClick={() => {
                  setShowCreateModal(false);
                  setEditingPost(null);
                }} 
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSavePost} className="space-y-4 text-xs">
              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-slate-400">หัวข้อกิจกรรม (Activity Title)</label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="เช่น 🏆 KAIZEN ดีเด่นประจำเดือน หรือ ⚽ กิจกรรมแข่งกีฬาสีโรงงาน"
                  className="glass-input text-xs"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-slate-400">หมวดหมู่กิจกรรม (Category)</label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value as any)}
                  className="glass-input text-xs font-semibold"
                >
                  <option value="กิจกรรมคลังสินค้า">📦 กิจกรรมคลังสินค้า (Warehouse Activity)</option>
                  <option value="KAIZEN ดีเด่น">🏆 KAIZEN ดีเด่น (Kaizen Award)</option>
                  <option value="กีฬาสีโรงงาน">⚽ กีฬาสีโรงงาน (Factory Sports Day)</option>
                  <option value="ความปลอดภัย">🥽 ความปลอดภัย (Safety Training)</option>
                  <option value="ประกาศข่าวสาร">📢 ประกาศข่าวสารทั่วไป (General News)</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-slate-400">ข้อความ / รายละเอียดกิจกรรม (Description)</label>
                <textarea
                  rows={4}
                  required
                  value={formContent}
                  onChange={(e) => setFormContent(e.target.value)}
                  placeholder="พิมพ์รายละเอียดกิจกรรม รางวัลที่ได้รับ หรือข้อมูลข่าวสารประชาสัมพันธ์ที่นี่..."
                  className="glass-input text-xs"
                />
              </div>

              {/* Media Upload / URL Input */}
              <div className="space-y-2">
                <label className="font-bold text-slate-400">แนบรูปภาพ หรือ วิดีโอประกอบกิจกรรม (Media Attachment)</label>
                
                <div className="flex items-center gap-3">
                  <label className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-slate-200 text-xs font-bold cursor-pointer border border-slate-200/50 dark:border-white/5 flex items-center gap-1.5 transition-all">
                    <Upload size={14} className="text-warehouse-orange" />
                    <span>{isUploadingImage ? 'กำลังอัปโหลดและบีบอัดรูป...' : 'อัปโหลดรูปภาพใหม่จากเครื่อง'}</span>
                    <input type="file" accept="image/*" disabled={isUploadingImage} onChange={handleImageFileSelect} className="hidden" />
                  </label>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="url"
                    value={formMediaUrl}
                    onChange={(e) => {
                      setFormMediaUrl(e.target.value);
                      setMediaPreview(e.target.value);
                    }}
                    placeholder="หรือวาง URL รูปภาพ/วิดีโอ (e.g. https://...)"
                    className="glass-input text-xs flex-1"
                  />
                </div>

                {mediaPreview && (
                  <div className="relative mt-2 rounded-xl overflow-hidden border border-slate-200/50 dark:border-white/10 max-h-48">
                    <img src={mediaPreview} alt="Preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => {
                        setMediaPreview(null);
                        setFormMediaUrl('');
                      }}
                      className="absolute top-2 right-2 p-1.5 rounded-full bg-slate-950/70 text-white"
                    >
                      <X size={14} />
                    </button>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200/50 dark:border-white/5">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setEditingPost(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-xs font-semibold"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={isUploadingImage}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-warehouse-orange to-amber-500 hover:from-warehouse-orange/95 hover:to-amber-500/95 disabled:opacity-50 text-white text-xs font-bold shadow-md shadow-warehouse-orange/20 flex items-center gap-2"
                >
                  {isUploadingImage ? 'กำลังอัปโหลด...' : (editingPost ? 'บันทึกการแก้ไข' : 'เผยแพร่โพสต์กิจกรรม')}
                </button>
              </div>
            </form>
          </GlassCard>
        </div>
      )}

    </div>
  );
}
