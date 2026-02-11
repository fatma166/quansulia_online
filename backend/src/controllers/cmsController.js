import pool from '../config/database.js';

export const getAllCMSSections = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM cms_sections ORDER BY order_index ASC');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching CMS sections:', error);
    res.status(500).json({ error: 'Failed to fetch CMS sections' });
  }
};

export const updateCMSSection = async (req, res) => {
  try {
    const { section_key } = req.params;
    const { title_ar, title_en, content_ar, content_en, visible } = req.body;

    const updates = [];
    const params = [];
    let paramCount = 1;

    if (title_ar) {
      params.push(title_ar);
      updates.push(`title_ar = $${paramCount++}`);
    }

    if (title_en) {
      params.push(title_en);
      updates.push(`title_en = $${paramCount++}`);
    }

    if (content_ar !== undefined) {
      params.push(content_ar);
      updates.push(`content_ar = $${paramCount++}`);
    }

    if (content_en !== undefined) {
      params.push(content_en);
      updates.push(`content_en = $${paramCount++}`);
    }

    if (visible !== undefined) {
      params.push(visible);
      updates.push(`visible = $${paramCount++}`);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    params.push(section_key);
    const query = `
      UPDATE cms_sections
      SET ${updates.join(', ')}, updated_at = NOW()
      WHERE section_key = $${paramCount}
      RETURNING *
    `;

    const result = await pool.query(query, params);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Section not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating CMS section:', error);
    res.status(500).json({ error: 'Failed to update section' });
  }
};

export const getHeroSlides = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM cms_hero_slides ORDER BY order_index ASC');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching hero slides:', error);
    res.status(500).json({ error: 'Failed to fetch hero slides' });
  }
};

export const createHeroSlide = async (req, res) => {
  try {
    const {
      title_ar, title_en, subtitle_ar, subtitle_en,
      image_url, button_text_ar, button_text_en, button_link, active, order_index
    } = req.body;

    const result = await pool.query(`
      INSERT INTO cms_hero_slides (
        title_ar, title_en, subtitle_ar, subtitle_en,
        image_url, button_text_ar, button_text_en, button_link, active, order_index
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `, [
      title_ar, title_en, subtitle_ar, subtitle_en,
      image_url, button_text_ar, button_text_en, button_link, active, order_index
    ]);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating hero slide:', error);
    res.status(500).json({ error: 'Failed to create hero slide' });
  }
};

export const updateHeroSlide = async (req, res) => {
  try {
    const { id } = req.params;
    const fields = [
      'title_ar', 'title_en', 'subtitle_ar', 'subtitle_en',
      'image_url', 'button_text_ar', 'button_text_en', 'button_link', 'active', 'order_index'
    ];

    const updates = [];
    const params = [];
    let paramCount = 1;

    fields.forEach(field => {
      if (req.body[field] !== undefined) {
        params.push(req.body[field]);
        updates.push(`${field} = $${paramCount++}`);
      }
    });

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    params.push(id);
    const query = `
      UPDATE cms_hero_slides
      SET ${updates.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await pool.query(query, params);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Hero slide not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating hero slide:', error);
    res.status(500).json({ error: 'Failed to update hero slide' });
  }
};

export const deleteHeroSlide = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query('DELETE FROM cms_hero_slides WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Hero slide not found' });
    }

    res.json({ message: 'Hero slide deleted successfully' });
  } catch (error) {
    console.error('Error deleting hero slide:', error);
    res.status(500).json({ error: 'Failed to delete hero slide' });
  }
};

export const getAnnouncements = async (req, res) => {
  try {
    const { active } = req.query;

    let query = 'SELECT * FROM cms_announcements WHERE 1=1';
    const params = [];

    if (active !== undefined) {
      params.push(active === 'true');
      query += ` AND active = $${params.length}`;
    }

    query += ' ORDER BY created_at DESC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching announcements:', error);
    res.status(500).json({ error: 'Failed to fetch announcements' });
  }
};

export const createAnnouncement = async (req, res) => {
  try {
    const { title_ar, title_en, message_ar, message_en, type, active, show_on_homepage, expires_at } = req.body;

    const result = await pool.query(`
      INSERT INTO cms_announcements (
        title_ar, title_en, message_ar, message_en, type, active, show_on_homepage, expires_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `, [title_ar, title_en, message_ar, message_en, type, active, show_on_homepage, expires_at]);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating announcement:', error);
    res.status(500).json({ error: 'Failed to create announcement' });
  }
};

export const updateAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;
    const fields = ['title_ar', 'title_en', 'message_ar', 'message_en', 'type', 'active', 'show_on_homepage', 'expires_at'];

    const updates = [];
    const params = [];
    let paramCount = 1;

    fields.forEach(field => {
      if (req.body[field] !== undefined) {
        params.push(req.body[field]);
        updates.push(`${field} = $${paramCount++}`);
      }
    });

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    params.push(id);
    const query = `UPDATE cms_announcements SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`;

    const result = await pool.query(query, params);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Announcement not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating announcement:', error);
    res.status(500).json({ error: 'Failed to update announcement' });
  }
};

export const deleteAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query('DELETE FROM cms_announcements WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Announcement not found' });
    }

    res.json({ message: 'Announcement deleted successfully' });
  } catch (error) {
    console.error('Error deleting announcement:', error);
    res.status(500).json({ error: 'Failed to delete announcement' });
  }
};

export const getMaintenanceStatus = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM cms_maintenance LIMIT 1');
    res.json(result.rows[0] || { enabled: false });
  } catch (error) {
    console.error('Error fetching maintenance status:', error);
    res.status(500).json({ error: 'Failed to fetch maintenance status' });
  }
};

export const updateMaintenanceStatus = async (req, res) => {
  try {
    const { enabled, title_ar, title_en, message_ar, message_en, estimated_end } = req.body;

    const result = await pool.query(`
      INSERT INTO cms_maintenance (id, enabled, title_ar, title_en, message_ar, message_en, estimated_end)
      VALUES (uuid_generate_v4(), $1, $2, $3, $4, $5, $6)
      ON CONFLICT (id)
      DO UPDATE SET
        enabled = $1,
        title_ar = $2,
        title_en = $3,
        message_ar = $4,
        message_en = $5,
        estimated_end = $6,
        updated_at = NOW()
      RETURNING *
    `, [enabled, title_ar, title_en, message_ar, message_en, estimated_end]);

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating maintenance status:', error);
    res.status(500).json({ error: 'Failed to update maintenance status' });
  }
};
