import { Router, Response } from 'express';
import { query, getMockStatus, mockStore } from '../config/db';
import { authenticateToken, requireRole, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

/**
 * @swagger
 * /api/skills:
 *   get:
 *     summary: Retrieve list of all warehouse skills
 */
router.get('/', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (getMockStatus()) {
      throw new Error('MOCK_MODE');
    }

    const skillsResult = await query('SELECT * FROM skills ORDER BY category, name ASC');
    return res.json(skillsResult.rows);

  } catch (err: any) {
    return res.json(mockStore.mockSkills);
  }
});

/**
 * @swagger
 * /api/skills/matrix:
 *   get:
 *     summary: Retrieve full skill matrix (employees and their skills status)
 */
router.get('/matrix', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (getMockStatus()) {
      throw new Error('MOCK_MODE');
    }

    const matrixQuery = `
      SELECT 
        es.id,
        es.employee_id,
        u.name as employee_name,
        u.employee_id as emp_code,
        u.department,
        u.position,
        es.skill_id,
        s.name as skill_name,
        s.category as skill_category,
        es.level,
        es.status,
        es.expiration_date,
        es.approved_at,
        ap.name as approved_by_name
      FROM employee_skills es
      JOIN users u ON es.employee_id = u.id
      JOIN skills s ON es.skill_id = s.id
      LEFT JOIN users ap ON es.approved_by = ap.id
      ORDER BY u.name, s.name
    `;
    const matrixResult = await query(matrixQuery);
    return res.json(matrixResult.rows);

  } catch (err: any) {
    // Mock Mode Fallback
    const matrix = mockStore.mockEmployeeSkills
      .filter(es => mockStore.mockUsers.some(u => u.id === es.employee_id))
      .map(es => {
        const employee = mockStore.mockUsers.find(u => u.id === es.employee_id);
        const skill = mockStore.mockSkills.find(s => s.id === es.skill_id);
        const approver = mockStore.mockUsers.find(u => u.id === es.approved_by);

        return {
          id: es.id,
          employee_id: es.employee_id,
          employee_name: employee ? employee.name : 'Unknown',
          emp_code: employee ? employee.employee_id : '',
          department: employee ? employee.department : '',
          position: employee ? employee.position : '',
          skill_id: es.skill_id,
          skill_name: skill ? skill.name : 'Unknown',
          skill_category: skill ? skill.category : '',
          level: es.level,
          status: es.status,
          expiration_date: es.expiration_date,
          approved_at: es.approved_at,
          approved_by_name: approver ? approver.name : null
        };
      });
    return res.json(matrix);
  }
});

/**
 * @swagger
 * /api/skills/employee/:id:
 *   get:
 *     summary: Retrieve skills for a specific employee
 */
router.get('/employee/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  const empId = parseInt(req.params.id, 10);

  try {
    if (getMockStatus()) {
      throw new Error('MOCK_MODE');
    }

    const empSkillsQuery = `
      SELECT 
        es.id,
        es.skill_id,
        s.name as skill_name,
        s.category as skill_category,
        es.level,
        es.status,
        es.certification_name,
        es.certification_url,
        es.expiration_date,
        es.approved_at,
        ap.name as approved_by_name
      FROM employee_skills es
      JOIN skills s ON es.skill_id = s.id
      LEFT JOIN users ap ON es.approved_by = ap.id
      WHERE es.employee_id = $1
    `;
    const empSkillsResult = await query(empSkillsQuery, [empId]);
    return res.json(empSkillsResult.rows);

  } catch (err: any) {
    // Mock Mode Fallback
    const list = mockStore.mockEmployeeSkills
      .filter(es => es.employee_id === empId)
      .map(es => {
        const skill = mockStore.mockSkills.find(s => s.id === es.skill_id);
        const approver = mockStore.mockUsers.find(u => u.id === es.approved_by);

        return {
          id: es.id,
          skill_id: es.skill_id,
          skill_name: skill ? skill.name : 'Unknown',
          skill_category: skill ? skill.category : '',
          level: es.level,
          status: es.status,
          certification_name: es.certification_name,
          certification_url: es.certification_url,
          expiration_date: es.expiration_date,
          approved_at: es.approved_at,
          approved_by_name: approver ? approver.name : null
        };
      });
    return res.json(list);
  }
});

