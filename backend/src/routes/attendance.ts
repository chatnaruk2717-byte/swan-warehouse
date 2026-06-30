import { Router, Response } from 'express';
import { query, getMockStatus, mockStore } from '../config/db';
import { authenticateToken, AuthenticatedRequest, requireRole } from '../middleware/auth';

const router = Router();

/**
 * @swagger
 * /api/attendance/today:
 *   get:
 *     summary: Retrieve today's attendance record for the logged-in employee
 */
router.get('/today', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id;
  const todayStr = new Date().toISOString().split('T')[0];

  try {
    if (getMockStatus()) {
      throw new Error('MOCK_MODE');
    }

    const result = await query(
      'SELECT * FROM working_hours WHERE employee_id = $1 AND date = $2',
      [userId, todayStr]
    );

    if (result.rows.length === 0) {
      return res.json(null);
    }
    return res.json(result.rows[0]);

  } catch (err: any) {
    // Mock Mode Fallback
    const record = mockStore.mockWorkingHours.find(
      w => w.employee_id === userId && w.date === todayStr
    );
    return res.json(record || null);
  }
});

/**
 * @swagger
 * /api/attendance/clock-in:
 *   post:
 *     summary: Clock in for the day
 */
router.post('/clock-in', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id;
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0];

  // Fetch employee shift
  let shift = 'A';
  try {
    const userRes = await query('SELECT working_shift FROM users WHERE id = $1', [userId]);
    shift = userRes.rows[0]?.working_shift || 'A';
  } catch {
    const mockUser = mockStore.mockUsers.find(u => u.id === userId);
    shift = mockUser?.working_shift || 'A';
  }

  // Determine status (Late if clocking in after 07:30 AM for Shift A, or 07:30 PM for Shift B)
  const hours = now.getHours();
  const minutes = now.getMinutes();
  let status = 'present';

  if (shift === 'A') {
    // Shift A: 07:30
    if (hours > 7 || (hours === 7 && minutes > 30)) {
      status = 'late';
    }
  } else {
    // Shift B: 19:30
    if (hours > 19 || (hours === 19 && minutes > 30)) {
      status = 'late';
    }
  }

  try {
    if (getMockStatus()) {
      throw new Error('MOCK_MODE');
    }

    const result = await query(
      `INSERT INTO working_hours (employee_id, clock_in, date, status, ot_hours) 
       VALUES ($1, $2, $3, $4, 0.00) 
       ON CONFLICT (employee_id, date) DO UPDATE SET clock_in = EXCLUDED.clock_in, status = EXCLUDED.status
       RETURNING *`,
      [userId, now, dateStr, status]
    );

    return res.status(201).json(result.rows[0]);

  } catch (err: any) {
    // Mock Mode Fallback
    const existingIndex = mockStore.mockWorkingHours.findIndex(
      w => w.employee_id === userId && w.date === dateStr
    );

    const record = {
      id: existingIndex !== -1 ? mockStore.mockWorkingHours[existingIndex].id : mockStore.mockWorkingHours.length + 1,
      employee_id: userId!,
      clock_in: now.toISOString(),
      date: dateStr,
      status: status as any,
      ot_hours: 0
    };

    if (existingIndex !== -1) {
      mockStore.mockWorkingHours[existingIndex] = record;
    } else {
      mockStore.mockWorkingHours.push(record);
    }

    return res.status(201).json(record);
  }
});

/**
 * @swagger
 * /api/attendance/clock-out:
 *   post:
 *     summary: Clock out for the day
 */
