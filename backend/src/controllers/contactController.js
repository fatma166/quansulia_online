import pool from '../config/database.js';

export const getAllContactMessages = async (req, res) => {
  try {
    const { status, replied } = req.query;

    let query = 'SELECT * FROM contact_messages WHERE 1=1';
    const params = [];

    if (status) {
      params.push(status);
      query += ` AND status = $${params.length}`;
    }

    if (replied !== undefined) {
      params.push(replied === 'true');
      query += ` AND replied = $${params.length}`;
    }

    query += ' ORDER BY created_at DESC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching contact messages:', error);
    res.status(500).json({ error: 'Failed to fetch contact messages' });
  }
};

export const getContactMessageById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query('SELECT * FROM contact_messages WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Message not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching message:', error);
    res.status(500).json({ error: 'Failed to fetch message' });
  }
};

export const createContactMessage = async (req, res) => {
  try {
    const { full_name, email, phone, subject, message } = req.body;

    if (!full_name || !email || !subject || !message) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const result = await pool.query(`
      INSERT INTO contact_messages (full_name, email, phone, subject, message)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `, [full_name, email, phone, subject, message]);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating contact message:', error);
    res.status(500).json({ error: 'Failed to create message' });
  }
};

export const updateContactMessageStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, reply_text } = req.body;

    const updates = [];
    const params = [];
    let paramCount = 1;

    if (status) {
      params.push(status);
      updates.push(`status = $${paramCount++}`);
    }

    if (reply_text !== undefined) {
      params.push(reply_text);
      updates.push(`reply_text = $${paramCount++}`);
      updates.push(`replied = true`);
      updates.push(`replied_at = NOW()`);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    params.push(id);
    const query = `
      UPDATE contact_messages
      SET ${updates.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await pool.query(query, params);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Message not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating message:', error);
    res.status(500).json({ error: 'Failed to update message' });
  }
};

export const deleteContactMessage = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query('DELETE FROM contact_messages WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Message not found' });
    }

    res.json({ message: 'Contact message deleted successfully' });
  } catch (error) {
    console.error('Error deleting message:', error);
    res.status(500).json({ error: 'Failed to delete message' });
  }
};
