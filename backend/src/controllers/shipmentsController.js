import pool from '../config/database.js';

export const getAllShipments = async (req, res) => {
  try {
    const { status, application_id, company_id } = req.query;

    let query = `
      SELECT s.*, sc.name_ar as company_name_ar, sc.name_en as company_name_en,
             sc.tracking_url_template,
             app.reference_number, app.full_name
      FROM shipments s
      LEFT JOIN shipping_companies sc ON s.shipping_company_id = sc.id
      LEFT JOIN applications app ON s.application_id = app.id
      WHERE 1=1
    `;
    const params = [];

    if (status) {
      params.push(status);
      query += ` AND s.status = $${params.length}`;
    }

    if (application_id) {
      params.push(application_id);
      query += ` AND s.application_id = $${params.length}`;
    }

    if (company_id) {
      params.push(company_id);
      query += ` AND s.shipping_company_id = $${params.length}`;
    }

    query += ' ORDER BY s.created_at DESC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching shipments:', error);
    res.status(500).json({ error: 'Failed to fetch shipments' });
  }
};

export const getShipmentById = async (req, res) => {
  try {
    const { id } = req.params;

    const shipmentResult = await pool.query(`
      SELECT s.*, sc.name_ar as company_name_ar, sc.name_en as company_name_en,
             sc.tracking_url_template, sc.website,
             app.reference_number, app.full_name, app.email, app.phone
      FROM shipments s
      LEFT JOIN shipping_companies sc ON s.shipping_company_id = sc.id
      LEFT JOIN applications app ON s.application_id = app.id
      WHERE s.id = $1
    `, [id]);

    if (shipmentResult.rows.length === 0) {
      return res.status(404).json({ error: 'Shipment not found' });
    }

    const trackingResult = await pool.query(`
      SELECT * FROM tracking_updates
      WHERE shipment_id = $1
      ORDER BY created_at DESC
    `, [id]);

    const shipment = shipmentResult.rows[0];
    shipment.tracking_updates = trackingResult.rows;

    res.json(shipment);
  } catch (error) {
    console.error('Error fetching shipment:', error);
    res.status(500).json({ error: 'Failed to fetch shipment' });
  }
};

export const createShipment = async (req, res) => {
  try {
    const {
      application_id,
      shipping_company_id,
      tracking_number,
      recipient_name,
      recipient_phone,
      recipient_address,
      city,
      postal_code,
      notes
    } = req.body;

    if (!application_id || !recipient_name || !recipient_phone || !recipient_address || !city) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const result = await pool.query(`
      INSERT INTO shipments (
        application_id, shipping_company_id, tracking_number,
        recipient_name, recipient_phone, recipient_address,
        city, postal_code, notes, status
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'preparing')
      RETURNING *
    `, [
      application_id, shipping_company_id, tracking_number,
      recipient_name, recipient_phone, recipient_address,
      city, postal_code, notes
    ]);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating shipment:', error);
    res.status(500).json({ error: 'Failed to create shipment' });
  }
};

export const updateShipment = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      shipping_company_id,
      tracking_number,
      status,
      recipient_name,
      recipient_phone,
      recipient_address,
      city,
      postal_code,
      shipped_date,
      delivered_date,
      notes
    } = req.body;

    const updates = [];
    const params = [];
    let paramCount = 1;

    if (shipping_company_id !== undefined) {
      params.push(shipping_company_id);
      updates.push(`shipping_company_id = $${paramCount++}`);
    }

    if (tracking_number !== undefined) {
      params.push(tracking_number);
      updates.push(`tracking_number = $${paramCount++}`);
    }

    if (status) {
      params.push(status);
      updates.push(`status = $${paramCount++}`);
    }

    if (recipient_name) {
      params.push(recipient_name);
      updates.push(`recipient_name = $${paramCount++}`);
    }

    if (recipient_phone) {
      params.push(recipient_phone);
      updates.push(`recipient_phone = $${paramCount++}`);
    }

    if (recipient_address) {
      params.push(recipient_address);
      updates.push(`recipient_address = $${paramCount++}`);
    }

    if (city) {
      params.push(city);
      updates.push(`city = $${paramCount++}`);
    }

    if (postal_code !== undefined) {
      params.push(postal_code);
      updates.push(`postal_code = $${paramCount++}`);
    }

    if (shipped_date !== undefined) {
      params.push(shipped_date);
      updates.push(`shipped_date = $${paramCount++}`);
    }

    if (delivered_date !== undefined) {
      params.push(delivered_date);
      updates.push(`delivered_date = $${paramCount++}`);
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
      UPDATE shipments
      SET ${updates.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await pool.query(query, params);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Shipment not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating shipment:', error);
    res.status(500).json({ error: 'Failed to update shipment' });
  }
};