router.post('/clock-out', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id;
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0];

  // Fetch employee shift
  let shift = 'A';
  try {
    const userRes = await query('SELECT working_shift FROM users WHERE id = $1', [userId]);
    shift = userRes.rows[0]?.working_shift || 'A';
  } catch {
    const mockUser = mockStore.mockUsers.find(u => u.id === userId);
    shift = mockUser?.working_shift || 'A';
  }

  try {
    if (getMockStatus()) {
      throw new Error('MOCK_MODE');
    }

    // Retrieve active clock-in record (where clock_out is NULL)
    const activeShiftResult = await query(
      'SELECT * FROM working_hours WHERE employee_id = $1 AND clock_out IS NULL ORDER BY date DESC LIMIT 1',
      [userId]
    );

    if (activeShiftResult.rows.length === 0) {
      return res.status(400).json({ message: 'You have not clocked in for today.' });
    }

    const activeRecord = activeShiftResult.rows[0];
    const clockInTime = new Date(activeRecord.clock_in);

    // Calculate Shift End Date object
    const shiftEnd = new Date(clockInTime);
    if (shift === 'A') {
      shiftEnd.setHours(15, 30, 0, 0);
    } else {
      // Shift B Ends at 03:30 of next day (Start at 19:30 + 8 hours)
      shiftEnd.setHours(19, 30, 0, 0);
      shiftEnd.setTime(shiftEnd.getTime() + 8 * 60 * 60 * 1000);
    }

    let otHours = 0.00;
    if (now.getTime() > shiftEnd.getTime()) {
      const diffMs = now.getTime() - shiftEnd.getTime();
      otHours = Math.round((diffMs / (1000 * 60 * 60)) * 100) / 100;
    }

    const result = await query(
      `UPDATE working_hours 
       SET clock_out = $1, ot_hours = $2 
       WHERE id = $3 
       RETURNING *`,
      [now, otHours, activeRecord.id]
    );

    return res.json(result.rows[0]);

  } catch (err: any) {
    // Mock Mode Fallback
    const existingIndex = mockStore.mockWorkingHours.findIndex(
      w => w.employee_id === userId && !w.clock_out
    );

    if (existingIndex === -1) {
      return res.status(400).json({ message: 'You have not clocked in for today (Mock).' });
    }

    const record = mockStore.mockWorkingHours[existingIndex];
    record.clock_out = now.toISOString();

    const clockInTime = new Date(record.clock_in);
    const shiftEnd = new Date(clockInTime);
    if (shift === 'A') {
      shiftEnd.setHours(15, 30, 0, 0);
    } else {
      shiftEnd.setHours(19, 30, 0, 0);
      shiftEnd.setTime(shiftEnd.getTime() + 8 * 60 * 60 * 1000);
    }

    let otHours = 0.00;
    if (now.getTime() > shiftEnd.getTime()) {
      const diffMs = now.getTime() - shiftEnd.getTime();
      otHours = Math.round((diffMs / (1000 * 60 * 60)) * 100) / 100;
    }
    record.ot_hours = otHours;

    return res.json(record);
  }
});

/**
 * @swagger
 * /api/attendance/break-start:
 *   post:
 *     summary: Log break start time
 */
router.post('/break-start', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id;
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0];

  try {
    if (getMockStatus()) {
      throw new Error('MOCK_MODE');
    }

    const result = await query(
      `UPDATE working_hours SET break_start = $1 WHERE employee_id = $2 AND date = $3 RETURNING *`,
      [now, userId, dateStr]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ message: 'No attendance record found for today. Please clock in first.' });
    }
    return res.json(result.rows[0]);

  } catch (err: any) {
    const existingIndex = mockStore.mockWorkingHours.findIndex(
      w => w.employee_id === userId && w.date === dateStr
    );

    if (existingIndex === -1) {
      return res.status(400).json({ message: 'No attendance record found for today (Mock). Please clock in first.' });
    }

    const record = mockStore.mockWorkingHours[existingIndex];
    record.break_start = now.toISOString();
    return res.json(record);
  }
});

/**
 * @swagger
 * /api/attendance/break-end:
 *   post:
 *     summary: Log break end time
 */
router.post('/break-end', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id;
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0];

  try {
    if (getMockStatus()) {
      throw new Error('MOCK_MODE');
    }

    const result = await query(
      `UPDATE working_hours SET break_end = $1 WHERE employee_id = $2 AND date = $3 RETURNING *`,
      [now, userId, dateStr]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ message: 'No attendance record found for today. Please clock in first.' });
    }
    return res.json(result.rows[0]);

  } catch (err: any) {
    const existingIndex = mockStore.mockWorkingHours.findIndex(
      w => w.employee_id === userId && w.date === dateStr
    );

    if (existingIndex === -1) {
      return res.status(400).json({ message: 'No attendance record found for today (Mock). Please clock in first.' });
    }

    const record = mockStore.mockWorkingHours[existingIndex];
    record.break_end = now.toISOString();
    return res.json(record);
  }
});

/**
 * @swagger
 * /api/attendance/employee/:id:
 *   get:
 *     summary: Get attendance history for a specific employee
 */
