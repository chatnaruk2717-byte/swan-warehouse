'use client';

import React, { useState } from 'react';
import GlassCard from './GlassCard';
import SwanLogo from './SwanLogo';
import { 
  X, 
  Printer, 
  Download, 
  CheckCircle2, 
  Share2, 
  Award, 
  ShieldCheck,
  Copy,
  ExternalLink,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export interface CertificateData {
  certificate_number: string;
  recipient_name: string;
  employee_id: string;
  title: string;
  type?: 'course' | 'skill';
  issued_date: string;
  issuer_name?: string;
  issuer_title?: string;
  skill_level?: string;
}

interface CertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  certificate: CertificateData | null;
}

export default function CertificateModal({
  isOpen,
  onClose,
  certificate
}: CertificateModalProps) {
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);

  if (!isOpen || !certificate) return null;

  const verifyUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/certificates/verify?certNo=${certificate.certificate_number}`
    : `https://swan-warehouse-app.pages.dev/certificates/verify?certNo=${certificate.certificate_number}`;

  const qrCodeApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(verifyUrl)}&color=064e3b`;

  const handlePrint = () => {
    window.print();
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(verifyUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto print:p-0 print:bg-white">
      
      <div className="w-full max-w-4xl space-y-4 print:max-w-none print:m-0 animate-fadeIn">
        
        {/* Modal Action Controls Bar (Hidden during Print) */}
        <div className="flex items-center justify-between bg-slate-900/90 text-white p-3 sm:p-4 rounded-2xl border border-slate-700/60 shadow-xl print:hidden">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
            <Award size={18} />
            <span>ใบประกาศนียบัตรดิจิทัลมาตรฐาน Swan Industries</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyLink}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 transition-all flex items-center gap-1.5 border border-slate-700 active:scale-95"
            >
              {copied ? (
                <>
                  <CheckCircle2 size={14} className="text-emerald-400" />
                  <span className="text-emerald-400">คัดลอกลิงก์แล้ว!</span>
                </>
              ) : (
                <>
                  <Copy size={14} />
                  <span>คัดลอกลิงก์สแกน</span>
                </>
              )}
            </button>

            <button
              onClick={handlePrint}
              className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold shadow-md shadow-emerald-600/30 transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer"
            >
              <Printer size={14} />
              <span>พิมพ์ / พิมพ์เป็น PDF (Print)</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* E-CERTIFICATE A4 CANVAS FRAME */}
        <div 
          id="certificate-print-area"
          className="bg-white text-slate-900 rounded-3xl p-6 sm:p-12 border-[8px] border-double border-emerald-700 shadow-2xl relative overflow-hidden print:border-4 print:shadow-none print:rounded-none print:w-full print:h-screen print:flex print:flex-col print:justify-between"
        >
          {/* Decorative Corner Ornaments */}
          <div className="absolute top-0 left-0 w-24 h-24 border-t-8 border-l-8 border-amber-500/80 rounded-tl-2xl pointer-events-none" />
          <div className="absolute top-0 right-0 w-24 h-24 border-t-8 border-r-8 border-amber-500/80 rounded-tr-2xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-24 h-24 border-b-8 border-l-8 border-amber-500/80 rounded-bl-2xl pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-24 h-24 border-b-8 border-r-8 border-amber-500/80 rounded-br-2xl pointer-events-none" />

          {/* Background Watermark Logo */}
          <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none select-none">
            <SwanLogo className="w-96 h-96 grayscale" />
          </div>

          <div className="relative z-10 space-y-6 sm:space-y-8 text-center">
            
            {/* Header: Company Name & Brand Seal */}
            <div className="flex flex-col items-center justify-center space-y-2">
              <SwanLogo className="w-16 h-16 sm:w-20 sm:h-20 shadow-md rounded-2xl mb-1" />
              <h2 className="text-xl sm:text-2xl font-black text-emerald-900 tracking-wider">
                SWAN INDUSTRIES (THAILAND) LIMITED
              </h2>
              <p className="text-xs sm:text-sm font-semibold text-slate-600 uppercase tracking-widest">
                บริษัท สวอนอินดัสตรีส์ (ประเทศไทย) จำกัด • ฝ่ายบริหารคลังสินค้าและพัฒนาบุคลากร
              </p>
              <div className="w-32 h-1 bg-gradient-to-r from-emerald-600 via-amber-500 to-emerald-600 rounded-full mx-auto my-2" />
            </div>

            {/* Certificate Title */}
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-widest text-amber-600 bg-amber-50 px-4 py-1 rounded-full border border-amber-200">
                Official Digital Certificate of Accomplishment
              </span>
              <h1 className="text-2xl sm:text-4xl font-extrabold text-emerald-950 tracking-tight pt-2">
                ใบประกาศนียบัตรรับรองความสำเร็จ
              </h1>
            </div>

            {/* Recipient Section */}
            <div className="space-y-2 py-2">
              <p className="text-xs sm:text-sm text-slate-500 font-medium">ใบประกาศนียบัตรฉบับนี้ให้ไว้เพื่อแสดงว่า</p>
              <div className="text-2xl sm:text-4xl font-black text-emerald-900 border-b-2 border-slate-200 inline-block px-8 py-1">
                {certificate.recipient_name}
              </div>
              <p className="text-xs font-bold text-slate-500 font-mono">
                รหัสพนักงาน: <span className="text-emerald-700 font-extrabold">{certificate.employee_id}</span>
              </p>
            </div>

            {/* Course / Skill Achievement Description */}
            <div className="max-w-2xl mx-auto space-y-2 bg-emerald-50/50 p-4 sm:p-6 rounded-2xl border border-emerald-100">
              <p className="text-xs sm:text-sm text-slate-600 font-medium">
                ได้ผ่านการเรียนรู้ ทดสอบ และได้รับการประเมินตามเกณฑ์มาตรฐานคลังสินค้า ในหลักสูตร:
              </p>
              <h3 className="text-base sm:text-xl font-black text-emerald-900 leading-snug">
                "{certificate.title}"
              </h3>
              {certificate.skill_level && (
                <div className="pt-1">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-600 text-white rounded-full text-xs font-black shadow-sm">
                    <Sparkles size={13} />
                    <span>ระดับความเชี่ยวชาญ: {certificate.skill_level}</span>
                  </span>
                </div>
              )}
            </div>

            {/* Verification Details & QR Code & Signatures Row */}
            <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-6 text-left">
              
              {/* QR Code & Certificate Number */}
              <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-2xl border border-slate-200 shadow-sm">
                <img
                  src={qrCodeApiUrl}
                  alt="QR Code Verification"
                  className="w-20 h-20 rounded-xl border border-slate-300 shrink-0"
                />
                <div className="text-[11px] space-y-1 font-medium text-slate-600">
                  <div className="flex items-center gap-1 font-bold text-emerald-800">
                    <ShieldCheck size={14} className="text-emerald-600" />
                    <span>สแกนตรวจสอบความถูกต้อง</span>
                  </div>
                  <p className="font-mono text-[10px] font-bold text-slate-700">
                    เลขที่: {certificate.certificate_number}
                  </p>
                  <p className="text-[10px] text-slate-500">
                    ออกเมื่อ: {certificate.issued_date}
                  </p>
                </div>
              </div>

              {/* Digital Signatures */}
              <div className="flex items-center gap-8 sm:gap-12">
                <div className="text-center space-y-1">
                  <div className="h-10 border-b border-slate-400 flex items-end justify-center pb-1">
                    <span className="font-serif italic font-black text-emerald-900 text-sm">Prathan S.</span>
                  </div>
                  <p className="text-xs font-bold text-slate-800">{certificate.issuer_name || 'คุณประธาน  สวอนอินดัสตรีส์'}</p>
                  <p className="text-[10px] text-slate-500 font-semibold">{certificate.issuer_title || 'Warehouse Manager'}</p>
                </div>

                <div className="text-center space-y-1">
                  <div className="h-10 border-b border-slate-400 flex items-end justify-center pb-1">
                    <span className="font-serif italic font-black text-amber-900 text-sm">Swan HR Seal</span>
                  </div>
                  <p className="text-xs font-bold text-slate-800">ฝ่ายพัฒนาทรัพยากรบุคคล (HRD)</p>
                  <p className="text-[10px] text-slate-500 font-semibold">Swan Industries (Thailand)</p>
                </div>
              </div>

            </div>

          </div>
        </div>

      </div>

    </div>
  );
}
