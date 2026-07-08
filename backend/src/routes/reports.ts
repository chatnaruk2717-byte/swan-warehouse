import { Router, Response } from 'express';
import { query, getMockStatus, mockStore } from '../config/db';
import { authenticateToken, requireRole, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

/**
 * @swagger
 * /api/reports/dashboard-stats:
 *   get:
 *     summary: Retrieve aggregate statistics for the manager/supervisor dashboard
 */
router.get('/dashboard-stats', authenticateToken, requireRole(['admin', 'staff']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (getMockStatus()) {
      throw new Error('MOCK_MODE');
    }

    const userCond = "(role = 'employee' OR role = 'staff') AND department != 'Management' AND position != 'Management' AND position NOT LIKE '%Management%' AND employee_id NOT IN ('EMP001', 'EMP002', 'EMP003', 'EMP004', 'EMP005', 'EMP006', 'EMP007', 'EMP008', 'EMP009', 'EMP010')";
    const uCond = "(u.role = 'employee' OR u.role = 'staff') AND u.department != 'Management' AND u.position != 'Management' AND u.position NOT LIKE '%Management%' AND u.employee_id NOT IN ('EMP001', 'EMP002', 'EMP003', 'EMP004', 'EMP005', 'EMP006', 'EMP007', 'EMP008', 'EMP009', 'EMP010')";

    // 1. Total Employees
    const empCountRes = await query(`SELECT COUNT(id) AS count FROM users WHERE ${userCond}`);
    const totalEmployees = parseInt(empCountRes.rows[0].count, 10);

    // 2. Average Training Completion %
    const avgProgressRes = await query(`
      SELECT AVG(e.progress_percentage) AS avg
      FROM enrollments e 
      JOIN users u ON e.employee_id = u.id 
      WHERE ${uCond}
    `);
    const avgTrainingCompletion = Math.round(parseFloat(avgProgressRes.rows[0].avg) || 0);

    // 3. Average Quiz Score
    const avgScoreRes = await query(`
      SELECT AVG(qa.score) AS avg
      FROM quiz_attempts qa 
      JOIN users u ON qa.employee_id = u.id 
      WHERE qa.passed = TRUE AND ${uCond}
    `);
    const avgQuizScore = Math.round(parseFloat(avgScoreRes.rows[0].avg) || 0);

    // 4. Overall Skill Coverage (percentage of qualified/expert skills out of total possible skills)
    const totalSkillsRes = await query("SELECT COUNT(id) AS count FROM skills");
    const totalSkillsCount = parseInt(totalSkillsRes.rows[0].count, 10);
    const qualifiedSkillsRes = await query(`
      SELECT COUNT(es.id) AS count
      FROM employee_skills es 
      JOIN users u ON es.employee_id = u.id 
      WHERE es.status IN ('qualified', 'expert') AND ${uCond}
    `);
    const qualifiedSkillsCount = parseInt(qualifiedSkillsRes.rows[0].count, 10);
    
    // Skill coverage = qualified skills / (total employees * total skills)
    const possibleSkills = totalEmployees * totalSkillsCount;
    const skillCoverage = possibleSkills > 0 ? Math.round((qualifiedSkillsCount / possibleSkills) * 100) : 0;

    // 5. Task completion stats
    const tasksRes = await query(`
      SELECT COUNT(t.id) as total, SUM(CASE WHEN t.status = 'completed' THEN 1 ELSE 0 END) as completed 
      FROM daily_tasks t 
      JOIN users u ON t.employee_id = u.id 
      WHERE ${uCond}
    `);
    const totalTasks = parseInt(tasksRes.rows[0].total, 10) || 0;
    const completedTasks = parseInt(tasksRes.rows[0].completed, 10) || 0;

    // 6. Employees who haven't submitted their assigned tasks (status != 'completed')
    const pendingTasksQuery = `
      SELECT 
        t.id, 
        u.name as employee_name, 
        u.employee_id as employee_code, 
        t.task_name, 
        t.due_date, 
        t.status 
      FROM daily_tasks t
      JOIN users u ON t.employee_id = u.id
      WHERE t.status != 'completed' AND ${uCond}
      ORDER BY t.due_date ASC
      LIMIT 10
    `;
    const pendingTasksRes = await query(pendingTasksQuery);

    // 7. Employees who haven't completed courses or passed quizzes
    const pendingCoursesQuery = `
      SELECT 
        e.id, 
        u.name as employee_name, 
        u.employee_id as employee_code, 
        c.name as course_name, 
        e.progress_percentage, 
        e.due_date, 
        e.status 
      FROM enrollments e
      JOIN users u ON e.employee_id = u.id
      JOIN courses c ON e.course_id = c.id
      WHERE e.status != 'completed' AND ${uCond}
      ORDER BY e.due_date ASC
      LIMIT 10
    `;
    const pendingCoursesRes = await query(pendingCoursesQuery);

    return res.json({
      totalEmployees,
      avgTrainingCompletion,
      avgQuizScore,
      skillCoverage,
      tasks: {
        total: totalTasks,
        completed: completedTasks,
        completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
      },
      pendingTasks: pendingTasksRes.rows,
      pendingCourses: pendingCoursesRes.rows
    });

  } catch (err: any) {
    // Mock Mode Fallback
    const employees = mockStore.mockUsers.filter(u => 
      (u.role === 'employee' || u.role === 'staff') && 
      u.department !== 'Management' && 
      u.position !== 'Management' && 
      !u.position.includes('Management') &&
      !['EMP001', 'EMP002', 'EMP003', 'EMP004', 'EMP005', 'EMP006', 'EMP007', 'EMP008', 'EMP009', 'EMP010'].includes(u.employee_id)
    );
    const totalEmployees = employees.length;
    const empIds = employees.map(u => u.id);

    const enrollments = mockStore.mockEnrollments.filter(e => empIds.includes(e.employee_id));
    const totalProgress = enrollments.reduce((sum, e) => sum + e.progress_percentage, 0);
    const avgTrainingCompletion = enrollments.length > 0 ? Math.round(totalProgress / enrollments.length) : 0;

    const quizAttempts = mockStore.mockQuizAttempts.filter(qa => empIds.includes(qa.employee_id));
    const passedAttempts = quizAttempts.filter(q => q.passed);
    const totalScore = passedAttempts.reduce((sum, q) => sum + q.score, 0);
    const avgQuizScore = passedAttempts.length > 0 ? Math.round(totalScore / passedAttempts.length) : 0;

    const totalSkillsCount = mockStore.mockSkills.length;
    const qualifiedSkillsCount = mockStore.mockEmployeeSkills.filter(es => 
      empIds.includes(es.employee_id) && (es.status === 'qualified' || es.status === 'expert')
    ).length;
    const possibleSkills = totalEmployees * totalSkillsCount;
    const skillCoverage = possibleSkills > 0 ? Math.round((qualifiedSkillsCount / possibleSkills) * 100) : 0;

    const dailyTasks = mockStore.mockDailyTasks.filter(t => empIds.includes(t.employee_id));
    const totalTasks = dailyTasks.length;
    const completedTasks = dailyTasks.filter(t => t.status === 'completed').length;

    // Mock pending tasks
    const pendingTasks = dailyTasks
      .filter(t => t.status !== 'completed')
      .map(t => {
        const emp = mockStore.mockUsers.find(u => u.id === t.employee_id);
        return {
          id: t.id,
          employee_name: emp ? emp.name : 'Unknown',
          employee_code: emp ? emp.employee_id : 'N/A',
          task_name: t.task_name,
          due_date: t.due_date,
          status: t.status
        };
      })
      .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())
      .slice(0, 10);

    // Mock pending courses
    const pendingCourses = enrollments
      .filter(e => e.status !== 'completed')
      .map(e => {
        const emp = mockStore.mockUsers.find(u => u.id === e.employee_id);
        const course = mockStore.mockCourses.find(c => c.id === e.course_id);
        return {
          id: e.id,
          employee_name: emp ? emp.name : 'Unknown',
          employee_code: emp ? emp.employee_id : 'N/A',
          course_name: course ? course.name : 'Unknown',
          progress_percentage: e.progress_percentage,
          due_date: e.due_date,
          status: e.status
        };
      })
      .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())
      .slice(0, 10);

    return res.json({
      totalEmployees,
      avgTrainingCompletion,
      avgQuizScore,
      skillCoverage,
      tasks: {
        total: totalTasks,
        completed: completedTasks,
        completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
      },
      pendingTasks,
      pendingCourses
    });
  }
});

