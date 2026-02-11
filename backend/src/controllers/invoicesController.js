import pool from '../config/database.js';

export const getAllInvoices = async (req, res) => {
  try {
    const { status, application_id } = req.query;

    let query = `
      SELECT i.*, a.reference_number, a.full_name, s.name_ar as service_name
      FROM invoices i
      LEFT JOIN applications a ON i.application_id = a.id
      LEFT JOIN services s ON a.service_id = s.id
      WHERE 1=1
    `;
    const params = [];

    if (status) {
      params.push(status);
      query += ` AND i.status = $${params.length}`;
    }

    if (application_id) {
      params.push(application_id);
      query += ` AND i.application_id = $${params.length}`;
    }

    query += ' ORDER BY i.created_at DESC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching invoices:', error);
    res.status(500).json({ error: 'Failed to fetch invoices' });
  }
};

export const getInvoiceById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(`
      SELECT i.*, a.reference_number, a.full_name, a.email, a.phone,
             s.name_ar as service_name, s.name_en as service_name_en
      FROM invoices i
      LEFT JOIN applications a ON i.application_id = a.id
      LEFT JOIN services s ON a.service_id = s.id
      WHERE i.id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching invoice:', error);
    res.status(500).json({ error: 'Failed to fetch invoice' });
  }
};

export const createInvoice = async (req, res) => {
  try {
    const { application_id, amount, notes } = req.body;

    if (!application_id || !amount) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const invoiceNumber = `INV-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const result = await pool.query(`
      INSERT INTO invoices (application_id, invoice_number, amount, notes, status)
      VALUES ($1, $2, $3, $4, 'pending')
      RETURNING *
    `, [application_id, invoiceNumber, amount, notes]);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating invoice:', error);
    res.status(500).json({ error: 'Failed to create invoice' });
  }
};

export const updateInvoice = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, payment_method, payment_date, notes } = req.body;

    const updates = [];
    const params = [];
    let paramCount = 1;

    if (status) {
      params.push(status);
      updates.push(`status = $${paramCount++}`);
    }

    if (payment_method !== undefined) {
      params.push(payment_method);
      updates.push(`payment_method = $${paramCount++}`);
    }

    if (payment_date !== undefined) {
      params.push(payment_date);
      updates.push(`payment_date = $${paramCount++}`);
    }

    if (notes !== undefined) {
      params.push(notes);
      updates.push(`notes = $${paramCount++}`);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    params.push(id);
    const query = `
      UPDATE invoices
      SET ${updates.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await pool.query(query, params);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating invoice:', error);
    res.status(500).json({ error: 'Failed to update invoice' });
  }
};

export const deleteInvoice = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query('DELETE FROM invoices WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    res.json({ message: 'Invoice deleted successfully' });
  } catch (error) {
    console.error('Error deleting invoice:', error);
    res.status(500).json({ error: 'Failed to delete invoice' });
  }
};
