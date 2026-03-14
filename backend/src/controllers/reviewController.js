const Review = require('../models/Review');
const Product = require('../models/Product');

class ReviewController {
  static async addReview(req, res) {
    try {
      const { id: productId } = req.params;
      const { rating, comment } = req.body;
      const userId = req.user.userId;

      if (!rating) {
        return res.status(400).json({ error: 'Rating is required' });
      }

      const ratingNum = parseInt(rating, 10);
      if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
        return res.status(400).json({ error: 'Rating must be between 1 and 5' });
      }

      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }

      // Prevent sellers from reviewing their own products
      if (product.seller_id === userId) {
        return res.status(400).json({ error: 'You cannot review your own product' });
      }

      const review = await Review.create({
        productId,
        userId,
        rating: ratingNum,
        comment: comment || null
      });

      res.status(201).json({ review });
    } catch (error) {
      console.error('Add review error:', error);
      res.status(500).json({ error: 'Failed to add review' });
    }
  }

  static async getProductReviews(req, res) {
    try {
      const { id: productId } = req.params;
      const reviews = await Review.findByProduct(productId);
      res.json({ reviews });
    } catch (error) {
      console.error('Get reviews error:', error);
      res.status(500).json({ error: 'Failed to get reviews' });
    }
  }
}

module.exports = ReviewController;

