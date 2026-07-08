import { Router, Response } from 'express';
import { query, getMockStatus, mockStore } from '../config/db';
import { authenticateToken, requireRole, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

/**
 * @swagger
 * /api/tasks:
 *   get:
 *     summary: Retrieve daily tasks (filtered for employee or comprehensive for supervisor)
 */
router.get('/', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id;
  const userRole = req.user?.role;

  try {
    if (getMockStatus()) {
      throw new Error('MOCK_MODE');
    }

    let qStr = '';
    let params: any[] = [];

    if (userRole === 'employee') {
      qStr = `
        SELECT t.*, u.name as employee_name 
        FROM daily_tasks t 
        JOIN users u ON t.employee_id = u.id 
        WHERE t.employee_id = $1 
          AND u.employee_id NOT IN ('EMP001', 'EMP002', 'EMP003', 'EMP004', 'EMP005', 'EMP006', 'EMP007', 'EMP008', 'EMP009', 'EMP010')
        ORDER BY t.due_date DESC, t.id DESC
      `;
      params = [userId];
    } else {
      qStr = `
        SELECT t.*, u.name as employee_name, u.employee_id as emp_code
        FROM daily_tasks t 
        JOIN users u ON t.employee_id = u.id 
        WHERE u.employee_id NOT IN ('EMP001', 'EMP002', 'EMP003', 'EMP004', 'EMP005', 'EMP006', 'EMP007', 'EMP008', 'EMP009', 'EMP010')
        ORDER BY t.due_date DESC, t.id DESC
      `;
    }

    const tasksResult = await query(qStr, params);
    return res.json(tasksResult.rows);

  } catch (err: any) {
    // Mock Mode Fallback
    if (userRole === 'employee') {
      const list = mockStore.mockDailyTasks
        .filter(t => t.employee_id === userId)
        .filter(t => mockStore.mockUsers.some(u => u.id === t.employee_id && !['EMP001', 'EMP002', 'EMP003', 'EMP004', 'EMP005', 'EMP006', 'EMP007', 'EMP008', 'EMP009', 'EMP010'].includes(u.employee_id)))
        .map(t => {
          const emp = mockStore.mockUsers.find(u => u.id === t.employee_id);
          return { ...t, employee_name: emp ? emp.name : 'Unknown' };
        });
      return res.json(list);
    } else {
      const list = mockStore.mockDailyTasks
        .filter(t => mockStore.mockUsers.some(u => u.id === t.employee_id && !['EMP001', 'EMP002', 'EMP003', 'EMP004', 'EMP005', 'EMP006', 'EMP007', 'EMP008', 'EMP009', 'EMP010'].includes(u.employee_id)))
        .map(t => {
          const emp = mockStore.mockUsers.find(u => u.id === t.employee_id);
          return {
            ...t,
            employee_name: emp ? emp.name : 'Unknown',
            emp_code: emp ? emp.employee_id : ''
          };
        });
      return res.json(list);
    }
  }
});

/**
 * @swagger
 * /api/tasks:
 *   post:
 *     summary: Assign a new warehouse task
 */
