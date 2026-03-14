const db = require('../src/config/database');

const migrations = [
  {
    name: '001_create_users_table',
    sql: `
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'buyer' CHECK (role IN ('buyer', 'seller')),
        phone VARCHAR(50),
        address TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE INDEX idx_users_email ON users(email);
      CREATE INDEX idx_users_role ON users(role);
    `
  },
  {
    name: '002_create_products_table',
    sql: `
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        seller_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        category VARCHAR(100) NOT NULL,
        images JSONB DEFAULT '[]',
        stock INTEGER DEFAULT 0,
        sale_type VARCHAR(50) DEFAULT 'fixed' CHECK (sale_type IN ('fixed', 'auction')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        deleted_at TIMESTAMP
      );
      
      CREATE INDEX idx_products_seller ON products(seller_id);
      CREATE INDEX idx_products_category ON products(category);
      CREATE INDEX idx_products_sale_type ON products(sale_type);
      CREATE INDEX idx_products_created_at ON products(created_at);
    `
  },
  {
    name: '003_create_auctions_table',
    sql: `
      CREATE TABLE IF NOT EXISTS auctions (
        id SERIAL PRIMARY KEY,
        product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
        seller_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        starting_bid DECIMAL(10, 2) NOT NULL,
        current_bid DECIMAL(10, 2) NOT NULL,
        highest_bidder_id INTEGER REFERENCES users(id),
        end_time TIMESTAMP NOT NULL,
        status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'ended')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE INDEX idx_auctions_product ON auctions(product_id);
      CREATE INDEX idx_auctions_seller ON auctions(seller_id);
      CREATE INDEX idx_auctions_end_time ON auctions(end_time);
      CREATE INDEX idx_auctions_status ON auctions(status);
    `
  },
  {
    name: '004_create_bids_table',
    sql: `
      CREATE TABLE IF NOT EXISTS bids (
        id SERIAL PRIMARY KEY,
        auction_id INTEGER NOT NULL REFERENCES auctions(id) ON DELETE CASCADE,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        amount DECIMAL(10, 2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE INDEX idx_bids_auction ON bids(auction_id);
      CREATE INDEX idx_bids_user ON bids(user_id);
      CREATE INDEX idx_bids_created_at ON bids(created_at);
    `
  },
  {
    name: '005_create_orders_table',
    sql: `
      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        buyer_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        seller_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
        auction_id INTEGER UNIQUE REFERENCES auctions(id),
        quantity INTEGER NOT NULL DEFAULT 1,
        total_price DECIMAL(10, 2) NOT NULL,
        payment_status VARCHAR(50) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
        status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
        shipping_address JSONB NOT NULL,
        tracking_number VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE INDEX idx_orders_buyer ON orders(buyer_id);
      CREATE INDEX idx_orders_seller ON orders(seller_id);
      CREATE INDEX idx_orders_status ON orders(status);
      CREATE INDEX idx_orders_created_at ON orders(created_at);
      CREATE INDEX idx_orders_auction ON orders(auction_id);
    `
  },
  {
    name: '006_create_product_reviews_table',
    sql: `
      CREATE TABLE IF NOT EXISTS product_reviews (
        id SERIAL PRIMARY KEY,
        product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
        comment TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_reviews_product ON product_reviews(product_id);
      CREATE INDEX IF NOT EXISTS idx_reviews_user ON product_reviews(user_id);
      CREATE INDEX IF NOT EXISTS idx_reviews_rating ON product_reviews(rating);
    `
  },
  {
    name: '007_create_messages_table',
    sql: `
      CREATE TABLE IF NOT EXISTS messages (
        id SERIAL PRIMARY KEY,
        sender_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        receiver_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        product_id INTEGER REFERENCES products(id) ON DELETE SET NULL,
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);
      CREATE INDEX IF NOT EXISTS idx_messages_receiver ON messages(receiver_id);
      CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);
    `
  }
];

async function runMigrations() {
  console.log('Starting database migrations...');
  
  try {
    for (const migration of migrations) {
      console.log(`Running migration: ${migration.name}`);
      await db.query(migration.sql);
      console.log(`✓ ${migration.name} completed`);
    }
    
    console.log('');
    console.log('✓ All migrations completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

runMigrations();
