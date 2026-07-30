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
  Trash2,
  ShieldCheck,
  Maximize2,
  Minimize2,
  Zap,
  Eye,
  UserCheck,
  Sparkles,
  Upload,
  Camera,
  Link as LinkIcon,
  Lock
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
  const [isInspectorFullscreen, setIsInspectorFullscreen] = useState(false);
  const [customPhotos, setCustomPhotos] = useState<Record<string, string>>({});
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [photoUrlInput, setPhotoUrlInput] = useState('');

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

  useEffect(() => {
    // Load persisted custom employee photos
    const stored = localStorage.getItem('swan_employee_photos');
    if (stored) {
      try {
        setCustomPhotos(JSON.parse(stored));
      } catch (e) {}
    }
  }, []);

  const saveCustomPhoto = (empKey: string | number, photoStr: string) => {
    if (user?.role !== 'admin') {
      alert('ขออภัย! สิทธิ์ในการอัปโหลด/เปลี่ยนรูปภาพพนักงานสงวนไว้สำหรับ Admin เท่านั้น');
      return;
    }

    const keysToUpdate = [
      String(empKey),
      selectedEmp?.id ? String(selectedEmp.id) : null,
      selectedEmp?.employee_id ? String(selectedEmp.employee_id) : null,
      selectedEmp?.name ? String(selectedEmp.name) : null
    ].filter(Boolean) as string[];

    const updated = { ...customPhotos };
    keysToUpdate.forEach(k => {
      updated[k] = photoStr;
    });

    setCustomPhotos(updated);

    // Update employees array in memory
    setEmployees(prev => prev.map(e => {
      if (e.id === selectedEmp?.id || e.employee_id === selectedEmp?.employee_id || e.name === selectedEmp?.name) {
        return { ...e, photo_url: photoStr };
      }
      return e;
    }));

    try {
      localStorage.setItem('swan_employee_photos', JSON.stringify(updated));
      alert('✅ บันทึกรูปภาพพนักงานความคมชัดสูงเรียบร้อยแล้ว!');
    } catch (err) {
      console.error('LocalStorage error:', err);
      alert('เกิดข้อผิดพลาดในการบันทึกภาพลงความจำเบราว์เซอร์ กรุณาลองใช้รูปภาพที่มีขนาดไฟล์เล็กลง');
    }

    // Try API update if backend active
    if (selectedEmp?.id) {
      api.put(`/api/employees/${selectedEmp.id}`, { photo_url: photoStr }).catch(() => {});
    }
  };

  // Image Compression Algorithm (resizes 4K/HD photos down to super-sharp 800px ~100KB JPEGs)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (user?.role !== 'admin') {
      alert('เฉพาะ Admin เท่านั้นที่มีสิทธิ์อัปโหลดรูปภาพพนักงาน');
      return;
    }

    const file = e.target.files?.[0];
    if (file && selectedEmp) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 800;
          const MAX_HEIGHT = 800;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height = Math.round((height * MAX_WIDTH) / width);
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width = Math.round((width * MAX_HEIGHT) / height);
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const compressedBase64 = canvas.toDataURL('image/jpeg', 0.88);
            saveCustomPhoto(selectedEmp.employee_id || selectedEmp.id, compressedBase64);
            setShowPhotoModal(false);
          }
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (user?.role !== 'admin') {
      alert('เฉพาะ Admin เท่านั้นที่มีสิทธิ์แก้ไขรูปภาพพนักงาน');
      return;
    }
    if (photoUrlInput.trim() && selectedEmp) {
      saveCustomPhoto(selectedEmp.employee_id || selectedEmp.id, photoUrlInput.trim());
      setPhotoUrlInput('');
      setShowPhotoModal(false);
    }
  };

  const loadData = async () => {
    try {
      const skillsRes = await api.get('/api/skills');
      setSkills(skillsRes.data);

      const matrixRes = await api.get('/api/skills/matrix');
      setMatrix(matrixRes.data);

      const empRes = await api.get('/api/employees');
      const filteredEmps = empRes.data.filter((e: any) => (e.role === 'employee' || e.role === 'staff') && e.department !== 'Management');
      setEmployees(filteredEmps);

      if (user && user.role === 'employee') {
        setSelectedEmpId(Number(user.id));
      } else if (filteredEmps.length > 0) {
        setSelectedEmpId(Number(filteredEmps[0].id));
      }
    } catch (err: any) {
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

      // Fallback mock employees with high-definition default photos
      const mockEmpList = [
        { id: 4, employee_id: 'EMP004', name: 'ประพันธ์ ยอดคุม', department: 'Operations', position: 'Zone A Supervisor', role: 'staff', photo_url: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=1000&q=80' },
        { id: 5, employee_id: 'EMP005', name: 'สมศรี มีคุม', department: 'Operations', position: 'Zone B Supervisor', role: 'staff', photo_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=1000&q=80' },
        { id: 6, employee_id: 'EMP006', name: 'สมปอง ลุยงาน', department: 'Operations', position: 'Forklift Driver', role: 'employee', photo_url: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=1000&q=80' },
        { id: 7, employee_id: 'EMP007', name: 'อรอนงค์ แพ็กเก่ง', department: 'Operations', position: 'Packer', role: 'employee', photo_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=1000&q=80' },
        { id: 8, employee_id: 'EMP008', name: 'มานะ คัดของ', department: 'Operations', position: 'Picker', role: 'employee', photo_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1000&q=80' },
        { id: 9, employee_id: 'EMP009', name: 'เกษม รับสินค้า', department: 'Operations', position: 'Receiving Clerk', role: 'employee', photo_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=1000&q=80' },
        { id: 10, employee_id: 'EMP010', name: 'จารุณี นับสต็อก', department: 'Operations', position: 'Inventory Counter', role: 'employee', photo_url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=1000&q=80' }
      ];
      setEmployees(mockEmpList);

      if (user && user.role === 'employee') {
        setSelectedEmpId(Number(user.id));
      } else if (mockEmpList.length > 0) {
        setSelectedEmpId(Number(mockEmpList[0].id));
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
      await api.post('/api/skills/employee', payload);
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
        approved_by_name: assignForm.status === 'qualified' || assignForm.status === 'expert' ? (user?.name || 'Supervisor') : undefined,
        approved_at: assignForm.status === 'qualified' || assignForm.status === 'expert' ? new Date().toISOString() : undefined
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
      setMatrix(matrix.map(m => {
        if (m.id === recordId) {
          return {
            ...m,
            status: 'qualified',
            approved_by_name: user?.name || 'Supervisor',
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
    if (!record) return 'bg-slate-100/70 text-slate-400';
    
    if (record.status === 'expert') {
      return 'bg-emerald-500/15 text-emerald-600 border border-emerald-500/40 font-extrabold';
    }
    if (record.status === 'qualified') {
      return 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 font-bold';
    }
    if (record.status === 'training') {
      return 'bg-amber-500/15 text-amber-600 border border-amber-500/30 font-bold';
    }
    return 'bg-rose-500/10 text-rose-600 border border-rose-500/20';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'expert': return <CheckCircle2 className="text-emerald-600" size={13} />;
      case 'qualified': return <Check className="text-emerald-500" size={13} />;
      case 'training': return <Clock className="text-amber-500" size={13} />;
      default: return <AlertTriangle className="text-rose-500" size={13} />;
    }
  };

  // Filters
  const filteredEmployees = employees.filter(emp => {
    if (user?.role === 'employee') {
      return Number(emp.id) === Number(user.id);
    }
    return emp.name.toLowerCase().includes(search.toLowerCase()) || 
           emp.employee_id.toLowerCase().includes(search.toLowerCase());
  });

  const filteredSkills = skills.filter(sk => 
    catFilter ? sk.category === catFilter : true
  );

  const selectedEmp = employees.find(e => Number(e.id) === Number(selectedEmpId)) || employees[0] || user;
  
  // Custom photo overrides or HD default Unsplash photos
  const customPhoto = customPhotos[selectedEmp?.employee_id] || customPhotos[selectedEmp?.id] || customPhotos[selectedEmp?.name];
  const empPhoto = customPhoto || selectedEmp?.photo_url || 
    (selectedEmp?.employee_id === 'EMP006' || selectedEmp?.employee_id === '22512' || selectedEmp?.name?.includes('เพทาย') ? 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=1000&q=80' :
     selectedEmp?.employee_id === 'EMP007' ? 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=1000&q=80' :
     selectedEmp?.employee_id === 'EMP008' ? 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1000&q=80' :
     selectedEmp?.employee_id === 'EMP009' ? 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=1000&q=80' :
     selectedEmp?.employee_id === 'EMP010' ? 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=1000&q=80' :
     'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=1000&q=80');

  const selectedEmpSkills = matrix.filter(
    m => Number(m.employee_id) === Number(selectedEmp?.id) && (m.status === 'qualified' || m.status === 'expert')
  );

  // Radar Chart 1: Operation Competency (Green Theme)
  const radarCompetencyData = [
    { subject: 'ความปลอดภัย (Safety)', value: 4, fullMark: 4 },
    { subject: 'ขับรถยก (Forklift)', value: 4, fullMark: 4 },
    { subject: 'สแกน RF (RF Scanner)', value: 3.5, fullMark: 4 },
    { subject: 'หยิบสินค้า (Picking)', value: 3.8, fullMark: 4 },
    { subject: 'แพ็กเกจ (Packing)', value: 3.2, fullMark: 4 },
    { subject: 'ระบบ 5ส (5S System)', value: 4, fullMark: 4 }
  ].map(item => {
    const matched = matrix.find(m => Number(m.employee_id) === Number(selectedEmp?.id) && m.skill_name.toLowerCase().includes(item.subject.split(' ')[0].toLowerCase()));
    return {
      ...item,
      value: matched ? matched.level : item.value
    };
  });

  // Radar Chart 2: Quality & Judgment Accuracy (Orange Theme)
  const radarJudgmentData = [
    { subject: 'Pass Standard', value: 4 },
    { subject: 'Judgement Acc.', value: 3.7 },
    { subject: 'Inspection', value: 3.9 },
    { subject: 'Risk Control', value: 3.6 },
    { subject: 'Execution', value: 4 }
  ];

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-4 border-slate-300 border-t-warehouse-orange rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 relative pb-16">
      
      {/* Header Info */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <span>ตารางวัดระดับทักษะ (Skill Matrix & Competency Profile)</span>
            <span className="px-2.5 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-[10px] uppercase tracking-wider font-extrabold">
              Inspector View
            </span>
          </h2>
          <p className="text-slate-500 text-sm mt-1">วิเคราะห์และแสดงผลรูปโปรไฟล์ระดับทักษะความชำนาญรายบุคคลในธีมสว่าง (เขียว-ขาว-ส้ม)</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsInspectorFullscreen(!isInspectorFullscreen)}
            className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-emerald-700 border border-emerald-300 text-xs font-bold transition-all shadow-sm flex items-center gap-2"
          >
            {isInspectorFullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
            <span>{isInspectorFullscreen ? 'ออกจากมุมมองเต็มจอ' : 'มุมมองบอร์ดแสดงผล (Inspector Fullscreen)'}</span>
          </button>

          {user?.role !== 'employee' && (
            <button 
              onClick={() => setShowCreateSkillModal(true)}
              className="px-4 py-2.5 rounded-xl bg-warehouse-orange hover:bg-warehouse-orange/90 text-white text-xs font-bold flex items-center gap-1 shadow-md shadow-warehouse-orange/20"
            >
              <Plus size={14} />
              <span>สร้างทักษะใหม่ (Create Skill)</span>
            </button>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. HIGH-TECH INSPECTOR INFORMATION PROFILE DISPLAY (ธีมสว่าง: เขียว-ขาว-ส้ม) */}
      {/* ========================================================================= */}
      <div className={`transition-all duration-300 ${isInspectorFullscreen ? 'fixed inset-0 z-50 p-6 bg-slate-100 overflow-y-auto' : ''}`}>
        <div className="rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-emerald-50/90 via-white to-amber-50/80 border border-emerald-200/80 shadow-xl space-y-6 relative overflow-hidden text-slate-800">
          
          {/* Subtle background glow effect */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-warehouse-orange/10 rounded-full blur-3xl pointer-events-none" />

          {/* Top Bar Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-emerald-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500 text-white flex items-center justify-center font-bold shadow-md shadow-emerald-500/20">
                <ShieldCheck size={22} />
              </div>
              <div>
                <h3 className="text-xs uppercase tracking-widest text-emerald-700 font-black flex items-center gap-2">
                  <span>Inspector Information Profile</span>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                </h3>
                <p className="text-sm font-extrabold text-slate-800 mt-0.5">ระบบรับรองสมรรถนะผู้ตรวจสอบและควบคุมคลังสินค้า</p>
              </div>
            </div>

            {/* Employee Selector dropdown for Supervisors */}
            {user?.role !== 'employee' && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-600 font-bold shrink-0">เลือกพนักงาน:</span>
                <select
                  value={selectedEmpId || ''}
                  onChange={(e) => setSelectedEmpId(parseInt(e.target.value, 10))}
                  className="bg-white border-2 border-emerald-300 text-slate-800 font-bold rounded-xl px-4 py-2 text-xs outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm"
                >
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name} ({emp.position} - {emp.employee_id})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Main Inspector Info Section (Left Info + Right Large Photo Frame) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left Side: Name, Rank & Quick Stats */}
            <div className="lg:col-span-8 space-y-6">
              <div>
                <div className="flex items-center gap-3">
                  <span className="px-3.5 py-1 rounded-xl bg-emerald-600 text-white font-mono font-black text-xs tracking-wider uppercase shadow-md shadow-emerald-600/20">
                    {selectedEmp?.employee_id || 'EMP006'}
                  </span>
                  <span className="px-3.5 py-1 rounded-xl bg-gradient-to-r from-warehouse-orange to-amber-500 text-white font-black text-xs tracking-wider uppercase shadow-md shadow-warehouse-orange/20">
                    Advance Level 4 Specialist
                  </span>
                </div>
                <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-wide uppercase mt-2.5">
                  MR. {selectedEmp?.name ? selectedEmp.name.toUpperCase() : 'SOMPONG LUI-NGAN'}
                </h1>
                <p className="text-slate-600 text-xs sm:text-sm font-bold mt-1 flex items-center gap-2">
                  <span>ตำแหน่ง: {selectedEmp?.position || 'Forklift Driver'}</span>
                  <span>•</span>
                  <span>แผนก: {selectedEmp?.department || 'Operations'}</span>
                </p>
              </div>

              {/* Gauges & Competency Metrics Circles (เขียว-ส้ม-ขาว) */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
                <div className="p-4 rounded-2xl bg-white border border-emerald-200/80 text-center space-y-1 shadow-md shadow-emerald-500/5 hover:border-emerald-400 transition-all">
                  <div className="w-12 h-12 mx-auto rounded-full bg-emerald-500/10 border-2 border-emerald-500 text-emerald-600 flex items-center justify-center font-mono font-black text-sm shadow-sm">
                    11/12
                  </div>
                  <p className="text-[10px] text-slate-500 font-extrabold uppercase mt-2">ทักษะที่อนุมัติ</p>
                  <p className="text-[9px] text-emerald-600 font-bold">Passed Competency</p>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-orange-200/80 text-center space-y-1 shadow-md shadow-warehouse-orange/5 hover:border-warehouse-orange transition-all">
                  <div className="w-12 h-12 mx-auto rounded-full bg-warehouse-orange/10 border-2 border-warehouse-orange text-warehouse-orange flex items-center justify-center font-mono font-black text-sm shadow-sm">
                    95%
                  </div>
                  <p className="text-[10px] text-slate-500 font-extrabold uppercase mt-2">คะแนนรวมเฉลี่ย</p>
                  <p className="text-[9px] text-warehouse-orange font-bold">Overall Rating</p>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-emerald-200/80 text-center space-y-1 shadow-md shadow-emerald-500/5 hover:border-emerald-400 transition-all">
                  <div className="w-12 h-12 mx-auto rounded-full bg-emerald-500/10 border-2 border-emerald-500 text-emerald-600 flex items-center justify-center font-mono font-black text-sm shadow-sm">
                    4/4
                  </div>
                  <p className="text-[10px] text-slate-500 font-extrabold uppercase mt-2">ระดับความปลอดภัย</p>
                  <p className="text-[9px] text-emerald-600 font-bold">Safety Master</p>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-orange-200/80 text-center space-y-1 shadow-md shadow-warehouse-orange/5 hover:border-warehouse-orange transition-all">
                  <div className="w-12 h-12 mx-auto rounded-full bg-warehouse-orange/10 border-2 border-warehouse-orange text-warehouse-orange flex items-center justify-center font-mono font-black text-sm shadow-sm">
                    LV. 4
                  </div>
                  <p className="text-[10px] text-slate-500 font-extrabold uppercase mt-2">ระดับความชำนาญ</p>
                  <p className="text-[9px] text-warehouse-orange font-bold">Expert Level</p>
                </div>
              </div>
            </div>

            {/* Right Side: Large Standout Portrait Photo Frame */}
            <div className="lg:col-span-4 flex flex-col items-center lg:items-end gap-3">
              <div className="relative w-64 h-72 sm:w-72 sm:h-80 rounded-3xl overflow-hidden border-4 border-emerald-500 shadow-2xl shadow-emerald-500/20 group bg-white">
                <img
                  src={empPhoto}
                  alt={selectedEmp?.name}
                  className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/10 to-transparent" />

                {/* Level Badge Overlay on Photo */}
                <div className="absolute top-4 left-4">
                  <span className="px-3.5 py-1.5 rounded-xl bg-warehouse-orange text-white font-black text-xs uppercase tracking-wider shadow-lg flex items-center gap-1">
                    <Sparkles size={13} />
                    <span>ADVANCE</span>
                  </span>
                </div>

                {/* Upload HD Photo Button on Frame (ONLY FOR ADMIN) */}
                {user?.role === 'admin' ? (
                  <button
                    onClick={() => setShowPhotoModal(true)}
                    className="absolute top-4 right-4 p-2 rounded-xl bg-white/95 hover:bg-warehouse-orange hover:text-white text-slate-800 backdrop-blur-md border border-slate-200 text-[10px] font-bold transition-all flex items-center gap-1.5 shadow-lg"
                    title="เฉพาะ Admin เท่านั้นที่มีสิทธิ์เปลี่ยนรูปภาพพนักงาน"
                  >
                    <Camera size={14} className="text-warehouse-orange" />
                    <span>เปลี่ยนรูป (Admin)</span>
                  </button>
                ) : (
                  <div 
                    className="absolute top-4 right-4 p-2 rounded-xl bg-slate-900/60 text-slate-300 text-[9px] font-bold flex items-center gap-1 backdrop-blur-md"
                    title="เฉพาะ Admin เท่านั้นที่เปลี่ยนรูปได้"
                  >
                    <Lock size={12} className="text-amber-400" />
                    <span>สิทธิ์ Admin</span>
                  </div>
                )}

                <div className="absolute bottom-4 left-4 right-4 text-center">
                  <p className="text-white font-black text-base drop-shadow-md">{selectedEmp?.name}</p>
                  <p className="text-emerald-400 font-mono text-xs font-extrabold mt-0.5">{selectedEmp?.employee_id}</p>
                </div>
              </div>

              {/* Admin HD Photo upload trigger */}
              {user?.role === 'admin' && (
                <button
                  onClick={() => setShowPhotoModal(true)}
                  className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-md flex items-center gap-1.5"
                >
                  <Upload size={14} />
                  <span>อัปโหลดรูปภาพพนักงาน HD (เฉพาะ Admin)</span>
                </button>
              )}
            </div>
          </div>

          {/* DUAL POLYGON RADAR CHARTS SECTION (ธีมสว่าง: เขียว & ส้ม) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
            
            {/* Left Radar Chart: Competency Dimensions (Emerald Green Polygon) */}
            <div className="p-5 rounded-2xl bg-white border border-emerald-200/80 shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b border-emerald-100 pb-2">
                <h4 className="text-xs font-black text-emerald-700 uppercase tracking-wider flex items-center gap-2">
                  <Zap size={15} className="text-emerald-600" />
                  <span>กราฟสมรรถนะการปฏิบัติงานหลัก (Skill Competency Web)</span>
                </h4>
                <span className="text-[10px] text-emerald-600 font-mono font-extrabold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">100% Full Standard</span>
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarCompetencyData}>
                    <PolarGrid stroke="#cbd5e1" strokeDasharray="3 3" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#1e293b', fontSize: 10, fontWeight: 'bold' }} />
                    <PolarRadiusAxis angle={30} domain={[0, 4]} tick={{ fill: '#64748b', fontSize: 8 }} />
                    <Radar
                      name="ระดับทักษะ"
                      dataKey="value"
                      stroke="#10b981"
                      fill="#10b981"
                      fillOpacity={0.35}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Right Radar Chart: Quality & Judgment Accuracy (Warehouse Orange Polygon) */}
            <div className="p-5 rounded-2xl bg-white border border-orange-200/80 shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b border-orange-100 pb-2">
                <h4 className="text-xs font-black text-warehouse-orange uppercase tracking-wider flex items-center gap-2">
                  <ShieldCheck size={15} className="text-warehouse-orange" />
                  <span>การตัดสินใจและความถูกต้อง (Working Judgment & Quality)</span>
                </h4>
                <span className="text-[10px] text-warehouse-orange font-mono font-extrabold bg-orange-50 px-2 py-0.5 rounded border border-orange-200">95% Accuracy</span>
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarJudgmentData}>
                    <PolarGrid stroke="#cbd5e1" strokeDasharray="3 3" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#1e293b', fontSize: 10, fontWeight: 'bold' }} />
                    <PolarRadiusAxis angle={30} domain={[0, 4]} tick={{ fill: '#64748b', fontSize: 8 }} />
                    <Radar
                      name="ประเมินการตัดสินใจ"
                      dataKey="value"
                      stroke="#f26522"
                      fill="#f26522"
                      fillOpacity={0.35}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>

          {/* Bottom Skill & Equipment Badges Grid */}
          <div className="pt-2">
            <h4 className="text-xs font-black text-emerald-800 uppercase tracking-widest mb-3">
              รายการความเชี่ยวชาญการใช้เครื่องมือและทักษะในคลัง:
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
              {skills.map(sk => {
                const record = matrix.find(m => Number(m.employee_id) === Number(selectedEmp?.id) && Number(m.skill_id) === Number(sk.id));
                return (
                  <div key={sk.id} className="p-3 rounded-2xl bg-white border border-emerald-100 shadow-sm space-y-1 text-center hover:border-emerald-300 transition-all">
                    <p className="text-[10px] font-black text-emerald-600 tracking-wider uppercase">{sk.category}</p>
                    <p className="text-xs font-bold text-slate-800 truncate" title={sk.name}>{sk.name.split(' (')[0]}</p>
                    <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-extrabold uppercase mt-1 ${
                      record?.status === 'expert' ? 'bg-emerald-500/15 text-emerald-700 border border-emerald-500/30' :
                      record?.status === 'qualified' ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' :
                      record?.status === 'training' ? 'bg-amber-500/15 text-amber-700 border border-amber-500/30' :
                      'bg-slate-100 text-slate-400'
                    }`}>
                      {record ? `LV. ${record.level} • ${record.status}` : 'LV. 0 • NEED'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
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

      {/* Skill Matrix Grid Table with Employee Pictures */}
      <GlassCard className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-slate-200/50 dark:border-white/5 bg-slate-100/50 dark:bg-white/5">
                <th className="px-6 py-4 text-left text-[10px] uppercase font-bold text-slate-400 tracking-wider w-64 min-w-[240px] sticky left-0 bg-white dark:bg-slate-900 z-10">พนักงาน</th>
                {filteredSkills.map(skill => (
                  <th key={skill.id} className="px-4 py-4 text-center text-[10px] uppercase font-bold text-slate-400 tracking-wider min-w-[150px]">
                    <div className="flex flex-col items-center group/header relative">
                      <span className="text-[9px] text-warehouse-orange tracking-widest">{skill.category}</span>
                      <span className="mt-0.5 line-clamp-1">{skill.name.split(' (')[0]}</span>
                      {user?.role !== 'employee' && (
                        <div className="flex items-center gap-1 mt-1 opacity-0 group-hover/header:opacity-100 transition-opacity">
                          <button 
                            onClick={(e) => { e.stopPropagation(); openEditSkillModal(skill); }}
                            className="p-1 hover:text-warehouse-orange hover:bg-warehouse-orange/10 rounded transition-all"
                            title="แก้ไขรายละเอียดทักษะ"
                          >
                            <Edit2 size={10} />
                          </button>
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleDeleteSkill(skill.id); }}
                            className="p-1 hover:text-red-500 hover:bg-red-500/10 rounded transition-all"
                            title="ลบหัวข้อทักษะนี้"
                          >
                            <Trash2 size={10} />
                          </button>
                        </div>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/50 dark:divide-white/5 text-xs">
              {filteredEmployees.map(emp => {
                const custom = customPhotos[emp.employee_id] || customPhotos[emp.id] || customPhotos[emp.name];
                const photo = custom || emp.photo_url || 
                  (emp.employee_id === 'EMP006' || emp.employee_id === '22512' || emp.name?.includes('เพทาย') ? 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&q=80' :
                   emp.employee_id === 'EMP007' ? 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&q=80' :
                   emp.employee_id === 'EMP008' ? 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80' :
                   emp.employee_id === 'EMP009' ? 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80' :
                   emp.employee_id === 'EMP010' ? 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&q=80' :
                   'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&q=80');

                const isSelected = Number(emp.id) === Number(selectedEmpId);

                return (
                  <tr key={emp.id} className={`hover:bg-slate-50 dark:hover:bg-white/5 transition-colors ${isSelected ? 'bg-emerald-500/10' : ''}`}>
                    
                    {/* Sticky Employee column with Photo Avatar */}
                    <td 
                      onClick={() => setSelectedEmpId(emp.id)}
                      className="px-6 py-3.5 font-semibold text-slate-700 dark:text-slate-200 sticky left-0 bg-white dark:bg-slate-900 border-r border-slate-200/50 dark:border-white/5 z-10 shadow-[4px_0_10px_-5px_rgba(0,0,0,0.05)] cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <img 
                          src={photo} 
                          alt={emp.name} 
                          className="w-10 h-10 rounded-full object-cover ring-2 ring-emerald-500/40 shrink-0 shadow-md" 
                        />
                        <div className="min-w-0">
                          <p className="font-bold text-slate-800 dark:text-slate-200 truncate text-xs">{emp.name}</p>
                          <p className="text-[10px] text-slate-400 font-normal truncate">{emp.position} ({emp.employee_id})</p>
                        </div>
                      </div>
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
                );
              })}
            </tbody>
          </table>
        </div>
      </GlassCard>

      {/* MODAL: UPLOAD HIGH-RESOLUTION EMPLOYEE PHOTO (RESTRICTED TO ADMIN ONLY) */}
      {showPhotoModal && selectedEmp && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <GlassCard className="w-full max-w-lg p-6 border border-slate-200/50 dark:border-white/10 space-y-5 animate-fadeIn">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200/50 dark:border-white/5">
              <h3 className="font-bold text-base text-slate-800 dark:text-white flex items-center gap-2">
                <Camera size={18} className="text-emerald-500" />
                <span>อัปโหลดรูปภาพพนักงาน HD (เฉพาะ Admin เท่านั้น)</span>
              </h3>
              <button onClick={() => setShowPhotoModal(false)} className="text-slate-400 hover:text-slate-200">
                <X size={20} />
              </button>
            </div>

            {user?.role !== 'admin' ? (
              <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-xs text-rose-500 flex items-center gap-3">
                <Lock size={20} className="shrink-0" />
                <div>
                  <p className="font-bold">ขออภัย! สิทธิ์การเข้าถึงถูกจำกัด</p>
                  <p className="text-[11px] opacity-90 mt-0.5">เฉพาะผู้ใช้งานสิทธิ์ Admin เท่านั้นที่มีสิทธิ์อัปโหลดหรือแก้ไขรูปภาพพนักงาน</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4 text-xs">
                <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-3">
                  <img src={empPhoto} alt="Current Preview" className="w-12 h-12 rounded-full object-cover border-2 border-emerald-500" />
                  <div>
                    <p className="font-bold text-slate-800 dark:text-white text-sm">{selectedEmp.name}</p>
                    <p className="text-[11px] text-emerald-600 font-mono font-bold">{selectedEmp.position} ({selectedEmp.employee_id})</p>
                  </div>
                </div>

                {/* Option 1: File Upload from Computer */}
                <div className="space-y-2">
                  <label className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Upload size={14} className="text-emerald-600" />
                    <span>วิธีที่ 1: เลือกไฟล์ภาพคมชัด HD จากเครื่องคอมพิวเตอร์</span>
                  </label>
                  <label className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer flex items-center justify-center gap-2 shadow-md transition-all">
                    <Upload size={16} />
                    <span>คลิกเพื่อเลือกไฟล์รูปภาพ HD (PNG, JPG, WEBP)</span>
                    <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                  </label>
                </div>

                <div className="relative flex py-1 items-center">
                  <div className="flex-grow border-t border-slate-200 dark:border-slate-800" />
                  <span className="flex-shrink mx-4 text-[10px] text-slate-400 font-bold uppercase">หรือ</span>
                  <div className="flex-grow border-t border-slate-200 dark:border-slate-800" />
                </div>

                {/* Option 2: Paste Direct Image URL */}
                <form onSubmit={handleUrlSubmit} className="space-y-2">
                  <label className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <LinkIcon size={14} className="text-warehouse-orange" />
                    <span>วิธีที่ 2: วางลิงก์รูปภาพ HD Direct URL</span>
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={photoUrlInput}
                      onChange={(e) => setPhotoUrlInput(e.target.value)}
                      placeholder="วางลิงก์รูปภาพ e.g. https://.../photo.jpg"
                      className="glass-input text-xs flex-1"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2.5 rounded-xl bg-warehouse-orange hover:bg-warehouse-orange/90 text-white text-xs font-bold transition-all shadow-md shadow-warehouse-orange/20"
                    >
                      บันทึก URL
                    </button>
                  </div>
                </form>
              </div>
            )}

            <div className="flex justify-end pt-3 border-t border-slate-200/50 dark:border-white/5">
              <button
                type="button"
                onClick={() => setShowPhotoModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/5 text-xs font-semibold"
              >
                ปิดหน้าต่าง
              </button>
            </div>
          </GlassCard>
        </div>
      )}

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
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
