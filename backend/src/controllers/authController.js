import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../config/database.js';

export const login = async (req, res) => {
  try {
    const { email, password, username } = req.body;

    if ((!email && !username) || !password) {
      return res.status(400).json({ error: 'Email/username and password are required' });
    }

    const queryText = email
      ? 'SELECT * FROM staff WHERE email = $1 AND active = true'
      : 'SELECT * FROM staff WHERE username = $1 AND active = true';

    const result = await query(queryText, [email || username]);

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = result.rows[0];

    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    const { password: _, ...userWithoutPassword } = user;

    res.json({
      token,
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createStaff = async (req, res) => {
  try {
    const {
      email,
      username,
      password,
      full_name,
      role,
      phone,
      region_id,
      permissions
    } = req.body;

    if (!email || !password || !full_name || !role) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const existingUser = await query(
      'SELECT id FROM staff WHERE email = $1 OR username = $2',
      [email, username || email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await query(
      `INSERT INTO staff (email, username, password, full_name, role, phone, region_id, active)
       VALUES ($1, $2, $3, $4, $5, $6, $7, true)
       RETURNING id, email, username, full_name, role, phone, region_id, active, created_at`,
      [email, username || email, hashedPassword, full_name, role, phone, region_id]
    );

    const newUser = result.rows[0];

    if (permissions && role !== 'super_admin') {
      await query(
        `INSERT INTO staff_permissions (staff_id, permissions)
         VALUES ($1, $2)`,
        [newUser.id, JSON.stringify(permissions)]
      );
    }

    res.status(201).json({ user: newUser });
  } catch (error) {
    console.error('Create staff error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { userId } = req.params;
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    if (req.user.role !== 'super_admin' && req.user.id !== userId) {
      return res.status(403).json({ error: 'Permission denied' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await query(
      'UPDATE staff SET password = $1 WHERE id = $2',
      [hashedPassword, userId]
    );

    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getProfile = async (req, res) => {
  try {
    const result = await query(
      `SELECT s.*, r.name_ar as region_name_ar, r.name_en as region_name_en,
              sp.permissions
       FROM staff s
       LEFT JOIN regions r ON s.region_id = r.id
       LEFT JOIN staff_permissions sp ON s.id = sp.staff_id
       WHERE s.id = $1`,
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { password: _, ...user } = result.rows[0];

    res.json({ user });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
