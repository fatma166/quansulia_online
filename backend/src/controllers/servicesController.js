import { query } from '../config/database.js';

export const getServices = async (req, res) => {
  try {
    const { category_id, subcategory_id, active } = req.query;

    const conditions = [];
    const params = [];
    let paramCount = 1;

    if (category_id) {
      conditions.push(`s.category_id = $${paramCount++}`);
      params.push(category_id);
    }

    if (subcategory_id) {
      conditions.push(`s.subcategory_id = $${paramCount++}`);
      params.push(subcategory_id);
    }

    if (active !== undefined) {
      conditions.push(`s.active = $${paramCount++}`);
      params.push(active === 'true');
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const result = await query(
      `SELECT s.*,
              c.name_ar as category_name_ar, c.name_en as category_name_en,
              sc.name_ar as subcategory_name_ar, sc.name_en as subcategory_name_en
       FROM services s
       LEFT JOIN categories c ON s.category_id = c.id
       LEFT JOIN subcategories sc ON s.subcategory_id = sc.id
       ${whereClause}
       ORDER BY s.order_index ASC, s.name_ar ASC`,
      params
    );

    res.json({ services: result.rows });
  } catch (error) {
    console.error('Get services error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getServiceById = async (req, res) => {
  try {
    const { id } = req.params;

    const serviceResult = await query(
      `SELECT s.*,
              c.name_ar as category_name_ar, c.name_en as category_name_en,
              sc.name_ar as subcategory_name_ar, sc.name_en as subcategory_name_en
       FROM services s
       LEFT JOIN categories c ON s.category_id = c.id
       LEFT JOIN subcategories sc ON s.subcategory_id = sc.id
       WHERE s.id = $1`,
      [id]
    );

    if (serviceResult.rows.length === 0) {
      return res.status(404).json({ error: 'Service not found' });
    }

    const fieldsResult = await query(
      'SELECT * FROM service_fields WHERE service_id = $1 ORDER BY order_index ASC',
      [id]
    );

    const requirementsResult = await query(
      'SELECT * FROM service_requirements WHERE service_id = $1 ORDER BY order_index ASC',
      [id]
    );

    const documentsResult = await query(
      'SELECT * FROM service_documents WHERE service_id = $1 ORDER BY order_index ASC',
      [id]
    );

    const service = {
      ...serviceResult.rows[0],
      fields: fieldsResult.rows,
      requirements: requirementsResult.rows,
      documents: documentsResult.rows
    };

    res.json({ service });
  } catch (error) {
    console.error('Get service error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getCategories = async (req, res) => {
  try {
    const result = await query(
      'SELECT * FROM categories ORDER BY order_index ASC'
    );

    res.json({ categories: result.rows });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getSubcategories = async (req, res) => {
  try {
    const { category_id } = req.query;

    const whereClause = category_id ? 'WHERE category_id = $1' : '';
    const params = category_id ? [category_id] : [];

    const result = await query(
      `SELECT * FROM subcategories ${whereClause} ORDER BY order_index ASC`,
      params
    );

    res.json({ subcategories: result.rows });
  } catch (error) {
    console.error('Get subcategories error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getRegions = async (req, res) => {
  try {
    const result = await query(
      'SELECT * FROM regions ORDER BY name_ar ASC'
    );

    res.json({ regions: result.rows });
  } catch (error) {
    console.error('Get regions error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
