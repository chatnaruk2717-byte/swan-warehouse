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
    const result = await query('SELECT * FROM org_chart ORDER BY level_order ASC, display_order ASC, id ASC');
    return res.json(result.rows);
  } catch (err) {
    // Mock Mode Fallback
    const sortedMock = [...(mockStore.mockOrgChart || [])].sort((a, b) => {
      if (a.level_order !== b.level_order) return a.level_order - b.level_order;
      return (a.display_order || 0) - (b.display_order || 0);
    });
    return res.json(sortedMock);
  }
});

// POST /api/org-chart - Add new position (Admin only)
router.post('/', authenticateToken, requireRole(['admin']), async (req: AuthenticatedRequest, res: Response) => {
  const { name, role_name, level_order, level, warehouse_area, image_url, display_order, parent_id, photo_size, photo_shape } = req.body;

  if (!name || !role_name || !level_order) {
    return res.status(400).json({ message: 'name, role_name, and level_order are required.' });
  }

  const levelOrderNum = parseInt(level_order, 10);
  const displayOrderNum = parseInt(display_order, 10) || 0;
  const parentIdVal = parent_id !== undefined && parent_id !== null && parent_id !== '' ? parseInt(parent_id, 10) : null;

  try {
    if (getMockStatus()) {
      throw new Error('MOCK_MODE');
    }
    const result = await query(
      `INSERT INTO org_chart (name, role_name, level_order, level, warehouse_area, image_url, display_order, parent_id, photo_size, photo_shape) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
       RETURNING *`,
      [name, role_name, levelOrderNum, level || '', warehouse_area || '', image_url || '', displayOrderNum, parentIdVal, photo_size || 'md', photo_shape || 'circle']
    );
    return res.status(201).json(result.rows[0]);
  } catch (err) {
    // Mock Mode Fallback
    const newId = mockStore.mockOrgChart.reduce((max, item) => item.id > max ? item.id : max, 0) + 1;
    const newItem = {
      id: newId,
      name,
      role_name,
      level_order: levelOrderNum,
      level: level || '',
      warehouse_area: warehouse_area || '',
      image_url: image_url || '',
      display_order: displayOrderNum,
      parent_id: parentIdVal,
      photo_size: photo_size || 'md',
      photo_shape: photo_shape || 'circle'
    };
    mockStore.mockOrgChart.push(newItem);
    return res.status(201).json(newItem);
  }
});

// PUT /api/org-chart/:id - Edit position (Admin only)
router.put('/:id', authenticateToken, requireRole(['admin']), async (req: AuthenticatedRequest, res: Response) => {
  const id = parseInt(req.params.id, 10);
  const { name, role_name, level_order, level, warehouse_area, image_url, display_order, parent_id, photo_size, photo_shape } = req.body;

  if (!name || !role_name || !level_order) {
    return res.status(400).json({ message: 'name, role_name, and level_order are required.' });
  }

  const levelOrderNum = parseInt(level_order, 10);
  const displayOrderNum = display_order !== undefined ? parseInt(display_order, 10) : undefined;
  const parentIdVal = parent_id !== undefined && parent_id !== null && parent_id !== '' ? parseInt(parent_id, 10) : null;

  try {
    if (getMockStatus()) {
      throw new Error('MOCK_MODE');
    }
    
    let updateQuery = '';
    let params: any[] = [];
    
    if (displayOrderNum !== undefined) {
      updateQuery = `
        UPDATE org_chart 
        SET name = $1, role_name = $2, level_order = $3, level = $4, warehouse_area = $5, image_url = COALESCE($6, image_url), display_order = $7, parent_id = $8, photo_size = $9, photo_shape = $10, updated_at = NOW() 
        WHERE id = $11 
        RETURNING *
      `;
      params = [name, role_name, levelOrderNum, level || '', warehouse_area || '', image_url || null, displayOrderNum, parentIdVal, photo_size || 'md', photo_shape || 'circle', id];
    } else {
      updateQuery = `
        UPDATE org_chart 
        SET name = $1, role_name = $2, level_order = $3, level = $4, warehouse_area = $5, image_url = COALESCE($6, image_url), parent_id = $7, photo_size = $8, photo_shape = $9, updated_at = NOW() 
        WHERE id = $10 
        RETURNING *
      `;
      params = [name, role_name, levelOrderNum, level || '', warehouse_area || '', image_url || null, parentIdVal, photo_size || 'md', photo_shape || 'circle', id];
    }

    const result = await query(updateQuery, params);
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
    item.level_order = levelOrderNum;
    item.level = level || '';
    item.warehouse_area = warehouse_area || '';
    if (image_url !== undefined) {
      item.image_url = image_url;
    }
    if (displayOrderNum !== undefined) {
      item.display_order = displayOrderNum;
    }
    item.parent_id = parentIdVal;
    item.photo_size = photo_size || 'md';
    item.photo_shape = photo_shape || 'circle';
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
