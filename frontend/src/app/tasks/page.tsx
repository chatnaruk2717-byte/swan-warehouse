'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import GlassCard from '../../components/GlassCard';
import { 
  Briefcase, 
  Search, 
  Filter, 
  Plus, 
  X, 
  Check, 
  AlertTriangle, 
  Clock, 
  CheckCircle2,
  Sliders,
  Upload
} from 'lucide-react';

export default function TasksPage() {
  const { api, user } = useAuth();
  const [tasks, setTasks] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modals / Sliders
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showProgressSlider, setShowProgressSlider] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  
  // Proof of work and review states
  const [proofFile, setProofFile] = useState<string | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedReviewTask, setSelectedReviewTask] = useState<any>(null);
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  // Form states
  const [taskForm, setTaskForm] = useState({
    employee_id: '',
    task_name: '',
    category: 'Kaizen',
    description: '',
    due_date: new Date().toISOString().split('T')[0]
  });

  const [selectedEmpIds, setSelectedEmpIds] = useState<number[]>([]);
  const [assignAll, setAssignAll] = useState<boolean>(false);
  const [progressVal, setProgressVal] = useState<number>(0);

  const loadData = async () => {
    try {
      const tasksRes = await api.get('/api/tasks');
      setTasks(tasksRes.data);

      if (user && user.role !== 'employee') {
        const empRes = await api.get('/api/employees');
        setEmployees(empRes.data.filter((e: any) => e.role === 'employee'));
      }
    } catch (err) {
      console.warn('API error loading tasks, fallback to mock lists.');
      // Mock daily tasks matching seeds
      const mockTasksList = [
        { id: 1, employee_id: 6, employee_name: 'สมปอง ลุยงาน', emp_code: 'EMP006', task_name: 'ขับย้ายพาเลทพัสดุโซนสินค้าขาเข้า', category: 'Put Away', description: 'ย้ายพาเลทนำเข้าจากตู้คอนเทนเนอร์ 15 พาเลท ไปจัดวางชั้น A4 ถึง A12', status: 'completed', progress_percentage: 100, supervisor_approved: true, approved_by_name: 'ประพันธ์ ยอดคุม', due_date: '2026-06-29' },
        { id: 2, employee_id: 6, employee_name: 'สมปอง ลุยงาน', emp_code: 'EMP006', task_name: 'ตรวจสอบสภาพรถยกไฟฟ้า Forklift #04', category: 'Forklift', description: 'ทำเช็กลิสต์ ตรวจแบตและเติมน้ำกลั่น', status: 'completed', progress_percentage: 100, supervisor_approved: true, approved_by_name: 'ประพันธ์ ยอดคุม', due_date: '2026-06-29' },
        { id: 3, employee_id: 7, employee_name: 'อรอนงค์ แพ็กเก่ง', emp_code: 'EMP007', task_name: 'แพ็กกล่องสินค้าออเดอร์ด่วนแคมเปญ 7.7', category: 'Packing', description: 'เร่งห่อหุ้มกันกระแทก 120 ออเดอร์', status: 'in_progress', progress_percentage: 65, supervisor_approved: false, due_date: '2026-06-29' },
        { id: 4, employee_id: 8, employee_name: 'มานะ คัดของ', emp_code: 'EMP008', task_name: 'หยิบสินค้าอุปโภคบริโภคตามใบสั่งซื้อ Zone B', category: 'Picking', description: 'หยิบตาม RF Scanner 80 รายการ', status: 'in_progress', progress_percentage: 40, supervisor_approved: false, due_date: '2026-06-29' }
      ];
      
      if (user?.role === 'employee') {
        setTasks(mockTasksList.filter(t => t.employee_id === user.id));
      } else {
        setTasks(mockTasksList);
        setEmployees([
          { id: 6, employee_id: 'EMP006', name: 'สมปอง ลุยงาน' },
          { id: 7, employee_id: 'EMP007', name: 'อรอนงค์ แพ็กเก่ง' },
          { id: 8, employee_id: 'EMP008', name: 'มานะ คัดของ' }
        ]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedEmpIds.length === 0) {
      alert('กรุณาเลือกพนักงานผู้รับผิดชอบอย่างน้อย 1 คน');
      return;
    }

    try {
      const res = await api.post('/api/tasks', {
        ...taskForm,
        employee_ids: selectedEmpIds
      });
      const newTasks = Array.isArray(res.data) ? res.data : [res.data];
      const resolvedTasks = newTasks.map((t: any) => {
        const emp = employees.find(e => e.id === t.employee_id);
        return {
          ...t,
          employee_name: emp ? emp.name : 'Unknown',
          emp_code: emp ? emp.employee_id : ''
        };
      });
      setTasks([...resolvedTasks, ...tasks]);
      setShowCreateModal(false);
      resetTaskForm();
    } catch {
      // Mock append
      const mockNewTasks = selectedEmpIds.map(empId => {
        const emp = employees.find(e => e.id === empId);
        return {
          id: Date.now() + Math.random(),
          employee_id: empId,
          employee_name: emp ? emp.name : 'Unknown',
          emp_code: emp ? emp.employee_id : '',
          task_name: taskForm.task_name,
          category: taskForm.category,
          description: taskForm.description,
          status: 'pending' as const,
          progress_percentage: 0,
          supervisor_approved: false,
          due_date: taskForm.due_date
        };
      });
      setTasks([...mockNewTasks, ...tasks]);
      setShowCreateModal(false);
      resetTaskForm();
    }
  };

  const handleUpdateProgress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTask) return;

    try {
      await api.put(`/api/tasks/${selectedTask.id}/progress`, {
        progress_percentage: progressVal,
        proof_file: proofFile
      });
      loadData();
      setShowProgressSlider(false);
      setProofFile(null);
    } catch {
      // Mock update
      setTasks(tasks.map(t => {
        if (t.id === selectedTask.id) {
          const status = progressVal === 100 ? 'completed' : progressVal > 0 ? 'in_progress' : 'pending';
          return {
            ...t,
            progress_percentage: progressVal,
            status,
            proof_file: proofFile || undefined
          };
        }
        return t;
      }));
      setShowProgressSlider(false);
      setProofFile(null);
    }
  };

  const handleSubmitTaskProof = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTask || !proofFile) {
      alert('กรุณาแนบไฟล์หลักฐานรูปภาพ หรือ PDF ก่อนส่งงาน');
      return;
    }

    try {
      await api.put(`/api/tasks/${selectedTask.id}/progress`, {
        progress_percentage: 100,
        proof_file: proofFile
      });
      loadData();
      setShowSubmitModal(false);
      setProofFile(null);
      alert('ส่งงานและอัปโหลดหลักฐานสำเร็จแล้ว! รอหัวหน้างานอนุมัติ');
    } catch {
      // Mock update
      setTasks(tasks.map(t => {
        if (t.id === selectedTask.id) {
          return {
            ...t,
            progress_percentage: 100,
            status: 'completed',
            proof_file: proofFile || undefined
          };
        }
        return t;
      }));
      setShowSubmitModal(false);
      setProofFile(null);
      alert('ส่งงานและอัปโหลดหลักฐานสำเร็จแล้ว (Mock)! รอหัวหน้างานอนุมัติ');
    }
  };

  const handleApproveTask = async (taskId: number) => {
    try {
      await api.post(`/api/tasks/${taskId}/approve`);
      loadData();
      setShowReviewModal(false);
      setSelectedReviewTask(null);
    } catch {
      // Mock approve
      setTasks(tasks.map(t => {
        if (t.id === taskId) {
          return {
            ...t,
            supervisor_approved: true,
            approved_by_name: user?.name || 'Supervisor'
          };
        }
        return t;
      }));
      setShowReviewModal(false);
      setSelectedReviewTask(null);
    }
  };

  const handleRejectTask = async (taskId: number) => {
    try {
      await api.post(`/api/tasks/${taskId}/reject`);
      loadData();
      setShowReviewModal(false);
      setSelectedReviewTask(null);
      alert('ส่งคืนงานให้แก้ไขเรียบร้อยแล้ว');
    } catch {
      // Mock reject
      setTasks(tasks.map(t => {
        if (t.id === taskId) {
          return {
            ...t,
            supervisor_approved: false,
            status: 'in_progress',
            progress_percentage: 50,
            proof_file: undefined
          };
        }
        return t;
      }));
      setShowReviewModal(false);
      setSelectedReviewTask(null);
      alert('ส่งคืนงานให้แก้ไขเรียบร้อยแล้ว (Mock)');
    }
  };

  const resetTaskForm = () => {
    setTaskForm({
      employee_id: '',
      task_name: '',
      category: 'Kaizen',
      description: '',
      due_date: new Date().toISOString().split('T')[0]
    });
    setSelectedEmpIds([]);
    setAssignAll(false);
  };

  const openSlider = (task: any) => {
    setSelectedTask(task);
    setProgressVal(task.progress_percentage);
    setProofFile(task.proof_file || null);
    setShowProgressSlider(true);
  };

  // Status visual helper
  const getStatusBadge = (status: string, approved: boolean) => {
    if (approved) return 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20';
    if (status === 'completed') return 'bg-sky-500/10 text-sky-500 border border-sky-500/20';
    if (status === 'in_progress') return 'bg-amber-500/10 text-amber-500 border border-amber-500/20';
    return 'bg-slate-100/60 dark:bg-white/5 text-slate-400';
  };

  const getStatusLabel = (status: string, approved: boolean) => {
    if (approved) return 'ตรวจสอบแล้ว (Approved)';
    if (status === 'completed') return 'รออนุมัติ (Pending Review)';
    if (status === 'in_progress') return 'กำลังดำเนินงาน';
    return 'ค้างส่ง (Pending)';
  };

  const filteredTasks = tasks.filter(t => {
    const matchesSearch = t.task_name.toLowerCase().includes(search.toLowerCase()) || 
                          (t.employee_name && t.employee_name.toLowerCase().includes(search.toLowerCase()));
    
    const matchesStatus = statusFilter 
      ? (statusFilter === 'approved' ? t.supervisor_approved : t.status === statusFilter && !t.supervisor_approved)
      : true;

    return matchesSearch && matchesStatus;
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
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">บอร์ดมอบหมายงานคลังสินค้า (Daily Tasks)</h2>
          <p className="text-slate-400 text-sm mt-1">ติดตามประวัติความก้าวหน้าการทำงานของพนักงานแยกรายหมวดหมู่แบบครบวงจร</p>
        </div>
        {user && ['admin', 'staff'].includes(user.role) && (
          <button 
            onClick={() => { resetTaskForm(); setShowCreateModal(true); }}
            className="px-4 py-2.5 rounded-xl bg-warehouse-orange hover:bg-warehouse-orange/90 text-white text-xs font-bold flex items-center gap-1 shadow-md shadow-warehouse-orange/15"
          >
            <Plus size={14} />
            <span>มอบหมายงาน (Assign Task)</span>
          </button>
        )}
      </div>

      {/* Filters */}
      <GlassCard className="flex flex-col md:flex-row gap-4 items-center justify-between">
        
        {/* Search */}
        <div className="w-full md:w-80 relative flex items-center">
          <Search className="absolute left-4 text-slate-400" size={16} />
          <input
            type="text"
            placeholder={user?.role === 'employee' ? "ค้นหาชื่องาน..." : "ค้นหาชื่องาน หรือ ชื่อพนักงาน..."}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white/70 dark:bg-warehouse-slate/50 border border-slate-200 dark:border-white/10 rounded-xl text-slate-700 dark:text-white outline-none focus:border-warehouse-orange text-xs"
          />
        </div>

        {/* Dropdowns */}
        <div className="flex items-center gap-2">
          <Filter size={14} className="text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-white/70 dark:bg-warehouse-slate/50 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2.5 text-xs text-slate-700 dark:text-white outline-none focus:border-warehouse-orange"
          >
            <option value="">สถานะงานทั้งหมด</option>
            <option value="pending">งานที่ยังไม่ทำ</option>
            <option value="in_progress">งานกำลังทำ</option>
            <option value="completed">งานที่เรียนจบแต่รออนุมัติ</option>
            <option value="approved">งานที่อนุมัติแล้ว</option>
          </select>
        </div>

      </GlassCard>

      {/* Tasks Table List */}
      <div className="grid grid-cols-1 gap-6">
        {filteredTasks.map((task) => (
          <GlassCard key={task.id} hoverEffect className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border border-slate-200/50 dark:border-white/5">
            
            {/* Task core details */}
            <div className="min-w-0 flex-1 space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[9px] uppercase font-bold text-warehouse-orange bg-warehouse-orange/10 px-2 py-0.5 rounded">
                  {task.category}
                </span>
                <span className="text-[10px] text-slate-400 font-medium">กำหนดส่ง: {task.due_date}</span>
                {task.employee_name && user?.role !== 'employee' && (
                  <span className="text-[10px] text-warehouse-navy dark:text-sky-400 font-semibold">• พนักงาน: {task.employee_name} ({task.emp_code})</span>
                )}
              </div>
              <h4 className="font-bold text-sm text-slate-800 dark:text-white truncate">
                {task.task_name}
              </h4>
              <p className="text-slate-400 text-xs line-clamp-1">{task.description || 'ไม่มีคำอธิบายเพิ่มเติม'}</p>
            </div>

            {/* Task stats indicators */}
            <div className="w-full md:w-auto flex flex-wrap items-center justify-between md:justify-end gap-6 shrink-0 border-t md:border-t-0 border-slate-100 dark:border-white/5 pt-4 md:pt-0">
              
              {/* Progress Bar */}
              <div className="w-36">
                <div className="flex justify-between text-[10px] font-bold mb-1">
                  <span className="text-slate-400">คืบหน้า</span>
                  <span className="text-slate-600 dark:text-slate-200 font-mono">{task.progress_percentage}%</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-warehouse-orange h-full rounded-full transition-all duration-300" style={{ width: `${task.progress_percentage}%` }} />
                </div>
              </div>

              {/* Status Badge */}
              <span className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold shrink-0 ${getStatusBadge(task.status, task.supervisor_approved)}`}>
                {getStatusLabel(task.status, task.supervisor_approved)}
              </span>

              {/* Action Buttons */}
              <div className="flex gap-2">
                {user?.role === 'employee' && !task.supervisor_approved && (
                  <>
                    <button 
                      onClick={() => openSlider(task)}
                      className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-500 dark:text-slate-400 transition-colors border border-slate-200/50 dark:border-white/5 flex items-center gap-1 text-[10px] font-bold"
                    >
                      <Sliders size={14} />
                      <span>ปรับเป้า</span>
                    </button>
                    <button 
                      onClick={() => { setSelectedTask(task); setProofFile(task.proof_file || null); setShowSubmitModal(true); }}
                      className="p-2 rounded-xl bg-warehouse-orange hover:bg-warehouse-orange/95 text-white transition-all flex items-center gap-1 text-[10px] font-bold shadow-md shadow-warehouse-orange/15"
                    >
                      <Upload size={14} />
                      <span>ส่งไฟล์งาน</span>
                    </button>
                  </>
                )}
                {user && ['admin', 'staff'].includes(user.role) && task.status === 'completed' && !task.supervisor_approved && (
                  <button 
                    onClick={() => { setSelectedReviewTask(task); setShowReviewModal(true); }}
                    className="px-3 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-[10px] font-bold transition-all shadow-sm flex items-center gap-1"
                  >
                    <Check size={14} />
                    <span>ตรวจและอนุมัติงาน</span>
                  </button>
                )}
              </div>

            </div>

          </GlassCard>
        ))}

        {filteredTasks.length === 0 && (
          <p className="text-slate-400 text-xs py-20 text-center">ไม่มีภารกิจคลังสินค้าตามเงื่อนไขค้นหา</p>
        )}
      </div>

      {/* CREATE TASK MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <GlassCard className="w-full max-w-md overflow-hidden border border-white/10" animate={false}>
            <div className="flex items-center justify-between pb-4 border-b border-slate-200/50 dark:border-white/5 mb-6">
              <h3 className="font-bold text-base">มอบหมายภารกิจคลังใหม่</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleCreateTask} className="space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400">ชื่อภารกิจ / รายละเอียดงาน</label>
                <input type="text" required value={taskForm.task_name} onChange={(e) => setTaskForm({ ...taskForm, task_name: e.target.value })} className="glass-input text-xs" placeholder="เคลื่อนย้ายพาเลท Zone B" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-400">หมวดหมู่งาน</label>
                  <select value={taskForm.category} onChange={(e) => setTaskForm({ ...taskForm, category: e.target.value })} className="glass-input text-xs bg-white dark:bg-warehouse-slate">
                    <option value="Kaizen">Kaizen</option>
                    <option value="OPL">OPL</option>
                    <option value="NearMiss">NearMiss</option>
                    <option value="KYT">KYT</option>
                    <option value="FI">FI</option>
                    <option value="อื่นๆ">อื่นๆ</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-bold text-slate-400">พนักงานผู้รับผิดชอบ</label>
                    <label className="flex items-center gap-1.5 text-[10px] font-bold text-warehouse-orange cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={assignAll}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          setAssignAll(checked);
                          if (checked) {
                            setSelectedEmpIds(employees.map(emp => emp.id));
                          } else {
                            setSelectedEmpIds([]);
                          }
                        }}
                        className="rounded text-warehouse-orange focus:ring-warehouse-orange border-slate-300 dark:border-white/10 w-3 h-3"
                      />
                      <span>ทั้งหมด (All)</span>
                    </label>
                  </div>
                  
                  <div className="border border-slate-200 dark:border-white/10 rounded-xl p-2 max-h-28 overflow-y-auto space-y-1 bg-white/50 dark:bg-warehouse-slate/30">
                    {employees.map(emp => {
                      const isChecked = selectedEmpIds.includes(emp.id);
                      return (
                        <label key={emp.id} className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-200 cursor-pointer hover:bg-slate-50 dark:hover:bg-white/5 p-1 rounded transition-colors">
                          <input 
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              let updated;
                              if (e.target.checked) {
                                updated = [...selectedEmpIds, emp.id];
                                setSelectedEmpIds(updated);
                                if (updated.length === employees.length) {
                                  setAssignAll(true);
                                }
                              } else {
                                updated = selectedEmpIds.filter(id => id !== emp.id);
                                setSelectedEmpIds(updated);
                                setAssignAll(false);
                              }
                            }}
                            className="rounded text-warehouse-orange focus:ring-warehouse-orange border-slate-300 dark:border-white/10 w-3.5 h-3.5"
                          />
                          <span className="truncate">{emp.name} ({emp.employee_id})</span>
                        </label>
                      );
                    })}
                    {employees.length === 0 && (
                      <p className="text-[10px] text-slate-400 text-center py-2">ไม่พบรายชื่อพนักงาน</p>
                    )}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5 col-span-2">
                  <label className="text-[10px] font-bold text-slate-400">กำหนดส่งงาน (Due Date)</label>
                  <input type="date" required value={taskForm.due_date} onChange={(e) => setTaskForm({ ...taskForm, due_date: e.target.value })} className="glass-input text-xs" />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200/50 dark:border-white/5">
                <button type="button" onClick={() => setShowCreateModal(false)} className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-xs font-semibold">ยกเลิก</button>
                <button type="submit" className="px-4 py-2 rounded-xl bg-warehouse-orange hover:bg-warehouse-orange/90 text-white text-xs font-bold shadow-md shadow-warehouse-orange/15">สั่งงาน</button>
              </div>
            </form>
          </GlassCard>
        </div>
      )}

      {/* UPDATE PROGRESS SLIDER DRAWER */}
      {showProgressSlider && selectedTask && (
        <div className="fixed inset-y-0 right-0 w-full max-w-sm bg-white dark:bg-slate-900 border-l border-slate-200/50 dark:border-white/5 z-50 shadow-2xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-200/50 dark:border-white/5 mb-6">
              <h3 className="font-bold text-sm text-slate-800 dark:text-white">อัปเดตความคืบหน้าภารกิจ</h3>
              <button onClick={() => setShowProgressSlider(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5">
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={handleUpdateProgress} className="space-y-6">
              <div className="p-4 bg-slate-50 dark:bg-white/5 border border-slate-200/50 dark:border-white/5 rounded-2xl">
                <span className="text-[9px] uppercase font-bold text-warehouse-orange">{selectedTask.category}</span>
                <h4 className="font-bold text-sm text-slate-700 dark:text-slate-200 mt-1">{selectedTask.task_name}</h4>
              </div>

              <div className="flex flex-col gap-3">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-400">ระบุความคืบหน้า (%)</span>
                  <span className="text-warehouse-orange text-sm font-mono">{progressVal}%</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  step="5"
                  value={progressVal}
                  onChange={(e) => setProgressVal(parseInt(e.target.value, 10))}
                  className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-warehouse-orange"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-1">
                  <span>0%</span>
                  <span>50%</span>
                  <span>100% (ส่งงานตรวจ)</span>
                </div>
              </div>

              {progressVal === 100 && (
                <div className="flex flex-col gap-2.5 p-3.5 bg-slate-50 dark:bg-white/5 border border-slate-200/50 dark:border-white/5 rounded-2xl">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">แนบหลักฐานความสำเร็จ (รูปภาพ หรือ PDF)</label>
                  <input 
                    type="file" 
                    accept="image/*,application/pdf"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => setProofFile(reader.result as string);
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="text-[11px] text-slate-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-[10px] file:font-bold file:bg-warehouse-orange/10 file:text-warehouse-orange hover:file:bg-warehouse-orange/20 cursor-pointer"
                  />
                  {proofFile && (
                    <span className="text-[10px] text-emerald-500 font-bold">✓ อัปโหลดไฟล์หลักฐานสำเร็จ</span>
                  )}
                </div>
              )}

              <button 
                type="submit"
                className="w-full py-3 bg-warehouse-orange hover:bg-warehouse-orange/95 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-warehouse-orange/15"
              >
                บันทึกอัปเดตงาน
              </button>
            </form>
          </div>

          <button 
            onClick={() => setShowProgressSlider(false)}
            className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-white rounded-xl text-xs font-bold transition-all text-center"
          >
            ปิดหน้าต่าง
          </button>
        </div>
      )}

      {/* REVIEW TASK PROOF & APPROVE MODAL */}
      {showReviewModal && selectedReviewTask && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <GlassCard className="w-full max-w-md overflow-hidden border border-white/10" animate={false}>
            <div className="flex items-center justify-between pb-4 border-b border-slate-200/50 dark:border-white/5 mb-6">
              <h3 className="font-bold text-base">ตรวจประเมินผลงาน (Review Task Proof)</h3>
              <button onClick={() => { setShowReviewModal(false); setSelectedReviewTask(null); }} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <X size={18} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="p-3.5 bg-slate-50 dark:bg-white/5 border border-slate-200/50 dark:border-white/5 rounded-2xl space-y-1.5 text-xs">
                <div>
                  <span className="text-[9px] uppercase font-bold text-warehouse-orange">{selectedReviewTask.category}</span>
                  <h4 className="font-bold text-slate-800 dark:text-white text-sm mt-0.5">{selectedReviewTask.task_name}</h4>
                </div>
                <p className="text-slate-400 leading-relaxed text-[11px]">{selectedReviewTask.description || 'ไม่มีคำอธิบายเพิ่มเติม'}</p>
                <div className="pt-2 border-t border-slate-100 dark:border-white/5 flex justify-between text-[10px] text-slate-400 font-semibold">
                  <span>ผู้รับผิดชอบ: {selectedReviewTask.employee_name || 'พนักงาน'}</span>
                  <span>กำหนดส่ง: {selectedReviewTask.due_date}</span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">หลักฐานการทำภารกิจสำเร็จ (Proof File)</label>
                {selectedReviewTask.proof_file ? (
                  <div className="border border-slate-200/50 dark:border-white/5 rounded-2xl overflow-hidden bg-slate-100 dark:bg-white/5 p-2 flex flex-col items-center justify-center min-h-[160px]">
                    {selectedReviewTask.proof_file.startsWith('data:image/') ? (
                      <img src={selectedReviewTask.proof_file} alt="Task Proof Preview" className="w-full max-h-48 object-contain rounded-xl" />
                    ) : (
                      <div className="text-center py-6 space-y-3">
                        <span className="text-3xl">📄</span>
                        <p className="text-xs text-slate-400">ไฟล์หลักฐานรูปแบบเอกสาร PDF</p>
                        <a 
                          href={selectedReviewTask.proof_file} 
                          download={`proof-task-${selectedReviewTask.id}.pdf`}
                          className="inline-block px-4 py-2 bg-warehouse-orange hover:bg-warehouse-orange/95 text-white text-[10px] font-bold rounded-xl shadow-sm transition-all"
                        >
                          ดาวน์โหลดหลักฐาน PDF
                        </a>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="py-10 text-center bg-slate-50 dark:bg-white/5 border border-slate-200/50 dark:border-white/5 rounded-2xl text-[11px] text-slate-400">
                    ⚠️ พนักงานไม่ได้แนบไฟล์ภาพหรือ PDF ประกอบภารกิจนี้
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200/50 dark:border-white/5">
                <button 
                  onClick={() => { setShowReviewModal(false); setSelectedReviewTask(null); }} 
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-xs font-semibold mr-auto"
                >
                  ปิดหน้าต่าง
                </button>
                <button 
                  onClick={() => handleRejectTask(selectedReviewTask.id)} 
                  className="px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold shadow-md shadow-rose-500/15"
                >
                  ไม่ผ่าน (Reject)
                </button>
                <button 
                  onClick={() => handleApproveTask(selectedReviewTask.id)} 
                  className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold shadow-md shadow-emerald-500/15"
                >
                  อนุมัติผ่าน (Approve)
                </button>
              </div>
            </div>
          </GlassCard>
        </div>
      )}
      {/* EMPLOYEE SUBMIT WORK MODAL */}
      {showSubmitModal && selectedTask && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <GlassCard className="w-full max-w-md overflow-hidden border border-white/10" animate={false}>
            <div className="flex items-center justify-between pb-4 border-b border-slate-200/50 dark:border-white/5 mb-6">
              <h3 className="font-bold text-base">ส่งมอบไฟล์งาน (Submit Task File)</h3>
              <button onClick={() => { setShowSubmitModal(false); setSelectedTask(null); setProofFile(null); }} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={handleSubmitTaskProof} className="space-y-6">
              <div className="p-3.5 bg-slate-50 dark:bg-white/5 border border-slate-200/50 dark:border-white/5 rounded-2xl">
                <span className="text-[9px] uppercase font-bold text-warehouse-orange">{selectedTask.category}</span>
                <h4 className="font-bold text-slate-800 dark:text-white text-sm mt-0.5">{selectedTask.task_name}</h4>
                <p className="text-slate-400 text-xs mt-1 leading-relaxed">{selectedTask.description || 'ไม่มีคำอธิบายเพิ่มเติม'}</p>
              </div>

              <div className="flex flex-col gap-2.5 p-4 bg-slate-50 dark:bg-white/5 border border-slate-200/50 dark:border-white/5 rounded-2xl">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">อัปโหลดหลักฐานความสำเร็จ (รูปภาพ หรือ PDF)</label>
                <input 
                  type="file" 
                  accept="image/*,application/pdf"
                  required
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => setProofFile(reader.result as string);
                      reader.readAsDataURL(file);
                    }
                  }}
                  className="text-[11px] text-slate-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-[10px] file:font-bold file:bg-warehouse-orange/10 file:text-warehouse-orange hover:file:bg-warehouse-orange/20 cursor-pointer w-full"
                />
                
                {proofFile && (
                  <div className="mt-3 border-t border-slate-200/50 dark:border-white/5 pt-3">
                    <span className="text-[10px] text-emerald-500 font-bold flex items-center gap-1">
                      <span>✓</span>
                      <span>เลือกไฟล์หลักฐานความสำเร็จเรียบร้อยแล้ว</span>
                    </span>
                    {proofFile.startsWith('data:image/') ? (
                      <img src={proofFile} alt="Preview" className="mt-2 w-full max-h-32 object-contain rounded-lg border border-slate-200/30" />
                    ) : (
                      <div className="mt-2 p-2 bg-slate-200/50 dark:bg-white/5 rounded-lg text-[10px] font-mono truncate text-slate-500">
                        📄 PDF เอกสารหลักฐานที่เลือก
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200/50 dark:border-white/5">
                <button 
                  type="button" 
                  onClick={() => { setShowSubmitModal(false); setSelectedTask(null); setProofFile(null); }} 
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-xs font-semibold"
                >
                  ยกเลิก
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 rounded-xl bg-warehouse-orange hover:bg-warehouse-orange/90 text-white text-xs font-bold shadow-md shadow-warehouse-orange/15"
                >
                  ส่งงานไปยังหัวหน้างาน
                </button>
              </div>
            </form>
          </GlassCard>
        </div>
      )}

    </div>
  );
}