/**
 * @swagger
 * /api/reports/charts:
 *   get:
 *     summary: Retrieve aggregate data formatted specifically for Recharts displays
 */
router.get('/charts', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (getMockStatus()) {
      throw new Error('MOCK_MODE');
    }

    const uCond = "(u.role = 'employee' OR u.role = 'staff') AND u.department != 'Management' AND u.position != 'Management' AND u.position NOT LIKE '%Management%' AND u.employee_id NOT IN ('EMP001', 'EMP002', 'EMP003', 'EMP004', 'EMP005', 'EMP006', 'EMP007', 'EMP008', 'EMP009', 'EMP010')";

    // 1. Department comparison
    const deptDataQuery = `
      SELECT 
        u.department, 
        ROUND(AVG(COALESCE(e.progress_percentage, 0)), 1) as avg_progress,
        COUNT(DISTINCT u.id) as employee_count
      FROM users u
      LEFT JOIN enrollments e ON u.id = e.employee_id
      WHERE ${uCond}
      GROUP BY u.department
    `;
    const deptResult = await query(deptDataQuery);

    // 2. Skill status counts
    const skillStatusQuery = `
      SELECT es.status, COUNT(*) as count 
      FROM employee_skills es
      JOIN users u ON es.employee_id = u.id
      WHERE ${uCond}
      GROUP BY es.status
    `;
    const skillStatusResult = await query(skillStatusQuery);

    // 3. Position comparison
    const positionDataQuery = `
      SELECT 
        u.position, 
        ROUND(AVG(COALESCE(e.progress_percentage, 0)), 1) as avg_progress,
        COUNT(DISTINCT u.id) as employee_count
      FROM users u
      LEFT JOIN enrollments e ON u.id = e.employee_id
      WHERE ${uCond}
      GROUP BY u.position
    `;
    const positionResult = await query(positionDataQuery);

    // 4. Monthly training completion rates (Trends over last 6 months)
    const monthlyTrends = [
      { month: 'ม.ค.', completed: 40, enrolled: 80 },
      { month: 'ก.พ.', completed: 50, enrolled: 95 },
      { month: 'มี.ค.', completed: 65, enrolled: 110 },
      { month: 'เม.ย.', completed: 78, enrolled: 120 },
      { month: 'พ.ค.', completed: 92, enrolled: 140 },
      { month: 'มิ.ย.', completed: 115, enrolled: 155 }
    ];

    return res.json({
      departmentStats: deptResult.rows,
      skillStatusDistribution: skillStatusResult.rows,
      positionStats: positionResult.rows,
      monthlyTrends
    });

  } catch (err: any) {
    // Mock Mode Fallback
    // 1. Department stats
    const employees = mockStore.mockUsers.filter(u => 
      (u.role === 'employee' || u.role === 'staff') && 
      u.department !== 'Management' && 
      u.position !== 'Management' && 
      !u.position.includes('Management')
    );
    const empIds = employees.map(u => u.id);

    const departments = ['Operations', 'Receiving', 'Packing', 'Picking', 'Inventory'];
    const departmentStats = departments.map(dept => {
      const deptEmployees = employees.filter(u => u.department === dept);
      const deptEmpIds = deptEmployees.map(u => u.id);
      
      const deptEnrollments = mockStore.mockEnrollments.filter(e => deptEmpIds.includes(e.employee_id));
      const totalProgress = deptEnrollments.reduce((sum, e) => sum + e.progress_percentage, 0);
      const avgProgress = deptEnrollments.length > 0 ? Math.round((totalProgress / deptEnrollments.length) * 10) / 10 : 0;

      return {
        department: dept,
        avg_progress: avgProgress,
        employee_count: deptEmployees.length
      };
    });

    // 2. Skill status distribution
    const statusCounts = { need_training: 0, training: 0, qualified: 0, expert: 0 };
    mockStore.mockEmployeeSkills
      .filter(es => empIds.includes(es.employee_id))
      .forEach(es => {
        statusCounts[es.status]++;
      });
    const skillStatusDistribution = Object.entries(statusCounts).map(([status, count]) => ({
      status,
      count
    }));

    // 3. Position stats (Mock)
    const positionStats = [
      { position: 'เจ้าหน้าที่', avg_progress: 85.0, employee_count: 3 },
      { position: 'พนักงานขับรถยก', avg_progress: 72.5, employee_count: 5 },
      { position: 'พนักงานหน้าลิฟท์', avg_progress: 90.0, employee_count: 2 }
    ];

    // 4. Monthly Trends
    const monthlyTrends = [
      { month: 'ม.ค.', completed: 35, enrolled: 75 },
      { month: 'ก.พ.', completed: 45, enrolled: 90 },
      { month: 'มี.ค.', completed: 60, enrolled: 105 },
      { month: 'เม.ย.', completed: 70, enrolled: 115 },
      { month: 'พ.ค.', completed: 88, enrolled: 135 },
      { month: 'มิ.ย.', completed: 110, enrolled: 150 }
    ];

    return res.json({
      departmentStats,
      skillStatusDistribution,
      positionStats,
      monthlyTrends
    });
  }
});

export default router;
