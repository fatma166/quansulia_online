import { query, getClient } from '../config/database.js';

export const getApplications = async (req, res) => {
  try {
    const {
      status,
      service_id,
      region_id,
      search,
      page = 1,
      limit = 20
    } = req.query;

    const offset = (page - 1) * limit;
    const conditions = [];
    const params = [];
    let paramCount = 1;

    if (status) {
      conditions.push(`a.status = $${paramCount++}`);
      params.push(status);
    }

    if (service_id) {
      conditions.push(`a.service_id = $${paramCount++}`);
      params.push(service_id);
    }

    if (region_id && req.user.role !== 'super_admin') {
      conditions.push(`a.region_id = $${paramCount++}`);
      params.push(region_id);
    }

    if (search) {
      conditions.push(`(a.reference_number ILIKE $${paramCount} OR a.full_name ILIKE $${paramCount} OR a.email ILIKE $${paramCount})`);
      params.push(`%${search}%`);
      paramCount++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const countResult = await query(
      `SELECT COUNT(*) FROM applications a ${whereClause}`,
      params
    );

    const total = parseInt(countResult.rows[0].count);

    params.push(limit, offset);

    const result = await query(
      `SELECT a.*, s.name_ar as service_name_ar, s.name_en as service_name_en,
              r.name_ar as region_name_ar, r.name_en as region_name_en
       FROM applications a
       LEFT JOIN services s ON a.service_id = s.id
       LEFT JOIN regions r ON a.region_id = r.id
       ${whereClause}
       ORDER BY a.created_at DESC
       LIMIT $${paramCount++} OFFSET $${paramCount}`,
      params
    );

    res.json({
      applications: result.rows,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Get applications error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getApplicationById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(
      `SELECT a.*, s.name_ar as service_name_ar, s.name_en as service_name_en,
              r.name_ar as region_name_ar, r.name_en as region_name_en
       FROM applications a
       LEFT JOIN services s ON a.service_id = s.id
       LEFT JOIN regions r ON a.region_id = r.id
       WHERE a.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Application not found' });
    }

    const statusHistory = await query(
      `SELECT sh.*, s.full_name as staff_name
       FROM status_history sh
       LEFT JOIN staff s ON sh.changed_by = s.id
       WHERE sh.application_id = $1
       ORDER BY sh.created_at DESC`,
      [id]
    );

    const application = {
      ...result.rows[0],
      status_history: statusHistory.rows
    };

    res.json({ application });
  } catch (error) {
    console.error('Get application error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createApplication = async (req, res) => {
  const client = await getClient();

  try {
    await client.query('BEGIN');

    const {
      service_id,
      region_id,
      form_data,
      documents
    } = req.body;

    if (!service_id || !region_id || !form_data) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const serviceResult = await client.query(
      'SELECT * FROM services WHERE id = $1',
      [service_id]
    );

    if (serviceResult.rows.length === 0) {
      return res.status(404).json({ error: 'Service not found' });
    }

    const year = new Date().getFullYear();
    const countResult = await client.query(
      'SELECT COUNT(*) FROM applications WHERE EXTRACT(YEAR FROM created_at) = $1',
      [year]
    );

    const count = parseInt(countResult.rows[0].count) + 1;
    const reference_number = `APP-${year}-${String(count).padStart(6, '0')}`;

    const result = await client.query(
      `INSERT INTO applications (
        service_id, region_id, reference_number, form_data,
        documents, status, full_name, email, phone
      )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [
        service_id,
        region_id,
        reference_number,
        JSON.stringify(form_data),
        JSON.stringify(documents || {}),
        'pending',
        form_data.full_name || form_data.fullName,
        form_data.email,
        form_data.phone
      ]
    );

    const application = result.rows[0];

    await client.query(
      `INSERT INTO status_history (application_id, status, notes)
       VALUES ($1, $2, $3)`,
      [application.id, 'pending', 'Application submitted']
    );

    await client.query('COMMIT');

    res.status(201).json({ application });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Create application error:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    client.release();
  }
};

export const updateApplicationStatus = async (req, res) => {
  const client = await getClient();

  try {
    await client.query('BEGIN');

    const { id } = req.params;
    const { status, notes, rejection_reason } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    const result = await client.query(
      `UPDATE applications
       SET status = $1, updated_at = NOW()
       WHERE id = $2
       RETURNING *`,
      [status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Application not found' });
    }

    await client.query(
      `INSERT INTO status_history (application_id, status, notes, changed_by, staff_name, rejection_reason)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [id, status, notes, req.user.id, req.user.full_name, rejection_reason]
    );

    await client.query('COMMIT');

    res.json({ application: result.rows[0] });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Update status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    client.release();
  }
};

export const deleteApplication = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(
      'DELETE FROM applications WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Application not found' });
    }

    res.json({ message: 'Application deleted successfully' });
  } catch (error) {
    console.error('Delete application error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
