'use client';

import React, { useState, useEffect } from 'react';
import GlassCard from '../../components/GlassCard';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Radar 
} from 'recharts';
import { useAuth } from '../../context/AuthContext';
import { 
  Award, 
  Flame, 
  Gauge, 
  ShieldCheck, 
  Activity, 
  ChevronUp, 
  Star,
  Users,
  Calendar,
  TrendingUp,
  Target,
  Percent,
  ClipboardList,
  CheckCircle2,
  Edit3,
  Plus,
  X,
  Save,
  Trash2
} from 'lucide-react';

export default function KpisPage() {
  const { user } = useAuth();
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'departmentKpi' | 'leaderboard'>('departmentKpi');
  const [selectedMonth, setSelectedMonth] = useState('June');

  // Edit KPI state variables
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingKpi, setEditingKpi] = useState<any>(null);
  const [editId, setEditId] = useState('');
  const [editName, setEditName] = useState('');
  const [editFormula, setEditFormula] = useState('');
  const [editWt, setEditWt] = useState('');
  const [editTarget, setEditTarget] = useState('');
  const [editActual, setEditActual] = useState('');
  const [editManualScore, setEditManualScore] = useState('');
  const [editManualGrade, setEditManualGrade] = useState('');

  // Add KPI state variables
  const [showAddKpiModal, setShowAddKpiModal] = useState(false);
  const [addKpiId, setAddKpiId] = useState('');
  const [addKpiName, setAddKpiName] = useState('');
  const [addKpiFormula, setAddKpiFormula] = useState('');
  const [addKpiWt, setAddKpiWt] = useState('');
  const [addKpiTarget, setAddKpiTarget] = useState('');
  const [addKpiActual, setAddKpiActual] = useState('');
  const [addKpiUnit, setAddKpiUnit] = useState('%');
  const [addKpiCategory, setAddKpiCategory] = useState('FIFO');
  const [addKpiManualScore, setAddKpiManualScore] = useState('');
  const [addKpiManualGrade, setAddKpiManualGrade] = useState('');

  // Add month state variables
  const [showAddMonthModal, setShowAddMonthModal] = useState(false);
  const [newMonthName, setNewMonthName] = useState('');
  const [newKpiValues, setNewKpiValues] = useState<Record<string, string>>({});

  // Turn monthlyKpiData into modifiable state!
  const [kpis, setKpis] = useState<Record<string, any[]>>({
    'June': [
      { id: '1.1', name: 'การจ่ายสินค้าออกตามลำดับ FIFO 100%', formula: '(จำนวนรายการที่จ่ายตรงตาม FIFO / จำนวนรายการจ่ายทั้งหมด) x 100', wt: 15.0, target: '98%', actual: 98.2, unit: '%', category: 'FIFO' },
      { id: '1.2', name: 'จำนวนพาเลทเศษได้รับการจัดกลุ่ม GEN', formula: '(พาเลทเศษที่จัดกลุ่ม / พาเลทเศษทั้งหมด 326 PL) x 100', wt: 2.5, target: '20%', actual: 20.8, unit: '%', category: 'FIFO' },
      { id: '1.3', name: 'จำนวนพาเลทเศษได้รับการจัดกลุ่ม 3PCS/Jui', formula: '(พาเลทเศษที่จัดกลุ่ม / พาเลทเศษทั้งหมด 17 PL) x 100', wt: 2.5, target: '20%', actual: 18.5, unit: '%', category: 'FIFO' },
      { id: '1.4', name: 'จำนวนพาเลทเศษได้รับการจัดกลุ่ม 2PCS', formula: '(พาเลทเศษที่จัดกลุ่ม / พาเลทเศษทั้งหมด 42 PL) x 100', wt: 2.5, target: '20%', actual: 21.4, unit: '%', category: 'FIFO' },
      { id: '1.5', name: 'จำนวนพาเลทเศษได้รับการจัดกลุ่ม EOE', formula: '(พาเลทเศษที่จัดกลุ่ม / พาเลทเศษทั้งหมด 35 PL) x 100', wt: 2.5, target: '20%', actual: 16.5, unit: '%', category: 'FIFO' },
      { id: '2', name: '% On time Delivery = 100% (วางแผน, คลังสินค้า, ขนส่ง)', formula: '(จำนวนรายการส่งมอบตรงเวลา / จำนวนจัดส่งทั้งหมด) x 100', wt: 10.0, target: '100%', actual: 99.1, unit: '%', category: 'Delivery' },
      { id: '3', name: 'C-CAR (คลังสินค้า+ขนส่ง)', formula: 'Major + Minor ลดลง 50% (ข้อมูลอิงจากปี 2024 = 16 ฉบับ)', wt: 5.0, target: '5 ฉบับ', actual: 6, unit: 'ฉบับ', category: 'Quality' },
      { id: '4', name: 'Waste ลดของเสียที่เกิดจากกระบวนการคลังสินค้า', formula: 'ลดลง 50% (เป้าหมายสะสมต่อปีไม่เกิน 80 พาเลท)', wt: 5.0, target: '<=80 พาเลท', actual: 78, unit: 'พาเลท', category: 'Quality' },
      { id: '5.1', name: 'อุบัติเหตุกล่องโหลดล้มสะสม', formula: 'อุบัติเหตุสะสมของกล่อง = 0 PL (ปี 2025 = 13 PL)', wt: 5.0, target: '6 ครั้ง', actual: 6, unit: 'ครั้ง', category: 'Safety' },
      { id: '5.2', name: 'อุบัติเหตุการทำงาน', formula: 'อุบัติเหตุที่มีเอกสารสอบสวนความปลอดภัยจาก จป. = 0 ครั้ง', wt: 5.0, target: '0 ครั้ง', actual: 0, unit: 'ครั้ง', category: 'Safety' },
      { id: '7', name: 'Operation Cost +-5%', formula: 'Actual Sales unit (can+eoe+sot) / ค่าใช้จ่ายจริง x 100', wt: 10.0, target: '-5.00%', actual: -5.1, unit: '%', category: 'Cost' },
      { id: '8', name: 'จำนวนรายการที่ Adjust ในระบบ ERP (ต่อเดือน)', formula: 'การ Adjust = 0 ครั้ง/ตู้ (รวมทุกคลังสินค้า)', wt: 5.0, target: '0 ครั้ง', actual: 1, unit: 'ครั้ง', category: 'System' },
      { id: '9', name: 'ความถูกต้องของการจัดสินค้าเพื่อจัดส่ง', formula: 'จำนวน Job งานถูกต้อง / จำนวน Job งานทั้งหมด x 100', wt: 5.0, target: '100.00%', actual: 100.0, unit: '%', category: 'Quality' },
      { id: '10', name: 'จำนวนกิจกรรม FI/Kaizen ที่สำเร็จและนำไปใช้จริง', formula: 'กิจกรรมประดิษฐ์นวัตกรรม/การปรับปรุงงาน (สะสมต่อปี)', wt: 10.0, target: '12 เรื่อง', actual: 11, unit: 'เรื่อง', category: 'Improvement' },
      { id: '11.1', name: 'ผลประเมิน 5S & Work Instruction (WI)', formula: 'คะแนนการผ่านประเมินมาตรฐานพื้นที่ 5S และหน้างาน', wt: 10.0, target: '28 เรื่อง', actual: 28, unit: 'เรื่อง', category: '5S' },
      { id: '11.2', name: '% ประเด็นที่ไม่แก้ไข', formula: '(ประเด็นค้างแก้ไขเกิน 3 วัน / ประเด็นตรวจพบทั้งหมด) x 100', wt: 5.0, target: '0%', actual: 1.2, unit: '%', category: '5S' }
    ],
    'May': [
      { id: '1.1', name: 'การจ่ายสินค้าออกตามลำดับ FIFO 100%', formula: '(จำนวนรายการที่จ่ายตรงตาม FIFO / จำนวนรายการจ่ายทั้งหมด) x 100', wt: 15.0, target: '98%', actual: 97.6, unit: '%', category: 'FIFO' },
      { id: '1.2', name: 'จำนวนพาเลทเศษได้รับการจัดกลุ่ม GEN', formula: '(พาเลทเศษที่จัดกลุ่ม / พาเลทเศษทั้งหมด 326 PL) x 100', wt: 2.5, target: '20%', actual: 18.2, unit: '%', category: 'FIFO' },
      { id: '1.3', name: 'จำนวนพาเลทเศษได้รับการจัดกลุ่ม 3PCS/Jui', formula: '(พาเลทเศษที่จัดกลุ่ม / พาเลทเศษทั้งหมด 17 PL) x 100', wt: 2.5, target: '20%', actual: 17.6, unit: '%', category: 'FIFO' },
      { id: '1.4', name: 'จำนวนพาเลทเศษได้รับการจัดกลุ่ม 2PCS', formula: '(พาเลทเศษที่จัดกลุ่ม / พาเลทเศษทั้งหมด 42 PL) x 100', wt: 2.5, target: '20%', actual: 19.8, unit: '%', category: 'FIFO' },
      { id: '1.5', name: 'จำนวนพาเลทเศษได้รับการจัดกลุ่ม EOE', formula: '(พาเลทเศษที่จัดกลุ่ม / พาเลทเศษทั้งหมด 35 PL) x 100', wt: 2.5, target: '20%', actual: 15.2, unit: '%', category: 'FIFO' },
      { id: '2', name: '% On time Delivery = 100% (วางแผน, คลังสินค้า, ขนส่ง)', formula: '(จำนวนรายการส่งมอบตรงเวลา / จำนวนจัดส่งทั้งหมด) x 100', wt: 10.0, target: '100%', actual: 98.7, unit: '%', category: 'Delivery' },
      { id: '3', name: 'C-CAR (คลังสินค้า+ขนส่ง)', formula: 'Major + Minor ลดลง 50% (ข้อมูลอิงจากปี 2024 = 16 ฉบับ)', wt: 5.0, target: '5 ฉบับ', actual: 7, unit: 'ฉบับ', category: 'Quality' },
      { id: '4', name: 'Waste ลดของเสียที่เกิดจากกระบวนการคลังสินค้า', formula: 'ลดลง 50% (เป้าหมายสะสมต่อปีไม่เกิน 80 พาเลท)', wt: 5.0, target: '<=80 พาเลท', actual: 84, unit: 'พาเลท', category: 'Quality' },
      { id: '5.1', name: 'อุบัติเหตุกล่องโหลดล้มสะสม', formula: 'อุบัติเหตุสะสมของกล่อง = 0 PL (ปี 2025 = 13 PL)', wt: 5.0, target: '6 ครั้ง', actual: 7, unit: 'ครั้ง', category: 'Safety' },
      { id: '5.2', name: 'อุบัติเหตุการทำงาน', formula: 'อุบัติเหตุที่มีเอกสารสอบสวนความปลอดภัยจาก จป. = 0 ครั้ง', wt: 5.0, target: '0 ครั้ง', actual: 0, unit: 'ครั้ง', category: 'Safety' },
      { id: '7', name: 'Operation Cost +-5%', formula: 'Actual Sales unit (can+eoe+sot) / ค่าใช้จ่ายจริง x 100', wt: 10.0, target: '-5.00%', actual: -3.2, unit: '%', category: 'Cost' },
      { id: '8', name: 'จำนวนรายการที่ Adjust ในระบบ ERP (ต่อเดือน)', formula: 'การ Adjust = 0 ครั้ง/ตู้ (รวมทุกคลังสินค้า)', wt: 5.0, target: '0 ครั้ง', actual: 2, unit: 'ครั้ง', category: 'System' },
      { id: '9', name: 'ความถูกต้องของการจัดสินค้าเพื่อจัดส่ง', formula: 'จำนวน Job งานถูกต้อง / จำนวน Job งานทั้งหมด x 100', wt: 5.0, target: '100.00%', actual: 99.8, unit: '%', category: 'Quality' },
      { id: '10', name: 'จำนวนกิจกรรม FI/Kaizen ที่สำเร็จและนำไปใช้จริง', formula: 'กิจกรรมประดิษฐ์นวัตกรรม/การปรับปรุงงาน (สะสมต่อปี)', wt: 10.0, target: '12 เรื่อง', actual: 10, unit: 'เรื่อง', category: 'Improvement' },
      { id: '11.1', name: 'ผลประเมิน 5S & Work Instruction (WI)', formula: 'คะแนนการผ่านประเมินมาตรฐานพื้นที่ 5S และหน้างาน', wt: 10.0, target: '28 เรื่อง', actual: 27, unit: 'เรื่อง', category: '5S' },
      { id: '11.2', name: '% ประเด็นที่ไม่แก้ไข', formula: '(ประเด็นค้างแก้ไขเกิน 3 วัน / ประเด็นตรวจพบทั้งหมด) x 100', wt: 5.0, target: '0%', actual: 2.1, unit: '%', category: '5S' }
    ],
    'April': [
      { id: '1.1', name: 'การจ่ายสินค้าออกตามลำดับ FIFO 100%', formula: '(จำนวนรายการที่จ่ายตรงตาม FIFO / จำนวนรายการจ่ายทั้งหมด) x 100', wt: 15.0, target: '98%', actual: 95.8, unit: '%', category: 'FIFO' },
      { id: '1.2', name: 'จำนวนพาเลทเศษได้รับการจัดกลุ่ม GEN', formula: '(พาเลทเศษที่จัดกลุ่ม / พาเลทเศษทั้งหมด 326 PL) x 100', wt: 2.5, target: '20%', actual: 15.4, unit: '%', category: 'FIFO' },
      { id: '1.3', name: 'จำนวนพาเลทเศษได้รับการจัดกลุ่ม 3PCS/Jui', formula: '(พาเลทเศษที่จัดกลุ่ม / พาเลทเศษทั้งหมด 17 PL) x 100', wt: 2.5, target: '20%', actual: 14.5, unit: '%', category: 'FIFO' },
      { id: '1.4', name: 'จำนวนพาเลทเศษได้รับการจัดกลุ่ม 2PCS', formula: '(พาเลทเศษที่จัดกลุ่ม / พาเลทเศษทั้งหมด 42 PL) x 100', wt: 2.5, target: '20%', actual: 16.0, unit: '%', category: 'FIFO' },
      { id: '1.5', name: 'จำนวนพาเลทเศษได้รับการจัดกลุ่ม EOE', formula: '(พาเลทเศษที่จัดกลุ่ม / พาเลทเศษทั้งหมด 35 PL) x 100', wt: 2.5, target: '20%', actual: 11.5, unit: '%', category: 'FIFO' },
      { id: '2', name: '% On time Delivery = 100% (วางแผน, คลังสินค้า, ขนส่ง)', formula: '(จำนวนรายการส่งมอบตรงเวลา / จำนวนจัดส่งทั้งหมด) x 100', wt: 10.0, target: '100%', actual: 96.8, unit: '%', category: 'Delivery' },
      { id: '3', name: 'C-CAR (คลังสินค้า+ขนส่ง)', formula: 'Major + Minor ลดลง 50% (ข้อมูลอิงจากปี 2024 = 16 ฉบับ)', wt: 5.0, target: '5 ฉบับ', actual: 9, unit: 'ฉบับ', category: 'Quality' },
      { id: '4', name: 'Waste ลดของเสียที่เกิดจากกระบวนการคลังสินค้า', formula: 'ลดลง 50% (เป้าหมายสะสมต่อปีไม่เกิน 80 พาเลท)', wt: 5.0, target: '<=80 พาเลท', actual: 105, unit: 'พาเลท', category: 'Quality' },
      { id: '5.1', name: 'อุบัติเหตุกล่องโหลดล้มสะสม', formula: 'อุบัติเหตุสะสมของกล่อง = 0 PL (ปี 2025 = 13 PL)', wt: 5.0, target: '6 ครั้ง', actual: 8, unit: 'ครั้ง', category: 'Safety' },
      { id: '5.2', name: 'อุบัติเหตุการทำงาน', formula: 'อุบัติเหตุที่มีเอกสารสอบสวนความปลอดภัยจาก จป. = 0 ครั้ง', wt: 5.0, target: '0 ครั้ง', actual: 1, unit: 'ครั้ง', category: 'Safety' },
      { id: '7', name: 'Operation Cost +-5%', formula: 'Actual Sales unit (can+eoe+sot) / ค่าใช้จ่ายจริง x 100', wt: 10.0, target: '-5.00%', actual: 1.2, unit: '%', category: 'Cost' },
      { id: '8', name: 'จำนวนรายการที่ Adjust ในระบบ ERP (ต่อเดือน)', formula: 'การ Adjust = 0 ครั้ง/ตู้ (รวมทุกคลังสินค้า)', wt: 5.0, target: '0 ครั้ง', actual: 3, unit: 'ครั้ง', category: 'System' },
      { id: '9', name: 'ความถูกต้องของการจัดสินค้าเพื่อจัดส่ง', formula: 'จำนวน Job งานถูกต้อง / จำนวน Job งานทั้งหมด x 100', wt: 5.0, target: '100.00%', actual: 98.4, unit: '%', category: 'Quality' },
      { id: '10', name: 'จำนวนกิจกรรม FI/Kaizen ที่สำเร็จและนำไปใช้จริง', formula: 'กิจกรรมประดิษฐ์นวัตกรรม/การปรับปรุงงาน (สะสมต่อปี)', wt: 10.0, target: '12 เรื่อง', actual: 8, unit: 'เรื่อง', category: 'Improvement' },
      { id: '11.1', name: 'ผลประเมิน 5S & Work Instruction (WI)', formula: 'คะแนนการผ่านประเมินมาตรฐานพื้นที่ 5S และหน้างาน', wt: 10.0, target: '28 เรื่อง', actual: 23, unit: 'เรื่อง', category: '5S' },
      { id: '11.2', name: '% ประเด็นที่ไม่แก้ไข', formula: '(ประเด็นค้างแก้ไขเกิน 3 วัน / ประเด็นตรวจพบทั้งหมด) x 100', wt: 5.0, target: '0%', actual: 5.2, unit: '%', category: '5S' }
    ]
  });

  const getKpiGradeAndScore = (id: string, val: number) => {
    let score = 1.0;
    let grade = 'E';

    if (id === '1.1' || id === '2') {
      if (val >= 98) { grade = 'A'; score = 4.0; }
      else if (val >= 97) { grade = 'B+'; score = 3.5; }
      else if (val >= 96) { grade = 'B'; score = 3.0; }
      else if (val >= 95) { grade = 'C+'; score = 2.5; }
      else if (val >= 94) { grade = 'C'; score = 2.0; }
      else if (val >= 93) { grade = 'D'; score = 1.5; }
      else { grade = 'E'; score = 1.0; }
    } 
    else if (id === '1.2' || id === '1.3' || id === '1.4' || id === '1.5') {
      if (val >= 20) { grade = 'A'; score = 4.0; }
      else if (val >= 18) { grade = 'B+'; score = 3.5; }
      else if (val >= 16) { grade = 'B'; score = 3.0; }
      else if (val >= 14) { grade = 'C+'; score = 2.5; }
      else if (val >= 12) { grade = 'C'; score = 2.0; }
      else if (val >= 10) { grade = 'D'; score = 1.5; }
      else { grade = 'E'; score = 1.0; }
    }
    else if (id === '3') {
      if (val <= 5) { grade = 'A'; score = 4.0; }
      else if (val <= 6) { grade = 'B+'; score = 3.5; }
      else if (val <= 7) { grade = 'B'; score = 3.0; }
      else if (val <= 8) { grade = 'C+'; score = 2.5; }
      else if (val <= 9) { grade = 'C'; score = 2.0; }
      else if (val <= 10) { grade = 'D'; score = 1.5; }
      else { grade = 'E'; score = 1.0; }
    }
    else if (id === '4') {
      if (val <= 80) { grade = 'A'; score = 4.0; }
      else if (val <= 100) { grade = 'B+'; score = 3.5; }
      else if (val <= 120) { grade = 'B'; score = 3.0; }
      else if (val <= 140) { grade = 'C+'; score = 2.5; }
      else if (val <= 160) { grade = 'C'; score = 2.0; }
      else if (val <= 180) { grade = 'D'; score = 1.5; }
      else { grade = 'E'; score = 1.0; }
    }
    else if (id === '5.1') {
      if (val <= 6) { grade = 'A'; score = 4.0; }
      else if (val <= 7) { grade = 'B+'; score = 3.5; }
      else if (val <= 8) { grade = 'B'; score = 3.0; }
      else if (val <= 9) { grade = 'C+'; score = 2.5; }
      else if (val <= 10) { grade = 'C'; score = 2.0; }
      else if (val <= 11) { grade = 'D'; score = 1.5; }
      else { grade = 'E'; score = 1.0; }
    }
    else if (id === '5.2') {
      if (val === 0) { grade = 'A'; score = 4.0; }
      else if (val === 1) { grade = 'C+'; score = 2.5; }
      else { grade = 'E'; score = 1.0; }
    }
    else if (id === '7') {
      if (val <= -5.0) { grade = 'A'; score = 4.0; }
      else if (val <= -2.5) { grade = 'B+'; score = 3.5; }
      else if (val <= 0.0) { grade = 'B'; score = 3.0; }
      else if (val <= 2.5) { grade = 'C+'; score = 2.5; }
      else if (val <= 5.0) { grade = 'C'; score = 2.0; }
      else if (val <= 7.5) { grade = 'D'; score = 1.5; }
      else { grade = 'E'; score = 1.0; }
    }
    else if (id === '8') {
      if (val <= 0) { grade = 'A'; score = 4.0; }
      else if (val <= 1) { grade = 'B+'; score = 3.5; }
      else if (val <= 2) { grade = 'B'; score = 3.0; }
      else if (val <= 3) { grade = 'C+'; score = 2.5; }
      else if (val <= 4) { grade = 'C'; score = 2.0; }
      else if (val <= 5) { grade = 'D'; score = 1.5; }
      else { grade = 'E'; score = 1.0; }
    }
    else if (id === '9') {
      if (val >= 100) { grade = 'A'; score = 4.0; }
      else if (val >= 90) { grade = 'B+'; score = 3.5; }
      else if (val >= 80) { grade = 'B'; score = 3.0; }
      else if (val >= 70) { grade = 'C+'; score = 2.5; }
      else if (val >= 60) { grade = 'C'; score = 2.0; }
      else if (val >= 50) { grade = 'D'; score = 1.5; }
      else { grade = 'E'; score = 1.0; }
    }
    else if (id === '10' || id === '11.1') {
      let threshold = id === '10' ? 12 : 28;
      if (val >= threshold) { grade = 'A'; score = 4.0; }
      else if (val >= threshold - 1) { grade = 'B+'; score = 3.5; }
      else if (val >= threshold - 2) { grade = 'B'; score = 3.0; }
      else if (val >= threshold - 3) { grade = 'C+'; score = 2.5; }
      else if (val >= threshold - 4) { grade = 'C'; score = 2.0; }
      else if (val >= threshold - 5) { grade = 'D'; score = 1.5; }
      else { grade = 'E'; score = 1.0; }
    }
    else if (id === '11.2') {
      if (val <= 0) { grade = 'A'; score = 4.0; }
      else if (val <= 1.5) { grade = 'B+'; score = 3.5; }
      else if (val <= 3.0) { grade = 'B'; score = 3.0; }
      else if (val <= 4.5) { grade = 'C+'; score = 2.5; }
      else if (val <= 6.0) { grade = 'C'; score = 2.0; }
      else if (val <= 7.5) { grade = 'D'; score = 1.5; }
      else { grade = 'E'; score = 1.0; }
    }

    return { grade, score };
  };

  const currentKpiList = kpis[selectedMonth] || [];
  let totalWeightedScore = 0;
  let totalWeight = 0;

  const kpiItemsWithScores = currentKpiList.map(item => {
    const autoResult = getKpiGradeAndScore(item.id, item.actual);
    const score = item.manualScore !== undefined ? item.manualScore : autoResult.score;
    const grade = item.manualGrade !== undefined ? item.manualGrade : autoResult.grade;
    
    totalWeightedScore += (score * (item.wt / 100));
    totalWeight += (item.wt / 100);
    return {
      ...item,
      grade,
      score
    };
  });

  const finalWeightedScore = totalWeight > 0 ? (totalWeightedScore / totalWeight) : 0;
  const finalScorePercentage = (finalWeightedScore / 4.0) * 100;

  const getOverallGrade = (avgScore: number) => {
    if (avgScore >= 3.8) return 'A';
    if (avgScore >= 3.4) return 'B+';
    if (avgScore >= 3.0) return 'B';
    if (avgScore >= 2.5) return 'C+';
    if (avgScore >= 2.0) return 'C';
    if (avgScore >= 1.5) return 'D';
    return 'E';
  };

  const overallGradeLetter = getOverallGrade(finalWeightedScore);

  // Radar metrics for typical operator vs department averages
  const radarData = [
    { subject: 'ความถูกต้อง (Accuracy)', A: 95, B: 85, fullMark: 100 },
    { subject: 'ความรวดเร็ว (Speed)', A: 88, B: 80, fullMark: 100 },
    { subject: 'ความปลอดภัย (Safety)', A: 100, B: 90, fullMark: 100 },
    { subject: 'การเข้างาน (Attendance)', A: 98, B: 92, fullMark: 100 },
    { subject: 'การเรียนรู้ (Learning)', A: 85, B: 75, fullMark: 100 },
    { subject: 'การบริหาร (5S)', A: 90, B: 85, fullMark: 100 }
  ];

  const barData = [
    { name: 'สมปอง', Efficiency: 96, Accuracy: 94, Safety: 100 },
    { name: 'อรอนงค์', Efficiency: 92, Accuracy: 98, Safety: 100 },
    { name: 'มานะ', Efficiency: 88, Accuracy: 90, Safety: 95 },
    { name: 'เกษม', Efficiency: 85, Accuracy: 88, Safety: 100 },
    { name: 'จารุณี', Efficiency: 90, Accuracy: 95, Safety: 100 }
  ];

  useEffect(() => {
    // Simulate API call for leaderboard
    setTimeout(() => {
      setLeaderboard([
        { rank: 1, name: 'อรอนงค์ แพ็กเก่ง', position: 'Packer', points: 985, score: 98, status: 'up' },
        { rank: 2, name: 'สมปอง ลุยงาน', position: 'Forklift Driver', points: 960, score: 96, status: 'up' },
        { rank: 3, name: 'จารุณี นับสต็อก', position: 'Inventory Counter', points: 935, score: 94, status: 'down' },
        { rank: 4, name: 'มานะ คัดของ', position: 'Picker', points: 890, score: 89, status: 'up' },
        { rank: 5, name: 'เกษม รับสินค้า', position: 'Receiving Clerk', points: 875, score: 87, status: 'down' }
      ]);
      setLoading(false);
    }, 400);
  }, []);

  const handleSaveKpiEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingKpi) return;

    const updatedMonthData = kpis[selectedMonth].map(item => {
      if (item.id === editingKpi.id) {
        const updatedItem: any = {
          ...item,
          id: editId,
          name: editName,
          formula: editFormula,
          wt: parseFloat(editWt) || 0,
          target: editTarget,
          actual: parseFloat(editActual) || 0
        };

        if (editManualScore.trim()) {
          updatedItem.manualScore = parseFloat(editManualScore);
        } else {
          delete updatedItem.manualScore;
        }

        if (editManualGrade && editManualGrade !== 'Auto') {
          updatedItem.manualGrade = editManualGrade;
        } else {
          delete updatedItem.manualGrade;
        }

        return updatedItem;
      }
      return item;
    });

    setKpis({
      ...kpis,
      [selectedMonth]: updatedMonthData
    });
    setShowEditModal(false);
  };

  const handleSaveNewKpi = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addKpiId || !addKpiName) return;

    const newKpi: any = {
      id: addKpiId,
      name: addKpiName,
      formula: addKpiFormula,
      wt: parseFloat(addKpiWt) || 0,
      target: addKpiTarget,
      actual: parseFloat(addKpiActual) || 0,
      unit: addKpiUnit,
      category: addKpiCategory
    };

    if (addKpiManualScore.trim()) {
      newKpi.manualScore = parseFloat(addKpiManualScore);
    }
    if (addKpiManualGrade && addKpiManualGrade !== 'Auto') {
      newKpi.manualGrade = addKpiManualGrade;
    }

    const currentMonthKpis = kpis[selectedMonth] || [];
    setKpis({
      ...kpis,
      [selectedMonth]: [...currentMonthKpis, newKpi]
    });

    setShowAddKpiModal(false);
    // Reset form
    setAddKpiId('');
    setAddKpiName('');
    setAddKpiFormula('');
    setAddKpiWt('');
    setAddKpiTarget('');
    setAddKpiActual('');
    setAddKpiManualScore('');
    setAddKpiManualGrade('');
  };

  const handleDeleteKpi = (kpiId: string) => {
    if (window.confirm(`คุณต้องการลบตัวชี้วัด KPI ลำดับ ${kpiId} ใช่หรือไม่?`)) {
      const updatedMonthData = kpis[selectedMonth].filter(item => item.id !== kpiId);
      setKpis({
        ...kpis,
        [selectedMonth]: updatedMonthData
      });
    }
  };

  const handleAddMonthKpi = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMonthName.trim()) return;

    const template = kpis['June'] || [];
    const newMonthData = template.map(item => {
      const inputVal = newKpiValues[item.id] || '0';
      return {
        ...item,
        actual: parseFloat(inputVal) || 0
      };
    });

    setKpis({
      ...kpis,
      [newMonthName]: newMonthData
    });
    setSelectedMonth(newMonthName);
    setShowAddMonthModal(false);
    setNewMonthName('');
    setNewKpiValues({});
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-4 border-slate-300 border-t-warehouse-orange rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      
      {/* Header Info */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">แดชบอร์ดประเมินผลงาน (Performance KPI)</h2>
          <p className="text-slate-400 text-sm mt-1">วิเคราะห์ประสิทธิภาพ ความเร็ว ความถูกต้อง ความสะอาดระบบ 5S และความปลอดภัยในการทำงาน</p>
        </div>
      </div>

      {/* 4 KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        <GlassCard className="flex items-center gap-5 border border-slate-200/50 dark:border-white/5" hoverEffect>
          <div className="w-12 h-12 rounded-2xl bg-warehouse-orange/10 text-warehouse-orange flex items-center justify-center">
            <Gauge size={22} />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-bold">ประสิทธิภาพเฉลี่ย (Efficiency)</p>
            <h3 className="text-2xl font-bold font-sans text-slate-800 dark:text-white mt-1">94.2%</h3>
            <span className="text-[10px] text-emerald-500 font-semibold flex items-center gap-0.5">
              <ChevronUp size={12} />
              <span>+1.5% สูงกว่าเป้า</span>
            </span>
          </div>
        </GlassCard>

        <GlassCard className="flex items-center gap-5 border border-slate-200/50 dark:border-white/5" hoverEffect>
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
            <ShieldCheck size={22} />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-bold">คะแนนความปลอดภัย (Safety)</p>
            <h3 className="text-2xl font-bold font-sans text-slate-800 dark:text-white mt-1">99.8%</h3>
            <span className="text-[10px] text-slate-400 font-medium">เกิดอุบัติเหตุสะสม: 0 ครั้ง</span>
          </div>
        </GlassCard>

        <GlassCard className="flex items-center gap-5 border border-slate-200/50 dark:border-white/5" hoverEffect>
          <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center">
            <Flame size={22} />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-bold">ชั่วโมงสะสมรวม (KPI Hours)</p>
            <h3 className="text-2xl font-bold font-sans text-slate-800 dark:text-white mt-1">840 ชม.</h3>
            <span className="text-[10px] text-slate-400 font-medium">ข้อมูลรอบ 30 วัน</span>
          </div>
        </GlassCard>

        <GlassCard className="flex items-center gap-5 border border-slate-200/50 dark:border-white/5" hoverEffect>
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
            <Activity size={22} />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-bold">ความถูกต้องหยิบสินค้า (Accuracy)</p>
            <h3 className="text-2xl font-bold font-sans text-slate-800 dark:text-white mt-1">98.5%</h3>
            <span className="text-[10px] text-slate-400 font-medium">อัตราการคืนของต่ำกว่า 0.2%</span>
          </div>
        </GlassCard>

      </div>

      {/* KPI Chart Visuals Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Radar KPI breakdown chart */}
        <GlassCard className="lg:col-span-1 h-[400px] flex flex-col" delay={0.1}>
          <div className="mb-4">
            <h4 className="font-bold text-sm text-slate-800 dark:text-white">เรดาร์วัดขีดความสามารถ (Competency Radar)</h4>
            <p className="text-xs text-slate-400 mt-0.5">ภาพรวมทักษะส่วนตัวเปรียบเทียบกับค่าเฉลี่ยของแผนก</p>
          </div>
          <div className="flex-1 w-full text-xs">
            <ResponsiveContainer width="100%" height="90%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                <PolarGrid stroke="#E2E8F0" className="dark:stroke-slate-800" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#94A3B8', fontSize: 10 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} />
                <Radar name="พนักงานเป้าหมาย (Operator A)" dataKey="A" stroke="#F97316" fill="#F97316" fillOpacity={0.2} />
                <Radar name="ค่าเฉลี่ยคลัง (Standard Avg)" dataKey="B" stroke="#1E3A8A" fill="#1E3A8A" fillOpacity={0.1} />
                <Tooltip contentStyle={{ borderRadius: '12px' }} />
                <Legend wrapperStyle={{ fontSize: 10, marginTop: 10 }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        {/* Bar comparison chart */}
        <GlassCard className="lg:col-span-2 h-[400px] flex flex-col" delay={0.15}>
          <div className="mb-4">
            <h4 className="font-bold text-sm text-slate-800 dark:text-white">ผลสัมฤทธิ์รายบุคคล (Operator KPI Performance)</h4>
            <p className="text-xs text-slate-400 mt-0.5">การเปรียบเทียบประสิทธิผลความแม่นยำและความปลอดภัยในกลุ่มพนักงานดีเด่น</p>
          </div>
          <div className="flex-1 w-full text-xs">
            <ResponsiveContainer width="100%" height="90%">
              <BarChart data={barData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" className="dark:stroke-slate-800" />
                <XAxis dataKey="name" tickLine={false} stroke="#94A3B8" />
                <YAxis axisLine={false} tickLine={false} stroke="#94A3B8" />
                <Tooltip contentStyle={{ borderRadius: '12px' }} />
                <Legend wrapperStyle={{ fontSize: 10 }} />
                <Bar dataKey="Efficiency" name="ประสิทธิภาพความเร็ว" fill="#1E3A8A" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Accuracy" name="ความถูกต้อง" fill="#F97316" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Safety" name="คะแนนเซฟตี้" fill="#10B981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

      </div>

      {/* Switcher Tabs */}
      <div className="flex gap-4 border-b border-slate-200/50 dark:border-white/5 pb-2">
        <button 
          onClick={() => setActiveTab('departmentKpi')}
          className={`pb-2 px-1 text-sm font-bold transition-all relative ${
            activeTab === 'departmentKpi' 
              ? 'text-warehouse-orange border-b-2 border-warehouse-orange' 
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          สรุปผล KPI แผนกคลังสินค้า (Department KPI)
        </button>
        <button 
          onClick={() => setActiveTab('leaderboard')}
          className={`pb-2 px-1 text-sm font-bold transition-all relative ${
            activeTab === 'leaderboard' 
              ? 'text-warehouse-orange border-b-2 border-warehouse-orange' 
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          อันดับผลงานรายบุคคล (Leaderboard)
        </button>
      </div>

      {activeTab === 'departmentKpi' ? (
        <div className="space-y-6">
          {/* Monthly KPI header card */}
          <GlassCard className="p-6 border border-slate-200/50 dark:border-white/5 bg-slate-50/50 dark:bg-white/5">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h4 className="font-bold text-base text-slate-800 dark:text-white flex items-center gap-2">
                  <ClipboardList className="text-warehouse-orange" size={20} />
                  <span>ผลการดำเนินงานแผนกคลังสินค้าประจำปี 2026</span>
                </h4>
                <p className="text-xs text-slate-400 mt-1">ตารางคะแนนถ่วงน้ำหนัก เกรด และเป้าหมายตามแต่ละตัวชี้วัด</p>
              </div>

              {/* Month Selector */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2">
                  <Calendar size={16} className="text-slate-400" />
                  <span className="text-xs text-slate-400 font-bold">เลือกเดือนประเมิน:</span>
                  <select 
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="glass-input text-xs bg-white dark:bg-warehouse-slate py-1 px-3"
                  >
                    {Object.keys(kpis).map(month => (
                      <option key={month} value={month}>
                        {month === 'June' ? 'มิถุนายน 2026' : 
                         month === 'May' ? 'พฤษภาคม 2026' : 
                         month === 'April' ? 'เมษายน 2026' : month}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Add Month & KPI Buttons (visible only to Admin/Staff) */}
                {(user?.role === 'admin' || user?.role === 'staff') && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setNewMonthName('');
                        setNewKpiValues({});
                        setShowAddMonthModal(true);
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-warehouse-orange text-white text-xs font-bold hover:bg-warehouse-orange/90 transition-all shadow-md shadow-warehouse-orange/10"
                    >
                      <Plus size={14} />
                      <span>เพิ่มเดือน</span>
                    </button>
                    <button
                      onClick={() => {
                        setAddKpiId('');
                        setAddKpiName('');
                        setAddKpiFormula('');
                        setAddKpiWt('');
                        setAddKpiTarget('');
                        setAddKpiActual('');
                        setAddKpiManualScore('');
                        setAddKpiManualGrade('Auto');
                        setShowAddKpiModal(true);
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-all shadow-md shadow-emerald-600/10"
                    >
                      <Plus size={14} />
                      <span>เพิ่ม KPI</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Department Overall Grade and Score Badges */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6 pt-6 border-t border-slate-200/30 dark:border-white/5">
              <div className="flex items-center gap-4 p-4 bg-warehouse-orange/5 border border-warehouse-orange/20 rounded-2xl">
                <div className="w-12 h-12 rounded-xl bg-warehouse-orange/15 text-warehouse-orange flex items-center justify-center font-black text-2xl shadow-inner shadow-warehouse-orange/10">
                  {overallGradeLetter}
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">เกรดเฉลี่ยของแผนก (Overall Grade)</p>
                  <h5 className="text-lg font-extrabold text-slate-800 dark:text-white mt-0.5">เกรด {overallGradeLetter}</h5>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center">
                  <Award size={24} />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">คะแนนถ่วงน้ำหนักเฉลี่ย (Weighted Score)</p>
                  <h5 className="text-lg font-extrabold text-slate-800 dark:text-white mt-0.5">{finalWeightedScore.toFixed(2)} / 4.00</h5>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 bg-indigo-500/5 border border-indigo-500/20 rounded-2xl">
                <div className="w-12 h-12 rounded-xl bg-indigo-500/15 text-indigo-400 flex items-center justify-center">
                  <Percent size={22} />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">เปอร์เซ็นต์ผลดำเนินงาน (KPI Performance %)</p>
                  <h5 className="text-lg font-extrabold text-slate-800 dark:text-white mt-0.5">{finalScorePercentage.toFixed(1)}%</h5>
                </div>
              </div>
            </div>
          </GlassCard>

          {/* Detailed KPI Table */}
          <GlassCard className="p-0 overflow-hidden border border-slate-200/50 dark:border-white/5">
            <div className="overflow-x-auto text-xs">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-slate-200/50 dark:border-white/5 text-[10px] uppercase font-bold text-slate-400 tracking-wider bg-slate-50/50 dark:bg-white/5">
                    <th className="px-4 py-3 text-center w-12">ลำดับ</th>
                    <th className="px-4 py-3">หัวข้อ KPI หลัก</th>
                    <th className="px-4 py-3">สูตรการคำนวณ</th>
                    <th className="px-4 py-3 text-center w-20">% WT</th>
                    <th className="px-4 py-3 text-center w-24">Target</th>
                    <th className="px-4 py-3 text-center w-24">ผลงานจริง (Actual)</th>
                    <th className="px-4 py-3 text-center w-20">คะแนน (4.0)</th>
                    <th className="px-4 py-3 text-center w-20">เกรด</th>
                    {(user?.role === 'admin' || user?.role === 'staff') && (
                      <th className="px-4 py-3 text-center w-24">จัดการ</th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/50 dark:divide-white/5 font-semibold text-slate-700 dark:text-slate-200">
                  {kpiItemsWithScores.map((kpi) => {
                    const getGradeColor = (g: string) => {
                      if (g === 'A') return 'bg-emerald-500/15 text-emerald-500 border border-emerald-500/30';
                      if (g === 'B+') return 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/15';
                      if (g === 'B') return 'bg-sky-500/10 text-sky-500 border border-sky-500/15';
                      if (g === 'C+') return 'bg-amber-500/15 text-amber-500 border border-amber-500/30';
                      if (g === 'C') return 'bg-amber-500/10 text-amber-500 border border-amber-500/15';
                      if (g === 'D') return 'bg-rose-500/10 text-rose-500 border border-rose-500/15';
                      return 'bg-rose-500/15 text-rose-500 border border-rose-500/30';
                    };

                    return (
                      <tr key={kpi.id} className="hover:bg-slate-100/25 dark:hover:bg-white/5 transition-colors">
                        <td className="px-4 py-4 text-center font-mono text-slate-400">{kpi.id}</td>
                        <td className="px-4 py-4">
                          <p className="font-semibold text-slate-800 dark:text-white">{kpi.name}</p>
                        </td>
                        <td className="px-4 py-4 text-slate-500 font-medium max-w-xs truncate animate-pulse" title={kpi.formula}>
                          {kpi.formula}
                        </td>
                        <td className="px-4 py-4 text-center font-mono text-slate-400">{kpi.wt}%</td>
                        <td className="px-4 py-4 text-center text-slate-500">{kpi.target}</td>
                        <td className="px-4 py-4 text-center text-warehouse-orange font-mono font-bold">
                          {kpi.actual.toFixed(kpi.unit === '%' ? 1 : 0)}{kpi.unit}
                        </td>
                        <td className="px-4 py-4 text-center font-mono text-slate-400">{kpi.score.toFixed(1)}</td>
                        <td className="px-4 py-4 text-center">
                          <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${getGradeColor(kpi.grade)}`}>
                            {kpi.grade}
                          </span>
                        </td>
                        {(user?.role === 'admin' || user?.role === 'staff') && (
                          <td className="px-4 py-4 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => {
                                  setEditingKpi(kpi);
                                  setEditName(kpi.name);
                                  setEditFormula(kpi.formula || '');
                                  setEditWt(kpi.wt.toString());
                                  setEditTarget(kpi.target);
                                  setEditActual(kpi.actual.toString());
                                  setEditManualScore(kpi.manualScore !== undefined ? kpi.manualScore.toString() : '');
                                  setEditManualGrade(kpi.manualGrade || 'Auto');
                                  setShowEditModal(true);
                                }}
                                className="text-warehouse-orange hover:text-warehouse-orange/80 transition-colors p-1 bg-warehouse-orange/10 hover:bg-warehouse-orange/20 rounded-lg inline-flex items-center justify-center"
                                title="แก้ไข KPI และผลงาน"
                              >
                                <Edit3 size={14} />
                              </button>
                              <button
                                onClick={() => handleDeleteKpi(kpi.id)}
                                className="text-rose-500 hover:text-rose-600 transition-colors p-1 bg-rose-500/10 hover:bg-rose-500/20 rounded-lg inline-flex items-center justify-center"
                                title="ลบ KPI"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </GlassCard>
        </div>
      ) : (
        <GlassCard className="p-0 overflow-hidden border border-slate-200/50 dark:border-white/5" delay={0.2}>
          <div className="px-6 py-4 border-b border-slate-200/50 dark:border-white/5 bg-slate-100/50 dark:bg-white/5 flex items-center justify-between">
            <h4 className="font-bold text-sm text-slate-800 dark:text-white flex items-center gap-2">
              <Award size={18} className="text-warehouse-orange" />
              <span>กระดานผู้นำผลงานพนักงานดีเด่น (Leaderboard)</span>
            </h4>
            <span className="text-[10px] text-slate-400 font-semibold">อัปเดตแบบรายเดือน</span>
          </div>
          
          <div className="overflow-x-auto text-xs">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-slate-200/50 dark:border-white/5 text-[10px] uppercase font-bold text-slate-400 tracking-wider bg-slate-50/50 dark:bg-white/5">
                  <th className="px-6 py-3.5 text-center w-20">อันดับ</th>
                  <th className="px-6 py-3.5">รายชื่อพนักงาน</th>
                  <th className="px-6 py-3.5">ตำแหน่ง</th>
                  <th className="px-6 py-3.5 text-center">คะแนนสะสม (Points)</th>
                  <th className="px-6 py-3.5 text-center">ดัชนีชี้วัด KPI</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/50 dark:divide-white/5 font-semibold text-slate-700 dark:text-slate-200">
                {leaderboard.map((emp) => (
                  <tr key={emp.rank} className="hover:bg-slate-100/25 dark:hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center justify-center w-7 h-7 rounded-lg text-xs font-bold font-sans ${
                        emp.rank === 1 ? 'bg-amber-500 text-white' :
                        emp.rank === 2 ? 'bg-slate-300 text-slate-700' :
                        emp.rank === 3 ? 'bg-amber-700 text-white' : 'bg-slate-100 dark:bg-white/5 text-slate-400'
                      }`}>
                        {emp.rank === 1 ? <Star size={12} className="fill-white" /> : emp.rank}
                      </span>
                    </td>
                    <td className="px-6 py-4 flex items-center gap-3">
                      <div>
                        <p className="font-semibold text-slate-800 dark:text-white">{emp.name}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-500">{emp.position}</td>
                    <td className="px-6 py-4 text-center font-mono font-bold text-warehouse-orange">{emp.points} PTS</td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-emerald-500 font-mono font-bold">{emp.score}%</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>
      )}

      {/* EDIT KPI ACTUAL MODAL */}
      {showEditModal && editingKpi && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <GlassCard className="w-full max-w-md my-8 overflow-hidden border border-white/10" animate={false}>
            <div className="flex items-center justify-between pb-4 border-b border-slate-200/50 dark:border-white/5 mb-6">
              <h3 className="font-bold text-base text-slate-800 dark:text-white flex items-center gap-2">
                <Edit3 size={18} className="text-warehouse-orange" />
                <span>แก้ไขข้อมูลตัวชี้วัด KPI ({editingKpi.id})</span>
              </h3>
              <button 
                onClick={() => setShowEditModal(false)} 
                className="text-slate-400 hover:text-slate-200"
              >
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={handleSaveKpiEdit} className="space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase">ลำดับ KPI (ID)</label>
                <input 
                  type="text" 
                  required 
                  value={editId} 
                  onChange={(e) => setEditId(e.target.value)} 
                  className="glass-input text-xs w-full bg-white dark:bg-warehouse-slate" 
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase">หัวข้อ KPI หลัก</label>
                <input 
                  type="text" 
                  required 
                  value={editName} 
                  onChange={(e) => setEditName(e.target.value)} 
                  className="glass-input text-xs w-full bg-white dark:bg-warehouse-slate" 
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase">สูตรการคำนวณ</label>
                <textarea 
                  value={editFormula} 
                  onChange={(e) => setEditFormula(e.target.value)} 
                  rows={2}
                  className="glass-input text-xs w-full bg-white dark:bg-warehouse-slate py-2 resize-none" 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">% WT (น้ำหนัก)</label>
                  <input 
                    type="number" 
                    step="any"
                    required 
                    value={editWt} 
                    onChange={(e) => setEditWt(e.target.value)} 
                    className="glass-input text-xs w-full bg-white dark:bg-warehouse-slate" 
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Target (เป้าหมาย)</label>
                  <input 
                    type="text" 
                    required 
                    value={editTarget} 
                    onChange={(e) => setEditTarget(e.target.value)} 
                    className="glass-input text-xs w-full bg-white dark:bg-warehouse-slate" 
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase">ผลงานจริง (Actual) ในเดือนนี้</label>
                <input 
                  type="number" 
                  step="any"
                  required 
                  value={editActual} 
                  onChange={(e) => setEditActual(e.target.value)} 
                  className="glass-input text-xs w-full bg-white dark:bg-warehouse-slate" 
                />
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-100 dark:border-white/5">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">คะแนนสะสม (0.0 - 4.0)</label>
                  <input 
                    type="number" 
                    step="0.1"
                    min="0"
                    max="4"
                    value={editManualScore} 
                    onChange={(e) => setEditManualScore(e.target.value)} 
                    placeholder="Auto (คำนวณอัตโนมัติ)"
                    className="glass-input text-xs w-full bg-white dark:bg-warehouse-slate" 
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">เกรดเฉลี่ย</label>
                  <select 
                    value={editManualGrade} 
                    onChange={(e) => setEditManualGrade(e.target.value)}
                    className="glass-input text-xs w-full bg-white dark:bg-warehouse-slate"
                  >
                    <option value="Auto">Auto (คำนวณอัตโนมัติ)</option>
                    <option value="A">A</option>
                    <option value="B+">B+</option>
                    <option value="B">B</option>
                    <option value="C+">C+</option>
                    <option value="C">C</option>
                    <option value="D">D</option>
                    <option value="E">E</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200/50 dark:border-white/5">
                <button 
                  type="button" 
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200/50 dark:border-white/5 text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5"
                >
                  ยกเลิก
                </button>
                <button 
                  type="submit" 
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-warehouse-orange hover:bg-warehouse-orange/90 text-white text-xs font-bold transition-all shadow-md shadow-warehouse-orange/15"
                >
                  <Save size={14} />
                  <span>บันทึกผลงาน</span>
                </button>
              </div>
            </form>
          </GlassCard>
        </div>
      )}

      {/* ADD NEW KPI MODAL */}
      {showAddKpiModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <GlassCard className="w-full max-w-md my-8 overflow-hidden border border-white/10" animate={false}>
            <div className="flex items-center justify-between pb-4 border-b border-slate-200/50 dark:border-white/5 mb-6">
              <h3 className="font-bold text-base text-slate-800 dark:text-white flex items-center gap-2">
                <Plus size={18} className="text-emerald-500" />
                <span>เพิ่มตัวชี้วัด KPI ใหม่</span>
              </h3>
              <button 
                onClick={() => setShowAddKpiModal(false)} 
                className="text-slate-400 hover:text-slate-200"
              >
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={handleSaveNewKpi} className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">ลำดับ (ID)</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="เช่น 1.6"
                    value={addKpiId} 
                    onChange={(e) => setAddKpiId(e.target.value)} 
                    className="glass-input text-xs w-full bg-white dark:bg-warehouse-slate" 
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">หน่วย (Unit)</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="เช่น % หรือ ครั้ง"
                    value={addKpiUnit} 
                    onChange={(e) => setAddKpiUnit(e.target.value)} 
                    className="glass-input text-xs w-full bg-white dark:bg-warehouse-slate" 
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">หมวดหมู่</label>
                  <select 
                    value={addKpiCategory} 
                    onChange={(e) => setAddKpiCategory(e.target.value)}
                    className="glass-input text-xs w-full bg-white dark:bg-warehouse-slate"
                  >
                    <option value="FIFO">FIFO</option>
                    <option value="Delivery">Delivery</option>
                    <option value="Quality">Quality</option>
                    <option value="Safety">Safety</option>
                    <option value="Cost">Cost</option>
                    <option value="System">System</option>
                    <option value="5S">5S</option>
                    <option value="Improvement">Improvement</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase">หัวข้อ KPI หลัก</label>
                <input 
                  type="text" 
                  required 
                  placeholder="เช่น ความถูกต้องในการสแกนบาร์โค้ด"
                  value={addKpiName} 
                  onChange={(e) => setAddKpiName(e.target.value)} 
                  className="glass-input text-xs w-full bg-white dark:bg-warehouse-slate" 
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase">สูตรการคำนวณ</label>
                <textarea 
                  placeholder="เช่น (จำนวนที่ถูกต้อง / จำนวนทั้งหมด) x 100"
                  value={addKpiFormula} 
                  onChange={(e) => setAddKpiFormula(e.target.value)} 
                  rows={2}
                  className="glass-input text-xs w-full bg-white dark:bg-warehouse-slate py-2 resize-none" 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">% WT (น้ำหนัก)</label>
                  <input 
                    type="number" 
                    step="any"
                    required 
                    placeholder="เช่น 5"
                    value={addKpiWt} 
                    onChange={(e) => setAddKpiWt(e.target.value)} 
                    className="glass-input text-xs w-full bg-white dark:bg-warehouse-slate" 
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Target (เป้าหมาย)</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="เช่น >=95%"
                    value={addKpiTarget} 
                    onChange={(e) => setAddKpiTarget(e.target.value)} 
                    className="glass-input text-xs w-full bg-white dark:bg-warehouse-slate" 
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase">ผลงานจริง (Actual)</label>
                <input 
                  type="number" 
                  step="any"
                  required 
                  placeholder="เช่น 94.5"
                  value={addKpiActual} 
                  onChange={(e) => setAddKpiActual(e.target.value)} 
                  className="glass-input text-xs w-full bg-white dark:bg-warehouse-slate" 
                />
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-100 dark:border-white/5">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">คะแนนสะสม (0.0 - 4.0)</label>
                  <input 
                    type="number" 
                    step="0.1"
                    min="0"
                    max="4"
                    placeholder="Auto (คำนวณอัตโนมัติ)"
                    value={addKpiManualScore} 
                    onChange={(e) => setAddKpiManualScore(e.target.value)} 
                    className="glass-input text-xs w-full bg-white dark:bg-warehouse-slate" 
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">เกรดเฉลี่ย</label>
                  <select 
                    value={addKpiManualGrade} 
                    onChange={(e) => setAddKpiManualGrade(e.target.value)}
                    className="glass-input text-xs w-full bg-white dark:bg-warehouse-slate"
                  >
                    <option value="Auto">Auto (คำนวณอัตโนมัติ)</option>
                    <option value="A">A</option>
                    <option value="B+">B+</option>
                    <option value="B">B</option>
                    <option value="C+">C+</option>
                    <option value="C">C</option>
                    <option value="D">D</option>
                    <option value="E">E</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200/50 dark:border-white/5">
                <button 
                  type="button" 
                  onClick={() => setShowAddKpiModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200/50 dark:border-white/5 text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5"
                >
                  ยกเลิก
                </button>
                <button 
                  type="submit" 
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-md shadow-emerald-600/15"
                >
                  <Save size={14} />
                  <span>เพิ่ม KPI</span>
                </button>
              </div>
            </form>
          </GlassCard>
        </div>
      )}

      {/* ADD MONTHLY KPI MODAL */}
      {showAddMonthModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <GlassCard className="w-full max-w-xl my-8 overflow-hidden border border-white/10" animate={false}>
            <div className="flex items-center justify-between pb-4 border-b border-slate-200/50 dark:border-white/5 mb-6">
              <h3 className="font-bold text-base text-slate-800 dark:text-white flex items-center gap-2">
                <Plus size={18} className="text-warehouse-orange" />
                <span>เพิ่มข้อมูล KPI ประจำเดือน</span>
              </h3>
              <button 
                onClick={() => setShowAddMonthModal(false)} 
                className="text-slate-400 hover:text-slate-200"
              >
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={handleAddMonthKpi} className="space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase">ชื่อเดือนประเมิน (เช่น กรกฎาคม 2026)</label>
                <input 
                  type="text" 
                  required 
                  value={newMonthName} 
                  onChange={(e) => setNewMonthName(e.target.value)} 
                  className="glass-input text-xs w-full bg-white dark:bg-warehouse-slate" 
                  placeholder="กรกฎาคม 2026 หรือ July"
                />
              </div>

              <div className="border-t border-slate-200/30 dark:border-white/5 pt-4">
                <p className="text-[11px] font-extrabold text-slate-400 uppercase mb-3 tracking-wider">ระบุผลงานจริงของตัวชี้วัดทั้ง 12 ข้อ:</p>
                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                  {(kpis['June'] || []).map(item => (
                    <div key={item.id} className="grid grid-cols-1 sm:grid-cols-3 items-center gap-2 p-2 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-200/30 dark:border-white/5">
                      <div className="sm:col-span-2 text-xs">
                        <span className="font-mono text-slate-400 font-bold mr-1">{item.id}</span>
                        <span className="font-semibold text-slate-700 dark:text-slate-200 truncate inline-block max-w-[280px]" title={item.name}>{item.name.split(' (')[0]}</span>
                        <span className="block text-[9px] text-slate-400 font-medium">เป้าหมาย: {item.target}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <input 
                          type="number"
                          step="any"
                          required
                          value={newKpiValues[item.id] || ''}
                          onChange={(e) => setNewKpiValues({ ...newKpiValues, [item.id]: e.target.value })}
                          className="glass-input text-xs w-full bg-white dark:bg-warehouse-slate py-1 px-2 text-center"
                          placeholder="ผลงานจริง"
                        />
                        <span className="text-[10px] text-slate-400 font-bold">{item.unit}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200/50 dark:border-white/5">
                <button 
                  type="button" 
                  onClick={() => setShowAddMonthModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200/50 dark:border-white/5 text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5"
                >
                  ยกเลิก
                </button>
                <button 
                  type="submit" 
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-warehouse-orange hover:bg-warehouse-orange/90 text-white text-xs font-bold transition-all shadow-md shadow-warehouse-orange/15"
                >
                  <Plus size={14} />
                  <span>บันทึกข้อมูลเดือนใหม่</span>
                </button>
              </div>
            </form>
          </GlassCard>
        </div>
      )}

    </div>
  );
}
