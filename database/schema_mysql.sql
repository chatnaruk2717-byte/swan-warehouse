-- ===================================================================
-- Warehouse Training & Skill Management System
-- MySQL 8.0 / MariaDB 10.6+ Database Schema & Initial Seed Data
-- ===================================================================

SET FOREIGN_KEY_CHECKS = 0;

-- 1. Users Table
DROP TABLE IF EXISTS users;
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  employee_id VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(100) NOT NULL,
  role VARCHAR(50) NOT NULL,
  department VARCHAR(100) NOT NULL,
  position VARCHAR(100) NOT NULL,
  warehouse_area VARCHAR(100),
  phone VARCHAR(20),
  status VARCHAR(20) DEFAULT 'active',
  supervisor_id INT NULL,
  start_date DATE NOT NULL,
  photo_url LONGTEXT,
  working_shift VARCHAR(10) DEFAULT 'A',
  evaluation_score INT DEFAULT 100,
  accumulated_points INT DEFAULT 0,
  absent_count INT DEFAULT 0,
  leave_count INT DEFAULT 0,
  late_count INT DEFAULT 0,
  warning_letters INT DEFAULT 0,
  line_id VARCHAR(100) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (supervisor_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Skills Table
DROP TABLE IF EXISTS skills;
CREATE TABLE skills (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  category VARCHAR(50) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Employee Skills Table (Skill Matrix)
DROP TABLE IF EXISTS employee_skills;
CREATE TABLE employee_skills (
  id INT AUTO_INCREMENT PRIMARY KEY,
  employee_id INT NOT NULL,
  skill_id INT NOT NULL,
  level INT NOT NULL DEFAULT 1,
  status VARCHAR(20) NOT NULL DEFAULT 'need_training',
  certification_name VARCHAR(150),
  certification_url VARCHAR(255),
  expiration_date DATE,
  approved_by INT,
  approved_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_emp_skill (employee_id, skill_id),
  FOREIGN KEY (employee_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE,
  FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Courses Table
DROP TABLE IF EXISTS courses;
CREATE TABLE courses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) UNIQUE NOT NULL,
  description TEXT,
  duration_minutes INT DEFAULT 0,
  category VARCHAR(50) NOT NULL,
  instructor VARCHAR(100),
  difficulty VARCHAR(20) DEFAULT 'beginner',
  estimated_time VARCHAR(50),
  certificate_enabled BOOLEAN DEFAULT TRUE,
  cover_image LONGTEXT,
  evaluation_points INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Chapters Table
DROP TABLE IF EXISTS chapters;
CREATE TABLE chapters (
  id INT AUTO_INCREMENT PRIMARY KEY,
  course_id INT NOT NULL,
  title VARCHAR(150) NOT NULL,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Lessons Table
DROP TABLE IF EXISTS lessons;
CREATE TABLE lessons (
  id INT AUTO_INCREMENT PRIMARY KEY,
  chapter_id INT NOT NULL,
  title VARCHAR(150) NOT NULL,
  content_type VARCHAR(20) NOT NULL,
  content_url LONGTEXT,
  body_text TEXT,
  sort_order INT DEFAULT 0,
  evaluation_points INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (chapter_id) REFERENCES chapters(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Enrollments Table
DROP TABLE IF EXISTS enrollments;
CREATE TABLE enrollments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  employee_id INT NOT NULL,
  course_id INT NOT NULL,
  progress_percentage INT DEFAULT 0,
  status VARCHAR(20) DEFAULT 'pending',
  assigned_by INT,
  assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  due_date DATE,
  completed_at TIMESTAMP NULL,
  certificate_id VARCHAR(100) UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_emp_course (employee_id, course_id),
  FOREIGN KEY (employee_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
  FOREIGN KEY (assigned_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. Lesson Progress Table
DROP TABLE IF EXISTS lesson_progress;
CREATE TABLE lesson_progress (
  id INT AUTO_INCREMENT PRIMARY KEY,
  employee_id INT NOT NULL,
  lesson_id INT NOT NULL,
  completed BOOLEAN DEFAULT TRUE,
  completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_emp_lesson (employee_id, lesson_id),
  FOREIGN KEY (employee_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. Questions Table
DROP TABLE IF EXISTS questions;
CREATE TABLE questions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  lesson_id INT NOT NULL,
  question_type VARCHAR(20) NOT NULL DEFAULT 'multiple_choice',
  question_text TEXT NOT NULL,
  media_url LONGTEXT,
  options JSON NOT NULL,
  correct_answers JSON NOT NULL,
  points INT DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. Quiz Attempts Table
DROP TABLE IF EXISTS quiz_attempts;
CREATE TABLE quiz_attempts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  employee_id INT NOT NULL,
  lesson_id INT NOT NULL,
  score INT DEFAULT 0,
  passed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (employee_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 11. Daily Tasks Table
DROP TABLE IF EXISTS daily_tasks;
CREATE TABLE daily_tasks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  employee_id INT NOT NULL,
  task_name VARCHAR(150) NOT NULL,
  category VARCHAR(50) NOT NULL,
  description TEXT,
  status VARCHAR(20) DEFAULT 'pending',
  progress_percentage INT DEFAULT 0,
  supervisor_approved BOOLEAN DEFAULT FALSE,
  approved_by INT,
  approved_at TIMESTAMP NULL,
  due_date DATE NOT NULL,
  proof_file LONGTEXT,
  task_image LONGTEXT NULL,
  evaluation_points INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (employee_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 12. Working Hours Table
DROP TABLE IF EXISTS working_hours;
CREATE TABLE working_hours (
  id INT AUTO_INCREMENT PRIMARY KEY,
  employee_id INT NOT NULL,
  clock_in TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  clock_out TIMESTAMP NULL,
  break_start TIMESTAMP NULL,
  break_end TIMESTAMP NULL,
  ot_hours DECIMAL(4, 2) DEFAULT 0.00,
  status VARCHAR(20) DEFAULT 'present',
  date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_emp_date (employee_id, date),
  FOREIGN KEY (employee_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 13. Announcements Table
DROP TABLE IF EXISTS announcements;
CREATE TABLE announcements (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  content TEXT NOT NULL,
  created_by INT NOT NULL,
  category VARCHAR(50) DEFAULT 'General',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 14. Audit Logs Table
DROP TABLE IF EXISTS audit_logs;
CREATE TABLE audit_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  action VARCHAR(100) NOT NULL,
  details TEXT,
  ip_address VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 15. Notifications Table
DROP TABLE IF EXISTS notifications;
CREATE TABLE notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  title VARCHAR(150) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(20) DEFAULT 'in_app',
  read_status BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 16. Documents Table
DROP TABLE IF EXISTS documents;
CREATE TABLE documents (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  category VARCHAR(50) NOT NULL,
  file_url LONGTEXT NOT NULL,
  uploaded_by VARCHAR(100) NOT NULL,
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 17. Org Chart Table
DROP TABLE IF EXISTS org_chart;
CREATE TABLE org_chart (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  role_name VARCHAR(100) NOT NULL,
  level_order INT NOT NULL,
  level VARCHAR(50),
  warehouse_area VARCHAR(100),
  image_url LONGTEXT,
  display_order INT DEFAULT 0,
  parent_id INT NULL,
  photo_size VARCHAR(20) DEFAULT 'md',
  photo_shape VARCHAR(25) DEFAULT 'circle',
  pos_x INT DEFAULT 0,
  pos_y INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 18. Performance Settings Table
DROP TABLE IF EXISTS performance_settings;
CREATE TABLE performance_settings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  points_per_task INT DEFAULT 10,
  points_per_course INT DEFAULT 20,
  points_per_quiz INT DEFAULT 15,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 19. Warehouse Layouts Table
DROP TABLE IF EXISTS warehouse_layouts;
CREATE TABLE warehouse_layouts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  zone_name VARCHAR(100) NOT NULL,
  storage_level VARCHAR(50) NOT NULL,
  area_sqm DECIMAL(10, 2) DEFAULT 0.00,
  max_capacity_pallets INT DEFAULT 0,
  max_stack_level INT DEFAULT 1,
  product_type VARCHAR(255),
  layout_image LONGTEXT,
  zone_location VARCHAR(255) DEFAULT '',
  location_rows INT DEFAULT 0,
  location_stacks INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 20. Awarded Points Table
DROP TABLE IF EXISTS awarded_points;
CREATE TABLE awarded_points (
  id INT AUTO_INCREMENT PRIMARY KEY,
  employee_id INT NOT NULL,
  entity_type VARCHAR(20) NOT NULL,
  entity_id INT NOT NULL,
  points INT NOT NULL,
  awarded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_emp_entity (employee_id, entity_type, entity_id),
  FOREIGN KEY (employee_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===================================================================
-- Initial Seed Data
-- ===================================================================

-- 1. Users Seed
INSERT INTO users (id, employee_id, email, password_hash, name, role, department, position, warehouse_area, phone, status, supervisor_id, start_date, photo_url) VALUES
(1, 'EMP001', 'admin@warehouse.com', '$2a$10$e0MYzXy5FA47f7.rA.pS4eUa3qU0j4wF4.1Hj5K/v6Gv6o2C7Lh4C', 'ชาติชาย  ทาคำห่อ', 'admin', 'Management', 'Warehouse Supervisor', 'Executive Office', '081-234-5678', 'active', NULL, '2020-01-15', 'https://ibb.co/6RzFVqwD'),
(2, 'EMP002', 'hr@warehouse.com', '$2a$10$e0MYzXy5FA47f7.rA.pS4eUa3qU0j4wF4.1Hj5K/v6Gv6o2C7Lh4C', 'วิภาดา รักดี', 'admin', 'Human Resources', 'HR Manager', 'HR Office', '082-345-6789', 'active', NULL, '2021-03-10', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150'),
(3, 'EMP003', 'trainer@warehouse.com', '$2a$10$e0MYzXy5FA47f7.rA.pS4eUa3qU0j4wF4.1Hj5K/v6Gv6o2C7Lh4C', 'นรินทร์ เก่งการ', 'staff', 'Training', 'Senior Trainer', 'Training Center', '083-456-7890', 'active', NULL, '2021-06-01', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150'),
(4, 'EMP004', 'supervisor1@warehouse.com', '$2a$10$e0MYzXy5FA47f7.rA.pS4eUa3qU0j4wF4.1Hj5K/v6Gv6o2C7Lh4C', 'ประพันธ์ ยอดคุม', 'staff', 'Operations', 'Zone A Supervisor', 'Zone A', '084-567-8901', 'active', 1, '2022-02-15', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150'),
(5, 'EMP005', 'supervisor2@warehouse.com', '$2a$10$e0MYzXy5FA47f7.rA.pS4eUa3qU0j4wF4.1Hj5K/v6Gv6o2C7Lh4C', 'สมศรี มีคุม', 'staff', 'Operations', 'Zone B Supervisor', 'Zone B', '085-678-9012', 'active', 1, '2022-05-20', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150');

-- 2. Skills Seed
INSERT INTO skills (id, name, category, description) VALUES
(1, 'Forklift Operation (การขับรถโฟล์คลิฟต์)', 'Forklift', 'ทักษะการขับขี่และควบคุมรถยกสินค้า (Forklift) อย่างถูกต้อง ปลอดภัย และการดูแลรักษาระดับเบื้องต้น'),
(2, 'Warehouse Safety Rules (ความปลอดภัยในคลังสินค้า)', 'Safety', 'ความเข้าใจกฎความปลอดภัย ป้ายเตือน อุปกรณ์ป้องกันส่วนบุคคล (PPE) และแนวทางการป้องกันอุบัติเหตุ'),
(3, 'RF Barcode Scanner (เครื่องสแกนบาร์โค้ด RF)', 'RF Scanner', 'ทักษะการใช้งานอุปกรณ์ RF Scanner ในการรับ เข้า จัดเก็บ หยิบ และโอนย้ายสินค้าในระบบ WMS'),
(4, 'High-Efficiency Picking (การหยิบสินค้าที่มีประสิทธิภาพ)', 'Picking', 'เทคนิคการหยิบสินค้าตามใบสั่งซื้ออย่างถูกต้อง รวดเร็ว และลดความเสียหายในกระบวนการหยิบ'),
(5, 'Standard Packing & Labeling (การแพ็กและติดฉลากมาตรฐาน)', 'Packing', 'ทักษะการแพ็กสินค้าลงกล่อง การเลือกบรรจุภัณฑ์ การชั่งน้ำหนัก และการติดฉลากจัดส่งที่ถูกต้อง'),
(6, '5S Methodology (ระบบ 5ส ในการทำงาน)', '5S', 'การปฏิบัติตามมาตรฐาน 5ส (สะสาง สะดวก สะอาด สุขลักษณะ สร้างนิสัย) เพื่อเพิ่มประสิทธิภาพและความปลอดภัย'),
(7, 'Cycle Counting & Inventory Audit (การนับรอบสินค้าและตรวจสอบ)', 'Inventory', 'ทักษะการตรวจนับสต็อกแบบนับรอบ (Cycle Count) การบันทึกสินค้าคงคลัง และการตรวจสอบความถูกต้อง'),
(8, 'Receiving & Put Away (การรับสินค้าและการจัดเก็บ)', 'Receiving', 'กระบวนการตรวจสอบใบส่งสินค้า การรับสินค้าเข้าคลัง และการใช้คำสั่งจัดเก็บตามพิกัดชั้นวาง (Put Away)'),
(9, 'Barcode & QR Code Printing (การพิมพ์และจัดการบาร์โค้ด)', 'Barcode', 'ทักษะการจัดการเครื่องพิมพ์ฉลาก (Label Printer) การพิมพ์ฉลากบาร์โค้ดสินค้า และการแก้ไขปัญหาเบื้องต้น'),
(10, 'Quality Check & Defect Handling (การตรวจสอบคุณภาพและการจัดการของเสีย)', 'Quality', 'กระบวนการตรวจสอบคุณภาพสินค้าที่รับเข้าและส่งออก การแยกสินค้าชำรุด และการบันทึกรายงานของเสีย');

-- 3. Performance Settings Seed
INSERT INTO performance_settings (id, points_per_task, points_per_course, points_per_quiz) VALUES
(1, 10, 20, 15)
ON DUPLICATE KEY UPDATE points_per_task=10, points_per_course=20, points_per_quiz=15;

-- 4. Courses Seed
INSERT INTO courses (id, name, description, duration_minutes, category, instructor, difficulty, estimated_time, certificate_enabled) VALUES
(1, 'Warehouse Safety & Accident Prevention (ความปลอดภัยคลังสินค้า)', 'หลักสูตรพื้นฐานที่พนักงานทุกคนต้องเรียนรู้เกี่ยวกับความปลอดภัย การสวมใส่อุปกรณ์ป้องกันส่วนบุคคล (PPE) ป้ายสัญญาณเตือนภัย และขั้นตอนปฏิบัติเมื่อเกิดเหตุฉุกเฉิน', 120, 'Safety', 'นรินทร์ เก่งการ', 'beginner', '2 ชั่วโมง', TRUE),
(2, 'Forklift Operations Masterclass (การขับรถยกสินค้าและมาตรฐานความปลอดภัย)', 'หลักสูตรภาคทฤษฎีและปฏิบัติสำหรับผู้ที่ต้องทำหน้าที่ขับรถยกสินค้า (Forklift) ครอบคลุมการเช็กเครื่องยนต์ การควบคุมทิศทาง การยกชั้นวางสูง และการตอบสนองเมื่อรถยกขัดข้อง', 240, 'Forklift', 'นรินทร์ เก่งการ', 'intermediate', '4 ชั่วโมง', TRUE),
(3, 'Smart Warehouse WMS & RF Scanner Operations (การใช้เครื่องสแกน RF และระบบจัดการคลัง)', 'เรียนรู้การทำงานร่วมกับระบบ Warehouse Management System (WMS) และการใช้งานอุปกรณ์เครื่องสแกนเนอร์พกพา (RF Handheld Scanner) เพื่อความแม่นยำในการตรวจนับและเคลื่อนย้าย', 180, 'RF Scanner', 'นรินทร์ เก่งการ', 'intermediate', '3 ชั่วโมง', TRUE),
(4, 'High-Performance Picking & Sorting Methods (เทคนิคหยิบสินค้าชั้นเลิศ)', 'สอนแนวปฏิบัติที่เป็นเลิศในการหยิบและคัดแยกสินค้าเพื่อความเร็วและความแม่นยำสูงสุด ลดการขยับตัวเปล่าประโยชน์ การจัดลำดับหยิบ (Routing Strategy) และการอ่านรายละเอียดบาร์โค้ด', 90, 'Picking', 'สมชาย แสนดี', 'beginner', '1.5 ชั่วโมง', TRUE),
(5, 'Enterprise 5S Standard (การจัดระบบ 5ส ระดับองค์กร)', 'แนวทางการทำ 5ส เพื่อส่งเสริมความสะอาด ความเป็นระเบียบเรียบร้อย เพิ่มพื้นที่ใช้สอยในคลังสินค้า และสร้างนิสัยความปลอดภัยในการทำงานประจำวัน', 60, '5S', 'วิภาดา รักดี', 'beginner', '1 ชั่วโมง', TRUE);

-- 5. Chapters Seed
INSERT INTO chapters (id, course_id, title, sort_order) VALUES
(1, 1, 'บทนำและกฎความปลอดภัยทั่วไป', 1),
(2, 1, 'อุปกรณ์ป้องกันภัยส่วนบุคคล (PPE)', 2),
(3, 1, 'การทำข้อสอบประเมินความปลอดภัย', 3),
(4, 2, 'โครงสร้างและการควบคุมรถโฟล์คลิฟต์', 1),
(5, 2, 'มาตรฐานความปลอดภัยในการยกของสูง', 2),
(6, 2, 'การประเมินทักษะการขับขี่รถยก', 3),
(7, 3, 'การทำความรู้จัก WMS และ RF Scanner', 1),
(8, 3, 'ฟังก์ชันการรับสินค้าและจัดเก็บพิกัด', 2),
(9, 3, 'การทำข้อสอบระบบสแกนบาร์โค้ด', 3);

-- 6. Lessons Seed
INSERT INTO lessons (id, chapter_id, title, content_type, content_url, body_text, sort_order) VALUES
(1, 1, 'ความปลอดภัยคือหัวใจหลัก', 'video', 'https://www.youtube.com/embed/5F7Jt5pUlyU', 'ยินดีต้อนรับเข้าสู่บทเรียนด้านความปลอดภัย บทเรียนนี้จะแนะนำป้ายเตือนและกฎพื้นฐานในคลังสินค้า', 1),
(2, 1, 'คู่มือมาตรการป้องกับอุบัติเหตุ PDF', 'document', 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', 'โปรดศึกษาเอกสารข้อกำหนดความปลอดภัยตามกฎกระทรวงและคู่มือองค์กร', 2),
(3, 2, 'ประเภทและการใช้งานอุปกรณ์ PPE', 'video', 'https://www.youtube.com/embed/kR66aN42mCc', 'อธิบายการสวมใส่หมวกนิรภัย เสื้อสะท้อนแสง และรองเท้าเซฟตี้', 1),
(4, 2, 'รูปภาพสรุปการแต่งกายที่ถูกต้อง', 'image', 'https://images.unsplash.com/photo-1581094288338-2314dddb7eed?w=600', 'ตัวอย่างพนักงานสวมชุด PPE ถูกต้องครบถ้วนขณะปฏิบัติงานคลังสินค้า', 2),
(5, 3, 'แบบทดสอบวัดระดับความรู้เรื่องความปลอดภัย', 'quiz', NULL, 'กรุณาทำข้อสอบด้านความปลอดภัยให้ผ่านอย่างน้อย 80% (4 ใน 5 ข้อ) เพื่อรับใบรับรองในระบบ', 1),
(6, 4, 'โครงสร้างรถยกและการตรวจสอบก่อนขับ', 'video', 'https://www.youtube.com/embed/fW4o8Uex9aQ', 'วิดีโอสาธิตการเช็กรอบคัน ระดับน้ำมันไฮดรอลิก ล้อ และระบบเบรกของรถโฟล์คลิฟต์', 1),
(7, 5, 'กฎการควบคุมความเร็วและการเข้ามุมอับ', 'document', 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', 'ข้อกำหนดความเร็วไม่เกิน 10 กม./ชม. ในคลังสินค้า และการบีบแตรเตือนที่ทางแยก', 1),
(8, 6, 'แบบทดสอบการขับและยกของสูง', 'quiz', NULL, 'ตอบคำถามจำลองสถานการณ์ความปลอดภัยในการขับขี่', 1),
(9, 7, 'แนะนำตัวเครื่องและปุ่มควบคุมหลัก', 'video', 'https://www.youtube.com/embed/yVwL1tXgC_s', 'วิดีโอสาธิตวิธีการเปิดเครื่อง เชื่อมต่อ Wi-Fi และหน้าจอเมนูหลักของ WMS App', 1),
(10, 8, 'เทคนิคการสแกนบาร์โค้ดที่รวดเร็ว', 'document', 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', 'วิธีรักษาระยะห่าง 15-30 ซม. ในการยิงเลเซอร์ และการจัดการฉลากสินค้าที่ชำรุดเสียหาย', 1),
(11, 9, 'แบบทดสอบวัดทักษะการใช้ RF Scanner', 'quiz', NULL, 'ประเมินความรู้การบันทึกสถานะรับเข้าและจัดเก็บ', 1);

-- 7. Questions Seed
INSERT INTO questions (id, lesson_id, question_type, question_text, media_url, options, correct_answers, points) VALUES
(1, 5, 'multiple_choice', 'เมื่อเห็นสัญลักษณ์ป้ายเตือนพื้นสีเหลืองขอบดำ หมายถึงสัญลักษณ์ประเภทใด?', NULL, '["เตือนให้ระวัง (Warning)", "ห้ามปฏิบัติ (Prohibition)", "ป้ายแนะนำความปลอดภัย (Information)", "บังคับให้ต้องปฏิบัติ (Mandatory)"]', '[0]', 1),
(2, 5, 'true_false', 'รองเท้าผ้าใบธรรมดาสามารถสวมปฏิบัติงานในเขตคลังเก็บของหนักได้ หากระมัดระวังเป็นพิเศษ', NULL, '["ถูกต้อง", "ไม่ถูกต้อง (ต้องใช้รองเท้าหัวเหล็กนิรภัยเท่านั้น)"]', '[1]', 1),
(3, 5, 'checkbox', 'อุปกรณ์ชิ้นใดจัดอยู่ในประเภทเครื่องป้องกันหน้าและดวงตา? (เลือกได้มากกว่า 1 ข้อ)', NULL, '["แว่นตานิรภัย (Safety Glasses)", "กระบังหน้ากันสะเก็ด (Face Shield)", "หมวกนิรภัย (Hard Hat)", "ที่อุดหู (Earplugs)"]', '[0, 1]', 1),
(4, 5, 'multiple_choice', 'หากเกิดเหตุเพลิงไหม้เบื้องต้น สิ่งแรกที่พนักงานควรทำคืออะไร?', NULL, '["ดึงอุปกรณ์สัญญาณแจ้งเหตุเพลิงไหม้ (Fire Alarm) หรือตะโกนเตือนภัย", "วิ่งหนีออกจากคลังสินค้าไปที่ลานจอดรถทันที", "โทรหาครอบครัวแจ้งสถานการณ์", "พยายามขนสินค้าออกจากโกดัง"]', '[0]', 1),
(5, 5, 'picture', 'จากภาพสัญลักษณ์ถังดับเพลิงสีแดงนี้ เหมาะสำหรับดับเพลิงประเภทใดเป็นหลัก?', 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=300', '["Class A (ไม้, กระดาษ, พลาสติก)", "Class D (โลหะติดไฟ)", "Class K (น้ำมันทำอาหาร)", "ประเภทแก๊สติดไฟเท่านั้น"]', '[0]', 1),
(6, 8, 'multiple_choice', 'การกำหนดความเร็วสูงสุดสำหรับรถโฟล์คลิฟต์ภายในพื้นที่คลังสินค้าคือเท่าใด?', NULL, '["10 กม./ชม.", "20 กม./ชม.", "5 กม./ชม.", "ไม่มีกำหนด"]', '[0]', 1),
(7, 8, 'true_false', 'หากน้ำหนักสินค้าเกินพิกัดเล็กน้อย สามารถนำเหล็กถ่วงน้ำหนักมาติดตั้งท้ายรถโฟล์คลิฟต์เพิ่มเติมได้', NULL, '["จริง", "เท็จ (ห้ามดัดแปลงรถยกและต้องห้ามยกเกินน้ำหนักที่กำหนดเด็ดขาด)"]', '[1]', 1),
(8, 11, 'multiple_choice', 'หากเครื่องยิงบาร์โค้ดแสดงความผิดพลาด \"Put Away Location Mismatch\" หมายความว่าอย่างไร?', NULL, '["ชั้นวางปลายทางไม่ตรงกับที่ระบบแนะนำ", "สัญญาณเชื่อมต่ออินเทอร์เน็ตขาดหาย", "บาร์โค้ดสินค้าสกปรกเกินไป", "ยังไม่ได้ทำการสแกนรับเข้าคลัง"]', '[0]', 1),
(9, 11, 'true_false', 'ผู้ใช้งานสามารถพิมพ์พิกัดชั้นวางลงไปแทนการเดินไปยิงบาร์โค้ดที่หน้าชั้นวางได้ตลอดเวลา', NULL, '["ถูกต้อง", "ไม่ถูกต้อง (ต้องเดินไปสแกนที่ชั้นวางจริงเพื่อป้องกันข้อผิดพลาดทางสต็อก)"]', '[1]', 1);

-- 8. Warehouse Layouts Seed
INSERT INTO warehouse_layouts (zone_name, storage_level, area_sqm, max_capacity_pallets, max_stack_level, product_type, layout_image, zone_location, location_rows, location_stacks) VALUES
('คลังสินค้า 24 Land', 'ชั้น 1', 1200.00, 800, 3, 'เครื่องใช้ไฟฟ้าและสินค้าบรรจุกล่องทั่วไป', '', 'A', 10, 4),
('คลังสินค้า 24 Land', 'ชั้น 2', 800.00, 500, 2, 'อะไหล่และชิ้นส่วนอิเล็กทรอนิกส์น้ำหนักเบา', '', 'B', 8, 3),
('คลังสินค้า Coil', 'ชั้น 1', 1500.00, 600, 1, 'ม้วนเหล็กแผ่นและเหล็กม้วนอุตสาหกรรมหนัก', '', 'A', 5, 2),
('คลังสินค้า 2PCS', 'ชั้น 1', 950.00, 450, 4, 'ชิ้นส่วนและอุปกรณ์รถยนต์แยกประเภท', '', 'C', 12, 5),
('คลังสินค้าโรง2,5', 'ชั้น 1', 2000.00, 1500, 3, 'วัตถุดิบ บรรจุภัณฑ์ และสินค้าเพื่อรอจำหน่าย', '', 'D', 15, 4),
('คลังสินค้าโรง 6', 'ชั้น 1', 1800.00, 1200, 3, 'สินค้าสำเร็จรูป พร้อมขนส่งและกระจายสินค้า', '', 'E', 12, 4);

-- 9. Org Chart Seed
INSERT INTO org_chart (id, name, role_name, level_order, level, warehouse_area, image_url) VALUES 
(1, 'ประวิตร รักดี', 'ผู้จัดการฝ่ายวางแผนการผลิต คลังสินค้าและขนส่ง', 1, 'L1', 'Management', ''),
(2, 'สมชาย มีสุข', 'ผู้จัดการแผนกวางแผนการผลิต คลังสินค้าและขนส่ง', 2, 'L2', 'Management', ''),
(3, 'ประพันธ์ ยอดคุม', 'หัวหน้าแผนกคลังสินค้า', 3, 'L3', 'Warehouse', ''),
(4, 'วิชัย อดทน', 'หัวหน้างานคลังสินค้า', 4, 'L4', 'Warehouse', ''),
(5, 'เกล้า ทองดี', 'เจ้าหน้าที่คลังสินค้า', 5, 'L5', 'Zone A', ''),
(6, 'สิริ พูนเพิ่ม', 'เจ้าหน้าที่บันทึกข้อมูล', 5, 'L5', 'Zone A', ''),
(7, 'สมปอง ลุยงาน', 'พนักงานขับรถยก รับ-จ่าย', 6, 'L6', 'Zone A', ''),
(8, 'มานะ คัดของ', 'พนักงานหน้าลิฟท์', 7, 'L7', 'Zone B', ''),
(9, 'สมศักดิ์ รักชาติ', 'พนักงานยิง Barcode', 5, 'L5', 'Zone B', ''),
(10, 'อรุณ ดีเลิศ', 'พนักงานจัดเตรียมสินค้า', 5, 'L5', 'Zone B', '');

SET FOREIGN_KEY_CHECKS = 1;
