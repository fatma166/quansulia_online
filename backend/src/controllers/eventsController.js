import pool from '../config/database.js';

export const getAllEvents = async (req, res) => {
  try {
    const { published } = req.query;

    let query = 'SELECT * FROM events WHERE 1=1';
    const params = [];

    if (published !== undefined) {
      params.push(published === 'true');
      query += ` AND published = $${params.length}`;
    }

    query += ' ORDER BY event_date DESC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
};

export const getEventById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query('SELECT * FROM events WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching event:', error);
    res.status(500).json({ error: 'Failed to fetch event' });
  }
};

export const createEvent = async (req, res) => {
  try {
    const {
      title_ar, title_en, description_ar, description_en,
      image_url, event_date, event_time, location_ar, location_en,
      registration_enabled, max_participants, published
    } = req.body;

    if (!title_ar || !title_en || !description_ar || !description_en || !event_date) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const result = await pool.query(`
      INSERT INTO events (
        title_ar, title_en, description_ar, description_en,
        image_url, event_date, event_time, location_ar, location_en,
        registration_enabled, max_participants, published, author_id
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *
    `, [
      title_ar, title_en, description_ar, description_en,
      image_url, event_date, event_time, location_ar, location_en,
      registration_enabled, max_participants, published,
      req.user?.id || null
    ]);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ error: 'Failed to create event' });
  }
};

export const updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = [];
    const params = [];
    let paramCount = 1;

    const fields = [
      'title_ar', 'title_en', 'description_ar', 'description_en',
      'image_url', 'event_date', 'event_time', 'location_ar', 'location_en',
      'registration_enabled', 'max_participants', 'published'
    ];

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
      UPDATE events
      SET ${updates.join(', ')}, updated_at = NOW()
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await pool.query(query, params);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating event:', error);
    res.status(500).json({ error: 'Failed to update event' });
  }
};

export const deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query('DELETE FROM events WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }

    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({ error: 'Failed to delete event' });
  }
};

export const getEventRegistrations = async (req, res) => {
  try {
    const { event_id } = req.params;

    const result = await pool.query(`
      SELECT * FROM event_registrations
      WHERE event_id = $1
      ORDER BY created_at DESC
    `, [event_id]);

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching registrations:', error);
    res.status(500).json({ error: 'Failed to fetch registrations' });
  }
};

export const createEventRegistration = async (req, res) => {
  try {
    const { event_id, full_name, email, phone, additional_info } = req.body;

    if (!event_id || !full_name || !email || !phone) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const event = await pool.query('SELECT * FROM events WHERE id = $1', [event_id]);

    if (event.rows.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }

    if (!event.rows[0].registration_enabled) {
      return res.status(400).json({ error: 'Registration is not enabled for this event' });
    }

    if (event.rows[0].max_participants) {
      const count = await pool.query(
        'SELECT COUNT(*) FROM event_registrations WHERE event_id = $1',
        [event_id]
      );

      if (parseInt(count.rows[0].count) >= event.rows[0].max_participants) {
        return res.status(400).json({ error: 'Event is full' });
      }
    }

    const result = await pool.query(`
      INSERT INTO event_registrations (event_id, full_name, email, phone, additional_info)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `, [event_id, full_name, email, phone, additional_info]);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating registration:', error);
    res.status(500).json({ error: 'Failed to create registration' });
  }
};
