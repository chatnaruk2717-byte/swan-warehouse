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
  const [editUnit, setEditUnit] = useState('%');
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
      { id: '1.1', name: 'à¸�à¸²à¸£à¸ˆà¹ˆà¸²à¸¢à¸ªà¸´à¸™à¸„à¹‰à¸²à¸­à¸­à¸�à¸•à¸²à¸¡à¸¥à¸³à¸”à¸±à¸š FIFO 100%', formula: '(à¸ˆà¸³à¸™à¸§à¸™à¸£à¸²à¸¢à¸�à¸²à¸£à¸—à¸µà¹ˆà¸ˆà¹ˆà¸²à¸¢à¸•à¸£à¸‡à¸•à¸²à¸¡ FIFO / à¸ˆà¸³à¸™à¸§à¸™à¸£à¸²à¸¢à¸�à¸²à¸£à¸ˆà¹ˆà¸²à¸¢à¸—à¸±à¹‰à¸‡à¸«à¸¡à¸”) x 100', wt: 15.0, target: '98%', actual: 98.2, unit: '%', category: 'FIFO' },
      { id: '1.2', name: 'à¸ˆà¸³à¸™à¸§à¸™à¸žà¸²à¹€à¸¥à¸—à¹€à¸¨à¸©à¹„à¸”à¹‰à¸£à¸±à¸šà¸�à¸²à¸£à¸ˆà¸±à¸”à¸�à¸¥à¸¸à¹ˆà¸¡ GEN', formula: '(à¸žà¸²à¹€à¸¥à¸—à¹€à¸¨à¸©à¸—à¸µà¹ˆà¸ˆà¸±à¸”à¸�à¸¥à¸¸à¹ˆà¸¡ / à¸žà¸²à¹€à¸¥à¸—à¹€à¸¨à¸©à¸—à¸±à¹‰à¸‡à¸«à¸¡à¸” 326 PL) x 100', wt: 2.5, target: '65 à¸žà¸²à¹€à¸¥à¸—', actual: 68, unit: 'à¸žà¸²à¹€à¸¥à¸—', category: 'FIFO' },
      { id: '1.3', name: 'à¸ˆà¸³à¸™à¸§à¸™à¸žà¸²à¹€à¸¥à¸—à¹€à¸¨à¸©à¹„à¸”à¹‰à¸£à¸±à¸šà¸�à¸²à¸£à¸ˆà¸±à¸”à¸�à¸¥à¸¸à¹ˆà¸¡ 3PCS/Jui', formula: '(à¸žà¸²à¹€à¸¥à¸—à¹€à¸¨à¸©à¸—à¸µà¹ˆà¸ˆà¸±à¸”à¸�à¸¥à¸¸à¹ˆà¸¡ / à¸žà¸²à¹€à¸¥à¸—à¹€à¸¨à¸©à¸—à¸±à¹‰à¸‡à¸«à¸¡à¸” 17 PL) x 100', wt: 2.5, target: '3.4 à¸žà¸²à¹€à¸¥à¸—', actual: 3, unit: 'à¸žà¸²à¹€à¸¥à¸—', category: 'FIFO' },
      { id: '1.4', name: 'à¸ˆà¸³à¸™à¸§à¸™à¸žà¸²à¹€à¸¥à¸—à¹€à¸¨à¸©à¹„à¸”à¹‰à¸£à¸±à¸šà¸�à¸²à¸£à¸ˆà¸±à¸”à¸�à¸¥à¸¸à¹ˆà¸¡ 2PCS', formula: '(à¸žà¸²à¹€à¸¥à¸—à¹€à¸¨à¸©à¸—à¸µà¹ˆà¸ˆà¸±à¸”à¸�à¸¥à¸¸à¹ˆà¸¡ / à¸žà¸²à¹€à¸¥à¸—à¹€à¸¨à¸©à¸—à¸±à¹‰à¸‡à¸«à¸¡à¸” 42 PL) x 100', wt: 2.5, target: '8.4 à¸žà¸²à¹€à¸¥à¸—', actual: 9, unit: 'à¸žà¸²à¹€à¸¥à¸—', category: 'FIFO' },
      { id: '1.5', name: 'à¸ˆà¸³à¸™à¸§à¸™à¸žà¸²à¹€à¸¥à¸—à¹€à¸¨à¸©à¹„à¸”à¹‰à¸£à¸±à¸šà¸�à¸²à¸£à¸ˆà¸±à¸”à¸�à¸¥à¸¸à¹ˆà¸¡ EOE', formula: '(à¸žà¸²à¹€à¸¥à¸—à¹€à¸¨à¸©à¸—à¸µà¹ˆà¸ˆà¸±à¸”à¸�à¸¥à¸¸à¹ˆà¸¡ / à¸žà¸²à¹€à¸¥à¸—à¹€à¸¨à¸©à¸—à¸±à¹‰à¸‡à¸«à¸¡à¸” 35 PL) x 100', wt: 2.5, target: '7 à¸žà¸²à¹€à¸¥à¸—', actual: 6, unit: 'à¸žà¸²à¹€à¸¥à¸—', category: 'FIFO' },
      { id: '2', name: '% On time Delivery = 100% (à¸§à¸²à¸‡à¹�à¸œà¸™, à¸„à¸¥à¸±à¸‡à¸ªà¸´à¸™à¸„à¹‰à¸², à¸‚à¸™à¸ªà¹ˆà¸‡)', formula: '(à¸ˆà¸³à¸™à¸§à¸™à¸£à¸²à¸¢à¸�à¸²à¸£à¸ªà¹ˆà¸‡à¸¡à¸­à¸šà¸•à¸£à¸‡à¹€à¸§à¸¥à¸² / à¸ˆà¸³à¸™à¸§à¸™à¸ˆà¸±à¸”à¸ªà¹ˆà¸‡à¸—à¸±à¹‰à¸‡à¸«à¸¡à¸”) x 100', wt: 10.0, target: '100%', actual: 99.1, unit: '%', category: 'Delivery' },
      { id: '3', name: 'C-CAR (à¸„à¸¥à¸±à¸‡à¸ªà¸´à¸™à¸„à¹‰à¸²+à¸‚à¸™à¸ªà¹ˆà¸‡)', formula: 'Major + Minor à¸¥à¸”à¸¥à¸‡ 50% (à¸‚à¹‰à¸­à¸¡à¸¹à¸¥à¸­à¸´à¸‡à¸ˆà¸²à¸�à¸›à¸µ 2024 = 16 à¸‰à¸šà¸±à¸š)', wt: 5.0, target: '5 à¸‰à¸šà¸±à¸š', actual: 6, unit: 'à¸‰à¸šà¸±à¸š', category: 'Quality' },
      { id: '4', name: 'Waste à¸¥à¸”à¸‚à¸­à¸‡à¹€à¸ªà¸µà¸¢à¸—à¸µà¹ˆà¹€à¸�à¸´à¸”à¸ˆà¸²à¸�à¸�à¸£à¸°à¸šà¸§à¸™à¸�à¸²à¸£à¸„à¸¥à¸±à¸‡à¸ªà¸´à¸™à¸„à¹‰à¸²', formula: 'à¸¥à¸”à¸¥à¸‡ 50% (à¹€à¸›à¹‰à¸²à¸«à¸¡à¸²à¸¢à¸ªà¸°à¸ªà¸¡à¸•à¹ˆà¸­à¸›à¸µà¹„à¸¡à¹ˆà¹€à¸�à¸´à¸™ 80 à¸žà¸²à¹€à¸¥à¸—)', wt: 5.0, target: '<=80 à¸žà¸²à¹€à¸¥à¸—', actual: 78, unit: 'à¸žà¸²à¹€à¸¥à¸—', category: 'Quality' },
      { id: '5.1', name: 'à¸­à¸¸à¸šà¸±à¸•à¸´à¹€à¸«à¸•à¸¸à¸�à¸¥à¹ˆà¸­à¸‡à¹‚à¸«à¸¥à¸”à¸¥à¹‰à¸¡à¸ªà¸°à¸ªà¸¡', formula: 'à¸­à¸¸à¸šà¸±à¸•à¸´à¹€à¸«à¸•à¸¸à¸ªà¸°à¸ªà¸¡à¸‚à¸­à¸‡à¸�à¸¥à¹ˆà¸­à¸‡ = 0 PL (à¸›à¸µ 2025 = 13 PL)', wt: 5.0, target: '6 à¸„à¸£à¸±à¹‰à¸‡', actual: 6, unit: 'à¸„à¸£à¸±à¹‰à¸‡', category: 'Safety' },
      { id: '5.2', name: 'à¸­à¸¸à¸šà¸±à¸•à¸´à¹€à¸«à¸•à¸¸à¸�à¸²à¸£à¸—à¸³à¸‡à¸²à¸™', formula: 'à¸­à¸¸à¸šà¸±à¸•à¸´à¹€à¸«à¸•à¸¸à¸—à¸µà¹ˆà¸¡à¸µà¹€à¸­à¸�à¸ªà¸²à¸£à¸ªà¸­à¸šà¸ªà¸§à¸™à¸„à¸§à¸²à¸¡à¸›à¸¥à¸­à¸”à¸ à¸±à¸¢à¸ˆà¸²à¸� à¸ˆà¸›. = 0 à¸„à¸£à¸±à¹‰à¸‡', wt: 5.0, target: '0 à¸„à¸£à¸±à¹‰à¸‡', actual: 0, unit: 'à¸„à¸£à¸±à¹‰à¸‡', category: 'Safety' },
      { id: '7', name: 'Operation Cost +-5%', formula: 'Actual Sales unit (can+eoe+sot) / à¸„à¹ˆà¸²à¹ƒà¸Šà¹‰à¸ˆà¹ˆà¸²à¸¢à¸ˆà¸£à¸´à¸‡ x 100', wt: 10.0, target: '-5.00%', actual: -5.1, unit: '%', category: 'Cost' },
      { id: '8', name: 'à¸ˆà¸³à¸™à¸§à¸™à¸£à¸²à¸¢à¸�à¸²à¸£à¸—à¸µà¹ˆ Adjust à¹ƒà¸™à¸£à¸°à¸šà¸š ERP (à¸•à¹ˆà¸­à¹€à¸”à¸·à¸­à¸™)', formula: 'à¸�à¸²à¸£ Adjust = 0 à¸„à¸£à¸±à¹‰à¸‡/à¸•à¸¹à¹‰ (à¸£à¸§à¸¡à¸—à¸¸à¸�à¸„à¸¥à¸±à¸‡à¸ªà¸´à¸™à¸„à¹‰à¸²)', wt: 5.0, target: '0 à¸„à¸£à¸±à¹‰à¸‡', actual: 1, unit: 'à¸„à¸£à¸±à¹‰à¸‡', category: 'System' },
      { id: '9', name: 'à¸„à¸§à¸²à¸¡à¸–à¸¹à¸�à¸•à¹‰à¸­à¸‡à¸‚à¸­à¸‡à¸�à¸²à¸£à¸ˆà¸±à¸”à¸ªà¸´à¸™à¸„à¹‰à¸²à¹€à¸žà¸·à¹ˆà¸­à¸ˆà¸±à¸”à¸ªà¹ˆà¸‡', formula: 'à¸ˆà¸³à¸™à¸§à¸™ Job à¸‡à¸²à¸™à¸–à¸¹à¸�à¸•à¹‰à¸­à¸‡ / à¸ˆà¸³à¸™à¸§à¸™ Job à¸‡à¸²à¸™à¸—à¸±à¹‰à¸‡à¸«à¸¡à¸” x 100', wt: 5.0, target: '100.00%', actual: 100.0, unit: '%', category: 'Quality' },
      { id: '10', name: 'à¸ˆà¸³à¸™à¸§à¸™à¸�à¸´à¸ˆà¸�à¸£à¸£à¸¡ FI/Kaizen à¸—à¸µà¹ˆà¸ªà¸³à¹€à¸£à¹‡à¸ˆà¹�à¸¥à¸°à¸™à¸³à¹„à¸›à¹ƒà¸Šà¹‰à¸ˆà¸£à¸´à¸‡', formula: 'à¸�à¸´à¸ˆà¸�à¸£à¸£à¸¡à¸›à¸£à¸°à¸”à¸´à¸©à¸�à¹Œà¸™à¸§à¸±à¸•à¸�à¸£à¸£à¸¡/à¸�à¸²à¸£à¸›à¸£à¸±à¸šà¸›à¸£à¸¸à¸‡à¸‡à¸²à¸™ (à¸ªà¸°à¸ªà¸¡à¸•à¹ˆà¸­à¸›à¸µ)', wt: 10.0, target: '12 à¹€à¸£à¸·à¹ˆà¸­à¸‡', actual: 11, unit: 'à¹€à¸£à¸·à¹ˆà¸­à¸‡', category: 'Improvement' },
      { id: '11.1', name: 'à¸œà¸¥à¸›à¸£à¸°à¹€à¸¡à¸´à¸™ 5S & Work Instruction (WI)', formula: 'à¸„à¸°à¹�à¸™à¸™à¸�à¸²à¸£à¸œà¹ˆà¸²à¸™à¸›à¸£à¸°à¹€à¸¡à¸´à¸™à¸¡à¸²à¸•à¸£à¸�à¸²à¸™à¸žà¸·à¹‰à¸™à¸—à¸µà¹ˆ 5S à¹�à¸¥à¸°à¸«à¸™à¹‰à¸²à¸‡à¸²à¸™', wt: 10.0, target: '28 à¹€à¸£à¸·à¹ˆà¸­à¸‡', actual: 28, unit: 'à¹€à¸£à¸·à¹ˆà¸­à¸‡', category: '5S' },
      { id: '11.2', name: 'à¸›à¸£à¸°à¹€à¸”à¹‡à¸™à¸—à¸µà¹ˆà¹„à¸¡à¹ˆà¹�à¸�à¹‰à¹„à¸‚', formula: 'à¸ˆà¸³à¸™à¸§à¸™à¸›à¸£à¸°à¹€à¸”à¹‡à¸™à¸„à¹‰à¸²à¸‡à¹�à¸�à¹‰à¹„à¸‚à¹€à¸�à¸´à¸™ 3 à¸§à¸±à¸™', wt: 5.0, target: '0 à¹€à¸„à¸ª', actual: 1, unit: 'à¹€à¸„à¸ª', category: '5S' }
    ],
    'May': [
      { id: '1.1', name: 'à¸�à¸²à¸£à¸ˆà¹ˆà¸²à¸¢à¸ªà¸´à¸™à¸„à¹‰à¸²à¸­à¸­à¸�à¸•à¸²à¸¡à¸¥à¸³à¸”à¸±à¸š FIFO 100%', formula: '(à¸ˆà¸³à¸™à¸§à¸™à¸£à¸²à¸¢à¸�à¸²à¸£à¸—à¸µà¹ˆà¸ˆà¹ˆà¸²à¸¢à¸•à¸£à¸‡à¸•à¸²à¸¡ FIFO / à¸ˆà¸³à¸™à¸§à¸™à¸£à¸²à¸¢à¸�à¸²à¸£à¸ˆà¹ˆà¸²à¸¢à¸—à¸±à¹‰à¸‡à¸«à¸¡à¸”) x 100', wt: 15.0, target: '98%', actual: 97.6, unit: '%', category: 'FIFO' },
      { id: '1.2', name: 'à¸ˆà¸³à¸™à¸§à¸™à¸žà¸²à¹€à¸¥à¸—à¹€à¸¨à¸©à¹„à¸”à¹‰à¸£à¸±à¸šà¸�à¸²à¸£à¸ˆà¸±à¸”à¸�à¸¥à¸¸à¹ˆà¸¡ GEN', formula: '(à¸žà¸²à¹€à¸¥à¸—à¹€à¸¨à¸©à¸—à¸µà¹ˆà¸ˆà¸±à¸”à¸�à¸¥à¸¸à¹ˆà¸¡ / à¸žà¸²à¹€à¸¥à¸—à¹€à¸¨à¸©à¸—à¸±à¹‰à¸‡à¸«à¸¡à¸” 326 PL) x 100', wt: 2.5, target: '65 à¸žà¸²à¹€à¸¥à¸—', actual: 59, unit: 'à¸žà¸²à¹€à¸¥à¸—', category: 'FIFO' },
      { id: '1.3', name: 'à¸ˆà¸³à¸™à¸§à¸™à¸žà¸²à¹€à¸¥à¸—à¹€à¸¨à¸©à¹„à¸”à¹‰à¸£à¸±à¸šà¸�à¸²à¸£à¸ˆà¸±à¸”à¸�à¸¥à¸¸à¹ˆà¸¡ 3PCS/Jui', formula: '(à¸žà¸²à¹€à¸¥à¸—à¹€à¸¨à¸©à¸—à¸µà¹ˆà¸ˆà¸±à¸”à¸�à¸¥à¸¸à¹ˆà¸¡ / à¸žà¸²à¹€à¸¥à¸—à¹€à¸¨à¸©à¸—à¸±à¹‰à¸‡à¸«à¸¡à¸” 17 PL) x 100', wt: 2.5, target: '3.4 à¸žà¸²à¹€à¸¥à¸—', actual: 3, unit: 'à¸žà¸²à¹€à¸¥à¸—', category: 'FIFO' },
      { id: '1.4', name: 'à¸ˆà¸³à¸™à¸§à¸™à¸žà¸²à¹€à¸¥à¸—à¹€à¸¨à¸©à¹„à¸”à¹‰à¸£à¸±à¸šà¸�à¸²à¸£à¸ˆà¸±à¸”à¸�à¸¥à¸¸à¹ˆà¸¡ 2PCS', formula: '(à¸žà¸²à¹€à¸¥à¸—à¹€à¸¨à¸©à¸—à¸µà¹ˆà¸ˆà¸±à¸”à¸�à¸¥à¸¸à¹ˆà¸¡ / à¸žà¸²à¹€à¸¥à¸—à¹€à¸¨à¸©à¸—à¸±à¹‰à¸‡à¸«à¸¡à¸” 42 PL) x 100', wt: 2.5, target: '8.4 à¸žà¸²à¹€à¸¥à¸—', actual: 8, unit: 'à¸žà¸²à¹€à¸¥à¸—', category: 'FIFO' },
      { id: '1.5', name: 'à¸ˆà¸³à¸™à¸§à¸™à¸žà¸²à¹€à¸¥à¸—à¹€à¸¨à¸©à¹„à¸”à¹‰à¸£à¸±à¸šà¸�à¸²à¸£à¸ˆà¸±à¸”à¸�à¸¥à¸¸à¹ˆà¸¡ EOE', formula: '(à¸žà¸²à¹€à¸¥à¸—à¹€à¸¨à¸©à¸—à¸µà¹ˆà¸ˆà¸±à¸”à¸�à¸¥à¸¸à¹ˆà¸¡ / à¸žà¸²à¹€à¸¥à¸—à¹€à¸¨à¸©à¸—à¸±à¹‰à¸‡à¸«à¸¡à¸” 35 PL) x 100', wt: 2.5, target: '7 à¸žà¸²à¹€à¸¥à¸—', actual: 5, unit: 'à¸žà¸²à¹€à¸¥à¸—', category: 'FIFO' },
      { id: '2', name: '% On time Delivery = 100% (à¸§à¸²à¸‡à¹�à¸œà¸™, à¸„à¸¥à¸±à¸‡à¸ªà¸´à¸™à¸„à¹‰à¸², à¸‚à¸™à¸ªà¹ˆà¸‡)', formula: '(à¸ˆà¸³à¸™à¸§à¸™à¸£à¸²à¸¢à¸�à¸²à¸£à¸ªà¹ˆà¸‡à¸¡à¸­à¸šà¸•à¸£à¸‡à¹€à¸§à¸¥à¸² / à¸ˆà¸³à¸™à¸§à¸™à¸ˆà¸±à¸”à¸ªà¹ˆà¸‡à¸—à¸±à¹‰à¸‡à¸«à¸¡à¸”) x 100', wt: 10.0, target: '100%', actual: 98.7, unit: '%', category: 'Delivery' },
      { id: '3', name: 'C-CAR (à¸„à¸¥à¸±à¸‡à¸ªà¸´à¸™à¸„à¹‰à¸²+à¸‚à¸™à¸ªà¹ˆà¸‡)', formula: 'Major + Minor à¸¥à¸”à¸¥à¸‡ 50% (à¸‚à¹‰à¸­à¸¡à¸¹à¸¥à¸­à¸´à¸‡à¸ˆà¸²à¸�à¸›à¸µ 2024 = 16 à¸‰à¸šà¸±à¸š)', wt: 5.0, target: '5 à¸‰à¸šà¸±à¸š', actual: 7, unit: 'à¸‰à¸šà¸±à¸š', category: 'Quality' },
      { id: '4', name: 'Waste à¸¥à¸”à¸‚à¸­à¸‡à¹€à¸ªà¸µà¸¢à¸—à¸µà¹ˆà¹€à¸�à¸´à¸”à¸ˆà¸²à¸�à¸�à¸£à¸°à¸šà¸§à¸™à¸�à¸²à¸£à¸„à¸¥à¸±à¸‡à¸ªà¸´à¸™à¸„à¹‰à¸²', formula: 'à¸¥à¸”à¸¥à¸‡ 50% (à¹€à¸›à¹‰à¸²à¸«à¸¡à¸²à¸¢à¸ªà¸°à¸ªà¸¡à¸•à¹ˆà¸­à¸›à¸µà¹„à¸¡à¹ˆà¹€à¸�à¸´à¸™ 80 à¸žà¸²à¹€à¸¥à¸—)', wt: 5.0, target: '<=80 à¸žà¸²à¹€à¸¥à¸—', actual: 84, unit: 'à¸žà¸²à¹€à¸¥à¸—', category: 'Quality' },
      { id: '5.1', name: 'à¸­à¸¸à¸šà¸±à¸•à¸´à¹€à¸«à¸•à¸¸à¸�à¸¥à¹ˆà¸­à¸‡à¹‚à¸«à¸¥à¸”à¸¥à¹‰à¸¡à¸ªà¸°à¸ªà¸¡', formula: 'à¸­à¸¸à¸šà¸±à¸•à¸´à¹€à¸«à¸•à¸¸à¸ªà¸°à¸ªà¸¡à¸‚à¸­à¸‡à¸�à¸¥à¹ˆà¸­à¸‡ = 0 PL (à¸›à¸µ 2025 = 13 PL)', wt: 5.0, target: '6 à¸„à¸£à¸±à¹‰à¸‡', actual: 7, unit: 'à¸„à¸£à¸±à¹‰à¸‡', category: 'Safety' },
      { id: '5.2', name: 'à¸­à¸¸à¸šà¸±à¸•à¸´à¹€à¸«à¸•à¸¸à¸�à¸²à¸£à¸—à¸³à¸‡à¸²à¸™', formula: 'à¸­à¸¸à¸šà¸±à¸•à¸´à¹€à¸«à¸•à¸¸à¸—à¸µà¹ˆà¸¡à¸µà¹€à¸­à¸�à¸ªà¸²à¸£à¸ªà¸­à¸šà¸ªà¸§à¸™à¸„à¸§à¸²à¸¡à¸›à¸¥à¸­à¸”à¸ à¸±à¸¢à¸ˆà¸²à¸� à¸ˆà¸›. = 0 à¸„à¸£à¸±à¹‰à¸‡', wt: 5.0, target: '0 à¸„à¸£à¸±à¹‰à¸‡', actual: 0, unit: 'à¸„à¸£à¸±à¹‰à¸‡', category: 'Safety' },
      { id: '7', name: 'Operation Cost +-5%', formula: 'Actual Sales unit (can+eoe+sot) / à¸„à¹ˆà¸²à¹ƒà¸Šà¹‰à¸ˆà¹ˆà¸²à¸¢à¸ˆà¸£à¸´à¸‡ x 100', wt: 10.0, target: '-5.00%', actual: -3.2, unit: '%', category: 'Cost' },
      { id: '8', name: 'à¸ˆà¸³à¸™à¸§à¸™à¸£à¸²à¸¢à¸�à¸²à¸£à¸—à¸µà¹ˆ Adjust à¹ƒà¸™à¸£à¸°à¸šà¸š ERP (à¸•à¹ˆà¸­à¹€à¸”à¸·à¸­à¸™)', formula: 'à¸�à¸²à¸£ Adjust = 0 à¸„à¸£à¸±à¹‰à¸‡/à¸•à¸¹à¹‰ (à¸£à¸§à¸¡à¸—à¸¸à¸�à¸„à¸¥à¸±à¸‡à¸ªà¸´à¸™à¸„à¹‰à¸²)', wt: 5.0, target: '0 à¸„à¸£à¸±à¹‰à¸‡', actual: 2, unit: 'à¸„à¸£à¸±à¹‰à¸‡', category: 'System' },
      { id: '9', name: 'à¸„à¸§à¸²à¸¡à¸–à¸¹à¸�à¸•à¹‰à¸­à¸‡à¸‚à¸­à¸‡à¸�à¸²à¸£à¸ˆà¸±à¸”à¸ªà¸´à¸™à¸„à¹‰à¸²à¹€à¸žà¸·à¹ˆà¸­à¸ˆà¸±à¸”à¸ªà¹ˆà¸‡', formula: 'à¸ˆà¸³à¸™à¸§à¸™ Job à¸‡à¸²à¸™à¸–à¸¹à¸�à¸•à¹‰à¸­à¸‡ / à¸ˆà¸³à¸™à¸§à¸™ Job à¸‡à¸²à¸™à¸—à¸±à¹‰à¸‡à¸«à¸¡à¸” x 100', wt: 5.0, target: '100.00%', actual: 99.8, unit: '%', category: 'Quality' },
      { id: '10', name: 'à¸ˆà¸³à¸™à¸§à¸™à¸�à¸´à¸ˆà¸�à¸£à¸£à¸¡ FI/Kaizen à¸—à¸µà¹ˆà¸ªà¸³à¹€à¸£à¹‡à¸ˆà¹�à¸¥à¸°à¸™à¸³à¹„à¸›à¹ƒà¸Šà¹‰à¸ˆà¸£à¸´à¸‡', formula: 'à¸�à¸´à¸ˆà¸�à¸£à¸£à¸¡à¸›à¸£à¸°à¸”à¸´à¸©à¸�à¹Œà¸™à¸§à¸±à¸•à¸�à¸£à¸£à¸¡/à¸�à¸²à¸£à¸›à¸£à¸±à¸šà¸›à¸£à¸¸à¸‡à¸‡à¸²à¸™ (à¸ªà¸°à¸ªà¸¡à¸•à¹ˆà¸­à¸›à¸µ)', wt: 10.0, target: '12 à¹€à¸£à¸·à¹ˆà¸­à¸‡', actual: 10, unit: 'à¹€à¸£à¸·à¹ˆà¸­à¸‡', category: 'Improvement' },
      { id: '11.1', name: 'à¸œà¸¥à¸›à¸£à¸°à¹€à¸¡à¸´à¸™ 5S & Work Instruction (WI)', formula: 'à¸„à¸°à¹�à¸™à¸™à¸�à¸²à¸£à¸œà¹ˆà¸²à¸™à¸›à¸£à¸°à¹€à¸¡à¸´à¸™à¸¡à¸²à¸•à¸£à¸�à¸²à¸™à¸žà¸·à¹‰à¸™à¸—à¸µà¹ˆ 5S à¹�à¸¥à¸°à¸«à¸™à¹‰à¸²à¸‡à¸²à¸™', wt: 10.0, target: '28 à¹€à¸£à¸·à¹ˆà¸­à¸‡', actual: 27, unit: 'à¹€à¸£à¸·à¹ˆà¸­à¸‡', category: '5S' },
      { id: '11.2', name: 'à¸›à¸£à¸°à¹€à¸”à¹‡à¸™à¸—à¸µà¹ˆà¹„à¸¡à¹ˆà¹�à¸�à¹‰à¹„à¸‚', formula: 'à¸ˆà¸³à¸™à¸§à¸™à¸›à¸£à¸°à¹€à¸”à¹‡à¸™à¸„à¹‰à¸²à¸‡à¹�à¸�à¹‰à¹„à¸‚à¹€à¸�à¸´à¸™ 3 à¸§à¸±à¸™', wt: 5.0, target: '0 à¹€à¸„à¸ª', actual: 2, unit: 'à¹€à¸„à¸ª', category: '5S' }
    ],
    'April': [
      { id: '1.1', name: 'à¸�à¸²à¸£à¸ˆà¹ˆà¸²à¸¢à¸ªà¸´à¸™à¸„à¹‰à¸²à¸­à¸­à¸�à¸•à¸²à¸¡à¸¥à¸³à¸”à¸±à¸š FIFO 100%', formula: '(à¸ˆà¸³à¸™à¸§à¸™à¸£à¸²à¸¢à¸�à¸²à¸£à¸—à¸µà¹ˆà¸ˆà¹ˆà¸²à¸¢à¸•à¸£à¸‡à¸•à¸²à¸¡ FIFO / à¸ˆà¸³à¸™à¸§à¸™à¸£à¸²à¸¢à¸�à¸²à¸£à¸ˆà¹ˆà¸²à¸¢à¸—à¸±à¹‰à¸‡à¸«à¸¡à¸”) x 100', wt: 15.0, target: '98%', actual: 95.8, unit: '%', category: 'FIFO' },
      { id: '1.2', name: 'à¸ˆà¸³à¸™à¸§à¸™à¸žà¸²à¹€à¸¥à¸—à¹€à¸¨à¸©à¹„à¸”à¹‰à¸£à¸±à¸šà¸�à¸²à¸£à¸ˆà¸±à¸”à¸�à¸¥à¸¸à¹ˆà¸¡ GEN', formula: '(à¸žà¸²à¹€à¸¥à¸—à¹€à¸¨à¸©à¸—à¸µà¹ˆà¸ˆà¸±à¸”à¸�à¸¥à¸¸à¹ˆà¸¡ / à¸žà¸²à¹€à¸¥à¸—à¹€à¸¨à¸©à¸—à¸±à¹‰à¸‡à¸«à¸¡à¸” 326 PL) x 100', wt: 2.5, target: '65 à¸žà¸²à¹€à¸¥à¸—', actual: 50, unit: 'à¸žà¸²à¹€à¸¥à¸—', category: 'FIFO' },
      { id: '1.3', name: 'à¸ˆà¸³à¸™à¸§à¸™à¸žà¸²à¹€à¸¥à¸—à¹€à¸¨à¸©à¹„à¸”à¹‰à¸£à¸±à¸šà¸�à¸²à¸£à¸ˆà¸±à¸”à¸�à¸¥à¸¸à¹ˆà¸¡ 3PCS/Jui', formula: '(à¸žà¸²à¹€à¸¥à¸—à¹€à¸¨à¸©à¸—à¸µà¹ˆà¸ˆà¸±à¸”à¸�à¸¥à¸¸à¹ˆà¸¡ / à¸žà¸²à¹€à¸¥à¸—à¹€à¸¨à¸©à¸—à¸±à¹‰à¸‡à¸«à¸¡à¸” 17 PL) x 100', wt: 2.5, target: '3.4 à¸žà¸²à¹€à¸¥à¸—', actual: 2, unit: 'à¸žà¸²à¹€à¸¥à¸—', category: 'FIFO' },
      { id: '1.4', name: 'à¸ˆà¸³à¸™à¸§à¸™à¸žà¸²à¹€à¸¥à¸—à¹€à¸¨à¸©à¹„à¸”à¹‰à¸£à¸±à¸šà¸�à¸²à¸£à¸ˆà¸±à¸”à¸�à¸¥à¸¸à¹ˆà¸¡ 2PCS', formula: '(à¸žà¸²à¹€à¸¥à¸—à¹€à¸¨à¸©à¸—à¸µà¹ˆà¸ˆà¸±à¸”à¸�à¸¥à¸¸à¹ˆà¸¡ / à¸žà¸²à¹€à¸¥à¸—à¹€à¸¨à¸©à¸—à¸±à¹‰à¸‡à¸«à¸¡à¸” 42 PL) x 100', wt: 2.5, target: '8.4 à¸žà¸²à¹€à¸¥à¸—', actual: 7, unit: 'à¸žà¸²à¹€à¸¥à¸—', category: 'FIFO' },
      { id: '1.5', name: 'à¸ˆà¸³à¸™à¸§à¸™à¸žà¸²à¹€à¸¥à¸—à¹€à¸¨à¸©à¹„à¸”à¹‰à¸£à¸±à¸šà¸�à¸²à¸£à¸ˆà¸±à¸”à¸�à¸¥à¸¸à¹ˆà¸¡ EOE', formula: '(à¸žà¸²à¹€à¸¥à¸—à¹€à¸¨à¸©à¸—à¸µà¹ˆà¸ˆà¸±à¸”à¸�à¸¥à¸¸à¹ˆà¸¡ / à¸žà¸²à¹€à¸¥à¸—à¹€à¸¨à¸©à¸—à¸±à¹‰à¸‡à¸«à¸¡à¸” 35 PL) x 100', wt: 2.5, target: '7 à¸žà¸²à¹€à¸¥à¸—', actual: 4, unit: 'à¸žà¸²à¹€à¸¥à¸—', category: 'FIFO' },
      { id: '2', name: '% On time Delivery = 100% (à¸§à¸²à¸‡à¹�à¸œà¸™, à¸„à¸¥à¸±à¸‡à¸ªà¸´à¸™à¸„à¹‰à¸², à¸‚à¸™à¸ªà¹ˆà¸‡)', formula: '(à¸ˆà¸³à¸™à¸§à¸™à¸£à¸²à¸¢à¸�à¸²à¸£à¸ªà¹ˆà¸‡à¸¡à¸­à¸šà¸•à¸£à¸‡à¹€à¸§à¸¥à¸² / à¸ˆà¸³à¸™à¸§à¸™à¸ˆà¸±à¸”à¸ªà¹ˆà¸‡à¸—à¸±à¹‰à¸‡à¸«à¸¡à¸”) x 100', wt: 10.0, target: '100%', actual: 96.8, unit: '%', category: 'Delivery' },
      { id: '3', name: 'C-CAR (à¸„à¸¥à¸±à¸‡à¸ªà¸´à¸™à¸„à¹‰à¸²+à¸‚à¸™à¸ªà¹ˆà¸‡)', formula: 'Major + Minor à¸¥à¸”à¸¥à¸‡ 50% (à¸‚à¹‰à¸­à¸¡à¸¹à¸¥à¸­à¸´à¸‡à¸ˆà¸²à¸�à¸›à¸µ 2024 = 16 à¸‰à¸šà¸±à¸š)', wt: 5.0, target: '5 à¸‰à¸šà¸±à¸š', actual: 9, unit: 'à¸‰à¸šà¸±à¸š', category: 'Quality' },
      { id: '4', name: 'Waste à¸¥à¸”à¸‚à¸­à¸‡à¹€à¸ªà¸µà¸¢à¸—à¸µà¹ˆà¹€à¸�à¸´à¸”à¸ˆà¸²à¸�à¸�à¸£à¸°à¸šà¸§à¸™à¸�à¸²à¸£à¸„à¸¥à¸±à¸‡à¸ªà¸´à¸™à¸„à¹‰à¸²', formula: 'à¸¥à¸”à¸¥à¸‡ 50% (à¹€à¸›à¹‰à¸²à¸«à¸¡à¸²à¸¢à¸ªà¸°à¸ªà¸¡à¸•à¹ˆà¸­à¸›à¸µà¹„à¸¡à¹ˆà¹€à¸�à¸´à¸™ 80 à¸žà¸²à¹€à¸¥à¸—)', wt: 5.0, target: '<=80 à¸žà¸²à¹€à¸¥à¸—', actual: 105, unit: 'à¸žà¸²à¹€à¸¥à¸—', category: 'Quality' },
      { id: '5.1', name: 'à¸­à¸¸à¸šà¸±à¸•à¸´à¹€à¸«à¸•à¸¸à¸�à¸¥à¹ˆà¸­à¸‡à¹‚à¸«à¸¥à¸”à¸¥à¹‰à¸¡à¸ªà¸°à¸ªà¸¡', formula: 'à¸­à¸¸à¸šà¸±à¸•à¸´à¹€à¸«à¸•à¸¸à¸ªà¸°à¸ªà¸¡à¸‚à¸­à¸‡à¸�à¸¥à¹ˆà¸­à¸‡ = 0 PL (à¸›à¸µ 2025 = 13 PL)', wt: 5.0, target: '6 à¸„à¸£à¸±à¹‰à¸‡', actual: 8, unit: 'à¸„à¸£à¸±à¹‰à¸‡', category: 'Safety' },
      { id: '5.2', name: 'à¸­à¸¸à¸šà¸±à¸•à¸´à¹€à¸«à¸•à¸¸à¸�à¸²à¸£à¸—à¸³à¸‡à¸²à¸™', formula: 'à¸­à¸¸à¸šà¸±à¸•à¸´à¹€à¸«à¸•à¸¸à¸—à¸µà¹ˆà¸¡à¸µà¹€à¸­à¸�à¸ªà¸²à¸£à¸ªà¸­à¸šà¸ªà¸§à¸™à¸„à¸§à¸²à¸¡à¸›à¸¥à¸­à¸”à¸ à¸±à¸¢à¸ˆà¸²à¸� à¸ˆà¸›. = 0 à¸„à¸£à¸±à¹‰à¸‡', wt: 5.0, target: '0 à¸„à¸£à¸±à¹‰à¸‡', actual: 1, unit: 'à¸„à¸£à¸±à¹‰à¸‡', category: 'Safety' },
      { id: '7', name: 'Operation Cost +-5%', formula: 'Actual Sales unit (can+eoe+sot) / à¸„à¹ˆà¸²à¹ƒà¸Šà¹‰à¸ˆà¹ˆà¸²à¸¢à¸ˆà¸£à¸´à¸‡ x 100', wt: 10.0, target: '-5.00%', actual: 1.2, unit: '%', category: 'Cost' },
      { id: '8', name: 'à¸ˆà¸³à¸™à¸§à¸™à¸£à¸²à¸¢à¸�à¸²à¸£à¸—à¸µà¹ˆ Adjust à¹ƒà¸™à¸£à¸°à¸šà¸š ERP (à¸•à¹ˆà¸­à¹€à¸”à¸·à¸­à¸™)', formula: 'à¸�à¸²à¸£ Adjust = 0 à¸„à¸£à¸±à¹‰à¸‡/à¸•à¸¹à¹‰ (à¸£à¸§à¸¡à¸—à¸¸à¸�à¸„à¸¥à¸±à¸‡à¸ªà¸´à¸™à¸„à¹‰à¸²)', wt: 5.0, target: '0 à¸„à¸£à¸±à¹‰à¸‡', actual: 3, unit: 'à¸„à¸£à¸±à¹‰à¸‡', category: 'System' },
      { id: '9', name: 'à¸„à¸§à¸²à¸¡à¸–à¸¹à¸�à¸•à¹‰à¸­à¸‡à¸‚à¸­à¸‡à¸�à¸²à¸£à¸ˆà¸±à¸”à¸ªà¸´à¸™à¸„à¹‰à¸²à¹€à¸žà¸·à¹ˆà¸­à¸ˆà¸±à¸”à¸ªà¹ˆà¸‡', formula: 'à¸ˆà¸³à¸™à¸§à¸™ Job à¸‡à¸²à¸™à¸–à¸¹à¸�à¸•à¹‰à¸­à¸‡ / à¸ˆà¸³à¸™à¸§à¸™ Job à¸‡à¸²à¸™à¸—à¸±à¹‰à¸‡à¸«à¸¡à¸” x 100', wt: 5.0, target: '100.00%', actual: 98.4, unit: '%', category: 'Quality' },
      { id: '10', name: 'à¸ˆà¸³à¸™à¸§à¸™à¸�à¸´à¸ˆà¸�à¸£à¸£à¸¡ FI/Kaizen à¸—à¸µà¹ˆà¸ªà¸³à¹€à¸£à¹‡à¸ˆà¹�à¸¥à¸°à¸™à¸³à¹„à¸›à¹ƒà¸Šà¹‰à¸ˆà¸£à¸´à¸‡', formula: 'à¸�à¸´à¸ˆà¸�à¸£à¸£à¸¡à¸›à¸£à¸°à¸”à¸´à¸©à¸�à¹Œà¸™à¸§à¸±à¸•à¸�à¸£à¸£à¸¡/à¸�à¸²à¸£à¸›à¸£à¸±à¸šà¸›à¸£à¸¸à¸‡à¸‡à¸²à¸™ (à¸ªà¸°à¸ªà¸¡à¸•à¹ˆà¸­à¸›à¸µ)', wt: 10.0, target: '12 à¹€à¸£à¸·à¹ˆà¸­à¸‡', actual: 8, unit: 'à¹€à¸£à¸·à¹ˆà¸­à¸‡', category: 'Improvement' },
      { id: '11.1', name: 'à¸œà¸¥à¸›à¸£à¸°à¹€à¸¡à¸´à¸™ 5S & Work Instruction (WI)', formula: 'à¸„à¸°à¹�à¸™à¸™à¸�à¸²à¸£à¸œà¹ˆà¸²à¸™à¸›à¸£à¸°à¹€à¸¡à¸´à¸™à¸¡à¸²à¸•à¸£à¸�à¸²à¸™à¸žà¸·à¹‰à¸™à¸—à¸µà¹ˆ 5S à¹�à¸¥à¸°à¸«à¸™à¹‰à¸²à¸‡à¸²à¸™', wt: 10.0, target: '28 à¹€à¸£à¸·à¹ˆà¸­à¸‡', actual: 23, unit: 'à¹€à¸£à¸·à¹ˆà¸­à¸‡', category: '5S' },
      { id: '11.2', name: 'à¸›à¸£à¸°à¹€à¸”à¹‡à¸™à¸—à¸µà¹ˆà¹„à¸¡à¹ˆà¹�à¸�à¹‰à¹„à¸‚', formula: 'à¸ˆà¸³à¸™à¸§à¸™à¸›à¸£à¸°à¹€à¸”à¹‡à¸™à¸„à¹‰à¸²à¸‡à¹�à¸�à¹‰à¹„à¸‚à¹€à¸�à¸´à¸™ 3 à¸§à¸±à¸™', wt: 5.0, target: '0 à¹€à¸„à¸ª', actual: 5, unit: 'à¹€à¸„à¸ª', category: '5S' }
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
      let pct = val;
      if (id === '1.2') pct = (val / 326) * 100;
      else if (id === '1.3') pct = (val / 17) * 100;
      else if (id === '1.4') pct = (val / 42) * 100;
      else if (id === '1.5') pct = (val / 35) * 100;

      if (pct >= 20) { grade = 'A'; score = 4.0; }
      else if (pct >= 18) { grade = 'B+'; score = 3.5; }
      else if (pct >= 16) { grade = 'B'; score = 3.0; }
      else if (pct >= 14) { grade = 'C+'; score = 2.5; }
      else if (pct >= 12) { grade = 'C'; score = 2.0; }
      else if (pct >= 10) { grade = 'D'; score = 1.5; }
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
    { subject: 'à¸„à¸§à¸²à¸¡à¸–à¸¹à¸�à¸•à¹‰à¸­à¸‡ (Accuracy)', A: 95, B: 85, fullMark: 100 },
    { subject: 'à¸„à¸§à¸²à¸¡à¸£à¸§à¸”à¹€à¸£à¹‡à¸§ (Speed)', A: 88, B: 80, fullMark: 100 },
    { subject: 'à¸„à¸§à¸²à¸¡à¸›à¸¥à¸­à¸”à¸ à¸±à¸¢ (Safety)', A: 100, B: 90, fullMark: 100 },
    { subject: 'à¸�à¸²à¸£à¹€à¸‚à¹‰à¸²à¸‡à¸²à¸™ (Attendance)', A: 98, B: 92, fullMark: 100 },
    { subject: 'à¸�à¸²à¸£à¹€à¸£à¸µà¸¢à¸™à¸£à¸¹à¹‰ (Learning)', A: 85, B: 75, fullMark: 100 },
    { subject: 'à¸�à¸²à¸£à¸šà¸£à¸´à¸«à¸²à¸£ (5S)', A: 90, B: 85, fullMark: 100 }
  ];

  const barData = [
    { name: 'à¸ªà¸¡à¸›à¸­à¸‡', Efficiency: 96, Accuracy: 94, Safety: 100 },
    { name: 'à¸­à¸£à¸­à¸™à¸‡à¸„à¹Œ', Efficiency: 92, Accuracy: 98, Safety: 100 },
    { name: 'à¸¡à¸²à¸™à¸°', Efficiency: 88, Accuracy: 90, Safety: 95 },
    { name: 'à¹€à¸�à¸©à¸¡', Efficiency: 85, Accuracy: 88, Safety: 100 },
    { name: 'à¸ˆà¸²à¸£à¸¸à¸“à¸µ', Efficiency: 90, Accuracy: 95, Safety: 100 }
  ];

  // Load from localStorage on client side mount with automatic schema migration
  useEffect(() => {
    const savedKpis = localStorage.getItem('swan_kpis');
    if (savedKpis) {
      try {
        const parsed = JSON.parse(savedKpis);
        if (parsed && typeof parsed === 'object' && Object.keys(parsed).length > 0) {
          let modified = false;
          Object.keys(parsed).forEach(m => {
            const list = parsed[m];
            if (Array.isArray(list)) {
              list.forEach(item => {
                // Migrate 1.2
                if (item.id === '1.2' && item.unit === '%') {
                  item.unit = 'พาเลท';
                  item.target = '65 พาเลท';
                  item.formula = 'จำนวนพาเลทเศษได้รับการจัดกลุ่ม';
                  item.actual = Math.round((item.actual / 100) * 326) || 0;
                  modified = true;
                }
                // Migrate 1.3
                if (item.id === '1.3' && item.unit === '%') {
                  item.unit = 'พาเลท';
                  item.target = '3.4 พาเลท';
                  item.formula = 'จำนวนพาเลทเศษได้รับการจัดกลุ่ม';
                  item.actual = Math.round((item.actual / 100) * 17) || 0;
                  modified = true;
                }
                // Migrate 1.4
                if (item.id === '1.4' && item.unit === '%') {
                  item.unit = 'พาเลท';
                  item.target = '8.4 พาเลท';
                  item.formula = 'จำนวนพาเลทเศษได้รับการจัดกลุ่ม';
                  item.actual = Math.round((item.actual / 100) * 42) || 0;
                  modified = true;
                }
                // Migrate 1.5
                if (item.id === '1.5' && item.unit === '%') {
                  item.unit = 'พาเลท';
                  item.target = '7 พาเลท';
                  item.formula = 'จำนวนพาเลทเศษได้รับการจัดกลุ่ม';
                  item.actual = Math.round((item.actual / 100) * 35) || 0;
                  modified = true;
                }
                // Migrate 11.2
                if (item.id === '11.2' && item.unit === '%') {
                  item.name = 'ประเด็นที่ไม่แก้ไข';
                  item.formula = 'จำนวนประเด็นค้างแก้ไขเกิน 3 วัน';
                  item.unit = 'เคส';
                  item.target = '0 เคส';
                  item.actual = Math.round(item.actual) || 0;
                  modified = true;
                }
              });
            }
          });

          if (modified) {
            localStorage.setItem('swan_kpis', JSON.stringify(parsed));
          }

          setKpis(parsed);
          // Set selectedMonth to the first key of the loaded kpis
          const firstMonth = Object.keys(parsed)[0];
          setSelectedMonth(firstMonth);
        }
      } catch (e) {
        console.error('Failed to parse saved KPIs:', e);
      }
    }
  }, []);

  // Save to localStorage when kpis change
  useEffect(() => {
    localStorage.setItem('swan_kpis', JSON.stringify(kpis));
  }, [kpis]);

  useEffect(() => {
    // Simulate API call for leaderboard
    setTimeout(() => {
      setLeaderboard([
        { rank: 1, name: 'à¸­à¸£à¸­à¸™à¸‡à¸„à¹Œ à¹�à¸žà¹‡à¸�à¹€à¸�à¹ˆà¸‡', position: 'Packer', points: 985, score: 98, status: 'up' },
        { rank: 2, name: 'à¸ªà¸¡à¸›à¸­à¸‡ à¸¥à¸¸à¸¢à¸‡à¸²à¸™', position: 'Forklift Driver', points: 960, score: 96, status: 'up' },
        { rank: 3, name: 'à¸ˆà¸²à¸£à¸¸à¸“à¸µ à¸™à¸±à¸šà¸ªà¸•à¹‡à¸­à¸�', position: 'Inventory Counter', points: 935, score: 94, status: 'down' },
        { rank: 4, name: 'à¸¡à¸²à¸™à¸° à¸„à¸±à¸”à¸‚à¸­à¸‡', position: 'Picker', points: 890, score: 89, status: 'up' },
        { rank: 5, name: 'à¹€à¸�à¸©à¸¡ à¸£à¸±à¸šà¸ªà¸´à¸™à¸„à¹‰à¸²', position: 'Receiving Clerk', points: 875, score: 87, status: 'down' }
      ]);
      setLoading(false);
    }, 400);
  }, []);

  const handleSaveKpiEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingKpi) return;

    const updatedMonthData = kpis[selectedMonth].map(item => {
      if (item.id === editingKpi.id) {
        const formattedTarget = editUnit === '%' ? `${editTarget}${editUnit}` : `${editTarget} ${editUnit}`;
        const updatedItem: any = {
          ...item,
          id: editId,
          name: editName,
          formula: editFormula,
          wt: parseFloat(editWt) || 0,
          target: formattedTarget,
          unit: editUnit,
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
    if (window.confirm(`à¸„à¸¸à¸“à¸•à¹‰à¸­à¸‡à¸�à¸²à¸£à¸¥à¸šà¸•à¸±à¸§à¸Šà¸µà¹‰à¸§à¸±à¸” KPI à¸¥à¸³à¸”à¸±à¸š ${kpiId} à¹ƒà¸Šà¹ˆà¸«à¸£à¸·à¸­à¹„à¸¡à¹ˆ?`)) {
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

    const template = kpis['June'] || Object.values(kpis)[0] || [];
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

  const handleDeleteMonth = () => {
    if (Object.keys(kpis).length <= 1) {
      alert('à¹„à¸¡à¹ˆà¸ªà¸²à¸¡à¸²à¸£à¸–à¸¥à¸šà¹€à¸”à¸·à¸­à¸™à¸—à¸±à¹‰à¸‡à¸«à¸¡à¸”à¹„à¸”à¹‰ à¸•à¹‰à¸­à¸‡à¸¡à¸µà¸­à¸¢à¹ˆà¸²à¸‡à¸™à¹‰à¸­à¸¢ 1 à¹€à¸”à¸·à¸­à¸™');
      return;
    }
    const monthLabel = selectedMonth === 'June' ? 'à¸¡à¸´à¸–à¸¸à¸™à¸²à¸¢à¸™ 2026' : 
                       selectedMonth === 'May' ? 'à¸žà¸¤à¸©à¸ à¸²à¸„à¸¡ 2026' : 
                       selectedMonth === 'April' ? 'à¹€à¸¡à¸©à¸²à¸¢à¸™ 2026' : selectedMonth;

    if (window.confirm(`à¸„à¸¸à¸“à¸•à¹‰à¸­à¸‡à¸�à¸²à¸£à¸¥à¸šà¹€à¸”à¸·à¸­à¸™ "${monthLabel}" à¹�à¸¥à¸°à¸‚à¹‰à¸­à¸¡à¸¹à¸¥ KPI à¸—à¸±à¹‰à¸‡à¸«à¸¡à¸”à¹ƒà¸™à¹€à¸”à¸·à¸­à¸™à¸™à¸µà¹‰à¹ƒà¸Šà¹ˆà¸«à¸£à¸·à¸­à¹„à¸¡à¹ˆ?`)) {
      const remainingMonths = Object.keys(kpis).filter(m => m !== selectedMonth);
      const newKpis = { ...kpis };
      delete newKpis[selectedMonth];
      setKpis(newKpis);
      setSelectedMonth(remainingMonths[0]);
    }
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
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">à¹�à¸”à¸Šà¸šà¸­à¸£à¹Œà¸”à¸›à¸£à¸°à¹€à¸¡à¸´à¸™à¸œà¸¥à¸‡à¸²à¸™ (Performance KPI)</h2>
          <p className="text-slate-400 text-sm mt-1">à¸§à¸´à¹€à¸„à¸£à¸²à¸°à¸«à¹Œà¸›à¸£à¸°à¸ªà¸´à¸—à¸˜à¸´à¸ à¸²à¸ž à¸„à¸§à¸²à¸¡à¹€à¸£à¹‡à¸§ à¸„à¸§à¸²à¸¡à¸–à¸¹à¸�à¸•à¹‰à¸­à¸‡ à¸„à¸§à¸²à¸¡à¸ªà¸°à¸­à¸²à¸”à¸£à¸°à¸šà¸š 5S à¹�à¸¥à¸°à¸„à¸§à¸²à¸¡à¸›à¸¥à¸­à¸”à¸ à¸±à¸¢à¹ƒà¸™à¸�à¸²à¸£à¸—à¸³à¸‡à¸²à¸™</p>
        </div>
      </div>

      {/* 4 KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        <GlassCard className="flex items-center gap-5 border border-slate-200/50 dark:border-white/5" hoverEffect>
          <div className="w-12 h-12 rounded-2xl bg-warehouse-orange/10 text-warehouse-orange flex items-center justify-center">
            <Gauge size={22} />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-bold">à¸›à¸£à¸°à¸ªà¸´à¸—à¸˜à¸´à¸ à¸²à¸žà¹€à¸‰à¸¥à¸µà¹ˆà¸¢ (Efficiency)</p>
            <h3 className="text-2xl font-bold font-sans text-slate-800 dark:text-white mt-1">94.2%</h3>
            <span className="text-[10px] text-emerald-500 font-semibold flex items-center gap-0.5">
              <ChevronUp size={12} />
              <span>+1.5% à¸ªà¸¹à¸‡à¸�à¸§à¹ˆà¸²à¹€à¸›à¹‰à¸²</span>
            </span>
          </div>
        </GlassCard>

        <GlassCard className="flex items-center gap-5 border border-slate-200/50 dark:border-white/5" hoverEffect>
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
            <ShieldCheck size={22} />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-bold">à¸„à¸°à¹�à¸™à¸™à¸„à¸§à¸²à¸¡à¸›à¸¥à¸­à¸”à¸ à¸±à¸¢ (Safety)</p>
            <h3 className="text-2xl font-bold font-sans text-slate-800 dark:text-white mt-1">99.8%</h3>
            <span className="text-[10px] text-slate-400 font-medium">à¹€à¸�à¸´à¸”à¸­à¸¸à¸šà¸±à¸•à¸´à¹€à¸«à¸•à¸¸à¸ªà¸°à¸ªà¸¡: 0 à¸„à¸£à¸±à¹‰à¸‡</span>
          </div>
        </GlassCard>

        <GlassCard className="flex items-center gap-5 border border-slate-200/50 dark:border-white/5" hoverEffect>
          <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center">
            <Flame size={22} />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-bold">à¸Šà¸±à¹ˆà¸§à¹‚à¸¡à¸‡à¸ªà¸°à¸ªà¸¡à¸£à¸§à¸¡ (KPI Hours)</p>
            <h3 className="text-2xl font-bold font-sans text-slate-800 dark:text-white mt-1">840 à¸Šà¸¡.</h3>
            <span className="text-[10px] text-slate-400 font-medium">à¸‚à¹‰à¸­à¸¡à¸¹à¸¥à¸£à¸­à¸š 30 à¸§à¸±à¸™</span>
          </div>
        </GlassCard>

        <GlassCard className="flex items-center gap-5 border border-slate-200/50 dark:border-white/5" hoverEffect>
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
            <Activity size={22} />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-bold">à¸„à¸§à¸²à¸¡à¸–à¸¹à¸�à¸•à¹‰à¸­à¸‡à¸«à¸¢à¸´à¸šà¸ªà¸´à¸™à¸„à¹‰à¸² (Accuracy)</p>
            <h3 className="text-2xl font-bold font-sans text-slate-800 dark:text-white mt-1">98.5%</h3>
            <span className="text-[10px] text-slate-400 font-medium">à¸­à¸±à¸•à¸£à¸²à¸�à¸²à¸£à¸„à¸·à¸™à¸‚à¸­à¸‡à¸•à¹ˆà¸³à¸�à¸§à¹ˆà¸² 0.2%</span>
          </div>
        </GlassCard>

      </div>

      {/* KPI Chart Visuals Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Radar KPI breakdown chart */}
        <GlassCard className="lg:col-span-1 h-[400px] flex flex-col" delay={0.1}>
          <div className="mb-4">
            <h4 className="font-bold text-sm text-slate-800 dark:text-white">à¹€à¸£à¸”à¸²à¸£à¹Œà¸§à¸±à¸”à¸‚à¸µà¸”à¸„à¸§à¸²à¸¡à¸ªà¸²à¸¡à¸²à¸£à¸– (Competency Radar)</h4>
            <p className="text-xs text-slate-400 mt-0.5">à¸ à¸²à¸žà¸£à¸§à¸¡à¸—à¸±à¸�à¸©à¸°à¸ªà¹ˆà¸§à¸™à¸•à¸±à¸§à¹€à¸›à¸£à¸µà¸¢à¸šà¹€à¸—à¸µà¸¢à¸šà¸�à¸±à¸šà¸„à¹ˆà¸²à¹€à¸‰à¸¥à¸µà¹ˆà¸¢à¸‚à¸­à¸‡à¹�à¸œà¸™à¸�</p>
          </div>
          <div className="flex-1 w-full text-xs">
            <ResponsiveContainer width="100%" height="90%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                <PolarGrid stroke="#E2E8F0" className="dark:stroke-slate-800" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#94A3B8', fontSize: 10 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} />
                <Radar name="à¸žà¸™à¸±à¸�à¸‡à¸²à¸™à¹€à¸›à¹‰à¸²à¸«à¸¡à¸²à¸¢ (Operator A)" dataKey="A" stroke="#F97316" fill="#F97316" fillOpacity={0.2} />
                <Radar name="à¸„à¹ˆà¸²à¹€à¸‰à¸¥à¸µà¹ˆà¸¢à¸„à¸¥à¸±à¸‡ (Standard Avg)" dataKey="B" stroke="#1E3A8A" fill="#1E3A8A" fillOpacity={0.1} />
                <Tooltip contentStyle={{ borderRadius: '12px' }} />
                <Legend wrapperStyle={{ fontSize: 10, marginTop: 10 }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        {/* Bar comparison chart */}
        <GlassCard className="lg:col-span-2 h-[400px] flex flex-col" delay={0.15}>
          <div className="mb-4">
            <h4 className="font-bold text-sm text-slate-800 dark:text-white">à¸œà¸¥à¸ªà¸±à¸¡à¸¤à¸—à¸˜à¸´à¹Œà¸£à¸²à¸¢à¸šà¸¸à¸„à¸„à¸¥ (Operator KPI Performance)</h4>
            <p className="text-xs text-slate-400 mt-0.5">à¸�à¸²à¸£à¹€à¸›à¸£à¸µà¸¢à¸šà¹€à¸—à¸µà¸¢à¸šà¸›à¸£à¸°à¸ªà¸´à¸—à¸˜à¸´à¸œà¸¥à¸„à¸§à¸²à¸¡à¹�à¸¡à¹ˆà¸™à¸¢à¸³à¹�à¸¥à¸°à¸„à¸§à¸²à¸¡à¸›à¸¥à¸­à¸”à¸ à¸±à¸¢à¹ƒà¸™à¸�à¸¥à¸¸à¹ˆà¸¡à¸žà¸™à¸±à¸�à¸‡à¸²à¸™à¸”à¸µà¹€à¸”à¹ˆà¸™</p>
          </div>
          <div className="flex-1 w-full text-xs">
            <ResponsiveContainer width="100%" height="90%">
              <BarChart data={barData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" className="dark:stroke-slate-800" />
                <XAxis dataKey="name" tickLine={false} stroke="#94A3B8" />
                <YAxis axisLine={false} tickLine={false} stroke="#94A3B8" />
                <Tooltip contentStyle={{ borderRadius: '12px' }} />
                <Legend wrapperStyle={{ fontSize: 10 }} />
                <Bar dataKey="Efficiency" name="à¸›à¸£à¸°à¸ªà¸´à¸—à¸˜à¸´à¸ à¸²à¸žà¸„à¸§à¸²à¸¡à¹€à¸£à¹‡à¸§" fill="#1E3A8A" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Accuracy" name="à¸„à¸§à¸²à¸¡à¸–à¸¹à¸�à¸•à¹‰à¸­à¸‡" fill="#F97316" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Safety" name="à¸„à¸°à¹�à¸™à¸™à¹€à¸‹à¸Ÿà¸•à¸µà¹‰" fill="#10B981" radius={[4, 4, 0, 0]} />
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
          à¸ªà¸£à¸¸à¸›à¸œà¸¥ KPI à¹�à¸œà¸™à¸�à¸„à¸¥à¸±à¸‡à¸ªà¸´à¸™à¸„à¹‰à¸² (Department KPI)
        </button>
        <button 
          onClick={() => setActiveTab('leaderboard')}
          className={`pb-2 px-1 text-sm font-bold transition-all relative ${
            activeTab === 'leaderboard' 
              ? 'text-warehouse-orange border-b-2 border-warehouse-orange' 
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          à¸­à¸±à¸™à¸”à¸±à¸šà¸œà¸¥à¸‡à¸²à¸™à¸£à¸²à¸¢à¸šà¸¸à¸„à¸„à¸¥ (Leaderboard)
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
                  <span>à¸œà¸¥à¸�à¸²à¸£à¸”à¸³à¹€à¸™à¸´à¸™à¸‡à¸²à¸™à¹�à¸œà¸™à¸�à¸„à¸¥à¸±à¸‡à¸ªà¸´à¸™à¸„à¹‰à¸²à¸›à¸£à¸°à¸ˆà¸³à¸›à¸µ 2026</span>
                </h4>
                <p className="text-xs text-slate-400 mt-1">à¸•à¸²à¸£à¸²à¸‡à¸„à¸°à¹�à¸™à¸™à¸–à¹ˆà¸§à¸‡à¸™à¹‰à¸³à¸«à¸™à¸±à¸� à¹€à¸�à¸£à¸” à¹�à¸¥à¸°à¹€à¸›à¹‰à¸²à¸«à¸¡à¸²à¸¢à¸•à¸²à¸¡à¹�à¸•à¹ˆà¸¥à¸°à¸•à¸±à¸§à¸Šà¸µà¹‰à¸§à¸±à¸”</p>
              </div>

              {/* Month Selector */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2">
                  <Calendar size={16} className="text-slate-400" />
                  <span className="text-xs text-slate-400 font-bold">à¹€à¸¥à¸·à¸­à¸�à¹€à¸”à¸·à¸­à¸™à¸›à¸£à¸°à¹€à¸¡à¸´à¸™:</span>
                  <select 
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="glass-input text-xs bg-white dark:bg-warehouse-slate py-1 px-3"
                  >
                    {Object.keys(kpis).map(month => (
                      <option key={month} value={month}>
                        {month === 'June' ? 'à¸¡à¸´à¸–à¸¸à¸™à¸²à¸¢à¸™ 2026' : 
                         month === 'May' ? 'à¸žà¸¤à¸©à¸ à¸²à¸„à¸¡ 2026' : 
                         month === 'April' ? 'à¹€à¸¡à¸©à¸²à¸¢à¸™ 2026' : month}
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
                      <span>à¹€à¸žà¸´à¹ˆà¸¡à¹€à¸”à¸·à¸­à¸™</span>
                    </button>
                    <button
                      onClick={handleDeleteMonth}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 transition-all shadow-md shadow-rose-600/10"
                      title="à¸¥à¸šà¹€à¸”à¸·à¸­à¸™à¸›à¸±à¸ˆà¸ˆà¸¸à¸šà¸±à¸™"
                    >
                      <Trash2 size={14} />
                      <span>à¸¥à¸šà¹€à¸”à¸·à¸­à¸™</span>
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
                      <span>à¹€à¸žà¸´à¹ˆà¸¡ KPI</span>
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
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">à¹€à¸�à¸£à¸”à¹€à¸‰à¸¥à¸µà¹ˆà¸¢à¸‚à¸­à¸‡à¹�à¸œà¸™à¸� (Overall Grade)</p>
                  <h5 className="text-lg font-extrabold text-slate-800 dark:text-white mt-0.5">à¹€à¸�à¸£à¸” {overallGradeLetter}</h5>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center">
                  <Award size={24} />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">à¸„à¸°à¹�à¸™à¸™à¸–à¹ˆà¸§à¸‡à¸™à¹‰à¸³à¸«à¸™à¸±à¸�à¹€à¸‰à¸¥à¸µà¹ˆà¸¢ (Weighted Score)</p>
                  <h5 className="text-lg font-extrabold text-slate-800 dark:text-white mt-0.5">{finalWeightedScore.toFixed(2)} / 4.00</h5>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 bg-indigo-500/5 border border-indigo-500/20 rounded-2xl">
                <div className="w-12 h-12 rounded-xl bg-indigo-500/15 text-indigo-400 flex items-center justify-center">
                  <Percent size={22} />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">à¹€à¸›à¸­à¸£à¹Œà¹€à¸‹à¹‡à¸™à¸•à¹Œà¸œà¸¥à¸”à¸³à¹€à¸™à¸´à¸™à¸‡à¸²à¸™ (KPI Performance %)</p>
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
                    <th className="px-4 py-3 text-center w-12">à¸¥à¸³à¸”à¸±à¸š</th>
                    <th className="px-4 py-3">à¸«à¸±à¸§à¸‚à¹‰à¸­ KPI à¸«à¸¥à¸±à¸�</th>
                    <th className="px-4 py-3">à¸ªà¸¹à¸•à¸£à¸�à¸²à¸£à¸„à¸³à¸™à¸§à¸“</th>
                    <th className="px-4 py-3 text-center w-20">% WT</th>
                    <th className="px-4 py-3 text-center w-24">Target</th>
                    <th className="px-4 py-3 text-center w-24">à¸œà¸¥à¸‡à¸²à¸™à¸ˆà¸£à¸´à¸‡ (Actual)</th>
                    <th className="px-4 py-3 text-center w-20">à¸„à¸°à¹�à¸™à¸™ (4.0)</th>
                    <th className="px-4 py-3 text-center w-20">à¹€à¸�à¸£à¸”</th>
                    {(user?.role === 'admin' || user?.role === 'staff') && (
                      <th className="px-4 py-3 text-center w-24">à¸ˆà¸±à¸”à¸�à¸²à¸£</th>
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
                                  
                                  // Strip unit suffix if target ends with it
                                  let targetVal = kpi.target;
                                  if (kpi.unit && targetVal.endsWith(kpi.unit)) {
                                    targetVal = targetVal.slice(0, -kpi.unit.length).trim();
                                  }
                                  setEditTarget(targetVal);
                                  setEditUnit(kpi.unit || '%');
                                  
                                  setEditActual(kpi.actual.toString());
                                  setEditManualScore(kpi.manualScore !== undefined ? kpi.manualScore.toString() : '');
                                  setEditManualGrade(kpi.manualGrade || 'Auto');
                                  setShowEditModal(true);
                                }}
                                className="text-warehouse-orange hover:text-warehouse-orange/80 transition-colors p-1 bg-warehouse-orange/10 hover:bg-warehouse-orange/20 rounded-lg inline-flex items-center justify-center"
                                title="à¹�à¸�à¹‰à¹„à¸‚ KPI à¹�à¸¥à¸°à¸œà¸¥à¸‡à¸²à¸™"
                              >
                                <Edit3 size={14} />
                              </button>
                              <button
                                onClick={() => handleDeleteKpi(kpi.id)}
                                className="text-rose-500 hover:text-rose-600 transition-colors p-1 bg-rose-500/10 hover:bg-rose-500/20 rounded-lg inline-flex items-center justify-center"
                                title="à¸¥à¸š KPI"
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
              <span>à¸�à¸£à¸°à¸”à¸²à¸™à¸œà¸¹à¹‰à¸™à¸³à¸œà¸¥à¸‡à¸²à¸™à¸žà¸™à¸±à¸�à¸‡à¸²à¸™à¸”à¸µà¹€à¸”à¹ˆà¸™ (Leaderboard)</span>
            </h4>
            <span className="text-[10px] text-slate-400 font-semibold">à¸­à¸±à¸›à¹€à¸”à¸•à¹�à¸šà¸šà¸£à¸²à¸¢à¹€à¸”à¸·à¸­à¸™</span>
          </div>
          
          <div className="overflow-x-auto text-xs">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-slate-200/50 dark:border-white/5 text-[10px] uppercase font-bold text-slate-400 tracking-wider bg-slate-50/50 dark:bg-white/5">
                  <th className="px-6 py-3.5 text-center w-20">à¸­à¸±à¸™à¸”à¸±à¸š</th>
                  <th className="px-6 py-3.5">à¸£à¸²à¸¢à¸Šà¸·à¹ˆà¸­à¸žà¸™à¸±à¸�à¸‡à¸²à¸™</th>
                  <th className="px-6 py-3.5">à¸•à¸³à¹�à¸«à¸™à¹ˆà¸‡</th>
                  <th className="px-6 py-3.5 text-center">à¸„à¸°à¹�à¸™à¸™à¸ªà¸°à¸ªà¸¡ (Points)</th>
                  <th className="px-6 py-3.5 text-center">à¸”à¸±à¸Šà¸™à¸µà¸Šà¸µà¹‰à¸§à¸±à¸” KPI</th>
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
                <span>à¹�à¸�à¹‰à¹„à¸‚à¸‚à¹‰à¸­à¸¡à¸¹à¸¥à¸•à¸±à¸§à¸Šà¸µà¹‰à¸§à¸±à¸” KPI ({editingKpi.id})</span>
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
                <label className="text-[10px] font-bold text-slate-400 uppercase">à¸¥à¸³à¸”à¸±à¸š KPI (ID)</label>
                <input 
                  type="text" 
                  required 
                  value={editId} 
                  onChange={(e) => setEditId(e.target.value)} 
                  className="glass-input text-xs w-full bg-white dark:bg-warehouse-slate" 
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase">à¸«à¸±à¸§à¸‚à¹‰à¸­ KPI à¸«à¸¥à¸±à¸�</label>
                <input 
                  type="text" 
                  required 
                  value={editName} 
                  onChange={(e) => setEditName(e.target.value)} 
                  className="glass-input text-xs w-full bg-white dark:bg-warehouse-slate" 
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase">à¸ªà¸¹à¸•à¸£à¸�à¸²à¸£à¸„à¸³à¸™à¸§à¸“</label>
                <textarea 
                  value={editFormula} 
                  onChange={(e) => setEditFormula(e.target.value)} 
                  rows={2}
                  className="glass-input text-xs w-full bg-white dark:bg-warehouse-slate py-2 resize-none" 
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">% WT (à¸™à¹‰à¸³à¸«à¸™à¸±à¸�)</label>
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
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Target</label>
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
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase">à¸œà¸¥à¸‡à¸²à¸™à¸ˆà¸£à¸´à¸‡ (Actual) à¹ƒà¸™à¹€à¸”à¸·à¸­à¸™à¸™à¸µà¹‰</label>
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
                  <label className="text-[10px] font-bold text-slate-400 uppercase">à¸„à¸°à¹�à¸™à¸™à¸ªà¸°à¸ªà¸¡ (0.0 - 4.0)</label>
                  <input 
                    type="number" 
                    step="0.1"
                    min="0"
                    max="4"
                    value={editManualScore} 
                    onChange={(e) => setEditManualScore(e.target.value)} 
                    placeholder="Auto (à¸„à¸³à¸™à¸§à¸“à¸­à¸±à¸•à¹‚à¸™à¸¡à¸±à¸•à¸´)"
                    className="glass-input text-xs w-full bg-white dark:bg-warehouse-slate" 
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">à¹€à¸�à¸£à¸”à¹€à¸‰à¸¥à¸µà¹ˆà¸¢</label>
                  <select 
                    value={editManualGrade} 
                    onChange={(e) => setEditManualGrade(e.target.value)}
                    className="glass-input text-xs w-full bg-white dark:bg-warehouse-slate"
                  >
                    <option value="Auto">Auto (à¸„à¸³à¸™à¸§à¸“à¸­à¸±à¸•à¹‚à¸™à¸¡à¸±à¸•à¸´)</option>
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
                  à¸¢à¸�à¹€à¸¥à¸´à¸�
                </button>
                <button 
                  type="submit" 
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-warehouse-orange hover:bg-warehouse-orange/90 text-white text-xs font-bold transition-all shadow-md shadow-warehouse-orange/15"
                >
                  <Save size={14} />
                  <span>à¸šà¸±à¸™à¸—à¸¶à¸�à¸œà¸¥à¸‡à¸²à¸™</span>
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
                <span>à¹€à¸žà¸´à¹ˆà¸¡à¸•à¸±à¸§à¸Šà¸µà¹‰à¸§à¸±à¸” KPI à¹ƒà¸«à¸¡à¹ˆ</span>
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
                  <label className="text-[10px] font-bold text-slate-400 uppercase">à¸¥à¸³à¸”à¸±à¸š (ID)</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="à¹€à¸Šà¹ˆà¸™ 1.6"
                    value={addKpiId} 
                    onChange={(e) => setAddKpiId(e.target.value)} 
                    className="glass-input text-xs w-full bg-white dark:bg-warehouse-slate" 
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">à¸«à¸™à¹ˆà¸§à¸¢ (Unit)</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="à¹€à¸Šà¹ˆà¸™ % à¸«à¸£à¸·à¸­ à¸„à¸£à¸±à¹‰à¸‡"
                    value={addKpiUnit} 
                    onChange={(e) => setAddKpiUnit(e.target.value)} 
                    className="glass-input text-xs w-full bg-white dark:bg-warehouse-slate" 
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">à¸«à¸¡à¸§à¸”à¸«à¸¡à¸¹à¹ˆ</label>
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
                <label className="text-[10px] font-bold text-slate-400 uppercase">à¸«à¸±à¸§à¸‚à¹‰à¸­ KPI à¸«à¸¥à¸±à¸�</label>
                <input 
                  type="text" 
                  required 
                  placeholder="à¹€à¸Šà¹ˆà¸™ à¸„à¸§à¸²à¸¡à¸–à¸¹à¸�à¸•à¹‰à¸­à¸‡à¹ƒà¸™à¸�à¸²à¸£à¸ªà¹�à¸�à¸™à¸šà¸²à¸£à¹Œà¹‚à¸„à¹‰à¸”"
                  value={addKpiName} 
                  onChange={(e) => setAddKpiName(e.target.value)} 
                  className="glass-input text-xs w-full bg-white dark:bg-warehouse-slate" 
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase">à¸ªà¸¹à¸•à¸£à¸�à¸²à¸£à¸„à¸³à¸™à¸§à¸“</label>
                <textarea 
                  placeholder="à¹€à¸Šà¹ˆà¸™ (à¸ˆà¸³à¸™à¸§à¸™à¸—à¸µà¹ˆà¸–à¸¹à¸�à¸•à¹‰à¸­à¸‡ / à¸ˆà¸³à¸™à¸§à¸™à¸—à¸±à¹‰à¸‡à¸«à¸¡à¸”) x 100"
                  value={addKpiFormula} 
                  onChange={(e) => setAddKpiFormula(e.target.value)} 
                  rows={2}
                  className="glass-input text-xs w-full bg-white dark:bg-warehouse-slate py-2 resize-none" 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">% WT (à¸™à¹‰à¸³à¸«à¸™à¸±à¸�)</label>
                  <input 
                    type="number" 
                    step="any"
                    required 
                    placeholder="à¹€à¸Šà¹ˆà¸™ 5"
                    value={addKpiWt} 
                    onChange={(e) => setAddKpiWt(e.target.value)} 
                    className="glass-input text-xs w-full bg-white dark:bg-warehouse-slate" 
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Target (à¹€à¸›à¹‰à¸²à¸«à¸¡à¸²à¸¢)</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="à¹€à¸Šà¹ˆà¸™ >=95%"
                    value={addKpiTarget} 
                    onChange={(e) => setAddKpiTarget(e.target.value)} 
                    className="glass-input text-xs w-full bg-white dark:bg-warehouse-slate" 
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase">à¸œà¸¥à¸‡à¸²à¸™à¸ˆà¸£à¸´à¸‡ (Actual)</label>
                <input 
                  type="number" 
                  step="any"
                  required 
                  placeholder="à¹€à¸Šà¹ˆà¸™ 94.5"
                  value={addKpiActual} 
                  onChange={(e) => setAddKpiActual(e.target.value)} 
                  className="glass-input text-xs w-full bg-white dark:bg-warehouse-slate" 
                />
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-100 dark:border-white/5">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">à¸„à¸°à¹�à¸™à¸™à¸ªà¸°à¸ªà¸¡ (0.0 - 4.0)</label>
                  <input 
                    type="number" 
                    step="0.1"
                    min="0"
                    max="4"
                    placeholder="Auto (à¸„à¸³à¸™à¸§à¸“à¸­à¸±à¸•à¹‚à¸™à¸¡à¸±à¸•à¸´)"
                    value={addKpiManualScore} 
                    onChange={(e) => setAddKpiManualScore(e.target.value)} 
                    className="glass-input text-xs w-full bg-white dark:bg-warehouse-slate" 
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">à¹€à¸�à¸£à¸”à¹€à¸‰à¸¥à¸µà¹ˆà¸¢</label>
                  <select 
                    value={addKpiManualGrade} 
                    onChange={(e) => setAddKpiManualGrade(e.target.value)}
                    className="glass-input text-xs w-full bg-white dark:bg-warehouse-slate"
                  >
                    <option value="Auto">Auto (à¸„à¸³à¸™à¸§à¸“à¸­à¸±à¸•à¹‚à¸™à¸¡à¸±à¸•à¸´)</option>
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
                  à¸¢à¸�à¹€à¸¥à¸´à¸�
                </button>
                <button 
                  type="submit" 
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-md shadow-emerald-600/15"
                >
                  <Save size={14} />
                  <span>à¹€à¸žà¸´à¹ˆà¸¡ KPI</span>
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
                <span>à¹€à¸žà¸´à¹ˆà¸¡à¸‚à¹‰à¸­à¸¡à¸¹à¸¥ KPI à¸›à¸£à¸°à¸ˆà¸³à¹€à¸”à¸·à¸­à¸™</span>
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
                <label className="text-[10px] font-bold text-slate-400 uppercase">à¸Šà¸·à¹ˆà¸­à¹€à¸”à¸·à¸­à¸™à¸›à¸£à¸°à¹€à¸¡à¸´à¸™ (à¹€à¸Šà¹ˆà¸™ à¸�à¸£à¸�à¸Žà¸²à¸„à¸¡ 2026)</label>
                <input 
                  type="text" 
                  required 
                  value={newMonthName} 
                  onChange={(e) => setNewMonthName(e.target.value)} 
                  className="glass-input text-xs w-full bg-white dark:bg-warehouse-slate" 
                  placeholder="à¸�à¸£à¸�à¸Žà¸²à¸„à¸¡ 2026 à¸«à¸£à¸·à¸­ July"
                />
              </div>

              <div className="border-t border-slate-200/30 dark:border-white/5 pt-4">
                <p className="text-[11px] font-extrabold text-slate-400 uppercase mb-3 tracking-wider">à¸£à¸°à¸šà¸¸à¸œà¸¥à¸‡à¸²à¸™à¸ˆà¸£à¸´à¸‡à¸‚à¸­à¸‡à¸•à¸±à¸§à¸Šà¸µà¹‰à¸§à¸±à¸”à¸—à¸±à¹‰à¸‡ 12 à¸‚à¹‰à¸­:</p>
                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                  {(kpis['June'] || []).map(item => (
                    <div key={item.id} className="grid grid-cols-1 sm:grid-cols-3 items-center gap-2 p-2 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-200/30 dark:border-white/5">
                      <div className="sm:col-span-2 text-xs">
                        <span className="font-mono text-slate-400 font-bold mr-1">{item.id}</span>
                        <span className="font-semibold text-slate-700 dark:text-slate-200 truncate inline-block max-w-[280px]" title={item.name}>{item.name.split(' (')[0]}</span>
                        <span className="block text-[9px] text-slate-400 font-medium">à¹€à¸›à¹‰à¸²à¸«à¸¡à¸²à¸¢: {item.target}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <input 
                          type="number"
                          step="any"
                          required
                          value={newKpiValues[item.id] || ''}
                          onChange={(e) => setNewKpiValues({ ...newKpiValues, [item.id]: e.target.value })}
                          className="glass-input text-xs w-full bg-white dark:bg-warehouse-slate py-1 px-2 text-center"
                          placeholder="à¸œà¸¥à¸‡à¸²à¸™à¸ˆà¸£à¸´à¸‡"
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
                  à¸¢à¸�à¹€à¸¥à¸´à¸�
                </button>
                <button 
                  type="submit" 
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-warehouse-orange hover:bg-warehouse-orange/90 text-white text-xs font-bold transition-all shadow-md shadow-warehouse-orange/15"
                >
                  <Plus size={14} />
                  <span>à¸šà¸±à¸™à¸—à¸¶à¸�à¸‚à¹‰à¸­à¸¡à¸¹à¸¥à¹€à¸”à¸·à¸­à¸™à¹ƒà¸«à¸¡à¹ˆ</span>
                </button>
              </div>
            </form>
          </GlassCard>
        </div>
      )}

    </div>
  );
}
