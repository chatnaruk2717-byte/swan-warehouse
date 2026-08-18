# เอกสารคู่มือการติดตั้งและส่งมอบระบบขึ้น Cloud สำหรับฝ่าย IT
# Warehouse Training & Skill Management System - Cloud Deployment & IT Handover Guide

เอกสารฉบับนี้จัดทำขึ้นสำหรับ **ฝ่ายเทคโนโลยีสารสนเทศ (IT / DevOps / SysAdmin / Cloud Engineer)** เพื่อใช้ในการนำระบบบริหารจัดการการฝึกอบรมและทักษะของพนักงานคลังสินค้า ขึ้นสู่ระบบ **Cloud / Server** ขององค์กร

---

## 1. ภาพรวมสถาปัตยกรรมระบบ (System Architecture)

ระบบถูกออกแบบด้วยสถาปัตยกรรม **3-Tier Architecture** ที่มีความยืดหยุ่น รองรับทั้งการ Deploy แบบ Container (Docker) และ Cloud Native Managed Services:

```text
[ End Users (Web Browser / Mobile) ]
                 │
                 ▼ (HTTPS / Port 443 -> 3000/80)
┌────────────────────────────────────────────────────────┐
│  1. Frontend Tier (Web UI)                             │
│  - Framework: Next.js 14 (React 18), TailwindCSS       │
│  - Runtime: Nginx Alpine Container (Static Export)     │
│  - Options: Cloudflare Pages / AWS S3+CloudFront / VM  │
└────────────────────────┬───────────────────────────────┘
                         │ REST API Calls (Port 5000)
                         ▼
┌────────────────────────────────────────────────────────┐
│  2. Backend Tier (Application Server & File Storage)   │
│  - Runtime: Node.js 18+ / Express.js / TypeScript      │
│  - Storage API: /api/upload (รูปภาพ, วิดีโอ, PDF, etc.)│
│  - Storage Path: /uploads (Company Local/Cloud Volume) │
│  - Auth: JWT (JSON Web Token) + Role-based Access      │
│  - Health Check: /api/status                           │
│  - API Docs: /api-docs (Swagger UI)                    │
└────────────────────────┬───────────────────────────────┘
                         │ MySQL Protocol (Port 3306)
                         ▼
┌────────────────────────────────────────────────────────┐
│  3. Database Tier (Relational Storage)                 │
│  - Engine: MySQL 8.0+ / MariaDB 10.6+                  │
│  - Compatible: AWS RDS / Google Cloud SQL / Azure DB   │
│  - Character Set: utf8mb4 (รองรับภาษาไทย 100%)         │
└────────────────────────────────────────────────────────┘
```

> **🛡️ มาตรการความปลอดภัยด้านข้อมูล (Data Sovereignty & Privacy):**
> ระบบจัดการไฟล์ สื่อการสอน วิดีโอ รูปภาพพนักงาน และเอกสาร PDF ทั้งหมดจะถูกอัปโหลดและจัดเก็บอยู่บน **Server / Cloud Storage ภายในบริษัทเท่านั้น** ผ่าน Endpoint `/api/upload` (ไม่มีการส่งรูปหรือข้อมูลไปยังเว็บภายนอก เช่น ImgBB หรือ 3rd-party CDN)

---

## 2. ความต้องการขั้นต่ำของระบบ (System Requirements)

- **Compute/VM**: 2 vCPU, 2-4 GB RAM, 20 GB Disk
- **OS**: Ubuntu 22.04/24.04 LTS, Debian 11/12, Amazon Linux 2023, RedHat/CentOS หรือ Windows Server
- **Runtime (กรณีรันด้วย Docker)**: Docker Engine 20.10+ และ Docker Compose v2.0+
- **Runtime (กรณีรันตรงบนโฮสต์)**: Node.js 18.x หรือ 20.x LTS, MySQL 8.0+, Nginx

---

## 3. พอร์ตและการตั้งค่าเน็ตเวิร์ก (Network & Firewall Ports)

| Service | Container Port | Host Default Port | Protocol | Public Accessible | คำอธิบาย |
| :--- | :---: | :---: | :---: | :---: | :--- |
| **Frontend UI** | `80` | `3000` | HTTP/HTTPS | **Yes** (ผ่าน Nginx/Reverse Proxy) | หน้าเว็บหลักของระบบ |
| **Backend API** | `5000` | `5000` | HTTP/HTTPS | **Yes** (หรือผ่าน API Gateway) | REST API endpoints |
| **MySQL DB** | `3306` | `3306` | TCP | **Internal Only** (ห้ามเปิด Public) | ฐานข้อมูล |
| **phpMyAdmin** *(Optional)* | `80` | `8080` | HTTP | **VPN / Internal Only** | จัดการฐานข้อมูลผ่าน GUI |

