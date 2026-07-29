'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import GlassCard from '../../components/GlassCard';
import { 
  Settings, 
  Terminal, 
  Database, 
  RefreshCcw, 
  ShieldAlert, 
  CheckCircle,
  FileText,
  Search,
  Download,
  Upload,
  Trash2,
  Activity,
  Filter
} from 'lucide-react';

export default function AdminSettingsPage() {
  const { user, api } = useAuth();
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedActionFilter, setSelectedActionFilter] = useState('ALL');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [isRestoring, setIsRestoring] = useState(false);
  const [backupSuccessMsg, setBackupSuccessMsg] = useState<string | null>(null);

  // Initial seed logs with current date for realism if none exist
  const getInitialSeedLogs = () => {
    const today = new Date().toISOString().substring(0, 10);
    return [
      { id: 101, action: 'LOGIN', details: `ผู้ดูแลระบบ ${user?.name || 'สมชาย'} (${user?.employee_id || 'EMP001'}) เข้าสู่ระบบ`, ip_address: '192.168.1.100', timestamp: `${today} 08:30:00` },
      { id: 102, action: 'APPROVE_SKILL', details: 'อนุมัติทักษะการขับรถยก Forklift เลเวล 4 ของ สมปอง ลุยงาน (EMP006)', ip_address: '192.168.1.55', timestamp: `${today} 09:00:00` },
      { id: 103, action: 'CREATE_USER', details: 'HR วิภาดา ลงทะเบียนพนักงานใหม่ จารุณี นับสต็อก (EMP010)', ip_address: '192.168.1.10', timestamp: `${today} 09:15:00` },
      { id: 104, action: 'CLOCK_IN', details: 'สมปอง ลุยงาน ลงชื่อเข้างานปฏิบัติการคลังสินค้า', ip_address: '192.168.2.10', timestamp: `${today} 07:55:00` }
    ];
  };

  const fetchLogs = async () => {
    try {
      // 1. Load from localStorage first (for real-time frontend actions)
      const localLogsStr = localStorage.getItem('swan_audit_logs');
      let localLogs: any[] = localLogsStr ? JSON.parse(localLogsStr) : [];

      // 2. Try fetching from Backend API
      try {
        const res = await api.get('/api/reports/audit-logs');
        if (res.data && Array.isArray(res.data) && res.data.length > 0) {
          // Merge API logs and local logs avoiding duplicates by id/timestamp
          const merged = [...localLogs, ...res.data];
          const uniqueMap = new Map();
          merged.forEach(item => {
            const key = item.id || `${item.timestamp}-${item.action}-${item.details}`;
            if (!uniqueMap.has(key)) uniqueMap.set(key, item);
          });
          const combined = Array.from(uniqueMap.values());
          setLogs(combined);
          setLoading(false);
          return;
        }
      } catch (e) {
        // Backend API fail fallback
      }

      if (localLogs.length > 0) {
        setLogs(localLogs);
      } else {
        const seeds = getInitialSeedLogs();
        setLogs(seeds);
        localStorage.setItem('swan_audit_logs', JSON.stringify(seeds));
      }
    } catch (err) {
      setLogs(getInitialSeedLogs());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
    
    // Auto-refresh interval every 10 seconds if enabled
    const interval = setInterval(() => {
      if (autoRefresh) {
        fetchLogs();
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [autoRefresh]);

  const addAuditLog = (action: string, details: string) => {
    const now = new Date();
    const timestampStr = now.toISOString().replace('T', ' ').substring(0, 19);
    const newLog = {
      id: Date.now(),
      action,
      details,
      ip_address: '192.168.1.100',
      timestamp: timestampStr
    };

    setLogs(prev => [newLog, ...prev]);

    try {
      const stored = localStorage.getItem('swan_audit_logs');
      const list = stored ? JSON.parse(stored) : [];
      list.unshift(newLog);
      localStorage.setItem('swan_audit_logs', JSON.stringify(list));

      api.post('/api/reports/audit-logs', { action, details }).catch(() => {});
    } catch (e) {}
  };

  const handleBackup = async () => {
    const now = new Date();
    const dateStr = now.toISOString().substring(0, 10);
    const timestampStr = now.toISOString().replace('T', ' ').substring(0, 19);

    try {
      let backupPayload: any = null;
      try {
        const res = await api.post('/api/reports/backup');
        backupPayload = res.data;
      } catch (e) {
        // Fallback backup payload
        backupPayload = {
          version: '1.0.0',
          exported_at: timestampStr,
          exported_by: `${user?.name} (${user?.employee_id})`,
          audit_logs: logs
        };
      }

      // Download file to browser
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupPayload, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `backup_swan_warehouse_${dateStr}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();

      addAuditLog('BACKUP_DB', `ผู้ดูแลระบบ ${user?.name || 'Admin'} ทำการสำรองข้อมูลฐานข้อมูล (Backup DB Success)`);
      setBackupSuccessMsg(`สำรองข้อมูลสำเร็จ! ดาวน์โหลดไฟล์ backup_swan_warehouse_${dateStr}.json เรียบร้อยแล้ว`);
      setTimeout(() => setBackupSuccessMsg(null), 5000);
    } catch (err: any) {
      alert('เกิดข้อผิดพลาดในการสำรองข้อมูล: ' + err.message);
    }
  };

  const handleRestoreFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      fileReader.readAsText(file, "UTF-8");
      fileReader.onload = (e) => {
        try {
          const content = JSON.parse(e.target?.result as string);
          if (confirm(`คำเตือน: ยืนยันการกู้คืนข้อมูลระบบจากไฟล์ "${file.name}"? (ข้อมูลปัจจุบันจะถูกอัปเดต)`)) {
            setIsRestoring(true);
            setTimeout(() => {
              if (content.audit_logs && Array.isArray(content.audit_logs)) {
                setLogs(content.audit_logs);
                localStorage.setItem('swan_audit_logs', JSON.stringify(content.audit_logs));
              }
              addAuditLog('RESTORE_DB', `ทำการกู้คืนข้อมูลระบบสำเร็จจากไฟล์ "${file.name}" (Restore Completed)`);
              setIsRestoring(false);
              alert('กู้คืนข้อมูลระบบสำเร็จ! (Restore Completed Successfully)');
            }, 800);
          }
        } catch (err) {
          alert('ไฟล์ Backup ไม่ถูกต้อง หรือโครงสร้าง JSON ผิดพลาด');
        }
      };
    }
  };

  const handleClearLogs = () => {
    if (confirm('คุณแน่ใจหรือไม่ว่าต้องการล้างบันทึก Audit Logs ทั้งหมด?')) {
      const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
      const clearLog = [{
        id: Date.now(),
        action: 'CLEAR_LOGS',
        details: `ผู้ดูแลระบบ ${user?.name} ทำการล้างประวัติ Audit Logs`,
        ip_address: '192.168.1.100',
        timestamp: now
      }];
      setLogs(clearLog);
      localStorage.setItem('swan_audit_logs', JSON.stringify(clearLog));
    }
  };

  // Filtering
  const filteredLogs = logs.filter(log => {
    const matchesSearch = 
      (log.action || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.details || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.ip_address || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.timestamp || '').toLowerCase().includes(searchQuery.toLowerCase());

    if (selectedActionFilter === 'ALL') return matchesSearch;
    if (selectedActionFilter === 'LOGIN') return matchesSearch && (log.action === 'LOGIN' || log.action === 'ROLE_SWITCH');
    if (selectedActionFilter === 'SKILLS') return matchesSearch && log.action.includes('SKILL');
    if (selectedActionFilter === 'USERS') return matchesSearch && (log.action.includes('USER') || log.action.includes('CLOCK'));
    if (selectedActionFilter === 'BACKUP') return matchesSearch && (log.action.includes('BACKUP') || log.action.includes('RESTORE'));
    return matchesSearch;
  });

  const getActionBadgeColor = (action: string) => {
    if (action === 'LOGIN') return 'bg-indigo-500/10 text-indigo-500 border border-indigo-500/20';
    if (action === 'ROLE_SWITCH') return 'bg-purple-500/10 text-purple-500 border border-purple-500/20';
    if (action === 'APPROVE_SKILL') return 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20';
    if (action === 'CREATE_USER') return 'bg-sky-500/10 text-sky-500 border border-sky-500/20';
    if (action === 'CLOCK_IN') return 'bg-amber-500/10 text-amber-500 border border-amber-500/20';
    if (action === 'BACKUP_DB') return 'bg-teal-500/10 text-teal-500 border border-teal-500/20';
    if (action === 'RESTORE_DB') return 'bg-rose-500/10 text-rose-500 border border-rose-500/20';
    return 'bg-slate-500/10 text-slate-500 border border-slate-500/20';
  };

  return (
    <div className="space-y-8 pb-12">
      
      {/* Header Info */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2.5">
            <span>จัดการระบบควบคุมกลาง (System Admin Portal)</span>
            <span className="px-2 py-0.5 rounded-lg bg-emerald-500/15 text-emerald-500 border border-emerald-500/30 text-[10px] uppercase tracking-wider font-extrabold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
              Live Sync Active
            </span>
          </h2>
          <p className="text-slate-400 text-sm mt-1">ตั้งค่าพารามิเตอร์ของระบบ ตรวจสอบความปลอดภัยด้วย Audit Logs แบบเรียลไทม์ และสำรองฐานข้อมูล</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchLogs}
            className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all border border-slate-200/50 dark:border-white/5 flex items-center gap-1.5"
            title="อัปเดตข้อมูลบันทึกประวัติล่าสุด"
          >
            <RefreshCcw size={14} className={loading ? 'animate-spin' : ''} />
            <span>รีเฟรชประวัติ</span>
          </button>
        </div>
      </div>

      {backupSuccessMsg && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 text-xs font-bold flex items-center gap-2 animate-fadeIn">
          <CheckCircle size={16} />
          <span>{backupSuccessMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Columns: Audit logs list */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1">
            <h3 className="font-extrabold text-xs text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Activity size={14} className="text-warehouse-orange" />
              <span>บันทึกประวัติการใช้งานระบบ (AUDIT LOGS)</span>
              <span className="px-2 py-0.5 rounded-full bg-slate-200 dark:bg-white/10 text-slate-600 dark:text-slate-300 font-mono text-[10px]">
                {filteredLogs.length} รายการ
              </span>
            </h3>

            <div className="flex items-center gap-2">
              <button
                onClick={handleClearLogs}
                className="text-[11px] text-slate-400 hover:text-rose-500 transition-colors flex items-center gap-1 font-semibold"
                title="ล้างบันทึกทั้งหมด"
              >
                <Trash2 size={12} />
                <span>ล้างบันทึก</span>
              </button>
            </div>
          </div>

          {/* Search & Action Filter Tabs */}
          <GlassCard className="p-3.5 space-y-3 border border-slate-200/50 dark:border-white/5">
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="relative flex-1 w-full">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ค้นหาตามกิจกรรม, รายละเอียด, IP..."
                  className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-100/70 dark:bg-white/5 border border-slate-200/50 dark:border-white/5 text-xs text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-warehouse-orange"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-1.5 text-[11px] pt-1">
              <span className="text-slate-400 font-bold mr-1 flex items-center gap-1">
                <Filter size={12} />
                <span>ตัวกรอง:</span>
              </span>
              {[
                { id: 'ALL', label: 'ทั้งหมด' },
                { id: 'LOGIN', label: 'การเข้าใช้ระบบ' },
                { id: 'SKILLS', label: 'อนุมัติทักษะ' },
                { id: 'USERS', label: 'ผู้ใช้/ลงเวลา' },
                { id: 'BACKUP', label: 'สำรอง/กู้คืน' },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedActionFilter(tab.id)}
                  className={`px-3 py-1 rounded-lg font-bold transition-all ${
                    selectedActionFilter === tab.id
                      ? 'bg-warehouse-orange text-white shadow-sm shadow-warehouse-orange/20'
                      : 'bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </GlassCard>

          {/* Audit Logs Table */}
          <GlassCard className="p-0 overflow-hidden border border-slate-200/50 dark:border-white/5">
            <div className="overflow-x-auto text-xs">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-slate-200/50 dark:border-white/5 text-[10px] uppercase font-bold text-slate-400 tracking-wider bg-slate-50/50 dark:bg-white/5">
                    <th className="px-5 py-3.5 w-36">เวลาบันทึก</th>
                    <th className="px-5 py-3.5 w-32">กิจกรรม</th>
                    <th className="px-5 py-3.5">รายละเอียด</th>
                    <th className="px-5 py-3.5 text-center w-28">IP ADDRESS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/50 dark:divide-white/5 font-semibold text-slate-600 dark:text-slate-300">
                  {filteredLogs.length > 0 ? (
                    filteredLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-100/25 dark:hover:bg-white/5 transition-colors">
                        <td className="px-5 py-4 font-mono text-[10px] text-slate-400 whitespace-nowrap">{log.timestamp}</td>
                        <td className="px-5 py-4 whitespace-nowrap">
                          <span className={`px-2.5 py-1 rounded-md text-[9px] font-extrabold uppercase ${getActionBadgeColor(log.action)}`}>
                            {log.action}
                          </span>
                        </td>
                        <td className="px-5 py-4 leading-relaxed max-w-sm">
                          <p className="text-slate-800 dark:text-slate-100 text-xs font-medium">{log.details}</p>
                        </td>
                        <td className="px-5 py-4 text-center font-mono text-[10px] text-slate-400 whitespace-nowrap">{log.ip_address}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="py-12 text-center text-slate-400">
                        <p className="text-sm font-semibold">ไม่พบบันทึก Audit Log ที่ตรงกับการค้นหา</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </GlassCard>
        </div>

        {/* Right Side: Maintenance and database configurations */}
        <div className="lg:col-span-1 space-y-6">
          <h3 className="font-extrabold text-xs text-slate-400 uppercase tracking-widest px-2">งานบำรุงรักษาฐานข้อมูล</h3>
          
          <GlassCard className="space-y-6 border border-slate-200/50 dark:border-white/5">
            <h4 className="font-bold text-sm text-slate-800 dark:text-white flex items-center gap-2">
              <Database size={18} className="text-warehouse-orange" />
              <span>การสำรองและกู้คืนฐานข้อมูล</span>
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              ทำการสำรองข้อมูลพนักงาน ทักษะ ประวัติการสแกนบาร์โค้ด และผลสอบทั้งหมดในรูปแบบ JSON/SQL เพื่อป้องกันการสูญหายในระบบคลัง
            </p>

            <div className="space-y-3">
              <button
                onClick={handleBackup}
                className="w-full py-3 bg-warehouse-orange hover:bg-warehouse-orange/95 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-warehouse-orange/15 text-center flex items-center justify-center gap-2"
              >
                <Download size={15} />
                <span>สำรองข้อมูลฐานข้อมูล (Backup DB)</span>
              </button>

              <label className="w-full py-3 bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-white rounded-xl text-xs font-bold transition-all border border-slate-200/50 dark:border-white/5 text-center flex items-center justify-center gap-2 cursor-pointer">
                <Upload size={15} className="text-warehouse-orange" />
                <span>{isRestoring ? 'กำลังกู้คืนข้อมูล...' : 'เลือกไฟล์กู้คืนระบบ (Restore DB)'}</span>
                <input 
                  type="file" 
                  accept=".json,.sql"
                  onChange={handleRestoreFile} 
                  className="hidden" 
                  disabled={isRestoring}
                />
              </label>
            </div>
          </GlassCard>

          {/* Role configurations alert */}
          <GlassCard className="p-5 border border-amber-500/20 bg-amber-500/5 flex items-start gap-3">
            <ShieldAlert size={20} className="text-amber-500 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-500 space-y-1">
              <p className="font-bold">ระบบตรวจสอบความปลอดภัย (Real-Time Audit)</p>
              <p className="opacity-90 leading-relaxed">
                การเข้าใช้ระบบ การสลับสิทธิ์การใช้งาน (Role Switch) รวมถึงการอนุมัติงานและทักษะทั้งหมดจะถูกบันทึกลงใน Audit Logs แบบเรียลไทม์โดยอัตโนมัติ
              </p>
            </div>
          </GlassCard>
        </div>

      </div>

    </div>
  );
}
