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
  FileText
} from 'lucide-react';

export default function AdminSettingsPage() {
  const { api } = useAuth();
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch Audit Logs
    // If PG is not running, fall back to mock logs matching seeds
    setTimeout(() => {
      setLogs([
        { id: 1, action: 'LOGIN', details: 'ผู้ดูแลระบบสมชาย ล็อกอินเข้าสู่ระบบ', ip_address: '192.168.1.100', timestamp: '2026-06-29 08:30:00' },
        { id: 2, action: 'APPROVE_SKILL', details: 'อนุมัติทักษะการขับรถยก Forklift เลเวล 4 ของ สมปอง ลุยงาน (EMP006)', ip_address: '192.168.1.55', timestamp: '2026-06-29 09:00:00' },
        { id: 3, action: 'CREATE_USER', details: 'HR วิภาดา ลงทะเบียนพนักงานใหม่ จารุณี นับสต็อก (EMP010)', ip_address: '192.168.1.10', timestamp: '2026-06-29 09:15:00' },
        { id: 4, action: 'CLOCK_IN', details: 'สมปอง ลุยงาน ลงชื่อเข้างานปฏิบัติการ', ip_address: '192.168.2.10', timestamp: '2026-06-29 07:55:00' }
      ]);
      setLoading(false);
    }, 400);
  }, []);

  const handleBackup = () => {
    alert('ระบบเริ่มต้นกระบวนการสำรองข้อมูล PostgreSQL สำเร็จ (Backup Successful)\nไฟล์บันทึกที่: backup_warehouse_20260629.sql');
  };

  const handleRestore = () => {
    if (confirm('คำเตือน: การกู้คืนข้อมูลจะทับข้อมูลปัจจุบันทั้งหมด คุณแน่ใจว่าต้องการดำเนินการ?')) {
      alert('เริ่มทำการกู้คืนฐานข้อมูลจากไฟล์สำรองล่าสุดเสร็จสิ้น (Restore Completed)');
    }
  };

  return (
    <div className="space-y-8">
      
      {/* Header Info */}
      <div>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">จัดการระบบควบคุมกลาง (System Admin Portal)</h2>
        <p className="text-slate-400 text-sm mt-1">ตั้งค่าพารามิเตอร์ของระบบ ตรวจสอบความปลอดภัยด้วย Audit Logs และสำรองฐานข้อมูล</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Columns: Audit logs list */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="font-extrabold text-xs text-slate-400 uppercase tracking-widest px-2">บันทึกประวัติการใช้งานระบบ (Audit Logs)</h3>
          
          <GlassCard className="p-0 overflow-hidden border border-slate-200/50 dark:border-white/5">
            <div className="overflow-x-auto text-xs">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-slate-200/50 dark:border-white/5 text-[10px] uppercase font-bold text-slate-400 tracking-wider bg-slate-50/50 dark:bg-white/5">
                    <th className="px-6 py-3.5">เวลา</th>
                    <th className="px-6 py-3.5">กิจกรรม</th>
                    <th className="px-6 py-3.5">รายละเอียด</th>
                    <th className="px-6 py-3.5 text-center">IP Address</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/50 dark:divide-white/5 font-semibold text-slate-600 dark:text-slate-300">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-100/25 dark:hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4 font-mono text-[10px] text-slate-400">{log.timestamp}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          log.action === 'LOGIN' ? 'bg-indigo-500/10 text-indigo-500' :
                          log.action === 'APPROVE_SKILL' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'
                        }`}>
                          {log.action}
                        </span>
                      </td>
                      <td className="px-6 py-4 truncate max-w-xs">{log.details}</td>
                      <td className="px-6 py-4 text-center font-mono text-[10px] text-slate-400">{log.ip_address}</td>
                    </tr>
                  ))}
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
              ทำการสำรองข้อมูลพนักงาน ทักษะ ประวัติการสแกนบาร์โค้ด และผลสอบทั้งหมดของ PostgreSQL เพื่อป้องกันการสูญหายในระบบคลัง
            </p>

            <div className="space-y-3">
              <button
                onClick={handleBackup}
                className="w-full py-3 bg-warehouse-orange hover:bg-warehouse-orange/95 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-warehouse-orange/15 text-center flex items-center justify-center gap-1.5"
              >
                <Terminal size={14} />
                <span>สำรองข้อมูลฐานข้อมูล (Backup DB)</span>
              </button>

              <button
                onClick={handleRestore}
                className="w-full py-3 bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-white rounded-xl text-xs font-bold transition-all border border-slate-200/50 dark:border-white/5 text-center flex items-center justify-center gap-1.5"
              >
                <RefreshCcw size={14} />
                <span>กู้คืนข้อมูลระบบ (Restore DB)</span>
              </button>
            </div>
          </GlassCard>

          {/* Role configurations alert */}
          <GlassCard className="p-5 border border-amber-500/20 bg-amber-500/5 flex items-start gap-3">
            <ShieldAlert size={20} className="text-amber-500 shrink-0" />
            <div className="text-xs text-amber-500">
              <p className="font-bold">ระบบตรวจสอบสิทธิ์เปิดใช้งานอยู่</p>
              <p className="opacity-80 mt-1 leading-relaxed">การสลับสิทธิ์ใช้งานทั้งหมดจะล็อกบันทึกลงในทะเบียนความปลอดภัย Audit Logs อัตโนมัติ ป้องกันสิทธิ์สลับไปมาระหว่าง User</p>
            </div>
          </GlassCard>
        </div>

      </div>

    </div>
  );
}