---

## 4. ตัวแปรสภาพแวดล้อม (Environment Variables)

### Backend (`backend/.env` หรือ Container Environment)
| Variable | Required | Default / Example | คำอธิบาย |
| :--- | :---: | :--- | :--- |
| `PORT` | Optional | `5000` | พอร์ตที่ Backend ให้บริการ |
| `DATABASE_URL` | **Yes** | `mysql://root:password@host:3306/warehouse_db` | Connection String สำหรับเชื่อมต่อ MySQL |
| `JWT_SECRET` | **Yes** | `a-very-strong-secret-key-64-chars` | คีย์สำหรับถอด/สร้าง JWT Token (ต้องเปลี่ยนบน Production) |
| `USE_MOCK_DB` | Optional | `false` | ตั้งเป็น `false` เพื่อต่อ Database จริง |
| `NODE_ENV` | Optional | `production` | โหมดการทำงานของ Node.js |

### Frontend (`frontend/.env` หรือ Build Arg)
| Variable | Required | Default / Example | คำอธิบาย |
| :--- | :---: | :--- | :--- |
| `NEXT_PUBLIC_API_URL` | **Yes** | `https://api.yourcompany.com` | URL ของ Backend API ที่เบราว์เซอร์ของผู้ใช้สามารถเรียกถึงได้ |

---

## 5. รูปแบบการติดตั้งขึ้น Cloud (Deployment Options)

ฝ่าย IT สามารถเลือกรูปแบบการ Deploy ได้ตามโครงสร้างพื้นฐานของบริษัท 4 รูปแบบ ดังนี้:

---

### รูปแบบที่ 1: ติดตั้งผ่าน Docker Compose (แนะนำ สะดวกและเร็วที่สุด)
เหมาะสำหรับ Cloud VM เช่น AWS EC2, Google Compute Engine, Azure VM, DigitalOcean หรือ On-Premise Server

```bash
# 1. แตกไฟล์โครงการหรือโคลน Git เข้ามาที่ Server
cd /opt/warehouse-system

# 2. คัดลอกและตั้งค่า Environment
cp .env.example .env
nano .env  # แก้ไขรหัสผ่าน DB และ JWT_SECRET ตามต้องการ

# 3. รันระบบทั้งหมดด้วยคำสั่งเดียว
docker compose up -d --build

# 4. ตรวจสอบสถานะการทำงานของ Container
docker compose ps

# 5. ตรวจสอบ Log
docker compose logs -f backend
```

- เข้าใช้งาน Frontend ที่: `http://<SERVER_IP>:3000`
- ตรวจสอบสถานะ Backend ที่: `http://<SERVER_IP>:5000/api/status`
- เข้าจัดการ Database ผ่าน phpMyAdmin ที่: `http://<SERVER_IP>:8080`

---

### รูปแบบที่ 2: Cloud Managed Containers (AWS ECS / Cloud Run / Azure Container Apps)
- **Backend API**: Build จาก `backend/Dockerfile` ส่งขึ้น AWS ECR / Google Artifact Registry / Azure ACR
  - กำหนด Environment Variables: `DATABASE_URL`, `JWT_SECRET`, `NODE_ENV=production`
- **Frontend UI**: Build จาก `frontend/Dockerfile` พร้อมส่ง build-arg `NEXT_PUBLIC_API_URL`
- **Database**: ใช้ AWS RDS for MySQL / Google Cloud SQL for MySQL / Azure Database for MySQL

---

### รูปแบบที่ 3: แยกส่วน Frontend ขึ้น Static Hosting (Cloudflare Pages / AWS S3 + CloudFront / Vercel)
เนื่องจาก Frontend สร้างแบบ Static Export (`output: 'export'`) จึงสามารถนำไปโฮสต์บน CDN ได้ทันทีด้วยค่าใช้จ่ายที่ต่ำมากและประสิทธิภาพสูงสุด:

```bash
cd frontend
# ตั้งค่า API URL สำหรับ Production
export NEXT_PUBLIC_API_URL="https://api.yourcompany.com"
npm install
npm run build
# โฟลเดอร์ 'out' จะถูกสร้างขึ้น -> อัปโหลดโฟลเดอร์ 'out' ไปยัง Cloudflare Pages / AWS S3 Bucket
```

---

### รูปแบบที่ 4: ติดตั้งตรงบน Linux Server (Ubuntu 22.04/24.04 LTS + PM2 + Nginx)

#### 1. ติดตั้ง Node.js, PM2, MySQL และ Nginx
```bash
sudo apt update && sudo apt install -y curl git nginx mysql-server
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
sudo npm install -g pm2
```

