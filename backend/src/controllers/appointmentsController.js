import pool from '../config/database.js';

export const getAllAppointments = async (req, res) => {
  try {
    const { status, date_from, date_to, application_id } = req.query;

    let query = `
      SELECT a.*, app.reference_number, app.full_name, s.name_ar as service_name
      FROM appointments a
      LEFT JOIN applications app ON a.application_id = app.id
      LEFT JOIN services s ON app.service_id = s.id
      WHERE 1=1
    `;
    const params = [];

    if (status) {
      params.push(status);
      query += ` AND a.status = $${params.length}`;
    }

    if (date_from) {
      params.push(date_from);
      query += ` AND a.appointment_date >= $${params.length}`;
    }

    if (date_to) {
      params.push(date_to);
      query += ` AND a.appointment_date <= $${params.length}`;
    }

    if (application_id) {
      params.push(application_id);
      query += ` AND a.application_id = $${params.length}`;
    }

    query += ' ORDER BY a.appointment_date DESC, a.appointment_time DESC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({ error: 'Failed to fetch appointments' });
  }
};

export const getAppointmentById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(`
      SELECT a.*, app.reference_number, app.full_name, app.email, app.phone,
             s.name_ar as service_name, s.name_en as service_name_en
      FROM appointments a
      LEFT JOIN applications app ON a.application_id = app.id
      LEFT JOIN services s ON app.service_id = s.id
      WHERE a.id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching appointment:', error);
    res.status(500).json({ error: 'Failed to fetch appointment' });
  }
};

export const createAppointment = async (req, res) => {
  try {
    const { application_id, appointment_date, appointment_time, notes } = req.body;

    if (!application_id || !appointment_date || !appointment_time) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const conflictCheck = await pool.query(`
      SELECT id FROM appointments
      WHERE appointment_date = $1 AND appointment_time = $2 AND status != 'cancelled'
    `, [appointment_date, appointment_time]);

    if (conflictCheck.rows.length > 0) {
      return res.status(400).json({ error: 'Time slot already booked' });
    }

    const result = await pool.query(`
      INSERT INTO appointments (application_id, appointment_date, appointment_time, notes, status)
      VALUES ($1, $2, $3, $4, 'scheduled')
      RETURNING *
    `, [application_id, appointment_date, appointment_time, notes]);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating appointment:', error);
    res.status(500).json({ error: 'Failed to create appointment' });
  }
};

export const updateAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const { appointment_date, appointment_time, status, notes } = req.body;

    const updates = [];
    const params = [];
    let paramCount = 1;

    if (appointment_date) {
      params.push(appointment_date);
      updates.push(`appointment_date = $${paramCount++}`);
    }

    if (appointment_time) {
      params.push(appointment_time);
      updates.push(`appointment_time = $${paramCount++}`);
    }

    if (status) {
      params.push(status);
      updates.push(`status = $${paramCount++}`);
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
      UPDATE appointments
      SET ${updates.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await pool.query(query, params);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating appointment:', error);
    res.status(500).json({ error: 'Failed to update appointment' });
  }
};

export const deleteAppointment = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query('DELETE FROM appointments WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    res.json({ message: 'Appointment deleted successfully' });
  } catch (error) {
    console.error('Error deleting appointment:', error);
    res.status(500).json({ error: 'Failed to delete appointment' });
  }
};

export const getAppointmentSettings = async (req, res) => {
  try {
    const { service_id } = req.query;

    let query = 'SELECT * FROM appointment_settings';
    const params = [];

    if (service_id) {
      params.push(service_id);
      query += ` WHERE service_id = $${params.length}`;
    }

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching appointment settings:', error);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
};

export const updateAppointmentSettings = async (req, res) => {
  try {
    const { service_id, slots_per_day, duration_minutes, advance_booking_days, working_hours } = req.body;

    if (!service_id) {
      return res.status(400).json({ error: 'service_id is required' });
    }

    const result = await pool.query(`
      INSERT INTO appointment_settings (service_id, slots_per_day, duration_minutes, advance_booking_days, working_hours)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (service_id)
      DO UPDATE SET
        slots_per_day = $2,
        duration_minutes = $3,
        advance_booking_days = $4,
        working_hours = $5
      RETURNING *
    `, [service_id, slots_per_day, duration_minutes, advance_booking_days, JSON.stringify(working_hours)]);

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating appointment settings:', error);
    res.status(500).json({ error: 'Failed to update settings' });
  }
};

export const getClosedDays = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM closed_days ORDER BY date ASC');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching closed days:', error);
    res.status(500).json({ error: 'Failed to fetch closed days' });
  }
};

export const addClosedDay = async (req, res) => {
  try {
    const { date, reason_ar, reason_en } = req.body;

    if (!date) {
      return res.status(400).json({ error: 'Date is required' });
    }

    const result = await pool.query(`
      INSERT INTO closed_days (date, reason_ar, reason_en)
      VALUES ($1, $2, $3)
      RETURNING *
    `, [date, reason_ar, reason_en]);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error adding closed day:', error);
    res.status(500).json({ error: 'Failed to add closed day' });
  }
};

export const deleteClosedDay = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query('DELETE FROM closed_days WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Closed day not found' });
    }

    res.json({ message: 'Closed day deleted successfully' });
  } catch (error) {
    console.error('Error deleting closed day:', error);
    res.status(500).json({ error: 'Failed to delete closed day' });
  }
};

export const getAvailableSlots = async (req, res) => {
  try {
    const { service_id, date } = req.query;

    if (!service_id || !date) {
      return res.status(400).json({ error: 'service_id and date are required' });
    }

    const settings = await pool.query(
      'SELECT * FROM appointment_settings WHERE service_id = $1',
      [service_id]
    );

    if (settings.rows.length === 0) {
      return res.status(404).json({ error: 'No appointment settings found for this service' });
    }

    const { slots_per_day, duration_minutes, working_hours } = settings.rows[0];

    const closedDay = await pool.query(
      'SELECT id FROM closed_days WHERE date = $1',
      [date]
    );

    if (closedDay.rows.length > 0) {
      return res.json({ available_slots: [] });
    }

    const bookedSlots = await pool.query(
      `SELECT appointment_time FROM appointments
       WHERE appointment_date = $1 AND status != 'cancelled'`,
      [date]
    );

    const bookedTimes = bookedSlots.rows.map(row => row.appointment_time);

    const availableSlots = [];
    const startHour = parseInt(working_hours.start.split(':')[0]);
    const endHour = parseInt(working_hours.end.split(':')[0]);

    for (let hour = startHour; hour < endHour; hour++) {
      const time = `${hour.toString().padStart(2, '0')}:00:00`;
      if (!bookedTimes.includes(time) && availableSlots.length < slots_per_day) {
        availableSlots.push(time);
      }
    }

    res.json({ available_slots: availableSlots });
  } catch (error) {
    console.error('Error fetching available slots:', error);
    res.status(500).json({ error: 'Failed to fetch available slots' });
  }
};
