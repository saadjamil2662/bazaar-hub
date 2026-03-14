const db = require('../config/database');

class Order {
  static async create({ buyerId, sellerId, productId, quantity, totalPrice, shippingAddress, paymentStatus }) {
    const query = `
      INSERT INTO orders (buyer_id, seller_id, product_id, quantity, total_price, payment_status, shipping_address)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;
    const result = await db.query(query, [
      buyerId,
      sellerId,
      productId,
      quantity,
      totalPrice,
      paymentStatus || 'pending',
      JSON.stringify(shippingAddress)
    ]);
    return result.rows[0];
  }

  static async createFromAuction({ buyerId, sellerId, productId, totalPrice, shippingAddress, auctionId }) {
    const query = `
      INSERT INTO orders (buyer_id, seller_id, product_id, quantity, total_price, shipping_address, auction_id)
      VALUES ($1, $2, $3, 1, $4, $5, $6)
      RETURNING *
    `;
    const result = await db.query(query, [
      buyerId, sellerId, productId, totalPrice, JSON.stringify(shippingAddress), auctionId
    ]);
    return result.rows[0];
  }

  static async findById(id) {
    const query = `
      SELECT o.*, 
             p.title as product_title, p.images as product_images,
             u1.name as buyer_name, u1.email as buyer_email,
             u2.name as seller_name, u2.email as seller_email
      FROM orders o
      JOIN products p ON o.product_id = p.id
      JOIN users u1 ON o.buyer_id = u1.id
      JOIN users u2 ON o.seller_id = u2.id
      WHERE o.id = $1
    `;
    const result = await db.query(query, [id]);
    return result.rows[0];
  }

  static async findByAuctionId(auctionId) {
    const query = `
      SELECT o.*, 
             p.title as product_title, p.images as product_images,
             u1.name as buyer_name, u1.email as buyer_email,
             u2.name as seller_name, u2.email as seller_email
      FROM orders o
      JOIN products p ON o.product_id = p.id
      JOIN users u1 ON o.buyer_id = u1.id
      JOIN users u2 ON o.seller_id = u2.id
      WHERE o.auction_id = $1
    `;
    const result = await db.query(query, [auctionId]);
    return result.rows[0];
  }

  static async findByBuyer(buyerId, { page = 1, limit = 20 }) {
    const offset = (page - 1) * limit;

    const countQuery = 'SELECT COUNT(*) FROM orders WHERE buyer_id = $1';
    const countResult = await db.query(countQuery, [buyerId]);
    const total = parseInt(countResult.rows[0].count);

    const query = `
      SELECT o.*, 
             p.title as product_title, p.images as product_images,
             u.name as seller_name
      FROM orders o
      JOIN products p ON o.product_id = p.id
      JOIN users u ON o.seller_id = u.id
      WHERE o.buyer_id = $1
      ORDER BY o.created_at DESC
      LIMIT $2 OFFSET $3
    `;
    const result = await db.query(query, [buyerId, limit, offset]);

    return {
      orders: result.rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  static async findBySeller(sellerId, { page = 1, limit = 20, status }) {
    const offset = (page - 1) * limit;
    
    // Qualify column names with the orders table alias ("o") to avoid
    // ambiguity once we join products/users below.
    let conditions = ['o.seller_id = $1'];
    let params = [sellerId];
    let paramIndex = 2;

    if (status) {
      conditions.push(`o.status = $${paramIndex}`);
      params.push(status);
      paramIndex++;
    }

    const whereClause = 'WHERE ' + conditions.join(' AND ');

    const countQuery = `SELECT COUNT(*) FROM orders o ${whereClause}`;
    const countResult = await db.query(countQuery, params);
    const total = parseInt(countResult.rows[0].count);

    params.push(limit, offset);
    const query = `
      SELECT o.*, 
             p.title as product_title, p.images as product_images,
             u.name as buyer_name, u.email as buyer_email
      FROM orders o
      JOIN products p ON o.product_id = p.id
      JOIN users u ON o.buyer_id = u.id
      ${whereClause}
      ORDER BY o.created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
    const result = await db.query(query, params);

    return {
      orders: result.rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  static async updateStatus(orderId, sellerId, status) {
    const query = `
      UPDATE orders
      SET status = $3
      WHERE id = $1 AND seller_id = $2
      RETURNING *
    `;
    const result = await db.query(query, [orderId, sellerId, status]);
    return result.rows[0];
  }

  static async addTracking(orderId, sellerId, trackingNumber) {
    const query = `
      UPDATE orders
      SET tracking_number = $3, status = 'shipped'
      WHERE id = $1 AND seller_id = $2
      RETURNING *
    `;
    const result = await db.query(query, [orderId, sellerId, trackingNumber]);
    return result.rows[0];
  }
}

module.exports = Order;
