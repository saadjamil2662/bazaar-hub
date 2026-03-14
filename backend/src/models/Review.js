const db = require('../config/database');

class Review {
  static async create({ productId, userId, rating, comment }) {
    const query = `
      INSERT INTO product_reviews (product_id, user_id, rating, comment)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    const result = await db.query(query, [productId, userId, rating, comment]);
    return result.rows[0];
  }

  static async findByProduct(productId) {
    const query = `
      SELECT r.*, u.name as user_name
      FROM product_reviews r
      JOIN users u ON r.user_id = u.id
      WHERE r.product_id = $1
      ORDER BY r.created_at DESC
    `;
    const result = await db.query(query, [productId]);
    return result.rows;
  }
}

module.exports = Review;

