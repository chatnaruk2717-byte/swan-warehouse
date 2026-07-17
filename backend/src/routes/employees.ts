import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import { query, getMockStatus, mockStore } from '../config/db';
import { authenticateToken, requireRole, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

router.get('/debug-crash-log', async (req: any, res: any) => {
  try {
    const logPath = path.join(__dirname, '../../crash.log');
    if (fs.existsSync(logPath)) {
      const content = fs.readFileSync(logPath, 'utf8');
      return res.send(content);
    }
    return res.send('No crash log found.');
  } catch (err: any) {
    return res.status(500).send(err.message);
  }
});

router.get('/temp-debug-users', async (req: any, res: any) => {
  try {
    const result = await query('SELECT id, employee_id, email, password_hash, name, role, department, position FROM users');
    return res.json(result.rows);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Helper to encrypt password (default to 'password123')
const getDefaultPasswordHash = async () => {
  return '$2a$10$U1FNXk2W1scs2ZpblqipzuMN92V3rAAkW1UOdFSdgrCcmYjadz5O2';
};

router.get('/test-db-query', async (req: any, res: any) => {
  try {
    const result = await query(
      `SELECT u.*, s.name as supervisor_name 
       FROM users u 
       LEFT JOIN users s ON u.supervisor_id = s.id 
       WHERE u.employee_id NOT IN ('EMP001', 'EMP002', 'EMP003', 'EMP004', 'EMP005', 'EMP006', 'EMP007', 'EMP008', 'EMP009', 'EMP010')
       ORDER BY u.employee_id ASC`
    );
    return res.json({ success: true, count: result.rows.length, sample: result.rows.slice(0, 2) });
  } catch (err: any) {
    return res.json({ success: false, error: err.message, stack: err.stack });
  }
});

/**
 * @swagger
 * /api/employees:
 *   get:
 *     summary: Retrieve list of all employees
 */
router.get('/', authenticateToken, requireRole(['admin', 'staff', 'employee']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (getMockStatus()) {
      throw new Error('MOCK_MODE');
    }

    const employeesResult = await query(
      `SELECT u.*, s.name as supervisor_name 
       FROM users u 
       LEFT JOIN users s ON u.supervisor_id = s.id 
       WHERE u.employee_id NOT IN ('EMP001', 'EMP002', 'EMP003', 'EMP004', 'EMP005', 'EMP006', 'EMP007', 'EMP008', 'EMP009', 'EMP010')
       ORDER BY u.employee_id ASC`
    );
    
    // Remove sensitive data
    const list = employeesResult.rows.map(row => {
      delete row.password_hash;
      return row;
    });

    return res.json(list);

  } catch (err: any) {
    // Mock Mode Fallback
    const list = mockStore.mockUsers
      .filter(user => !['EMP001', 'EMP002', 'EMP003', 'EMP004', 'EMP005', 'EMP006', 'EMP007', 'EMP008', 'EMP009', 'EMP010'].includes(user.employee_id))
      .map(user => {
        const supervisor = mockStore.mockUsers.find(u => u.id === user.supervisor_id);
        const copy = {
          ...user,
          supervisor_name: supervisor ? supervisor.name : null
        };
        // @ts-ignore
        delete copy.password_hash;
        return copy;
      });
    return res.json(list);
  }
});

/**
 * @swagger
 * /api/employees/:id:
 *   get:
 *     summary: Retrieve individual employee by ID
 */
router.get('/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  const employeeId = parseInt(req.params.id, 10);

  try {
    if (getMockStatus()) {
      throw new Error('MOCK_MODE');
    }

    const employeeResult = await query(
      `SELECT u.*, s.name as supervisor_name 
       FROM users u 
       LEFT JOIN users s ON u.supervisor_id = s.id 
       WHERE u.id = $1`,
      [employeeId]
    );

    if (employeeResult.rows.length === 0) {
      return res.status(404).json({ message: 'Employee not found.' });
    }

    const employee = employeeResult.rows[0];
    delete employee.password_hash;
    return res.json(employee);

  } catch (err: any) {
    // Mock Mode Fallback
    const user = mockStore.mockUsers.find(u => u.id === employeeId);
    if (!user) {
      return res.status(404).json({ message: 'Employee not found (Mock).' });
    }

    const supervisor = mockStore.mockUsers.find(u => u.id === user.supervisor_id);
    const result = {
      ...user,
      supervisor_name: supervisor ? supervisor.name : null
    };
    // @ts-ignore
    delete result.password_hash;
    return res.json(result);
  }
});

/**
 * @swagger
 * /api/employees:
 *   post:
 *     summary: Create a new employee
 */
router.post('/', authenticateToken, requireRole(['admin']), async (req: AuthenticatedRequest, res: Response) => {
  const {
    employee_id, email, name, role, department, position,
    warehouse_area, phone, supervisor_id, start_date, photo_url, working_shift
  } = req.body;

  if (!employee_id || !email || !name || !role || !department || !position) {
    return res.status(400).json({ message: 'Required fields: employee_id, email, name, role, department, position.' });
  }

  try {
    const defaultHash = await getDefaultPasswordHash();

    if (getMockStatus()) {
      throw new Error('MOCK_MODE');
    }

    let formattedStartDate = start_date;
    if (typeof start_date === 'string') {
      if (start_date.includes('T')) {
        formattedStartDate = start_date.split('T')[0];
      }
    } else if (start_date instanceof Date) {
      formattedStartDate = start_date.toISOString().split('T')[0];
    } else {
      formattedStartDate = new Date().toISOString().split('T')[0];
    }

    const insertResult = await query(
      `INSERT INTO users (employee_id, email, password_hash, name, role, department, position, warehouse_area, phone, supervisor_id, start_date, photo_url, working_shift) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) 
       RETURNING *`,
      [employee_id, email, defaultHash, name, role, department, position, warehouse_area || null, phone || null, supervisor_id || null, formattedStartDate, photo_url || null, working_shift || 'A']
    );

    const newEmp = insertResult.rows[0];
    delete newEmp.password_hash;
    return res.status(201).json(newEmp);

  } catch (err: any) {
    if (!getMockStatus()) {
      console.error('Database error in create employee:', err);
      return res.status(500).json({ message: 'Database error: ' + err.message });
    }
    // Mock Mode Fallback
    // Check duplication
    const duplicate = mockStore.mockUsers.find(u => u.employee_id === employee_id || u.email === email);
    if (duplicate) {
      return res.status(400).json({ message: 'Employee ID or Email already exists.' });
    }

    const defaultHash = await getDefaultPasswordHash();
    const newId = mockStore.mockUsers.reduce((max, u) => u.id > max ? u.id : max, 0) + 1;
    const newEmp = {
      id: newId,
      employee_id,
      email,
      password_hash: defaultHash,
      name,
      role,
      department,
      position,
      warehouse_area: warehouse_area || '',
      phone: phone || '',
      status: 'active' as const,
      supervisor_id: supervisor_id ? parseInt(supervisor_id, 10) : null,
      start_date: start_date || new Date().toISOString().split('T')[0],
      photo_url: photo_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
      working_shift: (working_shift || 'A') as any
    };

    mockStore.mockUsers.push(newEmp);
    const response = { ...newEmp };
    // @ts-ignore
    delete response.password_hash;
    return res.status(201).json(response);
  }
});

/**
 * @swagger
 * /api/employees/:id:
 *   put:
 *     summary: Update an employee
 */
router.put('/:id', authenticateToken, requireRole(['admin']), async (req: AuthenticatedRequest, res: Response) => {
  const employeeId = parseInt(req.params.id, 10);
  const {
    name, role, department, position, warehouse_area, phone,
    status, supervisor_id, start_date, photo_url, working_shift
  } = req.body;

  try {
    if (getMockStatus()) {
      throw new Error('MOCK_MODE');
    }

    let formattedStartDate = start_date;
    if (typeof start_date === 'string') {
      if (start_date.includes('T')) {
        formattedStartDate = start_date.split('T')[0];
      }
    } else if (start_date instanceof Date) {
      formattedStartDate = start_date.toISOString().split('T')[0];
    } else if (!start_date) {
      formattedStartDate = new Date().toISOString().split('T')[0];
    }

    const updateResult = await query(
      `UPDATE users 
       SET name = $1, role = $2, department = $3, position = $4, warehouse_area = $5, phone = $6, status = $7, supervisor_id = $8, start_date = $9, photo_url = $10, working_shift = $11 
       WHERE id = $12 
       RETURNING *`,
      [name, role, department, position, warehouse_area, phone, status, supervisor_id || null, formattedStartDate, photo_url, working_shift || 'A', employeeId]
    );

    if (updateResult.rows.length === 0) {
      return res.status(404).json({ message: 'Employee not found.' });
    }

    const updated = updateResult.rows[0];
    delete updated.password_hash;
    return res.json(updated);

  } catch (err: any) {
    if (!getMockStatus()) {
      console.error('Database error in update employee:', err);
      return res.status(500).json({ message: 'Database error: ' + err.message });
    }
    // Mock Mode Fallback
    const userIndex = mockStore.mockUsers.findIndex(u => u.id === employeeId);
    if (userIndex === -1) {
      return res.status(404).json({ message: 'Employee not found (Mock).' });
    }

    const existing = mockStore.mockUsers[userIndex];
    const updated = {
      ...existing,
      name: name !== undefined ? name : existing.name,
      role: role !== undefined ? role : existing.role,
      department: department !== undefined ? department : existing.department,
      position: position !== undefined ? position : existing.position,
      warehouse_area: warehouse_area !== undefined ? warehouse_area : existing.warehouse_area,
      phone: phone !== undefined ? phone : existing.phone,
      status: status !== undefined ? status : existing.status,
      supervisor_id: supervisor_id !== undefined ? (supervisor_id ? parseInt(supervisor_id, 10) : null) : existing.supervisor_id,
      start_date: start_date !== undefined ? start_date : existing.start_date,
      photo_url: photo_url !== undefined ? photo_url : existing.photo_url,
      working_shift: working_shift !== undefined ? working_shift : existing.working_shift
    };

    mockStore.mockUsers[userIndex] = updated as any;
    const response = { ...updated };
    // @ts-ignore
    delete response.password_hash;
    return res.json(response);
  }
});

/**
 * @swagger
 * /api/employees/:id:
 *   delete:
 *     summary: Delete an employee
 */
router.delete('/:id', authenticateToken, requireRole(['admin']), async (req: AuthenticatedRequest, res: Response) => {
  const employeeId = parseInt(req.params.id, 10);

  try {
    if (getMockStatus()) {
      throw new Error('MOCK_MODE');
    }

    // Cascade Delete associated records in PostgreSQL database
    await query('DELETE FROM daily_tasks WHERE employee_id = $1', [employeeId]);
    await query('DELETE FROM employee_skills WHERE employee_id = $1', [employeeId]);
    await query('DELETE FROM enrollments WHERE employee_id = $1', [employeeId]);

    const deleteResult = await query('DELETE FROM users WHERE id = $1 RETURNING *', [employeeId]);
    if (deleteResult.rows.length === 0) {
      return res.status(404).json({ message: 'Employee not found.' });
    }

    return res.json({ message: 'Employee deleted successfully.' });

  } catch (err: any) {
    if (!getMockStatus()) {
      console.error('Database error in delete employee:', err);
      return res.status(500).json({ message: 'Database error: ' + err.message });
    }
    // Mock Mode Fallback
    const index = mockStore.mockUsers.findIndex(u => u.id === employeeId);
    if (index === -1) {
      return res.status(404).json({ message: 'Employee not found (Mock).' });
    }

    // Cascade Delete in Mock Storage (In-place Mutation to bypass read-only ESModule bindings)
    const filteredTasks = mockStore.mockDailyTasks.filter(t => t.employee_id !== employeeId);
    mockStore.mockDailyTasks.length = 0;
    mockStore.mockDailyTasks.push(...filteredTasks);

    const filteredSkills = mockStore.mockEmployeeSkills.filter(s => s.employee_id !== employeeId);
    mockStore.mockEmployeeSkills.length = 0;
    mockStore.mockEmployeeSkills.push(...filteredSkills);

    const filteredEnrollments = mockStore.mockEnrollments.filter(e => e.employee_id !== employeeId);
    mockStore.mockEnrollments.length = 0;
    mockStore.mockEnrollments.push(...filteredEnrollments);

    mockStore.mockUsers.splice(index, 1);
    return res.json({ message: 'Employee deleted successfully (Mock).' });
  }
});

/**
 * @swagger
 * /api/employees/import:
 *   post:
 *     summary: Mock importing employees from Excel/CSV file
 */
router.post('/import-excel', authenticateToken, requireRole(['admin']), async (req: AuthenticatedRequest, res: Response) => {
  const { employees } = req.body; // Expecting array of employee objects

  if (!employees || !Array.isArray(employees)) {
    return res.status(400).json({ message: 'Invalid payload. Expecting an array of employees.' });
  }

  const defaultHash = await getDefaultPasswordHash();
  const importedList = [];

  for (const emp of employees) {
    const { employee_id, email, name, role, department, position, warehouse_area, phone, start_date } = emp;
    if (!employee_id || !email || !name || !role) continue;

    try {
      if (getMockStatus()) {
        throw new Error('MOCK');
      }
      
      const res = await query(
        `INSERT IGNORE INTO users (employee_id, email, password_hash, name, role, department, position, warehouse_area, phone, start_date)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         RETURNING id, name, employee_id`,
        [employee_id, email, defaultHash, name, role, department || 'Operations', position || 'Operator', warehouse_area || 'Zone A', phone || '', start_date || new Date()]
      );
      if (res.rows.length > 0) {
        importedList.push(res.rows[0]);
      }
    } catch {
      // Mock Fallback inside the loop
      const exists = mockStore.mockUsers.some(u => u.employee_id === employee_id);
      if (!exists) {
        const newId = mockStore.mockUsers.reduce((max, u) => u.id > max ? u.id : max, 0) + 1;
        const newU = {
          id: newId,
          employee_id,
          email,
          password_hash: defaultHash,
          name,
          role: role as any,
          department: department || 'Operations',
          position: position || 'Operator',
          warehouse_area: warehouse_area || 'Zone A',
          phone: phone || '',
          status: 'active' as const,
          supervisor_id: null,
          start_date: start_date || new Date().toISOString().split('T')[0],
          photo_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'
        };
        mockStore.mockUsers.push(newU);
        importedList.push({ id: newId, name, employee_id });
      }
    }
  }

  return res.json({
    message: `Successfully imported ${importedList.length} employees.`,
    imported: importedList
  });
});

export default router;
