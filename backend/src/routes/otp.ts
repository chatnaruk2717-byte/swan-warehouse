import { Router, Response } from 'express';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

// In-memory store for active OTP codes: { [userId_channel]: { code: string, expiresAt: number } }
const otpStore: Record<string, { code: string; expiresAt: number }> = {};

/**
 * @swagger
 * /api/otp/send:
 *   post:
 *     summary: Generate and send 6-digit OTP code to email or phone
 */
router.post('/send', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { channel } = req.body; // 'email' | 'phone'
    const userId = req.user?.id || 'demo';

    // Generate random 6-digit number
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 5 * 60 * 1000; // Expires in 5 minutes

    const key = `${userId}_${channel || 'email'}`;
    otpStore[key] = { code, expiresAt };

    const targetDestination = channel === 'phone' 
      ? (req.user?.phone || '081-xxx-xxxx')
      : (req.user?.email || 'user@swan.co.th');

    console.log(`[OTP SENT] User: ${userId}, Channel: ${channel}, Code: ${code}, Target: ${targetDestination}`);

    return res.json({
      success: true,
      message: `ส่งรหัส OTP 6 หลักไปยัง ${channel === 'phone' ? 'เบอร์โทรศัพท์' : 'อีเมล'} (${targetDestination}) เรียบร้อยแล้ว`,
      code, // Returned for demo toast notification
      channel,
      targetDestination,
      expiresInSeconds: 300
    });
  } catch (err: any) {
    return res.status(500).json({ message: 'เกิดข้อผิดพลาดในการส่ง OTP: ' + err.message });
  }
});

/**
 * @swagger
 * /api/otp/verify:
 *   post:
 *     summary: Verify 6-digit OTP code
 */
router.post('/verify', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { code, channel } = req.body;
    const userId = req.user?.id || 'demo';
    const key = `${userId}_${channel || 'email'}`;

    const record = otpStore[key];

    // Demo fallback: if code is '849201' or matches generated code or '123456'
    if (code === '123456' || code === '849201' || (record && record.code === code && Date.now() <= record.expiresAt)) {
      if (record) delete otpStore[key];
      return res.json({
        success: true,
        verified: true,
        message: 'ยืนยันรหัส OTP 6 หลักถูกต้อง สามารถเข้าใช้งานได้แล้ว'
      });
    }

    return res.status(400).json({
      success: false,
      verified: false,
      message: 'รหัส OTP ไม่ถูกต้องหรือหมดอายุ กรุณาตรวจสอบรหัสอีกครั้ง'
    });
  } catch (err: any) {
    return res.status(500).json({ message: 'เกิดข้อผิดพลาดในการตรวจสอบ OTP: ' + err.message });
  }
});

export default router;
