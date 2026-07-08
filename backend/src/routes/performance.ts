import { Router, Response } from 'express';
import { query, getMockStatus, mockStore } from '../config/db';
import { authenticateToken, requireRole, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

router.get('/temp-debug-perf', async (req: any, res: any) => {
  try {
    const listRes = await query(`
      SELECT 
        u.id, 
        u.employee_id, 
        u.name, 
        u.photo_url, 
        u.department, 
        u.position, 
        u.role,
        COALESCE(u.evaluation_score, 100) as evaluation_score,
        COALESCE(u.accumulated_points, 0) as accumulated_points,
        COALESCE(u.absent_count, 0) as absent_count,
        COALESCE(u.leave_count, 0) as leave_count,
        COALESCE(u.late_count, 0) as late_count,
        COALESCE(u.warning_letters, 0) as warning_letters,
        (SELECT COUNT(*) FROM daily_tasks t WHERE t.employee_id = u.id AND t.status = 'completed') as completed_tasks,
        (SELECT COUNT(*) FROM enrollments e WHERE e.employee_id = u.id AND e.status = 'completed') as completed_courses,
        (SELECT COUNT(*) FROM quiz_attempts q WHERE q.employee_id = u.id AND q.passed = TRUE) as passed_quizzes
      FROM users u
      WHERE u.role IN ('employee', 'staff') 
        AND u.department != 'Management'
        AND u.employee_id NOT IN ('EMP001', 'EMP002', 'EMP003', 'EMP004', 'EMP005', 'EMP006', 'EMP007', 'EMP008', 'EMP009', 'EMP010')
      ORDER BY u.id ASC
    `);
    return res.json(listRes.rows);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Helper to get current performance settings
async function getPerformanceSettings() {
  if (getMockStatus()) {
    return mockStore.mockPerformanceSettings[0];
  }
  const result = await query('SELECT * FROM performance_settings ORDER BY id ASC LIMIT 1');
  if (result.rows.length === 0) {
    // Fallback if not seeded
    return { points_per_task: 10, points_per_course: 20, points_per_quiz: 15 };
  }
  return result.rows[0];
}

/**
 * GET /api/performance/settings
 * Retrieve point configuration rules
 */
router.get('/settings', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const settings = await getPerformanceSettings();
    return res.json(settings);
  } catch (err: any) {
    console.error('Error fetching performance settings:', err);
    return res.status(500).json({ message: 'Internal server error: ' + err.message });
  }
});

/**
 * PUT /api/performance/settings
 * Update point configuration rules (Admin/Staff only)
 */
router.put('/settings', authenticateToken, requireRole(['admin', 'staff']), async (req: AuthenticatedRequest, res: Response) => {
  const { points_per_task, points_per_course, points_per_quiz } = req.body;

  if (points_per_task === undefined || points_per_course === undefined || points_per_quiz === undefined) {
    return res.status(400).json({ message: 'All point settings must be specified.' });
  }

  try {
    if (getMockStatus()) {
      mockStore.mockPerformanceSettings[0] = {
        id: 1,
        points_per_task: parseInt(points_per_task, 10),
        points_per_course: parseInt(points_per_course, 10),
        points_per_quiz: parseInt(points_per_quiz, 10)
      };
      return res.json(mockStore.mockPerformanceSettings[0]);
    }

    const result = await query(
      `UPDATE performance_settings 
       SET points_per_task = $1, points_per_course = $2, points_per_quiz = $3 
       WHERE id = 1 RETURNING *`,
      [parseInt(points_per_task, 10), parseInt(points_per_course, 10), parseInt(points_per_quiz, 10)]
    );
    return res.json(result.rows[0]);

  } catch (err: any) {
    console.error('Error updating performance settings:', err);
    return res.status(500).json({ message: 'Database error: ' + err.message });
  }
});

/**
 * GET /api/performance/my-stats
 * Get performance statistics for the logged-in employee
 */
router.get('/my-stats', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ message: 'Unauthorized' });

  try {
    const settings = await getPerformanceSettings();

    if (getMockStatus()) {
      const user = mockStore.mockUsers.find(u => u.id === userId);
      if (!user) return res.status(404).json({ message: 'User not found' });

      const completedTasks = mockStore.mockDailyTasks.filter(t => t.employee_id === userId && t.status === 'completed').length;
      const completedCourses = mockStore.mockEnrollments.filter(e => e.employee_id === userId && e.status === 'completed').length;
      const passedQuizzes = mockStore.mockQuizAttempts.filter(q => q.employee_id === userId && q.passed).length;
      
      return res.json({
        id: user.id,
        employee_id: user.employee_id,
        name: user.name,
        photo_url: user.photo_url,
        department: user.department,
        position: user.position,
        role: user.role,
        evaluation_score: user.evaluation_score !== undefined ? user.evaluation_score : 100,
        accumulated_points: user.accumulated_points !== undefined ? user.accumulated_points : 0,
        absent_count: user.absent_count !== undefined ? user.absent_count : 0,
        leave_count: user.leave_count !== undefined ? user.leave_count : 0,
        late_count: user.late_count !== undefined ? user.late_count : 0,
        warning_letters: user.warning_letters !== undefined ? user.warning_letters : 0,
        completed_tasks: completedTasks,
        completed_courses: completedCourses,
        passed_quizzes: passedQuizzes,
        settings
      });
    }

    // Live SQL Queries
    const userRes = await query(
      `SELECT id, employee_id, name, photo_url, department, position, role, 
              COALESCE(evaluation_score, 100) as evaluation_score, 
              COALESCE(accumulated_points, 0) as accumulated_points, 
              COALESCE(absent_count, 0) as absent_count, 
              COALESCE(leave_count, 0) as leave_count, 
              COALESCE(late_count, 0) as late_count, 
              COALESCE(warning_letters, 0) as warning_letters 
       FROM users WHERE id = $1`, 
      [userId]
    );
    if (userRes.rows.length === 0) return res.status(404).json({ message: 'User not found' });
    const user = userRes.rows[0];

    const tasksRes = await query("SELECT COUNT(*) as count FROM daily_tasks WHERE employee_id = $1 AND status = 'completed'", [userId]);
    const completedTasks = parseInt(tasksRes.rows[0].count, 10) || 0;

    const coursesRes = await query("SELECT COUNT(*) as count FROM enrollments WHERE employee_id = $1 AND status = 'completed'", [userId]);
    const completedCourses = parseInt(coursesRes.rows[0].count, 10) || 0;

    const quizzesRes = await query("SELECT COUNT(*) as count FROM quiz_attempts WHERE employee_id = $1 AND passed = TRUE", [userId]);
    const passedQuizzes = parseInt(quizzesRes.rows[0].count, 10) || 0;

    return res.json({
      id: user.id,
      employee_id: user.employee_id,
      name: user.name,
      photo_url: user.photo_url,
      department: user.department,
      position: user.position,
      role: user.role,
      evaluation_score: user.evaluation_score,
      accumulated_points: user.accumulated_points,
      absent_count: user.absent_count,
      leave_count: user.leave_count,
      late_count: user.late_count,
      warning_letters: user.warning_letters,
      completed_tasks: completedTasks,
      completed_courses: completedCourses,
      passed_quizzes: passedQuizzes,
      settings
    });

  } catch (err: any) {
    console.error('Error fetching user performance stats:', err);
    return res.status(500).json({ message: 'Database error: ' + err.message });
  }
});

