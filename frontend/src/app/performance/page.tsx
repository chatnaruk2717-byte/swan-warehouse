'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import GlassCard from '../../components/GlassCard';
import { 
  Award, 
  Briefcase, 
  BookOpen, 
  Settings, 
  Edit3, 
  Save, 
  X, 
  TrendingUp, 
  User, 
  Check, 
  Trophy, 
  Star,
  Activity,
  FileText
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';

export default function PerformancePage() {
  const { user, api } = useAuth();
  const [loading, setLoading] = useState(true);
  
  // Settings State
  const [settings, setSettings] = useState<any>({
    points_per_task: 10,
    points_per_course: 20,
    points_per_quiz: 15
  });
  
  // Data States
  const [myStats, setMyStats] = useState<any>(null);
  const [employees, setEmployees] = useState<any[]>([]);
  
  // Modal States
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showScoreModal, setShowScoreModal] = useState(false);
  const [selectedEmp, setSelectedEmp] = useState<any>(null);
  
  // Form Input States (Updated for comprehensive edits)
  const [inputScore, setInputScore] = useState('');
  const [inputPoints, setInputPoints] = useState('');
  const [inputAbsent, setInputAbsent] = useState('');
  const [inputLeave, setInputLeave] = useState('');
  const [inputLate, setInputLate] = useState('');
  const [inputWarning, setInputWarning] = useState('');

  const [inputPointsTask, setInputPointsTask] = useState('');
  const [inputPointsCourse, setInputPointsCourse] = useState('');
  const [inputPointsQuiz, setInputPointsQuiz] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      // Load settings
      try {
        const setRes = await api.get('/api/performance/settings');
        setSettings(setRes.data);
      } catch (err) {
        console.warn('Failed to load settings from DB, using fallback.');
      }

      if (user?.role === 'employee') {
        // Load employee personal stats
        const statsRes = await api.get('/api/performance/my-stats');
        setMyStats(statsRes.data);
      } else {
        // Load admin list of employees and staff
        const empRes = await api.get('/api/performance/employees');
        setEmployees(empRes.data);
      }
    } catch (err) {
      console.error('Error loading performance data:', err);
      // Fallback mocks
      if (user?.role === 'employee') {
        setMyStats({
          id: user.id,
          employee_id: user.employee_id,
          name: user.name,
          photo_url: user.photo_url || '',
          department: user.department,
          position: user.position,
          role: user.role,
          evaluation_score: 95,
          completed_tasks: 4,
          completed_courses: 2,
          passed_quizzes: 3,
          accumulated_points: 125,
          absent_count: 0,
          leave_count: 1,
          late_count: 2,
          warning_letters: 0,
          settings: { points_per_task: 10, points_per_course: 20, points_per_quiz: 15 }
        });
      } else {
        setEmployees([
          { id: 3, employee_id: 'EMP003', name: 'นรินทร์ เก่งการ', department: 'Training', position: 'Senior Trainer', role: 'staff', photo_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150', completed_tasks: 2, completed_courses: 2, passed_quizzes: 1, accumulated_points: 75, evaluation_score: 92, absent_count: 0, leave_count: 1, late_count: 2, warning_letters: 0 },
          { id: 4, employee_id: 'EMP004', name: 'ประพันธ์ ยอดคุม', department: 'Operations', position: 'Zone A Supervisor', role: 'staff', photo_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150', completed_tasks: 3, completed_courses: 2, passed_quizzes: 1, accumulated_points: 85, evaluation_score: 96, absent_count: 1, leave_count: 2, late_count: 0, warning_letters: 0 },
          { id: 5, employee_id: 'EMP005', name: 'สมศรี มีคุม', department: 'Operations', position: 'Zone B Supervisor', role: 'staff', photo_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150', completed_tasks: 2, completed_courses: 2, passed_quizzes: 2, accumulated_points: 80, evaluation_score: 94, absent_count: 0, leave_count: 3, late_count: 1, warning_letters: 0 },
          { id: 6, employee_id: 'EMP006', name: 'สมปอง ลุยงาน', department: 'Operations', position: 'Forklift Driver', role: 'employee', photo_url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150', completed_tasks: 3, completed_courses: 2, passed_quizzes: 2, accumulated_points: 100, evaluation_score: 96, absent_count: 2, leave_count: 1, late_count: 3, warning_letters: 1 },
          { id: 7, employee_id: 'EMP007', name: 'อรอนงค์ แพ็กเก่ง', department: 'Operations', position: 'Packer', role: 'employee', photo_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', completed_tasks: 4, completed_courses: 1, passed_quizzes: 2, accumulated_points: 90, evaluation_score: 98, absent_count: 0, leave_count: 2, late_count: 0, warning_letters: 0 },
          { id: 8, employee_id: 'EMP008', name: 'มานะ คัดของ', department: 'Operations', position: 'Picker', role: 'employee', photo_url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150', completed_tasks: 1, completed_courses: 1, passed_quizzes: 1, accumulated_points: 45, evaluation_score: 89, absent_count: 3, leave_count: 0, late_count: 4, warning_letters: 1 },
          { id: 9, employee_id: 'EMP009', name: 'เกษม รับสินค้า', department: 'Operations', position: 'Receiving Clerk', role: 'employee', photo_url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150', completed_tasks: 2, completed_courses: 2, passed_quizzes: 0, accumulated_points: 60, evaluation_score: 87, absent_count: 1, leave_count: 5, late_count: 1, warning_letters: 0 },
          { id: 10, employee_id: 'EMP010', name: 'จารุณี นับสต็อก', department: 'Operations', position: 'Inventory Counter', role: 'employee', photo_url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150', completed_tasks: 2, completed_courses: 1, passed_quizzes: 1, accumulated_points: 55, evaluation_score: 94, absent_count: 0, leave_count: 1, late_count: 0, warning_letters: 0 }
        ]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  // Open Score & Stats Modal
  const openEditScore = (emp: any) => {
    setSelectedEmp(emp);
    setInputScore(emp.evaluation_score !== undefined ? emp.evaluation_score.toString() : '100');
    setInputPoints(emp.accumulated_points !== undefined ? emp.accumulated_points.toString() : '0');
    setInputAbsent(emp.absent_count !== undefined ? emp.absent_count.toString() : '0');
    setInputLeave(emp.leave_count !== undefined ? emp.leave_count.toString() : '0');
    setInputLate(emp.late_count !== undefined ? emp.late_count.toString() : '0');
    setInputWarning(emp.warning_letters !== undefined ? emp.warning_letters.toString() : '0');
    setShowScoreModal(true);
  };

  // Open Settings Modal
  const openSettings = () => {
    setInputPointsTask(settings.points_per_task.toString());
    setInputPointsCourse(settings.points_per_course.toString());
    setInputPointsQuiz(settings.points_per_quiz.toString());
    setShowSettingsModal(true);
  };

  // Save Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    const task = parseInt(inputPointsTask, 10);
    const course = parseInt(inputPointsCourse, 10);
    const quiz = parseInt(inputPointsQuiz, 10);

    if (isNaN(task) || isNaN(course) || isNaN(quiz)) {
      alert('กรุณากรอกตัวเลขคะแนนที่ถูกต้อง');
      return;
    }

    try {
      const res = await api.put('/api/performance/settings', {
        points_per_task: task,
        points_per_course: course,
        points_per_quiz: quiz
      });
      setSettings(res.data);
      setShowSettingsModal(false);
      alert('บันทึกกติกาตั้งค่าคะแนนสำเร็จ');
      loadData(); 
    } catch (err: any) {
      alert('บันทึกไม่สำเร็จ: ' + (err.response?.data?.message || err.message));
    }
  };

  // Save Employee Stats and Score
  const handleSaveScore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmp) return;

    const score = parseInt(inputScore, 10);
    const points = parseInt(inputPoints, 10);
    const absent = parseInt(inputAbsent, 10);
    const leave = parseInt(inputLeave, 10);
    const late = parseInt(inputLate, 10);
    const warning = parseInt(inputWarning, 10);

    if (isNaN(score) || score < 0 || score > 100) {
      alert('กรุณากรอกคะแนนประเมินระหว่าง 0 ถึง 100 คะแนน');
      return;
    }
    if (isNaN(points) || isNaN(absent) || isNaN(leave) || isNaN(late) || isNaN(warning)) {
      alert('กรุณากรอกตัวเลขข้อมูลที่ถูกต้อง');
      return;
    }

    try {
      const res = await api.put(`/api/performance/employee/${selectedEmp.id}`, {
        evaluation_score: score,
        accumulated_points: points,
        absent_count: absent,
        leave_count: leave,
        late_count: late,
        warning_letters: warning
      });
      
      setEmployees(employees.map(emp => 
        emp.id === selectedEmp.id 
          ? { 
              ...emp, 
              evaluation_score: res.data.evaluation_score,
              accumulated_points: res.data.accumulated_points,
              absent_count: res.data.absent_count,
              leave_count: res.data.leave_count,
              late_count: res.data.late_count,
              warning_letters: res.data.warning_letters
            } 
          : emp
      ));
      
      setShowScoreModal(false);
      setSelectedEmp(null);
      alert('บันทึกปรับปรุงข้อมูลคะแนนและประวัติเข้างานสำเร็จ');
    } catch (err: any) {
      alert('บันทึกไม่สำเร็จ: ' + (err.response?.data?.message || err.message));
    }
  };

  // Evaluation text status helper
  const getScoreGradeText = (score: number) => {
    if (score >= 95) return { grade: 'A', text: 'ผลงานดีเด่น (Excellent)', color: 'text-emerald-500', bg: 'bg-emerald-500/10 border-emerald-500/20' };
    if (score >= 85) return { grade: 'B', text: 'ผลงานดีมาก (Very Good)', color: 'text-blue-500', bg: 'bg-blue-500/10 border-blue-500/20' };
    if (score >= 70) return { grade: 'C', text: 'ผลงานระดับมาตรฐาน (Good)', color: 'text-amber-500', bg: 'bg-amber-500/10 border-amber-500/20' };
    if (score >= 50) return { grade: 'D', text: 'ควรปรับปรุงแก้ไข (Needs Improvement)', color: 'text-orange-500', bg: 'bg-orange-500/10 border-orange-500/20' };
    return { grade: 'F', text: 'ไม่ผ่านเกณฑ์มาตรฐาน (Fail)', color: 'text-rose-500', bg: 'bg-rose-500/10 border-rose-500/20' };
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-warehouse-orange"></div>
      </div>
    );
  }

  // RENDER EMPLOYEE PERSONAL VIEW
  if (user?.role === 'employee' && myStats) {
    const gradeInfo = getScoreGradeText(myStats.evaluation_score);
    
    return (
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">รายงานประเมินผลงาน & KPI สะสม</h2>
          <p className="text-slate-400 text-sm mt-1">สรุปข้อมูลคะแนนสะสมและการประเมินประสิทธิภาพการทำงานคลังสินค้า Swan</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Profile, Points Info, and Attendance */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Profile Detail Card */}
            <GlassCard className="p-6 flex flex-col items-center text-center">
              {myStats.photo_url ? (
                <img 
                  src={myStats.photo_url} 
                  alt={myStats.name} 
                  className="w-24 h-24 rounded-full object-cover border-4 border-warehouse-orange shadow-lg bg-slate-800"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-warehouse-orange/20 border-4 border-warehouse-orange flex items-center justify-center text-warehouse-orange font-bold text-3xl">
                  {myStats.name.charAt(0)}
                </div>
              )}
              <h3 className="text-lg font-bold text-slate-800 dark:text-white mt-4">{myStats.name}</h3>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-1">{myStats.employee_id}</p>
              
              <div className="w-full border-t border-slate-200/50 dark:border-white/5 my-4 pt-4 text-xs space-y-2.5 text-left">
                <div className="flex justify-between">
                  <span className="text-slate-400">บทบาท (Role):</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-200 capitalize">{myStats.role}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">แผนก (Department):</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-200">{myStats.department}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">ตำแหน่ง (Position):</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-200">{myStats.position}</span>
                </div>
              </div>
            </GlassCard>

            {/* Attendance & Warnings Discipline card */}
            <GlassCard className="p-6 space-y-4">
              <div className="flex items-center gap-2">
                <Activity className="text-rose-500" size={18} />
                <h4 className="font-bold text-sm text-slate-800 dark:text-white">การเข้างาน & วินัยปฏิบัติงาน</h4>
              </div>
              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="p-2.5 bg-rose-500/10 border border-rose-500/25 rounded-2xl">
                  <p className="text-[10px] text-slate-400 font-bold uppercase">ขาดงาน (Absent)</p>
                  <p className="text-lg font-black text-rose-500 font-mono mt-0.5">{myStats.absent_count || 0}</p>
                  <p className="text-[8px] text-slate-400">ครั้ง</p>
                </div>
                <div className="p-2.5 bg-blue-500/10 border border-blue-500/25 rounded-2xl">
                  <p className="text-[10px] text-slate-400 font-bold uppercase">ลา (Leave)</p>
                  <p className="text-lg font-black text-blue-400 font-mono mt-0.5">{myStats.leave_count || 0}</p>
                  <p className="text-[8px] text-slate-400">ครั้ง</p>
                </div>
                <div className="p-2.5 bg-amber-500/10 border border-amber-500/25 rounded-2xl">
                  <p className="text-[10px] text-slate-400 font-bold uppercase">มาสาย (Late)</p>
                  <p className="text-lg font-black text-amber-500 font-mono mt-0.5">{myStats.late_count || 0}</p>
                  <p className="text-[8px] text-slate-400">ครั้ง</p>
                </div>
                <div className="p-2.5 bg-red-500/15 border border-red-500/35 rounded-2xl">
                  <p className="text-[10px] text-red-500 font-bold uppercase">ใบเตือน (Warning)</p>
                  <p className="text-lg font-black text-red-600 font-mono mt-0.5">{myStats.warning_letters || 0}</p>
                  <p className="text-[8px] text-red-500 font-bold">ใบ</p>
                </div>
              </div>
            </GlassCard>

            {/* Accumulated Points breakdown card */}
            <GlassCard className="p-6 space-y-4">
              <div className="flex items-center gap-2">
                <Trophy className="text-warehouse-orange" size={18} />
                <h4 className="font-bold text-sm text-slate-800 dark:text-white">คะแนนสะสมแยกตามหัวข้อ</h4>
              </div>

              <div className="space-y-3.5 pt-2">
                <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-white/5 border border-slate-200/50 dark:border-white/5 rounded-2xl">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center">
                      <Briefcase size={15} />
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">ส่งงานสำเร็จ</p>
                      <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 mt-0.5">{myStats.completed_tasks} เรื่อง</p>
                    </div>
                  </div>
                  <span className="font-mono text-xs font-bold text-amber-500">+{myStats.completed_tasks * myStats.settings.points_per_task} Pts</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-white/5 border border-slate-200/50 dark:border-white/5 rounded-2xl">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center">
                      <BookOpen size={15} />
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">อบรมผ่านหลักสูตร</p>
                      <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 mt-0.5">{myStats.completed_courses} บทเรียน</p>
                    </div>
                  </div>
                  <span className="font-mono text-xs font-bold text-blue-500">+{myStats.completed_courses * myStats.settings.points_per_course} Pts</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-white/5 border border-slate-200/50 dark:border-white/5 rounded-2xl">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                      <Award size={15} />
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">สอบผ่านแบบทดสอบ</p>
                      <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 mt-0.5">{myStats.passed_quizzes} ครั้ง</p>
                    </div>
                  </div>
                  <span className="font-mono text-xs font-bold text-emerald-500">+{myStats.passed_quizzes * myStats.settings.points_per_quiz} Pts</span>
                </div>
              </div>
            </GlassCard>

          </div>

          {/* Right Column: Evaluation Score */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* KPI 100 Score card */}
            <GlassCard className="p-6 flex flex-col md:flex-row items-center gap-8 border border-slate-200/50 dark:border-white/5">
              
              {/* Circular Gauge */}
              <div className="relative w-36 h-36 flex items-center justify-center shrink-0">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle 
                    cx="50" cy="50" r="42" 
                    className="stroke-slate-200 dark:stroke-white/5" 
                    strokeWidth="8" fill="transparent" 
                  />
                  <circle 
                    cx="50" cy="50" r="42" 
                    className="stroke-emerald-500 transition-all duration-1000" 
                    strokeWidth="8" fill="transparent"
                    strokeDasharray={2 * Math.PI * 42}
                    strokeDashoffset={2 * Math.PI * 42 * (1 - myStats.evaluation_score / 100)}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute flex flex-col items-center justify-center">
                  <span className="text-3xl font-black text-slate-800 dark:text-white font-mono">{myStats.evaluation_score}</span>
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">คะแนนเต็ม 100</span>
                </div>
              </div>

              {/* Status and Information */}
              <div className="space-y-3.5 flex-1 w-full text-center md:text-left">
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">คะแนนประเมินผลงานปลายปี</p>
                  <h4 className="text-xl font-bold text-slate-800 dark:text-white mt-1">เกณฑ์ผลประเมินประจำปี</h4>
                </div>
                
                <div className={`inline-flex px-4 py-2 border rounded-2xl text-xs font-bold ${gradeInfo.bg} ${gradeInfo.color}`}>
                  {gradeInfo.text} (Grade {gradeInfo.grade})
                </div>

                <p className="text-slate-400 text-xs leading-relaxed">
                  คะแนนประเมินนี้คำนวณและตั้งค่าโดยผู้บริหารสูงสุด (Admin) โดยอิงตามพฤติกรรมการเข้าเรียนอบรม, ความแม่นยำในการปฏิบัติงานคลัง, อัตราความปลอดภัย (Safety) และการส่งงานประจำวัน
                </p>
              </div>

            </GlassCard>

            {/* Point values legend */}
            <GlassCard className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Settings className="text-warehouse-orange" size={18} />
                <h4 className="font-bold text-sm text-slate-800 dark:text-white">เกณฑ์การคิดคำนวณคะแนนสะสม</h4>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                ระบบสะสมคะแนนมีผลโดยตรงต่อการจัดอันดับและคะแนนความก้าวหน้าของพนักงาน โดยแอดมินเป็นผู้กำหนดมูลค่าคะแนนสะสมของแต่ละกิจกรรมดังนี้:
              </p>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-3 bg-slate-50 dark:bg-white/5 border border-slate-200/50 dark:border-white/5 rounded-2xl">
                  <p className="text-[10px] text-slate-400 font-semibold">งานสำเร็จ</p>
                  <p className="text-base font-bold text-slate-700 dark:text-slate-200 mt-1">+{myStats.settings.points_per_task} คะแนน</p>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-white/5 border border-slate-200/50 dark:border-white/5 rounded-2xl">
                  <p className="text-[10px] text-slate-400 font-semibold">จบคอร์สเรียน</p>
                  <p className="text-base font-bold text-slate-700 dark:text-slate-200 mt-1">+{myStats.settings.points_per_course} คะแนน</p>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-white/5 border border-slate-200/50 dark:border-white/5 rounded-2xl">
                  <p className="text-[10px] text-slate-400 font-semibold">ผ่านข้อสอบ</p>
                  <p className="text-base font-bold text-slate-700 dark:text-slate-200 mt-1">+{myStats.settings.points_per_quiz} คะแนน</p>
                </div>
              </div>
            </GlassCard>

          </div>

        </div>
      </div>
    );
  }

  // RENDER ADMIN / STAFF PERFORMANCE VIEW
  const chartData = employees.map(emp => ({
    name: emp.name.split(' ')[0],
    'คะแนนสะสม': emp.accumulated_points,
    'คะแนนประเมิน': emp.evaluation_score
  }));

  return (
    <div className="space-y-8">
      
      {/* Top Title Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">ระบบประเมินผลงาน & KPI พนักงานคลัง</h2>
          <p className="text-slate-400 text-sm mt-1">จัดการคะแนนประเมินและตั้งค่ากฎระเบียบ ขาด/ลา/สาย/ใบเตือน พนักงานและ Staff</p>
        </div>
        <button 
          onClick={openSettings}
          className="px-4 py-2.5 rounded-xl bg-warehouse-orange hover:bg-warehouse-orange/90 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-warehouse-orange/15 transition-all"
        >
          <Settings size={14} />
          <span>ตั้งเกณฑ์คะแนนสะสม (Settings)</span>
        </button>
      </div>

      {/* Compare Chart */}
      <GlassCard className="p-5">
        <h4 className="font-bold text-xs text-slate-400 mb-4 uppercase tracking-wider">กราฟวิเคราะห์คะแนนสะสมและคะแนนประเมินของพนักงานและหัวหน้างาน</h4>
        <div className="w-full h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#475569" opacity={0.15} />
              <XAxis dataKey="name" stroke="#94a3b8" tick={{ fontSize: 10 }} />
              <YAxis stroke="#94a3b8" tick={{ fontSize: 10 }} />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '11px' }} />
              <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} />
              <Bar dataKey="คะแนนสะสม" fill="#F26522" radius={[4, 4, 0, 0]} />
              <Bar dataKey="คะแนนประเมิน" fill="#10B981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </GlassCard>

      {/* Employees & Staff Performance Table */}
      <GlassCard className="p-0 overflow-hidden border border-slate-200/50 dark:border-white/5">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200/50 dark:border-white/5 bg-slate-100/50 dark:bg-white/5 text-slate-400 font-bold uppercase tracking-wider">
                <th className="py-4 px-6">รายชื่อ</th>
                <th className="py-4 px-4 text-center">บทบาท (Role)</th>
                <th className="py-4 px-4 text-center">ส่งงานสำเร็จ</th>
                <th className="py-4 px-4 text-center">หลักสูตรสำเร็จ</th>
                <th className="py-4 px-4 text-center">ขาด/ลา/สาย</th>
                <th className="py-4 px-4 text-center">ใบเตือน (Warning)</th>
                <th className="py-4 px-4 text-center">คะแนนสะสมรวม</th>
                <th className="py-4 px-4 text-center">คะแนนประเมิน (100)</th>
                <th className="py-4 px-6 text-right">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5 text-slate-600 dark:text-slate-300">
              {employees.map(emp => {
                const gradeInfo = getScoreGradeText(emp.evaluation_score);
                
                return (
                  <tr key={emp.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                    <td className="py-4 px-6 flex items-center gap-3">
                      {emp.photo_url ? (
                        <img 
                          src={emp.photo_url} 
                          alt={emp.name} 
                          className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-white/10 bg-slate-800"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center font-bold text-slate-400 text-sm">
                          {emp.name.charAt(0)}
                        </div>
                      )}
                      <div>
                        <p className="font-bold text-slate-700 dark:text-slate-100">{emp.name}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">{emp.employee_id} • {emp.position}</p>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                        emp.role === 'staff' 
                          ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' 
                          : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                      }`}>
                        {emp.role}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center font-semibold text-slate-700 dark:text-slate-200">{emp.completed_tasks} เรื่อง</td>
                    <td className="py-4 px-4 text-center font-semibold text-slate-700 dark:text-slate-200">{emp.completed_courses} เรื่อง</td>
                    <td className="py-4 px-4 text-center">
                      <div className="flex flex-col items-center">
                        <span className="font-bold text-slate-600 dark:text-slate-300">
                          {emp.absent_count} / {emp.leave_count} / {emp.late_count}
                        </span>
                        <span className="text-[9px] text-slate-400 mt-0.5">ขาด / ลา / สาย</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-center">
                      {emp.warning_letters > 0 ? (
                        <span className="px-2 py-0.5 rounded-xl bg-rose-500/20 text-rose-500 font-mono font-bold border border-rose-500/35 animate-pulse">
                          {emp.warning_letters} ใบ
                        </span>
                      ) : (
                        <span className="text-slate-400 font-mono">-</span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className="px-2.5 py-1 bg-warehouse-orange/10 text-warehouse-orange font-mono font-bold rounded-xl">
                        {emp.accumulated_points} Pts
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <div className="flex flex-col items-center">
                        <span className="font-mono font-extrabold text-sm text-slate-700 dark:text-white">
                          {emp.evaluation_score}
                        </span>
                        <span className={`text-[9px] font-bold mt-0.5 ${gradeInfo.color}`}>
                          Grade {gradeInfo.grade}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button 
                        onClick={() => openEditScore(emp)}
                        className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-white/10 hover:border-warehouse-orange hover:text-warehouse-orange text-[10px] font-bold transition-all inline-flex items-center gap-1"
                      >
                        <Edit3 size={11} />
                        <span>ปรับข้อมูลผลงาน</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </GlassCard>

      {/* EDIT EVALUATION SCORE & ATTENDANCE STATS MODAL */}
      {showScoreModal && selectedEmp && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <GlassCard className="w-full max-w-md overflow-hidden border border-white/10" animate={false}>
            <div className="flex items-center justify-between pb-4 border-b border-slate-200/50 dark:border-white/5 mb-6">
              <h3 className="font-bold text-sm">ปรับปรุงผลงานและสถิติวินัย (Edit Stats)</h3>
              <button onClick={() => setShowScoreModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={handleSaveScore} className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-white/5 border border-slate-200/50 dark:border-white/5 rounded-2xl mb-4">
                {selectedEmp.photo_url ? (
                  <img src={selectedEmp.photo_url} alt="" className="w-10 h-10 rounded-full object-cover" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-400 font-bold">{selectedEmp.name.charAt(0)}</div>
                )}
                <div>
                  <p className="font-bold text-xs">{selectedEmp.name} ({selectedEmp.role})</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{selectedEmp.position} • {selectedEmp.employee_id}</p>
                </div>
              </div>

              {/* Grid for Score and Points */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">คะแนนประเมินปลายปี (0-100)</label>
                  <input 
                    type="number" 
                    min="0" 
                    max="100" 
                    required 
                    value={inputScore} 
                    onChange={(e) => setInputScore(e.target.value)} 
                    className="glass-input text-xs" 
                    placeholder="คะแนนเต็ม 100" 
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">คะแนนสะสม (Total Points)</label>
                  <input 
                    type="number" 
                    min="0" 
                    required 
                    value={inputPoints} 
                    onChange={(e) => setInputPoints(e.target.value)} 
                    className="glass-input text-xs" 
                    placeholder="คะแนนสะสมรวม" 
                  />
                </div>
              </div>

              {/* Grid for Attendance counters */}
              <div className="grid grid-cols-3 gap-4 border-t border-slate-200/30 dark:border-white/5 pt-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] font-bold text-rose-400 uppercase">ขาดงาน (ครั้ง)</label>
                  <input 
                    type="number" 
                    min="0" 
                    required 
                    value={inputAbsent} 
                    onChange={(e) => setInputAbsent(e.target.value)} 
                    className="glass-input text-xs border-rose-500/20" 
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] font-bold text-blue-400 uppercase">ลางาน (ครั้ง)</label>
                  <input 
                    type="number" 
                    min="0" 
                    required 
                    value={inputLeave} 
                    onChange={(e) => setInputLeave(e.target.value)} 
                    className="glass-input text-xs border-blue-500/20" 
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] font-bold text-amber-400 uppercase">มาสาย (ครั้ง)</label>
                  <input 
                    type="number" 
                    min="0" 
                    required 
                    value={inputLate} 
                    onChange={(e) => setInputLate(e.target.value)} 
                    className="glass-input text-xs border-amber-500/20" 
                  />
                </div>
              </div>

              {/* Warning Letters Input */}
              <div className="flex flex-col gap-1.5 border-t border-slate-200/30 dark:border-white/5 pt-3">
                <label className="text-[10px] font-bold text-red-500 uppercase flex items-center gap-1">
                  <FileText size={12} />
                  <span>จำนวนใบเตือนที่ได้รับ (ใบ)</span>
                </label>
                <input 
                  type="number" 
                  min="0" 
                  required 
                  value={inputWarning} 
                  onChange={(e) => setInputWarning(e.target.value)} 
                  className="glass-input text-xs border-red-500/20 text-red-500 font-bold" 
                  placeholder="จำนวนใบเตือนสะสม" 
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200/50 dark:border-white/5">
                <button type="button" onClick={() => setShowScoreModal(false)} className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-xs font-semibold">ยกเลิก</button>
                <button type="submit" className="px-4 py-2 rounded-xl bg-warehouse-orange hover:bg-warehouse-orange/90 text-white text-xs font-bold flex items-center gap-1 shadow-md shadow-warehouse-orange/15">
                  <Save size={13} />
                  <span>บันทึกข้อมูล</span>
                </button>
              </div>
            </form>
          </GlassCard>
        </div>
      )}

      {/* PERFORMANCE POINT SETTINGS MODAL */}
      {showSettingsModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <GlassCard className="w-full max-w-md overflow-hidden border border-white/10" animate={false}>
            <div className="flex items-center justify-between pb-4 border-b border-slate-200/50 dark:border-white/5 mb-6">
              <h3 className="font-bold text-sm">ตั้งเกณฑ์คะแนนสะสมพนักงาน</h3>
              <button onClick={() => setShowSettingsModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={handleSaveSettings} className="space-y-4">
              <p className="text-[11px] text-slate-400 mb-4 leading-relaxed">
                กำหนดคะแนนที่พนักงานจะได้รับเมื่อทำแต่ละกิจกรรมสำเร็จสำเร็จ คะแนนเหล่านี้จะถูกคำนวณและสะสมโดยอัตโนมัติในทุกส่วนของเว็บ
              </p>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase">คะแนนต่องานส่งมอบสำเร็จ (Points per Task)</label>
                <input 
                  type="number" 
                  required 
                  value={inputPointsTask} 
                  onChange={(e) => setInputPointsTask(e.target.value)} 
                  className="glass-input text-xs" 
                  placeholder="เช่น 10" 
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase">คะแนนต่อคอร์สเรียนสำเร็จ (Points per Course)</label>
                <input 
                  type="number" 
                  required 
                  value={inputPointsCourse} 
                  onChange={(e) => setInputPointsCourse(e.target.value)} 
                  className="glass-input text-xs" 
                  placeholder="เช่น 20" 
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase">คะแนนต่อทำควิซผ่านสำเร็จ (Points per Quiz)</label>
                <input 
                  type="number" 
                  required 
                  value={inputPointsQuiz} 
                  onChange={(e) => setInputPointsQuiz(e.target.value)} 
                  className="glass-input text-xs" 
                  placeholder="เช่น 15" 
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200/50 dark:border-white/5">
                <button type="button" onClick={() => setShowSettingsModal(false)} className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-xs font-semibold">ยกเลิก</button>
                <button type="submit" className="px-4 py-2 rounded-xl bg-warehouse-orange hover:bg-warehouse-orange/90 text-white text-xs font-bold flex items-center gap-1 shadow-md shadow-warehouse-orange/15">
                  <Save size={13} />
                  <span>บันทึกตั้งค่า</span>
                </button>
              </div>
            </form>
          </GlassCard>
        </div>
      )}

    </div>
  );
}
