import pool from '../config/database.js';
import bcrypt from 'bcryptjs';

export const getAllStaff = async (req, res) => {
  try {
    const { role, active, region_id } = req.query;

    let query = `
      SELECT s.*, r.name_ar as region_name_ar, r.name_en as region_name_en,
             sp.permissions, sp.allowed_services
      FROM staff s
      LEFT JOIN regions r ON s.region_id = r.id
      LEFT JOIN staff_permissions sp ON s.id = sp.staff_id
      WHERE 1=1
    `;
    const params = [];

    if (role) {
      params.push(role);
      query += ` AND s.role = $${params.length}`;
    }

    if (active !== undefined) {
      params.push(active === 'true');
      query += ` AND s.active = $${params.length}`;
    }

    if (region_id) {
      params.push(region_id);
      query += ` AND s.region_id = $${params.length}`;
    }

    query += ' ORDER BY s.created_at DESC';

    const result = await pool.query(query, params);

    const staff = result.rows.map(row => {
      const { password, ...staffWithoutPassword } = row;
      return staffWithoutPassword;
    });

    res.json(staff);
  } catch (error) {
    console.error('Error fetching staff:', error);
    res.status(500).json({ error: 'Failed to fetch staff' });
  }
};

export const getStaffById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(`
      SELECT s.*, r.name_ar as region_name_ar, r.name_en as region_name_en,
             sp.permissions, sp.allowed_services
      FROM staff s
      LEFT JOIN regions r ON s.region_id = r.id
      LEFT JOIN staff_permissions sp ON s.id = sp.staff_id
      WHERE s.id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Staff not found' });
    }

    const { password, ...staffWithoutPassword } = result.rows[0];

    res.json(staffWithoutPassword);
  } catch (error) {
    console.error('Error fetching staff:', error);
    res.status(500).json({ error: 'Failed to fetch staff' });
  }
};

export const createStaff = async (req, res) => {
  const client = await pool.connect();

  try {
    const {
      email,
      username,
      password,
      full_name,
      role,
      phone,
      region_id,
      active,
      permissions,
      allowed_services
    } = req.body;

    if (!email || !username || !password || !full_name || !role) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    await client.query('BEGIN');

    const existingUser = await client.query(
      'SELECT id FROM staff WHERE email = $1 OR username = $2',
      [email, username]
    );

    if (existingUser.rows.length > 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Email or username already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const staffResult = await client.query(`
      INSERT INTO staff (email, username, password, full_name, role, phone, region_id, active)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `, [email, username, hashedPassword, full_name, role, phone, region_id, active !== false]);

    const staff = staffResult.rows[0];

    if (permissions || allowed_services) {
      await client.query(`
        INSERT INTO staff_permissions (staff_id, permissions, allowed_services)
        VALUES ($1, $2, $3)
      `, [staff.id, JSON.stringify(permissions || {}), allowed_services || null]);
    }

    await client.query('COMMIT');

    const { password: _, ...staffWithoutPassword } = staff;

    res.status(201).json(staffWithoutPassword);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creating staff:', error);
    res.status(500).json({ error: 'Failed to create staff' });
  } finally {
    client.release();
  }
};

export const updateStaff = async (req, res) => {
  const client = await pool.connect();

  try {
    const { id } = req.params;
    const {
      email,
      username,
      password,
      full_name,
      role,
      phone,
      region_id,
      active,
      permissions,
      allowed_services
    } = req.body;

    await client.query('BEGIN');

    const existingStaff = await client.query('SELECT * FROM staff WHERE id = $1', [id]);

    if (existingStaff.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Staff not found' });
    }

    const updates = [];
    const params = [];
    let paramCount = 1;

    if (email) {
      params.push(email);
      updates.push(`email = $${paramCount++}`);
    }

    if (username) {
      params.push(username);
      updates.push(`username = $${paramCount++}`);
    }

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      params.push(hashedPassword);
      updates.push(`password = $${paramCount++}`);
    }

    if (full_name) {
      params.push(full_name);
      updates.push(`full_name = $${paramCount++}`);
    }

    if (role) {
      params.push(role);
      updates.push(`role = $${paramCount++}`);
    }

    if (phone !== undefined) {
      params.push(phone);
      updates.push(`phone = $${paramCount++}`);
    }

    if (region_id !== undefined) {
      params.push(region_id);
      updates.push(`region_id = $${paramCount++}`);
    }

    if (active !== undefined) {
      params.push(active);
      updates.push(`active = $${paramCount++}`);
    }

    if (updates.length > 0) {
      params.push(id);
      const query = `
        UPDATE staff
        SET ${updates.join(', ')}, updated_at = NOW()
        WHERE id = $${paramCount}
        RETURNING *
      `;

      const result = await client.query(query, params);

      if (permissions !== undefined || allowed_services !== undefined) {
        await client.query(`
          INSERT INTO staff_permissions (staff_id, permissions, allowed_services)
          VALUES ($1, $2, $3)
          ON CONFLICT (staff_id)
          DO UPDATE SET
            permissions = COALESCE($2, staff_permissions.permissions),
            allowed_services = COALESCE($3, staff_permissions.allowed_services),
            updated_at = NOW()
        `, [id, permissions ? JSON.stringify(permissions) : null, allowed_services]);
      }

      await client.query('COMMIT');

      const { password: _, ...staffWithoutPassword } = result.rows[0];
      res.json(staffWithoutPassword);
    } else {
      await client.query('ROLLBACK');
      res.status(400).json({ error: 'No fields to update' });
    }
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error updating staff:', error);
    res.status(500).json({ error: 'Failed to update staff' });
  } finally {
    client.release();
  }
};

export const deleteStaff = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query('DELETE FROM staff WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Staff not found' });
    }

    res.json({ message: 'Staff deleted successfully' });
  } catch (error) {
    console.error('Error deleting staff:', error);
    res.status(500).json({ error: 'Failed to delete staff' });
  }
};

export const updateStaffPermissions = async (req, res) => {
  try {
    const { id } = req.params;
    const { permissions, allowed_services } = req.body;

    const result = await pool.query(`
      INSERT INTO staff_permissions (staff_id, permissions, allowed_services)
      VALUES ($1, $2, $3)
      ON CONFLICT (staff_id)
      DO UPDATE SET
        permissions = $2,
        allowed_services = $3,
        updated_at = NOW()
      RETURNING *
    `, [id, JSON.stringify(permissions), allowed_services]);

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating permissions:', error);
    res.status(500).json({ error: 'Failed to update permissions' });
  }
};