router.post('/', authenticateToken, requireRole(['admin', 'staff']), async (req: AuthenticatedRequest, res: Response) => {
  const { employee_id, employee_ids, task_name, category, description, due_date } = req.body;

  if ((!employee_id && (!employee_ids || employee_ids.length === 0)) || !task_name || !category || !due_date) {
    return res.status(400).json({ message: 'employee_id or employee_ids, task_name, category, and due_date are required.' });
  }

  const targetIds: number[] = employee_ids && Array.isArray(employee_ids)
    ? employee_ids.map((id: any) => parseInt(id, 10))
    : [parseInt(employee_id, 10)];

  const createdTasks: any[] = [];

  try {
    if (getMockStatus()) {
      throw new Error('MOCK_MODE');
    }

    for (const empId of targetIds) {
      const result = await query(
        `INSERT INTO daily_tasks (employee_id, task_name, category, description, due_date, status) 
         VALUES ($1, $2, $3, $4, $5, 'pending') 
         RETURNING *`,
        [empId, task_name, category, description || '', due_date]
      );
      createdTasks.push(result.rows[0]);
    }
    return res.status(201).json(createdTasks.length === 1 ? createdTasks[0] : createdTasks);

  } catch (err: any) {
    // Mock Mode Fallback
    for (const empId of targetIds) {
      const newId = mockStore.mockDailyTasks.reduce((max, t) => t.id > max ? t.id : max, 0) + 1;
      const newTask = {
        id: newId,
        employee_id: empId,
        task_name,
        category,
        description: description || '',
        status: 'pending' as const,
        progress_percentage: 0,
        supervisor_approved: false,
        due_date,
        created_at: new Date().toISOString()
      };
      mockStore.mockDailyTasks.push(newTask);
      createdTasks.push(newTask);
    }
    return res.status(201).json(createdTasks.length === 1 ? createdTasks[0] : createdTasks);
  }
});

/**
 * @swagger
 * /api/tasks/:id/progress:
 *   put:
 *     summary: Employee updates task progress
 */
router.put('/:id/progress', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  const taskId = parseInt(req.params.id, 10);
  const employeeId = req.user?.id;
  const { progress_percentage, proof_file } = req.body;

  if (progress_percentage === undefined) {
    return res.status(400).json({ message: 'progress_percentage is required.' });
  }

  const pct = parseInt(progress_percentage, 10);
  const status = pct === 100 ? 'completed' : pct > 0 ? 'in_progress' : 'pending';

  try {
    if (getMockStatus()) {
      throw new Error('MOCK_MODE');
    }

    const updateQuery = `
      UPDATE daily_tasks 
      SET progress_percentage = $1, status = $2, proof_file = COALESCE($3, proof_file), updated_at = NOW() 
      WHERE id = $4 AND employee_id = $5 
      RETURNING *
    `;
    const result = await query(updateQuery, [pct, status, proof_file || null, taskId, employeeId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Task not found or not assigned to you.' });
    }
    return res.json(result.rows[0]);

  } catch (err: any) {
    // Mock Mode Fallback
    const index = mockStore.mockDailyTasks.findIndex(t => t.id === taskId);
    if (index === -1) {
      return res.status(404).json({ message: 'Task not found (Mock).' });
    }

    const task = mockStore.mockDailyTasks[index];
    if (req.user?.role === 'employee' && task.employee_id !== employeeId) {
      return res.status(403).json({ message: 'Unauthorized. You cannot update someone else\'s task.' });
    }

    task.progress_percentage = pct;
    task.status = status;
    if (proof_file !== undefined) {
      task.proof_file = proof_file;
    }
    return res.json(task);
  }
});

/**
 * @swagger
 * /api/tasks/:id/approve:
 *   post:
 *     summary: Supervisor approves a completed daily task
 */
