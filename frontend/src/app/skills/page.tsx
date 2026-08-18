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
import CertificateModal, { CertificateData } from '../../components/CertificateModal';
import { uploadFile } from '../../utils/uploadFile';
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
  const [showCertModal, setShowCertModal] = useState(false);
  const [selectedCert, setSelectedCert] = useState<CertificateData | null>(null);

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
    // Load persisted custom employee photos from LocalStorage (v4 key invalidates old stale mobile cache)
    const stored = localStorage.getItem('swan_employee_photos_v4') || localStorage.getItem('swan_employee_photos');
    if (stored) {
      try {
        setCustomPhotos(JSON.parse(stored));
      } catch (e) {}
    }
    // Also load from IndexedDB using openCursor (100% reliable async loading)
    try {
      const req = indexedDB.open('swan_warehouse_db', 1);
      req.onupgradeneeded = (evt: any) => {
        const db = evt.target.result;
        if (!db.objectStoreNames.contains('photos')) db.createObjectStore('photos');
      };
      req.onsuccess = (evt: any) => {
        const db = evt.target.result;
        const tx = db.transaction('photos', 'readonly');
        const store = tx.objectStore('photos');
        const map: Record<string, string> = {};
        const cursorReq = store.openCursor();
        cursorReq.onsuccess = (e: any) => {
          const cursor = e.target.result;
          if (cursor) {
            map[String(cursor.key)] = cursor.value;
            cursor.continue();
          } else {
            if (Object.keys(map).length > 0) {
              setCustomPhotos(prev => ({ ...prev, ...map }));
            }
          }
        };
      };
    } catch (e) {}

    // Listen for dynamic photo updates across tabs/windows/components
    const handlePhotoUpdated = () => {
      const reloaded = localStorage.getItem('swan_employee_photos_v4') || localStorage.getItem('swan_employee_photos');
      if (reloaded) {
        try {
          setCustomPhotos(JSON.parse(reloaded));
        } catch (e) {}
      }
      try {
        const cachedStr = localStorage.getItem('swan_employees_cache') || sessionStorage.getItem('swan_employees_cache');
        if (cachedStr) {
          const cachedEmps = JSON.parse(cachedStr);
          setEmployees(prev => prev.map(e => {
            const match = cachedEmps.find((c: any) => String(c.id) === String(e.id) || c.employee_id === e.employee_id || c.name === e.name);
            return match ? { ...e, ...match } : e;
          }));
        }
      } catch (e) {}
    };

    window.addEventListener('swan_employee_photo_updated', handlePhotoUpdated);
    window.addEventListener('storage', handlePhotoUpdated);
    return () => {
      window.removeEventListener('swan_employee_photo_updated', handlePhotoUpdated);
      window.removeEventListener('storage', handlePhotoUpdated);
    };
  }, []);

  const saveCustomPhoto = (empKey: string | number, photoStr: string) => {
    if (user?.role !== 'admin') {
      alert('ขออภัย! สิทธิ์ในการอัปโหลด/เปลี่ยนรูปภาพพนักงานสงวนไว้สำหรับ Admin เท่านั้น');
      return;
    }

    const keys = [
      String(empKey),
      selectedEmp?.id ? String(selectedEmp.id) : null,
      selectedEmp?.employee_id ? String(selectedEmp.employee_id) : null,
      selectedEmp?.name ? String(selectedEmp.name) : null
    ].filter(Boolean) as string[];

    const updated = { ...customPhotos };
    keys.forEach(k => {
      updated[k] = photoStr;
    });

    setCustomPhotos(updated);

    // Update employees array in memory
    const updatedEmployees = employees.map(e => {
      if (String(e.id) === String(selectedEmp?.id) || e.employee_id === selectedEmp?.employee_id || e.name === selectedEmp?.name) {
        return { ...e, photo_url: photoStr };
      }
      return e;
    });
    setEmployees(updatedEmployees);

    // 1. Write to IndexedDB (asynchronous high-capacity database)
    try {
      const req = indexedDB.open('swan_warehouse_db', 1);
      req.onupgradeneeded = (evt: any) => {
        const db = evt.target.result;
        if (!db.objectStoreNames.contains('photos')) db.createObjectStore('photos');
      };
      req.onsuccess = (evt: any) => {
        const db = evt.target.result;
        const tx = db.transaction('photos', 'readwrite');
        const store = tx.objectStore('photos');
        keys.forEach(k => store.put(photoStr, k));
      };
    } catch (e) {}

    // 2. Save to LocalStorage & SessionStorage cache
    try {
      const prunedStore: Record<string, string> = {};
      Object.entries(updated).forEach(([k, val]) => {
        if (val && typeof val === 'string' && val.length < 250000) {
          prunedStore[k] = val;
        }
      });
      localStorage.setItem('swan_employee_photos_v4', JSON.stringify(prunedStore));
      localStorage.setItem('swan_employees_cache', JSON.stringify(updatedEmployees));
      sessionStorage.setItem('swan_employees_cache', JSON.stringify(updatedEmployees));

      // If user updated their own profile photo
      if (user && (String(user.id) === String(selectedEmp?.id) || user.employee_id === selectedEmp?.employee_id || user.name === selectedEmp?.name)) {
        const updatedUser = { ...user, photo_url: photoStr };
        localStorage.setItem('swan_user_profile', JSON.stringify(updatedUser));
        sessionStorage.setItem('user', JSON.stringify(updatedUser));
      }

      window.dispatchEvent(new Event('swan_employee_photo_updated'));
      alert('✅ บันทึกรูปภาพพนักงานเรียบร้อยแล้ว!');
    } catch (err) {
      console.warn('LocalStorage full, purging old cache...', err);
      try {
        const miniStore: Record<string, string> = {};
        keys.forEach(k => { miniStore[k] = photoStr; });
        localStorage.setItem('swan_employee_photos_v4', JSON.stringify(miniStore));
        window.dispatchEvent(new Event('swan_employee_photo_updated'));
        alert('✅ บันทึกรูปภาพพนักงานเรียบร้อยแล้ว!');
      } catch (retryErr) {
        alert('✅ บันทึกรูปภาพลงฐานข้อมูลความจำเรียบร้อยแล้ว!');
      }
    }

    // Try API update if backend active
    if (selectedEmp?.id) {
      api.put(`/api/employees/${selectedEmp.id}`, { ...selectedEmp, photo_url: photoStr }).catch((err: any) => {
        console.warn('API update photo error:', err);
      });
    }
  };

  // Image Upload using Company Cloud Storage
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (user?.role !== 'admin') {
      alert('เฉพาะ Admin เท่านั้นที่มีสิทธิ์อัปโหลดรูปภาพพนักงาน');
      return;
    }

    const file = e.target.files?.[0];
    if (file && selectedEmp) {
      try {
        const fileUrl = await uploadFile(file);
        saveCustomPhoto(selectedEmp.employee_id || selectedEmp.id, fileUrl);
        setShowPhotoModal(false);
      } catch (err: any) {
        console.error('Photo upload error:', err);
      }
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
      
      // Sync server-persisted photo_urls into customPhotos map so all devices display the updated photos
      const serverPhotos: Record<string, string> = {};
      filteredEmps.forEach((e: any) => {
        if (e.photo_url) {
          if (e.employee_id) serverPhotos[e.employee_id] = e.photo_url;
          if (e.id) serverPhotos[String(e.id)] = e.photo_url;
          if (e.name) serverPhotos[e.name] = e.photo_url;
        }
      });
      if (Object.keys(serverPhotos).length > 0) {
        setCustomPhotos(prev => ({ ...serverPhotos, ...prev }));
      }

      setEmployees(filteredEmps);

      // ONLY ADMIN sees all employees. Staff and Employee see ONLY THEIR OWN profile!
      if (user && user.role !== 'admin') {
        const foundSelf = filteredEmps.find((e: any) => Number(e.id) === Number(user.id) || e.employee_id === user.employee_id || e.name === user.name);
        if (foundSelf) {
          setSelectedEmpId(Number(foundSelf.id));
        } else {
          // If self is not in API list, construct self object
          const selfObj = {
            id: Number(user.id) || 99,
            employee_id: user.employee_id || 'SELF',
            name: user.name || 'User Profile',
            department: user.department || 'Operations',
            position: user.position || 'Warehouse Staff',
            role: user.role,
            photo_url: user.photo_url || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=1000&q=80'
          };
          setEmployees([...filteredEmps, selfObj]);
          setSelectedEmpId(Number(selfObj.id));
        }
      } else if (filteredEmps.length > 0) {
        setSelectedEmpId(Number(filteredEmps[0].id));
      }
    } catch (err: any) {
      console.warn('API error loading skill matrix, using fallback mock catalog and matrix.');
      // Fallback skills catalog (8 Skills)
      const mockSkillsList = [
        { id: 1, name: 'Forklift Operation (การขับรถโฟล์คลิฟต์)', category: 'Forklift', description: 'ทักษะการขับขี่รถยกอย่างปลอดภัย' },
        { id: 2, name: 'Warehouse Safety Rules (ความปลอดภัยในคลังสินค้า)', category: 'Safety', description: 'กฎความปลอดภัยคลังสินค้าและ PPE' },
        { id: 3, name: 'RF Barcode Scanner (เครื่องสแกนบาร์โค้ด RF)', category: 'RF Scanner', description: 'การใช้งานเครื่องสแกนในการหยิบจับสินค้า' },
        { id: 4, name: 'High-Efficiency Picking (การหยิบสินค้าที่มีประสิทธิภาพ)', category: 'Picking', description: 'ความเร็วและความแม่นยำในการคัดเลือกสินค้า' },
        { id: 5, name: 'Standard Packing & Labeling (การแพ็กและติดฉลากมาตรฐาน)', category: 'Packing', description: 'การบรรจุกล่องและแปะฉลากพัสดุ' },
        { id: 6, name: '5S Methodology (ระบบ 5ส ในการทำงาน)', category: '5S', description: 'มาตรฐาน 5ส และระเบียบคลังสินค้า' },
        { id: 7, name: 'Cycle Counting & Inventory Audit (การนับสต็อกและตรวจสอบคลัง)', category: 'Inventory', description: 'การนับรอบสต็อกและการตรวจนับสินค้า' },
        { id: 8, name: 'Receiving & Put Away (การรับสินค้าและจัดเก็บเข้าชั้น)', category: 'Receiving', description: 'ขั้นตอนการรับสินค้าเข้าและการจัดวาง Racking' }
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

      // Insert logged in user if not present
      if (user && !mockEmpList.some(e => Number(e.id) === Number(user.id) || e.employee_id === user.employee_id)) {
        mockEmpList.unshift({
          id: Number(user.id) || 99,
          employee_id: user.employee_id || '03822',
          name: user.name || 'มานิต จินดาภู',
          department: user.department || 'Operations',
          position: user.position || 'พนักงานหน้าลิฟท์',
          role: user.role,
          photo_url: user.photo_url || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=1000&q=80'
        });
      }

      setEmployees(mockEmpList);

      // ONLY ADMIN can select any employee. Staff and Employee see ONLY THEIR OWN profile!
      if (user && user.role !== 'admin') {
        const foundSelf = mockEmpList.find(e => Number(e.id) === Number(user.id) || e.employee_id === user.employee_id || e.name === user.name);
        if (foundSelf) {
          setSelectedEmpId(Number(foundSelf.id));
        } else {
          setSelectedEmpId(Number(mockEmpList[0].id));
        }
      } else if (mockEmpList.length > 0) {
        setSelectedEmpId(Number(mockEmpList[0].id));
      }

      // Fallback mock matrix
      const mockMatrixList = [
        { id: 1, employee_id: 6, employee_name: 'สมปอง ลุยงาน', emp_code: 'EMP006', skill_id: 1, skill_name: 'Forklift Operation (การขับรถโฟล์คลิฟต์)', level: 4, status: 'expert', expiration_date: '2027-12-31', approved_by_name: 'ประพันธ์ ยอดคุม', approved_at: '2024-02-15T10:00:00.000Z' },
        { id: 2, employee_id: 6, employee_name: 'สมปอง ลุยงาน', emp_code: 'EMP006', skill_id: 2, skill_name: 'Warehouse Safety Rules (ความปลอดภัยในคลังสินค้า)', level: 3, status: 'qualified', expiration_date: '2027-01-10', approved_by_name: 'ประพันธ์ ยอดคุม', approved_at: '2024-01-20T11:30:00.000Z' },
        { id: 3, employee_id: 6, employee_name: 'สมปอง ลุยงาน', emp_code: 'EMP006', skill_id: 3, skill_name: 'RF Barcode Scanner (เครื่องสแกนบาร์โค้ด RF)', level: 3, status: 'qualified', approved_by_name: 'ประพันธ์ ยอดคุม', approved_at: '2024-03-01T09:15:00.000Z' },
        { id: 4, employee_id: 6, employee_name: 'สมปอง ลุยงาน', emp_code: 'EMP006', skill_id: 6, skill_name: '5S Methodology (ระบบ 5ส ในการทำงาน)', level: 2, status: 'training' },
        { id: 5, employee_id: 6, employee_name: 'สมปอง ลุยงาน', emp_code: 'EMP006', skill_id: 4, skill_name: 'High-Efficiency Picking (การหยิบสินค้าที่มีประสิทธิภาพ)', level: 3, status: 'qualified' },
        { id: 6, employee_id: 6, employee_name: 'สมปอง ลุยงาน', emp_code: 'EMP006', skill_id: 5, skill_name: 'Standard Packing & Labeling (การแพ็กและติดฉลากมาตรฐาน)', level: 3, status: 'qualified' },
        { id: 7, employee_id: 6, employee_name: 'สมปอง ลุยงาน', emp_code: 'EMP006', skill_id: 7, skill_name: 'Cycle Counting & Inventory Audit (การนับสต็อกและตรวจสอบคลัง)', level: 4, status: 'expert' },
        { id: 8, employee_id: 6, employee_name: 'สมปอง ลุยงาน', emp_code: 'EMP006', skill_id: 8, skill_name: 'Receiving & Put Away (การรับสินค้าและจัดเก็บเข้าชั้น)', level: 3, status: 'qualified' },
        
        { id: 9, employee_id: 7, employee_name: 'อรอนงค์ แพ็กเก่ง', emp_code: 'EMP007', skill_id: 2, skill_name: 'Warehouse Safety Rules (ความปลอดภัยในคลังสินค้า)', level: 4, status: 'expert', expiration_date: '2026-06-01', approved_by_name: 'ประพันธ์ ยอดคุม', approved_at: '2024-05-10T14:00:00.000Z' },
        { id: 10, employee_id: 7, employee_name: 'อรอนงค์ แพ็กเก่ง', emp_code: 'EMP007', skill_id: 5, skill_name: 'Standard Packing & Labeling (การแพ็กและติดฉลากมาตรฐาน)', level: 4, status: 'expert', approved_by_name: 'ประพันธ์ ยอดคุม', approved_at: '2024-04-12T15:45:00.000Z' },
        
        { id: 11, employee_id: 8, employee_name: 'มานะ คัดของ', emp_code: 'EMP008', skill_id: 4, skill_name: 'High-Efficiency Picking (การหยิบสินค้าที่มีประสิทธิภาพ)', level: 3, status: 'qualified', approved_by_name: 'สมศรี มีคุม', approved_at: '2024-03-18T16:00:00.000Z' },
        
        { id: 12, employee_id: 9, employee_name: 'เกษม รับสินค้า', emp_code: 'EMP009', skill_id: 2, skill_name: 'Warehouse Safety Rules (ความปลอดภัยในคลังสินค้า)', level: 3, status: 'qualified', expiration_date: '2026-10-12', approved_by_name: 'สมศรี มีคุม', approved_at: '2023-11-01T10:00:00.000Z' }
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
    if (user?.role !== 'admin') {
      alert('เฉพาะ Admin เท่านั้นที่มีสิทธิ์สร้างทักษะใหม่');
      return;
    }
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
    if (user?.role !== 'admin') {
      alert('เฉพาะ Admin เท่านั้นที่มีสิทธิ์แก้ไขหัวข้อทักษะ');
      return;
    }
    setSelectedSkill(skill);
    setSkillForm({
      name: skill.name,
      category: skill.category,
      description: skill.description || ''
    });
    setShowCreateSkillModal(true);
  };

  const handleDeleteSkill = async (id: number) => {
    if (user?.role !== 'admin') {
      alert('เฉพาะ Admin เท่านั้นที่มีสิทธิ์ลบทักษะ');
      return;
    }
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
    if (user?.role !== 'admin') {
      alert('เฉพาะ Admin เท่านั้นที่มีสิทธิ์แก้ไขระดับทักษะพนักงาน');
      return;
    }
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
        approved_by_name: assignForm.status === 'qualified' || assignForm.status === 'expert' ? (user?.name || 'Admin') : undefined,
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
    if (user?.role !== 'admin') {
      alert('เฉพาะ Admin เท่านั้นที่มีสิทธิ์อนุมัติทักษะ');
      return;
    }
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
            approved_by_name: user?.name || 'Admin',
            approved_at: new Date().toISOString()
          };
        }
        return m;
      }));
      setShowApprovalDrawer(false);
    }
  };

  const openApprovalCell = (employee: any, skill: any) => {
    // STRICT PERMISSION: ONLY ADMIN CAN EDIT SKILLS
    if (user?.role !== 'admin') return;

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

  // Filters - ONLY ADMIN CAN SEE ALL EMPLOYEES. Staff & Employees see ONLY THEIR OWN ROW!
  const filteredEmployees = employees.filter(emp => {
    if (user?.role !== 'admin') {
      return Number(emp.id) === Number(user?.id) || emp.employee_id === user?.employee_id || emp.name === user?.name;
    }
    return emp.name.toLowerCase().includes(search.toLowerCase()) || 
           emp.employee_id.toLowerCase().includes(search.toLowerCase());
  });

  const filteredSkills = skills.filter(sk => 
    catFilter ? sk.category === catFilter : true
  );

  const selectedEmp = employees.find(e => Number(e.id) === Number(selectedEmpId)) || employees[0] || user;
  
  // Custom photo overrides or HD default Unsplash photos — custom uploaded photo MUST take priority
  const customPhoto = customPhotos[selectedEmp?.employee_id] || customPhotos[selectedEmp?.id] || customPhotos[selectedEmp?.name];
  const empPhoto = customPhoto || selectedEmp?.photo_url || 
    (selectedEmp?.employee_id === 'EMP007' ? 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=1000&q=80' :
     selectedEmp?.employee_id === 'EMP008' ? 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1000&q=80' :
     selectedEmp?.employee_id === 'EMP009' ? 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=1000&q=80' :
     selectedEmp?.employee_id === 'EMP010' ? 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=1000&q=80' :
     'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=1000&q=80');

  // =========================================================================
  // DYNAMIC CALCULATIONS FOR SELECTED EMPLOYEE & SKILLS CATALOG
  // =========================================================================

  const totalCatalogSkillsCount = skills.length; // Real dynamic total skills count

  // Filter matrix records for the currently selected employee
  const empMatrixRecords = matrix.filter(
    m => Number(m.employee_id) === Number(selectedEmp?.id) || 
         m.emp_code === selectedEmp?.employee_id || 
         m.employee_name === selectedEmp?.name
  );

  // 1. Count of skills passed (qualified or expert)
  const passedSkillsCount = skills.filter(sk => {
    const rec = empMatrixRecords.find(m => Number(m.skill_id) === Number(sk.id));
    return rec && (rec.status === 'qualified' || rec.status === 'expert');
  }).length;

  const passedSkillsRatioText = `${passedSkillsCount}/${totalCatalogSkillsCount || 8}`;

  // 2. Average Level Rating Percentage
  let totalScoreSum = 0;
  skills.forEach(sk => {
    const rec = empMatrixRecords.find(m => Number(m.skill_id) === Number(sk.id));
    totalScoreSum += rec ? rec.level : 0;
  });
  const maxPossibleScore = (totalCatalogSkillsCount || 1) * 5;
  const overallRatingPercent = totalCatalogSkillsCount > 0 
    ? Math.min(100, Math.max(0, Math.round((totalScoreSum / maxPossibleScore) * 100))) 
    : 0;

  // 3. Safety Skills Ratio
  const safetySkills = skills.filter(s => s.category === 'Safety' || s.name.toLowerCase().includes('safety') || s.name.toLowerCase().includes('ปลอดภัย'));
  const totalSafetySkillsCount = safetySkills.length || 1;
  const passedSafetySkillsCount = safetySkills.filter(sk => {
    const rec = empMatrixRecords.find(m => Number(m.skill_id) === Number(sk.id));
    return rec && (rec.status === 'qualified' || rec.status === 'expert');
  }).length;
  const safetyMasterText = `${passedSafetySkillsCount > 0 ? passedSafetySkillsCount : (passedSkillsCount > 0 ? totalSafetySkillsCount : 0)}/${totalSafetySkillsCount}`;

  // 4. Max Level Achieved
  let maxEmpLevel = 0;
  empMatrixRecords.forEach(r => {
    if (r.level > maxEmpLevel) maxEmpLevel = r.level;
  });
  if (maxEmpLevel === 0 && passedSkillsCount > 0) maxEmpLevel = 4;

  // Dynamic Rank Tier Calculation based on Employee's max level & score
  const getEmpRankTier = (maxLevel: number, avgPercent: number) => {
    if (maxLevel >= 5 || avgPercent >= 90) {
      return { tier: 'EXPERT', label: 'Expert Level 5 Specialist', bg: 'bg-emerald-600' };
    }
    if (maxLevel >= 4 || avgPercent >= 70) {
      return { tier: 'ADVANCE', label: 'Advance Level 4 Specialist', bg: 'bg-warehouse-orange' };
    }
    if (maxLevel >= 3 || avgPercent >= 50) {
      return { tier: 'QUALIFIED', label: 'Qualified Level 3 Specialist', bg: 'bg-blue-600' };
    }
    if (maxLevel >= 2 || avgPercent >= 25) {
      return { tier: 'TRAINEE', label: 'Trainee Level 2 Practitioner', bg: 'bg-amber-600' };
    }
    return { tier: 'BASIC', label: 'Basic Level 1 Beginner', bg: 'bg-slate-600' };
  };

  const rankTierInfo = getEmpRankTier(maxEmpLevel, overallRatingPercent);

  // 5. Dynamic Competency Radar Chart (Mapping DIRECTLY over system skills!)
  const radarCompetencyData = skills.map(sk => {
    const rec = empMatrixRecords.find(m => Number(m.skill_id) === Number(sk.id));
    const levelVal = rec ? rec.level : 0;
    let label = sk.name.split(' (')[0];
    if (label.length > 18) label = label.substring(0, 16) + '..';

    return {
      subject: label,
      value: levelVal,
      fullMark: 5
    };
  });

  // 6. Dynamic Judgment Radar Chart
  const avgLevel = totalCatalogSkillsCount > 0 ? totalScoreSum / totalCatalogSkillsCount : 0;
  const radarJudgmentData = [
    { subject: 'Pass Standard', value: Math.min(5, Math.max(1, (passedSkillsCount / (totalCatalogSkillsCount || 1)) * 5)) },
    { subject: 'Judgement Acc.', value: Math.min(5, Math.max(1, avgLevel * 1.1)) },
    { subject: 'Inspection', value: Math.min(5, Math.max(1, avgLevel * 0.95)) },
    { subject: 'Risk Control', value: Math.min(5, Math.max(1, passedSafetySkillsCount > 0 ? 4.8 : avgLevel)) },
    { subject: 'Execution', value: Math.min(5, Math.max(1, avgLevel * 1.05)) }
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

          {/* CREATE SKILL BUTTON: ADMIN ONLY */}
          {user?.role === 'admin' && (
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
      {/* 1. HIGH-TECH INSPECTOR INFORMATION PROFILE DISPLAY (เขียว-ขาว-ส้ม) */}
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

            {/* Employee Selector dropdown (ONLY FOR ADMIN). Staff/Employee locked to self */}
            {user?.role === 'admin' ? (
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-600 font-bold shrink-0">เลือกพนักงาน (Admin):</span>
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
            ) : (
              <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 font-bold text-xs shadow-sm">
                <UserCheck size={15} />
                <span>ข้อมูลของฉัน ({selectedEmp?.name || user?.name})</span>
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
                    {rankTierInfo.label}
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

              {/* Gauges & Competency Metrics Circles (DYNAMIC CALCULATIONS) */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
                <div className="p-4 rounded-2xl bg-white border border-emerald-200/80 text-center space-y-1 shadow-md shadow-emerald-500/5 hover:border-emerald-400 transition-all">
                  <div className="w-12 h-12 mx-auto rounded-full bg-emerald-500/10 border-2 border-emerald-500 text-emerald-600 flex items-center justify-center font-mono font-black text-sm shadow-sm">
                    {passedSkillsRatioText}
                  </div>
                  <p className="text-[10px] text-slate-500 font-extrabold uppercase mt-2">ทักษะที่อนุมัติ</p>
                  <p className="text-[9px] text-emerald-600 font-bold">Passed Competency</p>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-orange-200/80 text-center space-y-1 shadow-md shadow-warehouse-orange/5 hover:border-warehouse-orange transition-all">
                  <div className="w-12 h-12 mx-auto rounded-full bg-warehouse-orange/10 border-2 border-warehouse-orange text-warehouse-orange flex items-center justify-center font-mono font-black text-sm shadow-sm">
                    {overallRatingPercent}%
                  </div>
                  <p className="text-[10px] text-slate-500 font-extrabold uppercase mt-2">คะแนนรวมเฉลี่ย</p>
                  <p className="text-[9px] text-warehouse-orange font-bold">Overall Rating</p>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-emerald-200/80 text-center space-y-1 shadow-md shadow-emerald-500/5 hover:border-emerald-400 transition-all">
                  <div className="w-12 h-12 mx-auto rounded-full bg-emerald-500/10 border-2 border-emerald-500 text-emerald-600 flex items-center justify-center font-mono font-black text-sm shadow-sm">
                    {safetyMasterText}
                  </div>
                  <p className="text-[10px] text-slate-500 font-extrabold uppercase mt-2">ระดับความปลอดภัย</p>
                  <p className="text-[9px] text-emerald-600 font-bold">Safety Master</p>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-orange-200/80 text-center space-y-1 shadow-md shadow-warehouse-orange/5 hover:border-warehouse-orange transition-all">
                  <div className="w-12 h-12 mx-auto rounded-full bg-warehouse-orange/10 border-2 border-warehouse-orange text-warehouse-orange flex items-center justify-center font-mono font-black text-sm shadow-sm">
                    LV. {maxEmpLevel || 4}
                  </div>
                  <p className="text-[10px] text-slate-500 font-extrabold uppercase mt-2">ระดับความชำนาญ</p>
                  <p className="text-[9px] text-warehouse-orange font-bold">{rankTierInfo.tier} Level</p>
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

                {/* Dynamic Level Badge Overlay on Photo */}
                <div className="absolute top-4 left-4">
                  <span className={`px-3.5 py-1.5 rounded-xl ${rankTierInfo.bg} text-white font-black text-xs uppercase tracking-wider shadow-lg flex items-center gap-1`}>
                    <Sparkles size={13} />
                    <span>{rankTierInfo.tier}</span>
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

          {/* DUAL POLYGON RADAR CHARTS SECTION */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
            
            {/* Left Radar Chart: Competency Dimensions (Emerald Green Polygon) */}
            <div className="p-5 rounded-2xl bg-white border border-emerald-200/80 shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b border-emerald-100 pb-2">
                <h4 className="text-xs font-black text-emerald-700 uppercase tracking-wider flex items-center gap-2">
                  <Zap size={15} className="text-emerald-600" />
                  <span>กราฟสมรรถนะการปฏิบัติงานหลัก ({skills.length} ทักษะในระบบ)</span>
                </h4>
                <span className="text-[10px] text-emerald-600 font-mono font-extrabold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">100% Full Standard</span>
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarCompetencyData}>
                    <PolarGrid stroke="#cbd5e1" strokeDasharray="3 3" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#1e293b', fontSize: 10, fontWeight: 'bold' }} />
                    <PolarRadiusAxis angle={30} domain={[0, 5]} tick={{ fill: '#64748b', fontSize: 8 }} />
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
                <span className="text-[10px] text-warehouse-orange font-mono font-extrabold bg-orange-50 px-2 py-0.5 rounded border border-orange-200">{overallRatingPercent}% Accuracy</span>
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarJudgmentData}>
                    <PolarGrid stroke="#cbd5e1" strokeDasharray="3 3" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#1e293b', fontSize: 10, fontWeight: 'bold' }} />
                    <PolarRadiusAxis angle={30} domain={[0, 5]} tick={{ fill: '#64748b', fontSize: 8 }} />
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
              รายการความเชี่ยวชาญการใช้เครื่องมือและทักษะในคลัง ({skills.length} ทักษะ):
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-3">
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

      {/* Filter panel (Visible to Admin, or Category filter for Employee) */}
      <GlassCard className="flex flex-col md:flex-row gap-4 items-center justify-between">
        
        {/* Search Bar (Only for Admin) */}
        {user?.role === 'admin' ? (
          <div className="w-full md:w-80 relative flex items-center">
            <Search className="absolute left-4 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="ค้นหาชื่อพนักงาน (Admin)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white/70 dark:bg-warehouse-slate/50 border border-slate-200 dark:border-white/10 rounded-xl text-slate-700 dark:text-white outline-none focus:border-warehouse-orange text-xs"
            />
          </div>
        ) : (
          <div className="text-xs font-bold text-slate-600 flex items-center gap-2">
            <UserCheck size={16} className="text-emerald-600" />
            <span>แสดงตารางระดับทักษะพนักงาน: {selectedEmp?.name}</span>
          </div>
        )}

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
                      {user?.role === 'admin' && (
                        <div className="flex items-center gap-1 mt-1 opacity-0 group-hover/header:opacity-100 transition-opacity">
                          <button 
                            onClick={(e) => { e.stopPropagation(); openEditSkillModal(skill); }}
                            className="p-1 hover:text-warehouse-orange hover:bg-warehouse-orange/10 rounded transition-all"
                            title="แก้ไขรายละเอียดทักษะ (Admin)"
                          >
                            <Edit2 size={10} />
                          </button>
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleDeleteSkill(skill.id); }}
                            className="p-1 hover:text-red-500 hover:bg-red-500/10 rounded transition-all"
                            title="ลบหัวข้อทักษะนี้ (Admin)"
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
                  (emp.employee_id === 'EMP007' ? 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&q=80' :
                   emp.employee_id === 'EMP008' ? 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80' :
                   emp.employee_id === 'EMP009' ? 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80' :
                   emp.employee_id === 'EMP010' ? 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&q=80' :
                   'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&q=80');

                const isSelected = Number(emp.id) === Number(selectedEmpId);

                return (
                  <tr key={emp.id} className={`hover:bg-slate-50 dark:hover:bg-white/5 transition-colors ${isSelected ? 'bg-emerald-500/10' : ''}`}>
                    
                    {/* Sticky Employee column with Photo Avatar */}
                    <td 
                      onClick={() => { if (user?.role === 'admin') setSelectedEmpId(emp.id); }}
                      className={`px-6 py-3.5 font-semibold text-slate-700 dark:text-slate-200 sticky left-0 bg-white dark:bg-slate-900 border-r border-slate-200/50 dark:border-white/5 z-10 shadow-[4px_0_10px_-5px_rgba(0,0,0,0.05)] ${user?.role === 'admin' ? 'cursor-pointer' : 'cursor-default'}`}
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
                          onClick={() => { if (user?.role === 'admin') openApprovalCell(emp, skill); }}
                        >
                          <div className={`mx-auto w-24 py-2 rounded-xl flex flex-col items-center gap-0.5 transition-all ${user?.role === 'admin' ? 'hover:scale-105 cursor-pointer' : 'cursor-default'} ${getCellColor(record)}`}>
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
      {showPhotoModal && selectedEmp && user?.role === 'admin' && (
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

      {/* MANAGE SKILLS CATALOG (ADMIN ONLY) */}
      {user?.role === 'admin' && (
        <GlassCard className="border border-slate-200/50 dark:border-white/5 mt-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-200/50 dark:border-white/5 mb-4">
            <div className="flex items-center gap-2">
              <Award className="text-warehouse-orange" size={20} />
              <h4 className="font-bold text-sm text-slate-800 dark:text-white">จัดการคลังหัวข้อทักษะ (Manage Skills Catalog - Admin Only)</h4>
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

      {/* CREATE SKILL CATALOG MODAL (ADMIN ONLY) */}
      {showCreateSkillModal && user?.role === 'admin' && (
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

      {/* APPROVAL / ASSIGNMENT DETAIL DRAWER (ADMIN ONLY) */}
      {showApprovalDrawer && selectedCell && user?.role === 'admin' && (
        <div className="fixed inset-y-0 right-0 w-full max-w-md bg-white dark:bg-slate-900 border-l border-slate-200/50 dark:border-white/5 z-50 shadow-2xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-200/50 dark:border-white/5 mb-6">
              <h3 className="font-bold text-sm text-slate-800 dark:text-white">จัดการระดับทักษะ & ตรวจรับรอง (Admin Only)</h3>
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

              {/* Assign/Approve Form (Visible ONLY FOR ADMIN) */}
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

                <div className="pt-4 border-t border-slate-200/50 dark:border-white/5 space-y-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCert({
                        certificate_number: `SWAN-CERT-2026-${Math.floor(100000 + Math.random() * 900000)}`,
                        recipient_name: selectedCell.employee?.name || 'พนักงานคลังสินค้า',
                        employee_id: selectedCell.employee?.employee_id || 'EMP001',
                        title: `การรับรองความเชี่ยวชาญทักษะ ${selectedCell.skill?.name || 'คลังสินค้า'}`,
                        type: 'skill',
                        issued_date: new Date().toISOString().split('T')[0],
                        issuer_name: 'คุณประธาน  สวอนอินดัสตรีส์',
                        issuer_title: 'Warehouse Operations Manager',
                        skill_level: `Level ${selectedCell.record?.level || '5'} Expert`
                      });
                      setShowCertModal(true);
                    }}
                    className="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-extrabold shadow-md shadow-emerald-500/20 transition-all flex items-center justify-center gap-1.5"
                  >
                    <Award size={15} />
                    <span>📜 ออก/พิมพ์ใบรับรองความเชี่ยวชาญ (View Certificate)</span>
                  </button>

                  <div className="flex gap-3">
                    {/* Approve button for Admin */}
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
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Certificate Modal */}
      <CertificateModal
        isOpen={showCertModal}
        onClose={() => setShowCertModal(false)}
        certificate={selectedCert}
      />

    </div>
  );
}
