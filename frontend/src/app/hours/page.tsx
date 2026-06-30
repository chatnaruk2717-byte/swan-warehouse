'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import GlassCard from '../../components/GlassCard';
import { 
  Clock, 
  Play, 
  Square, 
  Calendar, 
  TrendingUp, 
  Coffee,
  AlertTriangle,
  CheckCircle2,
  FileSpreadsheet,
  X
} from 'lucide-react';

export default function AttendancePage() {
  const { api, user } = useAuth();
  const [logs, setLogs] = useState<any[]>([]);
  const [todayLog, setTodayLog] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [employees, setEmployees] = useState<any[]>([]);

  // Manual hours states
  const [showManualModal, setShowManualModal] = useState(false);
  const [manualForm, setManualForm] = useState({
    employee_id: '',
    date: new Date().toISOString().split('T')[0],
    clock_in: '08:00',
    clock_out: '17:00',
    status: 'present',
    ot_hours: '0'
  });

  // Stats
  const [stats, setStats] = useState({
    monthlyHours: 168.5,
    monthlyOT: 14.5,
    lateDays: 1,
    attendanceRate: 98
  });

  const loadData = async () => {
    if (!user) return;
    try {
      const todayRes = await api.get('/api/attendance/today');
      setTodayLog(todayRes.data);

      const logsRes = await api.get(`/api/attendance/employee/${user.id}`);
      setLogs(logsRes.data);

      if (user.role !== 'employee') {
        const empRes = await api.get('/api/employees');
        setEmployees(empRes.data.filter((e: any) => e.role === 'employee'));
      }
    } catch {
      console.warn('API error loading attendance logs, fallback to mock lists.');
      // Mock history log
      const dateOffset = (days: number) => {
        const d = new Date();
        d.setDate(d.getDate() - days);
        return d.toISOString().split('T')[0];
      };

      const mockLogsList = [
        { id: 1, employee_id: user?.id, clock_in: '2026-06-29T07:55:00.000Z', clock_out: null, date: '2026-06-29', status: 'present', ot_hours: 0 },
        { id: 2, employee_id: user?.id, clock_in: '2026-06-28T07:48:00.000Z', clock_out: '2026-06-28T17:15:00.000Z', date: '2026-06-28', status: 'present', ot_hours: 1.25 },
        { id: 3, employee_id: user?.id, clock_in: '2026-06-27T08:05:00.000Z', clock_out: '2026-06-27T17:00:00.000Z', date: '2026-06-27', status: 'late', ot_hours: 0 },
        { id: 4, employee_id: user?.id, clock_in: '2026-06-26T07:52:00.000Z', clock_out: '2026-06-26T17:00:00.000Z', date: '2026-06-26', status: 'present', ot_hours: 0 },
        { id: 5, employee_id: user?.id, clock_in: '2026-06-25T07:58:00.000Z', clock_out: '2026-06-25T19:00:00.000Z', date: '2026-06-25', status: 'present', ot_hours: 2 }
      ];

      setLogs(mockLogsList);
      setTodayLog(mockLogsList[0]);

      if (user.role !== 'employee') {
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

  const handleClockIn = async () => {
    try {
      const res = await api.post('/api/attendance/clock-in');
      setTodayLog(res.data);
      loadData();
      alert('ลงชื่อเข้างานเสร็จสิ้น');
    } catch {
      // Mock clockin
      const mockRecord = {
        id: Date.now(),
        employee_id: user?.id!,
        clock_in: new Date().toISOString(),
        date: new Date().toISOString().split('T')[0],
        status: new Date().getHours() > 8 ? 'late' as const : 'present' as const,
        ot_hours: 0
      };
      setTodayLog(mockRecord);
      setLogs([mockRecord, ...logs]);
      alert('ลงชื่อเข้างานเสร็จสิ้น (Mock)');
    }
  };

  const handleClockOut = async () => {
    try {
      const res = await api.post('/api/attendance/clock-out');
      setTodayLog(res.data);
      loadData();
      alert('ลงชื่อออกงานเสร็จสิ้น');
    } catch {
      // Mock clockout
      if (!todayLog) return;
      const updated = {
        ...todayLog,
        clock_out: new Date().toISOString(),
        ot_hours: new Date().getHours() > 17 ? new Date().getHours() - 17 : 0
      };
      setTodayLog(updated);
      setLogs(logs.map(l => l.date === updated.date ? updated : l));
      alert('ลงชื่อออกงานเสร็จสิ้น (Mock)');
    }
  };

  const handleImportCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target?.result as string;
      if (!text) return;

      const lines = text.split('\n');
      const records: any[] = [];
      const startIdx = lines[0].includes('employee_id') ? 1 : 0;

      for (let i = startIdx; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        const parts = line.split(',');
        if (parts.length >= 3) {
          records.push({
            employee_id: parts[0].trim(),
            date: parts[1].trim(),
            clock_in: parts[2].trim(),
            clock_out: parts[3] ? parts[3].trim() : undefined,
            status: parts[4] ? parts[4].trim() : 'present',
            ot_hours: parts[5] ? parseFloat(parts[5].trim()) || 0 : 0
          });
        }
      }

      if (records.length === 0) {
        alert('ไม่พบข้อมูลเวลาทำงานในไฟล์ หรือไฟล์ฟอร์แมตไม่ถูกต้อง');
        return;
      }

      try {
        await api.post('/api/attendance/import', { records });
        alert(`นำเข้าข้อมูลเวลางานสำเร็จจำนวน ${records.length} รายการ`);
        loadData();
      } catch {
        // Mock fallback
        alert(`นำเข้าข้อมูลเวลางานสำเร็จจำนวน ${records.length} รายการ (Mock)`);
        loadData();
      }
    };
    reader.readAsText(file);
  };

  const handleSaveManualAttendance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualForm.employee_id || !manualForm.date || !manualForm.clock_in) return;
    
    const clockInISO = `${manualForm.date}T${manualForm.clock_in}:00.000Z`;
    const clockOutISO = manualForm.clock_out ? `${manualForm.date}T${manualForm.clock_out}:00.000Z` : undefined;

    const payload = {
      employee_id: manualForm.employee_id,
      date: manualForm.date,
      clock_in: clockInISO,
      clock_out: clockOutISO,
      status: manualForm.status,
      ot_hours: parseFloat(manualForm.ot_hours) || 0
    };

    try {
      await api.post('/api/attendance/manual', payload);
      alert('บันทึกเวลาการทำงานด้วยตัวเองเสร็จสิ้น');
      setShowManualModal(false);
      loadData();
    } catch {
      alert('บันทึกเวลาทำงานเสร็จสิ้น (Mock)');
      setShowManualModal(false);
      loadData();
    }
  };

  const handleBreakToggle = async (type: 'start' | 'end') => {
    try {
      const res = await api.post(`/api/attendance/break-${type}`);
      setTodayLog(res.data);
    } catch {
      if (!todayLog) return;
      const updated = {
        ...todayLog,
        [type === 'start' ? 'break_start' : 'break_end']: new Date().toISOString()
      };
      setTodayLog(updated);
      alert(`บันทึกเวลา${type === 'start' ? 'พักเบรก' : 'กลับจากพักเบรก'}เสร็จสิ้น (Mock)`);
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'late': return 'สาย (Late)';
      case 'leave': return 'ลากิจ/ลาพักร้อน';
      case 'absent': return 'ขาดงาน';
      default: return 'ปกติ (Present)';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'late': return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
      case 'leave': return 'text-sky-500 bg-sky-500/10 border-sky-500/20';
      case 'absent': return 'text-rose-500 bg-rose-500/10 border-rose-500/20';
      default: return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
    }
  };

  if (loading) {
    return (
      <div className="flex-grow flex items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-4 border-slate-300 border-t-warehouse-orange rounded-full animate-spin" />
      </div>
    );
  }

  const isClockedIn = todayLog && todayLog.clock_in && !todayLog.clock_out;
  const isClockedOut = todayLog && todayLog.clock_out;
  const isOnBreak = todayLog && todayLog.break_start && !todayLog.break_end;

  return (
    <div className="space-y-8">
      
      {/* Header Info */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">การบันทึกเวลางาน (Attendance Portal)</h2>
          <p className="text-slate-400 text-sm mt-1">บันทึกเวลาเข้า-ออกงาน พักเบรก คิดคำนวณชั่วโมงล่วงเวลา และเช็กประวัติความประพฤติ</p>
        </div>
      </div>

      {user && ['admin', 'staff'].includes(user.role) && (
        <GlassCard className="border border-slate-200/50 dark:border-white/5 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="text-warehouse-orange" size={20} />
              <h3 className="font-bold text-sm text-slate-800 dark:text-white">เครื่องมือจัดการเวลางานพนักงาน (Attendance Manager Tools)</h3>
            </div>
            
            <div className="flex flex-wrap gap-3">
              <button 
                onClick={() => setShowManualModal(true)}
                className="px-4 py-2 rounded-xl bg-warehouse-orange hover:bg-warehouse-orange/90 text-white text-xs font-bold shadow-md shadow-warehouse-orange/15 flex items-center gap-1.5"
              >
                <span>เพิ่มเวลาเข้า-ออกงานด้วยตนเอง</span>
              </button>
              
              <label className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-white text-xs font-bold border border-slate-200/50 dark:border-white/5 flex items-center gap-1.5 cursor-pointer shadow-sm">
                <span>นำเข้าไฟล์เวลาทำงาน (Import CSV)</span>
                <input 
                  type="file" 
                  accept=".csv,.txt" 
                  className="hidden" 
                  onChange={handleImportCSV} 
                />
              </label>
            </div>
          </div>
        </GlassCard>
      )}

      {/* Grid: Actions & Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Card: Clock Actions */}
        <GlassCard className="lg:col-span-1 flex flex-col justify-between h-[360px] border border-slate-200/50 dark:border-white/5">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="text-warehouse-orange" size={20} />
            <h4 className="font-bold text-sm text-slate-800 dark:text-white">ลงเวลาทำงานกะวันนี้</h4>
          </div>

          {/* Clock Info Status */}
          <div className="text-center py-4 space-y-3">
            <span className={`inline-block px-3 py-1 rounded text-[10px] font-bold ${
              user?.working_shift === 'B' 
                ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/25' 
                : 'bg-amber-500/10 text-amber-500 border border-amber-500/25'
            }`}>
              กะทำงานของคุณ: {user?.working_shift === 'B' ? 'กะ B (ดึก 19:30 - 03:30)' : 'กะ A (เช้า 07:30 - 15:30)'}
            </span>

            {!todayLog ? (
              <p className="text-sm font-semibold text-slate-400 pt-2">ยังไม่มีการลงเวลาวันนี้</p>
            ) : isClockedIn ? (
              <div className="space-y-2">
                <span className="inline-block px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-xs font-bold pulse-green">
                  ปฏิบัติงานอยู่ (On Shift)
                </span>
                <p className="text-xs text-slate-400 font-medium">เข้างานเมื่อ: {new Date(todayLog.clock_in).toLocaleTimeString('th-TH')} น.</p>
              </div>
            ) : isClockedOut ? (
              <div className="space-y-2">
                <span className="inline-block px-3 py-1.5 rounded-full bg-slate-300 dark:bg-white/5 text-slate-400 text-xs font-bold">
                  เลิกงานแล้ว (Shift Ended)
                </span>
                <p className="text-xs text-slate-400 font-medium">ออกงานเมื่อ: {new Date(todayLog.clock_out).toLocaleTimeString('th-TH')} น. • ล่วงเวลา: {todayLog.ot_hours} ชม.</p>
              </div>
            ) : null}
          </div>

          {/* Action buttons */}
          <div className="space-y-3">
            {!todayLog && (
              <button 
                onClick={handleClockIn}
                className="w-full py-3.5 bg-gradient-to-r from-warehouse-orange to-amber-500 text-white rounded-2xl font-bold text-xs shadow-lg shadow-warehouse-orange/20 hover:opacity-95 transition-all flex items-center justify-center gap-1.5"
              >
                <Play size={16} />
                <span>ลงเวลาเข้างาน (Clock In)</span>
              </button>
            )}

            {isClockedIn && (
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => handleBreakToggle(isOnBreak ? 'end' : 'start')}
                  className="py-3.5 bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-white rounded-2xl font-bold text-xs transition-colors border border-slate-200/50 dark:border-white/5 flex items-center justify-center gap-1.5"
                >
                  <Coffee size={16} className="text-warehouse-orange" />
                  <span>{isOnBreak ? 'สิ้นสุดพักเบรก' : 'พักเบรก (Break)'}</span>
                </button>
                <button 
                  onClick={handleClockOut}
                  className="py-3.5 bg-rose-500 hover:bg-rose-600 text-white rounded-2xl font-bold text-xs shadow-lg shadow-rose-500/10 transition-colors flex items-center justify-center gap-1.5"
                >
                  <Square size={16} />
                  <span>ลงเวลาออก (Clock Out)</span>
                </button>
              </div>
            )}
          </div>
        </GlassCard>

        {/* Right Stats Grid */}
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
          
          <GlassCard className="flex items-center gap-5 border border-slate-200/50 dark:border-white/5 h-[168px]" hoverEffect>
            <div className="w-12 h-12 rounded-2xl bg-warehouse-orange/10 text-warehouse-orange flex items-center justify-center">
              <Calendar size={22} />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-bold">เวลางานสะสมเดือนนี้</p>
              <h3 className="text-2xl font-bold font-sans text-slate-800 dark:text-white mt-1">{stats.monthlyHours} ชม.</h3>
              <span className="text-[10px] text-slate-400 font-medium">เป้าหมายมาตรฐาน: 160 ชม.</span>
            </div>
          </GlassCard>

          <GlassCard className="flex items-center gap-5 border border-slate-200/50 dark:border-white/5 h-[168px]" hoverEffect>
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <TrendingUp size={22} />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-bold">โอทีสะสมเดือนนี้ (OT)</p>
              <h3 className="text-2xl font-bold font-sans text-slate-800 dark:text-white mt-1">{stats.monthlyOT} ชม.</h3>
            </div>
          </GlassCard>

          <GlassCard className="flex items-center gap-5 border border-slate-200/50 dark:border-white/5 h-[168px]" hoverEffect>
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <AlertTriangle size={22} />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-bold">จำนวนวันที่เข้างานสาย</p>
              <h3 className="text-2xl font-bold font-sans text-slate-800 dark:text-white mt-1">{stats.lateDays} วัน</h3>
              <span className="text-[10px] text-slate-400 font-medium">ลิมิตตักเตือน: 3 วัน/เดือน</span>
            </div>
          </GlassCard>

          <GlassCard className="flex items-center gap-5 border border-slate-200/50 dark:border-white/5 h-[168px]" hoverEffect>
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
              <CheckCircle2 size={22} />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-bold">อัตราความสม่ำเสมอ</p>
              <h3 className="text-2xl font-bold font-sans text-slate-800 dark:text-white mt-1">{stats.attendanceRate}%</h3>
            </div>
          </GlassCard>

        </div>

      </div>

      {/* Attendance History list */}
      <GlassCard className="p-0 overflow-hidden border border-slate-200/50 dark:border-white/5">
        <div className="px-6 py-4 border-b border-slate-200/50 dark:border-white/5 bg-slate-100/50 dark:bg-white/5 flex items-center justify-between">
          <h4 className="font-bold text-sm text-slate-800 dark:text-white flex items-center gap-2">
            <FileSpreadsheet size={16} className="text-warehouse-orange" />
            <span>ประวัติลงเวลาย้อนหลัง (Attendance Logs)</span>
          </h4>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200/50 dark:border-white/5 text-[10px] uppercase font-bold text-slate-400 tracking-wider bg-slate-50/50 dark:bg-white/5">
                <th className="px-6 py-3.5">วันที่</th>
                <th className="px-6 py-3.5">กะการทำงาน</th>
                <th className="px-6 py-3.5">ลงเวลาเข้างาน</th>
                <th className="px-6 py-3.5">ลงเวลาออกงาน</th>
                <th className="px-6 py-3.5">ทำงานล่วงเวลา (OT)</th>
                <th className="px-6 py-3.5">สถานะ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/50 dark:divide-white/5">
              {logs.map((log) => {
                const shift = log.working_shift || user?.working_shift || 'A';
                return (
                  <tr key={log.id} className="hover:bg-slate-100/25 dark:hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-200">{log.date}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        shift === 'B' 
                          ? 'bg-indigo-500/10 text-indigo-400' 
                          : 'bg-amber-500/10 text-amber-500'
                      }`}>
                        {shift === 'B' ? 'กะ B (ดึก)' : 'กะ A (เช้า)'}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono font-semibold text-slate-500">
                      {log.clock_in ? new Date(log.clock_in).toLocaleTimeString('th-TH') : '-'}
                    </td>
                    <td className="px-6 py-4 font-mono font-semibold text-slate-500">
                      {log.clock_out ? new Date(log.clock_out).toLocaleTimeString('th-TH') : '-'}
                    </td>
                    <td className="px-6 py-4 font-mono font-bold text-slate-600 dark:text-slate-300">{log.ot_hours || '0.00'} ชม.</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded text-[10px] font-bold border ${getStatusColor(log.status)}`}>
                        {getStatusLabel(log.status)}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {logs.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-400">ยังไม่มีประวัติเวลางานบันทึกในระบบ</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </GlassCard>

      {/* MANUAL ATTENDANCE MODAL */}
      {showManualModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <GlassCard className="w-full max-w-md overflow-hidden border border-white/10" animate={false}>
            <div className="flex items-center justify-between pb-4 border-b border-slate-200/50 dark:border-white/5 mb-6">
              <h3 className="font-bold text-base">เพิ่มเวลาการเข้า-ออกงานด้วยตนเอง</h3>
              <button onClick={() => setShowManualModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={handleSaveManualAttendance} className="space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400">เลือกพนักงาน (Employee)</label>
                <select 
                  required
                  value={manualForm.employee_id} 
                  onChange={(e) => setManualForm({ ...manualForm, employee_id: e.target.value })} 
                  className="glass-input text-xs bg-white dark:bg-warehouse-slate"
                >
                  <option value="">-- เลือกพนักงาน --</option>
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.name} ({emp.employee_id})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-400">วันที่ลงบันทึก</label>
                  <input 
                    type="date" 
                    required 
                    value={manualForm.date} 
                    onChange={(e) => setManualForm({ ...manualForm, date: e.target.value })} 
                    className="glass-input text-xs" 
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-400">สถานะกะงาน</label>
                  <select 
                    value={manualForm.status} 
                    onChange={(e) => setManualForm({ ...manualForm, status: e.target.value })} 
                    className="glass-input text-xs bg-white dark:bg-warehouse-slate"
                  >
                    <option value="present">ปกติ (Present)</option>
                    <option value="late">สาย (Late)</option>
                    <option value="leave">ลาพักร้อน/ลากิจ (Leave)</option>
                    <option value="absent">ขาดงาน (Absent)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-400">เวลาเข้างาน (Clock In)</label>
                  <input 
                    type="time" 
                    required 
                    value={manualForm.clock_in} 
                    onChange={(e) => setManualForm({ ...manualForm, clock_in: e.target.value })} 
                    className="glass-input text-xs" 
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-400">เวลาออกงาน (Clock Out)</label>
                  <input 
                    type="time" 
                    value={manualForm.clock_out} 
                    onChange={(e) => setManualForm({ ...manualForm, clock_out: e.target.value })} 
                    className="glass-input text-xs" 
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400">ชั่วโมงล่วงเวลา (OT Hours)</label>
                <input 
                  type="number" 
                  step="0.25"
                  min="0"
                  required
                  value={manualForm.ot_hours} 
                  onChange={(e) => setManualForm({ ...manualForm, ot_hours: e.target.value })} 
                  className="glass-input text-xs" 
                  placeholder="0.00"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200/50 dark:border-white/5">
                <button 
                  type="button" 
                  onClick={() => setShowManualModal(false)} 
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-xs font-semibold"
                >
                  ยกเลิก
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 rounded-xl bg-warehouse-orange hover:bg-warehouse-orange/90 text-white text-xs font-bold shadow-md shadow-warehouse-orange/15"
                >
                  บันทึกเวลาทำงาน
                </button>
              </div>
            </form>
          </GlassCard>
        </div>
      )}

    </div>
  );
}
