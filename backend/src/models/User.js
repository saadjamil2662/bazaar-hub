const db = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
  static async create({ email, password, name, role = 'buyer' }) {
    // the database constraint only allows 'buyer' or 'seller' values for
    // the role column. since we no longer ask the user to pick one, we
    // simply default new accounts to 'buyer' so inserts never fail. the
    // frontend treats every authenticated user as a potential seller
    // regardless of this value.
    const hashedPassword = await bcrypt.hash(password, 10);
    const query = `
      INSERT INTO users (email, password, name, role)
      VALUES ($1, $2, $3, $4)
      RETURNING id, email, name, role, created_at
    `;
    const result = await db.query(query, [email, hashedPassword, name, role]);
    return result.rows[0];
  }

  static async findByEmail(email) {
    const query = 'SELECT * FROM users WHERE email = $1';
    const result = await db.query(query, [email]);
    return result.rows[0];
  }

  static async findById(id) {
    const query = 'SELECT id, email, name, role, created_at FROM users WHERE id = $1';
    const result = await db.query(query, [id]);
    return result.rows[0];
  }

  static async verifyPassword(plainPassword, hashedPassword) {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  static async updateProfile(userId, { name, phone, address }) {
    const query = `
      UPDATE users 
      SET name = COALESCE($2, name),
          phone = COALESCE($3, phone),
          address = COALESCE($4, address)
      WHERE id = $1
      RETURNING id, email, name, phone, address, role
    `;
    const result = await db.query(query, [userId, name, phone, address]);
    return result.rows[0];
  }
}

module.exports = User;
