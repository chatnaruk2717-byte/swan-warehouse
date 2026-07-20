'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { 
  Warehouse, 
  Layers, 
  Maximize2, 
  Box, 
  Layers3, 
  Grid, 
  Plus, 
  Edit3, 
  Trash2, 
  Upload, 
  Image as ImageIcon,
  Save,
  X,
  AlertCircle,
  MapPin,
  AlignJustify,
  ArrowUp
} from 'lucide-react';

interface WarehouseLayout {
  id: number;
  zone_name: string;
  storage_level: string;
  area_sqm: number;
  max_capacity_pallets: number;
  max_stack_level: number;
  product_type: string;
  layout_image: string;
  zone_location: string;
  location_rows: number;
  location_stacks: number;
  created_at?: string;
  updated_at?: string;
}

const WAREHOUSE_ZONES = [
  'คลังสินค้า 24 Land',
  'คลังสินค้า Coil',
  'คลังสินค้า 2PCS',
  'คลังสินค้าโรง2,5',
  'คลังสินค้าโรง 6'
];

export default function WarehouseLayoutPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [layouts, setLayouts] = useState<WarehouseLayout[]>([]);
  const [selectedZone, setSelectedZone] = useState<string>(WAREHOUSE_ZONES[0]);
  const [selectedLevel, setSelectedLevel] = useState<string>('');
  
  // Form modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLayout, setEditingLayout] = useState<WarehouseLayout | null>(null);
  const [formFields, setFormFields] = useState({
    zone_name: WAREHOUSE_ZONES[0],
    storage_level: '',
    area_sqm: '',
    max_capacity_pallets: '',
    max_stack_level: '1',
    product_type: '',
    layout_image: '',
    zone_location: '',
    location_rows: '',
    location_stacks: ''
  });

  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Axios instance matching AuthContext configuration
  const api = axios.create({
    baseURL: typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
      ? 'http://localhost:5000'
      : 'https://swan-warehouse.onrender.com',
    timeout: 30000
  });

  // Get authorization headers
  const getAuthHeaders = () => {
    const token = sessionStorage.getItem('token');
    return {
      headers: {
        Authorization: `Bearer ${token}`
      }
    };
  };

  const fetchLayouts = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/api/warehouse-layouts', getAuthHeaders());
      setLayouts(res.data);
      
      // Auto-select first level for the default zone if available
      const zoneLayouts = res.data.filter((l: WarehouseLayout) => l.zone_name === selectedZone);
      if (zoneLayouts.length > 0) {
        setSelectedLevel(zoneLayouts[0].storage_level);
      } else {
        setSelectedLevel('');
      }
    } catch (err) {
      console.error('Error fetching warehouse layouts:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLayouts();
  }, []);

  // Update selected storage level when zone changes
  useEffect(() => {
    const zoneLayouts = layouts.filter(l => l.zone_name === selectedZone);
    if (zoneLayouts.length > 0) {
      setSelectedLevel(zoneLayouts[0].storage_level);
    } else {
      setSelectedLevel('');
    }
  }, [selectedZone, layouts]);

  const currentLayout = layouts.find(
    l => l.zone_name === selectedZone && l.storage_level === selectedLevel
  );

  // Available levels for the currently selected zone
  const availableLevels = Array.from(
    new Set(layouts.filter(l => l.zone_name === selectedZone).map(l => l.storage_level))
  );

  const handleOpenAddModal = () => {
    setEditingLayout(null);
    setFormFields({
      zone_name: selectedZone,
      storage_level: '',
      area_sqm: '',
      max_capacity_pallets: '',
      max_stack_level: '1',
      product_type: '',
      layout_image: '',
      zone_location: '',
      location_rows: '',
      location_stacks: ''
    });
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (layout: WarehouseLayout) => {
    setEditingLayout(layout);
    setFormFields({
      zone_name: layout.zone_name,
      storage_level: layout.storage_level,
      area_sqm: layout.area_sqm.toString(),
      max_capacity_pallets: layout.max_capacity_pallets.toString(),
      max_stack_level: layout.max_stack_level.toString(),
      product_type: layout.product_type,
      layout_image: layout.layout_image || '',
      zone_location: layout.zone_location || '',
      location_rows: layout.location_rows ? layout.location_rows.toString() : '',
      location_stacks: layout.location_stacks ? layout.location_stacks.toString() : ''
    });
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const max_size = 1200; // slightly larger size limit for layout details
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
            setFormFields(prev => ({
              ...prev,
              layout_image: compressedBase64
            }));
          }
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDeleteLayout = async (id: number) => {
    if (!window.confirm('คุณต้องการลบข้อมูล Layout พื้นที่คลังสินค้านี้ใช่หรือไม่?')) return;
    try {
      await api.delete(`/api/warehouse-layouts/${id}`, getAuthHeaders());
      alert('ลบข้อมูล Layout สำเร็จ');
      fetchLayouts();
    } catch (err: any) {
      alert(err.response?.data?.message || 'เกิดข้อผิดพลาดในการลบข้อมูล');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!formFields.zone_name || !formFields.storage_level) {
      setErrorMsg('กรุณากรอกข้อมูลโซนคลังและชั้นที่จัดเก็บให้ครบถ้วน');
      return;
    }

    const payload = {
      zone_name: formFields.zone_name,
      storage_level: formFields.storage_level,
      area_sqm: formFields.area_sqm ? parseFloat(formFields.area_sqm) : 0,
      max_capacity_pallets: formFields.max_capacity_pallets ? parseInt(formFields.max_capacity_pallets, 10) : 0,
      max_stack_level: formFields.max_stack_level ? parseInt(formFields.max_stack_level, 10) : 1,
      product_type: formFields.product_type,
      layout_image: formFields.layout_image,
      zone_location: formFields.zone_location,
      location_rows: formFields.location_rows ? parseInt(formFields.location_rows, 10) : 0,
      location_stacks: formFields.location_stacks ? parseInt(formFields.location_stacks, 10) : 0
    };

    try {
      if (editingLayout) {
        await api.put(`/api/warehouse-layouts/${editingLayout.id}`, payload, getAuthHeaders());
        alert('แก้ไขข้อมูลสำเร็จ');
      } else {
        await api.post('/api/warehouse-layouts', payload, getAuthHeaders());
        alert('เพิ่มข้อมูลสำเร็จ');
      }
      setIsModalOpen(false);
      fetchLayouts();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 p-6 md:p-10 font-sans">
      {/* Headings */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 mb-2 flex items-center gap-3">
            <Grid className="text-emerald-600 w-8 h-8" />
            Layout พื้นที่คลังสินค้า
          </h1>
          <p className="text-slate-500 text-sm md:text-base">
            จัดการและแสดงแผนผัง Layout ชั้นจัดเก็บ พื้นที่จัดเก็บ และรายละเอียดความจุสินค้าของแต่ละโซนคลังสินค้า
          </p>
        </div>
        {isAdmin && (
          <button
            onClick={handleOpenAddModal}
            className="mt-4 md:mt-0 px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white font-semibold rounded-xl flex items-center justify-center gap-2 shadow-md shadow-emerald-700/10 transform hover:-translate-y-0.5 transition duration-200"
          >
            <Plus className="w-5 h-5" />
            เพิ่มข้อมูล Layout
          </button>
        )}
      </div>

      {/* Selectors and Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm mb-8">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5 flex items-center gap-2">
            <Warehouse className="w-4 h-4 text-emerald-600" />
            1. เลือกโซนคลังสินค้า (Warehouse Zone)
          </label>
          <select
            value={selectedZone}
            onChange={(e) => setSelectedZone(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-600 transition duration-150 cursor-pointer font-medium"
          >
            {WAREHOUSE_ZONES.map((zone) => (
              <option key={zone} value={zone}>{zone}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5 flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-600" />
            2. เลือกชั้นที่จัดเก็บ (Storage Level)
          </label>
          <select
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e.target.value)}
            disabled={availableLevels.length === 0}
            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-600 transition duration-150 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer font-medium"
          >
            {availableLevels.length === 0 ? (
              <option value="">ไม่มีข้อมูลระดับจัดเก็บในโซนนี้</option>
            ) : (
              availableLevels.map((lvl) => (
                <option key={lvl} value={lvl}>{lvl}</option>
              ))
            )}
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-600 mb-4"></div>
          <p className="text-slate-500 font-medium">กำลังโหลดข้อมูล Layout...</p>
        </div>
      ) : currentLayout ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Layout Map Blueprint Panel - Enlarge scale */}
          <div className="lg:col-span-8 bg-white border border-slate-200 shadow-sm p-6 rounded-2xl flex flex-col items-center justify-center min-h-[500px] lg:min-h-[600px]">
            <div className="w-full flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-emerald-600" />
                แผนผัง Layout การจัดเก็บ ({currentLayout.zone_name})
              </h2>
              {isAdmin && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenEditModal(currentLayout)}
                    className="p-2 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-600 text-slate-650 rounded-lg transition duration-150 border border-slate-200"
                    title="แก้ไขข้อมูล Layout"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteLayout(currentLayout.id)}
                    className="p-2 bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-650 rounded-lg transition duration-150 border border-slate-200"
                    title="ลบข้อมูล Layout"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {currentLayout.layout_image ? (
              <div className="w-full max-h-[650px] overflow-hidden rounded-xl bg-slate-100 flex items-center justify-center p-3 border border-slate-200 group relative shadow-inner">
                <img
                  src={currentLayout.layout_image}
                  alt={`Layout ${currentLayout.zone_name} ${currentLayout.storage_level}`}
                  className="max-w-full max-h-[600px] object-contain rounded-lg transition-transform duration-300 group-hover:scale-[1.015]"
                />
              </div>
            ) : (
              <div className="w-full h-96 rounded-xl bg-slate-50 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-center p-6">
                <ImageIcon className="w-16 h-16 text-slate-400 mb-3 animate-pulse" />
                <p className="text-slate-600 font-bold text-lg">ยังไม่มีการเพิ่มรูปภาพ Layout แผนผังพื้นที่</p>
                <p className="text-slate-450 text-xs mt-1 max-w-xs">ผู้ดูแลระบบสามารถเพิ่มรูปภาพแผนผังได้โดยการกดปุ่มแก้ไข และอัปโหลดไฟล์ดีไซน์พื้นที่</p>
              </div>
            )}
          </div>

          {/* Details Column - Light Theme Styled */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            {/* Specs Grid */}
            <div className="bg-white border border-slate-200 shadow-sm p-6 rounded-2xl">
              <h2 className="text-lg font-bold text-slate-800 mb-5 flex items-center gap-2 border-b border-slate-100 pb-3">
                <Layers3 className="w-5 h-5 text-emerald-600" />
                รายละเอียดข้อมูลพื้นที่
              </h2>

              <div className="grid grid-cols-1 gap-4">
                {/* SQM */}
                <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-150">
                  <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl shadow-sm">
                    <Maximize2 className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="block text-slate-400 text-xs font-semibold uppercase tracking-wider">ขนาดพื้นที่ทั้งหมด</span>
                    <span className="text-xl font-extrabold text-slate-900">
                      {currentLayout.area_sqm.toLocaleString(undefined, { minimumFractionDigits: 2 })} <span className="text-sm font-normal text-slate-500">ตร.ม.</span>
                    </span>
                  </div>
                </div>

                {/* Max Cap */}
                <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-150">
                  <div className="p-3 bg-orange-50 text-orange-600 rounded-xl shadow-sm">
                    <Box className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="block text-slate-400 text-xs font-semibold uppercase tracking-wider">พิกัดจัดเก็บสูงสุด (Max Capacity)</span>
                    <span className="text-xl font-extrabold text-slate-900">
                      {currentLayout.max_capacity_pallets.toLocaleString()} <span className="text-sm font-normal text-slate-500">พาเลท</span>
                    </span>
                  </div>
                </div>

                {/* Stacking */}
                <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-150">
                  <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl shadow-sm">
                    <Layers className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="block text-slate-400 text-xs font-semibold uppercase tracking-wider">ความสามารถในการวางซ้อน</span>
                    <span className="text-xl font-extrabold text-slate-900">
                      {currentLayout.max_stack_level} <span className="text-sm font-normal text-slate-500">ชั้นพาเลท</span>
                    </span>
                  </div>
                </div>

                {/* Location Zone */}
                <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-150">
                  <div className="p-3 bg-orange-50 text-orange-600 rounded-xl shadow-sm">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="block text-slate-400 text-xs font-semibold uppercase tracking-wider">โซน Location / Bin</span>
                    <span className="text-xl font-extrabold text-slate-900">
                      {currentLayout.zone_location || '-'}
                    </span>
                  </div>
                </div>

                {/* Rows and Stacks details in 2 columns */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-150">
                    <AlignJustify className="w-5 h-5 text-emerald-600" />
                    <div>
                      <span className="block text-slate-400 text-[10px] font-bold uppercase tracking-wider">จำนวนแถว</span>
                      <span className="text-lg font-extrabold text-slate-900">{currentLayout.location_rows || 0} <span className="text-xs font-normal text-slate-500">แถว</span></span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-150">
                    <ArrowUp className="w-5 h-5 text-orange-600" />
                    <div>
                      <span className="block text-slate-400 text-[10px] font-bold uppercase tracking-wider">จำนวนตั้ง / Loc</span>
                      <span className="text-lg font-extrabold text-slate-900">{currentLayout.location_stacks || 0} <span className="text-xs font-normal text-slate-500">ตั้ง</span></span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Product Type description */}
              <div className="mt-5 p-4 bg-slate-50 rounded-xl border border-slate-150">
                <span className="block text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">ประเภทสินค้าหลักที่จัดเก็บ</span>
                <p className="text-sm text-slate-700 leading-relaxed font-semibold">
                  {currentLayout.product_type || 'ไม่มีการระบุประเภทสินค้า'}
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-dashed border-slate-300 rounded-2xl p-16 text-center shadow-sm">
          <Warehouse className="w-16 h-16 text-slate-350 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-650">ไม่พบข้อมูล Layout ในโซนนี้</h2>
          <p className="text-slate-450 text-sm mt-1 max-w-md mx-auto">
            คลังสินค้าโซนนี้ยังไม่มีการจัดทำข้อมูล Layout ชั้นจัดเก็บ สามารถกดปุ่มเพิ่มข้อมูล Layout ด้านขวาบนเพื่อเริ่มต้น
          </p>
        </div>
      )}

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-200">
          <div className="relative w-full max-w-lg bg-white border border-slate-200 rounded-2xl shadow-2xl p-6 overflow-y-auto max-h-[90vh] text-slate-800">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-200">
              <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-emerald-600" />
                {editingLayout ? 'แก้ไขข้อมูล Layout พื้นที่' : 'เพิ่มข้อมูล Layout คลังสินค้าใหม่'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-550 hover:text-slate-800 rounded-lg transition duration-150"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div className="bg-rose-50 border border-rose-200 text-rose-600 p-3.5 rounded-xl text-sm flex items-center gap-2 mb-4">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  โซนคลังสินค้า *
                </label>
                <select
                  value={formFields.zone_name}
                  onChange={(e) => setFormFields({ ...formFields, zone_name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-850 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                >
                  {WAREHOUSE_ZONES.map((zone) => (
                    <option key={zone} value={zone}>{zone}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  ชั้นจัดเก็บ / ระดับระดับจัดเก็บ * (เช่น ชั้น 1, ชั้น 2, โซน A1)
                </label>
                <input
                  type="text"
                  placeholder="ตัวอย่าง: ชั้น 1"
                  value={formFields.storage_level}
                  onChange={(e) => setFormFields({ ...formFields, storage_level: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    จำนวนพื้นที่ (ตร.ม.)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formFields.area_sqm}
                    onChange={(e) => setFormFields({ ...formFields, area_sqm: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Max Capacity (พาเลท)
                  </label>
                  <input
                    type="number"
                    placeholder="0"
                    value={formFields.max_capacity_pallets}
                    onChange={(e) => setFormFields({ ...formFields, max_capacity_pallets: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    โซน Location / Bin (เช่น A, B, C)
                  </label>
                  <input
                    type="text"
                    placeholder="เช่น A, B, C"
                    value={formFields.zone_location}
                    onChange={(e) => setFormFields({ ...formFields, zone_location: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    ความจุซ้อน (ชั้นพาเลท)
                  </label>
                  <select
                    value={formFields.max_stack_level}
                    onChange={(e) => setFormFields({ ...formFields, max_stack_level: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                  >
                    <option value="1">1 ชั้น (ไม่ซ้อน)</option>
                    <option value="2">2 ชั้น</option>
                    <option value="3">3 ชั้น</option>
                    <option value="4">4 ชั้น</option>
                    <option value="5">5 ชั้น</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    จำนวนแถว (Rows)
                  </label>
                  <input
                    type="number"
                    placeholder="เช่น 10"
                    value={formFields.location_rows}
                    onChange={(e) => setFormFields({ ...formFields, location_rows: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    จำนวนตั้ง ต่อ Location
                  </label>
                  <input
                    type="number"
                    placeholder="เช่น 4"
                    value={formFields.location_stacks}
                    onChange={(e) => setFormFields({ ...formFields, location_stacks: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  ประเภทสินค้าที่จัดเก็บ
                </label>
                <input
                  type="text"
                  placeholder="ตัวอย่าง: อะไหล่รถยนต์, ม้วนเหล็กหนัก"
                  value={formFields.product_type}
                  onChange={(e) => setFormFields({ ...formFields, product_type: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  รูปภาพแผนผัง Layout คลังสินค้า (อัปโหลดรูปภาพแผนผังคลัง)
                </label>
                <div className="mt-1 flex items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-300">
                  <div className="flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      id="layout-file-upload"
                      onChange={handlePhotoChange}
                      className="hidden"
                    />
                    <label
                      htmlFor="layout-file-upload"
                      className="w-full py-2.5 px-4 bg-white hover:bg-slate-50 text-slate-750 hover:text-slate-800 rounded-lg flex items-center justify-center gap-2 border border-slate-300 cursor-pointer transition text-xs font-semibold shadow-sm"
                    >
                      <Upload className="w-4 h-4 text-emerald-600" />
                      เลือกรูปภาพแผนผัง
                    </label>
                  </div>
                  {formFields.layout_image && (
                    <div className="relative w-16 h-16 border border-slate-300 rounded-lg overflow-hidden bg-white flex items-center justify-center">
                      <img src={formFields.layout_image} alt="Preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setFormFields({ ...formFields, layout_image: '' })}
                        className="absolute top-0 right-0 p-0.5 bg-rose-600/90 text-white rounded-bl-md hover:bg-rose-500 transition"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-650 hover:text-slate-800 rounded-xl text-sm font-semibold transition border border-slate-200"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-emerald-650 hover:bg-emerald-500 text-white rounded-xl text-sm font-semibold flex items-center gap-2 shadow-sm transition"
                >
                  <Save className="w-4 h-4" />
                  บันทึกข้อมูล
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
