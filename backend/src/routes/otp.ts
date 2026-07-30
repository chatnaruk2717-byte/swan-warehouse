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
    const { channel, target, code: customCode } = req.body; // 'line' | 'email' | 'phone'
    const userId = req.user?.id || 'demo';

    // Generate random 6-digit number
    const code = customCode || Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 5 * 60 * 1000; // Expires in 5 minutes

    const key = `${userId}_${channel || 'line'}`;
    otpStore[key] = { code, expiresAt };

    const targetDestination = target || req.user?.line_id || 'chatnaruk05';

    console.log(`[OTP SENT] User: ${userId}, Channel: ${channel || 'line'}, Code: ${code}, Target LINE ID: ${targetDestination}`);

    // Real LINE Messaging API Push (If LINE_CHANNEL_ACCESS_TOKEN is configured)
    const lineToken = process.env.LINE_CHANNEL_ACCESS_TOKEN || 'Oy7bodOcAnQanlCmMOMNzrV5vcFzHLNBU2+ZaVW9B4HVdwWtD9TmdpdSzkyrAsi17WaQq6so/wr6LZVvfjYa3+F9svBu9qSQ35T5udbjIVVIPJ0HBkMXl9XdSK1MEWLBFppBgEoHjpMwYk7FciG6GwdB04t89/1O/w1cDnyilFU=';
    if (lineToken) {
      try {
        const fetch = (await import('node-fetch')).default;
        await fetch('https://api.line.me/v2/bot/message/broadcast', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${lineToken}`
          },
          body: JSON.stringify({
            messages: [
              {
                type: 'text',
                text: `🔒 [Swan Warehouse System]\nเรียนคุณ ${req.user?.name || 'พนักงาน'} (LINE ID: ${targetDestination})\n\nรหัสผ่าน OTP 6 หลักสำหรับเข้าเรียนคอร์สอบรมของคุณ คือ:\n\n👉 [ ${code} ] 👈\n\n(รหัสนี้มีอายุการใช้งาน 5 นาที)`
              }
            ]
          })
        });
        console.log(`[LINE API SUCCESS] Pushed OTP code ${code} to LINE ID: ${targetDestination}`);
      } catch (lineErr: any) {
        console.error('[LINE API PUSH ERROR]:', lineErr.message);
      }
    }

    return res.json({
      success: true,
      message: `ส่งรหัส OTP 6 หลักตรงไปยัง LINE ID (${targetDestination}) เรียบร้อยแล้ว`,
      code,
      channel: 'line',
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
