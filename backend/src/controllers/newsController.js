import pool from '../config/database.js';

export const getAllNews = async (req, res) => {
  try {
    const { published, featured, category } = req.query;

    let query = 'SELECT * FROM news WHERE 1=1';
    const params = [];

    if (published !== undefined) {
      params.push(published === 'true');
      query += ` AND published = $${params.length}`;
    }

    if (featured !== undefined) {
      params.push(featured === 'true');
      query += ` AND featured = $${params.length}`;
    }

    if (category) {
      params.push(category);
      query += ` AND category = $${params.length}`;
    }

    query += ' ORDER BY published_at DESC NULLS LAST, created_at DESC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching news:', error);
    res.status(500).json({ error: 'Failed to fetch news' });
  }
};

export const getNewsById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query('SELECT * FROM news WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'News not found' });
    }

    await pool.query('UPDATE news SET views = views + 1 WHERE id = $1', [id]);

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching news:', error);
    res.status(500).json({ error: 'Failed to fetch news' });
  }
};

export const createNews = async (req, res) => {
  try {
    const {
      title_ar,
      title_en,
      content_ar,
      content_en,
      excerpt_ar,
      excerpt_en,
      image_url,
      category,
      published,
      featured
    } = req.body;

    if (!title_ar || !title_en || !content_ar || !content_en) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const result = await pool.query(`
      INSERT INTO news (
        title_ar, title_en, content_ar, content_en,
        excerpt_ar, excerpt_en, image_url, category,
        published, featured, published_at, author_id
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *
    `, [
      title_ar, title_en, content_ar, content_en,
      excerpt_ar, excerpt_en, image_url, category,
      published, featured,
      published ? new Date() : null,
      req.user?.id || null
    ]);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating news:', error);
    res.status(500).json({ error: 'Failed to create news' });
  }
};

export const updateNews = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title_ar,
      title_en,
      content_ar,
      content_en,
      excerpt_ar,
      excerpt_en,
      image_url,
      category,
      published,
      featured
    } = req.body;

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

    if (content_ar) {
      params.push(content_ar);
      updates.push(`content_ar = $${paramCount++}`);
    }

    if (content_en) {
      params.push(content_en);
      updates.push(`content_en = $${paramCount++}`);
    }

    if (excerpt_ar !== undefined) {
      params.push(excerpt_ar);
      updates.push(`excerpt_ar = $${paramCount++}`);
    }

    if (excerpt_en !== undefined) {
      params.push(excerpt_en);
      updates.push(`excerpt_en = $${paramCount++}`);
    }

    if (image_url !== undefined) {
      params.push(image_url);
      updates.push(`image_url = $${paramCount++}`);
    }

    if (category !== undefined) {
      params.push(category);
      updates.push(`category = $${paramCount++}`);
    }

    if (published !== undefined) {
      params.push(published);
      updates.push(`published = $${paramCount++}`);

      if (published) {
        const existing = await pool.query('SELECT published_at FROM news WHERE id = $1', [id]);
        if (existing.rows.length > 0 && !existing.rows[0].published_at) {
          updates.push(`published_at = NOW()`);
        }
      }
    }

    if (featured !== undefined) {
      params.push(featured);
      updates.push(`featured = $${paramCount++}`);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    params.push(id);
    const query = `
      UPDATE news
      SET ${updates.join(', ')}, updated_at = NOW()
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await pool.query(query, params);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'News not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating news:', error);
    res.status(500).json({ error: 'Failed to update news' });
  }
};

export const deleteNews = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query('DELETE FROM news WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'News not found' });
    }

    res.json({ message: 'News deleted successfully' });
  } catch (error) {
    console.error('Error deleting news:', error);
    res.status(500).json({ error: 'Failed to delete news' });
  }
};