/**
 * @swagger
 * /api/skills/employee:
 *   post:
 *     summary: Assign or update employee skill
 */
router.post('/employee', authenticateToken, requireRole(['admin', 'staff']), async (req: AuthenticatedRequest, res: Response) => {
  const { employee_id, skill_id, level, status, certification_name, certification_url, expiration_date } = req.body;

  if (!employee_id || !skill_id || !level) {
    return res.status(400).json({ message: 'employee_id, skill_id, and level are required.' });
  }

  const empId = parseInt(employee_id, 10);
  const skillId = parseInt(skill_id, 10);
  const lvl = parseInt(level, 10);

  try {
    if (getMockStatus()) {
      throw new Error('MOCK_MODE');
    }

    const queryStr = `
      INSERT INTO employee_skills (employee_id, skill_id, level, status, certification_name, certification_url, expiration_date)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON DUPLICATE KEY UPDATE 
        level = VALUES(level),
        status = VALUES(status),
        certification_name = VALUES(certification_name),
        certification_url = VALUES(certification_url),
        expiration_date = VALUES(expiration_date),
        updated_at = NOW()
    `;
    await query(queryStr, [empId, skillId, lvl, status || 'need_training', certification_name || null, certification_url || null, expiration_date || null]);
    const selectRes = await query('SELECT * FROM employee_skills WHERE employee_id = $1 AND skill_id = $2', [empId, skillId]);
    return res.status(201).json(selectRes.rows[0]);

  } catch (err: any) {
    // Mock Mode Fallback
    const existingIndex = mockStore.mockEmployeeSkills.findIndex(es => es.employee_id === empId && es.skill_id === skillId);
    
    if (existingIndex !== -1) {
      const existing = mockStore.mockEmployeeSkills[existingIndex];
      const updated = {
        ...existing,
        level: lvl,
        status: status || existing.status,
        certification_name: certification_name !== undefined ? certification_name : existing.certification_name,
        certification_url: certification_url !== undefined ? certification_url : existing.certification_url,
        expiration_date: expiration_date !== undefined ? expiration_date : existing.expiration_date
      };
      mockStore.mockEmployeeSkills[existingIndex] = updated;
      return res.json(updated);
    } else {
      const newId = mockStore.mockEmployeeSkills.reduce((max, es) => es.id > max ? es.id : max, 0) + 1;
      const newSkill = {
        id: newId,
        employee_id: empId,
        skill_id: skillId,
        level: lvl,
        status: status || 'need_training',
        certification_name,
        certification_url,
        expiration_date
      };
      mockStore.mockEmployeeSkills.push(newSkill);
      return res.status(201).json(newSkill);
    }
  }
});

/**
 * @swagger
 * /api/skills/approve/:id:
 *   post:
 *     summary: Supervisor approves a skill certification
 */
