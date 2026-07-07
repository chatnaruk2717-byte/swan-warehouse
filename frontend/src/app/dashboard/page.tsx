'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import GlassCard from '../../components/GlassCard';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  BarChart, 
  Bar, 
  Cell, 
  PieChart, 
  Pie 
} from 'recharts';
import { 
  Users, 
  BookOpen, 
  Award, 
  CheckSquare, 
  Clock, 
  Calendar, 
  Bell, 
  ArrowUpRight, 
  Briefcase,
  PlayCircle
} from 'lucide-react';
import Link from 'next/link';
import SwanLogo from '../../components/SwanLogo';

export default function DashboardPage() {
  const { user, api } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [chartData, setChartData] = useState<any>(null);
  const [myTasks, setMyTasks] = useState<any[]>([]);
  const [perfStats, setPerfStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    
    const fetchData = async () => {
      try {
        // Fetch dashboard stats (managers)
        if (user.role !== 'employee') {
          const statsRes = await api.get('/api/reports/dashboard-stats');
          setStats(statsRes.data);

          const chartsRes = await api.get('/api/reports/charts');
          setChartData(chartsRes.data);
        } else {
          // Fetch performance stats (employee)
          try {
            const perfRes = await api.get('/api/performance/my-stats');
            setPerfStats(perfRes.data);
          } catch (err) {
            console.error("Failed to load performance stats:", err);
          }

          // Fetch personal tasks (employee)
          const tasksRes = await api.get('/api/tasks');
          setMyTasks(tasksRes.data.slice(0, 4));
        }
      } catch (err) {
        console.warn('Dashboard data fetch failed, using fallback mock states.');
        // Set mock fallbacks
        if (user.role !== 'employee') {
          setStats({
            totalEmployees: 10,
            avgTrainingCompletion: 68,
            avgQuizScore: 88,
            skillCoverage: 44,
            tasks: { total: 7, completed: 4, completionRate: 57 }
          });
          setChartData({
            departmentStats: [
              { department: 'Operations', avg_progress: 75, employee_count: 5 },
              { department: 'Receiving', avg_progress: 100, employee_count: 1 },
              { department: 'Packing', avg_progress: 100, employee_count: 1 },
              { department: 'Picking', avg_progress: 100, employee_count: 1 },
              { department: 'Inventory', avg_progress: 100, employee_count: 1 }
            ],
            skillStatusDistribution: [
              { status: 'need_training', count: 4 },
              { status: 'training', count: 3 },
              { status: 'qualified', count: 6 },
              { status: 'expert', count: 3 }
            ],
            positionStats: [
              { position: 'เจ้าหน้าที่', avg_progress: 85.0, employee_count: 3 },
              { position: 'พนักงานขับรถยก', avg_progress: 72.5, employee_count: 5 },
              { position: 'พนักงานหน้าลิฟท์', avg_progress: 90.0, employee_count: 2 }
            ],
            monthlyTrends: [
              { month: 'ม.ค.', completed: 35, enrolled: 75 },
              { month: 'ก.พ.', completed: 45, enrolled: 90 },
              { month: 'มี.ค.', completed: 60, enrolled: 105 },
              { month: 'เม.ย.', completed: 70, enrolled: 115 },
              { month: 'พ.ค.', completed: 88, enrolled: 135 },
              { month: 'มิ.ย.', completed: 110, enrolled: 150 }
            ]
          });
        } else {
          setPerfStats({
            id: user.id,
            employee_id: user.employee_id,
            name: user.name,
            photo_url: user.photo_url || '',
            department: user.department,
            position: user.position,
            evaluation_score: 94,
            completed_tasks: 2,
            completed_courses: 1,
            passed_quizzes: 1,
            accumulated_points: 55,
            settings: { points_per_task: 10, points_per_course: 20, points_per_quiz: 15 }
          });
          setMyTasks([
            { id: 1, task_name: 'ขับย้ายพาเลทพัสดุโซนสินค้าขาเข้า', category: 'Put Away', progress_percentage: 100, status: 'completed' },
            { id: 2, task_name: 'ตรวจสอบสภาพรถยกไฟฟ้า Forklift #04', category: 'Forklift', progress_percentage: 100, status: 'completed' },
            { id: 3, task_name: 'สแกนเช็คสต็อกสินค้าด้วย RF Scanner', category: 'RF Scanner', progress_percentage: 50, status: 'in_progress' }
          ]);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  // Color helper for pie chart
  const PIE_COLORS = ['#EF4444', '#F59E0B', '#10B981', '#155E38'];

  const getStatusLabel = (status: string) => {
    switch(status) {
      case 'need_training': return 'ต้องฝึกอบรม (Need)';
      case 'training': return 'กำลังเรียน (Training)';
      case 'qualified': return 'เชี่ยวชาญ (Qualified)';
      case 'expert': return 'ผู้เชี่ยวชาญสูงสุด (Expert)';
      default: return status;
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-4 border-slate-300 border-t-warehouse-orange rounded-full animate-spin" />
      </div>
    );
  }

  // Render Admin/HR/Supervisor View
  if (user?.role !== 'employee') {
    return (
      <div className="space-y-8">
        {/* Greetings Section - Premium Banner Card */}
        <div className="relative w-full min-h-[176px] rounded-3xl overflow-hidden shadow-sm border border-slate-200/50 dark:border-white/5 flex items-end p-6 bg-white dark:bg-slate-900">
          <img 
            src="/warehouse_banner.png" 
            alt="Warehouse Banner" 
            className="absolute inset-0 w-full h-full object-cover opacity-90 dark:opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-white/95 via-white/40 to-transparent dark:from-slate-950 dark:via-slate-900/35 dark:to-transparent" />
          
          <div className="relative z-10 w-full flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-1.5">
              <h2 className="text-xl md:text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <span>สวัสดีครับ คุณ{user?.name} 👋</span>
              </h2>
              <p className="text-slate-700 dark:text-slate-300 text-xs md:text-sm font-bold">ยินดีต้อนรับสู่ระบบบริหารจัดการคลังสินค้า SWAN ⚡️</p>
              
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 pt-1.5 text-[9px] font-extrabold tracking-wider">
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/15">ขับเคลื่อนองค์กรด้วย AI</span>
                <span className="text-slate-300 dark:text-slate-700">•</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/15">พัฒนาคน</span>
                <span className="text-slate-300 dark:text-slate-700">•</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/15">ยกระดับคลังสินค้า</span>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-3 items-center shrink-0">
              <Link 
                href="/reports" 
                className="px-4 py-2.5 rounded-xl bg-white/90 hover:bg-white text-slate-700 dark:bg-white/10 dark:hover:bg-white/20 dark:text-white text-xs font-bold flex items-center gap-2 border border-slate-200 dark:border-white/20 transition-all shadow-sm"
              >
                ดูรายงานสรุป (Reports)
              </Link>
              <Link 
                href="/skills" 
                className="px-4 py-2.5 rounded-xl bg-warehouse-orange hover:bg-warehouse-orange/95 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-warehouse-orange/15 transition-all"
              >
                อนุมัติ Skill (Approve Skills)
              </Link>
              <div className="bg-white/15 backdrop-blur-md p-1.5 rounded-2xl border border-white/25 shadow-xl hidden sm:block">
                <SwanLogo className="h-10" />
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          <GlassCard hoverEffect delay={0.05} className="flex items-center gap-5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <Users size={22} />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">พนักงานทั้งหมด</p>
              <h3 className="text-2xl font-black font-sans text-slate-800 dark:text-white mt-0.5">{stats?.totalEmployees ?? 0} คน</h3>
              <span className="text-[9px] text-emerald-500 font-bold flex items-center gap-0.5 mt-1">
                <span>↑ 12 คน</span> <span className="text-slate-400 dark:text-slate-500 font-medium">จากเดือนที่แล้ว</span>
              </span>
            </div>
          </GlassCard>

          <GlassCard hoverEffect delay={0.1} className="flex items-center gap-5">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <BookOpen size={22} />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">อบรมที่เข้าร่วมทั้งหมด</p>
              <h3 className="text-2xl font-black font-sans text-slate-800 dark:text-white mt-0.5">{stats?.avgTrainingCompletion ?? 0}%</h3>
              <span className="text-[9px] text-emerald-500 font-bold flex items-center gap-0.5 mt-1">
                <span>↑ 8%</span> <span className="text-slate-400 dark:text-slate-500 font-medium">จากเดือนที่แล้ว</span>
              </span>
            </div>
          </GlassCard>

          <GlassCard hoverEffect delay={0.15} className="flex items-center gap-5">
            <div className="w-12 h-12 rounded-2xl bg-teal-500/10 text-teal-500 flex items-center justify-center">
              <Award size={22} />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">ทักษะเฉลี่ยองค์กร</p>
              <h3 className="text-2xl font-black font-sans text-slate-800 dark:text-white mt-0.5">{stats?.avgQuizScore ?? 0}%</h3>
              <span className="text-[9px] text-emerald-500 font-bold flex items-center gap-0.5 mt-1">
                <span>↑ 5%</span> <span className="text-slate-400 dark:text-slate-500 font-medium">จากเดือนที่แล้ว</span>
              </span>
            </div>
          </GlassCard>

          <GlassCard hoverEffect delay={0.2} className="flex items-center gap-5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <CheckSquare size={22} />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">อัตราผ่านการอบรม Skill</p>
              <h3 className="text-2xl font-black font-sans text-slate-800 dark:text-white mt-0.5">{stats?.skillCoverage ?? 0}%</h3>
              <span className="text-[9px] text-emerald-500 font-bold flex items-center gap-0.5 mt-1">
                <span>↑ 10%</span> <span className="text-slate-400 dark:text-slate-500 font-medium">จากเดือนที่แล้ว</span>
              </span>
            </div>
          </GlassCard>

        </div>

        {/* Charts & Graphs Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* 1. Monthly Trends Chart (Area) */}
          <GlassCard className="lg:col-span-2 flex flex-col h-[380px]" delay={0.25}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h4 className="font-bold text-sm text-slate-800 dark:text-white">แนวโน้มการฝึกอบรม (Monthly Training Trend)</h4>
                <p className="text-xs text-slate-400 mt-0.5">สถิติจำนวนพนักงานเรียนจบเทียบกับจำนวนผู้ลงทะเบียนสะสม 6 เดือน</p>
              </div>
            </div>
            <div className="flex-1 w-full text-xs">
              <ResponsiveContainer width="100%" height="90%">
                <AreaChart data={chartData?.monthlyTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorEnrolled" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#155E38" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#155E38" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#F97316" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#F97316" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" className="dark:stroke-slate-800" />
                  <XAxis dataKey="month" tickLine={false} stroke="#94A3B8" />
                  <YAxis axisLine={false} tickLine={false} stroke="#94A3B8" />
                  <Tooltip contentStyle={{ borderRadius: '12px' }} />
                  <Area type="monotone" dataKey="enrolled" stroke="#155E38" fillOpacity={1} fill="url(#colorEnrolled)" name="ลงทะเบียนเรียน (Enrolled)" strokeWidth={2} />
                  <Area type="monotone" dataKey="completed" stroke="#F97316" fillOpacity={1} fill="url(#colorCompleted)" name="เรียนสำเร็จ (Completed)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>

          {/* 2. Skill Status distribution (Pie Chart) */}
          <GlassCard className="flex flex-col h-[380px]" delay={0.3}>
            <div className="mb-6">
              <h4 className="font-bold text-sm text-slate-800 dark:text-white">ภาพรวมทักษะพนักงาน (Skill Breakdown)</h4>
              <p className="text-xs text-slate-400 mt-0.5">อัตราส่วนเลเวลทักษะของพนักงานทั้งคลังสินค้า</p>
            </div>
            <div className="flex-1 flex items-center justify-center text-xs relative">
              <ResponsiveContainer width="100%" height="90%">
                <PieChart>
                  <Pie
                    data={chartData?.skillStatusDistribution}
                    cx="50%"
                    cy="45%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="count"
                    nameKey="status"
                  >
                    {chartData?.skillStatusDistribution?.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value, name) => [value, getStatusLabel(name as string)]} />
                </PieChart>
              </ResponsiveContainer>
              
              {/* Legend overlay */}
              <div className="absolute bottom-0 left-0 right-0 flex flex-wrap justify-center gap-x-4 gap-y-1">
                {chartData?.skillStatusDistribution?.map((entry: any, index: number) => (
                  <div key={entry.status} className="flex items-center gap-1.5 text-[10px]">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }} />
                    <span className="text-slate-400">{getStatusLabel(entry.status)}: <strong className="text-slate-700 dark:text-slate-200">{entry.count}</strong></span>
                  </div>
                ))}
              </div>
            </div>
          </GlassCard>

        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 3. Department Comparison (Bar Chart) */}
          <GlassCard className="flex flex-col h-[360px]" delay={0.35}>
            <div className="mb-6">
              <h4 className="font-bold text-sm text-slate-800 dark:text-white">ความสำเร็จการอบรมแยกตามแผนก (Department Progress)</h4>
              <p className="text-xs text-slate-400 mt-0.5">ความก้าวหน้าการอบรมเฉลี่ยแยกตามแผนก</p>
            </div>
            <div className="flex-1 w-full text-xs">
              <ResponsiveContainer width="100%" height="90%">
                <BarChart data={chartData?.departmentStats} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" className="dark:stroke-slate-800" />
                  <XAxis dataKey="department" tickLine={false} stroke="#94A3B8" />
                  <YAxis axisLine={false} tickLine={false} stroke="#94A3B8" />
                  <Tooltip contentStyle={{ borderRadius: '12px' }} />
                  <Bar dataKey="avg_progress" name="ความคืบหน้าอบรมเฉลี่ย (%)" radius={[8, 8, 0, 0]}>
                    {chartData?.departmentStats?.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#1E3A8A' : '#F97316'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>

          {/* 3.5. Position Comparison (Bar Chart) - NEW */}
          <GlassCard className="flex flex-col h-[360px]" delay={0.38}>
            <div className="mb-6">
              <h4 className="font-bold text-sm text-slate-800 dark:text-white">ความสำเร็จการอบรมแยกตามตำแหน่ง (Position Progress)</h4>
              <p className="text-xs text-slate-400 mt-0.5">ความก้าวหน้าการอบรมเฉลี่ยของกลุ่มพนักงานปฏิบัติงานหลัก</p>
            </div>
            <div className="flex-1 w-full text-xs">
              <ResponsiveContainer width="100%" height="90%">
                <BarChart data={chartData?.positionStats} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" className="dark:stroke-slate-800" />
                  <XAxis 
                    dataKey="position" 
                    tickLine={false} 
                    stroke="#94A3B8" 
                    tickFormatter={(tick) => {
                      const thaiName: Record<string, string> = {
                        'Forklift Driver': 'พนักงานขับรถยก',
                        'Lift Operator': 'พนักงานหน้าลิฟท์',
                        'Elevator Operator': 'พนักงานหน้าลิฟท์',
                        'Officer': 'เจ้าหน้าที่',
                        'Staff': 'เจ้าหน้าที่',
                        'Packer': 'พนักงานแพ็กของ',
                        'Picker': 'พนักงานคัดของ',
                        'Receiving Clerk': 'พนักงานรับสินค้า',
                        'Inventory Counter': 'พนักงานนับสต็อก'
                      };
                      return thaiName[tick] || tick;
                    }}
                  />
                  <YAxis axisLine={false} tickLine={false} stroke="#94A3B8" />
                  <Tooltip contentStyle={{ borderRadius: '12px' }} />
                  <Bar dataKey="avg_progress" name="ความคืบหน้าอบรมเฉลี่ย (%)" radius={[8, 8, 0, 0]}>
                    {chartData?.positionStats?.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#10B981' : '#F59E0B'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>

          {/* 4. Latest Announcements Column */}
          <GlassCard className="flex flex-col h-[360px]" delay={0.4}>
            <div className="flex items-center gap-2 mb-6">
              <Bell size={18} className="text-warehouse-orange" />
              <h4 className="font-bold text-sm text-slate-800 dark:text-white">ประกาศบริษัท (Announcements)</h4>
            </div>
            <div className="flex-1 overflow-y-auto space-y-4 pr-1">
              <div className="p-3 bg-slate-50 dark:bg-white/5 border border-slate-200/50 dark:border-white/5 rounded-2xl text-xs">
                <span className="text-[10px] font-bold text-warehouse-orange uppercase">Safety Security</span>
                <h5 className="font-bold text-slate-700 dark:text-slate-200 mt-1">มาตรการสวมใส่อุปกรณ์คุ้มครองความปลอดภัย (PPE)</h5>
                <p className="text-slate-400 mt-1 line-clamp-2">ขอความร่วมมือพนักงานฝ่ายปฏิบัติการในคลังสินค้าทุกคน สวมใส่หมวกนิรภัย เสื้อสะท้อนแสง...</p>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-white/5 border border-slate-200/50 dark:border-white/5 rounded-2xl text-xs">
                <span className="text-[10px] font-bold text-warehouse-navy uppercase dark:text-sky-400">Training Development</span>
                <h5 className="font-bold text-slate-700 dark:text-slate-200 mt-1">คอร์สอบรมระบบจัดการคลัง WMS & RF Scanner ใหม่</h5>
                <p className="text-slate-400 mt-1 line-clamp-2">ฝ่ายฝึกอบรมเปิดคอร์สแนะนำทักษะใหม่สำหรับการทำสต็อกสินค้าด้วยแท็บเล็ตและอุปกรณ์...</p>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Compliance Section: Pending Tasks & Incomplete Training */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mt-8">
          
          {/* Column 1: Pending Tasks */}
          <GlassCard className="flex flex-col p-6" delay={0.45}>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h4 className="font-bold text-sm text-slate-800 dark:text-white flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
                  <span>พนักงานที่ยังไม่ส่งงานที่ได้รับมอบหมาย</span>
                </h4>
                <p className="text-xs text-slate-400 mt-0.5 font-medium">รายชื่อพนักงานที่มีงานที่รับมอบหมายค้างส่งหรือกำลังดำเนินการ</p>
              </div>
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-lg bg-rose-500/10 text-rose-500 border border-rose-500/20">
                {(stats?.pendingTasks || []).length} รายการ
              </span>
            </div>

            <div className="flex-1 overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-white/5 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                    <th className="pb-3 pl-2">พนักงาน</th>
                    <th className="pb-3">งานที่มอบหมาย</th>
                    <th className="pb-3">กำหนดส่ง</th>
                    <th className="pb-3 text-right pr-2">สถานะ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                  {(stats?.pendingTasks || []).map((task: any) => {
                    const isOverdue = new Date(task.due_date).getTime() < Date.now();
                    return (
                      <tr key={task.id} className="hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors">
                        <td className="py-3 pl-2">
                          <div className="font-bold text-slate-700 dark:text-slate-200">{task.employee_name}</div>
                          <div className="text-[10px] text-slate-400">{task.employee_code}</div>
                        </td>
                        <td className="py-3 text-slate-600 dark:text-slate-300 font-medium max-w-[150px] truncate" title={task.task_name}>
                          {task.task_name}
                        </td>
                        <td className="py-3 text-slate-500 dark:text-slate-400 font-medium">
                          {new Date(task.due_date).toLocaleDateString('th-TH', { month: 'short', day: 'numeric' })}
                        </td>
                        <td className="py-3 text-right pr-2">
                          <span className={`px-2 py-0.5 rounded-lg text-[9px] font-extrabold uppercase ${
                            task.status === 'overdue' || (task.status === 'pending' && isOverdue)
                              ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                              : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                          }`}>
                            {task.status === 'overdue' || (task.status === 'pending' && isOverdue) ? 'เลยกำหนดส่ง' : 'รอดำเนินการ'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                  {(stats?.pendingTasks || []).length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-slate-400 italic">
                        ยอดเยี่ยม! ไม่มีงานค้างส่งในคลังสินค้า
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </GlassCard>

          {/* Column 2: Incomplete Training / Quizzes */}
          <GlassCard className="flex flex-col p-6" delay={0.5}>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h4 className="font-bold text-sm text-slate-800 dark:text-white flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
                  <span>พนักงานที่เรียน/สอบควิซยังไม่ผ่านเกณฑ์</span>
                </h4>
                <p className="text-xs text-slate-400 mt-0.5 font-medium">รายชื่อพนักงานที่การเรียนรู้ยังไม่เสร็จสมบูรณ์ 100%</p>
              </div>
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-lg bg-amber-500/10 text-amber-500 border border-amber-500/20">
                {(stats?.pendingCourses || []).length} รายการ
              </span>
            </div>

            <div className="flex-1 overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-white/5 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                    <th className="pb-3 pl-2">พนักงาน</th>
                    <th className="pb-3">หลักสูตรที่ได้รับมอบหมาย</th>
                    <th className="pb-3">ความคืบหน้า</th>
                    <th className="pb-3 text-right pr-2">กำหนดส่ง</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                  {(stats?.pendingCourses || []).map((course: any) => (
                    <tr key={course.id} className="hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors">
                      <td className="py-3 pl-2">
                        <div className="font-bold text-slate-700 dark:text-slate-200">{course.employee_name}</div>
                        <div className="text-[10px] text-slate-400">{course.employee_code}</div>
                      </td>
                      <td className="py-3 text-slate-600 dark:text-slate-300 font-medium max-w-[150px] truncate" title={course.course_name}>
                        {course.course_name}
                      </td>
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <span className="font-bold font-mono text-warehouse-orange text-[11px]">{course.progress_percentage}%</span>
                          <div className="w-16 bg-slate-200 dark:bg-slate-700 h-1 rounded-full overflow-hidden">
                            <div className="bg-warehouse-orange h-full" style={{ width: `${course.progress_percentage}%` }} />
                          </div>
                        </div>
                      </td>
                      <td className="py-3 text-right pr-2 font-medium text-slate-500 dark:text-slate-400">
                        {new Date(course.due_date).toLocaleDateString('th-TH', { month: 'short', day: 'numeric' })}
                      </td>
                    </tr>
                  ))}
                  {(stats?.pendingCourses || []).length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-slate-400 italic">
                        ยินดีด้วย! พนักงานทุกคนผ่านการทำแบบทดสอบเรียบร้อยครบถ้วน
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </GlassCard>

        </div>

      </div>
    );
  }

  // Render Employee Operational View
  return (
    <div className="space-y-8">
      
      {/* Employee Greeting Header - Premium Banner Card */}
      <div className="relative w-full min-h-[176px] rounded-3xl overflow-hidden shadow-sm border border-slate-200/50 dark:border-white/5 flex items-end p-6 bg-white dark:bg-slate-900">
        <img 
          src="/media__1782715533595.png" 
          alt="Warehouse Interior" 
          className="absolute inset-0 w-full h-full object-cover opacity-90 dark:opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-white/95 via-white/20 to-transparent dark:from-slate-950 dark:via-slate-900/35 dark:to-transparent" />
        
        <div className="relative z-10 w-full flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            {perfStats?.photo_url ? (
              <img 
                src={perfStats.photo_url} 
                alt={user.name} 
                className="w-16 h-16 rounded-full object-cover border-2 border-warehouse-orange shadow-md bg-slate-100 dark:bg-slate-800"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-warehouse-orange/10 border-2 border-warehouse-orange flex items-center justify-center text-warehouse-orange font-bold text-lg">
                {user.name.charAt(0)}
              </div>
            )}
            <div className="space-y-1">
              <h2 className="text-xl md:text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <span>สวัสดีครับ คุณ{user.name} 👋</span>
              </h2>
              <p className="text-slate-600 dark:text-slate-300 text-xs md:text-sm font-medium">แผนก {user.department} • ตำแหน่ง {user.position}</p>
            </div>
          </div>
          
          <div className="flex gap-4 items-center shrink-0">
            <div className="bg-white/85 dark:bg-slate-950/60 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm text-center">
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">คะแนนสะสมรวม</p>
              <p className="text-xl font-black text-warehouse-orange font-mono mt-0.5">{perfStats?.accumulated_points || 0}</p>
            </div>
            <div className="bg-white/85 dark:bg-slate-950/60 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm text-center">
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">ประเมินผลงานปลายปี</p>
              <p className="text-xl font-black text-emerald-500 dark:text-emerald-400 font-mono mt-0.5">{perfStats?.evaluation_score || 100} / 100</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Performance Summary and Tasks */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Performance Summary Stats Card */}
          <GlassCard className="p-5" delay={0.05}>
            <div className="flex items-center gap-2 mb-4">
              <Award className="text-warehouse-orange" size={18} />
              <h4 className="font-bold text-sm text-slate-800 dark:text-white">สรุปสถิติผลงานสะสม (Performance Summary)</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-3 bg-slate-100/50 dark:bg-white/5 border border-slate-200/50 dark:border-white/5 rounded-2xl flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-warehouse-orange/10 text-warehouse-orange flex items-center justify-center shrink-0">
                  <Briefcase size={16} />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">งานที่ได้รับมอบหมาย</p>
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-200 mt-0.5">ส่งงานสำเร็จ {perfStats?.completed_tasks || 0} เรื่อง</p>
                  <p className="text-[9px] text-slate-400 mt-0.5">+{ (perfStats?.completed_tasks || 0) * (perfStats?.settings?.points_per_task || 10) } คะแนนสะสม</p>
                </div>
              </div>
              <div className="p-3 bg-slate-100/50 dark:bg-white/5 border border-slate-200/50 dark:border-white/5 rounded-2xl flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-warehouse-orange/10 text-warehouse-orange flex items-center justify-center shrink-0">
                  <BookOpen size={16} />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">บทเรียนการอบรม</p>
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-200 mt-0.5">เข้าเรียนสำเร็จ {perfStats?.completed_courses || 0} เรื่อง</p>
                  <p className="text-[9px] text-slate-400 mt-0.5">+{ (perfStats?.completed_courses || 0) * (perfStats?.settings?.points_per_course || 20) } คะแนนสะสม</p>
                </div>
              </div>
              <div className="p-3 bg-slate-100/50 dark:bg-white/5 border border-slate-200/50 dark:border-white/5 rounded-2xl flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-warehouse-orange/10 text-warehouse-orange flex items-center justify-center shrink-0">
                  <Award size={16} />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">การทดสอบประเมิน</p>
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-200 mt-0.5">สอบผ่านสำเร็จ {perfStats?.passed_quizzes || 0} เรื่อง</p>
                  <p className="text-[9px] text-slate-400 mt-0.5">+{ (perfStats?.passed_quizzes || 0) * (perfStats?.settings?.points_per_quiz || 15) } คะแนนสะสม</p>
                </div>
              </div>
            </div>
          </GlassCard>

          {/* Assigned Daily Operations Tasks */}
          <GlassCard delay={0.1}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Briefcase size={18} className="text-warehouse-orange" />
                <h4 className="font-bold text-sm text-slate-800 dark:text-white">งานที่ได้รับมอบหมายวันนี้ (Assigned Tasks)</h4>
              </div>
              <Link href="/tasks" className="text-xs text-warehouse-orange hover:underline font-bold">ดูงานทั้งหมด</Link>
            </div>
            <div className="space-y-4">
              {myTasks.map((task) => (
                <div 
                  key={task.id} 
                  className="p-4 bg-slate-50 dark:bg-white/5 border border-slate-200/50 dark:border-white/5 rounded-2xl flex items-center justify-between gap-4 hover:border-slate-300 dark:hover:border-white/10 transition-all"
                >
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">{task.category}</span>
                    <h5 className="font-bold text-xs text-slate-700 dark:text-slate-200 mt-0.5 truncate">{task.task_name}</h5>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-[10px] font-bold px-2 py-1 rounded ${
                      task.status === 'completed' 
                        ? 'bg-emerald-500/10 text-emerald-500' 
                        : 'bg-amber-500/10 text-amber-500'
                    }`}>
                      {task.status === 'completed' ? 'เสร็จสิ้น' : 'กำลังดำเนินการ'}
                    </span>
                    <div className="w-12 text-right">
                      <span className="text-xs font-mono font-bold text-slate-500">{task.progress_percentage}%</span>
                    </div>
                  </div>
                </div>
              ))}
              {myTasks.length === 0 && (
                <p className="text-xs text-slate-400 py-6 text-center">ไม่มีงานค้างส่งในวันนี้</p>
              )}
            </div>
          </GlassCard>

        </div>

        {/* Right Column: Training Library Progress & Announcements */}
        <div className="space-y-8">
          
          {/* Active enrolled course progress */}
          <GlassCard delay={0.15}>
            <h4 className="font-bold text-sm text-slate-800 dark:text-white mb-6 flex items-center gap-2">
              <BookOpen size={18} className="text-warehouse-orange" />
              <span>การเรียนรู้ที่ค้างอยู่ (Learning Progress)</span>
            </h4>
            
            <div className="space-y-5">
              <div>
                <div className="flex justify-between text-xs font-semibold mb-2">
                  <span className="text-slate-700 dark:text-slate-200 truncate pr-2">การขับรถยก Forklift และความปลอดภัย</span>
                  <span className="text-warehouse-orange font-bold font-mono">50%</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                  <div className="bg-warehouse-orange h-full rounded-full transition-all duration-500" style={{ width: '50%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-2">
                  <span className="text-slate-700 dark:text-slate-200 truncate pr-2">ความปลอดภัยและ PPE คลังสินค้า</span>
                  <span className="text-emerald-500 font-bold font-mono">100%</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full transition-all duration-500" style={{ width: '100%' }} />
                </div>
              </div>

              <Link 
                href="/courses" 
                className="w-full mt-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5"
              >
                <PlayCircle size={16} className="text-warehouse-orange" />
                <span>เข้าห้องสมุดและอบรมต่อ (Go to Courses)</span>
              </Link>
            </div>
          </GlassCard>

          {/* Shift Announcements */}
          <GlassCard delay={0.2} className="flex flex-col h-[280px]">
            <div className="flex items-center gap-2 mb-6">
              <Bell size={18} className="text-warehouse-orange" />
              <h4 className="font-bold text-sm text-slate-800 dark:text-white">ประกาศของวันนี้</h4>
            </div>
            <div className="flex-1 overflow-y-auto space-y-4 pr-1">
              <div className="p-3 bg-slate-50 dark:bg-white/5 border border-slate-200/50 dark:border-white/5 rounded-xl text-xs">
                <span className="text-[10px] font-bold text-warehouse-orange">Safety Check</span>
                <h5 className="font-bold mt-1 text-slate-700 dark:text-slate-200">สวมใส่อุปกรณ์ PPE ครบชุด</h5>
                <p className="text-slate-400 mt-1">ขอความร่วมมือพนักงานทุกคน สวมหมวก เสื้อกั๊ก และรองเท้าเซฟตี้ตลอดเวลา</p>
              </div>
            </div>
          </GlassCard>

        </div>

      </div>

    </div>
  );
}
