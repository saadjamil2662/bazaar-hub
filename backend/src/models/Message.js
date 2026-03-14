const db = require('../config/database');

class Message {
  static async send({ senderId, receiverId, productId, content }) {
    const query = `
      INSERT INTO messages (sender_id, receiver_id, product_id, content)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    const result = await db.query(query, [senderId, receiverId, productId || null, content]);
    return result.rows[0];
  }

  static async getThread(userId, otherUserId, { limit = 50, offset = 0 }) {
    const query = `
      SELECT m.*, 
             u1.name as sender_name,
             u2.name as receiver_name
      FROM messages m
      JOIN users u1 ON m.sender_id = u1.id
      JOIN users u2 ON m.receiver_id = u2.id
      WHERE (m.sender_id = $1 AND m.receiver_id = $2)
         OR (m.sender_id = $2 AND m.receiver_id = $1)
      ORDER BY m.created_at ASC
      LIMIT $3 OFFSET $4
    `;
    const result = await db.query(query, [userId, otherUserId, limit, offset]);
    return result.rows;
  }

  static async getInbox(userId, { limit = 50, offset = 0 }) {
    const query = `
      WITH ranked AS (
        SELECT
          m.*,
          CASE
            WHEN m.sender_id = $1 THEN m.receiver_id
            ELSE m.sender_id
          END AS other_user_id,
          ROW_NUMBER() OVER (
            PARTITION BY LEAST(m.sender_id, m.receiver_id), GREATEST(m.sender_id, m.receiver_id)
            ORDER BY m.created_at DESC, m.id DESC
          ) AS rn
        FROM messages m
        WHERE m.sender_id = $1 OR m.receiver_id = $1
      )
      SELECT
        r.id,
        r.sender_id,
        r.receiver_id,
        r.product_id,
        r.content,
        r.created_at,
        r.other_user_id,
        u.name AS other_user_name,
        u.email AS other_user_email,
        p.title AS product_title
      FROM ranked r
      JOIN users u ON u.id = r.other_user_id
      LEFT JOIN products p ON p.id = r.product_id
      WHERE r.rn = 1
      ORDER BY r.created_at DESC, r.id DESC
      LIMIT $2 OFFSET $3
    `;

    const result = await db.query(query, [userId, limit, offset]);
    return result.rows;
  }
}

module.exports = Message;