export const deleteShipment = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query('DELETE FROM shipments WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Shipment not found' });
    }

    res.json({ message: 'Shipment deleted successfully' });
  } catch (error) {
    console.error('Error deleting shipment:', error);
    res.status(500).json({ error: 'Failed to delete shipment' });
  }
};

export const addTrackingUpdate = async (req, res) => {
  try {
    const { shipment_id } = req.params;
    const { status, location, description_ar, description_en } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    const result = await pool.query(`
      INSERT INTO tracking_updates (shipment_id, status, location, description_ar, description_en)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `, [shipment_id, status, location, description_ar, description_en]);

    await pool.query(
      'UPDATE shipments SET status = $1 WHERE id = $2',
      [status, shipment_id]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error adding tracking update:', error);
    res.status(500).json({ error: 'Failed to add tracking update' });
  }
};

export const getShippingCompanies = async (req, res) => {
  try {
    const { active } = req.query;

    let query = 'SELECT * FROM shipping_companies';
    const params = [];

    if (active !== undefined) {
      params.push(active === 'true');
      query += ` WHERE active = $${params.length}`;
    }

    query += ' ORDER BY name_ar';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching shipping companies:', error);
    res.status(500).json({ error: 'Failed to fetch shipping companies' });
  }
};

export const createShippingCompany = async (req, res) => {
  try {
    const { name_ar, name_en, contact_phone, contact_email, website, tracking_url_template } = req.body;

    if (!name_ar || !name_en) {
      return res.status(400).json({ error: 'Name in both languages is required' });
    }

    const result = await pool.query(`
      INSERT INTO shipping_companies (name_ar, name_en, contact_phone, contact_email, website, tracking_url_template)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `, [name_ar, name_en, contact_phone, contact_email, website, tracking_url_template]);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating shipping company:', error);
    res.status(500).json({ error: 'Failed to create shipping company' });
  }
};

export const updateShippingCompany = async (req, res) => {
  try {
    const { id } = req.params;
    const { name_ar, name_en, contact_phone, contact_email, website, tracking_url_template, active } = req.body;

    const updates = [];
    const params = [];
    let paramCount = 1;

    if (name_ar) {
      params.push(name_ar);
      updates.push(`name_ar = $${paramCount++}`);
    }

    if (name_en) {
      params.push(name_en);
      updates.push(`name_en = $${paramCount++}`);
    }

    if (contact_phone !== undefined) {
      params.push(contact_phone);
      updates.push(`contact_phone = $${paramCount++}`);
    }

    if (contact_email !== undefined) {
      params.push(contact_email);
      updates.push(`contact_email = $${paramCount++}`);
    }

    if (website !== undefined) {
      params.push(website);
      updates.push(`website = $${paramCount++}`);
    }

    if (tracking_url_template !== undefined) {
      params.push(tracking_url_template);
      updates.push(`tracking_url_template = $${paramCount++}`);
    }

    if (active !== undefined) {
      params.push(active);
      updates.push(`active = $${paramCount++}`);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    params.push(id);
    const query = `
      UPDATE shipping_companies
      SET ${updates.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await pool.query(query, params);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Shipping company not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating shipping company:', error);
    res.status(500).json({ error: 'Failed to update shipping company' });
  }
};

export const deleteShippingCompany = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query('DELETE FROM shipping_companies WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Shipping company not found' });
    }

    res.json({ message: 'Shipping company deleted successfully' });
  } catch (error) {
    console.error('Error deleting shipping company:', error);
    res.status(500).json({ error: 'Failed to delete shipping company' });
  }
};
