'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import GlassCard from '../../components/GlassCard';
import { 
  Network, 
  Plus, 
  Trash2, 
  Edit, 
  Upload, 
  X, 
  User, 
  Save, 
  Building2,
  ChevronRight,
  UserCheck,
  ZoomIn,
  ZoomOut,
  Maximize
} from 'lucide-react';

import { uploadToImgBB } from '../../utils/uploadToImgBB';

interface OrgChartItem {
  id: number;
  name: string;
  role_name: string;
  level_order: number; // 1: ผู้จัดการ, 2: ผู้ช่วยผู้จัดการ, 3: หัวหน้าแผนก, 4: หัวหน้างาน, 5: ปฏิบัติงาน
  level?: string;
  warehouse_area?: string;
  image_url: string;
  display_order?: number;
  parent_id?: number | null;
  photo_size?: string;
  photo_shape?: string;
  pos_x?: number;
  pos_y?: number;
}

export default function OrgChartPage() {
  const { api, user } = useAuth();
  const [orgItems, setOrgItems] = useState<OrgChartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const canvasRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isAdmin = user?.role === 'admin';

  // Zoom and Pan States
  const [zoom, setZoom] = useState(0.45);

  // Drag and Drop Free Position States
  const [draggingCardId, setDraggingCardId] = useState<number | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [canvasItems, setCanvasItems] = useState<OrgChartItem[]>([]);

  // Automatically calculate grid positions for items that don't have custom coordinates saved (pos_x === 0 && pos_y === 0)
  useEffect(() => {
    if (orgItems.length === 0) {
      setCanvasItems([]);
      return;
    }

    const updatedItems = [...orgItems];
    const levelsCount: Record<number, number> = {};
    const levelsIndex: Record<number, number> = {};

    // Count items per level that don't have coordinates
    updatedItems.forEach(item => {
      if ((item.pos_x === 0 || !item.pos_x) && (item.pos_y === 0 || !item.pos_y)) {
        levelsCount[item.level_order] = (levelsCount[item.level_order] || 0) + 1;
      }
    });

    const itemsWithCoords = updatedItems.map(item => {
      let x = item.pos_x || 0;
      let y = item.pos_y || 0;

      if (x === 0 && y === 0) {
        // Auto layout grid
        const levelYMap: Record<number, number> = {
          1: 50,
          2: 300,
          3: 550,
          4: 800,
          5: 1050,
          6: 1300,
          7: 1550
        };
        y = levelYMap[item.level_order] || 1050;

        const count = levelsCount[item.level_order] || 1;
        const index = levelsIndex[item.level_order] || 0;
        levelsIndex[item.level_order] = index + 1;

        // Spread horizontally
        const canvasWidth = 5800;
        const cardWidth = 208; // w-52 is 208px
        const spacing = canvasWidth / (count + 1);
        x = Math.round(spacing * (index + 1) - cardWidth / 2);
      }

      return { ...item, pos_x: x, pos_y: y };
    });

    setCanvasItems(itemsWithCoords);
  }, [orgItems]);

  const handleMouseDown = (e: React.MouseEvent, item: OrgChartItem) => {
    if (!isAdmin) return; // Only admin can drag/reposition cards
    if (e.button !== 0) return; // only left click
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('a') || target.closest('select')) return;

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    // Divide by zoom to offset screen coordinate scale
    const mouseX = (e.clientX - rect.left) / zoom;
    const mouseY = (e.clientY - rect.top) / zoom;

    setDraggingCardId(item.id);
    setDragOffset({
      x: mouseX - (item.pos_x || 0),
      y: mouseY - (item.pos_y || 0)
    });
  };

  const handleTouchStart = (e: React.TouchEvent, item: OrgChartItem) => {
    if (!isAdmin) return; // Only admin can drag/reposition cards
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('a') || target.closest('select')) return;

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const touch = e.touches[0];
    // Divide by zoom to offset screen coordinate scale
    const touchX = (touch.clientX - rect.left) / zoom;
    const touchY = (touch.clientY - rect.top) / zoom;

    setDraggingCardId(item.id);
    setDragOffset({
      x: touchX - (item.pos_x || 0),
      y: touchY - (item.pos_y || 0)
    });
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (draggingCardId === null) return;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    // Divide by zoom to offset screen coordinate scale
    const mouseX = (e.clientX - rect.left) / zoom;
    const mouseY = (e.clientY - rect.top) / zoom;

    const newX = Math.max(0, mouseX - dragOffset.x);
    const newY = Math.max(0, mouseY - dragOffset.y);

    setCanvasItems(prev => prev.map(item => 
      item.id === draggingCardId 
        ? { ...item, pos_x: newX, pos_y: newY }
        : item
    ));
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (draggingCardId === null) return;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const touch = e.touches[0];
    // Divide by zoom to offset screen coordinate scale
    const touchX = (touch.clientX - rect.left) / zoom;
    const touchY = (touch.clientY - rect.top) / zoom;

    const newX = Math.max(0, touchX - dragOffset.x);
    const newY = Math.max(0, touchY - dragOffset.y);

    setCanvasItems(prev => prev.map(item => 
      item.id === draggingCardId 
        ? { ...item, pos_x: newX, pos_y: newY }
        : item
    ));
  };

  const handleMouseUp = async () => {
    if (draggingCardId === null) return;

    const item = canvasItems.find(p => p.id === draggingCardId);
    if (item) {
      try {
        await api.put(`/api/org-chart/${item.id}`, {
          name: item.name,
          role_name: item.role_name,
          level_order: item.level_order,
          level: item.level || '',
          warehouse_area: item.warehouse_area || '',
          image_url: item.image_url,
          parent_id: item.parent_id,
          photo_size: item.photo_size || 'md',
          photo_shape: item.photo_shape || 'circle',
          pos_x: item.pos_x,
          pos_y: item.pos_y
        });
        
        // Update main state so everything remains in sync
        setOrgItems(prev => prev.map(p => 
          p.id === item.id 
            ? { ...p, pos_x: item.pos_x, pos_y: item.pos_y }
            : p
        ));
      } catch (err) {
        console.error('Failed to save card coordinate position', err);
      }
    }
    setDraggingCardId(null);
  };

  useEffect(() => {
    if (draggingCardId !== null) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleTouchMove, { passive: false });
      window.addEventListener('touchend', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [draggingCardId, dragOffset, canvasItems, zoom]);

  const handleFitScreen = () => {
    const container = containerRef.current;
    if (!container || canvasItems.length === 0) return;

    const rect = container.getBoundingClientRect();
    const viewportWidth = rect.width;
    const viewportHeight = rect.height || 750;

    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;

    canvasItems.forEach(item => {
      const x = item.pos_x || 0;
      const y = item.pos_y || 0;
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    });

    // Card sizes
    maxX += 208; // width of card
    maxY += 170; // height of card

    const contentWidth = maxX - minX;
    const contentHeight = maxY - minY;

    if (contentWidth <= 0 || contentHeight <= 0) return;

    const padding = 120; // safe padding around bounds
    const scaleX = viewportWidth / (contentWidth + padding);
    const scaleY = viewportHeight / (contentHeight + padding);
    
    // Ideal fitted zoom capped within a premium UX range
    const newZoom = Math.min(Math.max(Math.min(scaleX, scaleY), 0.15), 1.2);

    setZoom(newZoom);

    // After updating zoom state, scroll container to center the bounding box
    setTimeout(() => {
      const scrollX = minX - (viewportWidth / newZoom - contentWidth) / 2;
      const scrollY = minY - (viewportHeight / newZoom - contentHeight) / 2;
      container.scrollLeft = Math.max(0, scrollX * newZoom);
      container.scrollTop = Math.max(0, scrollY * newZoom);
    }, 100);
  };

  // Auto-fit screen once items are loaded
  useEffect(() => {
    if (canvasItems.length > 0) {
      const timer = setTimeout(() => {
        handleFitScreen();
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [canvasItems.length]);

  // Form modals state
  const [showFormModal, setShowFormModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [formState, setFormState] = useState<{
    name: string;
    role_name: string;
    level_order: number;
    level: string;
    warehouse_area: string;
    image_url: string;
    parent_id: string;
    photo_size: string;
    photo_shape: string;
    pos_x: number;
    pos_y: number;
  }>({
    name: '',
    role_name: '',
    level_order: 5,
    level: '',
    warehouse_area: 'คลังสินค้า1',
    image_url: '',
    parent_id: '',
    photo_size: 'md',
    photo_shape: 'circle',
    pos_x: 0,
    pos_y: 0
  });
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  // Fetch organization items
  const fetchOrgItems = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/api/org-chart');
      setOrgItems(res.data);
    } catch (err) {
      console.error('Failed to load org chart items', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrgItems();
  }, []);

  // Handle image upload converting to ImgBB CDN URL or Base64 fallback
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('กรุณาเลือกไฟล์รูปภาพเท่านั้น');
        return;
      }
      setUploadedFileName(file.name);
      setIsUploading(true);
      
      try {
        const cdnUrl = await uploadToImgBB(file);
        setFormState(prev => ({ ...prev, image_url: cdnUrl }));
        setIsUploading(false);
      } catch (err) {
        console.warn('Falling back to local image compression:', err);
        const reader = new FileReader();
        reader.onload = (event) => {
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement('canvas');
            const max_size = 150;
            let width = img.width;
            let height = img.height;

            if (width > height) {
              if (width > max_size) {
                height *= max_size / width;
                width = max_size;
              }
            } else {
              if (height > max_size) {
                width *= max_size / height;
                height = max_size;
              }
            }

            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.drawImage(img, 0, 0, width, height);
              const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
              setFormState(prev => ({ ...prev, image_url: compressedBase64 }));
            }
            setIsUploading(false);
          };
          img.src = event.target?.result as string;
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleOpenAddModal = () => {
    setIsEditing(false);
    setEditingId(null);
    setFormState({
      name: '',
      role_name: '',
      level_order: 5,
      level: '',
      warehouse_area: 'คลังสินค้า1',
      image_url: '',
      parent_id: '',
      photo_size: 'md',
      photo_shape: 'circle',
      pos_x: 0,
      pos_y: 0
    });
    setUploadedFileName('');
    setShowFormModal(true);
  };

  const handleOpenEditModal = (item: OrgChartItem) => {
    setIsEditing(true);
    setEditingId(item.id);
    setFormState({
      name: item.name,
      role_name: item.role_name,
      level_order: item.level_order,
      level: item.level || '',
      warehouse_area: item.warehouse_area || 'คลังสินค้า1',
      image_url: item.image_url,
      parent_id: item.parent_id !== undefined && item.parent_id !== null ? item.parent_id.toString() : '',
      photo_size: item.photo_size || 'md',
      photo_shape: item.photo_shape || 'circle',
      pos_x: item.pos_x || 0,
      pos_y: item.pos_y || 0
    });
    setUploadedFileName(item.image_url ? 'มีรูปภาพพนักงานเดิม' : '');
    setShowFormModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.name || !formState.role_name) {
      alert('กรุณากรอกชื่อและตำแหน่งให้ครบถ้วน');
      return;
    }

    try {
      if (isEditing && editingId !== null) {
        await api.put(`/api/org-chart/${editingId}`, formState);
      } else {
        await api.post('/api/org-chart', formState);
      }
      setShowFormModal(false);
      fetchOrgItems();
    } catch (err) {
      console.error('Failed to save org item', err);
      alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!window.confirm(`คุณต้องการลบตำแหน่งของ "${name}" ออกจากผังองค์กรใช่หรือไม่?`)) {
      return;
    }
    try {
      await api.delete(`/api/org-chart/${id}`);
      fetchOrgItems();
    } catch (err) {
      console.error('Failed to delete org item', err);
      alert('เกิดข้อผิดพลาดในการลบข้อมูล');
    }
  };





  // Render a single member card
  const renderMemberCard = (item: OrgChartItem) => {
    // Find parent/supervisor name
    const parentNode = canvasItems.find(p => p.id === item.parent_id);

    // Frame Shape and Size settings
    const shapeClass = item.photo_shape === 'rounded' 
      ? 'rounded-2xl' 
      : item.photo_shape === 'circle' || !item.photo_shape
      ? 'rounded-full'
      : ''; // hexagon uses clipPath style

    const sizeClass = item.photo_size === 'sm'
      ? 'w-14 h-14'
      : item.photo_size === 'lg'
      ? 'w-24 h-24'
      : 'w-18 h-18'; // default md

    const clipStyle = item.photo_shape === 'hexagon'
      ? { clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }
      : undefined;

    // Card border glow color based on level
    const levelGlowClass = item.level_order === 1
      ? 'border-amber-400/50 hover:border-amber-400 shadow-amber-500/5 dark:shadow-none'
      : item.level_order === 2 || item.level_order === 3
      ? 'border-emerald-500/35 hover:border-emerald-500 shadow-emerald-500/5 dark:shadow-none'
      : 'border-slate-200/60 dark:border-white/5 hover:border-warehouse-orange/30';

    const isDragging = draggingCardId === item.id;

    // Predefined colors for Warehouse Zone badges
    const zoneColors: Record<string, string> = {
      'คลังสินค้า 24 Land': 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20',
      'คลังสินค้า Coil': 'bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400 border border-purple-200 dark:border-purple-500/20',
      'คลังสินค้า 2PCS': 'bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400 border border-orange-200 dark:border-orange-500/20',
      'คลังสินค้าโรง2': 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400 border border-red-200 dark:border-red-500/20',
      'คลังสินค้าโรง5': 'bg-pink-50 text-pink-600 dark:bg-pink-500/10 dark:text-pink-400 border border-pink-200 dark:border-pink-500/20',
      'คลังสินค้า1': 'bg-teal-50 text-teal-600 dark:bg-teal-500/10 dark:text-teal-400 border border-teal-200 dark:border-teal-500/20',
      'คลังสินค้า2': 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20',
      'ฝ่ายวางแผน': 'bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-400 border border-green-200 dark:border-green-500/20',
    };
    const badgeColorClass = zoneColors[item.warehouse_area || ''] || 'bg-slate-50 text-slate-650 dark:bg-white/5 dark:text-slate-400 border border-slate-200 dark:border-white/5';

    const getPositionBadgeStyle = (roleName: string) => {
      const name = roleName || '';
      if (name.includes('ผู้จัดการ') || name.toLowerCase().includes('manager')) {
        return 'text-rose-600 bg-rose-50 border-rose-200 dark:text-rose-450 dark:bg-rose-500/10 dark:border-rose-500/20';
      }
      if (name.includes('หัวหน้า') || name.toLowerCase().includes('supervisor') || name.toLowerCase().includes('leader')) {
        return 'text-purple-650 bg-purple-50 border-purple-200 dark:text-purple-450 dark:bg-purple-500/10 dark:border-purple-500/20';
      }
      if (name.includes('เจ้าหน้าที่') || name.toLowerCase().includes('officer') || name.toLowerCase().includes('staff')) {
        return 'text-sky-600 bg-sky-50 border-sky-200 dark:text-sky-450 dark:bg-sky-500/10 dark:border-sky-500/20';
      }
      if (name.includes('ขับรถยก') || name.toLowerCase().includes('forklift')) {
        return 'text-amber-600 bg-amber-50 border-amber-200 dark:text-amber-450 dark:bg-amber-500/10 dark:border-amber-500/20';
      }
      if (name.includes('พนักงาน') || name.toLowerCase().includes('worker') || name.toLowerCase().includes('operator') || name.includes('จัดเตรียม')) {
        return 'text-slate-600 bg-slate-100 border-slate-200 dark:text-slate-400 dark:bg-slate-500/10 dark:border-slate-500/20';
      }
      return 'text-warehouse-orange bg-warehouse-orange/5 border border-warehouse-orange/15';
    };

    const positionBadgeClass = getPositionBadgeStyle(item.role_name);

    return (
      <div 
        key={item.id} 
        className="absolute group flex flex-col items-center select-none"
        style={{ 
          left: `${item.pos_x || 0}px`, 
          top: `${item.pos_y || 0}px`,
          position: 'absolute',
          zIndex: isDragging ? 30 : 10
        }}
        onMouseDown={(e) => handleMouseDown(e, item)}
        onTouchStart={(e) => handleTouchStart(e, item)}
      >
        {/* Header label for Level when not dragging, helps visualize hierarchy structure */}
        <div className="text-[8px] font-bold text-slate-400 dark:text-slate-500 mb-1 pointer-events-none uppercase tracking-wider">
          Level {item.level_order}
        </div>

        <div className={`w-52 p-3.5 rounded-2xl bg-white dark:bg-warehouse-slate border shadow-md flex flex-col items-center text-center transition-shadow duration-300 hover:shadow-lg ${levelGlowClass} ${
          isAdmin ? (isDragging ? 'cursor-grabbing border-emerald-500 scale-105 shadow-xl' : 'cursor-grab') : ''
        }`}>
          
          {/* Profile Image / Initial */}
          <div 
            style={clipStyle}
            className={`${sizeClass} ${shapeClass} overflow-hidden border-2 border-emerald-500 bg-emerald-50 dark:bg-white/5 flex items-center justify-center mb-2.5 shadow-md pointer-events-none`}
          >
            {item.image_url ? (
              <img src={item.image_url} alt={item.name} className="w-full h-full object-cover pointer-events-none" />
            ) : (
              <User size={item.photo_size === 'sm' ? 24 : item.photo_size === 'lg' ? 44 : 32} className="text-emerald-600 dark:text-emerald-400 pointer-events-none" />
            )}
          </div>

          {/* Member Details */}
          <h5 className="font-bold text-xs sm:text-sm text-slate-800 dark:text-white leading-snug pointer-events-none">{item.name}</h5>
          <p className={`text-[9px] font-extrabold mt-1 px-2 py-0.5 rounded-full border max-w-full truncate pointer-events-none ${positionBadgeClass}`}>
            {item.role_name} {item.level ? `(${item.level})` : ''}
          </p>

          {/* Warehouse Zone Dropdown-based Badge */}
          {item.warehouse_area && (
            <p className={`text-[8px] font-bold mt-2 px-2 py-0.5 rounded-lg pointer-events-none ${badgeColorClass}`}>
              {item.warehouse_area}
            </p>
          )}

          {/* Admin actions overlay */}
          {isAdmin && (
            <div className="absolute top-8 right-2 flex items-center gap-1 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity duration-200 bg-slate-950/40 backdrop-blur-md p-1.5 rounded-xl z-20">
              <button 
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpenEditModal(item);
                }}
                className="p-1 hover:bg-white/20 text-white rounded transition-colors"
                title="แก้ไข"
              >
                <Edit size={12} />
              </button>
              <button 
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(item.id, item.name);
                }}
                className="p-1 hover:bg-rose-500/20 text-rose-400 rounded transition-colors"
                title="ลบ"
              >
                <Trash2 size={12} />
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl min-h-screen">
      
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-1.5">
            <Building2 size={12} />
            <span>Swan Industries (Thailand) Co., Ltd.</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-800 dark:text-white flex items-center gap-3">
            <Network className="text-warehouse-orange" size={32} />
            <span>โครงสร้างองค์กร (Finished Goods Warehouse)</span>
          </h2>
          <p className="text-xs text-slate-400 font-semibold mt-1">ผังสายงานแบบลากอิสระ แยกเส้นสีตามโซนคลังสินค้าและการบังคับบัญชา</p>
        </div>

        <div className="flex items-center gap-3">
          {isAdmin && (
            <button
              onClick={handleOpenAddModal}
              className="flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-emerald-600/15"
            >
              <Plus size={16} />
              <span>เพิ่มตำแหน่งในผัง</span>
            </button>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center h-80 gap-3">
          <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs text-slate-400 font-bold">กำลังโหลดผังองค์กร...</p>
        </div>
      ) : (
        <div className="relative w-full">
          
          {/* Floating Zoom Control Panel */}
          <div className="absolute top-4 right-4 z-30 flex items-center gap-1.5 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200/50 dark:border-white/5 p-1.5 rounded-2xl shadow-lg">
            <button
              type="button"
              onClick={() => setZoom(prev => Math.max(0.15, prev - 0.05))}
              className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 text-slate-600 dark:text-slate-200 rounded-xl transition-all"
              title="ซูมออก"
            >
              <ZoomOut size={14} />
            </button>
            <span className="text-[10px] font-extrabold text-slate-600 dark:text-slate-300 min-w-[36px] text-center">
              {Math.round(zoom * 100)}%
            </span>
            <button
              type="button"
              onClick={() => setZoom(prev => Math.min(1.2, prev + 0.05))}
              className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 text-slate-600 dark:text-slate-200 rounded-xl transition-all"
              title="ซูมเข้า"
            >
              <ZoomIn size={14} />
            </button>
            <div className="w-px h-4 bg-slate-200 dark:bg-white/10 mx-1"></div>
            <button
              type="button"
              onClick={handleFitScreen}
              className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 text-emerald-600 dark:text-emerald-400 rounded-xl transition-all flex items-center gap-1 text-[10px] font-bold"
              title="จัดให้พอดีหน้าจอ"
            >
              <Maximize size={12} />
              <span>พอดีหน้าจอ</span>
            </button>
          </div>

          {/* Scrollable Viewport Container */}
          <div 
            ref={containerRef}
            className="relative w-full overflow-auto bg-slate-50/50 dark:bg-slate-950/20 border border-slate-200/50 dark:border-white/5 rounded-3xl p-4 min-h-[750px] shadow-inner"
          >
            {/* Scaled Layout Wrapper (to ensure scrollbars match scaled canvas bounds) */}
            <div 
              style={{ 
                width: `${6000 * zoom}px`, 
                height: `${4000 * zoom}px`,
                position: 'relative'
              }}
            >
              {/* Actual Internal Dragging Canvas */}
              <div 
                ref={canvasRef} 
                className="relative" 
                style={{ 
                  width: '6000px', 
                  height: '4000px',
                  transform: `scale(${zoom})`,
                  transformOrigin: 'top left',
                  position: 'absolute',
                  left: 0,
                  top: 0
                }}
              >
                {/* SVG Connections Container */}
                <svg className="absolute inset-0 pointer-events-none w-full h-full" style={{ zIndex: 0 }}>
                  <defs>
                    <marker
                      id="arrow"
                      viewBox="0 0 10 10"
                      refX="6"
                      refY="5"
                      markerWidth="6"
                      markerHeight="6"
                      orient="auto-start-reverse"
                    >
                      <path d="M 0 1 L 10 5 L 0 9 z" fill="#94a3b8" />
                    </marker>
                  </defs>
                  {canvasItems.map(item => {
                    if (!item.parent_id) return null;
                    const parent = canvasItems.find(p => p.id === item.parent_id);
                    if (!parent) return null;

                    // Parent bottom-center point calculation
                    const startX = (parent.pos_x || 0) + 104; // w-52 is 208px, center is 104px
                    const startY = (parent.pos_y || 0) + 150; // card bottom estimate

                    // Child top-center point
                    const endX = (item.pos_x || 0) + 104;
                    const endY = (item.pos_y || 0);

                    const midY = (startY + endY) / 2;
                    const pathD = `M ${startX} ${startY} C ${startX} ${midY}, ${endX} ${midY}, ${endX} ${endY}`;

                    // Color lines based on subordinate's zone choice
                    const zoneColors: Record<string, string> = {
                      'คลังสินค้า 24 Land': '#3b82f6',
                      'คลังสินค้า Coil': '#a855f7',
                      'คลังสินค้า 2PCS': '#f97316',
                      'คลังสินค้าโรง2': '#ef4444',
                      'คลังสินค้าโรง5': '#ec4899',
                      'คลังสินค้า1': '#14b8a6',
                      'คลังสินค้า2': '#6366f1',
                      'ฝ่ายวางแผน': '#22c55e',
                    };
                    const strokeColor = zoneColors[item.warehouse_area || ''] || '#94a3b8';

                    return (
                      <g key={`line-${item.id}`}>
                        <path 
                          d={pathD} 
                          stroke={strokeColor} 
                          strokeWidth="2.5" 
                          fill="none" 
                          className="opacity-70 dark:opacity-50 transition-all duration-100"
                          markerEnd="url(#arrow)"
                        />
                      </g>
                    );
                  })}
                </svg>

                {/* Render Canvas Draggable Cards */}
                {canvasItems.map(item => renderMemberCard(item))}

                {canvasItems.length === 0 && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <GlassCard className="p-8 text-center max-w-md pointer-events-auto">
                      <Network size={48} className="mx-auto text-slate-400 mb-3" />
                      <h4 className="font-bold text-slate-700 dark:text-white mb-1">ยังไม่มีข้อมูลผังองค์กร</h4>
                      <p className="text-xs text-slate-400">โปรดเข้าสู่ระบบด้วยสิทธิ์ผู้ดูแลระบบ (Admin) เพื่อเพิ่มรายชื่อพนักงานในผัง</p>
                    </GlassCard>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ADD / EDIT POSITION MODAL */}
      {showFormModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <GlassCard className="w-full max-w-md my-8 overflow-hidden border border-white/10" animate={false}>
            <div className="flex items-center justify-between pb-4 border-b border-slate-200/50 dark:border-white/5 mb-6">
              <h3 className="font-bold text-base text-slate-800 dark:text-white flex items-center gap-2">
                <Network size={18} className="text-emerald-500" />
                <span>{isEditing ? 'แก้ไขตำแหน่งพนักงาน' : 'เพิ่มตำแหน่งใหม่ในผัง'}</span>
              </h3>
              <button 
                onClick={() => setShowFormModal(false)} 
                className="text-slate-400 hover:text-slate-200"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase">ระดับในสายงาน (Hierarchy Level)</label>
                <select
                  value={formState.level_order}
                  onChange={(e) => setFormState(prev => ({ ...prev, level_order: parseInt(e.target.value, 10) }))}
                  className="glass-input text-xs w-full bg-white dark:bg-warehouse-slate"
                >
                  <option value={1}>1. ผู้จัดการฝ่าย (Department Manager)</option>
                  <option value={2}>2. ผู้จัดการแผนก (Section Manager)</option>
                  <option value={3}>3. หัวหน้าแผนก (Section Head)</option>
                  <option value={4}>4. หัวหน้างาน (Supervisor)</option>
                  <option value={5}>5. เจ้าหน้าที่ (Officer / Staff)</option>
                  <option value={6}>6. พนักงานขับรถยก (Forklift Driver)</option>
                  <option value={7}>7. พนักงานหน้าลิฟท์ (Lift Operator)</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase">รายงานต่อผู้บังคับบัญชา (Reports To)</label>
                <select
                  value={formState.parent_id || ''}
                  onChange={(e) => setFormState(prev => ({ ...prev, parent_id: e.target.value }))}
                  className="glass-input text-xs w-full bg-white dark:bg-warehouse-slate"
                >
                  <option value="">-- ไม่มี (ผู้จัดการสูงสุดในแผนก) --</option>
                  {orgItems
                    .filter(item => item.id !== editingId)
                    .map(item => (
                      <option key={item.id} value={item.id}>
                        {item.name} ({item.role_name})
                      </option>
                    ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase">ชื่อ-นามสกุลพนักงาน</label>
                <input 
                  type="text" 
                  required
                  placeholder="เช่น นายประวิตร รักดี"
                  value={formState.name}
                  onChange={(e) => setFormState(prev => ({ ...prev, name: e.target.value }))}
                  className="glass-input text-xs w-full bg-white dark:bg-warehouse-slate"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase">ชื่อตำแหน่งงาน (Job Title)</label>
                <input 
                  type="text" 
                  required
                  placeholder="เช่น พนักงานขับรถยก หรือ หัวหน้างานคลังสินค้า"
                  value={formState.role_name}
                  onChange={(e) => setFormState(prev => ({ ...prev, role_name: e.target.value }))}
                  className="glass-input text-xs w-full bg-white dark:bg-warehouse-slate"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">เลเวลตำแหน่ง (Level)</label>
                  <input 
                     type="text" 
                     placeholder="เช่น L1, L2, L3"
                     value={formState.level}
                     onChange={(e) => setFormState(prev => ({ ...prev, level: e.target.value }))}
                     className="glass-input text-xs w-full bg-white dark:bg-warehouse-slate"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">โซนคลัง (Zone)</label>
                  <select
                    value={formState.warehouse_area}
                    onChange={(e) => setFormState(prev => ({ ...prev, warehouse_area: e.target.value }))}
                    className="glass-input text-xs w-full bg-white dark:bg-warehouse-slate"
                  >
                    <option value="คลังสินค้า 24 Land">1. คลังสินค้า 24 Land</option>
                    <option value="คลังสินค้า Coil">2. คลังสินค้า Coil</option>
                    <option value="คลังสินค้า 2PCS">3. คลังสินค้า 2PCS</option>
                    <option value="คลังสินค้าโรง2">4. คลังสินค้าโรง2</option>
                    <option value="คลังสินค้าโรง5">5. คลังสินค้าโรง5</option>
                    <option value="คลังสินค้า1">6. คลังสินค้า1</option>
                    <option value="คลังสินค้า2">7. คลังสินค้า2</option>
                    <option value="ฝ่ายวางแผน">8. ฝ่ายวางแผน</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">ขนาดรูปภาพ (Photo Size)</label>
                  <select
                    value={formState.photo_size}
                    onChange={(e) => setFormState(prev => ({ ...prev, photo_size: e.target.value }))}
                    className="glass-input text-xs w-full bg-white dark:bg-warehouse-slate"
                  >
                    <option value="sm">เล็ก (Small)</option>
                    <option value="md">กลาง (Medium)</option>
                    <option value="lg">ใหญ่ (Large)</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">ทรงกรอบรูป (Frame Shape)</label>
                  <select
                    value={formState.photo_shape}
                    onChange={(e) => setFormState(prev => ({ ...prev, photo_shape: e.target.value }))}
                    className="glass-input text-xs w-full bg-white dark:bg-warehouse-slate"
                  >
                    <option value="circle">วงกลม (Circle)</option>
                    <option value="rounded">สี่เหลี่ยมมน (Rounded)</option>
                    <option value="hexagon">หกเหลี่ยม (Hexagon)</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase">รูปภาพพนักงาน (ขนาดจตุรัส 1:1)</label>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200/50 dark:border-white/5 text-xs text-slate-600 dark:text-slate-200 cursor-pointer hover:bg-slate-200 dark:hover:bg-white/10 transition-colors">
                    <Upload size={14} />
                    <span>เลือกรูปภาพ</span>
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                  <span className="text-[10px] text-slate-400 font-medium truncate max-w-[200px]">
                    {uploadedFileName || 'ไม่ได้เลือกรูปภาพ'}
                  </span>
                </div>
              </div>

              {formState.image_url && (
                <div className="flex flex-col items-center justify-center p-3 bg-slate-50 dark:bg-white/5 rounded-2xl">
                  <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-emerald-500 mb-1">
                    <img src={formState.image_url} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setFormState(prev => ({ ...prev, image_url: '' }));
                      setUploadedFileName('');
                    }}
                    className="text-[10px] text-rose-500 font-bold hover:underline"
                  >
                    ลบรูปภาพพรีวิว
                  </button>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200/50 dark:border-white/5">
                <button 
                  type="button" 
                  onClick={() => setShowFormModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200/50 dark:border-white/5 text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5"
                >
                  ยกเลิก
                </button>
                <button 
                  type="submit" 
                  disabled={isUploading}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-md shadow-emerald-600/15 disabled:opacity-50"
                >
                  <Save size={14} />
                  <span>{isUploading ? 'กำลังอัปโหลด...' : 'บันทึกตำแหน่ง'}</span>
                </button>
              </div>
            </form>
          </GlassCard>
        </div>
      )}
    </div>
  );
}
