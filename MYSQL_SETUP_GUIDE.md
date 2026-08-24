# คู่มือการติดตั้งและรันฐานข้อมูล MySQL
## Warehouse Training & Skill Management System - MySQL Setup Guide

เอกสารฉบับนี้จัดทำขึ้นเพื่อแนะนำขั้นตอนการนำฐานข้อมูล **MySQL 8.0+ / MariaDB 10.6+** ไปติดตั้งและเปิดใช้งานร่วมกับระบบ โดยสามารถเลือกทำตามวิธีที่สะดวกได้ 3 รูปแบบ:

---

## 📑 สารบัญ
1. [โครงสร้างไฟล์ฐานข้อมูลในโปรเจกต์](#1-โครงสร้างไฟล์ฐานข้อมูลในโปรเจกต์)
2. [วิธีที่ 1: รัน MySQL ผ่าน Docker Compose (แนะนำ ⭐ ง่ายและเร็วที่สุด)](#วิธีที่-1-รัน-mysql-ผ่าน-docker-compose-แนะนำ--ง่ายและเร็วที่สุด)
3. [วิธีที่ 2: รัน MySQL ผ่าน XAMPP (สำหรับ Windows)](#วิธีที่-2-รัน-mysql-ผ่าน-xampp-สำหรับ-windows)
4. [วิธีที่ 3: นำเข้าผ่าน MySQL Workbench / Command Line](#วิธีที่-3-นำเข้าผ่าน-mysql-workbench--command-line)
5. [การตั้งค่า Backend เชื่อมต่อกับ MySQL](#5-การตั้งค่า-backend-เชื่อมต่อกับ-mysql)
6. [การตรวจสอบสถานะการเชื่อมต่อฐานข้อมูล](#6-การตรวจสอบสถานะการเชื่อมต่อฐานข้อมูล)

---

## 1. โครงสร้างไฟล์ฐานข้อมูลในโปรเจกต์

* 📄 **`database/schema_mysql.sql`** : ไฟล์สคริปต์ SQL หลัก ประกอบด้วย:
  * การสร้าง **20 ตาราง** ครบถ้วนตามมาตรฐานระบบ
  * รองรับภาษาไทย 100% ด้วย Character Set `utf8mb4` และ Collation `utf8mb4_unicode_ci`
  * ข้อมูลตั้งต้น (Initial Seed Data): พนักงาน, คอร์สเรียน, ทักษะ 8 มิติ, ข้อสอบ และผังคลังสินค้า
* 📄 **`backend/src/config/db.ts`** : ตัวจัดการ Connection Pool เชื่อมต่อไปยัง MySQL
* 📄 **`backend/src/config/mysqlInit.ts`** : ระบบ Auto-Migration อัปเดตโครงสร้างตารางให้อัตโนมัติ

---

## วิธีที่ 1: รัน MySQL ผ่าน Docker Compose (แนะนำ ⭐ ง่ายและเร็วที่สุด)

หากเครื่องของคุณหรือเซิร์ฟเวอร์ไอทีมี **Docker Desktop** ติดตั้งอยู่แล้ว สามารถรันระบบพร้อม MySQL ได้ในคำสั่งเดียว:

### ขั้นตอนการรัน:
1. เปิด Terminal / PowerShell ที่โฟลเดอร์หลักของโปรเจกต์
2. สั่งรันคำสั่ง:
```bash
docker compose up -d
```
3. ระบบจะทำการดาวน์โหลดและรัน:
   * **MySQL Database**: รันที่พอร์ต `3306`
   * **phpMyAdmin (หน้าเว็บจัดการฐานข้อมูล)**: เปิดดูได้ที่ 👉 `http://localhost:8080`
   * **Backend API**: รันที่พอร์ต `5000`
   * **Frontend Web UI**: รันที่พอร์ต `3000`

> 💡 **การเข้าจัดการ Database ผ่าน phpMyAdmin:**
> * URL: `http://localhost:8080`
> * Server: `mysql`
> * Username: `root`
> * Password: `swan_root_password_2026`

---

## วิธีที่ 2: รัน MySQL ผ่าน XAMPP (สำหรับ Windows)

หากคุณใช้โปรแกรม **XAMPP** บนเครื่อง Windows:

### ขั้นตอน:
1. เปิดโปรแกรม **XAMPP Control Panel** แล้วกดปุ่ม **Start** ที่โมดูล **Apache** และ **MySQL**
2. เปิดเบราว์เซอร์เข้าไปที่: `http://localhost/phpmyadmin`
3. กดที่เมนู **"New" (สร้างฐานข้อมูลใหม่)** ทางแถบซ้ายมือ
4. ตั้งชื่อฐานข้อมูลว่า: `warehouse_db`
5. เลือก Collation เป็น: `utf8mb4_unicode_ci` แล้วกด **Create**
6. คลิกเลือกฐานข้อมูล `warehouse_db` ที่เพิ่งสร้าง แล้วไปที่แท็บ **"Import" (นำเข้า)** ด้านบน
7. กดปุ่ม **"Choose File"** แล้วเลือกไฟล์:
   ```text
   database/schema_mysql.sql
   ```
8. เลื่อนลงมากดปุ่ม **"Import"** หรือ **"Go"** ด้านล่าง
9. ระบบจะสร้างทั้ง 20 ตารางพร้อมใส่ข้อมูลเริ่มต้นให้อย่างสมบูรณ์

---

## วิธีที่ 3: นำเข้าผ่าน MySQL Workbench / Command Line

### 3.1 ผ่าน MySQL Workbench:
1. เปิดโปรแกรม **MySQL Workbench** และเชื่อมต่อเข้า Server
2. ไปที่เมนู **File** -> **Open SQL Script...**
3. เลือกไฟล์ `database/schema_mysql.sql`
4. กดไอคอน ⚡ **Execute (Ctrl + Shift + Enter)** เพื่อรันสคริปต์สร้างตารางทั้งหมด

### 3.2 ผ่าน Command Line (CMD / Terminal):
```bash
# 1. เข้าสู่ MySQL เพื่อสร้างฐานข้อมูล
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS warehouse_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# 2. นำเข้าไฟล์ schema_mysql.sql
mysql -u root -p warehouse_db < database/schema_mysql.sql
```

---

## 5. การตั้งค่า Backend เชื่อมต่อกับ MySQL

เมื่อเตรียม MySQL เรียบร้อยแล้ว ให้ตั้งค่าในไฟล์ `backend/.env` (หากยังไม่มีให้คัดลอกจาก `backend/.env.example`):

### ตัวอย่างไฟล์ `backend/.env`:
```env
PORT=5000
NODE_ENV=production

# รูปแบบ Connection String: mysql://<username>:<password>@<host>:<port>/<database_name>
DATABASE_URL=mysql://root:password123@localhost:3306/warehouse_db

# ตั้งเป็น false เพื่อให้ระบบต่อฐานข้อมูล MySQL จริง
USE_MOCK_DB=false

# คีย์ความปลอดภัยสำหรับเข้ารหัส Token (กำหนดข้อความยาวๆ ที่ปลอดภัย)
JWT_SECRET=super_secret_warehouse_key_2026_prod_secure_token
```

---

## 6. การตรวจสอบสถานะการเชื่อมต่อฐานข้อมูล

เมื่อรัน Backend Server แล้ว สามารถตรวจสอบได้ทันทีว่าเชื่อมต่อกับ MySQL สำเร็จหรือไม่:

1. เปิดเบราว์เซอร์ไปที่: 👉 `http://localhost:5000/api/status`
2. ระบบจะตอบกลับเป็น JSON แสดงสถานะ:
```json
{
  "status": "online",
  "database": "MySQL (Connected)",
  "isMock": false,
  "system": "Warehouse Training & Skill Management System",
  "timestamp": "2026-08-24T03:30:00.000Z"
}
```
* หากขึ้น `"database": "MySQL (Connected)"` และ `"isMock": false` แปลว่า **ระบบเชื่อมต่อกับฐานข้อมูล MySQL ของคุณได้อย่างสมบูรณ์ 100% แล้วครับ** 🎉
