'use client';

import React, { useState, useEffect } from 'react';
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
  UserCheck
} from 'lucide-react';

interface OrgChartItem {
  id: number;
  name: string;
  role_name: string;
  level_order: number; // 1: ผู้จัดการ, 2: ผู้ช่วยผู้จัดการ, 3: หัวหน้าแผนก, 4: หัวหน้างาน, 5: ปฏิบัติงาน
  level?: string;
  warehouse_area?: string;
  image_url: string;
}

export default function OrgChartPage() {
  const { api, user } = useAuth();
  const [orgItems, setOrgItems] = useState<OrgChartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Form modals state
  const [showFormModal, setShowFormModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [formState, setFormState] = useState({
    name: '',
    role_name: '',
    level_order: 5,
    level: '',
    warehouse_area: '',
    image_url: ''
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

  // Handle image upload converting to Base64
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('กรุณาเลือกไฟล์รูปภาพเท่านั้น');
        return;
      }
      setUploadedFileName(file.name);
      setIsUploading(true);
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormState(prev => ({ ...prev, image_url: reader.result as string }));
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
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
      warehouse_area: '',
      image_url: ''
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
      warehouse_area: item.warehouse_area || '',
      image_url: item.image_url
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

  // Group items by level
  const managers = orgItems.filter(item => item.level_order === 1);
  const assistants = orgItems.filter(item => item.level_order === 2);
  const departmentHeads = orgItems.filter(item => item.level_order === 3);
  const supervisors = orgItems.filter(item => item.level_order === 4);
  const staffMembers = orgItems.filter(item => item.level_order === 5);

  const isAdmin = user?.role === 'admin';

  // Render a single member card
  const renderMemberCard = (item: OrgChartItem) => (
    <div key={item.id} className="relative group flex flex-col items-center">
      <div className="w-56 p-4 rounded-2xl bg-white dark:bg-warehouse-slate border border-slate-200/60 dark:border-white/5 shadow-lg shadow-slate-100/50 dark:shadow-none flex flex-col items-center text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-emerald-500/30">
        
        {/* Profile Image / Initial */}
        <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-emerald-500 bg-emerald-50 dark:bg-white/5 flex items-center justify-center mb-3 shadow-inner">
          {item.image_url ? (
            <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
          ) : (
            <User size={36} className="text-emerald-600 dark:text-emerald-400" />
          )}
        </div>

        {/* Member Details */}
        <h5 className="font-bold text-sm text-slate-800 dark:text-white leading-snug">{item.name}</h5>
        <p className="text-[10px] font-bold text-warehouse-orange mt-1 px-2.5 py-0.5 rounded-full bg-warehouse-orange/5 border border-warehouse-orange/15 max-w-full truncate">
          {item.role_name} {item.level ? `(${item.level})` : ''}
        </p>

        {/* Warehouse Zone */}
        {item.warehouse_area && (
          <p className="text-[9px] font-semibold text-slate-400 dark:text-slate-500 mt-1.5 flex items-center gap-1">
            <span>โซนคลัง:</span>
            <span className="text-slate-600 dark:text-slate-300 font-bold">{item.warehouse_area}</span>
          </p>
        )}

        {/* Admin actions overlay */}
        {isAdmin && (
          <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-slate-900/10 backdrop-blur-md p-1 rounded-lg">
            <button 
              onClick={() => handleOpenEditModal(item)}
              className="p-1 hover:bg-white/20 text-slate-700 dark:text-white rounded transition-colors"
              title="แก้ไข"
            >
              <Edit size={12} />
            </button>
            <button 
              onClick={() => handleDelete(item.id, item.name)}
              className="p-1 hover:bg-rose-500/20 text-rose-500 rounded transition-colors"
              title="ลบ"
            >
              <Trash2 size={12} />
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl min-h-screen">
      
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-1.5">
            <Building2 size={12} />
            <span>Swan Industries (Thailand) Co., Ltd.</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-800 dark:text-white flex items-center gap-3">
            <Network className="text-warehouse-orange" size={32} />
            <span>โครงสร้างองค์กร (Finished Goods Warehouse)</span>
          </h2>
          <p className="text-xs text-slate-400 font-semibold mt-1">ผังสายงานและการบังคับบัญชาแผนกคลังสินค้าสำเร็จรูป</p>
        </div>

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

      {isLoading ? (
        <div className="flex flex-col items-center justify-center h-80 gap-3">
          <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs text-slate-400 font-bold">กำลังโหลดผังองค์กร...</p>
        </div>
      ) : (
        <div className="relative flex flex-col items-center gap-8 py-6 overflow-x-auto min-w-full">
          
          {/* Level 1: Managers */}
          {managers.length > 0 && (
            <div className="flex flex-col items-center relative">
              <div className="flex flex-wrap justify-center gap-6">
                {managers.map(item => renderMemberCard(item))}
              </div>
              {(assistants.length > 0 || departmentHeads.length > 0 || supervisors.length > 0 || staffMembers.length > 0) && (
                <div className="w-0.5 h-8 bg-slate-300 dark:bg-white/10 mt-3"></div>
              )}
            </div>
          )}

          {/* Level 2: Assistant Managers */}
          {assistants.length > 0 && (
            <div className="flex flex-col items-center relative">
              <div className="flex flex-wrap justify-center gap-6">
                {assistants.map(item => renderMemberCard(item))}
              </div>
              {(departmentHeads.length > 0 || supervisors.length > 0 || staffMembers.length > 0) && (
                <div className="w-0.5 h-8 bg-slate-300 dark:bg-white/10 mt-3"></div>
              )}
            </div>
          )}

          {/* Level 3: Department Heads */}
          {departmentHeads.length > 0 && (
            <div className="flex flex-col items-center relative">
              <div className="flex flex-wrap justify-center gap-6">
                {departmentHeads.map(item => renderMemberCard(item))}
              </div>
              {(supervisors.length > 0 || staffMembers.length > 0) && (
                <div className="w-0.5 h-8 bg-slate-300 dark:bg-white/10 mt-3"></div>
              )}
            </div>
          )}

          {/* Level 4: Supervisors */}
          {supervisors.length > 0 && (
            <div className="flex flex-col items-center relative">
              <div className="flex flex-wrap justify-center gap-6">
                {supervisors.map(item => renderMemberCard(item))}
              </div>
              {staffMembers.length > 0 && (
                <div className="w-0.5 h-8 bg-slate-300 dark:bg-white/10 mt-3"></div>
              )}
            </div>
          )}

          {/* Level 5: Staff Members / Operators Grid */}
          {staffMembers.length > 0 && (
            <div className="flex flex-col items-center relative">
              <div className="flex flex-wrap justify-center gap-6 max-w-6xl">
                {staffMembers.map((item) => renderMemberCard(item))}
              </div>
            </div>
          )}

          {/* Fallback empty message */}
          {orgItems.length === 0 && (
            <GlassCard className="p-8 text-center max-w-md">
              <Network size={48} className="mx-auto text-slate-400 mb-3" />
              <h4 className="font-bold text-slate-700 dark:text-white mb-1">ยังไม่มีข้อมูลผังองค์กร</h4>
              <p className="text-xs text-slate-400 mb-4">โปรดเข้าสู่ระบบด้วยสิทธิ์ผู้ดูแลระบบ (Admin) เพื่อเพิ่มรายชื่อพนักงานในผัง</p>
            </GlassCard>
          )}
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
                  <option value={1}>1. ผู้จัดการแผนก (Manager)</option>
                  <option value={2}>2. ผู้ช่วยผู้จัดการ (Assistant Manager)</option>
                  <option value={3}>3. หัวหน้าแผนก (Department Head)</option>
                  <option value={4}>4. หัวหน้างาน (Supervisor)</option>
                  <option value={5}>5. พนักงานผู้ปฏิบัติการ (Staff / Operators)</option>
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
                  <input 
                    type="text" 
                    placeholder="เช่น Zone A, Zone B"
                    value={formState.warehouse_area}
                    onChange={(e) => setFormState(prev => ({ ...prev, warehouse_area: e.target.value }))}
                    className="glass-input text-xs w-full bg-white dark:bg-warehouse-slate"
                  />
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
