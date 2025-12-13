const express = require('express');
const router = express.Router();

// 1. Import Middleware
const { auth, requireRole } = require('../middleware/auth');
// Ensure the file name matches exactly (deliveryCheck vs deliverycheck)
const { checkDeliveryArea } = require('../middleware/deliverycheck'); 

// 2. Import Controllers
const { 
  createProduct, 
  getAllProducts, 
  getProductsByCategory, 
  getProductById,
  searchProducts, 
  getCategories,
  purchaseProduct,
  // REMOVED checkDeliveryArea from here (it's middleware, not a controller)
  updateProductStock,
  updateProduct,
  deleteProduct
} = require('../controllers/productController');

// --- Routes ---

// Public routes
router.get('/', getAllProducts);
router.get('/category/:category', getProductsByCategory);
router.get('/search', searchProducts);
router.get('/categories', getCategories);
router.get('/:id', getProductById);

// Protected routes

// Create Product (Seller only)
router.post('/', auth, requireRole(['seller']), createProduct);

// Purchase Product (Buyer only + Delivery Area Check)
router.post(
  '/purchase', 
  auth, 
  requireRole(['buyer']), 
  checkDeliveryArea, // Middleware runs first
  purchaseProduct    // Controller runs second
);

// Update/Delete (Seller only)
router.put('/:id/stock', auth, requireRole(['seller']), updateProductStock);
router.put('/:id', auth, requireRole(['seller']), updateProduct);
router.delete('/:id', auth, requireRole(['seller']), deleteProduct);

module.exports = router;