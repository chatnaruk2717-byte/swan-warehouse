-- PostgreSQL Database Schema for Warehouse Employee Training & Skill Management System

-- Drop tables if they exist (for easy deployment/reset)
DROP TABLE IF EXISTS documents CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS announcements CASCADE;
DROP TABLE IF EXISTS working_hours CASCADE;
DROP TABLE IF EXISTS daily_tasks CASCADE;
DROP TABLE IF EXISTS quiz_attempts CASCADE;
DROP TABLE IF EXISTS questions CASCADE;
DROP TABLE IF EXISTS lesson_progress CASCADE;
DROP TABLE IF EXISTS enrollments CASCADE;
DROP TABLE IF EXISTS lessons CASCADE;
DROP TABLE IF EXISTS chapters CASCADE;
DROP TABLE IF EXISTS courses CASCADE;
DROP TABLE IF EXISTS employee_skills CASCADE;
DROP TABLE IF EXISTS skills CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 1. Users Table (Employees and Administrators)
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    employee_id VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'staff', 'employee')),
    department VARCHAR(100) NOT NULL,
    position VARCHAR(100) NOT NULL,
    warehouse_area VARCHAR(100),
    phone VARCHAR(20),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    supervisor_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    start_date DATE NOT NULL DEFAULT CURRENT_DATE,
    photo_url TEXT,
    working_shift VARCHAR(10) DEFAULT 'A' CHECK (working_shift IN ('A', 'B')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Skills Table
CREATE TABLE skills (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN ('Warehouse', 'Receiving', 'Picking', 'Packing', 'Forklift', 'Safety', 'Quality', '5S', 'Inventory', 'Barcode', 'RF Scanner')),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Employee Skills Table (Skill Matrix)
CREATE TABLE employee_skills (
    id SERIAL PRIMARY KEY,
    employee_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    skill_id INTEGER NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
    level INTEGER NOT NULL DEFAULT 1 CHECK (level BETWEEN 1 AND 5),
    status VARCHAR(20) NOT NULL DEFAULT 'need_training' CHECK (status IN ('need_training', 'training', 'qualified', 'expert')),
    certification_name VARCHAR(150),
    certification_url VARCHAR(255),
    expiration_date DATE,
    approved_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    approved_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (employee_id, skill_id)
);

-- 4. Courses Table
CREATE TABLE courses (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) UNIQUE NOT NULL,
    description TEXT,
    duration_minutes INTEGER DEFAULT 0,
    category VARCHAR(50) NOT NULL CHECK (category IN ('Warehouse', 'Receiving', 'Picking', 'Packing', 'Forklift', 'Safety', 'Quality', '5S', 'Inventory', 'Barcode', 'RF Scanner')),
    instructor VARCHAR(100),
    difficulty VARCHAR(20) DEFAULT 'beginner' CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
    estimated_time VARCHAR(50),
    certificate_enabled BOOLEAN DEFAULT TRUE,
    cover_image TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Chapters Table
CREATE TABLE chapters (
    id SERIAL PRIMARY KEY,
    course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    title VARCHAR(150) NOT NULL,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Lessons Table
CREATE TABLE lessons (
    id SERIAL PRIMARY KEY,
    chapter_id INTEGER NOT NULL REFERENCES chapters(id) ON DELETE CASCADE,
    title VARCHAR(150) NOT NULL,
    content_type VARCHAR(20) NOT NULL CHECK (content_type IN ('video', 'document', 'image', 'quiz', 'assignment')),
    content_url VARCHAR(255), -- video URL (MP4/YouTube) or document URL (PDF/Word/PPT)
    body_text TEXT,           -- textual content/instructions
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. Enrollments Table (Course Assignments and Progress)
CREATE TABLE enrollments (
    id SERIAL PRIMARY KEY,
    employee_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage BETWEEN 0 AND 100),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
    assigned_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    due_date DATE,
    completed_at TIMESTAMP,
    certificate_id VARCHAR(100) UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(employee_id, course_id)
);

-- 8. Lesson Progress Table
CREATE TABLE lesson_progress (
    id SERIAL PRIMARY KEY,
    employee_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    lesson_id INTEGER NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
    completed BOOLEAN DEFAULT TRUE,
    completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(employee_id, lesson_id)
);

-- 9. Questions Table (Quiz system)
CREATE TABLE questions (
    id SERIAL PRIMARY KEY,
    lesson_id INTEGER NOT NULL REFERENCES lessons(id) ON DELETE CASCADE, -- Should link to a quiz lesson
    question_type VARCHAR(20) NOT NULL DEFAULT 'multiple_choice' CHECK (question_type IN ('multiple_choice', 'true_false', 'checkbox', 'picture', 'video')),
    question_text TEXT NOT NULL,
    media_url VARCHAR(255), -- Used for picture/video questions
    options JSONB NOT NULL, -- Array of strings e.g. ["Option A", "Option B", ...]
    correct_answers JSONB NOT NULL, -- Array of indices of correct options e.g. [0] or [1, 2]
    points INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 10. Quiz Attempts Table
CREATE TABLE quiz_attempts (
    id SERIAL PRIMARY KEY,
    employee_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    lesson_id INTEGER NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
    score INTEGER DEFAULT 0,
    passed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 11. Daily Tasks Table
CREATE TABLE daily_tasks (
    id SERIAL PRIMARY KEY,
    employee_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    task_name VARCHAR(150) NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN ('Receiving', 'Put Away', 'Picking', 'Packing', 'Loading', 'Cycle Count', 'Return', 'Quality Check', 'Kaizen', 'OPL', 'NearMiss', 'KYT', 'FI', 'อื่นๆ')),
    description TEXT,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'overdue')),
    progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage BETWEEN 0 AND 100),
    supervisor_approved BOOLEAN DEFAULT FALSE,
    approved_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    approved_at TIMESTAMP,
    due_date DATE NOT NULL DEFAULT CURRENT_DATE,
    proof_file TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 12. Working Hours (Clock In/Out & Attendance)
CREATE TABLE working_hours (
    id SERIAL PRIMARY KEY,
    employee_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    clock_in TIMESTAMP NOT NULL,
    clock_out TIMESTAMP,
    break_start TIMESTAMP,
    break_end TIMESTAMP,
    ot_hours NUMERIC(4, 2) DEFAULT 0.00,
    status VARCHAR(20) DEFAULT 'present' CHECK (status IN ('present', 'late', 'leave', 'absent')),
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(employee_id, date)
);

-- 13. Announcements Table
CREATE TABLE announcements (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    created_by INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category VARCHAR(50) DEFAULT 'General' CHECK (category IN ('Safety', 'Training', 'System', 'General')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 14. Audit Logs Table
CREATE TABLE audit_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    details TEXT,
    ip_address VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 15. Notifications Table
CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(150) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(20) DEFAULT 'in_app' CHECK (type IN ('in_app', 'email', 'line')),
    read_status BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 16. Warehouse Documents Table
CREATE TABLE documents (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN ('JD', 'WI', 'กฎระเบียบข้อบังคับ', 'Kaizen', 'OPL', 'NearMiss', 'แบบฟอร์มใช้คลังสินค้า')),
    file_url TEXT NOT NULL,
    uploaded_by VARCHAR(100) NOT NULL,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indices for optimization
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_employee_id ON users(employee_id);
CREATE INDEX idx_employee_skills_emp ON employee_skills(employee_id);
CREATE INDEX idx_daily_tasks_emp_date ON daily_tasks(employee_id, due_date);
CREATE INDEX idx_working_hours_emp_date ON working_hours(employee_id, date);
CREATE INDEX idx_enrollments_emp ON enrollments(employee_id);
CREATE INDEX idx_lessons_chapter ON lessons(chapter_id);
CREATE INDEX idx_questions_lesson ON questions(lesson_id);
CREATE INDEX idx_notifications_user_unread ON notifications(user_id, read_status);

-- 17. Organization Chart Table
CREATE TABLE org_chart (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    role_name VARCHAR(100) NOT NULL,
    level_order INTEGER NOT NULL, -- 1: ผู้จัดการ, 2: ผู้ช่วยผู้จัดการ, 3: หัวหน้าแผนก, 4: หัวหน้างาน, 5: ปฏิบัติงาน
    image_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed Org Chart Data
INSERT INTO org_chart (name, role_name, level_order, image_url) VALUES 
('ประวิตร รักดี', 'ผู้จัดการแผนกวางแผนการผลิต คลังสินค้าและขนส่ง', 1, ''),
('สมชาย มีสุข', 'ผู้ช่วยผู้จัดการแผนกวางแผนการผลิต คลังสินค้าและขนส่ง', 2, ''),
('ประพันธ์ ยอดคุม', 'หัวหน้าแผนกคลังสินค้า', 3, ''),
('วิชัย อดทน', 'หัวหน้างานคลังสินค้า', 4, ''),
('เกล้า ทองดี', 'เจ้าหน้าที่คลังสินค้า', 5, ''),
('สิริ พูนเพิ่ม', 'เจ้าหน้าที่บันทึกข้อมูล', 5, ''),
('สมปอง ลุยงาน', 'พนักงานขับรถยก รับ-จ่าย', 5, ''),
('มานะ คัดของ', 'พนักงานหน้าลิฟท์', 5, ''),
('สมศักดิ์ รักชาติ', 'พนักงานยิง Barcode', 5, ''),
('อรุณ ดีเลิศ', 'พนักงานจัดเตรียมสินค้า', 5, '');
