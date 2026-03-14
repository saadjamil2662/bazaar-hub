const db = require('../config/database');

class Auction {
  // Helper method to parse and normalize auction images
  static parseImages(auction) {
    if (!auction) return auction;
    
    let images = auction.images;
    
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
      ...auction,
      images: images
    };
  }

  // Helper to parse array of auctions
  static parseAuctionsArray(auctions) {
    return auctions.map(auction => this.parseImages(auction));
  }

  static async create({ productId, startingBid, currentBid, endTime, sellerId }) {
    const query = `
      INSERT INTO auctions (product_id, starting_bid, current_bid, end_time, seller_id)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    const result = await db.query(query, [
      productId, startingBid, startingBid, endTime, sellerId
    ]);
    return result.rows[0];
  }

  static async findById(id) {
    const query = `
      SELECT a.*,
             p.title,
             p.description,
             p.images,
             p.category,
             u.name as seller_name, u.email as seller_email,
             (SELECT COUNT(*) FROM bids WHERE auction_id = a.id) as bid_count,
             (SELECT name FROM users WHERE id = a.highest_bidder_id) as highest_bidder_name
      FROM auctions a
      JOIN products p ON a.product_id = p.id
      JOIN users u ON a.seller_id = u.id
      WHERE a.id = $1
    `;
    const result = await db.query(query, [id]);
    return result.rows[0] ? this.parseImages(result.rows[0]) : null;
  }

  static async findAll({ page = 1, limit = 20, status = 'active', category, search }) {
    const offset = (page - 1) * limit;
    let conditions = [];
    let params = [];
    let paramIndex = 1;

    if (status === 'active') {
      conditions.push(`a.end_time > NOW() AND a.status = 'active'`);
    } else if (status === 'ended') {
      conditions.push(`(a.end_time <= NOW() OR a.status = 'ended')`);
    }

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

    const whereClause = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';

    const countQuery = `
      SELECT COUNT(*) 
      FROM auctions a
      JOIN products p ON a.product_id = p.id
      ${whereClause}
    `;
    const countResult = await db.query(countQuery, params);
    const total = parseInt(countResult.rows[0].count);

    params.push(limit, offset);
    const query = `
      SELECT
        a.*,
        COALESCE(
          (SELECT MAX(b.amount) FROM bids b WHERE b.auction_id = a.id),
          a.current_bid
        ) AS current_bid,
        p.title,
        p.description,
        p.images,
        p.category,
        u.name as seller_name,
        (SELECT COUNT(*) FROM bids WHERE auction_id = a.id) as bid_count
      FROM auctions a
      JOIN products p ON a.product_id = p.id
      JOIN users u ON a.seller_id = u.id
      ${whereClause}
      ORDER BY a.end_time ASC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    const result = await db.query(query, params);

    return {
      auctions: this.parseAuctionsArray(result.rows),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  static async placeBid(auctionId, userId, bidAmount) {
    const client = await db.pool.connect();
    
    try {
      await client.query('BEGIN');

      // Check auction
      const auctionQuery = 'SELECT * FROM auctions WHERE id = $1 FOR UPDATE';
      const auctionResult = await client.query(auctionQuery, [auctionId]);
      const auction = auctionResult.rows[0];

      if (!auction) {
        throw new Error('Auction not found');
      }

      if (new Date(auction.end_time) < new Date()) {
        throw new Error('Auction has ended');
      }

      if (auction.status !== 'active') {
        throw new Error('Auction is not active');
      }

      if (bidAmount <= auction.current_bid) {
        throw new Error('Bid must be higher than current bid');
      }

      if (auction.seller_id === userId) {
        throw new Error('Sellers cannot bid on their own auctions');
      }

      // Create bid
      const bidQuery = `
        INSERT INTO bids (auction_id, user_id, amount)
        VALUES ($1, $2, $3)
        RETURNING *
      `;
      const bidResult = await client.query(bidQuery, [auctionId, userId, bidAmount]);

      // Update auction
      const updateQuery = `
        UPDATE auctions
        SET current_bid = $2, highest_bidder_id = $3
        WHERE id = $1
        RETURNING *
      `;
      const updateResult = await client.query(updateQuery, [auctionId, bidAmount, userId]);

      await client.query('COMMIT');

      return {
        bid: bidResult.rows[0],
        auction: updateResult.rows[0]
      };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  static async getAuctionBids(auctionId, { page = 1, limit = 20 }) {
    const offset = (page - 1) * limit;

    const countQuery = 'SELECT COUNT(*) FROM bids WHERE auction_id = $1';
    const countResult = await db.query(countQuery, [auctionId]);
    const total = parseInt(countResult.rows[0].count);

    const query = `
      SELECT b.*, u.name as bidder_name
      FROM bids b
      JOIN users u ON b.user_id = u.id
      WHERE b.auction_id = $1
      ORDER BY b.created_at DESC
      LIMIT $2 OFFSET $3
    `;
    const result = await db.query(query, [auctionId, limit, offset]);

    return {
      bids: result.rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  static async endAuction(auctionId) {
    const query = `
      UPDATE auctions
      SET status = 'ended'
      WHERE id = $1
      RETURNING *
    `;
    const result = await db.query(query, [auctionId]);
    return result.rows[0];
  }

  static async findBySeller(sellerId, { page = 1, limit = 20 }) {
    const offset = (page - 1) * limit;
    
    const countQuery = 'SELECT COUNT(*) FROM auctions WHERE seller_id = $1';
    const countResult = await db.query(countQuery, [sellerId]);
    const total = parseInt(countResult.rows[0].count);

    const query = `
      SELECT
        a.*,
        COALESCE(
          (SELECT MAX(b.amount) FROM bids b WHERE b.auction_id = a.id),
          a.current_bid
        ) AS current_bid,
        p.title,
        p.images,
        (SELECT COUNT(*) FROM bids WHERE auction_id = a.id) as bid_count
      FROM auctions a
      JOIN products p ON a.product_id = p.id
      WHERE a.seller_id = $1
      ORDER BY a.created_at DESC
      LIMIT $2 OFFSET $3
    `;
    const result = await db.query(query, [sellerId, limit, offset]);

    return {
      auctions: result.rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }
}

module.exports = Auction;
