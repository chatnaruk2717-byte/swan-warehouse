'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import GlassCard from '../../components/GlassCard';
import { 
  Search, 
  Plus, 
  FileText, 
  Trash2, 
  Download, 
  Eye, 
  Upload, 
  X, 
  FolderOpen, 
  ChevronRight,
  Filter,
  ExternalLink
} from 'lucide-react';

interface WarehouseDocument {
  id: number;
  title: string;
  category: 'JD' | 'WI' | 'กฎระเบียบข้อบังคับ' | 'Kaizen' | 'OPL' | 'NearMiss' | 'แบบฟอร์มใช้คลังสินค้า';
  file_url: string;
  uploaded_by: string;
  uploaded_at: string;
}

const CATEGORIES = [
  'JD',
  'WI',
  'กฎระเบียบข้อบังคับ',
  'Kaizen',
  'OPL',
  'NearMiss',
  'แบบฟอร์มใช้คลังสินค้า'
] as const;

export default function DocumentsPage() {
  const { api, user } = useAuth();
  const [documents, setDocuments] = useState<WarehouseDocument[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ทั้งหมด');
  const [isLoading, setIsLoading] = useState(true);

  // Upload modal states
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    title: '',
    category: 'JD' as typeof CATEGORIES[number],
    file_url: ''
  });
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [isUploadingFile, setIsUploadingFile] = useState(false);

  // PDF Viewer modal states
  const [activeViewerDoc, setActiveViewerDoc] = useState<WarehouseDocument | null>(null);
  const [displayDocUrl, setDisplayDocUrl] = useState('');
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsMobile(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
    }
  }, []);

  useEffect(() => {
    if (activeViewerDoc && activeViewerDoc.file_url) {
      if (activeViewerDoc.file_url.startsWith('data:application/pdf')) {
        try {
          const arr = activeViewerDoc.file_url.split(',');
          const mime = arr[0].match(/:(.*?);/)?.[1] || 'application/pdf';
          const bstr = atob(arr[1]);
          let n = bstr.length;
          const u8arr = new Uint8Array(n);
          while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
          }
          const blob = new Blob([u8arr], { type: mime });
          const url = URL.createObjectURL(blob);
          setDisplayDocUrl(url);
          
          return () => {
            URL.revokeObjectURL(url);
          };
        } catch (e) {
          console.error('Failed to parse Base64 PDF to blob', e);
          setDisplayDocUrl(activeViewerDoc.file_url);
        }
      } else {
        setDisplayDocUrl(activeViewerDoc.file_url);
      }
    } else {
      setDisplayDocUrl('');
    }
  }, [activeViewerDoc]);

  // Fetch documents
  const fetchDocuments = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/api/documents');
      setDocuments(res.data);
    } catch (err) {
      console.error('Failed to load documents', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  // Handle PDF file selection & conversion to Base64
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        alert('กรุณาเลือกไฟล์ PDF เท่านั้น');
        return;
      }
      setUploadedFileName(file.name);
      setIsUploadingFile(true);
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadForm(prev => ({ ...prev, file_url: reader.result as string }));
        setIsUploadingFile(false);
      };
      reader.readAsDataURL(file);
    }
  };

  // Submit new document
  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadForm.title || !uploadForm.file_url) {
      alert('กรุณากรอกข้อมูลและเลือกไฟล์ PDF ให้ครบถ้วน');
      return;
    }

    try {
      const res = await api.post('/api/documents', uploadForm);
      setDocuments(prev => [res.data, ...prev]);
      setShowUploadModal(false);
      setUploadForm({ title: '', category: 'JD', file_url: '' });
      setUploadedFileName('');
      alert('อัปโหลดเอกสารสำเร็จเรียบร้อย');
    } catch (err) {
      // Mock Fallback
      const mockDoc: WarehouseDocument = {
        id: Date.now(),
        title: uploadForm.title,
        category: uploadForm.category,
        file_url: uploadForm.file_url,
        uploaded_by: user?.name || 'Staff',
        uploaded_at: new Date().toISOString()
      };
      setDocuments(prev => [mockDoc, ...prev]);
      setShowUploadModal(false);
      setUploadForm({ title: '', category: 'JD', file_url: '' });
      setUploadedFileName('');
      alert('อัปโหลดเอกสารสำเร็จเรียบร้อย (Mock)');
    }
  };

  // Delete document
  const handleDeleteDocument = async (id: number) => {
    if (!confirm('คุณแน่ใจหรือไม่ว่าต้องการลบเอกสารฉบับนี้?')) return;
    try {
      await api.delete(`/api/documents/${id}`);
      setDocuments(prev => prev.filter(d => d.id !== id));
      alert('ลบเอกสารเสร็จสิ้น');
    } catch (err) {
      setDocuments(prev => prev.filter(d => d.id !== id));
      alert('ลบเอกสารเสร็จสิ้น (Mock)');
    }
  };

  // Filter documents
  const filteredDocs = documents.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          doc.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'ทั้งหมด' || doc.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-8 p-1 sm:p-2">
      
      {/* Top Banner Header */}
      <div className="relative rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-br from-warehouse-navy to-indigo-950 p-8 sm:p-10 border border-white/5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(249,115,22,0.12),transparent_45%)]" />
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-3">
              <FolderOpen className="text-warehouse-orange animate-pulse" size={28} />
              เอกสารคลังสินค้า
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm font-medium">
              คลังเก็บแผนผัง วิธีปฏิบัติงาน ใบกติกาข้อบังคับทั่วไป และแบบฟอร์มคลังสินค้าเพื่อความโปร่งใส ปลอดภัย และมีมาตรฐาน
            </p>
          </div>

          {/* Action Trigger button for upload (Admin and Staff only) */}
          {user && ['admin', 'staff'].includes(user.role) && (
            <button
              onClick={() => setShowUploadModal(true)}
              className="px-6 py-3.5 bg-gradient-to-r from-warehouse-orange to-amber-500 hover:from-warehouse-orange hover:to-amber-600 text-white rounded-2xl font-bold text-xs shadow-lg shadow-warehouse-orange/20 transition-all flex items-center justify-center gap-2"
            >
              <Plus size={16} />
              อัปโหลดเอกสารใหม่
            </button>
          )}
        </div>
      </div>

      {/* Control Area: Search and Category Pills */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Sidebar Filters */}
        <div className="lg:col-span-1 space-y-5">
          {/* Search Card */}
          <GlassCard className="p-5 border border-slate-200/50 dark:border-white/5 space-y-4">
            <div className="relative">
              <Search className="absolute left-3.5 top-3.5 text-slate-400" size={16} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ค้นหาชื่อเอกสาร..."
                className="w-full pl-10 pr-4 py-3 bg-slate-100/50 dark:bg-slate-900/50 border border-slate-200/50 dark:border-white/5 rounded-2xl text-xs focus:outline-none focus:border-warehouse-orange transition-colors"
              />
            </div>
            
            <div className="flex items-center gap-2 text-slate-400 text-[10px] uppercase font-bold tracking-wider px-1">
              <Filter size={12} />
              <span>หมวดหมู่เอกสาร</span>
            </div>

            <div className="flex flex-col gap-1.5">
              <button
                onClick={() => setSelectedCategory('ทั้งหมด')}
                className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs transition-colors flex items-center justify-between ${
                  selectedCategory === 'ทั้งหมด'
                    ? 'bg-warehouse-orange/15 text-warehouse-orange font-bold border border-warehouse-orange/20'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 border border-transparent'
                }`}
              >
                <span>ทั้งหมด</span>
                <ChevronRight size={12} className={selectedCategory === 'ทั้งหมด' ? 'opacity-100' : 'opacity-40'} />
              </button>

              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs transition-colors flex items-center justify-between ${
                    selectedCategory === cat
                      ? 'bg-warehouse-orange/15 text-warehouse-orange font-bold border border-warehouse-orange/20'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 border border-transparent'
                  }`}
                >
                  <span className="truncate pr-2">{cat}</span>
                  <ChevronRight size={12} className={selectedCategory === cat ? 'opacity-100' : 'opacity-40'} />
                </button>
              ))}
            </div>
          </GlassCard>
        </div>

        {/* Main Document Listing Grid */}
        <div className="lg:col-span-3 space-y-6">
          {isLoading ? (
            <div className="text-center py-20">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-warehouse-orange mx-auto"></div>
              <p className="text-slate-400 text-xs mt-4">กำลังดึงข้อมูลเอกสาร...</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredDocs.map((doc) => (
                  <GlassCard key={doc.id} className="p-5 border border-slate-200/50 dark:border-white/5 flex flex-col justify-between hover:border-warehouse-orange/30 transition-all duration-300">
                    <div className="space-y-3.5">
                      {/* Top Metadata */}
                      <div className="flex items-center justify-between gap-3">
                        <span className={`px-2.5 py-1 rounded-lg text-[9px] font-extrabold uppercase ${
                          doc.category === 'JD' ? 'bg-indigo-500/10 text-indigo-500 border border-indigo-500/20' :
                          doc.category === 'WI' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' :
                          doc.category === 'กฎระเบียบข้อบังคับ' ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20' :
                          doc.category === 'Kaizen' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' :
                          doc.category === 'OPL' ? 'bg-teal-500/10 text-teal-500 border border-teal-500/20' :
                          doc.category === 'NearMiss' ? 'bg-orange-500/10 text-orange-500 border border-orange-500/20' :
                          'bg-purple-500/10 text-purple-500 border border-purple-500/20'
                        }`}>
                          {doc.category}
                        </span>
                        
                        {/* Delete button (Admin and Staff only) */}
                        {user && ['admin', 'staff'].includes(user.role) && (
                          <button
                            onClick={() => handleDeleteDocument(doc.id)}
                            className="text-rose-500 hover:text-rose-400 transition-colors p-1"
                            title="ลบเอกสาร"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>

                      {/* Title & Document Preview info */}
                      <div className="space-y-1.5 min-w-0">
                        <h4 className="font-bold text-slate-800 dark:text-white text-xs sm:text-sm line-clamp-2 leading-snug flex items-start gap-2">
                          <FileText className="text-slate-400 shrink-0 mt-0.5" size={16} />
                          <span>{doc.title}</span>
                        </h4>
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-medium">
                          <span>อัปโหลดโดย: {doc.uploaded_by}</span>
                          <span>•</span>
                          <span>{new Date(doc.uploaded_at).toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                        </div>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex gap-2.5 mt-5 border-t border-slate-100 dark:border-white/5 pt-4">
                      <button
                        onClick={() => setActiveViewerDoc(doc)}
                        className="flex-1 py-2 bg-warehouse-navy hover:bg-warehouse-navy/90 text-slate-700 dark:text-white rounded-xl text-[11px] font-bold transition-all border border-slate-200/50 dark:border-white/5 flex items-center justify-center gap-1.5"
                      >
                        <Eye size={12} />
                        เปิดอ่านออนไลน์
                      </button>
                      <a
                        href={doc.file_url}
                        download={doc.title}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-white rounded-xl text-[11px] font-bold transition-all border border-slate-200/50 dark:border-white/5 flex items-center justify-center"
                        title="ดาวน์โหลด PDF"
                      >
                        <Download size={12} />
                      </a>
                    </div>
                  </GlassCard>
                ))}
              </div>

              {filteredDocs.length === 0 && (
                <div className="text-center py-20 bg-slate-50 dark:bg-white/5 rounded-3xl border border-slate-200/50 dark:border-white/5">
                  <FileText className="mx-auto text-slate-400 mb-3" size={36} />
                  <p className="text-slate-400 text-xs">ไม่พบเอกสารตรงตามเงื่อนไขการค้นหาของคุณ</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* UPLOAD DOCUMENT MODAL */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <GlassCard className="w-full max-w-md overflow-hidden border border-white/10" animate={false}>
            <div className="flex items-center justify-between pb-4 border-b border-slate-200/50 dark:border-white/5 mb-6">
              <h3 className="font-bold text-base flex items-center gap-2">
                <Upload size={18} className="text-warehouse-orange" />
                อัปโหลดเอกสารใหม่
              </h3>
              <button 
                onClick={() => { setShowUploadModal(false); setUploadedFileName(''); }}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">ชื่อหัวข้อเอกสาร</label>
                <input
                  type="text"
                  required
                  value={uploadForm.title}
                  onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })}
                  placeholder="ตัวอย่างเช่น WI-04 ขั้นตอนสวมใส่อุปกรณ์ป้องกันภัย..."
                  className="w-full glass-input text-xs py-2.5 px-3.5"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">หมวดหมู่เอกสาร</label>
                <select
                  value={uploadForm.category}
                  onChange={(e) => setUploadForm({ ...uploadForm, category: e.target.value as typeof CATEGORIES[number] })}
                  className="w-full glass-input text-xs py-2.5 px-3 bg-white dark:bg-warehouse-slate"
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">ไฟล์เอกสาร PDF</label>
                <div className="w-full">
                  <label className="flex items-center justify-center border-2 border-dashed border-slate-300 dark:border-white/15 hover:border-warehouse-orange hover:dark:border-warehouse-orange rounded-2xl p-6 cursor-pointer transition-all bg-white/50 dark:bg-warehouse-slate/20">
                    <div className="text-center space-y-2">
                      <Upload size={24} className="mx-auto text-slate-400 animate-bounce" />
                      <p className="text-xs text-slate-400 font-semibold">
                        {isUploadingFile ? 'กำลังเข้ารหัสไฟล์...' : uploadedFileName ? `ไฟล์ที่เลือก: ${uploadedFileName}` : 'คลิกเพื่อเลือกไฟล์ PDF'}
                      </p>
                      <p className="text-[9px] text-slate-500">จำกัดเฉพาะไฟล์ .pdf เท่านั้น</p>
                    </div>
                    <input
                      type="file"
                      accept="application/pdf"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                  </label>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-200/50 dark:border-white/5 mt-6">
                <button
                  type="button"
                  onClick={() => { setShowUploadModal(false); setUploadedFileName(''); }}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-white rounded-xl text-xs font-bold transition-all border border-slate-200/50 dark:border-white/5"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={isUploadingFile || !uploadForm.file_url}
                  className="flex-1 py-2.5 bg-warehouse-orange text-white rounded-xl text-xs font-bold transition-all hover:bg-warehouse-orange/95 disabled:bg-slate-400 disabled:cursor-not-allowed shadow-md shadow-warehouse-orange/10"
                >
                  {isUploadingFile ? 'กรุณารอไฟล์...' : 'บันทึกเอกสาร'}
                </button>
              </div>
            </form>
          </GlassCard>
        </div>
      )}

      {/* PDF INLINE VIEWER MODAL */}
      {activeViewerDoc && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <GlassCard className="w-full max-w-5xl h-[85vh] flex flex-col p-0 overflow-hidden border border-white/10" animate={false}>
            {/* Header info */}
            <div className="flex items-center justify-between px-6 py-4.5 border-b border-slate-200/50 dark:border-white/5 bg-slate-100/50 dark:bg-white/5 flex-shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <span className="px-2.5 py-0.5 rounded-lg text-[9px] font-extrabold uppercase bg-warehouse-orange/15 text-warehouse-orange border border-warehouse-orange/20 shrink-0">
                  {activeViewerDoc.category}
                </span>
                <span className="font-bold text-xs sm:text-sm text-slate-800 dark:text-white truncate">
                  {activeViewerDoc.title}
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <a 
                  href={displayDocUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-warehouse-orange hover:text-warehouse-orange/80 p-2 rounded-xl bg-warehouse-orange/10 border border-warehouse-orange/20 transition-colors flex items-center gap-1.5 text-xs font-bold shrink-0"
                  title="เปิดในหน้าต่างใหม่ (Open in new window)"
                >
                  <ExternalLink size={14} />
                  <span>เปิดอ่าน PDF เต็มจอ</span>
                </a>
                <button 
                  onClick={() => setActiveViewerDoc(null)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1.5 rounded-lg bg-slate-100 dark:bg-white/5 transition-colors shrink-0"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
            
            {/* Embedded PDF iframe / Mobile Button Fallback */}
            {isMobile ? (
              <div className="flex-1 flex flex-col items-center justify-center p-6 text-center bg-slate-50 dark:bg-slate-900/40 space-y-4">
                <div className="p-4 bg-warehouse-orange/10 text-warehouse-orange rounded-full animate-pulse">
                  <FileText size={48} />
                </div>
                <div className="space-y-1.5 max-w-sm">
                  <h4 className="font-bold text-slate-800 dark:text-white text-sm">ไม่สามารถเปิดแสดง PDF ในหน้านี้โดยตรงบนมือถือ</h4>
                  <p className="text-xs text-slate-400">บราวเซอร์มือถือจำกัดการแสดงผล PDF ในเว็บเพจ ท่านสามารถเปิดเพื่ออ่านไฟล์ขนาดเต็มหรือดาวน์โหลดได้โดยตรงที่ลิงก์ด้านล่าง</p>
                </div>
                <a 
                  href={displayDocUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="px-6 py-3 bg-warehouse-orange hover:bg-warehouse-orange/95 text-white rounded-xl font-bold text-xs shadow-md shadow-warehouse-orange/15 transition-all flex items-center gap-2"
                >
                  <ExternalLink size={14} />
                  <span>เปิดอ่านเอกสาร PDF (Open PDF)</span>
                </a>
              </div>
            ) : (
              <iframe 
                src={displayDocUrl} 
                className="w-full flex-1 border-none bg-slate-900" 
                title={activeViewerDoc.title}
              />
            )}
          </GlassCard>
        </div>
      )}

    </div>
  );
}
