// In-memory Mock Database State
// This data mirrors the seeds.sql dataset and allows the API to function in mock mode if PG is not active.

export interface User {
  id: number;
  employee_id: string;
  email: string;
  password_hash: string;
  name: string;
  role: 'admin' | 'staff' | 'employee';
  department: string;
  position: string;
  warehouse_area: string;
  phone: string;
  status: 'active' | 'inactive' | 'suspended';
  supervisor_id: number | null;
  start_date: string;
  photo_url: string;
  working_shift?: 'A' | 'B';
}

export interface Skill {
  id: number;
  name: string;
  category: string;
  description: string;
}

export interface EmployeeSkill {
  id: number;
  employee_id: number;
  skill_id: number;
  level: number;
  status: 'need_training' | 'training' | 'qualified' | 'expert';
  certification_name?: string;
  certification_url?: string;
  expiration_date?: string;
  approved_by?: number | null;
  approved_at?: string;
}

export interface Course {
  id: number;
  name: string;
  description: string;
  duration_minutes: number;
  category: string;
  instructor: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimated_time: string;
  certificate_enabled: boolean;
  cover_image?: string;
}

export interface Chapter {
  id: number;
  course_id: number;
  title: string;
  sort_order: number;
}

export interface Lesson {
  id: number;
  chapter_id: number;
  title: string;
  content_type: 'video' | 'document' | 'image' | 'quiz' | 'assignment';
  content_url?: string;
  body_text?: string;
  sort_order: number;
}

export interface Enrollment {
  id: number;
  employee_id: number;
  course_id: number;
  progress_percentage: number;
  status: 'pending' | 'in_progress' | 'completed';
  assigned_by: number | null;
  assigned_at: string;
  due_date: string;
  completed_at?: string;
  certificate_id?: string;
}

export interface LessonProgress {
  id: number;
  employee_id: number;
  lesson_id: number;
  completed: boolean;
  completed_at: string;
}

export interface Question {
  id: number;
  lesson_id: number;
  question_type: 'multiple_choice' | 'true_false' | 'checkbox' | 'picture' | 'video';
  question_text: string;
  media_url?: string;
  options: string[];
  correct_answers: number[];
  points: number;
}

export interface QuizAttempt {
  id: number;
  employee_id: number;
  lesson_id: number;
  score: number;
  passed: boolean;
  completed_at: string;
}

export interface DailyTask {
  id: number;
  employee_id: number;
  task_name: string;
  category: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'overdue';
  progress_percentage: number;
  supervisor_approved: boolean;
  approved_by?: number | null;
  approved_at?: string;
  due_date: string;
  proof_file?: string;
  created_at: string;
}

export interface WorkingHour {
  id: number;
  employee_id: number;
  clock_in: string;
  clock_out?: string;
  break_start?: string;
  break_end?: string;
  ot_hours: number;
  status: 'present' | 'late' | 'leave' | 'absent';
  date: string;
}

export interface Announcement {
  id: number;
  title: string;
  content: string;
  created_by: number;
  category: 'Safety' | 'Training' | 'System' | 'General';
  created_at: string;
}

export interface AuditLog {
  id: number;
  user_id: number | null;
  action: string;
  details: string;
  ip_address: string;
  created_at: string;
}

export interface Notification {
  id: number;
  user_id: number;
  title: string;
  message: string;
  type: 'in_app' | 'email' | 'line';
  read_status: boolean;
  created_at: string;
}

export interface WarehouseDocument {
  id: number;
  title: string;
  category: 'JD' | 'WI' | 'กฎระเบียบข้อบังคับ' | 'Kaizen' | 'OPL' | 'NearMiss' | 'แบบฟอร์มใช้คลังสินค้า';
  file_url: string;
  uploaded_by: string;
  uploaded_at: string;
}

// Global In-Memory Arrays (Seed values)
// Password hash is for 'password123'
const bcryptHash = '$2a$10$U1FNXk2W1scs2ZpblqipzuMN92V3rAAkW1UOdFSdgrCcmYjadz5O2';

