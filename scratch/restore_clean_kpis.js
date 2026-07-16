const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

try {
  const filePath = path.join(__dirname, '../frontend/src/app/kpis/page.tsx');
  // 1. Get the clean file content from commit e41c8b0
  console.log('Fetching clean page.tsx from commit e41c8b0...');
  const cleanContent = execSync('git show e41c8b0:frontend/src/app/kpis/page.tsx', { encoding: 'utf8' });

  // 2. Perform the replacements one by one
  let result = cleanContent;

  // Add AreaChart and Area to recharts imports
  const targetImports = `import { 
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
} from 'recharts';`;

  const replaceImports = `import { 
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
  Radar,
  AreaChart,
  Area
} from 'recharts';`;

  if (!result.includes(targetImports)) throw new Error('Failed to match targetImports');
  result = result.replace(targetImports, replaceImports);

  // Replacement 1: Add state hooks for trendKpiId and editUnit
  const targetState = `  const [editingKpi, setEditingKpi] = useState<any>(null);
  const [editId, setEditId] = useState('');
  const [editName, setEditName] = useState('');
  const [editFormula, setEditFormula] = useState('');
  const [editWt, setEditWt] = useState('');
  const [editTarget, setEditTarget] = useState('');
  const [editActual, setEditActual] = useState('');
  const [editManualScore, setEditManualScore] = useState('');
  const [editManualGrade, setEditManualGrade] = useState('');`;

  const replaceState = `  const [editingKpi, setEditingKpi] = useState<any>(null);
  const [editId, setEditId] = useState('');
  const [editName, setEditName] = useState('');
  const [editFormula, setEditFormula] = useState('');
  const [editWt, setEditWt] = useState('');
  const [editTarget, setEditTarget] = useState('');
  const [editUnit, setEditUnit] = useState('%');
  const [editActual, setEditActual] = useState('');
  const [editManualScore, setEditManualScore] = useState('');
  const [editManualGrade, setEditManualGrade] = useState('');
  const [trendKpiId, setTrendKpiId] = useState('1.1');`;

  if (!result.includes(targetState)) throw new Error('Failed to match targetState');
  result = result.replace(targetState, replaceState);

  // Replacement 2: Replace initialKpis array and getKpiGradeAndScore function entirely
  // Let's find from "const [kpis, setKpis]" all the way to "return { grade, score };\n  };"
  const startKeyword = 'const [kpis, setKpis] = useState<Record<string, any[]>>({';
  const endKeyword = 'return { grade, score };\n  };';
  
  const startIndex = result.indexOf(startKeyword);
  const endIndex = result.indexOf(endKeyword) + endKeyword.length;

  if (startIndex === -1 || endIndex === -1) {
    throw new Error('Failed to find start or end index of kpis/grading block');
  }

  const kpisGradingReplacement = `const [kpis, setKpis] = useState<Record<string, any[]>>({
    'June': [
      { id: '1.1', name: 'การจ่ายสินค้าออกตามลำดับ FIFO 100%', formula: '(จำนวนรายการที่จ่ายตรงตาม FIFO / จำนวนรายการจ่ายทั้งหมด) x 100', wt: 15.0, target: '98%', actual: 98.2, unit: '%', category: 'FIFO' },
      { id: '1.2', name: 'จำนวนพาเลทเศษได้รับการจัดกลุ่ม GEN', formula: '(พาเลทเศษที่จัดกลุ่ม / พาเลทเศษทั้งหมด 326 PL) x 100', wt: 2.5, target: '65 พาเลท', actual: 68, unit: 'พาเลท', category: 'FIFO' },
      { id: '1.3', name: 'จำนวนพาเลทเศษได้รับการจัดกลุ่ม 3PCS/Jui', formula: '(พาเลทเศษที่จัดกลุ่ม / พาเลทเศษทั้งหมด 17 PL) x 100', wt: 2.5, target: '3.4 พาเลท', actual: 3, unit: 'พาเลท', category: 'FIFO' },
      { id: '1.4', name: 'จำนวนพาเลทเศษได้รับการจัดกลุ่ม 2PCS', formula: '(พาเลทเศษที่จัดกลุ่ม / พาเลทเศษทั้งหมด 42 PL) x 100', wt: 2.5, target: '8.4 พาเลท', actual: 9, unit: 'พาเลท', category: 'FIFO' },
      { id: '1.5', name: 'จำนวนพาเลทเศษได้รับการจัดกลุ่ม EOE', formula: '(พาเลทเศษที่จัดกลุ่ม / พาเลทเศษทั้งหมด 35 PL) x 100', wt: 2.5, target: '7 พาเลท', actual: 6, unit: 'พาเลท', category: 'FIFO' },
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
      { id: '11.2', name: 'ประเด็นที่ไม่แก้ไข', formula: 'จำนวนประเด็นค้างแก้ไขเกิน 3 วัน', wt: 5.0, target: '0 เคส', actual: 1, unit: 'เคส', category: '5S' }
    ],
    'May': [
      { id: '1.1', name: 'การจ่ายสินค้าออกตามลำดับ FIFO 100%', formula: '(จำนวนรายการที่จ่ายตรงตาม FIFO / จำนวนรายการจ่ายทั้งหมด) x 100', wt: 15.0, target: '98%', actual: 97.6, unit: '%', category: 'FIFO' },
      { id: '1.2', name: 'จำนวนพาเลทเศษได้รับการจัดกลุ่ม GEN', formula: '(พาเลทเศษที่จัดกลุ่ม / พาเลทเศษทั้งหมด 326 PL) x 100', wt: 2.5, target: '65 พาเลท', actual: 59, unit: 'พาเลท', category: 'FIFO' },
      { id: '1.3', name: 'จำนวนพาเลทเศษได้รับการจัดกลุ่ม 3PCS/Jui', formula: '(พาเลทเศษที่จัดกลุ่ม / พาเลทเศษทั้งหมด 17 PL) x 100', wt: 2.5, target: '3.4 พาเลท', actual: 3, unit: 'พาเลท', category: 'FIFO' },
      { id: '1.4', name: 'จำนวนพาเลทเศษได้รับการจัดกลุ่ม 2PCS', formula: '(พาเลทเศษที่จัดกลุ่ม / พาเลทเศษทั้งหมด 42 PL) x 100', wt: 2.5, target: '8.4 พาเลท', actual: 8, unit: 'พาเลท', category: 'FIFO' },
      { id: '1.5', name: 'จำนวนพาเลทเศษได้รับการจัดกลุ่ม EOE', formula: '(พาเลทเศษที่จัดกลุ่ม / พาเลทเศษทั้งหมด 35 PL) x 100', wt: 2.5, target: '7 พาเลท', actual: 5, unit: 'พาเลท', category: 'FIFO' },
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
      { id: '11.2', name: 'ประเด็นที่ไม่แก้ไข', formula: 'จำนวนประเด็นค้างแก้ไขเกิน 3 วัน', wt: 5.0, target: '0 เคส', actual: 2, unit: 'เคส', category: '5S' }
    ],
    'April': [
      { id: '1.1', name: 'การจ่ายสินค้าออกตามลำดับ FIFO 100%', formula: '(จำนวนรายการที่จ่ายตรงตาม FIFO / จำนวนรายการจ่ายทั้งหมด) x 100', wt: 15.0, target: '98%', actual: 95.8, unit: '%', category: 'FIFO' },
      { id: '1.2', name: 'จำนวนพาเลทเศษได้รับการจัดกลุ่ม GEN', formula: '(พาเลทเศษที่จัดกลุ่ม / พาเลทเศษทั้งหมด 326 PL) x 100', wt: 2.5, target: '65 พาเลท', actual: 50, unit: 'พาเลท', category: 'FIFO' },
      { id: '1.3', name: 'จำนวนพาเลทเศษได้รับการจัดกลุ่ม 3PCS/Jui', formula: '(พาเลทเศษที่จัดกลุ่ม / พาเลทเศษทั้งหมด 17 PL) x 100', wt: 2.5, target: '3.4 พาเลท', actual: 2, unit: 'พาเลท', category: 'FIFO' },
      { id: '1.4', name: 'จำนวนพาเลทเศษได้รับการจัดกลุ่ม 2PCS', formula: '(พาเลทเศษที่จัดกลุ่ม / พาเลทเศษทั้งหมด 42 PL) x 100', wt: 2.5, target: '8.4 พาเลท', actual: 7, unit: 'พาเลท', category: 'FIFO' },
      { id: '1.5', name: 'จำนวนพาเลทเศษได้รับการจัดกลุ่ม EOE', formula: '(พาเลทเศษที่จัดกลุ่ม / พาเลทเศษทั้งหมด 35 PL) x 100', wt: 2.5, target: '7 พาเลท', actual: 4, unit: 'พาเลท', category: 'FIFO' },
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
      { id: '11.2', name: 'ประเด็นที่ไม่แก้ไข', formula: 'จำนวนประเด็นค้างแก้ไขเกิน 3 วัน', wt: 5.0, target: '0 เคส', actual: 5, unit: 'เคส', category: '5S' }
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
    } else if (id === '1.2') {
      if (val >= 65) { grade = 'A'; score = 4.0; }
      else if (val >= 60) { grade = 'B+'; score = 3.5; }
      else if (val >= 55) { grade = 'B'; score = 3.0; }
      else if (val >= 50) { grade = 'C+'; score = 2.5; }
      else if (val >= 45) { grade = 'C'; score = 2.0; }
      else if (val >= 40) { grade = 'D'; score = 1.5; }
      else { grade = 'E'; score = 1.0; }
    } else if (id === '1.3') {
      if (val >= 3.4) { grade = 'A'; score = 4.0; }
      else if (val >= 3.0) { grade = 'B+'; score = 3.5; }
      else if (val >= 2.5) { grade = 'B'; score = 3.0; }
      else if (val >= 2.0) { grade = 'C+'; score = 2.5; }
      else if (val >= 1.5) { grade = 'C'; score = 2.0; }
      else if (val >= 1.0) { grade = 'D'; score = 1.5; }
      else { grade = 'E'; score = 1.0; }
    } else if (id === '1.4') {
      if (val >= 8.4) { grade = 'A'; score = 4.0; }
      else if (val >= 7.5) { grade = 'B+'; score = 3.5; }
      else if (val >= 6.5) { grade = 'B'; score = 3.0; }
      else if (val >= 5.5) { grade = 'C+'; score = 2.5; }
      else if (val >= 4.5) { grade = 'C'; score = 2.0; }
      else if (val >= 3.5) { grade = 'D'; score = 1.5; }
      else { grade = 'E'; score = 1.0; }
    } else if (id === '1.5') {
      if (val >= 7.0) { grade = 'A'; score = 4.0; }
      else if (val >= 6.0) { grade = 'B+'; score = 3.5; }
      else if (val >= 5.0) { grade = 'B'; score = 3.0; }
      else if (val >= 4.0) { grade = 'C+'; score = 2.5; }
      else if (val >= 3.0) { grade = 'C'; score = 2.0; }
      else if (val >= 2.0) { grade = 'D'; score = 1.5; }
      else { grade = 'E'; score = 1.0; }
    } else if (id === '3') {
      if (val <= 5) { grade = 'A'; score = 4.0; }
      else if (val <= 6) { grade = 'B+'; score = 3.5; }
      else if (val <= 7) { grade = 'B'; score = 3.0; }
      else if (val <= 8) { grade = 'C+'; score = 2.5; }
      else if (val <= 9) { grade = 'C'; score = 2.0; }
      else if (val <= 10) { grade = 'D'; score = 1.5; }
      else { grade = 'E'; score = 1.0; }
    } else if (id === '11.2') {
      if (val <= 0) { grade = 'A'; score = 4.0; }
      else if (val <= 1) { grade = 'B+'; score = 3.5; }
      else if (val <= 2) { grade = 'B'; score = 3.0; }
      else if (val <= 3) { grade = 'C+'; score = 2.5; }
      else if (val <= 4) { grade = 'C'; score = 2.0; }
      else if (val <= 5) { grade = 'D'; score = 1.5; }
      else { grade = 'E'; score = 1.0; }
    } else if (id === '4') {
      if (val <= 80) { grade = 'A'; score = 4.0; }
      else if (val <= 85) { grade = 'B+'; score = 3.5; }
      else if (val <= 90) { grade = 'B'; score = 3.0; }
      else if (val <= 95) { grade = 'C+'; score = 2.5; }
      else if (val <= 100) { grade = 'C'; score = 2.0; }
      else if (val <= 110) { grade = 'D'; score = 1.5; }
      else { grade = 'E'; score = 1.0; }
    } else if (id === '5.1') {
      if (val <= 6) { grade = 'A'; score = 4.0; }
      else if (val <= 7) { grade = 'B+'; score = 3.5; }
      else if (val <= 8) { grade = 'B'; score = 3.0; }
      else if (val <= 9) { grade = 'C+'; score = 2.5; }
      else if (val <= 10) { grade = 'C'; score = 2.0; }
      else if (val <= 11) { grade = 'D'; score = 1.5; }
      else { grade = 'E'; score = 1.0; }
    } else if (id === '5.2' || id === '8') {
      if (val === 0) { grade = 'A'; score = 4.0; }
      else if (val === 1) { grade = 'B'; score = 3.0; }
      else if (val === 2) { grade = 'C'; score = 2.0; }
      else if (val === 3) { grade = 'D'; score = 1.5; }
      else { grade = 'E'; score = 1.0; }
    } else if (id === '7') {
      if (val <= -5) { grade = 'A'; score = 4.0; }
      else if (val <= -4) { grade = 'B+'; score = 3.5; }
      else if (val <= -3) { grade = 'B'; score = 3.0; }
      else if (val <= -2) { grade = 'C+'; score = 2.5; }
      else if (val <= -1) { grade = 'C'; score = 2.0; }
      else if (val <= 0) { grade = 'D'; score = 1.5; }
      else { grade = 'E'; score = 1.0; }
    } else if (id === '9') {
      if (val >= 100) { grade = 'A'; score = 4.0; }
      else if (val >= 99.8) { grade = 'B+'; score = 3.5; }
      else if (val >= 99.5) { grade = 'B'; score = 3.0; }
      else if (val >= 99.0) { grade = 'C+'; score = 2.5; }
      else if (val >= 98.5) { grade = 'C'; score = 2.0; }
      else if (val >= 98.0) { grade = 'D'; score = 1.5; }
      else { grade = 'E'; score = 1.0; }
    } else if (id === '10' || id === '11.1') {
      if (val >= 28) { grade = 'A'; score = 4.0; }
      else if (val >= 24) { grade = 'B+'; score = 3.5; }
      else if (val >= 20) { grade = 'B'; score = 3.0; }
      else if (val >= 16) { grade = 'C+'; score = 2.5; }
      else if (val >= 12) { grade = 'C'; score = 2.0; }
      else if (val >= 8) { grade = 'D'; score = 1.5; }
      else { grade = 'E'; score = 1.0; }
    }

    return { grade, score };
  };`;

  result = result.substring(0, startIndex) + kpisGradingReplacement + result.substring(endIndex);

  // Replacement 3: Modify handleSaveEditKpi for formatted target and unit
  const targetSaveKpi = `    const updatedMonthData = kpis[selectedMonth].map(item => {
      if (item.id === editingKpi.id) {
        const updatedItem: any = {
          ...item,
          id: editId,
          name: editName,
          formula: editFormula,
          wt: parseFloat(editWt) || 0,
          target: editTarget,
          actual: parseFloat(editActual) || 0
        };`;

  const replaceSaveKpi = `    const updatedMonthData = kpis[selectedMonth].map(item => {
      if (item.id === editingKpi.id) {
        const formattedTarget = editUnit === '%' ? \`\${editTarget}\${editUnit}\` : \`\${editTarget} \${editUnit}\`;
        const updatedItem: any = {
          ...item,
          id: editId,
          name: editName,
          formula: editFormula,
          wt: parseFloat(editWt) || 0,
          target: formattedTarget,
          unit: editUnit,
          actual: parseFloat(editActual) || 0
        };`;

  if (!result.includes(targetSaveKpi)) throw new Error('Failed to match targetSaveKpi');
  result = result.replace(targetSaveKpi, replaceSaveKpi);

  // Replacement 4: Edit button onClick logic for target value stripping
  const targetEditButton = `                                  setEditingKpi(kpi);
                                  setEditName(kpi.name);
                                  setEditFormula(kpi.formula || '');
                                  setEditWt(kpi.wt.toString());
                                  setEditTarget(kpi.target);
                                  setEditActual(kpi.actual.toString());`;

  const replaceEditButton = `                                  setEditingKpi(kpi);
                                  setEditName(kpi.name);
                                  setEditFormula(kpi.formula || '');
                                  setEditWt(kpi.wt.toString());
                                  
                                  // Strip unit suffix if target ends with it
                                  let targetVal = kpi.target;
                                  if (kpi.unit && targetVal.endsWith(kpi.unit)) {
                                    targetVal = targetVal.slice(0, -kpi.unit.length).trim();
                                  }
                                  setEditTarget(targetVal);
                                  setEditUnit(kpi.unit || '%');
                                  
                                  setEditActual(kpi.actual.toString());`;

  if (!result.includes(targetEditButton)) throw new Error('Failed to match targetEditButton');
  result = result.replace(targetEditButton, replaceEditButton);

  // Replacement 5: Add Unit dropdown to target/weight inputs grid
  const targetModalGrid = `              <div className="grid grid-cols-2 gap-4">
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
              </div>`;

  const replaceModalGrid = `              <div className="grid grid-cols-3 gap-4">
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
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">หน่วยนับ (Unit)</label>
                  <select 
                    value={editUnit} 
                    onChange={(e) => setEditUnit(e.target.value)}
                    className="glass-input text-xs w-full bg-white dark:bg-warehouse-slate"
                  >
                    <option value="%">%</option>
                    <option value="พาเลท">พาเลท</option>
                    <option value="เคส">เคส</option>
                    <option value="ครั้ง">ครั้ง</option>
                    <option value="ฉบับ">ฉบับ</option>
                    <option value="เรื่อง">เรื่อง</option>
                  </select>
                </div>
              </div>`;

  if (!result.includes(targetModalGrid)) throw new Error('Failed to match targetModalGrid');
  result = result.replace(targetModalGrid, replaceModalGrid);

  // Replacement 6: Replace dynamic Radar & Bar charts with monthly trend graph
  // Let's find from "{/* KPI Chart Visuals Split */}" to the next "{/* Tab Switcher */}" or activeTab switcher
  const startChart = '{/* KPI Chart Visuals Split */}';
  const endChart = '{/* Switcher Tabs */}';
  
  const startChartIndex = result.indexOf(startChart);
  const endChartIndex = result.indexOf(endChart);
  
  if (startChartIndex === -1 || endChartIndex === -1) {
    throw new Error('Failed to find start or end index of chart visuals block');
  }

  const chartReplacement = `{/* KPI Chart Visuals Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Radar chart left card */}
        <GlassCard className="h-[400px] flex flex-col p-6">
          <div className="mb-4">
            <h4 className="font-bold text-sm text-slate-800 dark:text-white">วิเคราะห์แนวโน้มแผนก (KPI Trend Analyst)</h4>
            <p className="text-xs text-slate-400 mt-0.5">เลือกตัวชี้วัดเพื่อดูสรุปผลสถิติและเปรียบเทียบในแต่ละเดือน</p>
          </div>
          
          <div className="flex-1 flex flex-col justify-between gap-4">
            <div className="flex flex-col gap-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase">เลือกตัวชี้วัด (Select KPI):</span>
              <select
                value={trendKpiId}
                onChange={(e) => setTrendKpiId(e.target.value)}
                className="glass-input text-xs w-full bg-white dark:bg-warehouse-slate py-2 px-3"
              >
                {kpis[selectedMonth]?.map(k => (
                  <option key={k.id} value={k.id}>
                    [{k.id}] {k.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="p-4 bg-slate-100/50 dark:bg-white/5 border border-slate-200/30 dark:border-white/5 rounded-2xl flex flex-col gap-3">
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">ตัวชี้วัดที่เลือก</p>
                <h5 className="text-xs font-extrabold text-warehouse-orange mt-0.5 line-clamp-2">
                  {kpis[selectedMonth]?.find(k => k.id === trendKpiId)?.name}
                </h5>
              </div>
              <div className="grid grid-cols-2 gap-4 border-t border-slate-200/30 dark:border-white/5 pt-3">
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">หน่วยนับ</p>
                  <p className="text-xs font-black text-slate-800 dark:text-white mt-0.5">
                    {kpis[selectedMonth]?.find(k => k.id === trendKpiId)?.unit || '-'}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">ค่าเฉลี่ยสะสม</p>
                  <p className="text-xs font-black text-slate-800 dark:text-white mt-0.5">
                    {(() => {
                      const values = Object.keys(kpis).map(m => kpis[m].find(k => k.id === trendKpiId)?.actual).filter(v => v !== undefined) as number[];
                      return values.length > 0 ? (values.reduce((sum, v) => sum + v, 0) / values.length).toFixed(1) : '0';
                    })()} {kpis[selectedMonth]?.find(k => k.id === trendKpiId)?.unit}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Bar comparison chart */}
        <GlassCard className="lg:col-span-2 h-[400px] flex flex-col p-6" delay={0.15}>
          <div className="mb-4">
            <h4 className="font-bold text-sm text-slate-800 dark:text-white">กราฟแสดงแนวโน้มรายเดือน (Monthly Trend Graph)</h4>
            <p className="text-xs text-slate-400 mt-0.5">กราฟแสดงความก้าวหน้าผลงานจริงเทียบกับค่าเป้าหมายของแต่ละเดือน</p>
          </div>
          <div className="flex-1 w-full text-xs">
            <ResponsiveContainer width="100%" height="90%">
              <AreaChart
                data={(() => {
                  const monthsOrder = ['April', 'May', 'June'];
                  const thaiMonthMap: Record<string, string> = {
                    'April': 'เมษายน',
                    'May': 'พฤษภาคม',
                    'June': 'มิถุนายน'
                  };
                  
                  const allMonths = Object.keys(kpis).sort((a, b) => {
                    const idxA = monthsOrder.indexOf(a);
                    const idxB = monthsOrder.indexOf(b);
                    if (idxA === -1 && idxB === -1) return a.localeCompare(b);
                    if (idxA === -1) return 1;
                    if (idxB === -1) return -1;
                    return idxA - idxB;
                  });

                  return allMonths.map(m => {
                    const item = kpis[m].find(k => k.id === trendKpiId);
                    let targetVal = 0;
                    if (item) {
                      const cleanTarget = item.target.replace(/[^\d.-]/g, '');
                      targetVal = parseFloat(cleanTarget) || 0;
                    }
                    return {
                      month: thaiMonthMap[m] || m,
                      'ผลงานจริง': item ? item.actual : 0,
                      'เป้าหมาย': targetVal
                    };
                  });
                })()}
                margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F97316" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#F97316" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorTarget" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" className="dark:stroke-slate-800" />
                <XAxis dataKey="month" tickLine={false} stroke="#94A3B8" />
                <YAxis axisLine={false} tickLine={false} stroke="#94A3B8" />
                <Tooltip contentStyle={{ borderRadius: '12px', background: 'rgba(30, 41, 59, 0.95)', border: 'none', color: '#fff' }} />
                <Legend wrapperStyle={{ fontSize: 10 }} />
                <Area type="monotone" dataKey="ผลงานจริง" stroke="#F97316" strokeWidth={2.5} fillOpacity={1} fill="url(#colorActual)" />
                <Area type="monotone" dataKey="เป้าหมาย" stroke="#3B82F6" strokeWidth={2} strokeDasharray="5 5" fillOpacity={1} fill="url(#colorTarget)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </div>

      `;

  result = result.substring(0, startChartIndex) + chartReplacement + result.substring(endChartIndex);

  // Replacement 7: Add delete month button and handleDeleteMonth function
  // Let's add handleDeleteMonth function. We can find "const handleAddMonthKpi" and add handleDeleteMonth right above it.
  const targetAddMonthFunc = `  const handleAddMonthKpi = (e: React.FormEvent) => {`;
  const replaceAddMonthFunc = `  const handleDeleteMonth = (monthName: string) => {
    if (window.confirm(\`คุณแน่ใจหรือไม่ว่าต้องการลบข้อมูลเดือน "\${monthName}"?\`)) {
      const updatedKpis = { ...kpis };
      delete updatedKpis[monthName];
      setKpis(updatedKpis);
      localStorage.setItem('swan_kpis', JSON.stringify(updatedKpis));
      
      // If the deleted month was currently selected, fall back to the first available month
      if (selectedMonth === monthName) {
        const remainingMonths = Object.keys(updatedKpis);
        if (remainingMonths.length > 0) {
          setSelectedMonth(remainingMonths[0]);
        }
      }
    }
  };

  const handleAddMonthKpi = (e: React.FormEvent) => {`;

  if (!result.includes(targetAddMonthFunc)) throw new Error('Failed to match targetAddMonthFunc');
  result = result.replace(targetAddMonthFunc, replaceAddMonthFunc);

  // Replacement 8: Add the "Delete Month" button UI next to selectedMonth select dropdown
  const targetDropdownRow = `              {/* Month Selector */}
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
                </div>`;

  const replaceDropdownRow = `              {/* Month Selector */}
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
                  
                  {/* Delete month button */}
                  {selectedMonth !== 'June' && selectedMonth !== 'May' && selectedMonth !== 'April' && (
                    <button
                      onClick={() => handleDeleteMonth(selectedMonth)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-red-200/50 hover:bg-red-50 dark:hover:bg-red-950/20 text-red-600 dark:text-red-400 text-xs font-bold transition-all"
                      title="ลบเดือนประเมินนี้"
                    >
                      <Trash2 size={13} />
                      <span>ลบเดือน</span>
                    </button>
                  )}
                </div>`;

  if (!result.includes(targetDropdownRow)) throw new Error('Failed to match targetDropdownRow');
  result = result.replace(targetDropdownRow, replaceDropdownRow);

  // 3. Write the merged clean result back to page.tsx
  console.log('Writing clean merged content back to page.tsx...');
  fs.writeFileSync(filePath, result, 'utf8');
  console.log('Successfully wrote clean Thai file!');

} catch (err) {
  console.error('Error during merge:', err.message);
  process.exit(1);
}