router.get('/employee/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  const empId = parseInt(req.params.id, 10);

  try {
    if (getMockStatus()) {
      throw new Error('MOCK_MODE');
    }

    const result = await query(
      `SELECT w.*, u.working_shift 
       FROM working_hours w 
       JOIN users u ON w.employee_id = u.id 
       WHERE w.employee_id = $1 
       ORDER BY w.date DESC LIMIT 100`,
      [empId]
    );
    return res.json(result.rows);

  } catch (err: any) {
    const list = mockStore.mockWorkingHours
      .filter(w => w.employee_id === empId)
      .map(w => {
        const u = mockStore.mockUsers.find(usr => usr.id === w.employee_id);
        return {
          ...w,
          working_shift: u ? u.working_shift : 'A'
        };
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return res.json(list);
  }
});

/**
 * POST /api/attendance/manual
 * Add attendance manually (for admin/staff)
 */
router.post('/manual', authenticateToken, requireRole(['admin', 'staff']), async (req: AuthenticatedRequest, res: Response) => {
  const { employee_id, date, clock_in, clock_out, status, ot_hours } = req.body;

  if (!employee_id || !date || !clock_in) {
    return res.status(400).json({ message: 'employee_id, date, and clock_in are required.' });
  }

  const empId = parseInt(employee_id, 10);
  const ot = parseFloat(ot_hours) || 0.00;
  const stat = status || 'present';

  try {
    if (getMockStatus()) {
      throw new Error('MOCK_MODE');
    }

    const result = await query(
      `INSERT INTO working_hours (employee_id, date, clock_in, clock_out, status, ot_hours) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       ON CONFLICT (employee_id, date) DO UPDATE 
       SET clock_in = EXCLUDED.clock_in, clock_out = EXCLUDED.clock_out, status = EXCLUDED.status, ot_hours = EXCLUDED.ot_hours
       RETURNING *`,
      [empId, date, clock_in, clock_out || null, stat, ot]
    );

    return res.status(201).json(result.rows[0]);

  } catch (err: any) {
    // Mock Mode Fallback
    const existingIndex = mockStore.mockWorkingHours.findIndex(
      w => w.employee_id === empId && w.date === date
    );

    const record = {
      id: existingIndex !== -1 ? mockStore.mockWorkingHours[existingIndex].id : mockStore.mockWorkingHours.length + 1,
      employee_id: empId,
      date,
      clock_in,
      clock_out: clock_out || undefined,
      status: stat,
      ot_hours: ot
    };

    if (existingIndex !== -1) {
      mockStore.mockWorkingHours[existingIndex] = record;
    } else {
      mockStore.mockWorkingHours.push(record);
    }

    return res.status(201).json(record);
  }
});

/**
 * POST /api/attendance/import
 * Import attendance records in bulk
 */
router.post('/import', authenticateToken, requireRole(['admin', 'staff']), async (req: AuthenticatedRequest, res: Response) => {
  const { records } = req.body;

  if (!records || !Array.isArray(records)) {
    return res.status(400).json({ message: 'records array is required.' });
  }

  const results: any[] = [];

  for (const item of records) {
    const { employee_id, date, clock_in, clock_out, status, ot_hours } = item;
    if (!employee_id || !date || !clock_in) continue;

    const empId = parseInt(employee_id, 10);
    const ot = parseFloat(ot_hours) || 0.00;
    const stat = status || 'present';

    try {
      if (getMockStatus()) {
        throw new Error('MOCK_MODE');
      }

      const result = await query(
        `INSERT INTO working_hours (employee_id, date, clock_in, clock_out, status, ot_hours) 
         VALUES ($1, $2, $3, $4, $5, $6) 
         ON CONFLICT (employee_id, date) DO UPDATE 
         SET clock_in = EXCLUDED.clock_in, clock_out = EXCLUDED.clock_out, status = EXCLUDED.status, ot_hours = EXCLUDED.ot_hours
         RETURNING *`,
        [empId, date, clock_in, clock_out || null, stat, ot]
      );
      results.push(result.rows[0]);

    } catch (err: any) {
      // Mock Fallback
      const existingIndex = mockStore.mockWorkingHours.findIndex(
        w => w.employee_id === empId && w.date === date
      );

      const record = {
        id: existingIndex !== -1 ? mockStore.mockWorkingHours[existingIndex].id : mockStore.mockWorkingHours.length + 1,
        employee_id: empId,
        date,
        clock_in,
        clock_out: clock_out || undefined,
        status: stat,
        ot_hours: ot
      };

      if (existingIndex !== -1) {
        mockStore.mockWorkingHours[existingIndex] = record;
      } else {
        mockStore.mockWorkingHours.push(record);
      }
      results.push(record);
    }
  }

  return res.json({ success: true, count: results.length });
});

export default router;
