import { Router, Response } from 'express';
import { query, getMockStatus, mockStore } from '../config/db';
import { authenticateToken, requireRole, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

// In-memory mock store fallback for warehouse layouts
let mockLayouts = [
  { id: 1, zone_name: 'คลังสินค้า 24 Land', storage_level: 'ชั้น 1', area_sqm: 1200.00, max_capacity_pallets: 800, max_stack_level: 3, product_type: 'เครื่องใช้ไฟฟ้าและสินค้าบรรจุกล่องทั่วไป', layout_image: '' },
  { id: 2, zone_name: 'คลังสินค้า 24 Land', storage_level: 'ชั้น 2', area_sqm: 800.00, max_capacity_pallets: 500, max_stack_level: 2, product_type: 'อะไหล่และชิ้นส่วนอิเล็กทรอนิกส์น้ำหนักเบา', layout_image: '' },
  { id: 3, zone_name: 'คลังสินค้า Coil', storage_level: 'ชั้น 1', area_sqm: 1500.00, max_capacity_pallets: 600, max_stack_level: 1, product_type: 'ม้วนเหล็กแผ่นและเหล็กม้วนอุตสาหกรรมหนัก', layout_image: '' },
  { id: 4, zone_name: 'คลังสินค้า 2PCS', storage_level: 'ชั้น 1', area_sqm: 950.00, max_capacity_pallets: 450, max_stack_level: 4, product_type: 'ชิ้นส่วนและอุปกรณ์รถยนต์แยกประเภท', layout_image: '' },
  { id: 5, zone_name: 'คลังสินค้าโรง2,5', storage_level: 'ชั้น 1', area_sqm: 2000.00, max_capacity_pallets: 1500, max_stack_level: 3, product_type: 'วัตถุดิบ บรรจุภัณฑ์ และสินค้าเพื่อรอจำหน่าย', layout_image: '' }
];

/**
 * GET /api/warehouse-layouts
 * Retrieve all warehouse layouts
 */
router.get('/', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (getMockStatus()) {
      return res.json(mockLayouts);
    }
    const result = await query('SELECT * FROM warehouse_layouts ORDER BY zone_name ASC, storage_level ASC');
    return res.json(result.rows);
  } catch (err: any) {
    console.error('Failed to get warehouse layouts:', err.message);
    return res.json(mockLayouts);
  }
});

/**
 * POST /api/warehouse-layouts
 * Create a new warehouse layout entry
 */
