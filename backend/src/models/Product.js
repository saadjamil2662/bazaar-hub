const db = require('../config/database');

class Product {
  // Helper method to parse and normalize product images
  static parseImages(product) {
    if (!product) return product;
    
    let images = product.images;
    
    // If images is a string (JSON), parse it
    if (typeof images === 'string') {
      try {
        images = JSON.parse(images);
      } catch (e) {
        images = [];
      }
    }
    
    // Ensure images is always an array
    if (!Array.isArray(images)) {
      images = [];
    }
    
    return {
      ...product,
      images: images
    };
  }

  // Helper to parse array of products
  static parseProductsArray(products) {
    return products.map(product => this.parseImages(product));
  }

  static async create({ sellerId, title, description, price, category, images, stock, saleType }) {
    const query = `
      INSERT INTO products (seller_id, title, description, price, category, images, stock, sale_type)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;
    const result = await db.query(query, [
      sellerId, title, description, price, category, 
      JSON.stringify(images), stock, saleType
    ]);
    return this.parseImages(result.rows[0]);
  }

  static async findById(id) {
    const query = `
      SELECT p.*, u.name as seller_name, u.email as seller_email
      FROM products p
      JOIN users u ON p.seller_id = u.id
      WHERE p.id = $1
    `;
    const result = await db.query(query, [id]);
    return result.rows[0] ? this.parseImages(result.rows[0]) : null;
  }

  static async findAll({ page = 1, limit = 20, category, search, minPrice, maxPrice }) {
    const offset = (page - 1) * limit;
    let conditions = ['p.deleted_at IS NULL'];
    let params = [];
    let paramIndex = 1;

    if (category) {
      conditions.push(`p.category = $${paramIndex}`);
      params.push(category);
      paramIndex++;
    }

    if (search) {
      conditions.push(`(p.title ILIKE $${paramIndex} OR p.description ILIKE $${paramIndex})`);
      params.push(`%${search}%`);
      paramIndex++;
    }

    if (minPrice) {
      conditions.push(`p.price >= $${paramIndex}`);
      params.push(minPrice);
      paramIndex++;
    }

    if (maxPrice) {
      conditions.push(`p.price <= $${paramIndex}`);
      params.push(maxPrice);
      paramIndex++;
    }

    const whereClause = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';

    const countQuery = `SELECT COUNT(*) FROM products p ${whereClause}`;
    const countResult = await db.query(countQuery, params);
    const total = parseInt(countResult.rows[0].count);

    params.push(limit, offset);
    const query = `
      SELECT p.*, u.name as seller_name
      FROM products p
      JOIN users u ON p.seller_id = u.id
      ${whereClause}
      ORDER BY p.created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    const result = await db.query(query, params);

    return {
      products: this.parseProductsArray(result.rows),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  static async findBySeller(sellerId, { page = 1, limit = 20 }) {
    const offset = (page - 1) * limit;
    
    const countQuery = 'SELECT COUNT(*) FROM products WHERE seller_id = $1 AND deleted_at IS NULL';
    const countResult = await db.query(countQuery, [sellerId]);
    const total = parseInt(countResult.rows[0].count);

    const query = `
      SELECT * FROM products
      WHERE seller_id = $1 AND deleted_at IS NULL
      ORDER BY created_at DESC
      LIMIT $2 OFFSET $3
    `;
    const result = await db.query(query, [sellerId, limit, offset]);

    return {
      products: this.parseProductsArray(result.rows),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  static async update(id, sellerId, updates) {
    const { title, description, price, stock, category } = updates;
    const query = `
      UPDATE products
      SET title = COALESCE($3, title),
          description = COALESCE($4, description),
          price = COALESCE($5, price),
          stock = COALESCE($6, stock),
          category = COALESCE($7, category)
      WHERE id = $1 AND seller_id = $2 AND deleted_at IS NULL
      RETURNING *
    `;
    const result = await db.query(query, [id, sellerId, title, description, price, stock, category]);
    return result.rows[0] ? this.parseImages(result.rows[0]) : null;
  }

  static async delete(id, sellerId) {
    const query = `
      UPDATE products
      SET deleted_at = NOW()
      WHERE id = $1 AND seller_id = $2
      RETURNING id
    `;
    const result = await db.query(query, [id, sellerId]);
    return result.rows[0];
  }

  static async decreaseStock(id, quantity) {
    const query = `
      UPDATE products
      SET stock = stock - $2
      WHERE id = $1 AND stock >= $2
      RETURNING *
    `;
    const result = await db.query(query, [id, quantity]);
    return result.rows[0] ? this.parseImages(result.rows[0]) : null;
  }
}

module.exports = Product;