export const mockUsers: User[] = [
  { id: 1, employee_id: 'EMP001', email: 'admin@warehouse.com', password_hash: bcryptHash, name: 'สมชาย แสนดี', role: 'admin', department: 'Management', position: 'Warehouse Director', warehouse_area: 'Executive Office', phone: '081-234-5678', status: 'active', supervisor_id: null, start_date: '2020-01-15', photo_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', working_shift: 'A' },
  { id: 2, employee_id: 'EMP002', email: 'hr@warehouse.com', password_hash: bcryptHash, name: 'วิภาดา รักดี', role: 'admin', department: 'Human Resources', position: 'HR Manager', warehouse_area: 'HR Office', phone: '082-345-6789', status: 'active', supervisor_id: null, start_date: '2021-03-10', photo_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', working_shift: 'A' },
  { id: 3, employee_id: 'EMP003', email: 'trainer@warehouse.com', password_hash: bcryptHash, name: 'นรินทร์ เก่งการ', role: 'staff', department: 'Training', position: 'Senior Trainer', warehouse_area: 'Training Center', phone: '083-456-7890', status: 'active', supervisor_id: null, start_date: '2021-06-01', photo_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150', working_shift: 'A' },
  { id: 4, employee_id: 'EMP004', email: 'supervisor1@warehouse.com', password_hash: bcryptHash, name: 'ประพันธ์ ยอดคุม', role: 'staff', department: 'Operations', position: 'Zone A Supervisor', warehouse_area: 'Zone A', phone: '084-567-8901', status: 'active', supervisor_id: 1, start_date: '2022-02-15', photo_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150', working_shift: 'A' },
  { id: 5, employee_id: 'EMP005', email: 'supervisor2@warehouse.com', password_hash: bcryptHash, name: 'สมศรี มีคุม', role: 'staff', department: 'Operations', position: 'Zone B Supervisor', warehouse_area: 'Zone B', phone: '085-678-9012', status: 'active', supervisor_id: 1, start_date: '2022-05-20', photo_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150', working_shift: 'B' },
  { id: 6, employee_id: 'EMP006', email: 'employee1@warehouse.com', password_hash: bcryptHash, name: 'สมปอง ลุยงาน', role: 'employee', department: 'Operations', position: 'Forklift Driver', warehouse_area: 'Zone A', phone: '086-789-0123', status: 'active', supervisor_id: 4, start_date: '2023-01-10', photo_url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150', working_shift: 'A' },
  { id: 7, employee_id: 'EMP007', email: 'employee2@warehouse.com', password_hash: bcryptHash, name: 'อรอนงค์ แพ็กเก่ง', role: 'employee', department: 'Operations', position: 'Packer', warehouse_area: 'Zone A', phone: '087-890-1234', status: 'active', supervisor_id: 4, start_date: '2023-04-15', photo_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', working_shift: 'A' },
  { id: 8, employee_id: 'EMP008', email: 'employee3@warehouse.com', password_hash: bcryptHash, name: 'มานะ คัดของ', role: 'employee', department: 'Operations', position: 'Picker', warehouse_area: 'Zone B', phone: '088-901-2345', status: 'active', supervisor_id: 5, start_date: '2023-08-01', photo_url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150', working_shift: 'B' },
  { id: 9, employee_id: 'EMP009', email: 'employee4@warehouse.com', password_hash: bcryptHash, name: 'เกษม รับสินค้า', role: 'employee', department: 'Operations', position: 'Receiving Clerk', warehouse_area: 'Loading Dock', phone: '089-012-3456', status: 'active', supervisor_id: 5, start_date: '2023-10-12', photo_url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150', working_shift: 'B' },
  { id: 10, employee_id: 'EMP010', email: 'employee5@warehouse.com', password_hash: bcryptHash, name: 'จารุณี นับสต็อก', role: 'employee', department: 'Operations', position: 'Inventory Counter', warehouse_area: 'Zone B', phone: '081-111-2222', status: 'active', supervisor_id: 5, start_date: '2024-01-05', photo_url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150', working_shift: 'B' }
];

export const mockSkills: Skill[] = [
  { id: 1, name: 'Forklift Operation (การขับรถโฟล์คลิฟต์)', category: 'Forklift', description: 'ทักษะการขับขี่และควบคุมรถยกสินค้า (Forklift) อย่างถูกต้อง ปลอดภัย และการดูแลรักษาระดับเบื้องต้น' },
  { id: 2, name: 'Warehouse Safety Rules (ความปลอดภัยในคลังสินค้า)', category: 'Safety', description: 'ความเข้าใจกฎความปลอดภัย ป้ายเตือน อุปกรณ์ป้องกันส่วนบุคคล (PPE) และแนวทางการป้องกันอุบัติเหตุ' },
  { id: 3, name: 'RF Barcode Scanner (เครื่องสแกนบาร์โค้ด RF)', category: 'RF Scanner', description: 'ทักษะการใช้งานอุปกรณ์ RF Scanner ในการรับ เข้า จัดเก็บ หยิบ และโอนย้ายสินค้าในระบบ WMS' },
  { id: 4, name: 'High-Efficiency Picking (การหยิบสินค้าที่มีประสิทธิภาพ)', category: 'Picking', description: 'เทคนิคการหยิบสินค้าตามใบสั่งซื้ออย่างถูกต้อง รวดเร็ว และลดความเสียหายในกระบวนการหยิบ' },
  { id: 5, name: 'Standard Packing & Labeling (การแพ็กและติดฉลากมาตรฐาน)', category: 'Packing', description: 'ทักษะการแพ็กสินค้าลงกล่อง การเลือกบรรจุภัณฑ์ การชั่งน้ำหนัก และการติดฉลากจัดส่งที่ถูกต้อง' },
  { id: 6, name: '5S Methodology (ระบบ 5ส ในการทำงาน)', category: '5S', description: 'การปฏิบัติตามมาตรฐาน 5ส (สะสาง สะดวก สะอาด สุขลักษณะ สร้างนิสัย) เพื่อเพิ่มประสิทธิภาพและความปลอดภัย' },
  { id: 7, name: 'Cycle Counting & Inventory Audit (การนับรอบสินค้าและตรวจสอบ)', category: 'Inventory', description: 'ทักษะการตรวจนับสต็อกแบบนับรอบ (Cycle Count) การบันทึกสินค้าคงคลัง และการตรวจสอบความถูกต้อง' },
  { id: 8, name: 'Receiving & Put Away (การรับสินค้าและการจัดเก็บ)', category: 'Receiving', description: 'กระบวนการตรวจสอบใบส่งสินค้า การรับสินค้าเข้าคลัง และการใช้คำสั่งจัดเก็บตามพิกัดชั้นวาง (Put Away)' },
  { id: 9, name: 'Barcode & QR Code Printing (การพิมพ์และจัดการบาร์โค้ด)', category: 'Barcode', description: 'ทักษะการจัดการเครื่องพิมพ์ฉลาก (Label Printer) การพิมพ์ฉลากบาร์โค้ดสินค้า และการแก้ไขปัญหาเบื้องต้น' },
  { id: 10, name: 'Quality Check & Defect Handling (การตรวจสอบคุณภาพและการจัดการของเสีย)', category: 'Quality', description: 'กระบวนการตรวจสอบคุณภาพสินค้าที่รับเข้าและส่งออก การแยกสินค้าชำรุด และการบันทึกรายงานของเสีย' }
];

export const mockEmployeeSkills: EmployeeSkill[] = [
  // EMP006 (Forklift Driver)
  { id: 1, employee_id: 6, skill_id: 1, level: 4, status: 'expert', certification_name: 'Forklift License Class A', certification_url: 'https://example.com/certs/forklift_emp6.pdf', expiration_date: '2027-12-31', approved_by: 4, approved_at: '2024-02-15T10:00:00.000Z' },
  { id: 2, employee_id: 6, skill_id: 2, level: 3, status: 'qualified', certification_name: 'Warehouse Safety Certificate', certification_url: 'https://example.com/certs/safety_emp6.pdf', expiration_date: '2027-01-10', approved_by: 4, approved_at: '2024-01-20T11:30:00.000Z' },
  { id: 3, employee_id: 6, skill_id: 3, level: 3, status: 'qualified', approved_by: 4, approved_at: '2024-03-01T09:15:00.000Z' },
  { id: 4, employee_id: 6, skill_id: 6, level: 2, status: 'training' },
  // EMP007 (Packer)
  { id: 5, employee_id: 7, skill_id: 2, level: 4, status: 'expert', certification_name: 'Advanced Safety Leader', certification_url: 'https://example.com/certs/safety_emp7.pdf', expiration_date: '2026-06-01', approved_by: 4, approved_at: '2024-05-10T14:00:00.000Z' },
  { id: 6, employee_id: 7, skill_id: 5, level: 4, status: 'expert', approved_by: 4, approved_at: '2024-04-12T15:45:00.000Z' },
  { id: 7, employee_id: 7, skill_id: 6, level: 3, status: 'qualified', approved_by: 4, approved_at: '2024-02-10T10:20:00.000Z' },
  // EMP008 (Picker)
  { id: 8, employee_id: 8, skill_id: 2, level: 2, status: 'training' },
  { id: 9, employee_id: 8, skill_id: 4, level: 3, status: 'qualified', certification_name: 'Picking Efficiency Pro', approved_by: 5, approved_at: '2024-03-18T16:00:00.000Z' },
  { id: 10, employee_id: 8, skill_id: 3, level: 2, status: 'training' },
  // EMP009 (Receiving Clerk)
  { id: 11, employee_id: 9, skill_id: 8, level: 3, status: 'qualified', certification_name: 'Receiving Clerk Standard Certificate', approved_by: 5, approved_at: '2024-02-28T13:00:00.000Z' },
  { id: 12, employee_id: 9, skill_id: 2, level: 3, status: 'qualified', certification_name: 'Safety Standards Course', expiration_date: '2026-10-12', approved_by: 5, approved_at: '2023-11-01T10:00:00.000Z' },
  { id: 13, employee_id: 9, skill_id: 3, level: 3, status: 'qualified', approved_by: 5, approved_at: '2023-11-15T14:30:00.000Z' },
  // EMP010 (Inventory Counter)
  { id: 14, employee_id: 10, skill_id: 7, level: 4, status: 'expert', certification_name: 'Certified Inventory Controller', certification_url: 'https://example.com/certs/inventory_emp10.pdf', expiration_date: '2027-01-05', approved_by: 5, approved_at: '2024-02-01T09:00:00.000Z' },
  { id: 15, employee_id: 10, skill_id: 2, level: 3, status: 'qualified', certification_name: 'Safety Standards', approved_by: 5, approved_at: '2024-01-15T10:00:00.000Z' },
  { id: 16, employee_id: 10, skill_id: 6, level: 4, status: 'expert', certification_name: '5S Auditor Certificate', approved_by: 5, approved_at: '2024-03-10T11:00:00.000Z' }
];

export const mockCourses: Course[] = [
  { id: 1, name: 'Warehouse Safety & Accident Prevention (ความปลอดภัยคลังสินค้า)', description: 'หลักสูตรพื้นฐานที่พนักงานทุกคนต้องเรียนรู้เกี่ยวกับความปลอดภัย การสวมใส่อุปกรณ์ป้องกันส่วนบุคคล (PPE) ป้ายสัญญาณเตือนภัย และขั้นตอนปฏิบัติเมื่อเกิดเหตุฉุกเฉิน', duration_minutes: 120, category: 'Safety', instructor: 'นรินทร์ เก่งการ', difficulty: 'beginner', estimated_time: '2 ชั่วโมง', certificate_enabled: true },
  { id: 2, name: 'Forklift Operations Masterclass (การขับรถยกสินค้าและมาตรฐานความปลอดภัย)', description: 'หลักสูตรภาคทฤษฎีและปฏิบัติสำหรับผู้ที่ต้องทำหน้าที่ขับรถยกสินค้า (Forklift) ครอบคลุมการเช็กเครื่องยนต์ การควบคุมทิศทาง การยกชั้นวางสูง และการตอบสนองเมื่อรถยกขัดข้อง', duration_minutes: 240, category: 'Forklift', instructor: 'นรินทร์ เก่งการ', difficulty: 'intermediate', estimated_time: '4 ชั่วโมง', certificate_enabled: true },
  { id: 3, name: 'Smart Warehouse WMS & RF Scanner Operations (การใช้เครื่องสแกน RF และระบบจัดการคลัง)', description: 'เรียนรู้การทำงานร่วมกับระบบ Warehouse Management System (WMS) และการใช้งานอุปกรณ์เครื่องสแกนเนอร์พกพา (RF Handheld Scanner) เพื่อความแม่นยำในการตรวจนับและเคลื่อนย้าย', duration_minutes: 180, category: 'RF Scanner', instructor: 'นรินทร์ เก่งการ', difficulty: 'intermediate', estimated_time: '3 ชั่วโมง', certificate_enabled: true },
  { id: 4, name: 'High-Performance Picking & Sorting Methods (เทคนิคหยิบสินค้าชั้นเลิศ)', description: 'สอนแนวปฏิบัติที่เป็นเลิศในการหยิบและคัดแยกสินค้าเพื่อความเร็วและความแม่นยำสูงสุด ลดการขยับตัวเปล่าประโยชน์ การจัดลำดับหยิบ (Routing Strategy) และการอ่านรายละเอียดบาร์โค้ด', duration_minutes: 90, category: 'Picking', instructor: 'สมชาย แสนดี', difficulty: 'beginner', estimated_time: '1.5 ชั่วโมง', certificate_enabled: true },
  { id: 5, name: 'Enterprise 5S Standard (การจัดระบบ 5ส ระดับองค์กร)', description: 'แนวทางการทำ 5ส เพื่อส่งเสริมความสะอาด ความเป็นระเบียบเรียบร้อย เพิ่มพื้นที่ใช้สอยในคลังสินค้า และสร้างนิสัยความปลอดภัยในการทำงานประจำวัน', duration_minutes: 60, category: '5S', instructor: 'วิภาดา รักดี', difficulty: 'beginner', estimated_time: '1 ชั่วโมง', certificate_enabled: true }
];

export const mockChapters: Chapter[] = [
  // Course 1 Chapters
  { id: 1, course_id: 1, title: 'บทนำและกฎความปลอดภัยทั่วไป', sort_order: 1 },
  { id: 2, course_id: 1, title: 'อุปกรณ์ป้องกันภัยส่วนบุคคล (PPE)', sort_order: 2 },
  { id: 3, course_id: 1, title: 'การทำข้อสอบประเมินความปลอดภัย', sort_order: 3 },
  // Course 2 Chapters
  { id: 4, course_id: 2, title: 'โครงสร้างและการควบคุมรถโฟล์คลิฟต์', sort_order: 1 },
  { id: 5, course_id: 2, title: 'มาตรฐานความปลอดภัยในการยกของสูง', sort_order: 2 },
  { id: 6, course_id: 2, title: 'การประเมินทักษะการขับขี่รถยก', sort_order: 3 },
  // Course 3 Chapters
  { id: 7, course_id: 3, title: 'การทำความรู้จัก WMS และ RF Scanner', sort_order: 1 },
  { id: 8, course_id: 3, title: 'ฟังก์ชันการรับสินค้าและจัดเก็บพิกัด', sort_order: 2 },
  { id: 9, course_id: 3, title: 'การทำข้อสอบระบบสแกนบาร์โค้ด', sort_order: 3 }
];

export const mockLessons: Lesson[] = [
  // Course 1 Lessons
  { id: 1, chapter_id: 1, title: 'ความปลอดภัยคือหัวใจหลัก', content_type: 'video', content_url: 'https://www.youtube.com/embed/5F7Jt5pUlyU', body_text: 'ยินดีต้อนรับเข้าสู่บทเรียนด้านความปลอดภัย บทเรียนนี้จะแนะนำป้ายเตือนและกฎพื้นฐานในคลังสินค้า', sort_order: 1 },
  { id: 2, chapter_id: 1, title: 'คู่มือมาตรการป้องกันอุบัติเหตุ PDF', content_type: 'document', content_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', body_text: 'โปรดศึกษาเอกสารข้อกำหนดความปลอดภัยตามกฎกระทรวงและคู่มือองค์กร', sort_order: 2 },
  { id: 3, chapter_id: 2, title: 'ประเภทและการใช้งานอุปกรณ์ PPE', content_type: 'video', content_url: 'https://www.youtube.com/embed/kR66aN42mCc', body_text: 'อธิบายการสวมใส่หมวกนิรภัย เสื้อสะท้อนแสง และรองเท้าเซฟตี้', sort_order: 1 },
  { id: 4, chapter_id: 2, title: 'รูปภาพสรุปการแต่งกายที่ถูกต้อง', content_type: 'image', content_url: 'https://images.unsplash.com/photo-1581094288338-2314dddb7eed?w=600', body_text: 'ตัวอย่างพนักงานสวมชุด PPE ถูกต้องครบถ้วนขณะปฏิบัติงานคลังสินค้า', sort_order: 2 },
  { id: 5, chapter_id: 3, title: 'แบบทดสอบวัดระดับความรู้เรื่องความปลอดภัย', content_type: 'quiz', body_text: 'กรุณาทำข้อสอบด้านความปลอดภัยให้ผ่านอย่างน้อย 80% (4 ใน 5 ข้อ) เพื่อรับใบรับรองในระบบ', sort_order: 1 },
  // Course 2 Lessons
  { id: 6, chapter_id: 4, title: 'โครงสร้างรถยกและการตรวจสอบก่อนขับ', content_type: 'video', content_url: 'https://www.youtube.com/embed/fW4o8Uex9aQ', body_text: 'วิดีโอสาธิตการเช็กรอบคัน ระดับน้ำมันไฮดรอลิก ล้อ และระบบเบรกของรถโฟล์คลิฟต์', sort_order: 1 },
  { id: 7, chapter_id: 5, title: 'กฎการควบคุมความเร็วและการเข้ามุมอับ', content_type: 'document', content_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', body_text: 'ข้อกำหนดความเร็วไม่เกิน 10 กม./ชม. ในคลังสินค้า และการบีบแตรเตือนที่ทางแยก', sort_order: 1 },
  { id: 8, chapter_id: 6, title: 'แบบทดสอบการขับและยกของสูง', content_type: 'quiz', body_text: 'ตอบคำถามจำลองสถานการณ์ความปลอดภัยในการขับขี่', sort_order: 1 },
  // Course 3 Lessons
  { id: 9, chapter_id: 7, title: 'แนะนำตัวเครื่องและปุ่มควบคุมหลัก', content_type: 'video', content_url: 'https://www.youtube.com/embed/yVwL1tXgC_s', body_text: 'วิดีโอสาธิตวิธีการเปิดเครื่อง เชื่อมต่อ Wi-Fi และหน้าจอเมนูหลักของ WMS App', sort_order: 1 },
  { id: 10, chapter_id: 8, title: 'เทคนิคการสแกนบาร์โค้ดที่รวดเร็ว', content_type: 'document', content_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', body_text: 'วิธีรักษาระยะห่าง 15-30 ซม. ในการยิงเลเซอร์ และการจัดการฉลากสินค้าที่ชำรุดเสียหาย', sort_order: 1 },
  { id: 11, chapter_id: 9, title: 'แบบทดสอบวัดทักษะการใช้ RF Scanner', content_type: 'quiz', body_text: 'ประเมินความรู้การบันทึกสถานะรับเข้าและจัดเก็บ', sort_order: 1 }
];

export const mockEnrollments: Enrollment[] = [
  { id: 1, employee_id: 6, course_id: 1, progress_percentage: 100, status: 'completed', assigned_by: 4, assigned_at: '2024-01-15T09:00:00.000Z', due_date: '2024-02-01', completed_at: '2024-01-20T11:30:00.000Z', certificate_id: 'CERT-SAF-00612' },
  { id: 2, employee_id: 6, course_id: 3, progress_percentage: 50, status: 'in_progress', assigned_by: 4, assigned_at: '2026-06-20T08:00:00.000Z', due_date: '2026-08-31' },
  { id: 3, employee_id: 7, course_id: 1, progress_percentage: 100, status: 'completed', assigned_by: 4, assigned_at: '2024-01-15T09:00:00.000Z', due_date: '2024-02-01', completed_at: '2024-01-18T15:45:00.000Z', certificate_id: 'CERT-SAF-00713' },
  { id: 4, employee_id: 7, course_id: 5, progress_percentage: 100, status: 'completed', assigned_by: 4, assigned_at: '2024-02-15T10:00:00.000Z', due_date: '2024-03-15', completed_at: '2024-02-28T10:00:00.000Z', certificate_id: 'CERT-5SS-00744' },
  { id: 5, employee_id: 8, course_id: 1, progress_percentage: 0, status: 'pending', assigned_by: 5, assigned_at: '2026-06-25T11:00:00.000Z', due_date: '2026-07-15' },
  { id: 6, employee_id: 8, course_id: 4, progress_percentage: 100, status: 'completed', assigned_by: 5, assigned_at: '2024-03-01T09:00:00.000Z', due_date: '2024-03-31', completed_at: '2024-03-18T16:00:00.000Z', certificate_id: 'CERT-PIC-00811' },
  { id: 7, employee_id: 9, course_id: 1, progress_percentage: 100, status: 'completed', assigned_by: 5, assigned_at: '2023-10-15T08:00:00.000Z', due_date: '2023-11-30', completed_at: '2023-11-01T10:00:00.000Z', certificate_id: 'CERT-SAF-00911' },
  { id: 8, employee_id: 10, course_id: 1, progress_percentage: 100, status: 'completed', assigned_by: 5, assigned_at: '2024-01-05T09:00:00.000Z', due_date: '2024-02-15', completed_at: '2024-01-15T10:00:00.000Z', certificate_id: 'CERT-SAF-01021' }
];

export const mockLessonProgress: LessonProgress[] = [
  // EMP006 Course 1 progress
  { id: 1, employee_id: 6, lesson_id: 1, completed: true, completed_at: '2024-01-19T09:00:00.000Z' },
  { id: 2, employee_id: 6, lesson_id: 2, completed: true, completed_at: '2024-01-19T10:30:00.000Z' },
  { id: 3, employee_id: 6, lesson_id: 3, completed: true, completed_at: '2024-01-20T08:30:00.000Z' },
  { id: 4, employee_id: 6, lesson_id: 4, completed: true, completed_at: '2024-01-20T09:45:00.000Z' },
  { id: 5, employee_id: 6, lesson_id: 5, completed: true, completed_at: '2024-01-20T11:30:00.000Z' },
  // EMP006 Course 3 progress
  { id: 6, employee_id: 6, lesson_id: 9, completed: true, completed_at: '2026-06-25T14:00:00.000Z' },
  // EMP007 Course 1 progress
  { id: 7, employee_id: 7, lesson_id: 1, completed: true, completed_at: '2024-01-18T13:00:00.000Z' },
  { id: 8, employee_id: 7, lesson_id: 2, completed: true, completed_at: '2024-01-18T14:00:00.000Z' },
  { id: 9, employee_id: 7, lesson_id: 3, completed: true, completed_at: '2024-01-18T14:30:00.000Z' },
  { id: 10, employee_id: 7, lesson_id: 4, completed: true, completed_at: '2024-01-18T15:00:00.000Z' },
  { id: 11, employee_id: 7, lesson_id: 5, completed: true, completed_at: '2024-01-18T15:45:00.000Z' }
];

export const mockQuestions: Question[] = [
  // Safety Quiz Questions (Lesson 5)
  {
    id: 1,
    lesson_id: 5,
    question_type: 'multiple_choice',
    question_text: 'เมื่อเห็นสัญลักษณ์ป้ายเตือนพื้นสีเหลืองขอบดำ หมายถึงสัญลักษณ์ประเภทใด?',
    options: ['เตือนให้ระวัง (Warning)', 'ห้ามปฏิบัติ (Prohibition)', 'ป้ายแนะนำความปลอดภัย (Information)', 'บังคับให้ต้องปฏิบัติ (Mandatory)'],
    correct_answers: [0],
    points: 1
  },
  {
    id: 2,
    lesson_id: 5,
    question_type: 'true_false',
    question_text: 'รองเท้าผ้าใบธรรมดาสามารถสวมปฏิบัติงานในเขตคลังเก็บของหนักได้ หากระมัดระวังเป็นพิเศษ',
    options: ['ถูกต้อง', 'ไม่ถูกต้อง (ต้องใช้รองเท้าหัวเหล็กนิรภัยเท่านั้น)'],
    correct_answers: [1],
    points: 1
  },
  {
    id: 3,
    lesson_id: 5,
    question_type: 'checkbox',
    question_text: 'อุปกรณ์ชิ้นใดจัดอยู่ในประเภทเครื่องป้องกันหน้าและดวงตา? (เลือกได้มากกว่า 1 ข้อ)',
    options: ['แว่นตานิรภัย (Safety Glasses)', 'กระบังหน้ากันสะเก็ด (Face Shield)', 'หมวกนิรภัย (Hard Hat)', 'ที่อุดหู (Earplugs)'],
    correct_answers: [0, 1],
    points: 1
  },
  {
    id: 4,
    lesson_id: 5,
    question_type: 'multiple_choice',
    question_text: 'หากเกิดเหตุเพลิงไหม้เบื้องต้น สิ่งแรกที่พนักงานควรทำคืออะไร?',
    options: ['ดึงอุปกรณ์สัญญาณแจ้งเหตุเพลิงไหม้ (Fire Alarm) หรือตะโกนเตือนภัย', 'วิ่งหนีออกจากคลังสินค้าไปที่ลานจอดรถทันที', 'โทรหาครอบครัวแจ้งสถานการณ์', 'พยายามขนสินค้าออกจากโกดัง'],
    correct_answers: [0],
    points: 1
  },
  {
    id: 5,
    lesson_id: 5,
    question_type: 'picture',
    question_text: 'จากภาพสัญลักษณ์ถังดับเพลิงสีแดงนี้ เหมาะสำหรับดับเพลิงประเภทใดเป็นหลัก?',
    media_url: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=300',
    options: ['Class A (ไม้, กระดาษ, พลาสติก)', 'Class D (โลหะติดไฟ)', 'Class K (น้ำมันทำอาหาร)', 'ประเภทแก๊สติดไฟเท่านั้น'],
    correct_answers: [0],
    points: 1
  },
  // Forklift Quiz Questions (Lesson 8)
  {
    id: 6,
    lesson_id: 8,
    question_type: 'multiple_choice',
    question_text: 'การกำหนดความเร็วสูงสุดสำหรับรถโฟล์คลิฟต์ภายในพื้นที่คลังสินค้าคือเท่าใด?',
    options: ['10 กม./ชม.', '20 กม./ชม.', '5 กม./ชม.', 'ไม่มีกำหนด'],
    correct_answers: [0],
    points: 1
  },
  {
    id: 7,
    lesson_id: 8,
    question_type: 'true_false',
    question_text: 'หากน้ำหนักสินค้าเกินพิกัดเล็กน้อย สามารถนำเหล็กถ่วงน้ำหนักมาติดตั้งท้ายรถโฟล์คลิฟต์เพิ่มเติมได้',
    options: ['จริง', 'เท็จ (ห้ามดัดแปลงรถยกและต้องห้ามยกเกินน้ำหนักที่กำหนดเด็ดขาด)'],
    correct_answers: [1],
    points: 1
  },
  // RF Scanner Quiz Questions (Lesson 11)
  {
    id: 8,
    lesson_id: 11,
    question_type: 'multiple_choice',
    question_text: 'หากเครื่องยิงบาร์โค้ดแสดงความผิดพลาด "Put Away Location Mismatch" หมายความว่าอย่างไร?',
    options: ['ชั้นวางปลายทางไม่ตรงกับที่ระบบแนะนำ', 'สัญญาณเชื่อมต่ออินเทอร์เน็ตขาดหาย', 'บาร์โค้ดสินค้าสกปรกเกินไป', 'ยังไม่ได้ทำการสแกนรับเข้าคลัง'],
    correct_answers: [0],
    points: 1
  },
  {
    id: 9,
    lesson_id: 11,
    question_type: 'true_false',
    question_text: 'ผู้ใช้งานสามารถพิมพ์พิกัดชั้นวางลงไปแทนการเดินไปยิงบาร์โค้ดที่หน้าชั้นวางได้ตลอดเวลา',
    options: ['ถูกต้อง', 'ไม่ถูกต้อง (ต้องเดินไปสแกนที่ชั้นวางจริงเพื่อป้องกันข้อผิดพลาดทางสต็อก)'],
    correct_answers: [1],
    points: 1
  }
];

export const mockQuizAttempts: QuizAttempt[] = [
  { id: 1, employee_id: 6, lesson_id: 5, score: 5, passed: true, completed_at: '2024-01-20T11:30:00.000Z' },
  { id: 2, employee_id: 7, lesson_id: 5, score: 4, passed: true, completed_at: '2024-01-18T15:45:00.000Z' }
];

export const mockDailyTasks: DailyTask[] = [
  { id: 1, employee_id: 6, task_name: 'ขับย้ายพาเลทพัสดุโซนสินค้าขาเข้า', category: 'Put Away', description: 'ทำการเคลื่อนย้ายพาเลทนำเข้าจากตู้คอนเทนเนอร์ 15 พาเลท ไปจัดวางที่ชั้น A4 ถึง A12', status: 'completed', progress_percentage: 100, supervisor_approved: true, approved_by: 4, approved_at: '2026-06-29T12:00:00.000Z', due_date: '2026-06-29', created_at: '2026-06-29T08:00:00.000Z' },
  { id: 2, employee_id: 6, task_name: 'ตรวจสอบสภาพรถยกไฟฟ้า Forklift #04', category: 'Forklift', description: 'ทำเช็กลิสต์ความปลอดภัยก่อนทำงาน เช็กความจุแบตเตอรี่ และเติมน้ำกลั่น', status: 'completed', progress_percentage: 100, supervisor_approved: true, approved_by: 4, approved_at: '2026-06-29T08:30:00.000Z', due_date: '2026-06-29', created_at: '2026-06-29T08:00:00.000Z' },
  { id: 3, employee_id: 7, task_name: 'แพ็กกล่องสินค้าออเดอร์ด่วนแคมเปญ 7.7', category: 'Packing', description: 'เร่งห่อหุ้มวัสดุกันกระแทกและบรรจุกล่องสินค้าอิเล็กทรอนิกส์ 120 ออเดอร์ส่งทาง Flash Express', status: 'in_progress', progress_percentage: 65, supervisor_approved: false, due_date: '2026-06-29', created_at: '2026-06-29T08:00:00.000Z' },
  { id: 4, employee_id: 8, task_name: 'หยิบสินค้าอุปโภคบริโภคตามใบสั่งซื้อ Zone B', category: 'Picking', description: 'หยิบของตามระบบสแกน RF นำส่งจุดคัดแยกแพ็คกิ้งจำนวน 80 รายการ', status: 'in_progress', progress_percentage: 40, supervisor_approved: false, due_date: '2026-06-29', created_at: '2026-06-29T08:00:00.000Z' },
  { id: 5, employee_id: 9, task_name: 'ตรวจนับสินค้าแกะกล่องใหม่ ตู้คอนเทนเนอร์ IN-B09', category: 'Receiving', description: 'นับจำนวนกล่องนำเข้า ตรวจเช็คเอกสาร Packing List และสินค้าชำรุดเสียหาย', status: 'completed', progress_percentage: 100, supervisor_approved: true, approved_by: 5, approved_at: '2026-06-28T16:30:00.000Z', due_date: '2026-06-28', created_at: '2026-06-28T08:00:00.000Z' },
  { id: 6, employee_id: 10, task_name: 'นับรอบสินค้ากลุ่มอาหารแห้งแถว B12-B15', category: 'Cycle Count', description: 'ทำ Cycle count บันทึกข้อมูลคลาดเหลือลงแบบฟอร์มเพื่อส่งตรวจสอบยอดเสร็จสิ้นภายในสิ้นวัน', status: 'completed', progress_percentage: 100, supervisor_approved: true, approved_by: 5, approved_at: '2026-06-29T11:30:00.000Z', due_date: '2026-06-29', created_at: '2026-06-29T08:00:00.000Z' },
  { id: 7, employee_id: 10, task_name: 'จัดเตรียมเอกสารนับสต็อกรอบครึ่งปี', category: 'Cycle Count', description: 'เตรียมพิมพ์รายงานจำนวนสินค้าคงเหลือแยกตามโซนสินค้าเพื่อแจกแจงพนักงานนับพรุ่งนี้', status: 'pending', progress_percentage: 0, supervisor_approved: false, due_date: '2026-06-30', created_at: '2026-06-29T15:00:00.000Z' }
];

export const mockWorkingHours: WorkingHour[] = [
  { id: 1, employee_id: 6, clock_in: '2026-06-29T07:55:00.000Z', ot_hours: 0, status: 'present', date: '2026-06-29' },
  { id: 2, employee_id: 7, clock_in: '2026-06-29T08:05:00.000Z', ot_hours: 0, status: 'late', date: '2026-06-29' },
  { id: 3, employee_id: 8, clock_in: '2026-06-29T07:50:00.000Z', ot_hours: 0, status: 'present', date: '2026-06-29' },
  { id: 4, employee_id: 9, clock_in: '2026-06-28T07:48:00.000Z', clock_out: '2026-06-28T17:15:00.000Z', break_start: '2026-06-28T12:00:00.000Z', break_end: '2026-06-28T13:00:00.000Z', ot_hours: 1, status: 'present', date: '2026-06-28' },
  { id: 5, employee_id: 10, clock_in: '2026-06-29T07:52:00.000Z', ot_hours: 0, status: 'present', date: '2026-06-29' }
];

export const mockAnnouncements: Announcement[] = [
  { id: 1, title: 'ประกาศมาตรการสวมใส่อุปกรณ์คุ้มครองความปลอดภัย (PPE)', content: 'ขอความร่วมมือพนักงานฝ่ายปฏิบัติการในคลังสินค้าทุกคน สวมใส่หมวกนิรภัย (Hard Hat) เสื้อกั๊กสะท้อนแสง และรองเท้าเซฟตี้ตลอดเวลาที่อยู่ในพื้นที่ทำงานอย่างเคร่งครัด หากพบเห็นการฝ่าฝืนมีโทษเตือนทางวินัย', created_by: 1, category: 'Safety', created_at: '2026-06-29T08:00:00.000Z' },
  { id: 2, title: 'เปิดตัวหลักสูตรฝึกอบรมระบบจัดการคลัง WMS & RF Scanner ใหม่', content: 'ฝ่ายฝึกอบรมได้เปิดคอร์สแนะนำทักษะใหม่สำหรับการทำสต็อกสินค้าด้วยแท็บเล็ตและตัวยิงบาร์โค้ดเวอร์ชันล่าสุด พนักงานสามารถเข้าเรียนเพื่อพัฒนาทักษะระดับ RF Scanner และรับการรับรองในสัปดาห์นี้', created_by: 3, category: 'Training', created_at: '2026-06-29T09:00:00.000Z' },
  { id: 3, title: 'กิจกรรมนับสต็อกสินค้าประจำปีและปิดรอบบัญชี', content: 'แจ้งกำหนดการปิดคลังสินค้าชั่วคราวเพื่อตรวจนับสินค้าครั้งใหญ่ในวันที่ 30 มิถุนายน และ 1 กรกฎาคมนี้ โดยให้พนักงานเตรียมศึกษาแผนที่ Zone และทีมที่ได้รับมอบหมาย', created_by: 1, category: 'General', created_at: '2026-06-29T09:30:00.000Z' }
];

export const mockAuditLogs: AuditLog[] = [
  { id: 1, user_id: 1, action: 'LOGIN', details: 'ผู้ดูแลระบบสมชาย ล็อกอินเข้าสู่ระบบ', ip_address: '192.168.1.100', created_at: '2026-06-29T08:30:00.000Z' },
  { id: 2, user_id: 4, action: 'APPROVE_SKILL', details: 'อนุมัติทักษะการขับรถยก Forklift เลเวล 4 ของ สมปอง ลุยงาน (EMP006)', ip_address: '192.168.1.55', created_at: '2026-06-29T09:00:00.000Z' },
  { id: 3, user_id: 2, action: 'CREATE_USER', details: 'HR วิภาดา ลงทะเบียนพนักงานใหม่ จารุณี นับสต็อก (EMP010)', ip_address: '192.168.1.10', created_at: '2026-06-29T09:15:00.000Z' },
  { id: 4, user_id: 6, action: 'CLOCK_IN', details: 'สมปอง ลุยงาน ลงชื่อเข้างานประจำวัน', ip_address: '192.168.2.10', created_at: '2026-06-29T07:55:00.000Z' }
];

export const mockNotifications: Notification[] = [
  { id: 1, user_id: 6, title: 'มอบหมายการเรียนรู้ใหม่', message: 'หัวหน้าประพันธ์ ได้มอบหมายคอร์ส "Smart Warehouse WMS & RF Scanner Operations" ให้คุณเรียน กรุณาเรียนให้เสร็จภายใน 31 ส.ค.', type: 'in_app', read_status: false, created_at: '2026-06-29T08:00:00.000Z' },
  { id: 2, user_id: 8, title: 'แจ้งเตือนบทเรียนค้างส่ง', message: 'หลักสูตร "Warehouse Safety" ที่คุณได้รับมอบหมายจะหมดเขตการเรียนรู้วันที่ 15 ก.ค. โปรดเข้าศึกษา', type: 'in_app', read_status: false, created_at: '2026-06-29T08:05:00.000Z' },
  { id: 3, user_id: 6, title: 'ยินดีด้วย! คุณได้รับการอนุมัติทักษะใหม่', message: 'ทักษะขับรถโฟล์คลิฟต์เลเวล 4 ได้รับการอนุมัติและรับรองความรู้แล้วโดยหัวหน้าประพันธ์', type: 'in_app', read_status: true, created_at: '2026-06-29T09:01:00.000Z' }
];

export const mockDocuments: WarehouseDocument[] = [
  { id: 1, title: 'Job Description - Forklift Operator (พนักงานขับรถยก)', category: 'JD', file_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', uploaded_by: 'สมชาย แสนดี', uploaded_at: '2026-06-25T08:00:00Z' },
  { id: 2, title: 'Work Instruction - WMS Receive & Putaway (ขั้นตอนรับและจัดเก็บสินค้า)', category: 'WI', file_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', uploaded_by: 'นรินทร์ เก่งการ', uploaded_at: '2026-06-26T09:30:00Z' },
  { id: 3, title: 'กฎระเบียบความปลอดภัยและข้อบังคับทั่วไปในคลังสินค้า Swan', category: 'กฎระเบียบข้อบังคับ', file_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', uploaded_by: 'สมชาย แสนดี', uploaded_at: '2026-06-27T10:00:00Z' },
  { id: 4, title: 'OPL - วิธีการใช้งานเครื่องสแกนบาร์โค้ด RF Scanner', category: 'OPL', file_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', uploaded_by: 'นรินทร์ เก่งการ', uploaded_at: '2026-06-28T14:15:00Z' }
];

export interface OrgChartItem {
  id: number;
  name: string;
  role_name: string;
  level_order: number;
  level?: string;
  warehouse_area?: string;
  image_url: string;
}

export const mockOrgChart: OrgChartItem[] = [
  { id: 1, name: 'ประวิตร รักดี', role_name: 'ผู้จัดการแผนกวางแผนการผลิต คลังสินค้าและขนส่ง', level_order: 1, level: 'L1', warehouse_area: 'Management', image_url: '' },
  { id: 2, name: 'สมชาย มีสุข', role_name: 'ผู้ช่วยผู้จัดการแผนกวางแผนการผลิต คลังสินค้าและขนส่ง', level_order: 2, level: 'L2', warehouse_area: 'Management', image_url: '' },
  { id: 3, name: 'ประพันธ์ ยอดคุม', role_name: 'หัวหน้าแผนกคลังสินค้า', level_order: 3, level: 'L3', warehouse_area: 'Warehouse', image_url: '' },
  { id: 4, name: 'วิชัย อดทน', role_name: 'หัวหน้างานคลังสินค้า', level_order: 4, level: 'L4', warehouse_area: 'Warehouse', image_url: '' },
  { id: 5, name: 'เกล้า ทองดี', role_name: 'เจ้าหน้าที่คลังสินค้า', level_order: 5, level: 'L5', warehouse_area: 'Zone A', image_url: '' },
  { id: 6, name: 'สิริ พูนเพิ่ม', role_name: 'เจ้าหน้าที่บันทึกข้อมูล', level_order: 5, level: 'L5', warehouse_area: 'Zone A', image_url: '' },
  { id: 7, name: 'สมปอง ลุยงาน', role_name: 'พนักงานขับรถยก รับ-จ่าย', level_order: 5, level: 'L5', warehouse_area: 'Zone A', image_url: '' },
  { id: 8, name: 'มานะ คัดของ', role_name: 'พนักงานหน้าลิฟท์', level_order: 5, level: 'L5', warehouse_area: 'Zone B', image_url: '' },
  { id: 9, name: 'สมศักดิ์ รักชาติ', role_name: 'พนักงานยิง Barcode', level_order: 5, level: 'L5', warehouse_area: 'Zone B', image_url: '' },
  { id: 10, name: 'อรุณ ดีเลิศ', role_name: 'พนักงานจัดเตรียมสินค้า', level_order: 5, level: 'L5', warehouse_area: 'Zone B', image_url: '' }
];
