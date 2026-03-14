const express = require('express');
const router = express.Router();
const ProductController = require('../controllers/productController');
const { authMiddleware } = require('../middleware/auth');
const ReviewController = require('../controllers/reviewController');
const upload = require('../middleware/upload');

router.post('/', authMiddleware, upload.array('images', 5), ProductController.createProduct);
router.get('/', ProductController.getProducts);
router.get('/seller', authMiddleware, ProductController.getSellerProducts);
router.get('/:id', ProductController.getProductById);
router.get('/:id/reviews', ReviewController.getProductReviews);
router.post('/:id/reviews', authMiddleware, ReviewController.addReview);
router.put('/:id', authMiddleware, ProductController.updateProduct);
router.delete('/:id', authMiddleware, ProductController.deleteProduct);

module.exports = router;
