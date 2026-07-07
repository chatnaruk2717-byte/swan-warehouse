import mysql from 'mysql2/promise';

export const initializeMySQL = async (pool: mysql.Pool) => {
  const connection = await pool.getConnection();
  try {
    // Check if users table already exists to avoid re-initializing
    const [tables] = await connection.query("SHOW TABLES LIKE 'users'");
    if (Array.isArray(tables) && tables.length > 0) {
      console.log('Tables already exist. Ensuring all required columns are LONGTEXT.');
      try {
        await connection.query('ALTER TABLE users MODIFY COLUMN photo_url LONGTEXT');
        await connection.query('ALTER TABLE courses MODIFY COLUMN cover_image LONGTEXT');
        await connection.query('ALTER TABLE lessons MODIFY COLUMN content_url LONGTEXT');
        await connection.query('ALTER TABLE questions MODIFY COLUMN media_url LONGTEXT');
        await connection.query('ALTER TABLE documents MODIFY COLUMN file_url LONGTEXT NOT NULL');
        await connection.query('ALTER TABLE daily_tasks MODIFY COLUMN proof_file LONGTEXT');
        await connection.query('ALTER TABLE org_chart MODIFY COLUMN image_url LONGTEXT');
        await connection.query('ALTER TABLE org_chart ADD COLUMN display_order INT DEFAULT 0').catch(() => {});
        console.log('Successfully verified/altered all required columns to LONGTEXT and display_order.');
      } catch (err: any) {
        console.warn('Failed to alter columns:', err.message);
      }
      return;
    }

    console.log('Initializing MySQL Database schema and seed data...');
    
    // Disable Foreign Key checks temporarily during schema setup
    await connection.query('SET FOREIGN_KEY_CHECKS = 0');

    // Create Tables
    const schemaQueries = [
      `CREATE TABLE IF NOT EXISTS users (
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
        supervisor_id INT,
        start_date DATE NOT NULL,
        photo_url LONGTEXT,
        working_shift VARCHAR(10) DEFAULT 'A',
        evaluation_score INT DEFAULT 100,
        accumulated_points INT DEFAULT 0,
        absent_count INT DEFAULT 0,
        leave_count INT DEFAULT 0,
        late_count INT DEFAULT 0,
        warning_letters INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (supervisor_id) REFERENCES users(id) ON DELETE SET NULL
      )`,

      `CREATE TABLE IF NOT EXISTS skills (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) UNIQUE NOT NULL,
        category VARCHAR(50) NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,

      `CREATE TABLE IF NOT EXISTS employee_skills (
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
        UNIQUE (employee_id, skill_id),
        FOREIGN KEY (employee_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE,
        FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL
      )`,

      `CREATE TABLE IF NOT EXISTS courses (
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
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )`,

      `CREATE TABLE IF NOT EXISTS chapters (
        id INT AUTO_INCREMENT PRIMARY KEY,
        course_id INT NOT NULL,
        title VARCHAR(150) NOT NULL,
        sort_order INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
      )`,

      `CREATE TABLE IF NOT EXISTS lessons (
        id INT AUTO_INCREMENT PRIMARY KEY,
        chapter_id INT NOT NULL,
        title VARCHAR(150) NOT NULL,
        content_type VARCHAR(20) NOT NULL,
        content_url LONGTEXT,
        body_text TEXT,
        sort_order INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (chapter_id) REFERENCES chapters(id) ON DELETE CASCADE
      )`,

      `CREATE TABLE IF NOT EXISTS enrollments (
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
        UNIQUE(employee_id, course_id),
        FOREIGN KEY (employee_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
        FOREIGN KEY (assigned_by) REFERENCES users(id) ON DELETE SET NULL
      )`,

      `CREATE TABLE IF NOT EXISTS lesson_progress (
        id INT AUTO_INCREMENT PRIMARY KEY,
        employee_id INT NOT NULL,
        lesson_id INT NOT NULL,
        completed BOOLEAN DEFAULT TRUE,
        completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(employee_id, lesson_id),
        FOREIGN KEY (employee_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE
      )`,

      `CREATE TABLE IF NOT EXISTS questions (
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
      )`,

      `CREATE TABLE IF NOT EXISTS quiz_attempts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        employee_id INT NOT NULL,
        lesson_id INT NOT NULL,
        score INT DEFAULT 0,
        passed BOOLEAN DEFAULT FALSE,
        completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (employee_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE
      )`,

      `CREATE TABLE IF NOT EXISTS daily_tasks (
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
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (employee_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL
      )`,

      `CREATE TABLE IF NOT EXISTS working_hours (
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
        UNIQUE(employee_id, date),
        FOREIGN KEY (employee_id) REFERENCES users(id) ON DELETE CASCADE
      )`,

      `CREATE TABLE IF NOT EXISTS announcements (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(200) NOT NULL,
        content TEXT NOT NULL,
        created_by INT NOT NULL,
        category VARCHAR(50) DEFAULT 'General',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
      )`,

      `CREATE TABLE IF NOT EXISTS audit_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        action VARCHAR(100) NOT NULL,
        details TEXT,
        ip_address VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
      )`,

      `CREATE TABLE IF NOT EXISTS notifications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        title VARCHAR(150) NOT NULL,
        message TEXT NOT NULL,
        type VARCHAR(20) DEFAULT 'in_app',
        read_status BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )`,

      `CREATE TABLE IF NOT EXISTS documents (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(200) NOT NULL,
        category VARCHAR(50) NOT NULL,
        file_url LONGTEXT NOT NULL,
        uploaded_by VARCHAR(100) NOT NULL,
        uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,

      `CREATE TABLE IF NOT EXISTS org_chart (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        role_name VARCHAR(100) NOT NULL,
        level_order INT NOT NULL,
        level VARCHAR(50),
        warehouse_area VARCHAR(100),
        image_url LONGTEXT,
        display_order INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )`,

      `CREATE TABLE IF NOT EXISTS performance_settings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        points_per_task INT DEFAULT 10,
        points_per_course INT DEFAULT 20,
        points_per_quiz INT DEFAULT 15,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )`
    ];

    for (const query of schemaQueries) {
      await connection.query(query);
    }

    // Upgrade existing database schemas if needed
    try {
      await connection.query("ALTER TABLE org_chart ADD COLUMN level VARCHAR(50)");
    } catch (e) {}
    try {
      await connection.query("ALTER TABLE org_chart ADD COLUMN warehouse_area VARCHAR(100)");
    } catch (e) {}
    try {
      await connection.query("ALTER TABLE users ADD COLUMN evaluation_score INT DEFAULT 100");
    } catch (e) {}
    try {
      await connection.query("ALTER TABLE users ADD COLUMN accumulated_points INT DEFAULT 0");
    } catch (e) {}
    try {
      await connection.query("ALTER TABLE users ADD COLUMN absent_count INT DEFAULT 0");
    } catch (e) {}
    try {
      await connection.query("ALTER TABLE users ADD COLUMN leave_count INT DEFAULT 0");
    } catch (e) {}
    try {
      await connection.query("ALTER TABLE users ADD COLUMN late_count INT DEFAULT 0");
    } catch (e) {}
    try {
      await connection.query("ALTER TABLE users ADD COLUMN warning_letters INT DEFAULT 0");
    } catch (e) {}
    try {
      await connection.query("ALTER TABLE lessons MODIFY COLUMN content_url LONGTEXT");
    } catch (e) {}

    // Seed default performance settings if not exists
    try {
      const settingsCountRes: any = await connection.query("SELECT COUNT(*) as count FROM performance_settings");
      const count = parseInt(settingsCountRes?.rows?.[0]?.count || settingsCountRes?.[0]?.count || '0', 10);
      if (count === 0) {
        await connection.query("INSERT INTO performance_settings (id, points_per_task, points_per_course, points_per_quiz) VALUES (1, 10, 20, 15)");
      }
    } catch (e) {
      console.error("Error seeding performance settings:", e);
    }

    console.log('MySQL schema tables created successfully.');

    // Seed Data
    // 1. Users
    await connection.query(`
      INSERT INTO users (id, employee_id, email, password_hash, name, role, department, position, warehouse_area, phone, status, supervisor_id, start_date, photo_url) VALUES
      (1, 'EMP001', 'admin@warehouse.com', '$2a$10$e0MYzXy5FA47f7.rA.pS4eUa3qU0j4wF4.1Hj5K/v6Gv6o2C7Lh4C', 'ชาติชาย  ทาคำห่อ', 'admin', 'Management', 'Warehouse Supervisor', 'Executive Office', '081-234-5678', 'active', NULL, '2020-01-15', 'https://ibb.co/6RzFVqwD'),
      (2, 'EMP002', 'hr@warehouse.com', '$2a$10$e0MYzXy5FA47f7.rA.pS4eUa3qU0j4wF4.1Hj5K/v6Gv6o2C7Lh4C', 'วิภาดา รักดี', 'admin', 'Human Resources', 'HR Manager', 'HR Office', '082-345-6789', 'active', NULL, '2021-03-10', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150'),
      (3, 'EMP003', 'trainer@warehouse.com', '$2a$10$e0MYzXy5FA47f7.rA.pS4eUa3qU0j4wF4.1Hj5K/v6Gv6o2C7Lh4C', 'นรินทร์ เก่งการ', 'staff', 'Training', 'Senior Trainer', 'Training Center', '083-456-7890', 'active', NULL, '2021-06-01', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150'),
      (4, 'EMP004', 'supervisor1@warehouse.com', '$2a$10$e0MYzXy5FA47f7.rA.pS4eUa3qU0j4wF4.1Hj5K/v6Gv6o2C7Lh4C', 'ประพันธ์ ยอดคุม', 'staff', 'Operations', 'Zone A Supervisor', 'Zone A', '084-567-8901', 'active', 1, '2022-02-15', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150'),
      (5, 'EMP005', 'supervisor2@warehouse.com', '$2a$10$e0MYzXy5FA47f7.rA.pS4eUa3qU0j4wF4.1Hj5K/v6Gv6o2C7Lh4C', 'สมศรี มีคุม', 'staff', 'Operations', 'Zone B Supervisor', 'Zone B', '085-678-9012', 'active', 1, '2022-05-20', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150'),
      (6, 'EMP006', 'employee1@warehouse.com', '$2a$10$e0MYzXy5FA47f7.rA.pS4eUa3qU0j4wF4.1Hj5K/v6Gv6o2C7Lh4C', 'สมปอง ลุยงาน', 'employee', 'Operations', 'Forklift Driver', 'Zone A', '086-789-0123', 'active', 4, '2023-01-10', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150'),
      (7, 'EMP007', 'employee2@warehouse.com', '$2a$10$e0MYzXy5FA47f7.rA.pS4eUa3qU0j4wF4.1Hj5K/v6Gv6o2C7Lh4C', 'อรอนงค์ แพ็กเก่ง', 'employee', 'Operations', 'Packer', 'Zone A', '087-890-1234', 'active', 4, '2023-04-15', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'),
      (8, 'EMP008', 'employee3@warehouse.com', '$2a$10$e0MYzXy5FA47f7.rA.pS4eUa3qU0j4wF4.1Hj5K/v6Gv6o2C7Lh4C', 'มานะ คัดของ', 'employee', 'Operations', 'Picker', 'Zone B', '088-901-2345', 'active', 5, '2023-08-01', 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150'),
      (9, 'EMP009', 'employee4@warehouse.com', '$2a$10$e0MYzXy5FA47f7.rA.pS4eUa3qU0j4wF4.1Hj5K/v6Gv6o2C7Lh4C', 'เกษม รับสินค้า', 'employee', 'Operations', 'Receiving Clerk', 'Loading Dock', '089-012-3456', 'active', 5, '2023-10-12', 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150'),
      (10, 'EMP010', 'employee5@warehouse.com', '$2a$10$e0MYzXy5FA47f7.rA.pS4eUa3qU0j4wF4.1Hj5K/v6Gv6o2C7Lh4C', 'จารุณี นับสต็อก', 'employee', 'Operations', 'Inventory Counter', 'Zone B', '081-111-2222', 'active', 5, '2024-01-05', 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150')
    `);

    // 2. Skills
    await connection.query(`
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
      (10, 'Quality Check & Defect Handling (การตรวจสอบคุณภาพและการจัดการของเสีย)', 'Quality', 'กระบวนการตรวจสอบคุณภาพสินค้าที่รับเข้าและส่งออก การแยกสินค้าชำรุด และการบันทึกรายงานของเสีย')
    `);

    // 3. Employee Skills (Skill Matrix)
    await connection.query(`
      INSERT INTO employee_skills (employee_id, skill_id, level, status, certification_name, certification_url, expiration_date, approved_by, approved_at) VALUES
      (6, 1, 4, 'expert', 'Forklift License Class A', 'https://example.com/certs/forklift_emp6.pdf', '2027-12-31', 4, '2024-02-15 10:00:00'),
      (6, 2, 3, 'qualified', 'Warehouse Safety Certificate', 'https://example.com/certs/safety_emp6.pdf', '2027-01-10', 4, '2024-01-20 11:30:00'),
      (6, 3, 3, 'qualified', NULL, NULL, NULL, 4, '2024-03-01 09:15:00'),
      (6, 6, 2, 'training', NULL, NULL, NULL, NULL, NULL),
      (7, 2, 4, 'expert', 'Advanced Safety Leader', 'https://example.com/certs/safety_emp7.pdf', '2026-06-01', 4, '2024-05-10 14:00:00'),
      (7, 5, 4, 'expert', 'Packing Excellence Certificate', NULL, NULL, 4, '2024-04-12 15:45:00'),
      (7, 6, 3, 'qualified', NULL, NULL, NULL, 4, '2024-02-10 10:20:00'),
      (8, 2, 2, 'training', NULL, NULL, NULL, NULL, NULL),
      (8, 4, 3, 'qualified', 'Picking Efficiency Pro', NULL, NULL, 5, '2024-03-18 16:00:00'),
      (8, 3, 2, 'training', NULL, NULL, NULL, NULL, NULL),
      (9, 8, 3, 'qualified', 'Receiving Clerk Standard Certificate', NULL, NULL, 5, '2024-02-28 13:00:00'),
      (9, 2, 3, 'qualified', 'Safety Standards Course', NULL, '2026-10-12', 5, '2023-11-01 10:00:00'),
      (9, 3, 3, 'qualified', NULL, NULL, NULL, 5, '2023-11-15 14:30:00'),
      (10, 7, 4, 'expert', 'Certified Inventory Controller', 'https://example.com/certs/inventory_emp10.pdf', '2027-01-05', 5, '2024-02-01 09:00:00'),
      (10, 2, 3, 'qualified', 'Safety Standards', NULL, NULL, 5, '2024-01-15 10:00:00'),
      (10, 6, 4, 'expert', '5S Auditor Certificate', NULL, NULL, 5, '2024-03-10 11:00:00')
    `);

    // 4. Courses
    await connection.query(`
      INSERT INTO courses (id, name, description, duration_minutes, category, instructor, difficulty, estimated_time, certificate_enabled) VALUES
      (1, 'Warehouse Safety & Accident Prevention (ความปลอดภัยคลังสินค้า)', 'หลักสูตรพื้นฐานที่พนักงานทุกคนต้องเรียนรู้เกี่ยวกับความปลอดภัย การสวมใส่อุปกรณ์ป้องกันส่วนบุคคล (PPE) ป้ายสัญญาณเตือนภัย และขั้นตอนปฏิบัติเมื่อเกิดเหตุฉุกเฉิน', 120, 'Safety', 'นรินทร์ เก่งการ', 'beginner', '2 ชั่วโมง', TRUE),
      (2, 'Forklift Operations Masterclass (การขับรถยกสินค้าและมาตรฐานความปลอดภัย)', 'หลักสูตรภาคทฤษฎีและปฏิบัติสำหรับผู้ที่ต้องทำหน้าที่ขับรถยกสินค้า (Forklift) ครอบคลุมการเช็กเครื่องยนต์ การควบคุมทิศทาง การยกชั้นวางสูง และการตอบสนองเมื่อรถยกขัดข้อง', 240, 'Forklift', 'นรินทร์ เก่งการ', 'intermediate', '4 ชั่วโมง', TRUE),
      (3, 'Smart Warehouse WMS & RF Scanner Operations (การใช้เครื่องสแกน RF และระบบจัดการคลัง)', 'เรียนรู้การทำงานร่วมกับระบบ Warehouse Management System (WMS) และการใช้งานอุปกรณ์เครื่องสแกนเนอร์พกพา (RF Handheld Scanner) เพื่อความแม่นยำในการตรวจนับและเคลื่อนย้าย', 180, 'RF Scanner', 'นรินทร์ เก่งการ', 'intermediate', '3 ชั่วโมง', TRUE),
      (4, 'High-Performance Picking & Sorting Methods (เทคนิคหยิบสินค้าชั้นเลิศ)', 'สอนแนวปฏิบัติที่เป็นเลิศในการหยิบและคัดแยกสินค้าเพื่อความเร็วและความแม่นยำสูงสุด ลดการขยับตัวเปล่าประโยชน์ การจัดลำดับหยิบ (Routing Strategy) และการอ่านรายละเอียดบาร์โค้ด', 90, 'Picking', 'สมชาย แสนดี', 'beginner', '1.5 ชั่วโมง', TRUE),
      (5, 'Enterprise 5S Standard (การจัดระบบ 5ส ระดับองค์กร)', 'แนวทางการทำ 5ส เพื่อส่งเสริมความสะอาด ความเป็นระเบียบเรียบร้อย เพิ่มพื้นที่ใช้สอยในคลังสินค้า และสร้างนิสัยความปลอดภัยในการทำงานประจำวัน', 60, '5S', 'วิภาดา รักดี', 'beginner', '1 ชั่วโมง', TRUE)
    `);

    // 5. Chapters
    await connection.query(`
      INSERT INTO chapters (id, course_id, title, sort_order) VALUES
      (1, 1, 'บทนำและกฎความปลอดภัยทั่วไป', 1),
      (2, 1, 'อุปกรณ์ป้องกันภัยส่วนบุคคล (PPE)', 2),
      (3, 1, 'การทำข้อสอบประเมินความปลอดภัย', 3),
      (4, 2, 'โครงสร้างและการควบคุมรถโฟล์คลิฟต์', 1),
      (5, 2, 'มาตรฐานความปลอดภัยในการยกของสูง', 2),
      (6, 2, 'การประเมินทักษะการขับขี่รถยก', 3),
      (7, 3, 'การทำความรู้จัก WMS และ RF Scanner', 1),
      (8, 3, 'ฟังก์ชันการรับสินค้าและจัดเก็บพิกัด', 2),
      (9, 3, 'การทำข้อสอบระบบสแกนบาร์โค้ด', 3)
    `);

    // 6. Lessons
    await connection.query(`
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
      (11, 9, 'แบบทดสอบวัดทักษะการใช้ RF Scanner', 'quiz', NULL, 'ประเมินความรู้การบันทึกสถานะรับเข้าและจัดเก็บ', 1)
    `);

    // 7. Questions (JSON objects passed directly for MySQL JSON columns)
    await connection.query(`
      INSERT INTO questions (id, lesson_id, question_type, question_text, media_url, options, correct_answers, points) VALUES
      (1, 5, 'multiple_choice', 'เมื่อเห็นสัญลักษณ์ป้ายเตือนพื้นสีเหลืองขอบดำ หมายถึงสัญลักษณ์ประเภทใด?', NULL, '["เตือนให้ระวัง (Warning)", "ห้ามปฏิบัติ (Prohibition)", "ป้ายแนะนำความปลอดภัย (Information)", "บังคับให้ต้องปฏิบัติ (Mandatory)"]', '[0]', 1),
      (2, 5, 'true_false', 'รองเท้าผ้าใบธรรมดาสามารถสวมปฏิบัติงานในเขตคลังเก็บของหนักได้ หากระมัดระวังเป็นพิเศษ', NULL, '["ถูกต้อง", "ไม่ถูกต้อง (ต้องใช้รองเท้าหัวเหล็กนิรภัยเท่านั้น)"]', '[1]', 1),
      (3, 5, 'checkbox', 'อุปกรณ์ชิ้นใดจัดอยู่ในประเภทเครื่องป้องกันหน้าและดวงตา? (เลือกได้มากกว่า 1 ข้อ)', NULL, '["แว่นตานิรภัย (Safety Glasses)", "กระบังหน้ากันสะเก็ด (Face Shield)", "หมวกนิรภัย (Hard Hat)", "ที่อุดหู (Earplugs)"]', '[0, 1]', 1),
      (4, 5, 'multiple_choice', 'หากเกิดเหตุเพลิงไหม้เบื้องต้น สิ่งแรกที่พนักงานควรทำคืออะไร?', NULL, '["ดึงอุปกรณ์สัญญาณแจ้งเหตุเพลิงไหม้ (Fire Alarm) หรือตะโกนเตือนภัย", "วิ่งหนีออกจากคลังสินค้าไปที่ลานจอดรถทันที", "โทรหาครอบครัวแจ้งสถานการณ์", "พยายามขนสินค้าออกจากโกดัง"]', '[0]', 1),
      (5, 5, 'picture', 'จากภาพสัญลักษณ์ถังดับเพลิงสีแดงนี้ เหมาะสำหรับดับเพลิงประเภทใดเป็นหลัก?', 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=300', '["Class A (ไม้, กระดาษ, พลาสติก)", "Class D (โลหะติดไฟ)", "Class K (น้ำมันทำอาหาร)", "ประเภทแก๊สติดไฟเท่านั้น"]', '[0]', 1),
      (6, 8, 'multiple_choice', 'การกำหนดความเร็วสูงสุดสำหรับรถโฟล์คลิฟต์ภายในพื้นที่คลังสินค้าคือเท่าใด?', NULL, '["10 กม./ชม.", "20 กม./ชม.", "5 กม./ชม.", "ไม่มีกำหนด"]', '[0]', 1),
      (7, 8, 'true_false', 'หากน้ำหนักสินค้าเกินพิกัดเล็กน้อย สามารถนำเหล็กถ่วงน้ำหนักมาติดตั้งท้ายรถโฟล์คลิฟต์เพิ่มเติมได้', NULL, '["จริง", "เท็จ (ห้ามดัดแปลงรถยกและต้องห้ามยกเกินน้ำหนักที่กำหนดเด็ดขาด)"]', '[1]', 1),
      (8, 11, 'multiple_choice', 'หากเครื่องยิงบาร์โค้ดแสดงความผิดพลาด "Put Away Location Mismatch" หมายความว่าอย่างไร?', NULL, '["ชั้นวางปลายทางไม่ตรงกับที่ระบบแนะนำ", "สัญญาณเชื่อมต่ออินเทอร์เน็ตขาดหาย", "บาร์โค้ดสินค้าสกปรกเกินไป", "ยังไม่ได้ทำการสแกนรับเข้าคลัง"]', '[0]', 1),
      (9, 11, 'true_false', 'ผู้ใช้งานสามารถพิมพ์พิกัดชั้นวางลงไปแทนการเดินไปยิงบาร์โค้ดที่หน้าชั้นวางได้ตลอดเวลา', NULL, '["ถูกต้อง", "ไม่ถูกต้อง (ต้องเดินไปสแกนที่ชั้นวางจริงเพื่อป้องกันข้อผิดพลาดทางสต็อก)"]', '[1]', 1)
    `);

    // 8. Enrollments
    await connection.query(`
      INSERT INTO enrollments (employee_id, course_id, progress_percentage, status, assigned_by, due_date, completed_at, certificate_id) VALUES
      (6, 1, 100, 'completed', 4, '2024-02-01', '2024-01-20 11:30:00', 'CERT-SAF-00612'),
      (6, 3, 50, 'in_progress', 4, '2026-08-31', NULL, NULL),
      (7, 1, 100, 'completed', 4, '2024-02-01', '2024-01-18 15:45:00', 'CERT-SAF-00713'),
      (7, 5, 100, 'completed', 4, '2024-03-15', '2024-02-28 10:00:00', 'CERT-5SS-00744'),
      (8, 1, 0, 'pending', 5, '2026-07-15', NULL, NULL),
      (8, 4, 100, 'completed', 5, '2024-03-31', '2024-03-18 16:00:00', 'CERT-PIC-00811'),
      (9, 1, 100, 'completed', 5, '2023-11-30', '2023-11-01 10:00:00', 'CERT-SAF-00911'),
      (10, 1, 100, 'completed', 5, '2024-02-15', '2024-01-15 10:00:00', 'CERT-SAF-01021')
    `);

    // 9. Lesson Progress
    await connection.query(`
      INSERT INTO lesson_progress (employee_id, lesson_id, completed, completed_at) VALUES
      (6, 1, TRUE, '2024-01-19 09:00:00'),
      (6, 2, TRUE, '2024-01-19 10:30:00'),
      (6, 3, TRUE, '2024-01-20 08:30:00'),
      (6, 4, TRUE, '2024-01-20 09:45:00'),
      (6, 5, TRUE, '2024-01-20 11:30:00'),
      (6, 9, TRUE, '2026-06-25 14:00:00'),
      (7, 1, TRUE, '2024-01-18 13:00:00'),
      (7, 2, TRUE, '2024-01-18 14:00:00'),
      (7, 3, TRUE, '2024-01-18 14:30:00'),
      (7, 4, TRUE, '2024-01-18 15:00:00'),
      (7, 5, TRUE, '2024-01-18 15:45:00')
    `);

    // 10. Quiz Attempts
    await connection.query(`
      INSERT INTO quiz_attempts (employee_id, lesson_id, score, passed, completed_at) VALUES
      (6, 5, 5, TRUE, '2024-01-20 11:30:00'),
      (7, 5, 4, TRUE, '2024-01-18 15:45:00')
    `);

    // 11. Daily Tasks
    await connection.query(`
      INSERT INTO daily_tasks (id, employee_id, task_name, category, description, status, progress_percentage, supervisor_approved, approved_by, approved_at, due_date) VALUES
      (1, 6, 'ขับย้ายพาเลทพัสดุโซนสินค้าขาเข้า', 'Put Away', 'ทำการเคลื่อนย้ายพาเลทน้ำเข้าจานตู้คอนเทนเนอร์ 15 พาเลท ไปจัดวางที่ชั้น A4 ถึง A12', 'completed', 100, TRUE, 4, '2026-06-29 12:00:00', '2026-06-29'),
      (2, 6, 'จัดเตรียมพื้นที่คลังสินค้าสัปดาห์ 5S', '5S', 'ปัดกวาดทางวิ่งรถยก ทาสีเส้นเหลืองทางเดินเท้าให้เด่นชัด และเช็ดทำความสะอาดชั้นเก็บสินค้าโซน A', 'completed', 100, TRUE, 4, '2026-06-30 11:00:00', '2026-06-30'),
      (3, 6, 'ตรวจสอบสภาพความปลอดภัยรถยกก่อนขับ', 'Quality Check', 'เช็กระดับน้ำมันไฮดรอลิก แรงดันลมยาง ไฟสัญญาณ และระบบเบรกของรถ Forklift หมายเลข FL-02', 'pending', 0, FALSE, NULL, NULL, '2026-07-02'),
      (4, 7, 'แพ็กกล่องเครื่องมืออุตสาหกรรม 120 ชุด', 'Packing', 'ตรวจสอบคุณภาพวัสดุกันกระแทก จัดสินค้าใส่กล่อง แปะป้าย Label บาร์โค้ด และนำไปจัดเก็บแถวรอส่ง', 'completed', 100, TRUE, 4, '2026-06-30 15:30:00', '2026-06-30'),
      (5, 7, 'สุ่มตรวจความถูกต้องป้ายน้ำหนักกล่องขาออก', 'Quality Check', 'นำสินค้าบรรจุเสร็จจำนวน 10 กล่อง มาชั่งน้ำหนักทดสอบความเที่ยงตรง และตรวจเช็กความชัดเจนของบาร์โค้ด', 'pending', 0, FALSE, NULL, NULL, '2026-07-02'),
      (6, 8, 'หยิบอะไหล่คอมเพรสเซอร์ตามคำสั่งซื้อ 45 รายการ', 'Picking', 'ใช้ใบเตรียมหยิบเดินสแกนพิกัด หยิบอะไหล่ให้ครบจำนวน และนำมาส่งที่จุดคัดแยกแพ็กโซน B', 'completed', 100, TRUE, 5, '2026-06-30 16:30:00', '2026-06-30'),
      (7, 8, 'ตรวจนับสต็อกน็อตสเตนเลสประจำรอบ', 'Cycle Count', 'นับจำนวนกล่องอะไหล่น็อต M8 และ M10 บริเวณตู้จัดเก็บชั้น B14 แล้วส่งรายงานยอดเข้าระบบ WMS', 'pending', 0, FALSE, NULL, NULL, '2026-07-02'),
      (8, 9, 'รับสินค้าท่อเหล็กจากซัพพลายเออร์ 3 รถบรรทุก', 'Receiving', 'ตรวจใบขนส่งสินค้า ตรวจเช็กจำนวน ทอดสายตามองสนิมและรอยขีดข่วนภายนอก ก่อนทำการเซ็นรับเข้าระบบ', 'completed', 100, TRUE, 5, '2026-06-30 14:00:00', '2026-06-30'),
      (9, 9, 'สแกนเก็บชุดสายไฟเข้าตำแหน่งชั้นพิกัดสูง', 'Put Away', 'ใช้เครื่องสแกน RF นำชุดพัสดุสายไฟขึ้นจัดเก็บชั้นวางพิกัดสูงชั้น 4 โซนโหลด Dock', 'pending', 0, FALSE, NULL, NULL, '2026-07-02'),
      (10, 10, 'ตรวจสอบความถูกต้องยอดสต็อกแผงวงจรควบคุม', 'Cycle Count', 'ทำการนับยอดแผงวงจรทั้งหมด 4 พิกัดในโซนนิรภัย เปรียบเทียบกับตัวเลขในหน้าจอคอมพิวเตอร์หลัก', 'completed', 100, TRUE, 5, '2026-06-30 12:00:00', '2026-06-30'),
      (11, 10, 'คัดแยกแผงวงจรชำรุดเสียหายออกจากพื้นที่เก็บ', 'Quality Check', 'ตรวจสอบแผงวงจรที่มีรอยบิ่นหรือคราบความชื้น แปะป้ายสินค้ากักกัน (Hold) และทำใบส่งคืนผู้ขาย', 'pending', 0, FALSE, NULL, NULL, '2026-07-02'),
      (12, 6, 'ฝึกปฏิบัติการหักเลี้ยวรถยกในวงจำกัด', 'Kaizen', 'เข้าร่วมอบรมคอร์สย่อยเทคนิคการกลับรถยกปลอดภัยในมุมแคบเพื่อเพิ่มประสิทธิภาพการหยิบจ่าย', 'in_progress', 80, FALSE, NULL, NULL, '2026-07-03'),
      (13, 7, 'ทบทวนการทำระบบป้ายควบคุม 5ส โซนแพ็กของ', '5S', 'จัดตู้วางอุปกรณ์เทปกาว กรรไกร และกล่องกระดาษให้อยู่ในพื้นที่วงกลมตีกระดาษระบุชัดเจน', 'in_progress', 50, FALSE, NULL, NULL, '2026-07-03')
    `);

    // 12. Working Hours
    await connection.query(`
      INSERT INTO working_hours (id, employee_id, clock_in, clock_out, break_start, break_end, ot_hours, status, date) VALUES
      (1, 6, '2026-06-30 08:00:00', '2026-06-30 17:00:00', '2026-06-30 12:00:00', '2026-06-30 13:00:00', 0.00, 'present', '2026-06-30'),
      (2, 7, '2026-06-30 07:55:00', '2026-06-30 17:00:00', '2026-06-30 12:00:00', '2026-06-30 13:00:00', 0.00, 'present', '2026-06-30'),
      (3, 8, '2026-06-30 08:15:00', '2026-06-30 17:00:00', '2026-06-30 12:00:00', '2026-06-30 13:00:00', 0.00, 'late', '2026-06-30'),
      (4, 9, '2026-06-30 08:00:00', '2026-06-30 17:00:00', '2026-06-30 12:00:00', '2026-06-30 13:00:00', 0.00, 'present', '2026-06-30'),
      (5, 10, '2026-06-30 07:50:00', '2026-06-30 17:00:00', '2026-06-30 12:00:00', '2026-06-30 13:00:00', 0.00, 'present', '2026-06-30')
    `);

    await connection.query(`
      INSERT INTO org_chart (id, name, role_name, level_order, level, warehouse_area, image_url) VALUES 
      (1, 'ประวิตร รักดี', 'ผู้จัดการแผนกวางแผนการผลิต คลังสินค้าและขนส่ง', 1, 'L1', 'Management', ''),
      (2, 'สมชาย มีสุข', 'ผู้ช่วยผู้จัดการแผนกวางแผนการผลิต คลังสินค้าและขนส่ง', 2, 'L2', 'Management', ''),
      (3, 'ประพันธ์ ยอดคุม', 'หัวหน้าแผนกคลังสินค้า', 3, 'L3', 'Warehouse', ''),
      (4, 'วิชัย อดทน', 'หัวหน้างานคลังสินค้า', 4, 'L4', 'Warehouse', ''),
      (5, 'เกล้า ทองดี', 'เจ้าหน้าที่คลังสินค้า', 5, 'L5', 'Zone A', ''),
      (6, 'สิริ พูนเพิ่ม', 'เจ้าหน้าที่บันทึกข้อมูล', 5, 'L5', 'Zone A', ''),
      (7, 'สมปอง ลุยงาน', 'พนักงานขับรถยก รับ-จ่าย', 5, 'L5', 'Zone A', ''),
      (8, 'มานะ คัดของ', 'พนักงานหน้าลิฟท์', 5, 'L5', 'Zone B', ''),
      (9, 'สมศักดิ์ รักชาติ', 'พนักงานยิง Barcode', 5, 'L5', 'Zone B', ''),
      (10, 'อรุณ ดีเลิศ', 'พนักงานจัดเตรียมสินค้า', 5, 'L5', 'Zone B', '')
    `);

    await connection.query('ALTER TABLE questions MODIFY COLUMN media_url LONGTEXT').catch((e) => {
      console.warn('Altering questions.media_url failed (might already be LONGTEXT):', e.message);
    });

    await connection.query('ALTER TABLE documents MODIFY COLUMN file_url LONGTEXT NOT NULL').catch((e) => {
      console.warn('Altering documents.file_url failed (might already be LONGTEXT):', e.message);
    });

    await connection.query('ALTER TABLE daily_tasks MODIFY COLUMN proof_file LONGTEXT').catch((e) => {
      console.warn('Altering daily_tasks.proof_file failed (might already be LONGTEXT):', e.message);
    });

    await connection.query('ALTER TABLE org_chart MODIFY COLUMN image_url LONGTEXT').catch((e) => {
      console.warn('Altering org_chart.image_url failed (might already be LONGTEXT):', e.message);
    });

    await connection.query('ALTER TABLE org_chart ADD COLUMN display_order INT DEFAULT 0').catch((e) => {
      console.warn('Altering org_chart.display_order failed:', e.message);
    });

    console.log('MySQL database initialized and seeded successfully.');

  } finally {
    // Re-enable Foreign Key checks
    await connection.query('SET FOREIGN_KEY_CHECKS = 1');
    connection.release();
  }
};
