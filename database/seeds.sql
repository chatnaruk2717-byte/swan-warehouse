-- Mock Seed Data for Warehouse Employee Training & Skill Management System
-- All passwords are encrypted using bcrypt for the string 'password123'
-- Hash: $2a$10$e0MYzXy5FA47f7.rA.pS4eUa3qU0j4wF4.1Hj5K/v6Gv6o2C7Lh4C

-- Insert Users (Administrators, HR, Trainers, Supervisors, Employees)
INSERT INTO users (employee_id, email, password_hash, name, role, department, position, warehouse_area, phone, status, supervisor_id, start_date, photo_url) VALUES
('EMP001', 'admin@warehouse.com', '$2a$10$e0MYzXy5FA47f7.rA.pS4eUa3qU0j4wF4.1Hj5K/v6Gv6o2C7Lh4C', 'ชาติชาย  ทาคำห่อ', 'admin', 'Management', 'Warehouse Supervisor', 'Executive Office', '081-234-5678', 'active', NULL, '2020-01-15', 'https://ibb.co/6RzFVqwD'),
('EMP002', 'hr@warehouse.com', '$2a$10$e0MYzXy5FA47f7.rA.pS4eUa3qU0j4wF4.1Hj5K/v6Gv6o2C7Lh4C', 'วิภาดา รักดี', 'admin', 'Human Resources', 'HR Manager', 'HR Office', '082-345-6789', 'active', NULL, '2021-03-10', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150'),
('EMP003', 'trainer@warehouse.com', '$2a$10$e0MYzXy5FA47f7.rA.pS4eUa3qU0j4wF4.1Hj5K/v6Gv6o2C7Lh4C', 'นรินทร์ เก่งการ', 'staff', 'Training', 'Senior Trainer', 'Training Center', '083-456-7890', 'active', NULL, '2021-06-01', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150'),
('EMP004', 'supervisor1@warehouse.com', '$2a$10$e0MYzXy5FA47f7.rA.pS4eUa3qU0j4wF4.1Hj5K/v6Gv6o2C7Lh4C', 'ประพันธ์ ยอดคุม', 'staff', 'Operations', 'Zone A Supervisor', 'Zone A', '084-567-8901', 'active', 1, '2022-02-15', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150'),
('EMP005', 'supervisor2@warehouse.com', '$2a$10$e0MYzXy5FA47f7.rA.pS4eUa3qU0j4wF4.1Hj5K/v6Gv6o2C7Lh4C', 'สมศรี มีคุม', 'staff', 'Operations', 'Zone B Supervisor', 'Zone B', '085-678-9012', 'active', 1, '2022-05-20', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150'),
('EMP006', 'employee1@warehouse.com', '$2a$10$e0MYzXy5FA47f7.rA.pS4eUa3qU0j4wF4.1Hj5K/v6Gv6o2C7Lh4C', 'สมปอง ลุยงาน', 'employee', 'Operations', 'Forklift Driver', 'Zone A', '086-789-0123', 'active', 4, '2023-01-10', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150'),
('EMP007', 'employee2@warehouse.com', '$2a$10$e0MYzXy5FA47f7.rA.pS4eUa3qU0j4wF4.1Hj5K/v6Gv6o2C7Lh4C', 'อรอนงค์ แพ็กเก่ง', 'employee', 'Operations', 'Packer', 'Zone A', '087-890-1234', 'active', 4, '2023-04-15', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'),
('EMP008', 'employee3@warehouse.com', '$2a$10$e0MYzXy5FA47f7.rA.pS4eUa3qU0j4wF4.1Hj5K/v6Gv6o2C7Lh4C', 'มานะ คัดของ', 'employee', 'Operations', 'Picker', 'Zone B', '088-901-2345', 'active', 5, '2023-08-01', 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150'),
('EMP009', 'employee4@warehouse.com', '$2a$10$e0MYzXy5FA47f7.rA.pS4eUa3qU0j4wF4.1Hj5K/v6Gv6o2C7Lh4C', 'เกษม รับสินค้า', 'employee', 'Operations', 'Receiving Clerk', 'Loading Dock', '089-012-3456', 'active', 5, '2023-10-12', 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150'),
('EMP010', 'employee5@warehouse.com', '$2a$10$e0MYzXy5FA47f7.rA.pS4eUa3qU0j4wF4.1Hj5K/v6Gv6o2C7Lh4C', 'จารุณี นับสต็อก', 'employee', 'Operations', 'Inventory Counter', 'Zone B', '081-111-2222', 'active', 5, '2024-01-05', 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150');

-- Insert Skills
INSERT INTO skills (name, category, description) VALUES
('Forklift Operation (การขับรถโฟล์คลิฟต์)', 'Forklift', 'ทักษะการขับขี่และควบคุมรถยกสินค้า (Forklift) อย่างถูกต้อง ปลอดภัย และการดูแลรักษาระดับเบื้องต้น'),
('Warehouse Safety Rules (ความปลอดภัยในคลังสินค้า)', 'Safety', 'ความเข้าใจกฎความปลอดภัย ป้ายเตือน อุปกรณ์ป้องกันส่วนบุคคล (PPE) และแนวทางการป้องกันอุบัติเหตุ'),
('RF Barcode Scanner (เครื่องสแกนบาร์โค้ด RF)', 'RF Scanner', 'ทักษะการใช้งานอุปกรณ์ RF Scanner ในการรับ เข้า จัดเก็บ หยิบ และโอนย้ายสินค้าในระบบ WMS'),
('High-Efficiency Picking (การหยิบสินค้าที่มีประสิทธิภาพ)', 'Picking', 'เทคนิคการหยิบสินค้าตามใบสั่งซื้ออย่างถูกต้อง รวดเร็ว และลดความเสียหายในกระบวนการหยิบ'),
('Standard Packing & Labeling (การแพ็กและติดฉลากมาตรฐาน)', 'Packing', 'ทักษะการแพ็กสินค้าลงกล่อง การเลือกบรรจุภัณฑ์ การชั่งน้ำหนัก และการติดฉลากจัดส่งที่ถูกต้อง'),
('5S Methodology (ระบบ 5ส ในการทำงาน)', '5S', 'การปฏิบัติตามมาตรฐาน 5ส (สะสาง สะดวก สะอาด สุขลักษณะ สร้างนิสัย) เพื่อเพิ่มประสิทธิภาพและความปลอดภัย'),
('Cycle Counting & Inventory Audit (การนับรอบสินค้าและตรวจสอบ)', 'Inventory', 'ทักษะการตรวจนับสต็อกแบบนับรอบ (Cycle Count) การบันทึกสินค้าคงคลัง และการตรวจสอบความถูกต้อง'),
('Receiving & Put Away (การรับสินค้าและการจัดเก็บ)', 'Receiving', 'กระบวนการตรวจสอบใบส่งสินค้า การรับสินค้าเข้าคลัง และการใช้คำสั่งจัดเก็บตามพิกัดชั้นวาง (Put Away)'),
('Barcode & QR Code Printing (การพิมพ์และจัดการบาร์โค้ด)', 'Barcode', 'ทักษะการจัดการเครื่องพิมพ์ฉลาก (Label Printer) การพิมพ์ฉลากบาร์โค้ดสินค้า และการแก้ไขปัญหาเบื้องต้น'),
('Quality Check & Defect Handling (การตรวจสอบคุณภาพและการจัดการของเสีย)', 'Quality', 'กระบวนการตรวจสอบคุณภาพสินค้าที่รับเข้าและส่งออก การแยกสินค้าชำรุด และการบันทึกรายงานของเสีย');

-- Insert Employee Skills (Skill Matrix)
INSERT INTO employee_skills (employee_id, skill_id, level, status, certification_name, certification_url, expiration_date, approved_by, approved_at) VALUES
-- EMP006 (Forklift Driver)
(6, 1, 4, 'expert', 'Forklift License Class A', 'https://example.com/certs/forklift_emp6.pdf', '2027-12-31', 4, '2024-02-15 10:00:00'),
(6, 2, 3, 'qualified', 'Warehouse Safety Certificate', 'https://example.com/certs/safety_emp6.pdf', '2027-01-10', 4, '2024-01-20 11:30:00'),
(6, 3, 3, 'qualified', NULL, NULL, NULL, 4, '2024-03-01 09:15:00'),
(6, 6, 2, 'training', NULL, NULL, NULL, NULL, NULL),
-- EMP007 (Packer)
(7, 2, 4, 'expert', 'Advanced Safety Leader', 'https://example.com/certs/safety_emp7.pdf', '2026-06-01', 4, '2024-05-10 14:00:00'),
(7, 5, 4, 'expert', 'Packing Excellence Certificate', NULL, NULL, 4, '2024-04-12 15:45:00'),
(7, 6, 3, 'qualified', NULL, NULL, NULL, 4, '2024-02-10 10:20:00'),
-- EMP008 (Picker)
(8, 2, 2, 'training', NULL, NULL, NULL, NULL, NULL),
(8, 4, 3, 'qualified', 'Picking Efficiency Pro', NULL, NULL, 5, '2024-03-18 16:00:00'),
(8, 3, 2, 'training', NULL, NULL, NULL, NULL, NULL),
-- EMP009 (Receiving Clerk)
(9, 8, 3, 'qualified', 'Receiving Clerk Standard Certificate', NULL, NULL, 5, '2024-02-28 13:00:00'),
(9, 2, 3, 'qualified', 'Safety Standards Course', NULL, '2026-10-12', 5, '2023-11-01 10:00:00'),
(9, 3, 3, 'qualified', NULL, NULL, NULL, 5, '2023-11-15 14:30:00'),
-- EMP010 (Inventory Counter)
(10, 7, 4, 'expert', 'Certified Inventory Controller', 'https://example.com/certs/inventory_emp10.pdf', '2027-01-05', 5, '2024-02-01 09:00:00'),
(10, 2, 3, 'qualified', 'Safety Standards', NULL, NULL, 5, '2024-01-15 10:00:00'),
(10, 6, 4, 'expert', '5S Auditor Certificate', NULL, NULL, 5, '2024-03-10 11:00:00');

-- Insert Courses
INSERT INTO courses (name, description, duration_minutes, category, instructor, difficulty, estimated_time, certificate_enabled) VALUES
('Warehouse Safety & Accident Prevention (ความปลอดภัยคลังสินค้า)', 'หลักสูตรพื้นฐานที่พนักงานทุกคนต้องเรียนรู้เกี่ยวกับความปลอดภัย การสวมใส่อุปกรณ์ป้องกันส่วนบุคคล (PPE) ป้ายสัญญาณเตือนภัย และขั้นตอนปฏิบัติเมื่อเกิดเหตุฉุกเฉิน', 120, 'Safety', 'นรินทร์ เก่งการ', 'beginner', '2 ชั่วโมง', TRUE),
('Forklift Operations Masterclass (การขับรถยกสินค้าและมาตรฐานความปลอดภัย)', 'หลักสูตรภาคทฤษฎีและปฏิบัติสำหรับผู้ที่ต้องทำหน้าที่ขับรถยกสินค้า (Forklift) ครอบคลุมการเช็กเครื่องยนต์ การควบคุมทิศทาง การยกชั้นวางสูง และการตอบสนองเมื่อรถยกขัดข้อง', 240, 'Forklift', 'นรินทร์ เก่งการ', 'intermediate', '4 ชั่วโมง', TRUE),
('Smart Warehouse WMS & RF Scanner Operations (การใช้เครื่องสแกน RF และระบบจัดการคลัง)', 'เรียนรู้การทำงานร่วมกับระบบ Warehouse Management System (WMS) และการใช้งานอุปกรณ์เครื่องสแกนเนอร์พกพา (RF Handheld Scanner) เพื่อความแม่นยำในการตรวจนับและเคลื่อนย้าย', 180, 'RF Scanner', 'นรินทร์ เก่งการ', 'intermediate', '3 ชั่วโมง', TRUE),
('High-Performance Picking & Sorting Methods (เทคนิคหยิบสินค้าชั้นเลิศ)', 'สอนแนวปฏิบัติที่เป็นเลิศในการหยิบและคัดแยกสินค้าเพื่อความเร็วและความแม่นยำสูงสุด ลดการขยับตัวเปล่าประโยชน์ การจัดลำดับหยิบ (Routing Strategy) และการอ่านรายละเอียดบาร์โค้ด', 90, 'Picking', 'สมชาย แสนดี', 'beginner', '1.5 ชั่วโมง', TRUE),
('Enterprise 5S Standard (การจัดระบบ 5ส ระดับองค์กร)', 'แนวทางการทำ 5ส เพื่อส่งเสริมความสะอาด ความเป็นระเบียบเรียบร้อย เพิ่มพื้นที่ใช้สอยในคลังสินค้า และสร้างนิสัยความปลอดภัยในการทำงานประจำวัน', 60, '5S', 'วิภาดา รักดี', 'beginner', '1 ชั่วโมง', TRUE);

-- Insert Chapters
INSERT INTO chapters (course_id, title, sort_order) VALUES
-- Course 1 Chapters (Safety)
(1, 'บทนำและกฎความปลอดภัยทั่วไป', 1),
(1, 'อุปกรณ์ป้องกันภัยส่วนบุคคล (PPE)', 2),
(1, 'การทำข้อสอบประเมินความปลอดภัย', 3),
-- Course 2 Chapters (Forklift)
(2, 'โครงสร้างและการควบคุมรถโฟล์คลิฟต์', 1),
(2, 'มาตรฐานความปลอดภัยในการยกของสูง', 2),
(2, 'การประเมินทักษะการขับขี่รถยก', 3),
-- Course 3 Chapters (RF Scanner)
(3, 'การทำความรู้จัก WMS และ RF Scanner', 1),
(3, 'ฟังก์ชันการรับสินค้าและจัดเก็บพิกัด', 2),
(3, 'การทำข้อสอบระบบสแกนบาร์โค้ด', 3);

-- Insert Lessons
INSERT INTO lessons (chapter_id, title, content_type, content_url, body_text, sort_order) VALUES
-- Course 1 Lessons
(1, 'ความปลอดภัยคือหัวใจหลัก', 'video', 'https://www.youtube.com/embed/5F7Jt5pUlyU', 'ยินดีต้อนรับเข้าสู่บทเรียนด้านความปลอดภัย บทเรียนนี้จะแนะนำป้ายเตือนและกฎพื้นฐานในคลังสินค้า', 1),
(1, 'คู่มือมาตรการป้องกับอุบัติเหตุ PDF', 'document', 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', 'โปรดศึกษาเอกสารข้อกำหนดความปลอดภัยตามกฎกระทรวงและคู่มือองค์กร', 2),
(2, 'ประเภทและการใช้งานอุปกรณ์ PPE', 'video', 'https://www.youtube.com/embed/kR66aN42mCc', 'อธิบายการสวมใส่หมวกนิรภัย เสื้อสะท้อนแสง และรองเท้าเซฟตี้', 1),
(2, 'รูปภาพสรุปการแต่งกายที่ถูกต้อง', 'image', 'https://images.unsplash.com/photo-1581094288338-2314dddb7eed?w=600', 'ตัวอย่างพนักงานสวมชุด PPE ถูกต้องครบถ้วนขณะปฏิบัติงานคลังสินค้า', 2),
(3, 'แบบทดสอบวัดระดับความรู้เรื่องความปลอดภัย', 'quiz', NULL, 'กรุณาทำข้อสอบด้านความปลอดภัยให้ผ่านอย่างน้อย 80% (4 ใน 5 ข้อ) เพื่อรับใบรับรองในระบบ', 1),

-- Course 2 Lessons
(4, 'โครงสร้างรถยกและการตรวจสอบก่อนขับ', 'video', 'https://www.youtube.com/embed/fW4o8Uex9aQ', 'วิดีโอสาธิตการเช็กรอบคัน ระดับน้ำมันไฮดรอลิก ล้อ และระบบเบรกของรถโฟล์คลิฟต์', 1),
(5, 'กฎการควบคุมความเร็วและการเข้ามุมอับ', 'document', 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', 'ข้อกำหนดความเร็วไม่เกิน 10 กม./ชม. ในคลังสินค้า และการบีบแตรเตือนที่ทางแยก', 1),
(6, 'แบบทดสอบการขับและยกของสูง', 'quiz', NULL, 'ตอบคำถามจำลองสถานการณ์ความปลอดภัยในการขับขี่', 1),

-- Course 3 Lessons
(7, 'แนะนำตัวเครื่องและปุ่มควบคุมหลัก', 'video', 'https://www.youtube.com/embed/yVwL1tXgC_s', 'วิดีโอสาธิตวิธีการเปิดเครื่อง เชื่อมต่อ Wi-Fi และหน้าจอเมนูหลักของ WMS App', 1),
(8, 'เทคนิคการสแกนบาร์โค้ดที่รวดเร็ว', 'document', 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', 'วิธีรักษาระยะห่าง 15-30 ซม. ในการยิงเลเซอร์ และการจัดการฉลากสินค้าที่ชำรุดเสียหาย', 1),
(9, 'แบบทดสอบวัดทักษะการใช้ RF Scanner', 'quiz', NULL, 'ประเมินความรู้การบันทึกสถานะรับเข้าและจัดเก็บ', 1);

-- Insert Questions for Course 1 Quiz (Lesson ID 5)
INSERT INTO questions (lesson_id, question_type, question_text, media_url, options, correct_answers, points) VALUES
(5, 'multiple_choice', 'เมื่อเห็นสัญลักษณ์ป้ายเตือนพื้นสีเหลืองขอบดำ หมายถึงสัญลักษณ์ประเภทใด?', NULL, '["เตือนให้ระวัง (Warning)", "ห้ามปฏิบัติ (Prohibition)", "ป้ายแนะนำความปลอดภัย (Information)", "บังคับให้ต้องปฏิบัติ (Mandatory)"]'::jsonb, '[0]'::jsonb, 1),
(5, 'true_false', 'รองเท้าผ้าใบธรรมดาสามารถสวมปฏิบัติงานในเขตคลังเก็บของหนักได้ หากระมัดระวังเป็นพิเศษ', NULL, '["ถูกต้อง", "ไม่ถูกต้อง (ต้องใช้รองเท้าหัวเหล็กนิรภัยเท่านั้น)"]'::jsonb, '[1]'::jsonb, 1),
(5, 'checkbox', 'อุปกรณ์ชิ้นใดจัดอยู่ในประเภทเครื่องป้องกันหน้าและดวงตา? (เลือกได้มากกว่า 1 ข้อ)', NULL, '["แว่นตานิรภัย (Safety Glasses)", "กระบังหน้ากันสะเก็ด (Face Shield)", "หมวกนิรภัย (Hard Hat)", "ที่อุดหู (Earplugs)"]'::jsonb, '[0, 1]'::jsonb, 1),
(5, 'multiple_choice', 'หากเกิดเหตุเพลิงไหม้เบื้องต้น สิ่งแรกที่พนักงานควรทำคืออะไร?', NULL, '["ดึงอุปกรณ์สัญญาณแจ้งเหตุเพลิงไหม้ (Fire Alarm) หรือตะโกนเตือนภัย", "วิ่งหนีออกจากคลังสินค้าไปที่ลานจอดรถทันที", "โทรหาครอบครัวแจ้งสถานการณ์", "พยายามขนสินค้าออกจากโกดัง"]'::jsonb, '[0]'::jsonb, 1),
(5, 'picture', 'จากภาพสัญลักษณ์ถังดับเพลิงสีแดงนี้ เหมาะสำหรับดับเพลิงประเภทใดเป็นหลัก?', 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=300', '["Class A (ไม้, กระดาษ, พลาสติก)", "Class D (โลหะติดไฟ)", "Class K (น้ำมันทำอาหาร)", "ประเภทแก๊สติดไฟเท่านั้น"]'::jsonb, '[0]'::jsonb, 1);

-- Insert Questions for Course 2 Quiz (Lesson ID 8)
INSERT INTO questions (lesson_id, question_type, question_text, media_url, options, correct_answers, points) VALUES
(8, 'multiple_choice', 'การกำหนดความเร็วสูงสุดสำหรับรถโฟล์คลิฟต์ภายในพื้นที่คลังสินค้าคือเท่าใด?', NULL, '["10 กม./ชม.", "20 กม./ชม.", "5 กม./ชม.", "ไม่มีกำหนด"]'::jsonb, '[0]'::jsonb, 1),
(8, 'true_false', 'หากน้ำหนักสินค้าเกินพิกัดเล็กน้อย สามารถนำเหล็กถ่วงน้ำหนักมาติดตั้งท้ายรถโฟล์คลิฟต์เพิ่มเติมได้', NULL, '["จริง", "เท็จ (ห้ามดัดแปลงรถยกและต้องห้ามยกเกินน้ำหนักที่กำหนดเด็ดขาด)"]'::jsonb, '[1]'::jsonb, 1);

-- Insert Questions for Course 3 Quiz (Lesson ID 11)
INSERT INTO questions (lesson_id, question_type, question_text, media_url, options, correct_answers, points) VALUES
(11, 'multiple_choice', 'หากเครื่องยิงบาร์โค้ดแสดงความผิดพลาด "Put Away Location Mismatch" หมายความว่าอย่างไร?', NULL, '["ชั้นวางปลายทางไม่ตรงกับที่ระบบแนะนำ", "สัญญาณเชื่อมต่ออินเทอร์เน็ตขาดหาย", "บาร์โค้ดสินค้าสกปรกเกินไป", "ยังไม่ได้ทำการสแกนรับเข้าคลัง"]'::jsonb, '[0]'::jsonb, 1),
(11, 'true_false', 'ผู้ใช้งานสามารถพิมพ์พิกัดชั้นวางลงไปแทนการเดินไปยิงบาร์โค้ดที่หน้าชั้นวางได้ตลอดเวลา', NULL, '["ถูกต้อง", "ไม่ถูกต้อง (ต้องเดินไปสแกนที่ชั้นวางจริงเพื่อป้องกันข้อผิดพลาดทางสต็อก)"]'::jsonb, '[1]'::jsonb, 1);

-- Insert Enrollments (Assigned courses & progress)
INSERT INTO enrollments (employee_id, course_id, progress_percentage, status, assigned_by, due_date, completed_at, certificate_id) VALUES
(6, 1, 100, 'completed', 4, '2024-02-01', '2024-01-20 11:30:00', 'CERT-SAF-00612'),
(6, 3, 50, 'in_progress', 4, '2026-08-31', NULL, NULL),
(7, 1, 100, 'completed', 4, '2024-02-01', '2024-01-18 15:45:00', 'CERT-SAF-00713'),
(7, 5, 100, 'completed', 4, '2024-03-15', '2024-02-28 10:00:00', 'CERT-5SS-00744'),
(8, 1, 0, 'pending', 5, '2026-07-15', NULL, NULL),
(8, 4, 100, 'completed', 5, '2024-03-31', '2024-03-18 16:00:00', 'CERT-PIC-00811'),
(9, 1, 100, 'completed', 5, '2023-11-30', '2023-11-01 10:00:00', 'CERT-SAF-00911'),
(10, 1, 100, 'completed', 5, '2024-02-15', '2024-01-15 10:00:00', 'CERT-SAF-01021');

-- Insert Lesson Progress
INSERT INTO lesson_progress (employee_id, lesson_id, completed, completed_at) VALUES
-- EMP006 Course 1 progress
(6, 1, TRUE, '2024-01-19 09:00:00'),
(6, 2, TRUE, '2024-01-19 10:30:00'),
(6, 3, TRUE, '2024-01-20 08:30:00'),
(6, 4, TRUE, '2024-01-20 09:45:00'),
(6, 5, TRUE, '2024-01-20 11:30:00'),
-- EMP006 Course 3 progress
(6, 9, TRUE, '2026-06-25 14:00:00'),
-- EMP007 Course 1 progress
(7, 1, TRUE, '2024-01-18 13:00:00'),
(7, 2, TRUE, '2024-01-18 14:00:00'),
(7, 3, TRUE, '2024-01-18 14:30:00'),
(7, 4, TRUE, '2024-01-18 15:00:00'),
(7, 5, TRUE, '2024-01-18 15:45:00');

-- Insert Quiz Attempts
INSERT INTO quiz_attempts (employee_id, lesson_id, score, passed, completed_at) VALUES
(6, 5, 5, TRUE, '2024-01-20 11:30:00'),
(7, 5, 4, TRUE, '2024-01-18 15:45:00');

-- Insert Daily Tasks (Warehouse Operations Tasks)
INSERT INTO daily_tasks (employee_id, task_name, category, description, status, progress_percentage, supervisor_approved, approved_by, approved_at, due_date) VALUES
(6, 'ขับย้ายพาเลทพัสดุโซนสินค้าขาเข้า', 'Put Away', 'ทำการเคลื่อนย้ายพาเลทน้ำเข้าจานตู้คอนเทนเนอร์ 15 พาเลท ไปจัดวางที่ชั้น A4 ถึง A12', 'completed', 100, TRUE, 4, '2026-06-29 12:00:00', '2026-06-29'),
(6, 'ตรวจสอบสภาพรถยกไฟฟ้า Forklift #04', 'Forklift', 'ทำเช็กลิสต์ความปลอดภัยก่อนทำงาน เช็กความจุแบตเตอรี่ และเติมน้ำกลั่น', 'completed', 100, TRUE, 4, '2026-06-29 08:30:00', '2026-06-29'),
(7, 'แพ็กกล่องสินค้าออเดอร์ด่วนแคมเปญ 7.7', 'Packing', 'เร่งห่อหุ้มวัสดุกันกระแทกและบรรจุกล่องสินค้าอิเล็กทรอนิกส์ 120 ออเดอร์ส่งทาง Flash Express', 'in_progress', 65, FALSE, NULL, NULL, '2026-06-29'),
(8, 'หยิบสินค้าอุปโภคบริโภคตามใบสั่งซื้อ Zone B', 'Picking', 'หยิบของตามระบบสแกน RF นำส่งจุดคัดแยกแพ็คกิ้งจำนวน 80 รายการ', 'in_progress', 40, FALSE, NULL, NULL, '2026-06-29'),
(9, 'ตรวจนับสินค้าแกะกล่องใหม่ ตู้คอนเทนเนอร์ IN-B09', 'Receiving', 'นับจำนวนกล่องนำเข้า ตรวจเช็คเอกสาร Packing List และสินค้าชำรุดเสียหาย', 'completed', 100, TRUE, 5, '2026-06-28 16:30:00', '2026-06-28'),
(10, 'นับรอบสินค้ากลุ่มอาหารแห้งแถว B12-B15', 'Cycle Count', 'ทำ Cycle count บันทึกข้อมูลคลาดเคลื่อนลงแบบฟอร์มเพื่อส่งตรวจสอบยอดเสร็จสิ้นภายในสิ้นวัน', 'completed', 100, TRUE, 5, '2026-06-29 11:30:00', '2026-06-29'),
(10, 'จัดเตรียมเอกสารนับสต็อกรอบครึ่งปี', 'Cycle Count', 'เตรียมพิมพ์รายงานจำนวนสินค้าคงเหลือแยกตามโซนสินค้าเพื่อแจกแจงพนักงานนับพรุ่งนี้', 'pending', 0, FALSE, NULL, NULL, '2026-06-30');

-- Insert Working Hours (Attendance logs)
INSERT INTO working_hours (employee_id, clock_in, clock_out, break_start, break_end, ot_hours, status, date) VALUES
-- EMP006 Forklift Driver (Today)
(6, '2026-06-29 07:55:00', NULL, '2026-06-29 12:00:00', '2026-06-29 13:00:00', 0.00, 'present', '2026-06-29'),
-- EMP007 Packer (Today)
(7, '2026-06-29 08:05:00', NULL, NULL, NULL, 0.00, 'late', '2026-06-29'),
-- EMP008 Picker (Today)
(8, '2026-06-29 07:50:00', NULL, NULL, NULL, 0.00, 'present', '2026-06-29'),
-- EMP009 Receiving Clerk (Yesterday - Complete Day)
(9, '2026-06-28 07:48:00', '2026-06-28 17:15:00', '2026-06-28 12:00:00', '2026-06-28 13:00:00', 1.00, 'present', '2026-06-28'),
-- EMP010 Inventory Counter (Today)
(10, '2026-06-29 07:52:00', NULL, NULL, NULL, 0.00, 'present', '2026-06-29');

-- Insert Announcements
INSERT INTO announcements (title, content, created_by, category) VALUES
('ประกาศมาตรการสวมใส่อุปกรณ์คุ้มครองความปลอดภัย (PPE)', 'ขอความร่วมมือพนักงานฝ่ายปฏิบัติการในคลังสินค้าทุกคน สวมใส่หมวกนิรภัย (Hard Hat) เสื้อกั๊กสะท้อนแสง และรองเท้าเซฟตี้ตลอดเวลาที่อยู่ในพื้นที่ทำงานอย่างเคร่งครัด หากพบเห็นการฝ่าฝืนมีโทษเตือนทางวินัย', 1, 'Safety'),
('เปิดตัวหลักสูตรฝึกอบรมระบบจัดการคลัง WMS & RF Scanner ใหม่', 'ฝ่ายฝึกอบรมได้เปิดคอร์สแนะนำทักษะใหม่สำหรับการทำสต็อกสินค้าด้วยแท็บเล็ตและตัวยิงบาร์โค้ดเวอร์ชันล่าสุด พนักงานสามารถเข้าเรียนเพื่อพัฒนาทักษะระดับ RF Scanner และรับการรับรองในสัปดาห์นี้', 3, 'Training'),
('กิจกรรมนับสต็อกสินค้าประจำปีและปิดรอบบัญชี', 'แจ้งกำหนดการปิดคลังสินค้าชั่วคราวเพื่อตรวจนับสินค้าครั้งใหญ่ในวันที่ 30 มิถุนายน และ 1 กรกฎาคมนี้ โดยให้พนักงานเตรียมศึกษาแผนที่ Zone และทีมที่ได้รับมอบหมาย', 1, 'General');

-- Insert Audit Logs
INSERT INTO audit_logs (user_id, action, details, ip_address) VALUES
(1, 'LOGIN', 'ผู้ดูแลระบบสมชาย ล็อกอินเข้าสู่ระบบ', '192.168.1.100'),
(4, 'APPROVE_SKILL', 'อนุมัติทักษะการขับรถยก Forklift เลเวล 4 ของ สมปอง ลุยงาน (EMP006)', '192.168.1.55'),
(2, 'CREATE_USER', 'HR วิภาดา ลงทะเบียนพนักงานใหม่ จารุณี นับสต็อก (EMP010)', '192.168.1.10'),
(6, 'CLOCK_IN', 'สมปอง ลุยงาน ลงชื่อเข้างานประจำวัน', '192.168.2.10');

-- Insert Notifications
INSERT INTO notifications (user_id, title, message, type, read_status) VALUES
(6, 'มอบหมายการเรียนรู้ใหม่', 'หัวหน้าประพันธ์ ได้มอบหมายคอร์ส "Smart Warehouse WMS & RF Scanner Operations" ให้คุณเรียน กรุณาเรียนให้เสร็จภายใน 31 ส.ค.', 'in_app', FALSE),
(8, 'แจ้งเตือนบทเรียนค้างส่ง', 'หลักสูตร "Warehouse Safety" ที่คุณได้รับมอบหมายจะหมดเขตการเรียนรู้วันที่ 15 ก.ค. โปรดเข้าศึกษา', 'in_app', FALSE),
(6, 'ยินดีด้วย! คุณได้รับการอนุมัติทักษะใหม่', 'ทักษะขับรถโฟล์คลิฟต์เลเวล 4 ได้รับการอนุมัติและรับรองความรู้แล้วโดยหัวหน้าประพันธ์', 'in_app', TRUE);
