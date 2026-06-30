import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query, getMockStatus, mockStore } from '../config/db';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_warehouse_key';

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Log in a user and return a JWT
 */
router.post('/login', async (req: AuthenticatedRequest, res: Response) => {
  const { loginIdentifier, password } = req.body; // Can be email or employee_id

  if (!loginIdentifier || !password) {
    return res.status(400).json({ message: 'Login identifier and password are required.' });
  }

  try {
    if (getMockStatus()) {
      throw new Error('MOCK_MODE');
    }

    // Database Mode
    const userResult = await query(
      'SELECT * FROM users WHERE email = $1 OR employee_id = $2',
      [loginIdentifier, loginIdentifier]
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials. User not found.' });
    }

    const user = userResult.rows[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials. Password incorrect.' });
    }

    if (user.status !== 'active') {
      return res.status(403).json({ message: 'Your account is suspended or inactive.' });
    }

    const token = jwt.sign(
      { id: user.id, employee_id: user.employee_id, email: user.email, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: '8h' }
    );

    return res.json({
      token,
      user: {
        id: user.id,
        employee_id: user.employee_id,
        email: user.email,
        role: user.role,
        name: user.name,
        department: user.department,
        position: user.position,
        photo_url: user.photo_url
      }
    });

  } catch (err: any) {
    // Catch MOCK_MODE or database errors
    if (err.message !== 'MOCK_MODE') {
      console.warn('Database error during login, falling back to mock mode:', err.message);
    }

    // Mock Mode Fallback
    const user = mockStore.mockUsers.find(
      u => u.email.toLowerCase() === loginIdentifier.toLowerCase() || u.employee_id.toUpperCase() === loginIdentifier.toUpperCase()
    );

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials. User not found (Mock).' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials. Password incorrect (Mock).' });
    }

    if (user.status !== 'active') {
      return res.status(403).json({ message: 'Your account is suspended or inactive (Mock).' });
    }

    const token = jwt.sign(
      { id: user.id, employee_id: user.employee_id, email: user.email, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: '8h' }
    );

    return res.json({
      token,
      user: {
        id: user.id,
        employee_id: user.employee_id,
        email: user.email,
        role: user.role,
        name: user.name,
        department: user.department,
        position: user.position,
        photo_url: user.photo_url
      }
    });
  }
});

/**
 * @swagger
 * /api/auth/profile:
 *   get:
 *     summary: Get current user profile
 */
router.get('/profile', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id;

  try {
    if (getMockStatus()) {
      throw new Error('MOCK_MODE');
    }

    const userResult = await query('SELECT * FROM users WHERE id = $1', [userId]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: 'User profile not found.' });
    }

    const user = userResult.rows[0];
    delete user.password_hash;
    return res.json(user);

  } catch (err: any) {
    // Mock Mode Fallback
    const user = mockStore.mockUsers.find(u => u.id === userId);
    if (!user) {
      return res.status(404).json({ message: 'User profile not found (Mock).' });
    }

    const profile = { ...user };
    // @ts-ignore
    delete profile.password_hash;
    return res.json(profile);
  }
});

/**
 * @swagger
 * /api/auth/change-password:
 *   post:
 *     summary: Change user password
 */
router.post('/change-password', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id;
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: 'Current password and new password are required.' });
  }

  let newHash = '';
  try {
    const salt = await bcrypt.genSalt(10);
    newHash = await bcrypt.hash(newPassword, salt);

    if (getMockStatus()) {
      throw new Error('MOCK_MODE');
    }

    const userResult = await query('SELECT * FROM users WHERE id = $1', [userId]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const user = userResult.rows[0];
    const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password incorrect.' });
    }

    await query('UPDATE users SET password_hash = $1 WHERE id = $2', [newHash, userId]);
    return res.json({ message: 'Password updated successfully.' });

  } catch (err: any) {
    // Mock Mode Fallback
    const user = mockStore.mockUsers.find(u => u.id === userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found (Mock).' });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password incorrect (Mock).' });
    }

    user.password_hash = newHash;
    return res.json({ message: 'Password updated successfully (Mock).' });
  }
});

/**
 * @swagger
 * /api/auth/profile/update:
 *   put:
 *     summary: Update user profile details
 */
router.put('/profile/update', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id;
  const { name, email, phone, photo_url } = req.body;

  try {
    if (getMockStatus()) {
      throw new Error('MOCK_MODE');
    }

    const updateQuery = `
      UPDATE users 
      SET name = $1, email = $2, phone = $3, photo_url = $4, updated_at = CURRENT_TIMESTAMP
      WHERE id = $5
      RETURNING id, employee_id, email, role, name, department, position, phone, photo_url
    `;
    const result = await query(updateQuery, [name, email, phone, photo_url, userId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User profile not found.' });
    }

    return res.json(result.rows[0]);

  } catch (err: any) {
    // Mock Mode Fallback
    const user = mockStore.mockUsers.find(u => u.id === userId);
    if (!user) {
      return res.status(404).json({ message: 'User profile not found (Mock).' });
    }

    if (name) user.name = name;
    if (email) user.email = email;
    if (phone !== undefined) user.phone = phone;
    if (photo_url !== undefined) user.photo_url = photo_url;

    const profile = { ...user };
    // @ts-ignore
    delete profile.password_hash;

    return res.json(profile);
  }
});

export default router;
