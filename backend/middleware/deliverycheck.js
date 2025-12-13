// backend/middleware/deliveryCheck.js
const User = require('../models/User');
const Product = require('../models/Product');

exports.checkDeliveryArea = async (req, res, next) => {
  try {
    const { productId } = req.body;
    const buyerId = req.user.userId;

    // 1. Fetch Buyer
    const buyer = await User.findById(buyerId);
    
    // Check if buyer has location data
    if (!buyer || (!buyer.governate && !buyer.address)) {
      return res.status(400).json({
        success: false,
        error: 'Please update your profile with a Governate/Address before purchasing.'
      });
    }

    // 2. Fetch Product & Seller
    const product = await Product.findById(productId).populate('sellerId');
    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }

    const seller = product.sellerId;

    // 3. Validation Logic
    // If seller has NO service area defined, they deliver everywhere (default behavior)
    // If they HAVE a service area, we must check it.
    if (seller.serviceArea && seller.serviceArea.trim().length > 0) {
      
      // Determine Buyer's Location (Prefer governate, fallback to address)
      const buyerLocation = (buyer.governate || buyer.address).toLowerCase().trim();
      
      // Parse Seller's Areas
      const allowedAreas = seller.serviceArea.split(',').map(area => area.trim().toLowerCase());

      console.log(`[Delivery Check] Buyer: "${buyerLocation}" | Allowed: ${JSON.stringify(allowedAreas)}`);

      // Check for match
      const isDeliveryAvailable = allowedAreas.some(area => buyerLocation.includes(area));

      if (!isDeliveryAvailable) {
        return res.status(400).json({
          success: false,
          error: `Delivery not available. This seller only delivers to: ${seller.serviceArea}. Your location is: ${buyer.governate || buyer.address}`
        });
      }
    }

    // 4. Attach to request for controller use
    req.buyer = buyer;
    req.product = product;

    next(); 

  } catch (err) {
    console.error("Delivery Check Error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};