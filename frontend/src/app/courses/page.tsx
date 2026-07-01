'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import GlassCard from '../../components/GlassCard';
import { 
  BookOpen, 
  Search, 
  Filter, 
  Plus, 
  Play, 
  Clock, 
  Award, 
  Bookmark, 
  User, 
  X,
  PlusCircle,
  HelpCircle,
  Upload,
  Trash2,
  Sliders
} from 'lucide-react';
import Link from 'next/link';

const formatYoutubeUrl = (url: string) => {
  if (!url) return '';
  if (url.includes('youtube.com/embed/')) return url;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  if (match && match[2].length === 11) {
    return `https://www.youtube.com/embed/${match[2]}`;
  }
  return url;
};

export default function CoursesPage() {
  const { api, user } = useAuth();
  const [courses, setCourses] = useState<any[]>([]);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('');
  
  // Modal states
  const [showCreateCourseModal, setShowCreateCourseModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<any>(null);

  // Course Builder states
  const [showBuilderModal, setShowBuilderModal] = useState(false);
  const [builderCourse, setBuilderCourse] = useState<any>(null);
  const [builderChapters, setBuilderChapters] = useState<any[]>([]);
  const [activeChapterId, setActiveChapterId] = useState<any>(null);
  const [builderLessons, setBuilderLessons] = useState<any[]>([]);
  const [activeLessonId, setActiveLessonId] = useState<any>(null);

  // File upload states inside builder
  const [uploadMode, setUploadMode] = useState<'link' | 'file'>('link');
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  
  // Creation form fields inside builder
  const [newChapterTitle, setNewChapterTitle] = useState('');
  const [newLessonForm, setNewLessonForm] = useState({
    title: '',
    content_type: 'video',
    content_url: '',
    body_text: ''
  });
  const [newQuestionForm, setNewQuestionForm] = useState({
    question_text: '',
    option1: '',
    option2: '',
    option3: '',
    option4: '',
    correct_index: '0'
  });

  // Form states
  const [courseForm, setCourseForm] = useState({
    name: '',
    description: '',
    duration_minutes: '120',
    category: 'Safety',
    instructor: user?.name || 'Senior Trainer',
    difficulty: 'beginner',
    estimated_time: '2 ชั่วโมง'
  });

  const [editingCourseId, setEditingCourseId] = useState<number | null>(null);
  const [editingLessonId, setEditingLessonId] = useState<number | null>(null);

  const [assignForm, setAssignForm] = useState({
    employee_id: '',
    due_date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 15 days default
  });

  const openCourseBuilder = async (course: any) => {
    setBuilderCourse(course);
    setShowBuilderModal(true);
    try {
      const res = await api.get(`/api/courses/${course.id}`);
      setBuilderChapters(res.data.chapters || []);
      if (res.data.chapters?.length > 0) {
        setActiveChapterId(res.data.chapters[0].id);
        setBuilderLessons(res.data.chapters[0].lessons || []);
        if (res.data.chapters[0].lessons?.length > 0) {
          setActiveLessonId(res.data.chapters[0].lessons[0].id);
        }
      } else {
        setActiveChapterId(null);
        setBuilderLessons([]);
        setActiveLessonId(null);
      }
    } catch {
      // Mock Fallback matching seeds
      setBuilderChapters([
        { id: 1, title: 'บทนำและกฎความปลอดภัยทั่วไป' },
        { id: 2, title: 'อุปกรณ์ป้องกันภัยส่วนบุคคล (PPE)' }
      ]);
      setActiveChapterId(1);
      setBuilderLessons([
        { id: 1, title: 'ความปลอดภัยคือหัวใจหลัก', content_type: 'video', content_url: 'https://www.youtube.com/embed/5F7Jt5pUlyU' },
        { id: 2, title: 'คู่มือมาตรการป้องกันอุบัติเหตุ PDF', content_type: 'document', content_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' }
      ]);
      setActiveLessonId(1);
    }
  };

  const handleSelectChapter = async (chapId: number) => {
    setActiveChapterId(chapId);
    try {
      const res = await api.get(`/api/courses/${builderCourse.id}`);
      const matched = res.data.chapters?.find((c: any) => c.id === chapId);
      setBuilderLessons(matched?.lessons || []);
      if (matched?.lessons?.length > 0) {
        setActiveLessonId(matched.lessons[0].id);
      } else {
        setActiveLessonId(null);
      }
    } catch {
      if (chapId === 1) {
        setBuilderLessons([
          { id: 1, title: 'ความปลอดภัยคือหัวใจหลัก', content_type: 'video', content_url: 'https://www.youtube.com/embed/5F7Jt5pUlyU' },
          { id: 2, title: 'คู่มือมาตรการป้องกันอุบัติเหตุ PDF', content_type: 'document', content_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' }
        ]);
        setActiveLessonId(1);
      } else {
        setBuilderLessons([
          { id: 3, title: 'ประเภทและการใช้งานอุปกรณ์ PPE', content_type: 'video', content_url: 'https://www.youtube.com/embed/kR66aN42mCc' }
        ]);
        setActiveLessonId(3);
      }
    }
  };

  const handleCreateChapter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!builderCourse || !newChapterTitle) return;
    try {
      const res = await api.post(`/api/courses/${builderCourse.id}/chapters`, { title: newChapterTitle });
      setBuilderChapters([...builderChapters, res.data]);
      setActiveChapterId(res.data.id);
      setBuilderLessons([]);
      setNewChapterTitle('');
    } catch {
      const mockChapter = { id: Date.now(), course_id: builderCourse.id, title: newChapterTitle, sort_order: builderChapters.length };
      setBuilderChapters([...builderChapters, mockChapter]);
      setActiveChapterId(mockChapter.id);
      setBuilderLessons([]);
      setNewChapterTitle('');
    }
  };

  const handleEditChapter = async (chapId: number, title: string) => {
    try {
      const res = await api.put(`/api/courses/chapters/${chapId}`, { title });
      setBuilderChapters(builderChapters.map(c => c.id === chapId ? res.data : c));
    } catch {
      setBuilderChapters(builderChapters.map(c => c.id === chapId ? { ...c, title } : c));
    }
  };

  const handleDeleteChapter = async (chapId: number) => {
    if (!confirm('คุณแน่ใจว่าต้องการลบบทเรียนย่อยนี้และเนื้อหาทั้งหมดภายใน?')) return;
    try {
      await api.delete(`/api/courses/chapters/${chapId}`);
      setBuilderChapters(builderChapters.filter(c => c.id !== chapId));
      if (activeChapterId === chapId) {
        setActiveChapterId(null);
        setBuilderLessons([]);
        setActiveLessonId(null);
      }
    } catch {
      setBuilderChapters(builderChapters.filter(c => c.id !== chapId));
      if (activeChapterId === chapId) {
        setActiveChapterId(null);
        setBuilderLessons([]);
        setActiveLessonId(null);
      }
    }
  };

  const handleCreateLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeChapterId || !newLessonForm.title) return;

    // Format YouTube URL
    const formattedUrl = newLessonForm.content_type === 'video'
      ? formatYoutubeUrl(newLessonForm.content_url)
      : newLessonForm.content_url;

    const formattedLessonForm = {
      ...newLessonForm,
      content_url: formattedUrl
    };

    try {
      if (editingLessonId) {
        const res = await api.put(`/api/courses/lessons/${editingLessonId}`, formattedLessonForm);
        setBuilderLessons(builderLessons.map(l => l.id === editingLessonId ? res.data : l));
        setEditingLessonId(null);
      } else {
        const res = await api.post(`/api/courses/chapters/${activeChapterId}/lessons`, formattedLessonForm);
        setBuilderLessons([...builderLessons, res.data]);
        setActiveLessonId(res.data.id);
      }
      setNewLessonForm({ title: '', content_type: 'video', content_url: '', body_text: '' });
      setUploadedFileName('');
    } catch {
      if (editingLessonId) {
        setBuilderLessons(builderLessons.map(l => l.id === editingLessonId ? { ...l, ...formattedLessonForm } : l));
        setEditingLessonId(null);
      } else {
        const mockLesson = { id: Date.now(), chapter_id: activeChapterId, ...formattedLessonForm, sort_order: builderLessons.length };
        setBuilderLessons([...builderLessons, mockLesson]);
        setActiveLessonId(mockLesson.id);
      }
      setNewLessonForm({ title: '', content_type: 'video', content_url: '', body_text: '' });
      setUploadedFileName('');
    }
  };

  const startEditLesson = (les: any) => {
    setEditingLessonId(les.id);
    setNewLessonForm({
      title: les.title,
      content_type: les.content_type,
      content_url: les.content_url || '',
      body_text: les.body_text || ''
    });
    setUploadMode(les.content_url && les.content_url.startsWith('data:') ? 'file' : 'link');
    if (les.content_url && les.content_url.startsWith('data:')) {
      setUploadedFileName('ไฟล์อัปโหลดเดิม');
    } else {
      setUploadedFileName('');
    }
  };

  const handleDeleteLesson = async (lesId: number) => {
    if (!confirm('คุณแน่ใจว่าต้องการลบเนื้อหาบทเรียนนี้?')) return;
    try {
      await api.delete(`/api/courses/lessons/${lesId}`);
      setBuilderLessons(builderLessons.filter(l => l.id !== lesId));
      if (activeLessonId === lesId) {
        setActiveLessonId(null);
      }
    } catch {
      setBuilderLessons(builderLessons.filter(l => l.id !== lesId));
      if (activeLessonId === lesId) {
        setActiveLessonId(null);
      }
    }
  };

  const handleDeleteQuestion = async (qId: number) => {
    try {
      await api.delete(`/api/courses/questions/${qId}`);
    } catch {
      // Mock delete fallback
    }
    setBuilderLessons(prev => prev.map(les => {
      if (les.id === activeLessonId) {
        return {
          ...les,
          questions: (les.questions || []).filter((q: any) => q.id !== qId)
        };
      }
      return les;
    }));
  };

  const handleCreateQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeLessonId || !newQuestionForm.question_text) return;
    const options = [newQuestionForm.option1, newQuestionForm.option2, newQuestionForm.option3, newQuestionForm.option4].filter(Boolean);
    const correctIndex = parseInt(newQuestionForm.correct_index, 10);
    const payload = {
      question_text: newQuestionForm.question_text,
      question_type: 'multiple_choice',
      options,
      correct_answers: [correctIndex],
      points: 1
    };
    try {
      const res = await api.post(`/api/courses/lessons/${activeLessonId}/questions`, payload);
      setBuilderLessons(prev => prev.map(les => {
        if (les.id === activeLessonId) {
          return {
            ...les,
            questions: [...(les.questions || []), res.data]
          };
        }
        return les;
      }));
      alert('บันทึกคำถามข้อสอบเสร็จสิ้น');
      setNewQuestionForm({ question_text: '', option1: '', option2: '', option3: '', option4: '', correct_index: '0' });
    } catch {
      const mockQ = {
        id: Date.now(),
        lesson_id: activeLessonId,
        question_type: 'multiple_choice',
        question_text: newQuestionForm.question_text,
        options,
        correct_answers: [correctIndex],
        points: 1
      };
      setBuilderLessons(prev => prev.map(les => {
        if (les.id === activeLessonId) {
          return {
            ...les,
            questions: [...(les.questions || []), mockQ]
          };
        }
        return les;
      }));
      alert('บันทึกคำถามข้อสอบเสร็จสิ้น (Mock)');
      setNewQuestionForm({ question_text: '', option1: '', option2: '', option3: '', option4: '', correct_index: '0' });
    }
  };

  const handleUpdateCourseCover = async (base64Image: string) => {
    if (!builderCourse) return;
    try {
      const res = await api.put(`/api/courses/${builderCourse.id}`, { cover_image: base64Image });
      setBuilderCourse(res.data);
      loadData();
    } catch {
      builderCourse.cover_image = base64Image;
      setBuilderCourse({ ...builderCourse });
      loadData();
    }
  };

  const loadData = async () => {
    try {
      const coursesRes = await api.get('/api/courses');
      setCourses(coursesRes.data);

      if (user) {
        const enrollRes = await api.get(`/api/courses/enrollments/employee/${user.id}`);
        setEnrollments(enrollRes.data);

        // Fetch employee lists to assign courses (Supervisors/Trainers)
        if (user.role !== 'employee') {
          const empRes = await api.get('/api/employees');
          setEmployees(empRes.data.filter((e: any) => e.role === 'employee'));
        }
      }
    } catch (err) {
      console.warn('API error fetching courses, using fallback mock catalog.');
      const mockList = [
        { id: 1, name: 'Warehouse Safety & Accident Prevention (ความปลอดภัยคลังสินค้า)', description: 'หลักสูตรพื้นฐานความปลอดภัยคลังสินค้า', duration_minutes: 120, category: 'Safety', instructor: 'นรินทร์ เก่งการ', difficulty: 'beginner', estimated_time: '2 ชั่วโมง' },
        { id: 2, name: 'Forklift Operations Masterclass (การขับรถยกสินค้าและมาตรฐานความปลอดภัย)', description: 'การขับขี่รถยกไฟฟ้า Forklift อย่างถูกวิธี', duration_minutes: 240, category: 'Forklift', instructor: 'นรินทร์ เก่งการ', difficulty: 'intermediate', estimated_time: '4 ชั่วโมง' },
        { id: 3, name: 'Smart Warehouse WMS & RF Scanner Operations (การใช้เครื่องสแกน RF และระบบจัดการคลัง)', description: 'การใช้เครื่องสแกนเนอร์บาร์โค้ด RF', duration_minutes: 180, category: 'RF Scanner', instructor: 'นรินทร์ เก่งการ', difficulty: 'intermediate', estimated_time: '3 ชั่วโมง' },
        { id: 4, name: 'High-Performance Picking & Sorting Methods (เทคนิคหยิบสินค้าชั้นเลิศ)', description: 'วิธีการคัดเลือกหยิบและจัดวางพัสดุในคลังสินค้า', duration_minutes: 90, category: 'Picking', instructor: 'สมชาย แสนดี', difficulty: 'beginner', estimated_time: '1.5 ชั่วโมง' },
        { id: 5, name: 'Enterprise 5S Standard (การจัดระบบ 5ส ระดับองค์กร)', description: 'การทำ 5ส และความสะอาดในคลัง', duration_minutes: 60, category: '5S', instructor: 'วิภาดา รักดี', difficulty: 'beginner', estimated_time: '1 ชั่วโมง' }
      ];
      setCourses(mockList);

      setEnrollments([
        { id: 1, course_id: 1, progress_percentage: 100, status: 'completed' },
        { id: 2, course_id: 3, progress_percentage: 50, status: 'in_progress' }
      ]);

      setEmployees([
        { id: 6, employee_id: 'EMP006', name: 'สมปอง ลุยงาน' },
        { id: 7, employee_id: 'EMP007', name: 'อรอนงค์ แพ็กเก่ง' },
        { id: 8, employee_id: 'EMP008', name: 'มานะ คัดของ' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCourseId) {
        const res = await api.put(`/api/courses/${editingCourseId}`, courseForm);
        setCourses(courses.map(c => c.id === editingCourseId ? res.data : c));
      } else {
        const res = await api.post('/api/courses', courseForm);
        setCourses([...courses, res.data]);
      }
      setShowCreateCourseModal(false);
      resetCourseForm();
    } catch {
      // Mock append/edit
      if (editingCourseId) {
        setCourses(courses.map(c => c.id === editingCourseId ? {
          ...c,
          ...courseForm,
          duration_minutes: parseInt(courseForm.duration_minutes, 10)
        } : c));
      } else {
        const mockCourse = {
          id: Date.now(),
          ...courseForm,
          duration_minutes: parseInt(courseForm.duration_minutes, 10)
        };
        setCourses([...courses, mockCourse]);
      }
      setShowCreateCourseModal(false);
      resetCourseForm();
    }
  };

  const openEditCourse = (course: any) => {
    setEditingCourseId(course.id);
    setCourseForm({
      name: course.name,
      description: course.description,
      duration_minutes: String(course.duration_minutes),
      category: course.category,
      instructor: course.instructor,
      difficulty: course.difficulty,
      estimated_time: course.estimated_time
    });
    setShowCreateCourseModal(true);
  };

  const handleDeleteCourse = async (courseId: number) => {
    if (!confirm('คุณแน่ใจว่าต้องการลบหลักสูตรนี้และบทเรียนทั้งหมดที่อยู่ภายใน? ข้อมูลการลงทะเบียนเรียนของพนักงานจะถูกลบไปด้วย')) return;
    try {
      await api.delete(`/api/courses/${courseId}`);
      loadData();
    } catch {
      setCourses(courses.filter(c => c.id !== courseId));
    }
  };

  const handleAssignCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourse) return;

    const payload = {
      employee_id: assignForm.employee_id,
      course_id: selectedCourse.id,
      due_date: assignForm.due_date
    };

    try {
      await api.post('/api/courses/enroll', payload);
      alert('มอบหมายหลักสูตรให้พนักงานเสร็จสิ้น');
      setShowAssignModal(false);
    } catch {
      alert('มอบหมายหลักสูตรให้พนักงานเสร็จสิ้น (Mock)');
      setShowAssignModal(false);
    }
  };

  const handleSelfEnroll = async (courseId: number) => {
    try {
      const res = await api.post('/api/courses/enroll', {
        employee_id: user?.id,
        course_id: courseId
      });
      // Refresh enrollments
      loadData();
      alert('ลงทะเบียนเข้าเรียนสำเร็จ');
    } catch {
      const mockEnroll = {
        id: Date.now(),
        course_id: courseId,
        progress_percentage: 0,
        status: 'pending' as const
      };
      setEnrollments([...enrollments, mockEnroll]);
      alert('ลงทะเบียนเข้าเรียนสำเร็จ (Mock)');
    }
  };

  const resetCourseForm = () => {
    setEditingCourseId(null);
    setCourseForm({
      name: '',
      description: '',
      duration_minutes: '120',
      category: 'Safety',
      instructor: user?.name || 'Senior Trainer',
      difficulty: 'beginner',
      estimated_time: '2 ชั่วโมง'
    });
  };

  // Helper values
  const getEnrollment = (courseId: number) => {
    return enrollments.find(e => e.course_id === courseId);
  };

  const getDifficultyLabel = (diff: string) => {
    switch (diff) {
      case 'beginner': return 'เริ่มต้น (Beginner)';
      case 'intermediate': return 'ปานกลาง (Intermediate)';
      case 'advanced': return 'ขั้นสูง (Advanced)';
      default: return diff;
    }
  };

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case 'beginner': return 'bg-sky-500/10 text-sky-500';
      case 'intermediate': return 'bg-amber-500/10 text-amber-500';
      default: return 'bg-rose-500/10 text-rose-500';
    }
  };

  // Filters
  const filteredCourses = courses.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase()) || 
                          c.description.toLowerCase().includes(search.toLowerCase());
    const matchesCat = catFilter ? c.category === catFilter : true;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-8 relative">
      
      {/* Header Info */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">คลังหลักสูตรการฝึกอบรม (Training Library)</h2>
          <p className="text-slate-400 text-sm mt-1">คลังวิดีโอ เอกสาร และแบบทดสอบวัดระดับทักษะความรู้ในการบริหารจัดการคลังสินค้า</p>
        </div>
        {user && ['admin', 'staff'].includes(user.role) && (
          <button 
            onClick={() => { resetCourseForm(); setShowCreateCourseModal(true); }}
            className="px-4 py-2.5 rounded-xl bg-warehouse-orange hover:bg-warehouse-orange/90 text-white text-xs font-bold flex items-center gap-1 shadow-md shadow-warehouse-orange/15"
          >
            <Plus size={14} />
            <span>สร้างหลักสูตร (Create Course)</span>
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
            placeholder="ค้นหาชื่อวิชา หรือ หมวดหมู่..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white/70 dark:bg-warehouse-slate/50 border border-slate-200 dark:border-white/10 rounded-xl text-slate-700 dark:text-white outline-none focus:border-warehouse-orange text-xs"
          />
        </div>

        {/* Categories */}
        <div className="flex items-center gap-2">
          <Filter size={14} className="text-slate-400" />
          <select
            value={catFilter}
            onChange={(e) => setCatFilter(e.target.value)}
            className="bg-white/70 dark:bg-warehouse-slate/50 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2.5 text-xs text-slate-700 dark:text-white outline-none focus:border-warehouse-orange"
          >
            <option value="">หมวดหมู่วิชาทั้งหมด</option>
            <option value="Safety">Safety (ความปลอดภัย)</option>
            <option value="Forklift">Forklift (การขับขี่รถยก)</option>
            <option value="RF Scanner">RF Scanner (สแกนบาร์โค้ด)</option>
            <option value="Picking">Picking (การหยิบของ)</option>
            <option value="Packing">Packing (การแพ็กของ)</option>
            <option value="5S">5S (ระบบ 5ส)</option>
          </select>
        </div>

      </GlassCard>

      {/* Course Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredCourses.map((course) => {
          const enroll = getEnrollment(course.id);
          
          return (
            <GlassCard key={course.id} hoverEffect className="flex flex-col h-[400px] justify-between relative group border border-slate-200/50 dark:border-white/5 overflow-hidden p-0">
              <div className="h-32 w-full bg-slate-900/10 dark:bg-white/5 relative overflow-hidden flex-shrink-0 border-b border-slate-100 dark:border-white/5">
                {course.cover_image ? (
                  <img src={course.cover_image} alt={course.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-tr from-slate-200 to-slate-300 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center text-slate-400 dark:text-slate-600">
                    <BookOpen size={32} />
                  </div>
                )}
                <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                  <span className="text-[9px] uppercase font-bold text-white bg-warehouse-orange px-2 py-0.5 rounded shadow-sm">
                    {course.category}
                  </span>
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded shadow-sm ${getDifficultyColor(course.difficulty)}`}>
                    {getDifficultyLabel(course.difficulty)}
                  </span>
                </div>
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between">
                <div className="flex-1">
                  <h4 className="font-bold text-xs text-slate-800 dark:text-white group-hover:text-warehouse-orange transition-colors line-clamp-2">
                    {course.name}
                  </h4>
                  <p className="text-slate-400 text-[10px] mt-1.5 line-clamp-2 leading-relaxed">
                    {course.description}
                  </p>
                </div>

                <div className="flex items-center justify-between py-2 border-t border-slate-100 dark:border-white/5 text-[9px] text-slate-400 font-semibold mt-2">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      <Clock size={11} />
                      <span>{course.estimated_time || `${course.duration_minutes} นาที`}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <User size={11} />
                      <span className="truncate max-w-[80px]">{course.instructor}</span>
                    </div>
                  </div>
                  
                  {user && ['admin', 'staff'].includes(user.role) && (
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button 
                        type="button"
                        onClick={() => openCourseBuilder(course)}
                        className="text-warehouse-orange hover:underline text-[9px] font-bold"
                      >
                        จัดการบทเรียน
                      </button>
                      <span className="text-slate-300 dark:text-white/10 text-[9px]">|</span>
                      <button 
                        type="button"
                        onClick={() => openEditCourse(course)}
                        className="text-sky-500 hover:underline text-[9px] font-bold"
                      >
                        แก้ไขวิชา
                      </button>
                      <span className="text-slate-300 dark:text-white/10 text-[9px]">|</span>
                      <button 
                        type="button"
                        onClick={() => handleDeleteCourse(course.id)}
                        className="text-rose-500 hover:underline text-[9px] font-bold"
                      >
                        ลบ
                      </button>
                    </div>
                  )}
                </div>

                <div className="mt-2 pt-2 border-t border-slate-100 dark:border-white/5 flex items-center justify-between gap-3">
                  {enroll ? (
                    <div className="flex-1">
                      <div className="flex justify-between items-center text-[9px] font-bold mb-1">
                        <span className="text-slate-400">{enroll.status === 'completed' ? 'เรียนเสร็จสิ้น' : 'กำลังเรียน'}</span>
                        <span className="text-warehouse-orange font-mono">{enroll.progress_percentage}%</span>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden mb-1">
                        <div 
                          className={`h-full rounded-full transition-all duration-300 ${
                            enroll.status === 'completed' ? 'bg-emerald-500' : 'bg-warehouse-orange'
                          }`} 
                          style={{ width: `${enroll.progress_percentage}%` }} 
                        />
                      </div>
                      <Link 
                        href={`/courses/${course.id}`} 
                        className="w-full py-2 bg-warehouse-orange hover:bg-warehouse-orange/95 text-white rounded-xl text-xs font-bold transition-all text-center flex items-center justify-center gap-1 mt-2.5 shadow-sm"
                      >
                        <Play size={10} />
                        <span>{enroll.status === 'completed' ? 'เข้าทบทวนบทเรียน' : 'เรียนต่อ (Resume)'}</span>
                      </Link>
                    </div>
                  ) : (
                    <div className="flex-1 flex gap-2">
                      {user?.role === 'employee' ? (
                        <button 
                          onClick={() => handleSelfEnroll(course.id)}
                          className="flex-1 py-2 bg-warehouse-navy hover:bg-warehouse-navy/90 text-slate-700 dark:text-white rounded-xl text-xs font-bold transition-all border border-slate-200/50 dark:border-white/5"
                        >
                          ลงทะเบียนเข้าเรียน
                        </button>
                      ) : (
                        <>
                          <button 
                            onClick={() => { setSelectedCourse(course); setAssignForm({ ...assignForm, employee_id: '' }); setShowAssignModal(true); }}
                            className="flex-1 py-2 bg-warehouse-orange hover:bg-warehouse-orange/90 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-warehouse-orange/10 flex items-center justify-center gap-1"
                          >
                            <PlusCircle size={12} />
                            <span>มอบหมายหลักสูตร</span>
                          </button>
                          <Link 
                            href={`/courses/${course.id}`}
                            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-white rounded-xl text-xs font-bold transition-all border border-slate-200/50 dark:border-white/5 flex items-center justify-center"
                          >
                            <Play size={12} />
                          </Link>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </GlassCard>
          );
        })}
      </div>

      {/* CREATE COURSE MODAL */}
      {showCreateCourseModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <GlassCard className="w-full max-w-md overflow-hidden border border-white/10" animate={false}>
            <div className="flex items-center justify-between pb-4 border-b border-slate-200/50 dark:border-white/5 mb-6">
              <h3 className="font-bold text-base">{editingCourseId ? 'แก้ไขข้อมูลหลักสูตร (Edit Course)' : 'สร้างหลักสูตรใหม่ (Create Course)'}</h3>
              <button onClick={() => setShowCreateCourseModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleCreateCourse} className="space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400">ชื่อวิชา / หลักสูตร</label>
                <input type="text" required value={courseForm.name} onChange={(e) => setCourseForm({ ...courseForm, name: e.target.value })} className="glass-input text-xs" placeholder="WMS Standard Training" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400">คำอธิบายรายวิชา</label>
                <textarea rows={3} value={courseForm.description} onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })} className="glass-input text-xs" placeholder="อธิบายเกณฑ์วิชาและวัตถุประสงค์ในการเรียน..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-400">หมวดหมู่ (Category)</label>
                  <select value={courseForm.category} onChange={(e) => setCourseForm({ ...courseForm, category: e.target.value })} className="glass-input text-xs bg-white dark:bg-warehouse-slate">
                    <option value="Safety">Safety</option>
                    <option value="Forklift">Forklift</option>
                    <option value="RF Scanner">RF Scanner</option>
                    <option value="Picking">Picking</option>
                    <option value="Packing">Packing</option>
                    <option value="5S">5S</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-400">ระดับความยาก</label>
                  <select value={courseForm.difficulty} onChange={(e) => setCourseForm({ ...courseForm, difficulty: e.target.value })} className="glass-input text-xs bg-white dark:bg-warehouse-slate">
                    <option value="beginner">Beginner (เริ่มต้น)</option>
                    <option value="intermediate">Intermediate (ปานกลาง)</option>
                    <option value="advanced">Advanced (ขั้นสูง)</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-400">วิทยากร/ครูสอน (Instructor)</label>
                  <input type="text" value={courseForm.instructor} onChange={(e) => setCourseForm({ ...courseForm, instructor: e.target.value })} className="glass-input text-xs" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-400">ระยะเวลาคาดการณ์ (เช่น 2 ชั่วโมง)</label>
                  <input type="text" value={courseForm.estimated_time} onChange={(e) => setCourseForm({ ...courseForm, estimated_time: e.target.value })} className="glass-input text-xs" />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200/50 dark:border-white/5">
                <button type="button" onClick={() => setShowCreateCourseModal(false)} className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-xs font-semibold">ยกเลิก</button>
                <button type="submit" className="px-4 py-2 rounded-xl bg-warehouse-orange hover:bg-warehouse-orange/90 text-white text-xs font-bold shadow-md shadow-warehouse-orange/15">{editingCourseId ? 'บันทึกการแก้ไข' : 'สร้างหลักสูตร'}</button>
              </div>
            </form>
          </GlassCard>
        </div>
      )}

      {/* ASSIGN COURSE MODAL */}
      {showAssignModal && selectedCourse && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <GlassCard className="w-full max-w-sm overflow-hidden border border-white/10" animate={false}>
            <div className="flex items-center justify-between pb-4 border-b border-slate-200/50 dark:border-white/5 mb-6">
              <h3 className="font-bold text-base">มอบหมายวิชาเรียน</h3>
              <button onClick={() => setShowAssignModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleAssignCourse} className="space-y-4">
              <div className="p-3 bg-slate-50 dark:bg-white/5 border border-slate-200/50 dark:border-white/5 rounded-xl text-xs">
                <p className="text-slate-400">วิชาที่จะมอบหมาย:</p>
                <p className="font-bold text-slate-800 dark:text-white mt-0.5">{selectedCourse.name}</p>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400">เลือกพนักงานปลายทาง (Employee)</label>
                <select 
                  required
                  value={assignForm.employee_id} 
                  onChange={(e) => setAssignForm({ ...assignForm, employee_id: e.target.value })} 
                  className="glass-input text-xs bg-white dark:bg-warehouse-slate"
                >
                  <option value="">-- เลือกพนักงาน --</option>
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.name} ({emp.employee_id})</option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400">กำหนดวันสิ้นสุดการเรียน (Due Date)</label>
                <input 
                  type="date" 
                  required
                  value={assignForm.due_date} 
                  onChange={(e) => setAssignForm({ ...assignForm, due_date: e.target.value })} 
                  className="glass-input text-xs" 
                />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200/50 dark:border-white/5">
                <button type="button" onClick={() => setShowAssignModal(false)} className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-xs font-semibold">ยกเลิก</button>
                <button type="submit" className="px-4 py-2 rounded-xl bg-warehouse-orange hover:bg-warehouse-orange/90 text-white text-xs font-bold shadow-md shadow-warehouse-orange/15">บันทึกมอบหมาย</button>
              </div>
            </form>
          </GlassCard>
        </div>
      )}

      {/* COURSE BUILDER MODAL */}
      {showBuilderModal && builderCourse && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 flex items-center justify-center p-4">
          <GlassCard className="w-full max-w-4xl h-[650px] overflow-hidden border border-white/10 flex flex-col justify-between" animate={false}>
            <div className="flex items-center justify-between pb-4 border-b border-slate-200/50 dark:border-white/5 flex-shrink-0">
              <div className="flex items-center gap-2">
                <BookOpen className="text-warehouse-orange" size={20} />
                <h3 className="font-bold text-base">จัดการเนื้อหาหลักสูตร (Course Builder): {builderCourse.name}</h3>
              </div>
              <button onClick={() => setShowBuilderModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6 py-6 overflow-y-auto min-h-0 pr-1">
              <div className="md:col-span-1 space-y-6 flex flex-col justify-start">
                <div className="space-y-2.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">รูปภาพตัวอย่างหลักสูตร (Cover Image)</label>
                  <div className="relative h-28 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200/50 dark:border-white/5 overflow-hidden group">
                    {builderCourse.cover_image ? (
                      <img src={builderCourse.cover_image} alt="Cover Preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 text-xs gap-1.5">
                        <BookOpen size={24} />
                        <span>ไม่มีรูปหน้าปกหลักสูตร</span>
                      </div>
                    )}
                    <label 
                      htmlFor="cover-photo-picker" 
                      className="absolute inset-0 bg-black/50 hover:bg-black/60 rounded-2xl flex items-center justify-center text-white text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    >
                      อัปโหลดรูปภาพ...
                    </label>
                    <input 
                      type="file" 
                      accept="image/*" 
                      id="cover-photo-picker" 
                      className="hidden" 
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => handleUpdateCourseCover(reader.result as string);
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">บทเรียนย่อย (Chapters)</label>
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {builderChapters.map(chap => (
                      <div 
                        key={chap.id}
                        className={`w-full flex items-center justify-between p-2 rounded-xl text-xs font-semibold border transition-all ${
                          activeChapterId === chap.id
                            ? 'bg-warehouse-orange/10 border-warehouse-orange/30 text-warehouse-orange'
                            : 'bg-white dark:bg-white/5 border-slate-200/50 dark:border-white/5 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => handleSelectChapter(chap.id)}
                          className="flex-1 text-left truncate pr-2 font-semibold text-xs"
                        >
                          {chap.title}
                        </button>
                        <div className="flex items-center gap-1 shrink-0 pl-1">
                          <button
                            type="button"
                            onClick={() => {
                              const newTitle = prompt('แก้ไขชื่อบทเรียนย่อย:', chap.title);
                              if (newTitle && newTitle !== chap.title) {
                                handleEditChapter(chap.id, newTitle);
                              }
                            }}
                            className="p-1 text-sky-500 hover:text-sky-400 transition-colors"
                            title="แก้ไขชื่อบทเรียน"
                          >
                            <Sliders size={12} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteChapter(chap.id)}
                            className="p-1 text-rose-500 hover:text-rose-400 transition-colors"
                            title="ลบบทเรียนนี้"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    ))}
                    {builderChapters.length === 0 && (
                      <p className="text-[10px] text-slate-500 py-2">ยังไม่มีบทเรียนย่อย</p>
                    )}
                  </div>

                  <form onSubmit={handleCreateChapter} className="flex gap-2">
                    <input 
                      type="text" 
                      required 
                      value={newChapterTitle} 
                      onChange={(e) => setNewChapterTitle(e.target.value)} 
                      className="glass-input text-[11px] flex-1 py-2 px-3" 
                      placeholder="ชื่อบทเรียนย่อยใหม่..." 
                    />
                    <button type="submit" className="px-3 bg-warehouse-orange text-white text-xs font-bold rounded-xl hover:bg-warehouse-orange/95 shadow-sm">+</button>
                  </form>
                </div>
              </div>

              <div className="md:col-span-2 space-y-6">
                {activeChapterId ? (
                  <div className="space-y-4">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">เนื้อหาในบทเรียน (Lessons)</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2 border-r border-slate-200/50 dark:border-white/5 pr-4 max-h-48 overflow-y-auto">
                        {builderLessons.map(les => (
                          <div
                            key={les.id}
                            className={`w-full p-2 rounded-xl text-[11px] font-medium border transition-all flex items-center justify-between ${
                              activeLessonId === les.id
                                ? 'bg-warehouse-orange/10 border-warehouse-orange/30 text-warehouse-orange'
                                : 'bg-slate-50 dark:bg-white/5 border-slate-200/50 dark:border-white/5 text-slate-600 dark:text-slate-300'
                            }`}
                          >
                            <button
                              type="button"
                              onClick={() => setActiveLessonId(les.id)}
                              className="flex-1 text-left truncate pr-2 font-medium"
                            >
                              <div>{les.title}</div>
                              <span className="text-[8px] uppercase font-bold text-slate-400">{les.content_type}</span>
                            </button>
                            <div className="flex items-center gap-1 shrink-0 pl-1">
                              <button
                                type="button"
                                onClick={() => startEditLesson(les)}
                                className="p-1 text-sky-500 hover:text-sky-400 transition-colors"
                                title="แก้ไขเนื้อหา"
                              >
                                <Sliders size={11} />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteLesson(les.id)}
                                className="p-1 text-rose-500 hover:text-rose-400 transition-colors"
                                title="ลบเนื้อหา"
                              >
                                <Trash2 size={11} />
                              </button>
                            </div>
                          </div>
                        ))}
                        {builderLessons.length === 0 && (
                          <p className="text-[10px] text-slate-500 py-2">ยังไม่มีเนื้อหา</p>
                        )}
                      </div>

                      <form onSubmit={handleCreateLesson} className="space-y-3 bg-slate-50/50 dark:bg-white/5 p-3.5 rounded-2xl border border-slate-200/50 dark:border-white/5">
                        <p className="text-[10px] font-bold text-slate-400">{editingLessonId ? 'แก้ไขเนื้อหา (Edit Lesson)' : 'เพิ่มเนื้อหาใหม่ (Add Lesson)'}</p>
                        <input 
                          type="text" 
                          required 
                          value={newLessonForm.title} 
                          onChange={(e) => setNewLessonForm({ ...newLessonForm, title: e.target.value })} 
                          className="w-full glass-input text-[11px] py-1.5 px-2.5" 
                          placeholder="ชื่อเนื้อหาเรียน..." 
                        />
                        
                        <div className="flex flex-col gap-2">
                          <div className="grid grid-cols-2 gap-2">
                            <select 
                              value={newLessonForm.content_type} 
                              onChange={(e) => {
                                setNewLessonForm({ ...newLessonForm, content_type: e.target.value, content_url: '' });
                                setUploadedFileName('');
                              }} 
                              className="glass-input text-[10px] bg-white dark:bg-warehouse-slate py-1"
                            >
                              <option value="video">วีดีโอ (Video)</option>
                              <option value="document">เอกสาร PDF (Document)</option>
                              <option value="quiz">แบบทดสอบ (Quiz)</option>
                            </select>

                            {newLessonForm.content_type !== 'quiz' && (
                              <div className="flex rounded-lg overflow-hidden border border-slate-200 dark:border-white/10 text-[9px] font-bold bg-white dark:bg-warehouse-slate">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setUploadMode('link');
                                    setNewLessonForm({ ...newLessonForm, content_url: '' });
                                    setUploadedFileName('');
                                  }}
                                  className={`flex-1 py-1 text-center transition-colors ${uploadMode === 'link' ? 'bg-warehouse-orange text-white' : 'text-slate-400'}`}
                                >
                                  ใส่ลิงก์ (URL)
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setUploadMode('file');
                                    setNewLessonForm({ ...newLessonForm, content_url: '' });
                                    setUploadedFileName('');
                                  }}
                                  className={`flex-1 py-1 text-center transition-colors ${uploadMode === 'file' ? 'bg-warehouse-orange text-white' : 'text-slate-400'}`}
                                >
                                  อัปโหลดไฟล์
                                </button>
                              </div>
                            )}
                          </div>

                          {newLessonForm.content_type !== 'quiz' && (
                            <div className="w-full">
                              {uploadMode === 'link' ? (
                                <input 
                                  type="text" 
                                  value={newLessonForm.content_url} 
                                  onChange={(e) => setNewLessonForm({ ...newLessonForm, content_url: e.target.value })} 
                                  className="w-full glass-input text-[10px] py-1.5 px-2.5" 
                                  placeholder={newLessonForm.content_type === 'video' ? 'ใส่ลิงก์วีดีโอ (เช่น YouTube URL)...' : 'ใส่ลิงก์เอกสาร PDF (เช่น https://...pdf)...'} 
                                />
                              ) : (
                                <div className="flex flex-col gap-1">
                                  <label className="flex items-center justify-center border-2 border-dashed border-slate-300 dark:border-white/15 hover:border-warehouse-orange hover:dark:border-warehouse-orange rounded-xl p-3 cursor-pointer transition-all bg-white/50 dark:bg-warehouse-slate/20">
                                    <div className="text-center space-y-1">
                                      <Upload size={18} className="mx-auto text-slate-400 animate-pulse" />
                                      <p className="text-[9px] text-slate-400 font-semibold max-w-[150px] truncate">
                                        {isUploading ? 'กำลังอัปโหลดและแปลงข้อมูล...' : uploadedFileName ? `เลือกไฟล์แล้ว: ${uploadedFileName}` : `คลิกเพื่อเลือกไฟล์ ${newLessonForm.content_type === 'video' ? 'วิดีโอ' : 'PDF'}`}
                                      </p>
                                    </div>
                                    <input 
                                      type="file" 
                                      accept={newLessonForm.content_type === 'video' ? 'video/*' : 'application/pdf'} 
                                      className="hidden" 
                                      onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                          setUploadedFileName(file.name);
                                          setIsUploading(true);
                                          const reader = new FileReader();
                                          reader.onloadend = () => {
                                            setNewLessonForm({ ...newLessonForm, content_url: reader.result as string });
                                            setIsUploading(false);
                                          };
                                          reader.readAsDataURL(file);
                                        }
                                      }}
                                    />
                                  </label>
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        <textarea 
                          rows={2}
                          value={newLessonForm.body_text} 
                          onChange={(e) => setNewLessonForm({ ...newLessonForm, body_text: e.target.value })} 
                          className="w-full glass-input text-[10px] py-1.5 px-2.5" 
                          placeholder="คำอธิบายเนื้อหา / รายละเอียดวิชา..." 
                        />
                        <div className="flex gap-2">
                          {editingLessonId && (
                            <button
                              type="button"
                              onClick={() => {
                                setEditingLessonId(null);
                                setNewLessonForm({ title: '', content_type: 'video', content_url: '', body_text: '' });
                                setUploadedFileName('');
                              }}
                              className="flex-1 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-white text-[11px] font-bold rounded-xl"
                            >
                              ยกเลิก
                            </button>
                          )}
                          <button 
                            type="submit" 
                            disabled={isUploading}
                            className="flex-1 py-1.5 bg-warehouse-orange text-white text-[11px] font-bold rounded-xl hover:bg-warehouse-orange/95 shadow-sm disabled:bg-slate-400 disabled:cursor-not-allowed"
                          >
                            {isUploading ? 'กรุณารอการอัปโหลดไฟล์...' : editingLessonId ? 'บันทึกการแก้ไข' : 'บันทึกเนื้อหา'}
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 py-10 text-center bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-200/50 dark:border-white/5">กรุณาเลือกหรือสร้างบทเรียนย่อยด้านซ้ายก่อน</p>
                )}

                {activeLessonId && builderLessons.find(l => l.id === activeLessonId)?.content_type === 'quiz' && (
                  <div className="space-y-4 border-t border-slate-200/50 dark:border-white/5 pt-4">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                        <HelpCircle size={12} className="text-warehouse-orange" />
                        <span>รายการคำถามปัจจุบัน ({(builderLessons.find(l => l.id === activeLessonId)?.questions || []).length} ข้อ)</span>
                      </label>
                      <span className="text-[9px] font-extrabold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">เกณฑ์ผ่าน: 80%</span>
                    </div>

                    {/* Render current questions list */}
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                      {(builderLessons.find(l => l.id === activeLessonId)?.questions || []).map((q: any, idx: number) => (
                        <div key={q.id || idx} className="p-3 bg-white dark:bg-white/5 border border-slate-200/50 dark:border-white/5 rounded-xl flex items-start justify-between gap-4 text-xs">
                          <div className="min-w-0">
                            <p className="font-bold text-slate-800 dark:text-white truncate">ข้อ {idx + 1}: {q.question_text}</p>
                            <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-1.5 text-[10px] text-slate-400 font-medium">
                              {q.options?.map((opt: string, oIdx: number) => {
                                const isCorrect = q.correct_answers?.includes(oIdx);
                                return (
                                  <span key={oIdx} className={isCorrect ? "text-emerald-500 font-bold" : ""}>
                                    {oIdx === 0 ? 'A. ' : oIdx === 1 ? 'B. ' : oIdx === 2 ? 'C. ' : 'D. '} {opt} {isCorrect && "✓"}
                                  </span>
                                );
                              })}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleDeleteQuestion(q.id)}
                            className="text-rose-500 hover:text-rose-400 transition-colors p-1"
                            title="ลบคำถามข้อนี้"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      ))}
                      {(builderLessons.find(l => l.id === activeLessonId)?.questions || []).length === 0 && (
                        <p className="text-[10px] text-slate-500 italic py-2 text-center">ยังไม่มีข้อสอบในควิซนี้ สามารถเพิ่มคำถามข้อแรกได้ด้านล่าง</p>
                      )}
                    </div>

                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1 border-t border-slate-200/50 dark:border-white/5 pt-4">
                      <PlusCircle size={12} className="text-warehouse-orange" />
                      <span>เพิ่มข้อคำถามและคำตอบใหม่ (Add New Question)</span>
                    </label>
                    <form onSubmit={handleCreateQuestion} className="space-y-3 bg-slate-50/50 dark:bg-white/5 p-4 rounded-2xl border border-slate-200/50 dark:border-white/5">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[9px] font-bold text-slate-400">คำถามหลัก (Question)</label>
                        <input 
                          type="text" 
                          required 
                          value={newQuestionForm.question_text} 
                          onChange={(e) => setNewQuestionForm({ ...newQuestionForm, question_text: e.target.value })} 
                          className="w-full glass-input text-[11px] py-1.5 px-2.5" 
                          placeholder="ข้อใดคือข้อควรปฏิบัติในการเข้าคลังสินค้า..." 
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <input 
                          type="text" 
                          required 
                          value={newQuestionForm.option1} 
                          onChange={(e) => setNewQuestionForm({ ...newQuestionForm, option1: e.target.value })} 
                          className="glass-input text-[10px] py-1.5 px-2" 
                          placeholder="ตัวเลือก A..." 
                        />
                        <input 
                          type="text" 
                          required 
                          value={newQuestionForm.option2} 
                          onChange={(e) => setNewQuestionForm({ ...newQuestionForm, option2: e.target.value })} 
                          className="glass-input text-[10px] py-1.5 px-2" 
                          placeholder="ตัวเลือก B..." 
                        />
                        <input 
                          type="text" 
                          value={newQuestionForm.option3} 
                          onChange={(e) => setNewQuestionForm({ ...newQuestionForm, option3: e.target.value })} 
                          className="glass-input text-[10px] py-1.5 px-2" 
                          placeholder="ตัวเลือก C (ไม่ระบุก็ได้)..." 
                        />
                        <input 
                          type="text" 
                          value={newQuestionForm.option4} 
                          onChange={(e) => setNewQuestionForm({ ...newQuestionForm, option4: e.target.value })} 
                          className="glass-input text-[10px] py-1.5 px-2" 
                          placeholder="ตัวเลือก D (ไม่ระบุก็ได้)..." 
                        />
                      </div>
                      <div className="flex justify-between items-center gap-4 bg-white/50 dark:bg-slate-900/40 p-2.5 rounded-xl">
                        <div className="flex items-center gap-2">
                          <label className="text-[10px] font-bold text-slate-400">คำตอบที่ถูกต้อง (Index):</label>
                          <select 
                            value={newQuestionForm.correct_index} 
                            onChange={(e) => setNewQuestionForm({ ...newQuestionForm, correct_index: e.target.value })} 
                            className="bg-transparent text-[10px] font-bold text-warehouse-orange border-none outline-none"
                          >
                            <option value="0">ตัวเลือก A</option>
                            <option value="1">ตัวเลือก B</option>
                            <option value="2">ตัวเลือก C</option>
                            <option value="3">ตัวเลือก D</option>
                          </select>
                        </div>
                        <button type="submit" className="px-4 py-1.5 bg-warehouse-orange text-white text-[11px] font-bold rounded-xl hover:bg-warehouse-orange/95 shadow-sm">บันทึกคำถาม</button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-200/50 dark:border-white/5 flex-shrink-0">
              <button 
                onClick={() => setShowBuilderModal(false)} 
                className="px-6 py-2.5 bg-warehouse-navy hover:bg-warehouse-navy/95 text-slate-700 dark:text-white rounded-xl text-xs font-bold transition-all border border-slate-200/50 dark:border-white/5 shadow-sm"
              >
                เสร็จสิ้นการตั้งค่า
              </button>
            </div>
          </GlassCard>
        </div>
      )}

    </div>
  );
}