router.post('/approve/:id', authenticateToken, requireRole(['admin', 'staff']), async (req: AuthenticatedRequest, res: Response) => {
  const skillRecordId = parseInt(req.params.id, 10);
  const supervisorId = req.user?.id;

  try {
    if (getMockStatus()) {
      throw new Error('MOCK_MODE');
    }

    const approveQuery = `
      UPDATE employee_skills 
      SET status = 'qualified', approved_by = $1, approved_at = NOW(), updated_at = NOW() 
      WHERE id = $2 
      RETURNING *
    `;
    const result = await query(approveQuery, [supervisorId, skillRecordId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Skill assignment record not found.' });
    }
    return res.json(result.rows[0]);

  } catch (err: any) {
    // Mock Mode Fallback
    const index = mockStore.mockEmployeeSkills.findIndex(es => es.id === skillRecordId);
    if (index === -1) {
      return res.status(404).json({ message: 'Skill assignment record not found (Mock).' });
    }

    const record = mockStore.mockEmployeeSkills[index];
    record.status = 'qualified';
    record.approved_by = supervisorId;
    record.approved_at = new Date().toISOString();

    return res.json(record);
  }
});

/**
 * @swagger
 * /api/skills:
 *   post:
 *     summary: Create a new skill item in catalog
 */
router.post('/', authenticateToken, requireRole(['admin', 'staff']), async (req: AuthenticatedRequest, res: Response) => {
  const { name, category, description } = req.body;

  if (!name || !category) {
    return res.status(400).json({ message: 'name and category are required.' });
  }

  try {
    if (getMockStatus()) {
      throw new Error('MOCK_MODE');
    }

    const result = await query(
      'INSERT INTO skills (name, category, description) VALUES ($1, $2, $3) RETURNING *',
      [name, category, description || '']
    );
    return res.status(201).json(result.rows[0]);

  } catch (err: any) {
    // Mock Mode Fallback
    const duplicate = mockStore.mockSkills.some(s => s.name.toLowerCase() === name.toLowerCase());
    if (duplicate) {
      return res.status(400).json({ message: 'Skill name already exists.' });
    }

    const newId = mockStore.mockSkills.reduce((max, s) => s.id > max ? s.id : max, 0) + 1;
    const newSkill = {
      id: newId,
      name,
      category,
      description: description || ''
    };
    mockStore.mockSkills.push(newSkill);
    return res.status(201).json(newSkill);
  }
});

router.put('/:id', authenticateToken, requireRole(['admin', 'staff']), async (req: AuthenticatedRequest, res: Response) => {
  const skillId = parseInt(req.params.id, 10);
  const { name, category, description } = req.body;

  if (!name || !category) {
    return res.status(400).json({ message: 'name and category are required.' });
  }

  try {
    if (getMockStatus()) {
      throw new Error('MOCK_MODE');
    }

    const result = await query(
      `UPDATE skills SET name = $1, category = $2, description = $3 WHERE id = $4 RETURNING *`,
      [name, category, description || '', skillId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Skill not found.' });
    }

    return res.json(result.rows[0]);

  } catch (err: any) {
    if (!getMockStatus()) {
      console.error('Database error in edit skill:', err);
      return res.status(500).json({ message: 'Database error: ' + err.message });
    }
    // Mock Mode Fallback
    const skillIndex = mockStore.mockSkills.findIndex(s => s.id === skillId);
    if (skillIndex === -1) {
      return res.status(404).json({ message: 'Skill not found (Mock).' });
    }

    const updated = {
      ...mockStore.mockSkills[skillIndex],
      name,
      category,
      description: description || ''
    };
    mockStore.mockSkills[skillIndex] = updated;
    return res.json(updated);
  }
});

router.delete('/:id', authenticateToken, requireRole(['admin', 'staff']), async (req: AuthenticatedRequest, res: Response) => {
  const skillId = parseInt(req.params.id, 10);

  try {
    if (getMockStatus()) {
      throw new Error('MOCK_MODE');
    }

    const result = await query('DELETE FROM skills WHERE id = $1 RETURNING *', [skillId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Skill not found.' });
    }

    return res.json({ message: 'Skill deleted successfully.' });

  } catch (err: any) {
    if (!getMockStatus()) {
      console.error('Database error in delete skill:', err);
      return res.status(500).json({ message: 'Database error: ' + err.message });
    }
    // Mock Mode Fallback
    const skillIndex = mockStore.mockSkills.findIndex(s => s.id === skillId);
    if (skillIndex === -1) {
      return res.status(404).json({ message: 'Skill not found (Mock).' });
    }

    mockStore.mockSkills.splice(skillIndex, 1);
    
    // Clean up mock employee skills
    const filteredSkills = mockStore.mockEmployeeSkills.filter(s => s.skill_id !== skillId);
    mockStore.mockEmployeeSkills.length = 0;
    mockStore.mockEmployeeSkills.push(...filteredSkills);

    return res.json({ message: 'Skill deleted successfully (Mock).' });
  }
});

export default router;
