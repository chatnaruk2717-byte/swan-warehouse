'use client';

import React, { useState } from 'react';
import GlassCard from '../../components/GlassCard';
import { 
  FileText, 
  Download, 
  Search, 
  Filter, 
  TrendingUp, 
  Users, 
  Award, 
  CheckSquare, 
  Clock 
} from 'lucide-react';

export default function ReportsPage() {
  const [reportType, setReportType] = useState('training');
  const [format, setFormat] = useState('excel');
  const [dateRange, setDateRange] = useState('month');

  const reportOptions = [
    { id: 'training', name: 'รายงานสรุปผลการอบรม (Training Report)', icon: FileText, desc: 'สรุปการอบรมของพนักงาน รายหลักสูตร อัตราการเรียนจบ และใบรับรองที่ได้รับ' },
    { id: 'employee', name: 'รายงานข้อมูลพนักงาน (Employee Roster)', icon: Users, desc: 'รายชื่อพนักงานทั้งหมด สังกัดแผนก ตำแหน่ง และข้อมูลสังกัดเขตคลังสินค้า' },
    { id: 'skill', name: 'รายงานประเมินทักษะ (Skill Coverage)', icon: Award, desc: 'เมทริกซ์สรุประดับทักษะความชำนาญของพนักงาน แยกตามประเภทและแผนกงาน' },
    { id: 'task', name: 'รายงานการปฏิบัติงานคลัง (Task Operations)', icon: CheckSquare, desc: 'ประวัติการดำเนินภารกิจประจำวัน อัตราความสำเร็จ และการอนุมัติของหัวหน้า' },
    { id: 'attendance', name: 'รายงานการลงเวลา (Attendance Logs)', icon: Clock, desc: 'บันทึกเวลาปฏิบัติงาน การขาด ลา มาสาย และการทำงานล่วงเวลาสะสม' }
  ];

  const handleDownload = () => {
    // Simulate generating file download
    const dummyData = [
      ["Report Name", reportOptions.find(r => r.id === reportType)?.name || 'Report'],
      ["Generated At", new Date().toLocaleString('th-TH')],
      ["Date Range", dateRange === 'month' ? 'รอบเดือนปัจจุบัน' : dateRange === 'year' ? 'รอบปีปัจจุบัน' : 'ทั้งหมด'],
      ["Format", format.toUpperCase()]
    ];
    
    const BOM = "\uFEFF";
    const csvContent = BOM + dummyData.map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `warehouse_${reportType}_report.${format === 'excel' ? 'csv' : 'txt'}`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    alert(`กำลังดาวน์โหลดรายงาน ${format.toUpperCase()} สำเร็จ`);
  };

  return (
    <div className="space-y-8">
      
      {/* Header Info */}
      <div>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">รายงานระบบ (System Reports)</h2>
        <p className="text-slate-400 text-sm mt-1">ส่งออกข้อมูลสถิติพนักงาน ความก้าวหน้าฝึกอบรม และผลงานจัดเก็บสินค้าในรูปไฟล์ Excel และ PDF</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: Report Type Selector */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="font-extrabold text-xs text-slate-400 uppercase tracking-widest px-2">เลือกประเภทรายงาน</h3>
          
          <div className="space-y-4">
            {reportOptions.map((item) => {
              const Icon = item.icon;
              const isSelected = reportType === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => setReportType(item.id)}
                  className={`w-full text-left p-5 rounded-2xl border transition-all flex items-start gap-4 ${
                    isSelected 
                      ? 'border-warehouse-orange bg-warehouse-orange/5 shadow-lg shadow-warehouse-orange/5' 
                      : 'border-slate-200/50 dark:border-white/5 bg-slate-50 dark:bg-white/5 hover:border-slate-300 dark:hover:border-white/10'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    isSelected ? 'bg-warehouse-orange text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                  }`}>
                    <Icon size={20} />
                  </div>
                  <div>
                    <h4 className={`font-bold text-xs ${isSelected ? 'text-warehouse-orange' : 'text-slate-700 dark:text-slate-200'}`}>
                      {item.name}
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">{item.desc}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Side: Export Settings & Download */}
        <div className="lg:col-span-1">
          <GlassCard className="space-y-6 h-fit sticky top-28 border border-slate-200/50 dark:border-white/5">
            <h4 className="font-bold text-sm text-slate-800 dark:text-white flex items-center gap-2">
              <Download size={18} className="text-warehouse-orange" />
              <span>การตั้งค่าส่งออกรายงาน</span>
            </h4>

            {/* Format Selection */}
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">รูปแบบไฟล์ (Format)</label>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <button
                  onClick={() => setFormat('excel')}
                  className={`py-3 rounded-xl border text-center font-bold transition-all ${
                    format === 'excel' 
                      ? 'border-warehouse-orange bg-warehouse-orange/5 text-warehouse-orange' 
                      : 'border-slate-200 dark:border-white/5 hover:border-slate-300'
                  }`}
                >
                  Excel / CSV
                </button>
                <button
                  onClick={() => setFormat('pdf')}
                  className={`py-3 rounded-xl border text-center font-bold transition-all ${
                    format === 'pdf' 
                      ? 'border-warehouse-orange bg-warehouse-orange/5 text-warehouse-orange' 
                      : 'border-slate-200 dark:border-white/5 hover:border-slate-300'
                  }`}
                >
                  PDF Document
                </button>
              </div>
            </div>

            {/* Date Range Selection */}
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">ช่วงเวลา (Date Range)</label>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="glass-input text-xs bg-white dark:bg-warehouse-slate"
              >
                <option value="month">รอบเดือนปัจจุบัน (Current Month)</option>
                <option value="year">รอบปีปัจจุบัน (Current Year)</option>
                <option value="all">ข้อมูลทั้งหมดสะสม (All Time)</option>
              </select>
            </div>

            {/* Download button */}
            <button
              onClick={handleDownload}
              className="w-full py-3.5 bg-warehouse-orange hover:bg-warehouse-orange/90 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-warehouse-orange/15 text-center flex items-center justify-center gap-1.5"
            >
              <Download size={14} />
              <span>ดาวน์โหลดรายงาน (Download)</span>
            </button>
          </GlassCard>
        </div>

      </div>

    </div>
  );
}