/**
 * GET /api/performance/employees
 * Get summary stats for all employees and staff (Admin/Staff only)
 */
router.get('/employees', authenticateToken, requireRole(['admin', 'staff']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const settings = await getPerformanceSettings();

    if (getMockStatus()) {
      const list = mockStore.mockUsers.filter(u => (u.role === 'employee' || u.role === 'staff') && u.department !== 'Management' && !['EMP001', 'EMP002', 'EMP003', 'EMP004', 'EMP005', 'EMP006', 'EMP007', 'EMP008', 'EMP009', 'EMP010'].includes(u.employee_id)).map(user => {
        const completedTasks = mockStore.mockDailyTasks.filter(t => t.employee_id === user.id && t.status === 'completed').length;
        const completedCourses = mockStore.mockEnrollments.filter(e => e.employee_id === user.id && e.status === 'completed').length;
        const passedQuizzes = mockStore.mockQuizAttempts.filter(q => q.employee_id === user.id && q.passed).length;
        
        return {
          id: user.id,
          employee_id: user.employee_id,
          name: user.name,
          photo_url: user.photo_url,
          department: user.department,
          position: user.position,
          role: user.role,
          evaluation_score: user.evaluation_score !== undefined ? user.evaluation_score : 100,
          accumulated_points: user.accumulated_points !== undefined ? user.accumulated_points : 0,
          absent_count: user.absent_count !== undefined ? user.absent_count : 0,
          leave_count: user.leave_count !== undefined ? user.leave_count : 0,
          late_count: user.late_count !== undefined ? user.late_count : 0,
          warning_letters: user.warning_letters !== undefined ? user.warning_letters : 0,
          completed_tasks: completedTasks,
          completed_courses: completedCourses,
          passed_quizzes: passedQuizzes
        };
      });
      return res.json(list);
    }

    // SQL optimized query to pull employee and staff roles
    const listRes = await query(`
      SELECT 
        u.id, 
        u.employee_id, 
        u.name, 
        u.photo_url, 
        u.department, 
        u.position, 
        u.role,
        COALESCE(u.evaluation_score, 100) as evaluation_score,
        COALESCE(u.accumulated_points, 0) as accumulated_points,
        COALESCE(u.absent_count, 0) as absent_count,
        COALESCE(u.leave_count, 0) as leave_count,
        COALESCE(u.late_count, 0) as late_count,
        COALESCE(u.warning_letters, 0) as warning_letters,
        (SELECT COUNT(*) FROM daily_tasks t WHERE t.employee_id = u.id AND t.status = 'completed') as completed_tasks,
        (SELECT COUNT(*) FROM enrollments e WHERE e.employee_id = u.id AND e.status = 'completed') as completed_courses,
        (SELECT COUNT(*) FROM quiz_attempts q WHERE q.employee_id = u.id AND q.passed = TRUE) as passed_quizzes
      FROM users u
      WHERE u.role IN ('employee', 'staff') 
        AND u.department != 'Management'
        AND u.employee_id NOT IN ('EMP001', 'EMP002', 'EMP003', 'EMP004', 'EMP005', 'EMP006', 'EMP007', 'EMP008', 'EMP009', 'EMP010')
      ORDER BY u.id ASC
    `);

    const list = listRes.rows.map((user: any) => {
      const completed_tasks = parseInt(user.completed_tasks, 10) || 0;
      const completed_courses = parseInt(user.completed_courses, 10) || 0;
      const passed_quizzes = parseInt(user.passed_quizzes, 10) || 0;
      return {
        ...user,
        completed_tasks,
        completed_courses,
        passed_quizzes
      };
    });

    return res.json(list);

  } catch (err: any) {
    console.error('Error fetching employees performance summaries:', err);
    return res.status(500).json({ message: 'Database error: ' + err.message });
  }
});

