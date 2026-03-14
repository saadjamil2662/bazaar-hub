const Product = require('../models/Product');

class ProductController {
  static async createProduct(req, res) {
    try {
      const { title, description, price, category, stock, saleType } = req.body;
      const sellerId = req.user.userId;

      // Validation
      if (!title || !description || !price || !category || !saleType) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      // Title validation
      if (title.trim().length < 3) {
        return res.status(400).json({ error: 'Title must be at least 3 characters' });
      }

      // Description validation
      if (description.trim().length < 10) {
        return res.status(400).json({ error: 'Description must be at least 10 characters' });
      }

      // Price validation
      const priceNum = parseFloat(price);
      if (isNaN(priceNum) || priceNum < 0.01) {
        return res.status(400).json({ error: 'Price must be a positive number' });
      }

      // Stock validation
      const stockNum = parseInt(stock) || 0;
      if (stockNum < 0) {
        return res.status(400).json({ error: 'Stock cannot be negative' });
      }

      // Sale type validation
      if (!['fixed', 'auction'].includes(saleType)) {
        return res.status(400).json({ error: 'Invalid sale type' });
      }

      // Images validation - at least one image is required
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ error: 'At least one product image is required' });
      }

      const images = req.files.map(file => `/uploads/${file.filename}`);

      const product = await Product.create({
        sellerId,
        title,
        description,
        price: priceNum,
        category,
        images,
        stock: stockNum,
        saleType
      });

      res.status(201).json({
        message: 'Product created successfully',
        product
      });
    } catch (error) {
      console.error('Create product error:', error);
      res.status(500).json({ error: 'Failed to create product' });
    }
  }

  static async getProducts(req, res) {
    try {
      const { page, limit, category, search, minPrice, maxPrice } = req.query;

      const result = await Product.findAll({
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 20,
        category,
        search,
        minPrice: minPrice ? parseFloat(minPrice) : undefined,
        maxPrice: maxPrice ? parseFloat(maxPrice) : undefined
      });

      res.json(result);
    } catch (error) {
      console.error('Get products error:', error);
      res.status(500).json({ error: 'Failed to get products' });
    }
  }

  static async getProductById(req, res) {
    try {
      const { id } = req.params;
      const product = await Product.findById(id);

      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }

      res.json({ product });
    } catch (error) {
      console.error('Get product error:', error);
      res.status(500).json({ error: 'Failed to get product' });
    }
  }

  static async getSellerProducts(req, res) {
    try {
      const { page, limit } = req.query;
      const sellerId = req.user.userId;

      const result = await Product.findBySeller(sellerId, {
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 20
      });

      res.json(result);
    } catch (error) {
      console.error('Get seller products error:', error);
      res.status(500).json({ error: 'Failed to get products' });
    }
  }

  static async updateProduct(req, res) {
    try {
      const { id } = req.params;
      const sellerId = req.user.userId;
      const updates = req.body;

      const product = await Product.update(id, sellerId, updates);

      if (!product) {
        return res.status(404).json({ error: 'Product not found or unauthorized' });
      }

      res.json({
        message: 'Product updated successfully',
        product
      });
    } catch (error) {
      console.error('Update product error:', error);
      res.status(500).json({ error: 'Failed to update product' });
    }
  }

  static async deleteProduct(req, res) {
    try {
      const { id } = req.params;
      const sellerId = req.user.userId;

      const result = await Product.delete(id, sellerId);

      if (!result) {
        return res.status(404).json({ error: 'Product not found or unauthorized' });
      }

      res.json({ message: 'Product deleted successfully' });
    } catch (error) {
      console.error('Delete product error:', error);
      res.status(500).json({ error: 'Failed to delete product' });
    }
  }
}

module.exports = ProductController;
