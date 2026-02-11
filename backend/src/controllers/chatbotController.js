import pool from '../config/database.js';

export const getChatbotCategories = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM chatbot_categories ORDER BY order_index ASC');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching chatbot categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
};

export const getChatbotQA = async (req, res) => {
  try {
    const { category_id, active } = req.query;

    let query = `
      SELECT qa.*, c.name_ar as category_name_ar, c.name_en as category_name_en
      FROM chatbot_qa qa
      LEFT JOIN chatbot_categories c ON qa.category_id = c.id
      WHERE 1=1
    `;
    const params = [];

    if (category_id) {
      params.push(category_id);
      query += ` AND qa.category_id = $${params.length}`;
    }

    if (active !== undefined) {
      params.push(active === 'true');
      query += ` AND qa.active = $${params.length}`;
    }

    query += ' ORDER BY qa.priority DESC, qa.created_at DESC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching Q&A:', error);
    res.status(500).json({ error: 'Failed to fetch Q&A' });
  }
};

export const searchChatbotQA = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({ error: 'Query parameter is required' });
    }

    const searchTerm = `%${query.toLowerCase()}%`;

    const result = await pool.query(`
      SELECT qa.*, c.name_ar as category_name_ar, c.name_en as category_name_en
      FROM chatbot_qa qa
      LEFT JOIN chatbot_categories c ON qa.category_id = c.id
      WHERE qa.active = true
      AND (
        LOWER(qa.question_ar) LIKE $1
        OR LOWER(qa.question_en) LIKE $1
        OR LOWER(qa.answer_ar) LIKE $1
        OR LOWER(qa.answer_en) LIKE $1
        OR $2 = ANY(qa.keywords)
      )
      ORDER BY qa.priority DESC
      LIMIT 5
    `, [searchTerm, query.toLowerCase()]);

    res.json(result.rows);
  } catch (error) {
    console.error('Error searching Q&A:', error);
    res.status(500).json({ error: 'Failed to search Q&A' });
  }
};

export const createChatbotQA = async (req, res) => {
  try {
    const {
      category_id,
      question_ar,
      question_en,
      answer_ar,
      answer_en,
      keywords,
      priority,
      active
    } = req.body;

    if (!question_ar || !question_en || !answer_ar || !answer_en) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const result = await pool.query(`
      INSERT INTO chatbot_qa (
        category_id, question_ar, question_en, answer_ar, answer_en, keywords, priority, active
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `, [category_id, question_ar, question_en, answer_ar, answer_en, keywords, priority, active]);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating Q&A:', error);
    res.status(500).json({ error: 'Failed to create Q&A' });
  }
};

export const updateChatbotQA = async (req, res) => {
  try {
    const { id } = req.params;
    const fields = [
      'category_id', 'question_ar', 'question_en', 'answer_ar', 'answer_en', 'keywords', 'priority', 'active'
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
      UPDATE chatbot_qa
      SET ${updates.join(', ')}, updated_at = NOW()
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await pool.query(query, params);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Q&A not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating Q&A:', error);
    res.status(500).json({ error: 'Failed to update Q&A' });
  }
};

export const deleteChatbotQA = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query('DELETE FROM chatbot_qa WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Q&A not found' });
    }

    res.json({ message: 'Q&A deleted successfully' });
  } catch (error) {
    console.error('Error deleting Q&A:', error);
    res.status(500).json({ error: 'Failed to delete Q&A' });
  }
};