router.post('/', authenticateToken, requireRole(['admin']), async (req: AuthenticatedRequest, res: Response) => {
  const { zone_name, storage_level, area_sqm, max_capacity_pallets, max_stack_level, product_type, layout_image } = req.body;

  if (!zone_name || !storage_level) {
    return res.status(400).json({ message: 'Zone name and storage level are required.' });
  }

  try {
    if (getMockStatus()) {
      const newLayout = {
        id: mockLayouts.length > 0 ? Math.max(...mockLayouts.map(l => l.id)) + 1 : 1,
        zone_name,
        storage_level,
        area_sqm: area_sqm ? parseFloat(area_sqm) : 0.00,
        max_capacity_pallets: max_capacity_pallets ? parseInt(max_capacity_pallets, 10) : 0,
        max_stack_level: max_stack_level ? parseInt(max_stack_level, 10) : 1,
        product_type: product_type || '',
        layout_image: layout_image || ''
      };
      mockLayouts.push(newLayout);
      return res.status(201).json(newLayout);
    }

    const insertResult = await query(
      `INSERT INTO warehouse_layouts (zone_name, storage_level, area_sqm, max_capacity_pallets, max_stack_level, product_type, layout_image)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        zone_name,
        storage_level,
        area_sqm ? parseFloat(area_sqm) : 0.00,
        max_capacity_pallets ? parseInt(max_capacity_pallets, 10) : 0,
        max_stack_level ? parseInt(max_stack_level, 10) : 1,
        product_type || '',
        layout_image || ''
      ]
    );

    const lastIdRes = await query('SELECT LAST_INSERT_ID() as id');
    const insertedId = lastIdRes.rows[0].id;
    
    const selectResult = await query('SELECT * FROM warehouse_layouts WHERE id = $1', [insertedId]);
    return res.status(201).json(selectResult.rows[0]);

  } catch (err: any) {
    console.error('Failed to create warehouse layout:', err.message);
    return res.status(500).json({ message: err.message });
  }
});

/**
 * PUT /api/warehouse-layouts/:id
 * Update an existing warehouse layout entry
 */
router.put('/:id', authenticateToken, requireRole(['admin']), async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { zone_name, storage_level, area_sqm, max_capacity_pallets, max_stack_level, product_type, layout_image } = req.body;

  try {
    if (getMockStatus()) {
      const index = mockLayouts.findIndex(l => l.id === parseInt(id, 10));
      if (index === -1) {
        return res.status(404).json({ message: 'Warehouse layout not found.' });
      }
      mockLayouts[index] = {
        ...mockLayouts[index],
        zone_name: zone_name || mockLayouts[index].zone_name,
        storage_level: storage_level || mockLayouts[index].storage_level,
        area_sqm: area_sqm !== undefined ? parseFloat(area_sqm) : mockLayouts[index].area_sqm,
        max_capacity_pallets: max_capacity_pallets !== undefined ? parseInt(max_capacity_pallets, 10) : mockLayouts[index].max_capacity_pallets,
        max_stack_level: max_stack_level !== undefined ? parseInt(max_stack_level, 10) : mockLayouts[index].max_stack_level,
        product_type: product_type !== undefined ? product_type : mockLayouts[index].product_type,
        layout_image: layout_image !== undefined ? layout_image : mockLayouts[index].layout_image
      };
      return res.json(mockLayouts[index]);
    }

    const currentRes = await query('SELECT * FROM warehouse_layouts WHERE id = $1', [id]);
    if (currentRes.rows.length === 0) {
      return res.status(404).json({ message: 'Warehouse layout not found.' });
    }

    const current = currentRes.rows[0];

    await query(
      `UPDATE warehouse_layouts 
       SET zone_name = $1, storage_level = $2, area_sqm = $3, max_capacity_pallets = $4, max_stack_level = $5, product_type = $6, layout_image = $7
       WHERE id = $8`,
      [
        zone_name !== undefined ? zone_name : current.zone_name,
        storage_level !== undefined ? storage_level : current.storage_level,
        area_sqm !== undefined ? parseFloat(area_sqm) : current.area_sqm,
        max_capacity_pallets !== undefined ? parseInt(max_capacity_pallets, 10) : current.max_capacity_pallets,
        max_stack_level !== undefined ? parseInt(max_stack_level, 10) : current.max_stack_level,
        product_type !== undefined ? product_type : current.product_type,
        layout_image !== undefined ? layout_image : current.layout_image,
        id
      ]
    );

    const updatedRes = await query('SELECT * FROM warehouse_layouts WHERE id = $1', [id]);
    return res.json(updatedRes.rows[0]);

  } catch (err: any) {
    console.error('Failed to update warehouse layout:', err.message);
    return res.status(500).json({ message: err.message });
  }
});

/**
 * DELETE /api/warehouse-layouts/:id
 * Delete a warehouse layout entry
 */
router.delete('/:id', authenticateToken, requireRole(['admin']), async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;

  try {
    if (getMockStatus()) {
      const index = mockLayouts.findIndex(l => l.id === parseInt(id, 10));
      if (index === -1) {
        return res.status(404).json({ message: 'Warehouse layout not found.' });
      }
      mockLayouts.splice(index, 1);
      return res.json({ success: true, message: 'Warehouse layout deleted successfully.' });
    }

    const checkRes = await query('SELECT * FROM warehouse_layouts WHERE id = $1', [id]);
    if (checkRes.rows.length === 0) {
      return res.status(404).json({ message: 'Warehouse layout not found.' });
    }

    await query('DELETE FROM warehouse_layouts WHERE id = $1', [id]);
    return res.json({ success: true, message: 'Warehouse layout deleted successfully.' });

  } catch (err: any) {
    console.error('Failed to delete warehouse layout:', err.message);
    return res.status(500).json({ message: err.message });
  }
});

export default router;
