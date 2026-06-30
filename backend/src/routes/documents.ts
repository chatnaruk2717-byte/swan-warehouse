import { Router, Response } from 'express';
import { query, getMockStatus, mockStore } from '../config/db';
import { authenticateToken, requireRole, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

/**
 * GET /api/documents
 * Retrieve list of all warehouse documents
 */
router.get('/', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (getMockStatus()) {
      throw new Error('MOCK_MODE');
    }

    const result = await query('SELECT * FROM documents ORDER BY id DESC');
    return res.json(result.rows);

  } catch (err: any) {
    // Mock Mode Fallback
    const docs = mockStore.mockDocuments || [];
    // Sort by id descending
    const sortedDocs = [...docs].sort((a, b) => b.id - a.id);
    return res.json(sortedDocs);
  }
});

/**
 * POST /api/documents
 * Create/upload a new warehouse document
 */
router.post('/', authenticateToken, requireRole(['admin', 'staff']), async (req: AuthenticatedRequest, res: Response) => {
  const { title, category, file_url } = req.body;
  const uploaderName = req.user?.name || 'Staff';

  if (!title || !category || !file_url) {
    return res.status(400).json({ message: 'Title, category, and file_url are required.' });
  }

  try {
    if (getMockStatus()) {
      throw new Error('MOCK_MODE');
    }

    const result = await query(
      `INSERT INTO documents (title, category, file_url, uploaded_by) 
       VALUES ($1, $2, $3, $4) 
       RETURNING *`,
      [title, category, file_url, uploaderName]
    );

    return res.status(201).json(result.rows[0]);

  } catch (err: any) {
    // Mock Mode Fallback
    const docs = mockStore.mockDocuments || [];
    const newId = docs.reduce((max, d) => d.id > max ? d.id : max, 0) + 1;
    const newDoc = {
      id: newId,
      title,
      category,
      file_url,
      uploaded_by: uploaderName,
      uploaded_at: new Date().toISOString()
    };

    docs.push(newDoc);
    return res.status(201).json(newDoc);
  }
});

/**
 * DELETE /api/documents/:id
 * Delete a warehouse document
 */
router.delete('/:id', authenticateToken, requireRole(['admin', 'staff']), async (req: AuthenticatedRequest, res: Response) => {
  const docId = parseInt(req.params.id, 10);

  try {
    if (getMockStatus()) {
      throw new Error('MOCK_MODE');
    }

    const deleteResult = await query('DELETE FROM documents WHERE id = $1 RETURNING *', [docId]);
    if (deleteResult.rows.length === 0) {
      return res.status(404).json({ message: 'Document not found.' });
    }

    return res.json({ message: 'Document deleted successfully.', document: deleteResult.rows[0] });

  } catch (err: any) {
    // Mock Mode Fallback
    const docs = mockStore.mockDocuments || [];
    const index = docs.findIndex(d => d.id === docId);
    
    if (index === -1) {
      return res.status(404).json({ message: 'Document not found (Mock).' });
    }

    const deleted = docs.splice(index, 1)[0];
    return res.json({ message: 'Document deleted successfully (Mock).', document: deleted });
  }
});

export default router;