/**
 * PUT /api/performance/employee/:id
 * Update score and attendance stats for an employee/staff (Admin/Staff only)
 */
router.put('/employee/:id', authenticateToken, requireRole(['admin', 'staff']), async (req: AuthenticatedRequest, res: Response) => {
  const employeeId = parseInt(req.params.id, 10);
  const { 
    evaluation_score, 
    accumulated_points, 
    absent_count, 
    leave_count, 
    late_count, 
    warning_letters 
  } = req.body;

  try {
    if (getMockStatus()) {
      const userIndex = mockStore.mockUsers.findIndex(u => u.id === employeeId);
      if (userIndex === -1) {
        return res.status(404).json({ message: 'Employee not found.' });
      }
      const user = mockStore.mockUsers[userIndex];
      if (evaluation_score !== undefined) user.evaluation_score = parseInt(evaluation_score, 10);
      if (accumulated_points !== undefined) user.accumulated_points = parseInt(accumulated_points, 10);
      if (absent_count !== undefined) user.absent_count = parseInt(absent_count, 10);
      if (leave_count !== undefined) user.leave_count = parseInt(leave_count, 10);
      if (late_count !== undefined) user.late_count = parseInt(late_count, 10);
      if (warning_letters !== undefined) user.warning_letters = parseInt(warning_letters, 10);

      return res.json(user);
    }

    // Dynamic SQL update query
    const updates: string[] = [];
    const values: any[] = [];
    let valIdx = 1;

    if (evaluation_score !== undefined) {
      updates.push(`evaluation_score = $${valIdx++}`);
      values.push(parseInt(evaluation_score, 10));
    }
    if (accumulated_points !== undefined) {
      updates.push(`accumulated_points = $${valIdx++}`);
      values.push(parseInt(accumulated_points, 10));
    }
    if (absent_count !== undefined) {
      updates.push(`absent_count = $${valIdx++}`);
      values.push(parseInt(absent_count, 10));
    }
    if (leave_count !== undefined) {
      updates.push(`leave_count = $${valIdx++}`);
      values.push(parseInt(leave_count, 10));
    }
    if (late_count !== undefined) {
      updates.push(`late_count = $${valIdx++}`);
      values.push(parseInt(late_count, 10));
    }
    if (warning_letters !== undefined) {
      updates.push(`warning_letters = $${valIdx++}`);
      values.push(parseInt(warning_letters, 10));
    }

    if (updates.length === 0) {
      return res.status(400).json({ message: 'No fields to update.' });
    }

    values.push(employeeId);
    const queryStr = `UPDATE users SET ${updates.join(', ')} WHERE id = $${valIdx} RETURNING *`;
    const result = await query(queryStr, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Employee not found.' });
    }

    return res.json(result.rows[0]);

  } catch (err: any) {
    console.error('Error updating employee stats:', err);
    return res.status(500).json({ message: 'Database error: ' + err.message });
  }
});

export default router;
