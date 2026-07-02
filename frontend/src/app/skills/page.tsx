'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import GlassCard from '../../components/GlassCard';
import { 
  Award, 
  Search, 
  Filter, 
  Plus, 
  X, 
  Check, 
  AlertTriangle, 
  Clock, 
  CheckCircle2,
  FileText,
  Edit2,
  Trash2
} from 'lucide-react';
import { 
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  ResponsiveContainer 
} from 'recharts';
export default function SkillsPage() {
  const { api, user } = useAuth();
  const [skills, setSkills] = useState<any[]>([]);
  const [matrix, setMatrix] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('');
  const [selectedEmpId, setSelectedEmpId] = useState<number | null>(null);

  // Modal / Detail drawer states
  const [showCreateSkillModal, setShowCreateSkillModal] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState<any>(null);
  const [selectedCell, setSelectedCell] = useState<any>(null); // { employee, skill, record }
  const [showApprovalDrawer, setShowApprovalDrawer] = useState(false);

  // Form states
  const [skillForm, setSkillForm] = useState({
    name: '',
    category: 'Warehouse',
    description: ''
  });

  const [assignForm, setAssignForm] = useState({
    level: '3',
    status: 'training',
    certification_name: '',
    certification_url: '',
    expiration_date: ''
  });

  const loadData = async () => {
    try {
      const skillsRes = await api.get('/api/skills');
      setSkills(skillsRes.data);

      const matrixRes = await api.get('/api/skills/matrix');
      setMatrix(matrixRes.data);

      const empRes = await api.get('/api/employees');
      const filteredEmps = empRes.data.filter((e: any) => e.role === 'employee');
      setEmployees(filteredEmps);

      if (user && user.role === 'employee') {
        setSelectedEmpId(user.id);
      } else if (filteredEmps.length > 0) {
        setSelectedEmpId(filteredEmps[0].id);
      }
    } catch (err) {
      console.warn('API error loading skill matrix, using fallback mock catalog and matrix.');
      // Fallback skills catalog
      const mockSkillsList = [
        { id: 1, name: 'Forklift Operation (การขับรถโฟล์คลิฟต์)', category: 'Forklift', description: 'ทักษะการขับขี่รถยกอย่างปลอดภัย' },
        { id: 2, name: 'Warehouse Safety Rules (ความปลอดภัยในคลังสินค้า)', category: 'Safety', description: 'กฎความปลอดภัยคลังสินค้าและ PPE' },
        { id: 3, name: 'RF Barcode Scanner (เครื่องสแกนบาร์โค้ด RF)', category: 'RF Scanner', description: 'การใช้งานเครื่องสแกนในการหยิบจับสินค้า' },
        { id: 4, name: 'High-Efficiency Picking (การหยิบสินค้าที่มีประสิทธิภาพ)', category: 'Picking', description: 'ความเร็วและความแม่นยำในการคัดเลือกสินค้า' },
        { id: 5, name: 'Standard Packing & Labeling (การแพ็กและติดฉลากมาตรฐาน)', category: 'Packing', description: 'การบรรจุกล่องและแปะฉลากพัสดุ' },
        { id: 6, name: '5S Methodology (ระบบ 5ส ในการทำงาน)', category: '5S', description: 'มาตรฐาน 5ส และระเบียบคลังสินค้า' }
      ];
      setSkills(mockSkillsList);

      // Fallback mock employees
      const mockEmpList = [
        { id: 6, employee_id: 'EMP006', name: 'สมปอง ลุยงาน', department: 'Operations', position: 'Forklift Driver' },
        { id: 7, employee_id: 'EMP007', name: 'อรอนงค์ แพ็กเก่ง', department: 'Operations', position: 'Packer' },
        { id: 8, employee_id: 'EMP008', name: 'มานะ คัดของ', department: 'Operations', position: 'Picker' },
        { id: 9, employee_id: 'EMP009', name: 'เกษม รับสินค้า', department: 'Operations', position: 'Receiving Clerk' },
        { id: 10, employee_id: 'EMP010', name: 'จารุณี นับสต็อก', department: 'Operations', position: 'Inventory Counter' }
      ];
      setEmployees(mockEmpList);

      if (user && user.role === 'employee') {
        setSelectedEmpId(user.id);
      } else if (mockEmpList.length > 0) {
        setSelectedEmpId(mockEmpList[0].id);
      }

      // Fallback mock matrix
      const mockMatrixList = [
        { id: 1, employee_id: 6, employee_name: 'สมปอง ลุยงาน', emp_code: 'EMP006', skill_id: 1, skill_name: 'Forklift Operation (การขับรถโฟล์คลิฟต์)', level: 4, status: 'expert', expiration_date: '2027-12-31', approved_by_name: 'ประพันธ์ ยอดคุม', approved_at: '2024-02-15T10:00:00.000Z' },
        { id: 2, employee_id: 6, employee_name: 'สมปอง ลุยงาน', emp_code: 'EMP006', skill_id: 2, skill_name: 'Warehouse Safety Rules (ความปลอดภัยในคลังสินค้า)', level: 3, status: 'qualified', expiration_date: '2027-01-10', approved_by_name: 'ประพันธ์ ยอดคุม', approved_at: '2024-01-20T11:30:00.000Z' },
        { id: 3, employee_id: 6, employee_name: 'สมปอง ลุยงาน', emp_code: 'EMP006', skill_id: 3, skill_name: 'RF Barcode Scanner (เครื่องสแกนบาร์โค้ด RF)', level: 3, status: 'qualified', approved_by_name: 'ประพันธ์ ยอดคุม', approved_at: '2024-03-01T09:15:00.000Z' },
        { id: 4, employee_id: 6, employee_name: 'สมปอง ลุยงาน', emp_code: 'EMP006', skill_id: 6, skill_name: '5S Methodology (ระบบ 5ส ในการทำงาน)', level: 2, status: 'training' },
        
        { id: 5, employee_id: 7, employee_name: 'อรอนงค์ แพ็กเก่ง', emp_code: 'EMP007', skill_id: 2, skill_name: 'Warehouse Safety Rules (ความปลอดภัยในคลังสินค้า)', level: 4, status: 'expert', expiration_date: '2026-06-01', approved_by_name: 'ประพันธ์ ยอดคุม', approved_at: '2024-05-10T14:00:00.000Z' },
        { id: 6, employee_id: 7, employee_name: 'อรอนงค์ แพ็กเก่ง', emp_code: 'EMP007', skill_id: 5, skill_name: 'Standard Packing & Labeling (การแพ็กและติดฉลากมาตรฐาน)', level: 4, status: 'expert', approved_by_name: 'ประพันธ์ ยอดคุม', approved_at: '2024-04-12T15:45:00.000Z' },
        
        { id: 9, employee_id: 8, employee_name: 'มานะ คัดของ', emp_code: 'EMP008', skill_id: 4, skill_name: 'High-Efficiency Picking (การหยิบสินค้าที่มีประสิทธิภาพ)', level: 3, status: 'qualified', approved_by_name: 'สมศรี มีคุม', approved_at: '2024-03-18T16:00:00.000Z' },
        
        { id: 11, employee_id: 9, employee_name: 'เกษม รับสินค้า', emp_code: 'EMP009', skill_id: 2, skill_name: 'Warehouse Safety Rules (ความปลอดภัยในคลังสินค้า)', level: 3, status: 'qualified', expiration_date: '2026-10-12', approved_by_name: 'สมศรี มีคุม', approved_at: '2023-11-01T10:00:00.000Z' }
      ];
      setMatrix(mockMatrixList);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedSkill) {
      // EDIT MODE
      try {
        const res = await api.put(`/api/skills/${selectedSkill.id}`, skillForm);
        setSkills(skills.map(s => s.id === selectedSkill.id ? res.data : s));
        // Update matrix names if edited
        setMatrix(matrix.map(m => m.skill_id === selectedSkill.id ? { ...m, skill_name: res.data.name } : m));
        setShowCreateSkillModal(false);
        setSelectedSkill(null);
        setSkillForm({ name: '', category: 'Warehouse', description: '' });
      } catch (err: any) {
        alert('แก้ไขทักษะไม่สำเร็จ: ' + (err.response?.data?.message || err.message));
      }
    } else {
      // CREATE MODE
      try {
        const res = await api.post('/api/skills', skillForm);
        setSkills([...skills, res.data]);
        setShowCreateSkillModal(false);
        setSkillForm({ name: '', category: 'Warehouse', description: '' });
      } catch (err: any) {
        alert('สร้างทักษะไม่สำเร็จ: ' + (err.response?.data?.message || err.message));
      }
    }
  };

  const openEditSkillModal = (skill: any) => {
    setSelectedSkill(skill);
    setSkillForm({
      name: skill.name,
      category: skill.category,
      description: skill.description || ''
    });
    setShowCreateSkillModal(true);
  };

  const handleDeleteSkill = async (id: number) => {
    if (!confirm('คุณแน่ใจว่าต้องการลบหัวข้อทักษะนี้ออกจากระบบ? ข้อมูลประวัติการประเมินพนักงานทุกคนในหัวข้อนี้จะถูกลบไปด้วย!')) return;
    try {
      await api.delete(`/api/skills/${id}`);
      setSkills(skills.filter(s => s.id !== id));
      setMatrix(matrix.filter(m => m.skill_id !== id));
    } catch (err: any) {
      alert('ลบทักษะไม่สำเร็จ: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleUpdateEmployeeSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCell) return;

    const payload = {
      employee_id: selectedCell.employee.id,
      skill_id: selectedCell.skill.id,
      level: assignForm.level,
      status: assignForm.status,
      certification_name: assignForm.certification_name || undefined,
      certification_url: assignForm.certification_url || undefined,
      expiration_date: assignForm.expiration_date || undefined
    };

    try {
      const res = await api.post('/api/skills/employee', payload);
      // Refresh Matrix
      loadData();
      setShowApprovalDrawer(false);
    } catch {
      // Mock matrix update
      const existingIndex = matrix.findIndex(
        m => m.employee_id === selectedCell.employee.id && m.skill_id === selectedCell.skill.id
      );

      const mockRecord = {
        id: existingIndex !== -1 ? matrix[existingIndex].id : Date.now(),
        employee_id: selectedCell.employee.id,
        employee_name: selectedCell.employee.name,
        emp_code: selectedCell.employee.employee_id,
        skill_id: selectedCell.skill.id,
        skill_name: selectedCell.skill.name,
        level: parseInt(assignForm.level, 10),
        status: assignForm.status as any,
        expiration_date: assignForm.expiration_date || undefined,
        approved_by_name: assignForm.status === 'qualified' ? user?.name : undefined,
        approved_at: assignForm.status === 'qualified' ? new Date().toISOString() : undefined
      };

      if (existingIndex !== -1) {
        const copy = [...matrix];
        copy[existingIndex] = mockRecord;
        setMatrix(copy);
      } else {
        setMatrix([...matrix, mockRecord]);
      }
      setShowApprovalDrawer(false);
    }
  };

  const handleApproveSkill = async (recordId: number) => {
    try {
      await api.post(`/api/skills/approve/${recordId}`);
      loadData();
      setShowApprovalDrawer(false);
    } catch {
      // Mock Approve
      setMatrix(matrix.map(m => {
        if (m.id === recordId) {
          return {
            ...m,
            status: 'qualified',
            approved_by_name: user?.name,
            approved_at: new Date().toISOString()
          };
        }
        return m;
      }));
      setShowApprovalDrawer(false);
    }
  };

  const openApprovalCell = (employee: any, skill: any) => {
    if (user?.role === 'employee') return;
    const record = matrix.find(
      m => m.employee_id === employee.id && m.skill_id === skill.id
    );

    setSelectedCell({ employee, skill, record });
    
    setAssignForm({
      level: record ? record.level.toString() : '3',
      status: record ? record.status : 'need_training',
      certification_name: record ? (record.certification_name || '') : '',
      certification_url: record ? (record.certification_url || '') : '',
      expiration_date: record && record.expiration_date ? record.expiration_date.split('T')[0] : ''
    });

    setShowApprovalDrawer(true);
  };

  // Color Indicator Helper
  const getCellColor = (record: any) => {
    if (!record) return 'bg-slate-100/50 dark:bg-white/5 text-slate-300'; // Need training
    
    if (record.status === 'expert') {
      return 'bg-emerald-500/10 text-emerald-500 dark:bg-emerald-500/20 border border-emerald-500/20 glow-orange'; // Green
    }
    if (record.status === 'qualified') {
      return 'bg-emerald-500/10 text-emerald-500 dark:bg-emerald-500/10 border border-emerald-500/10'; // Green
    }
    if (record.status === 'training') {
      return 'bg-amber-500/10 text-amber-500 dark:bg-amber-500/10 border border-amber-500/10'; // Yellow
    }
    return 'bg-rose-500/10 text-rose-500 dark:bg-rose-500/10 border border-rose-500/10'; // Red (Need training)
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'expert': return <CheckCircle2 className="text-emerald-500" size={14} />;
      case 'qualified': return <Check className="text-emerald-500" size={14} />;
      case 'training': return <Clock className="text-amber-500" size={14} />;
      default: return <AlertTriangle className="text-rose-500" size={14} />;
    }
  };

  // Filters
  const filteredEmployees = employees.filter(emp => {
    if (user?.role === 'employee') {
      return emp.id === user.id;
    }
    return emp.name.toLowerCase().includes(search.toLowerCase()) || 
           emp.employee_id.toLowerCase().includes(search.toLowerCase());
  });

  const filteredSkills = skills.filter(sk => 
    catFilter ? sk.category === catFilter : true
  );

  const selectedEmp = employees.find(e => e.id === selectedEmpId);
  const selectedEmpSkills = matrix.filter(
    m => m.employee_id === selectedEmpId && (m.status === 'qualified' || m.status === 'expert')
  );

  const radarData = skills.map(sk => {
    const record = matrix.find(m => m.employee_id === selectedEmpId && m.skill_id === sk.id);
    return {
      subject: sk.name.split(' (')[0].substring(0, 15) + (sk.name.split(' (')[0].length > 15 ? '..' : ''),
      value: record ? record.level : 0,
      fullMark: 4
    };
  });

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-4 border-slate-300 border-t-warehouse-orange rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 relative">
      
      {/* Header Info */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">ตารางวัดระดับทักษะ (Skill Matrix)</h2>
          <p className="text-slate-400 text-sm mt-1">วิเคราะห์และอนุมัติความเชี่ยวชาญการใช้เครื่องมือและความปลอดภัยในคลังสินค้า</p>
        </div>
        {user?.role !== 'employee' && (
          <button 
            onClick={() => setShowCreateSkillModal(true)}
            className="px-4 py-2.5 rounded-xl bg-warehouse-orange hover:bg-warehouse-orange/90 text-white text-xs font-bold flex items-center gap-1 shadow-md shadow-warehouse-orange/15"
          >
            <Plus size={14} />
            <span>สร้างทักษะใหม่ (Create Skill)</span>
          </button>
        )}
      </div>

      {/* Filter panel */}
      <GlassCard className="flex flex-col md:flex-row gap-4 items-center justify-between">
        
        {/* Search */}
        <div className="w-full md:w-80 relative flex items-center">
          <Search className="absolute left-4 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="ค้นหาชื่อพนักงาน..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white/70 dark:bg-warehouse-slate/50 border border-slate-200 dark:border-white/10 rounded-xl text-slate-700 dark:text-white outline-none focus:border-warehouse-orange text-xs"
          />
        </div>

        {/* Skill Category filter */}
        <div className="flex items-center gap-2">
          <Filter size={14} className="text-slate-400" />
          <select
            value={catFilter}
            onChange={(e) => setCatFilter(e.target.value)}
            className="bg-white/70 dark:bg-warehouse-slate/50 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2.5 text-xs text-slate-700 dark:text-white outline-none focus:border-warehouse-orange"
          >
            <option value="">หมวดหมู่ทักษะทั้งหมด (Categories)</option>
            <option value="Safety">Safety (ความปลอดภัย)</option>
            <option value="Forklift">Forklift (การขับขี่รถยก)</option>
            <option value="RF Scanner">RF Scanner (สแกนบาร์โค้ด)</option>
            <option value="Picking">Picking (การหยิบของ)</option>
            <option value="Packing">Packing (การแพ็กของ)</option>
            <option value="5S">5S (ระบบ 5ส)</option>
            <option value="Inventory">Inventory (งานสต็อก)</option>
            <option value="Receiving">Receiving (การรับสินค้า)</option>
          </select>
        </div>

      </GlassCard>

      {/* Skill Matrix Grid */}
      <GlassCard className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-slate-200/50 dark:border-white/5 bg-slate-100/50 dark:bg-white/5">
                <th className="px-6 py-4 text-left text-[10px] uppercase font-bold text-slate-400 tracking-wider w-64 min-w-[240px] sticky left-0 bg-white dark:bg-slate-900 z-10">พนักงาน</th>
                {filteredSkills.map(skill => (
                  <th key={skill.id} className="px-4 py-4 text-center text-[10px] uppercase font-bold text-slate-400 tracking-wider min-w-[150px]">
                    <div className="flex flex-col items-center">
                      <span className="text-[9px] text-warehouse-orange tracking-widest">{skill.category}</span>
                      <span className="mt-0.5 line-clamp-1">{skill.name.split(' (')[0]}</span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/50 dark:divide-white/5 text-xs">
              {filteredEmployees.map(emp => (
                <tr key={emp.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                  
                  {/* Sticky Employee column */}
                  <td className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-200 sticky left-0 bg-white dark:bg-slate-900 border-r border-slate-200/50 dark:border-white/5 z-10 shadow-[4px_0_10px_-5px_rgba(0,0,0,0.05)]">
                    <p className="font-semibold text-slate-800 dark:text-slate-200">{emp.name}</p>
                    <p className="text-[10px] text-slate-400 font-normal">{emp.position}</p>
                  </td>

                  {/* Skills level cells */}
                  {filteredSkills.map(skill => {
                    const record = matrix.find(
                      m => m.employee_id === emp.id && m.skill_id === skill.id
                    );
                    
                    return (
                      <td 
                        key={skill.id} 
                        className="px-2 py-4 text-center"
                        onClick={() => openApprovalCell(emp, skill)}
                      >
                        <div className={`mx-auto w-24 py-2 rounded-xl flex flex-col items-center gap-0.5 transition-all hover:scale-105 cursor-pointer ${getCellColor(record)}`}>
                          <span className="font-mono font-bold text-xs">
                            {record ? `LV. ${record.level}` : 'LV. 0'}
                          </span>
                          <span className="flex items-center gap-0.5 text-[9px] mt-0.5 font-semibold">
                            {getStatusIcon(record?.status)}
                            {record ? record.status.toUpperCase() : 'NEED'}
                          </span>
                        </div>
                      </td>
                    );
                  })}

                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>

      {/* Individual Skill Radar Matrix Graph */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: Employee Selection & Skill Breakdown */}
        <GlassCard className="lg:col-span-1 flex flex-col justify-between border border-slate-200/50 dark:border-white/5">
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Award className="text-warehouse-orange" size={20} />
              <h4 className="font-bold text-sm text-slate-800 dark:text-white">วิเคราะห์ทักษะรายบุคคล (Individual Skill Map)</h4>
            </div>
            
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-400">เลือกพนักงานสำหรับแสดงกราฟ</label>
              {user?.role === 'employee' ? (
                <div className="p-3 bg-slate-100 dark:bg-white/5 border border-slate-200/50 dark:border-white/5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200">
                  {selectedEmp?.name || user.name} ({selectedEmp?.position || user.position})
                </div>
              ) : (
                <select 
                  value={selectedEmpId || ''} 
                  onChange={(e) => setSelectedEmpId(parseInt(e.target.value, 10))}
                  className="glass-input text-xs w-full bg-white dark:bg-warehouse-slate"
                >
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.name} ({emp.position})</option>
                  ))}
                </select>
              )}
            </div>

            {/* Display list of current skills of this employee */}
            <div className="space-y-2.5 pt-4">
              <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">ทักษะที่มีประวัติในคลัง:</h5>
              <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                {selectedEmpSkills.map((record: any) => (
                  <div key={record.id} className="flex justify-between items-center text-xs p-2 bg-slate-50 dark:bg-white/5 border border-slate-200/50 dark:border-white/5 rounded-xl">
                    <span className="font-medium truncate text-slate-600 dark:text-slate-300">{record.skill_name.split(' (')[0]}</span>
                    <span className="font-mono font-bold text-warehouse-orange shrink-0 bg-warehouse-orange/10 px-2 py-0.5 rounded text-[10px]">LV. {record.level}</span>
                  </div>
                ))}
                {selectedEmpSkills.length === 0 && (
                  <p className="text-[11px] text-slate-400 italic">ยังไม่มีการบันทึกทักษะในระบบ</p>
                )}
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Right Side: Radar Chart Visualization */}
        <GlassCard className="lg:col-span-2 flex flex-col items-center justify-center border border-slate-200/50 dark:border-white/5 h-[340px] p-4">
          <h4 className="font-bold text-xs text-slate-400 mb-2">ใยแมงมุมสมรรถนะทักษะ (Skill Competency Web)</h4>
          <div className="w-full h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                <PolarGrid stroke="#475569" strokeDasharray="3 3" opacity={0.3} />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 9, fontWeight: 'semibold' }} />
                <PolarRadiusAxis angle={30} domain={[0, 4]} tick={{ fill: '#94a3b8', fontSize: 8 }} />
                <Radar
                  name="ระดับทักษะ"
                  dataKey="value"
                  stroke="#F26522"
                  fill="#F26522"
                  fillOpacity={0.3}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </div>

      {/* MANAGE SKILLS CATALOG (ADMIN/STAFF ONLY) */}
      {user?.role !== 'employee' && (
        <GlassCard className="border border-slate-200/50 dark:border-white/5 mt-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-200/50 dark:border-white/5 mb-4">
            <div className="flex items-center gap-2">
              <Award className="text-warehouse-orange" size={20} />
              <h4 className="font-bold text-sm text-slate-800 dark:text-white">จัดการคลังหัวข้อทักษะ (Manage Skills Catalog)</h4>
            </div>
            <button 
              onClick={() => {
                setSkillForm({ name: '', category: 'Warehouse', description: '' });
                setSelectedSkill(null);
                setShowCreateSkillModal(true);
              }}
              className="px-3 py-1.5 rounded-xl bg-warehouse-orange hover:bg-warehouse-orange/90 text-white text-[10px] font-bold flex items-center gap-1 shadow-md shadow-warehouse-orange/15"
            >
              <Plus size={12} />
              <span>สร้างทักษะใหม่ (Create)</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200/50 dark:border-white/5 text-slate-400 font-bold">
                  <th className="py-2.5 px-3">ชื่อทักษะ (Skill Name)</th>
                  <th className="py-2.5 px-3">หมวดหมู่ (Category)</th>
                  <th className="py-2.5 px-3">คำอธิบายรายละเอียด (Description)</th>
                  <th className="py-2.5 px-3 text-right">การจัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {skills.map(skill => (
                  <tr key={skill.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                    <td className="py-3 px-3 font-semibold text-slate-700 dark:text-slate-200">{skill.name}</td>
                    <td className="py-3 px-3">
                      <span className="bg-warehouse-orange/10 text-warehouse-orange px-2.5 py-0.5 rounded text-[10px] font-bold">
                        {skill.category}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-400 max-w-xs truncate">{skill.description || 'ไม่มีคำอธิบาย'}</td>
                    <td className="py-3 px-3 text-right space-x-2">
                      <button 
                        onClick={() => openEditSkillModal(skill)}
                        className="p-1.5 text-slate-400 hover:text-warehouse-orange hover:bg-warehouse-orange/10 rounded-lg transition-all inline-flex items-center justify-center"
                      >
                        <Edit2 size={13} />
                      </button>
                      <button 
                        onClick={() => handleDeleteSkill(skill.id)}
                        className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all inline-flex items-center justify-center"
                      >
                        <Trash2 size={13} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>
      )}

      {/* CREATE SKILL CATALOG MODAL */}
      {showCreateSkillModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <GlassCard className="w-full max-w-md overflow-hidden border border-white/10" animate={false}>
            <div className="flex items-center justify-between pb-4 border-b border-slate-200/50 dark:border-white/5 mb-6">
              <h3 className="font-bold text-base">
                {selectedSkill ? 'แก้ไขรายละเอียดทักษะ (Edit Skill)' : 'สร้างหัวข้อทักษะใหม่ (Create Skill)'}
              </h3>
              <button 
                onClick={() => {
                  setShowCreateSkillModal(false);
                  setSelectedSkill(null);
                }} 
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleCreateSkill} className="space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400">ชื่อหัวข้อทักษะ (Skill Name)</label>
                <input type="text" required value={skillForm.name} onChange={(e) => setSkillForm({ ...skillForm, name: e.target.value })} className="glass-input text-xs" placeholder="ขับรถยกไฟฟ้าขนาดเล็ก (Reach Truck)" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400">หมวดหมู่ (Category)</label>
                <select value={skillForm.category} onChange={(e) => setSkillForm({ ...skillForm, category: e.target.value })} className="glass-input text-xs bg-white dark:bg-warehouse-slate">
                  <option value="Warehouse">Warehouse (คลังทั่วไป)</option>
                  <option value="Safety">Safety (ความปลอดภัย)</option>
                  <option value="Forklift">Forklift (การขับขี่รถยก)</option>
                  <option value="RF Scanner">RF Scanner (สแกนบาร์โค้ด)</option>
                  <option value="Picking">Picking (การหยิบของ)</option>
                  <option value="Packing">Packing (การแพ็กของ)</option>
                  <option value="5S">5S (ระบบ 5ส)</option>
                  <option value="Inventory">Inventory (งานสต็อก)</option>
                  <option value="Receiving">Receiving (การรับสินค้า)</option>
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400">คำอธิบายรายละเอียด</label>
                <textarea rows={3} value={skillForm.description} onChange={(e) => setSkillForm({ ...skillForm, description: e.target.value })} className="glass-input text-xs" placeholder="รายละเอียดเกณฑ์การชี้วัดหรือใบอนุญาตที่ต้องใช้..." />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200/50 dark:border-white/5">
                <button 
                  type="button" 
                  onClick={() => {
                    setShowCreateSkillModal(false);
                    setSelectedSkill(null);
                  }} 
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-xs font-semibold"
                >
                  ยกเลิก
                </button>
                <button type="submit" className="px-4 py-2 rounded-xl bg-warehouse-orange hover:bg-warehouse-orange/90 text-white text-xs font-bold shadow-md shadow-warehouse-orange/15">
                  {selectedSkill ? 'บันทึกการแก้ไข' : 'สร้างทักษะ'}
                </button>
              </div>
            </form>
          </GlassCard>
        </div>
      )}

      {/* APPROVAL / ASSIGNMENT DETAIL DRAWER */}
      {showApprovalDrawer && selectedCell && (
        <div className="fixed inset-y-0 right-0 w-full max-w-md bg-white dark:bg-slate-900 border-l border-slate-200/50 dark:border-white/5 z-50 shadow-2xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-200/50 dark:border-white/5 mb-6">
              <h3 className="font-bold text-sm text-slate-800 dark:text-white">จัดการระดับทักษะ & ตรวจรับรอง</h3>
              <button onClick={() => setShowApprovalDrawer(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-6">
              {/* Employee & Skill Info */}
              <div className="p-4 bg-slate-50 dark:bg-white/5 border border-slate-200/50 dark:border-white/5 rounded-2xl">
                <div className="flex items-center gap-3">
                  <Award className="text-warehouse-orange" size={24} />
                  <div>
                    <h4 className="font-bold text-sm text-slate-700 dark:text-slate-200">{selectedCell.employee.name}</h4>
                    <p className="text-[10px] text-slate-400">{selectedCell.skill.name}</p>
                  </div>
                </div>
              </div>

              {/* Approval status badge if already approved */}
              {selectedCell.record && selectedCell.record.approved_by_name && (
                <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-xs text-emerald-500 flex items-center gap-2.5">
                  <CheckCircle2 size={16} />
                  <div>
                    <p className="font-bold">ได้รับการอนุมัติทักษะแล้ว</p>
                    <p className="text-[10px] opacity-80 mt-0.5">อนุมัติโดย: {selectedCell.record.approved_by_name} • {new Date(selectedCell.record.approved_at).toLocaleDateString('th-TH')}</p>
                  </div>
                </div>
              )}

              {/* Assign/Approve Form (Visible for Supervisors/Admin) */}
              {user?.role !== 'employee' ? (
                <form onSubmit={handleUpdateEmployeeSkill} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-slate-400">ระดับทักษะ (Level 1-5)</label>
                      <select 
                        value={assignForm.level} 
                        onChange={(e) => setAssignForm({ ...assignForm, level: e.target.value })} 
                        className="glass-input text-xs bg-white dark:bg-warehouse-slate"
                      >
                        <option value="1">Level 1 - เริ่มต้นศึกษา</option>
                        <option value="2">Level 2 - เข้าใจการทำงาน</option>
                        <option value="3">Level 3 - ปฏิบัติงานจริงได้ (Qualified)</option>
                        <option value="4">Level 4 - ปฏิบัติงานคล่องแคล่ว (Expert)</option>
                        <option value="5">Level 5 - วิทยากรหัวหน้าผู้ควบคุม</option>
                      </select>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-slate-400">สถานะความชำนาญ (Status)</label>
                      <select 
                        value={assignForm.status} 
                        onChange={(e) => setAssignForm({ ...assignForm, status: e.target.value })} 
                        className="glass-input text-xs bg-white dark:bg-warehouse-slate"
                      >
                        <option value="need_training">ต้องเข้ารับการอบรม (Need)</option>
                        <option value="training">กำลังอยู่ระหว่างฝึกอบรม (Training)</option>
                        <option value="qualified">ผ่านเกณฑ์มาตรฐาน (Qualified)</option>
                        <option value="expert">เชี่ยวชาญสูงสุด (Expert)</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-slate-400">ชื่อเอกสารใบอนุญาต/ใบเซอร์ (Certification Name)</label>
                    <input 
                      type="text" 
                      value={assignForm.certification_name} 
                      onChange={(e) => setAssignForm({ ...assignForm, certification_name: e.target.value })} 
                      className="glass-input text-xs" 
                      placeholder="ใบอนุญาตขับรถยกสากล Class A" 
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-slate-400">วันหมดอายุใบรับรอง</label>
                      <input 
                        type="date" 
                        value={assignForm.expiration_date} 
                        onChange={(e) => setAssignForm({ ...assignForm, expiration_date: e.target.value })} 
                        className="glass-input text-xs" 
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-slate-400">ลิงก์แนบเอกสาร PDF/รูปใบเซอร์</label>
                      <input 
                        type="text" 
                        value={assignForm.certification_url} 
                        onChange={(e) => setAssignForm({ ...assignForm, certification_url: e.target.value })} 
                        className="glass-input text-xs" 
                        placeholder="https://example.com/cert.pdf" 
                      />
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-200/50 dark:border-white/5 flex gap-3">
                    {/* Approve button for Supervisor */}
                    {selectedCell.record && selectedCell.record.status !== 'qualified' && selectedCell.record.status !== 'expert' && (
                      <button 
                        type="button"
                        onClick={() => handleApproveSkill(selectedCell.record.id)}
                        className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1"
                      >
                        <Check size={14} />
                        <span>กดอนุมัติทันที (Approve)</span>
                      </button>
                    )}
                    <button 
                      type="submit"
                      className="flex-1 py-2.5 bg-warehouse-orange hover:bg-warehouse-orange/90 text-white rounded-xl text-xs font-bold transition-all"
                    >
                      บันทึกความก้าวหน้า
                    </button>
                  </div>
                </form>
              ) : (
                // View Mode for Employee
                <div className="space-y-4 text-xs">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-slate-400 font-semibold">ระดับทักษะปัจจุบัน</p>
                      <p className="font-bold text-slate-700 dark:text-slate-200 mt-1">Level {selectedCell.record ? selectedCell.record.level : 0}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 font-semibold">สถานะความคืบหน้า</p>
                      <p className="font-bold text-slate-700 dark:text-slate-200 mt-1 uppercase">{selectedCell.record ? selectedCell.record.status : 'NEED TRAINING'}</p>
                    </div>
                  </div>
                  {selectedCell.record && selectedCell.record.certification_name && (
                    <div className="border-t border-slate-100 dark:border-white/5 pt-3">
                      <p className="text-slate-400 font-semibold mb-2">เอกสารอ้างอิงใบเซอร์</p>
                      <div className="p-3 bg-slate-100/55 dark:bg-white/5 rounded-xl flex items-center justify-between">
                        <span className="font-semibold text-slate-700 dark:text-slate-200">{selectedCell.record.certification_name}</span>
                        {selectedCell.record.certification_url && (
                          <a href={selectedCell.record.certification_url} target="_blank" rel="noreferrer" className="text-warehouse-orange hover:underline font-bold flex items-center gap-1">
                            <FileText size={14} />
                            <span>ดูไฟล์</span>
                          </a>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <button 
            onClick={() => setShowApprovalDrawer(false)}
            className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-white rounded-xl text-xs font-bold transition-all text-center"
          >
            ปิดหน้าต่าง
          </button>
        </div>
      )}

    </div>
  );
}