#### 2. เตรียมฐานข้อมูล MySQL
```sql
sudo mysql -u root
CREATE DATABASE warehouse_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'warehouse_user'@'localhost' IDENTIFIED BY 'StrongPassword123!';
GRANT ALL PRIVILEGES ON warehouse_db.* TO 'warehouse_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;

-- นำเข้า Schema และข้อมูลเริ่มต้น
mysql -u warehouse_user -p warehouse_db < /path/to/database/schema_mysql.sql
```

#### 3. ติดตั้งและรัน Backend API ด้วย PM2
```bash
cd /opt/warehouse-system/backend
npm install
npm run build
pm2 start dist/index.js --name "warehouse-backend"
pm2 save
pm2 startup
```

#### 4. ตั้งค่า Nginx Reverse Proxy & Static Frontend
```nginx
# /etc/nginx/sites-available/warehouse
server {
    listen 80;
    server_name app.yourcompany.com;

    # Frontend Static Files
    location / {
        root /opt/warehouse-system/frontend/out;
        index index.html index.htm;
        try_files $uri $uri.html $uri/ /index.html =404;
    }

    # Proxy to Backend API
    location /api/ {
        proxy_pass http://127.0.0.1:5000/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/warehouse /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# ติดตั้งฟรี SSL Certificate ด้วย Certbot (HTTPS)
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d app.yourcompany.com
```

---

## 6. การสำรองและกู้คืนฐานข้อมูล (Database Backup & Restore)

### สำรองข้อมูล (Backup)
```bash
mysqldump -u root -p --default-character-set=utf8mb4 warehouse_db > warehouse_backup_$(date +\%Y\%m\%d).sql
```

### กู้คืนข้อมูล (Restore)
```bash
mysql -u root -p warehouse_db < warehouse_backup_YYYYMMDD.sql
```

---

## 7. ข้อมูลบัญชีผู้ใช้เริ่มต้นสำหรับทดสอบ (Default Seed Accounts)

| บทบาท (Role) | อีเมลเข้าสู่ระบบ (Email) | รหัสผ่าน (Default Password) | สิทธิ์การเข้าถึง |
| :--- | :--- | :---: | :--- |
| **Super Admin** | `admin@warehouse.com` | `password123` | จัดการทุกส่วนของระบบ, Audit Logs, Settings |
| **HR Manager** | `hr@warehouse.com` | `password123` | จัดการพนักงาน นำเข้า/ส่งออก Excel รายงาน |
| **Senior Trainer** | `trainer@warehouse.com` | `password123` | สร้างคอร์ส บทเรียน วิดีโอ ข้อสอบ จัดการทักษะ |
| **Supervisor 1** | `supervisor1@warehouse.com` | `password123` | มอบหมายงาน อนุมัติการสอบ ประเมินทักษะ Zone A |
| **Supervisor 2** | `supervisor2@warehouse.com` | `password123` | มอบหมายงาน อนุมัติการสอบ ประเมินทักษะ Zone B |
| **Employee 1** | `employee1@warehouse.com` | `password123` | เรียนบทเรียน ทำข้อสอบ ลงเวลาทำงาน ส่งงาน |

*(หมายเหตุ: ทุกบัญชีสามารถเข้าสู่ระบบเพื่อเปลี่ยนรหัสผ่านใหม่ได้ทันที หรือผู้ดูแลระบบสามารถรีเซ็ตรหัสผ่านได้จากเมนูผู้ดูแล)*

---

## 8. รายการตรวจสอบความปลอดภัยก่อนเปิดใช้งานจริง (Production Checklist)

- [ ] เปลี่ยน `JWT_SECRET` ใน Backend ให้เป็น Random String 64+ ตัวอักษร
- [ ] เปลี่ยนรหัสผ่าน Database `root` และสร้าง Database User เฉพาะพร้อมจำกัดสิทธิ์
- [ ] ติดตั้ง SSL/TLS Certificate (HTTPS) บนโดเมนของบริษัท
- [ ] ปิดการเข้าถึงพอร์ต `3306` (MySQL) จาก Public Internet (อนุญาตเฉพาะ Backend Server / VPC Internal)
- [ ] ตั้งค่า Cron Job สำหรับ Backup Database อัตโนมัติทุกวัน
- [ ] ปิดหรือจำกัดการเข้าถึง `phpMyAdmin` ผ่าน IP Whitelist หรือ VPN ภายในบริษัท
- [ ] ทดสอบ Health Check endpoint: `GET /api/status` ต้องตอบกลับ `status: "online"`

---

## 9. การสนับสนุนและติดต่อสอบถาม (Support & Contact)
หากทีม IT พบปัญหาข้อสงสัยในการ Configuration หรือเชื่อมโยง Cloud Database สามารถดูรายละเอียดโค้ดและ API Schema เพิ่มเติมได้ที่ไฟล์ `README.md` และเอกสาร OpenAPI ที่ `/api-docs`
