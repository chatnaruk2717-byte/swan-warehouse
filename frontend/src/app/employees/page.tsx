'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import GlassCard from '../../components/GlassCard';
import { 
  Plus, 
  Search, 
  Filter, 
  Upload, 
  Download, 
  Edit2, 
  Trash2, 
  X, 
  Check, 
  MapPin, 
  Phone, 
  Mail, 
  Calendar,
  AlertCircle,
  Clock
} from 'lucide-react';

export default function EmployeesPage() {
  const { api, user } = useAuth();
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedEmp, setSelectedEmp] = useState<any>(null);
  const [showDetailPanel, setShowDetailPanel] = useState(false);
  
  // Form fields
  const [formFields, setFormFields] = useState({
    employee_id: '',
    email: '',
    name: '',
    role: 'employee',
    department: 'Operations',
    position: 'Forklift Driver',
    warehouse_area: 'Zone A',
    phone: '',
    supervisor_id: '',
    start_date: new Date().toISOString().split('T')[0],
    photo_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
    working_shift: 'A'
  });

  const fetchEmployees = async () => {
    try {
      const res = await api.get('/api/employees');
      setEmployees(res.data);
    } catch (err) {
      console.warn('API error fetching employees, using fallback mock list.');
      // Mock fallback
      setEmployees([
        { id: 6, employee_id: 'EMP006', email: 'employee1@warehouse.com', name: 'สมปอง ลุยงาน', role: 'employee', department: 'Operations', position: 'Forklift Driver', warehouse_area: 'Zone A', phone: '086-789-0123', status: 'active', supervisor_name: 'ประพันธ์ ยอดคุม', start_date: '2023-01-10', photo_url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150', working_shift: 'A' },
        { id: 7, employee_id: 'EMP007', email: 'employee2@warehouse.com', name: 'อรอนงค์ แพ็กเก่ง', role: 'employee', department: 'Operations', position: 'Packer', warehouse_area: 'Zone A', phone: '087-890-1234', status: 'active', supervisor_name: 'ประพันธ์ ยอดคุม', start_date: '2023-04-15', photo_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', working_shift: 'A' },
        { id: 8, employee_id: 'EMP008', email: 'employee3@warehouse.com', name: 'มานะ คัดของ', role: 'employee', department: 'Operations', position: 'Picker', warehouse_area: 'Zone B', phone: '088-901-2345', status: 'active', supervisor_name: 'สมศรี มีคุม', start_date: '2023-08-01', photo_url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150', working_shift: 'B' },
        { id: 9, employee_id: 'EMP009', email: 'employee4@warehouse.com', name: 'เกษม รับสินค้า', role: 'employee', department: 'Operations', position: 'Receiving Clerk', warehouse_area: 'Loading Dock', phone: '089-012-3456', status: 'active', supervisor_name: 'สมศรี มีคุม', start_date: '2023-10-12', photo_url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150', working_shift: 'B' },
        { id: 10, employee_id: 'EMP010', email: 'employee5@warehouse.com', name: 'จารุณี นับสต็อก', role: 'employee', department: 'Operations', position: 'Inventory Counter', warehouse_area: 'Zone B', phone: '081-111-2222', status: 'active', supervisor_name: 'สมศรี มีคุม', start_date: '2024-01-05', photo_url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150', working_shift: 'B' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post('/api/employees', formFields);
      setEmployees([...employees, res.data]);
      setShowCreateModal(false);
      resetForm();
    } catch (err) {
      // Mock mode append
      const selectedSup = employees.find(e => e.id.toString() === formFields.supervisor_id);
      const mockNew = {
        ...formFields,
        id: Date.now(),
        supervisor_id: formFields.supervisor_id ? parseInt(formFields.supervisor_id, 10) : null,
        supervisor_name: selectedSup ? selectedSup.name : 'ไม่มี',
        status: 'active'
      };
      setEmployees([...employees, mockNew]);
      setShowCreateModal(false);
      resetForm();
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmp) return;

    try {
      const res = await api.put(`/api/employees/${selectedEmp.id}`, formFields);
      setEmployees(employees.map(emp => emp.id === selectedEmp.id ? res.data : emp));
      setShowEditModal(false);
      resetForm();
    } catch (err) {
      // Mock mode edit
      const selectedSup = employees.find(e => e.id.toString() === formFields.supervisor_id);
      const updated = {
        ...selectedEmp,
        ...formFields,
        supervisor_id: formFields.supervisor_id ? parseInt(formFields.supervisor_id, 10) : null,
        supervisor_name: selectedSup ? selectedSup.name : 'ไม่มี'
      };
      setEmployees(employees.map(emp => emp.id === selectedEmp.id ? updated : emp));
      setShowEditModal(false);
      resetForm();
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('คุณแน่ใจว่าต้องการลบข้อมูลพนักงานคนนี้ออกจากระบบ?')) return;
    try {
      await api.delete(`/api/employees/${id}`);
      setEmployees(employees.filter(emp => emp.id !== id));
    } catch (err) {
      setEmployees(employees.filter(emp => emp.id !== id));
    }
  };

  const openEditModal = (emp: any) => {
    setSelectedEmp(emp);
    setFormFields({
      employee_id: emp.employee_id,
      email: emp.email,
      name: emp.name,
      role: emp.role,
      department: emp.department,
      position: emp.position,
      warehouse_area: emp.warehouse_area || '',
      phone: emp.phone || '',
      supervisor_id: emp.supervisor_id ? emp.supervisor_id.toString() : '',
      start_date: emp.start_date || new Date().toISOString().split('T')[0],
      photo_url: emp.photo_url || '',
      working_shift: emp.working_shift || 'A'
    });
    setShowEditModal(true);
  };

  const openDetailPanel = (emp: any) => {
    setSelectedEmp(emp);
    setShowDetailPanel(true);
  };

  const resetForm = () => {
    setFormFields({
      employee_id: '',
      email: '',
      name: '',
      role: 'employee',
      department: 'Operations',
      position: 'Forklift Driver',
      warehouse_area: 'Zone A',
      phone: '',
      supervisor_id: '',
      start_date: new Date().toISOString().split('T')[0],
      photo_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
      working_shift: 'A'
    });
    setSelectedEmp(null);
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormFields({
          ...formFields,
          photo_url: reader.result as string
        });
      };
      reader.readAsDataURL(file);
    }
  };

  // Mock export csv/excel
  const handleExport = () => {
    const BOM = "\uFEFF";
    const headers = "Employee ID,Name,Department,Position,Status\n";
    const rows = employees.map(e => `${e.employee_id},${e.name},${e.department},${e.position},${e.status}`).join("\n");
    const csvContent = BOM + headers + rows;
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "warehouse_employees.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportMock = () => {
    const mockImports = [
      { employee_id: 'EMP011', email: 'imported1@warehouse.com', name: 'กิตติศักดิ์ เร่งยก', role: 'employee', department: 'Operations', position: 'Forklift Driver', warehouse_area: 'Zone A', phone: '082-999-1111', start_date: '2026-06-29', photo_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150' }
    ];
    api.post('/api/employees/import-excel', { employees: mockImports })
      .then((res: any) => {
        alert(res.data.message);
        fetchEmployees();
      })
      .catch(() => {
        // Fallback mock import
        setEmployees([...employees, {
          id: Date.now(),
          ...mockImports[0],
          supervisor_name: 'ประพันธ์ ยอดคุม',
          status: 'active'
        }]);
        alert('นำเข้าข้อมูลพนักงาน 1 รายสำเร็จ (Mock)');
      });
  };

  // Filter lists
  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = emp.name.toLowerCase().includes(search.toLowerCase()) || 
                          emp.employee_id.toLowerCase().includes(search.toLowerCase());
    const matchesDept = deptFilter ? emp.department === deptFilter : true;
    const matchesStatus = statusFilter ? emp.status === statusFilter : true;
    return matchesSearch && matchesDept && matchesStatus;
  });

  return (
    <div className="space-y-8 relative">
      
      {/* Header Info */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">จัดการข้อมูลพนักงาน (Employees)</h2>
          <p className="text-slate-400 text-sm mt-1">ทะเบียนประวัติพนักงานคลังสินค้า จัดการสิทธิ์การเข้าใช้งาน และรายละเอียดงาน</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button 
            onClick={handleImportMock} 
            className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-white text-xs font-semibold flex items-center gap-1.5 border border-slate-200/50 dark:border-white/5 shadow-sm"
          >
            <Upload size={14} />
            <span>นำเข้า Excel</span>
          </button>
          <button 
            onClick={handleExport} 
            className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-white text-xs font-semibold flex items-center gap-1.5 border border-slate-200/50 dark:border-white/5 shadow-sm"
          >
            <Download size={14} />
            <span>ส่งออก Excel</span>
          </button>
          <button 
            onClick={() => { resetForm(); setShowCreateModal(true); }} 
            className="px-4 py-2.5 rounded-xl bg-warehouse-orange hover:bg-warehouse-orange/90 text-white text-xs font-bold flex items-center gap-1 shadow-md shadow-warehouse-orange/15"
          >
            <Plus size={14} />
            <span>เพิ่มพนักงาน (Add Employee)</span>
          </button>
        </div>
      </div>

      {/* Filter panel */}
      <GlassCard className="flex flex-col md:flex-row gap-4 items-center justify-between">
        
        {/* Search Input */}
        <div className="w-full md:w-80 relative flex items-center">
          <Search className="absolute left-4 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="ค้นหาชื่อ หรือ รหัสพนักงาน..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white/70 dark:bg-warehouse-slate/50 border border-slate-200 dark:border-white/10 rounded-xl text-slate-700 dark:text-white outline-none focus:border-warehouse-orange focus:ring-2 focus:ring-warehouse-orange/20 text-xs"
          />
        </div>

        {/* Dropdown filters */}
        <div className="w-full md:w-auto flex flex-wrap gap-4 items-center">
          
          <div className="flex items-center gap-2">
            <Filter size={14} className="text-slate-400" />
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="bg-white/70 dark:bg-warehouse-slate/50 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2.5 text-xs text-slate-700 dark:text-white outline-none focus:border-warehouse-orange"
            >
              <option value="">แผนกทั้งหมด (Departments)</option>
              <option value="Operations">Operations</option>
              <option value="Human Resources">Human Resources</option>
              <option value="Training">Training</option>
              <option value="Management">Management</option>
            </select>
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-white/70 dark:bg-warehouse-slate/50 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2.5 text-xs text-slate-700 dark:text-white outline-none focus:border-warehouse-orange"
          >
            <option value="">สถานะทั้งหมด</option>
            <option value="active">Active (ทำงานอยู่)</option>
            <option value="inactive">Inactive (ระงับชั่วคราว)</option>
          </select>
        </div>

      </GlassCard>

      {/* Employees Table List */}
      <GlassCard className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-slate-200/50 dark:border-white/5 bg-slate-100/50 dark:bg-white/5 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                <th className="px-6 py-4">พนักงาน (Employee)</th>
                <th className="px-6 py-4">รหัสพนักงาน</th>
                <th className="px-6 py-4">แผนก / ตำแหน่ง</th>
                <th className="px-6 py-4">สังกัดโซนคลัง</th>
                <th className="px-6 py-4">กะทำงาน</th>
                <th className="px-6 py-4">หัวหน้างาน</th>
                <th className="px-6 py-4">สถานะ</th>
                <th className="px-6 py-4 text-center">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/50 dark:divide-white/5 text-xs">
              {filteredEmployees.map((emp) => (
                <tr 
                  key={emp.id} 
                  className="hover:bg-slate-100/25 dark:hover:bg-white/5 transition-colors cursor-pointer"
                  onClick={() => openDetailPanel(emp)}
                >
                  <td className="px-6 py-4 flex items-center gap-3">
                    {emp.photo_url ? (
                      <img src={emp.photo_url} alt={emp.name} className="w-9 h-9 rounded-xl object-cover ring-2 ring-warehouse-orange/15" />
                    ) : (
                      <div className="w-9 h-9 rounded-xl bg-warehouse-orange/20 text-warehouse-orange flex items-center justify-center font-bold">{emp.name[0]}</div>
                    )}
                    <div>
                      <p className="font-semibold text-slate-700 dark:text-slate-200">{emp.name}</p>
                      <p className="text-[10px] text-slate-400">{emp.email}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-mono font-bold text-slate-500">{emp.employee_id}</td>
                  <td className="px-6 py-4">
                    <p className="font-medium text-slate-700 dark:text-slate-200">{emp.department}</p>
                    <p className="text-[10px] text-slate-400">{emp.position}</p>
                  </td>
                  <td className="px-6 py-4 text-slate-500">{emp.warehouse_area || '-'}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      emp.working_shift === 'B' 
                        ? 'bg-indigo-500/10 text-indigo-400' 
                        : 'bg-amber-500/10 text-amber-500'
                    }`}>
                      {emp.working_shift === 'B' ? 'กะ B (ดึก)' : 'กะ A (เช้า)'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-500">{emp.supervisor_name || 'ไม่มี'}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-[10px] font-bold ${
                      emp.status === 'active' 
                        ? 'bg-emerald-500/10 text-emerald-500' 
                        : 'bg-rose-500/10 text-rose-500'
                    }`}>
                      {emp.status === 'active' ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                    <div className="flex justify-center gap-2">
                      <button 
                        onClick={() => openEditModal(emp)} 
                        className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button 
                        onClick={() => handleDelete(emp.id)} 
                        className="p-1.5 rounded-lg hover:bg-rose-500/10 text-slate-400 hover:text-rose-500 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredEmployees.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-slate-400">
                    <AlertCircle size={24} className="mx-auto text-slate-300 mb-2" />
                    ไม่มีข้อมูลพนักงานที่ตรงกับการค้นหา
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </GlassCard>

      {/* CREATE MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <GlassCard className="w-full max-w-lg overflow-hidden border border-white/10" animate={false}>
            <div className="flex items-center justify-between pb-4 border-b border-slate-200/50 dark:border-white/5 mb-6">
              <h3 className="font-bold text-base">ลงทะเบียนพนักงานใหม่ (Create Employee)</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleCreateSubmit} className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-400">รหัสพนักงาน (ID)</label>
                  <input type="text" required value={formFields.employee_id} onChange={(e) => setFormFields({ ...formFields, employee_id: e.target.value })} className="glass-input text-xs" placeholder="EMP011" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-400">ชื่อ-นามสกุล</label>
                  <input type="text" required value={formFields.name} onChange={(e) => setFormFields({ ...formFields, name: e.target.value })} className="glass-input text-xs" placeholder="สมบัติ ยิ้มสู้" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-400">อีเมล</label>
                  <input type="email" required value={formFields.email} onChange={(e) => setFormFields({ ...formFields, email: e.target.value })} className="glass-input text-xs" placeholder="sombat@warehouse.com" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-400">โทรศัพท์</label>
                  <input type="text" value={formFields.phone} onChange={(e) => setFormFields({ ...formFields, phone: e.target.value })} className="glass-input text-xs" placeholder="082-999-2222" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-400">แผนก (Department)</label>
                  <select value={formFields.department} onChange={(e) => setFormFields({ ...formFields, department: e.target.value })} className="glass-input text-xs bg-white dark:bg-warehouse-slate">
                    <option value="Operations">Operations</option>
                    <option value="Human Resources">Human Resources</option>
                    <option value="Training">Training</option>
                    <option value="Management">Management</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-400">ตำแหน่ง (Position)</label>
                  <input type="text" value={formFields.position} onChange={(e) => setFormFields({ ...formFields, position: e.target.value })} className="glass-input text-xs" placeholder="Forklift Driver" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-400">สิทธิ์การเข้าใช้ (Role)</label>
                  <select value={formFields.role} onChange={(e) => setFormFields({ ...formFields, role: e.target.value as any })} className="glass-input text-xs bg-white dark:bg-warehouse-slate">
                    <option value="employee">Employee (พนักงานคลัง)</option>
                    <option value="staff">Staff (หัวหน้างาน/ผู้ฝึกสอน)</option>
                    <option value="admin">Admin (ผู้ดูแลระบบ/HR)</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-400">โซนคลัง (Area)</label>
                  <input type="text" value={formFields.warehouse_area} onChange={(e) => setFormFields({ ...formFields, warehouse_area: e.target.value })} className="glass-input text-xs" placeholder="Zone A" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-400">กะการทำงาน (Working Shift)</label>
                  <select value={formFields.working_shift} onChange={(e) => setFormFields({ ...formFields, working_shift: e.target.value })} className="glass-input text-xs bg-white dark:bg-warehouse-slate">
                    <option value="A">กะ A (07:30 - 15:30)</option>
                    <option value="B">กะ B (19:30 - 03:30)</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-400">วันเริ่มงาน (Start Date)</label>
                  <input type="date" value={formFields.start_date} onChange={(e) => setFormFields({ ...formFields, start_date: e.target.value })} className="glass-input text-xs" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5 col-span-2">
                  <label className="text-[10px] font-bold text-slate-400">หัวหน้างานผู้ควบคุม (Supervisor)</label>
                  <select 
                    value={formFields.supervisor_id || ''} 
                    onChange={(e) => setFormFields({ ...formFields, supervisor_id: e.target.value })} 
                    className="glass-input text-xs bg-white dark:bg-warehouse-slate"
                  >
                    <option value="">-- ไม่มีหัวหน้างาน --</option>
                    {employees.filter(e => e.role === 'admin' || e.role === 'staff').map(sup => (
                      <option key={sup.id} value={sup.id.toString()}>
                        {sup.name} ({sup.position || sup.role})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-400">อัปโหลดรูปภาพพนักงาน (Photo Upload)</label>
                  <div className="flex items-center gap-3">
                    <input 
                      type="file" 
                      accept="image/*" 
                      id="create-photo-input" 
                      onChange={handlePhotoChange} 
                      className="hidden" 
                    />
                    <label 
                      htmlFor="create-photo-input" 
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-white rounded-xl text-xs font-semibold border border-slate-200/50 dark:border-white/5 cursor-pointer shadow-sm"
                    >
                      เลือกไฟล์รูป...
                    </label>
                    {formFields.photo_url && (
                      <img src={formFields.photo_url} alt="Preview" className="w-10 h-10 rounded-xl object-cover ring-2 ring-warehouse-orange/15" />
                    )}
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200/50 dark:border-white/5">
                <button type="button" onClick={() => setShowCreateModal(false)} className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-xs font-semibold">ยกเลิก</button>
                <button type="submit" className="px-4 py-2 rounded-xl bg-warehouse-orange hover:bg-warehouse-orange/90 text-white text-xs font-bold shadow-md shadow-warehouse-orange/15">ลงทะเบียน</button>
              </div>
            </form>
          </GlassCard>
        </div>
      )}

      {/* EDIT MODAL */}
      {showEditModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <GlassCard className="w-full max-w-lg overflow-hidden border border-white/10" animate={false}>
            <div className="flex items-center justify-between pb-4 border-b border-slate-200/50 dark:border-white/5 mb-6">
              <h3 className="font-bold text-base">แก้ไขข้อมูลพนักงาน (Edit Employee)</h3>
              <button onClick={() => setShowEditModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleEditSubmit} className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-400">รหัสพนักงาน (ID - แก้ไขไม่ได้)</label>
                  <input type="text" disabled value={formFields.employee_id} className="glass-input text-xs opacity-50 cursor-not-allowed" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-400">ชื่อ-นามสกุล</label>
                  <input type="text" required value={formFields.name} onChange={(e) => setFormFields({ ...formFields, name: e.target.value })} className="glass-input text-xs" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-400">อีเมล</label>
                  <input type="email" required value={formFields.email} onChange={(e) => setFormFields({ ...formFields, email: e.target.value })} className="glass-input text-xs" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-400">โทรศัพท์</label>
                  <input type="text" value={formFields.phone} onChange={(e) => setFormFields({ ...formFields, phone: e.target.value })} className="glass-input text-xs" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-400">แผนก (Department)</label>
                  <select value={formFields.department} onChange={(e) => setFormFields({ ...formFields, department: e.target.value })} className="glass-input text-xs bg-white dark:bg-warehouse-slate">
                    <option value="Operations">Operations</option>
                    <option value="Human Resources">Human Resources</option>
                    <option value="Training">Training</option>
                    <option value="Management">Management</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-400">ตำแหน่ง (Position)</label>
                  <input type="text" value={formFields.position} onChange={(e) => setFormFields({ ...formFields, position: e.target.value })} className="glass-input text-xs" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-400">สิทธิ์การเข้าใช้ (Role)</label>
                  <select value={formFields.role} onChange={(e) => setFormFields({ ...formFields, role: e.target.value as any })} className="glass-input text-xs bg-white dark:bg-warehouse-slate">
                    <option value="employee">Employee (พนักงานคลัง)</option>
                    <option value="staff">Staff (หัวหน้างาน/ผู้ฝึกสอน)</option>
                    <option value="admin">Admin (ผู้ดูแลระบบ/HR)</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-400">โซนคลัง (Area)</label>
                  <input type="text" value={formFields.warehouse_area} onChange={(e) => setFormFields({ ...formFields, warehouse_area: e.target.value })} className="glass-input text-xs" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-400">กะการทำงาน (Working Shift)</label>
                  <select value={formFields.working_shift} onChange={(e) => setFormFields({ ...formFields, working_shift: e.target.value })} className="glass-input text-xs bg-white dark:bg-warehouse-slate">
                    <option value="A">กะ A (07:30 - 15:30)</option>
                    <option value="B">กะ B (19:30 - 03:30)</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-400">วันเริ่มงาน (Start Date)</label>
                  <input type="date" value={formFields.start_date} onChange={(e) => setFormFields({ ...formFields, start_date: e.target.value })} className="glass-input text-xs" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5 col-span-2">
                  <label className="text-[10px] font-bold text-slate-400">หัวหน้างานผู้ควบคุม (Supervisor)</label>
                  <select 
                    value={formFields.supervisor_id || ''} 
                    onChange={(e) => setFormFields({ ...formFields, supervisor_id: e.target.value })} 
                    className="glass-input text-xs bg-white dark:bg-warehouse-slate"
                  >
                    <option value="">-- ไม่มีหัวหน้างาน --</option>
                    {employees.filter(e => e.role === 'admin' || e.role === 'staff').map(sup => (
                      <option key={sup.id} value={sup.id.toString()}>
                        {sup.name} ({sup.position || sup.role})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-400">อัปโหลดรูปภาพพนักงาน (Photo Upload)</label>
                  <div className="flex items-center gap-3">
                    <input 
                      type="file" 
                      accept="image/*" 
                      id="edit-photo-input" 
                      onChange={handlePhotoChange} 
                      className="hidden" 
                    />
                    <label 
                      htmlFor="edit-photo-input" 
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-white rounded-xl text-xs font-semibold border border-slate-200/50 dark:border-white/5 cursor-pointer shadow-sm"
                    >
                      เลือกไฟล์รูป...
                    </label>
                    {formFields.photo_url && (
                      <img src={formFields.photo_url} alt="Preview" className="w-10 h-10 rounded-xl object-cover ring-2 ring-warehouse-orange/15" />
                    )}
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200/50 dark:border-white/5">
                <button type="button" onClick={() => setShowEditModal(false)} className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-xs font-semibold">ยกเลิก</button>
                <button type="submit" className="px-4 py-2 rounded-xl bg-warehouse-orange hover:bg-warehouse-orange/90 text-white text-xs font-bold shadow-md shadow-warehouse-orange/15">บันทึกข้อมูล</button>
              </div>
            </form>
          </GlassCard>
        </div>
      )}

      {/* DETAIL SLIDE PANEL */}
      {showDetailPanel && selectedEmp && (
        <div className="fixed inset-y-0 right-0 w-full max-w-md bg-white dark:bg-slate-900 border-l border-slate-200/50 dark:border-white/5 z-50 shadow-2xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-200/50 dark:border-white/5 mb-6">
              <h3 className="font-bold text-sm text-slate-800 dark:text-white">ข้อมูลโดยละเอียดพนักงาน</h3>
              <button onClick={() => setShowDetailPanel(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-4">
                {selectedEmp.photo_url ? (
                  <img src={selectedEmp.photo_url} alt={selectedEmp.name} className="w-16 h-16 rounded-2xl object-cover ring-2 ring-warehouse-orange/15" />
                ) : (
                  <div className="w-16 h-16 rounded-2xl bg-warehouse-orange/20 text-warehouse-orange flex items-center justify-center font-bold text-lg">{selectedEmp.name[0]}</div>
                )}
                <div>
                  <h4 className="font-bold text-base text-slate-800 dark:text-white">{selectedEmp.name}</h4>
                  <p className="text-xs text-slate-400 mt-0.5">{selectedEmp.position} • {selectedEmp.department}</p>
                  <p className="text-[10px] text-slate-400 font-mono font-bold mt-1 uppercase text-warehouse-orange">{selectedEmp.employee_id}</p>
                </div>
              </div>

              <div className="space-y-3.5 border-t border-slate-200/50 dark:border-white/5 pt-4 text-xs text-slate-500">
                <div className="flex items-center gap-2.5">
                  <Mail size={16} className="text-slate-400 shrink-0" />
                  <span>{selectedEmp.email}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Phone size={16} className="text-slate-400 shrink-0" />
                  <span>{selectedEmp.phone || 'ไม่ระบุเบอร์โทร'}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <MapPin size={16} className="text-slate-400 shrink-0" />
                  <span>คลังโซน: {selectedEmp.warehouse_area || 'ไม่ระบุโซน'}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Clock size={16} className="text-slate-400 shrink-0" />
                  <span>
                    กะการทำงาน: {selectedEmp.working_shift === 'B' 
                      ? 'กะ B (ดึก 19:30 - 03:30 น.)' 
                      : 'กะ A (เช้า 07:30 - 15:30 น.)'}
                  </span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Calendar size={16} className="text-slate-400 shrink-0" />
                  <span>เริ่มงาน: {selectedEmp.start_date}</span>
                </div>
              </div>

              {/* Skill matrix indicator preview */}
              <div className="border-t border-slate-200/50 dark:border-white/5 pt-4">
                <h5 className="font-bold text-xs text-slate-700 dark:text-slate-200 mb-3">ระดับทักษะปัจจุบัน (Skills Preview)</h5>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Warehouse Safety Rules</span>
                    <span className="font-bold text-warehouse-green">Level 3 (Qualified)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Forklift Operation</span>
                    <span className="font-bold text-warehouse-orange">Level 4 (Expert)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">5S Methodology</span>
                    <span className="font-bold text-slate-400">Level 2 (Training)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <button 
            onClick={() => setShowDetailPanel(false)}
            className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-white rounded-xl text-xs font-bold transition-all text-center"
          >
            ปิดหน้าต่าง
          </button>
        </div>
      )}

    </div>
  );
}