router.post('/:id/approve', authenticateToken, requireRole(['admin', 'staff']), async (req: AuthenticatedRequest, res: Response) => {
  const taskId = parseInt(req.params.id, 10);
  const supervisorId = req.user?.id;

  try {
    if (getMockStatus()) {
      throw new Error('MOCK_MODE');
    }

    const approveQuery = `
      UPDATE daily_tasks 
      SET supervisor_approved = TRUE, approved_by = $1, approved_at = NOW(), updated_at = NOW() 
      WHERE id = $2 
      RETURNING *
    `;
    const result = await query(approveQuery, [supervisorId, taskId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Task not found.' });
    }

    const task = result.rows[0];
    
    // Auto-save proof_file to warehouse documents if present on approval
    if (task.proof_file) {
      try {
        const empRes = await query('SELECT name FROM users WHERE id = $1', [task.employee_id]);
        const uploaderName = empRes.rows.length > 0 ? empRes.rows[0].name : 'Employee';
        
        await query(
          `INSERT INTO documents (title, category, file_url, uploaded_by) 
           VALUES ($1, $2, $3, $4)`,
          [task.task_name, task.category, task.proof_file, `${uploaderName} (ส่งงาน)`]
        );
        console.log(`Automatically copied task proof to documents: ${task.task_name}`);
      } catch (docErr: any) {
        console.error('Failed to auto-copy task proof to documents table:', docErr.message);
      }
    }

    return res.json(task);

  } catch (err: any) {
    // Mock Mode Fallback
    const index = mockStore.mockDailyTasks.findIndex(t => t.id === taskId);
    if (index === -1) {
      return res.status(404).json({ message: 'Task not found (Mock).' });
    }

    const task = mockStore.mockDailyTasks[index];
    task.supervisor_approved = true;
    task.approved_by = supervisorId;
    task.approved_at = new Date().toISOString();

    // Auto-save to mockDocuments
    if (task.proof_file) {
      const emp = mockStore.mockUsers.find(u => u.id === task.employee_id);
      const uploaderName = emp ? emp.name : 'Employee';
      const newDocId = (mockStore.mockDocuments || []).reduce((max, d) => d.id > max ? d.id : max, 0) + 1;
      
      mockStore.mockDocuments.push({
        id: newDocId,
        title: task.task_name,
        category: task.category as any,
        file_url: task.proof_file,
        uploaded_by: `${uploaderName} (ส่งงาน)`,
        uploaded_at: new Date().toISOString()
      });
    }

    return res.json(task);
  }
});

/**
 * POST /api/tasks/:id/reject
 * Supervisor rejects/fails a completed daily task, resetting progress
 */
router.post('/:id/reject', authenticateToken, requireRole(['admin', 'staff']), async (req: AuthenticatedRequest, res: Response) => {
  const taskId = parseInt(req.params.id, 10);
  try {
    if (getMockStatus()) {
      throw new Error('MOCK_MODE');
    }

    const rejectQuery = `
      UPDATE daily_tasks 
      SET supervisor_approved = FALSE, status = 'in_progress', progress_percentage = 50, updated_at = NOW(), proof_file = NULL 
      WHERE id = $1 
      RETURNING *
    `;
    const result = await query(rejectQuery, [taskId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Task not found.' });
    }
    return res.json(result.rows[0]);

  } catch (err: any) {
    // Mock Mode Fallback
    const index = mockStore.mockDailyTasks.findIndex(t => t.id === taskId);
    if (index === -1) {
      return res.status(404).json({ message: 'Task not found (Mock).' });
    }

    const task = mockStore.mockDailyTasks[index];
    task.supervisor_approved = false;
    task.status = 'in_progress';
    task.progress_percentage = 50;
    task.proof_file = undefined;

    return res.json(task);
  }
});

/**
 * DELETE /api/tasks/:id
 * Admin/Staff deletes an assigned daily task
 */
router.delete('/:id', authenticateToken, requireRole(['admin', 'staff']), async (req: AuthenticatedRequest, res: Response) => {
  const taskId = parseInt(req.params.id, 10);
  try {
    if (getMockStatus()) {
      throw new Error('MOCK_MODE');
    }

    const deleteResult = await query('DELETE FROM daily_tasks WHERE id = $1 RETURNING *', [taskId]);
    if (deleteResult.rows.length === 0) {
      return res.status(404).json({ message: 'Task not found.' });
    }
    return res.json({ message: 'Task deleted successfully.' });

  } catch (err: any) {
    // Mock Mode Fallback
    const index = mockStore.mockDailyTasks.findIndex(t => t.id === taskId);
    if (index === -1) {
      return res.status(404).json({ message: 'Task not found (Mock).' });
    }

    mockStore.mockDailyTasks.splice(index, 1);
    return res.json({ message: 'Task deleted successfully (Mock).' });
  }
});

export default router;
