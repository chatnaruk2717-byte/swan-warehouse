import { Router, Response } from 'express';
import { query, getMockStatus, mockStore } from '../config/db';
import { authenticateToken, requireRole, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

// GET /api/org-chart - Retrieve organization chart
router.get('/', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (getMockStatus()) {
      throw new Error('MOCK_MODE');
    }
    const result = await query('SELECT * FROM org_chart ORDER BY level_order ASC, id ASC');
    return res.json(result.rows);
  } catch (err) {
    // Mock Mode Fallback
    return res.json(mockStore.mockOrgChart);
  }
});

// POST /api/org-chart - Add new position (Admin only)
router.post('/', authenticateToken, requireRole(['admin']), async (req: AuthenticatedRequest, res: Response) => {
  const { name, role_name, level_order, image_url } = req.body;

  if (!name || !role_name || !level_order) {
    return res.status(400).json({ message: 'name, role_name, and level_order are required.' });
  }

  const level = parseInt(level_order, 10);

  try {
    if (getMockStatus()) {
      throw new Error('MOCK_MODE');
    }
    const result = await query(
      `INSERT INTO org_chart (name, role_name, level_order, image_url) 
       VALUES ($1, $2, $3, $4) 
       RETURNING *`,
      [name, role_name, level, image_url || '']
    );
    return res.status(201).json(result.rows[0]);
  } catch (err) {
    // Mock Mode Fallback
    const newId = mockStore.mockOrgChart.reduce((max, item) => item.id > max ? item.id : max, 0) + 1;
    const newItem = {
      id: newId,
      name,
      role_name,
      level_order: level,
      image_url: image_url || ''
    };
    mockStore.mockOrgChart.push(newItem);
    return res.status(201).json(newItem);
  }
});

// PUT /api/org-chart/:id - Edit position (Admin only)
router.put('/:id', authenticateToken, requireRole(['admin']), async (req: AuthenticatedRequest, res: Response) => {
  const id = parseInt(req.params.id, 10);
  const { name, role_name, level_order, image_url } = req.body;

  if (!name || !role_name || !level_order) {
    return res.status(400).json({ message: 'name, role_name, and level_order are required.' });
  }

  const level = parseInt(level_order, 10);

  try {
    if (getMockStatus()) {
      throw new Error('MOCK_MODE');
    }
    const result = await query(
      `UPDATE org_chart 
       SET name = $1, role_name = $2, level_order = $3, image_url = COALESCE($4, image_url), updated_at = NOW() 
       WHERE id = $5 
       RETURNING *`,
      [name, role_name, level, image_url || null, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Position not found.' });
    }
    return res.json(result.rows[0]);
  } catch (err) {
    // Mock Mode Fallback
    const index = mockStore.mockOrgChart.findIndex(item => item.id === id);
    if (index === -1) {
      return res.status(404).json({ message: 'Position not found (Mock).' });
    }
    const item = mockStore.mockOrgChart[index];
    item.name = name;
    item.role_name = role_name;
    item.level_order = level;
    if (image_url !== undefined) {
      item.image_url = image_url;
    }
    return res.json(item);
  }
});

// DELETE /api/org-chart/:id - Delete position (Admin only)
router.delete('/:id', authenticateToken, requireRole(['admin']), async (req: AuthenticatedRequest, res: Response) => {
  const id = parseInt(req.params.id, 10);

  try {
    if (getMockStatus()) {
      throw new Error('MOCK_MODE');
    }
    const result = await query('DELETE FROM org_chart WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Position not found.' });
    }
    return res.json({ message: 'Position deleted successfully.' });
  } catch (err) {
    // Mock Mode Fallback
    const index = mockStore.mockOrgChart.findIndex(item => item.id === id);
    if (index === -1) {
      return res.status(404).json({ message: 'Position not found (Mock).' });
    }
    mockStore.mockOrgChart.splice(index, 1);
    return res.json({ message: 'Position deleted successfully (Mock).' });
  }
});

export default router;
