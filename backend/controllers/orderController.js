const Order = require('../models/Order');
const User = require('../models/User');
const nodemailer = require('nodemailer');
const Product = require('../models/Product');
const mongoose = require('mongoose');

exports.createOrder = async (req, res) => {
  try {
    if (req.user.role !== 'buyer') {
      return res.status(403).json({ success: false, error: 'Only buyers can create orders' });
    }

    const { products } = req.body;
    const userId = req.user.userId;

    const buyer = await User.findById(userId);
    if (!buyer) {
      return res.status(404).json({ success: false, error: "Buyer profile not found" });
    }

    // FIX: Ensure governate is not just an empty string
    const buyerGov = (buyer.governate || "").trim().toLowerCase();
    if (!buyerGov) {
      return res.status(400).json({ 
        success: false, 
        error: "Please update your profile with a governate to complete orders." 
      });
    }
    
    let totalPrice = 0;
    const validatedProducts = [];

    for (const item of products) {
      const product = await Product.findById(item.productId).populate('sellerId');
      
      if (!product) {
        return res.status(404).json({ success: false, error: `Product not found` });
      }

      const sellerArea = (product.sellerId.serviceArea || "").toLowerCase();

      // Location Check
      if (!sellerArea.includes(buyerGov)) {
        return res.status(403).json({ 
          success: false,
          error: `not provided for this area` 
        });
      }

      // ... rest of your existing stock check and total calculation ...
      if (product.stock < item.quantity) {
        return res.status(400).json({ success: false, error: `Insufficient stock for ${product.title}` });
      }
      totalPrice += product.price * item.quantity;
      validatedProducts.push({ product, quantity: item.quantity });
    }

    // ... proceed with stock update and Order.create ...
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getOrders = async (req, res) => {
  try {
    let orders;
    
    // Sellers can only see orders for their products
    if (req.user.role === 'seller') {
      // Get all products by this seller
      const sellerProducts = await Product.find({ sellerId: req.user.userId });
      const productIds = sellerProducts.map(p => p._id);
      
      // Find orders that contain these products
      orders = await Order.find({ 
        'products.productId': { $in: productIds } 
      }).populate("products.productId").populate("userId", "name email flagsCount address");
    } else {
      // Buyers and admins can see all orders
      orders = await Order.find().populate("products.productId").populate("userId", "name email");
    }
    
    res.json({
      success: true,
      orders
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
};

exports.getUserOrders = async (req, res) => {
  try {
    let orders;
    
    if (req.user.role === 'buyer') {
      // Buyers can only see their own orders
      if (req.params.userId !== req.user.userId) {
        return res.status(403).json({ 
          success: false,
          error: 'Not authorized to view these orders' 
        });
      }
      
      // FIX: Deep populate (Order -> Product -> Seller)
      // This is required for the Flagging System to work from the Order History page
      orders = await Order.find({ userId: req.params.userId })
        .populate({
          path: 'products.productId',
          populate: { 
            path: 'sellerId', 
            select: 'name email storeName' 
          }
        })
        .populate("userId", "name email");

    } else if (req.user.role === 'seller') {
      // Sellers can see orders for their products
      const sellerProducts = await Product.find({ sellerId: req.user.userId });
      const productIds = sellerProducts.map(p => p._id);
      
      orders = await Order.find({ 
        'products.productId': { $in: productIds } 
      }).populate("products.productId").populate("userId", "name email");
    }
    
    res.json({
      success: true,
      orders
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
};

exports.updateOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // 1. Find Order, Buyer, AND Seller info
    const existingOrder = await Order.findById(id)
      .populate('userId') // Buyer
      .populate({
        path: 'products.productId',
        populate: { 
          path: 'sellerId', 
          select: 'email storeName +googleAppPassword'
        }
      });

    if (!existingOrder) {
      return res.status(404).json({ error: "Order not found" });
    }

    // --- NEW LOGIC: Allow Buyer to Cancel ---
    if (req.user.role === 'buyer') {
      // Check ownership
      if (existingOrder.userId._id.toString() !== req.user.userId) {
        return res.status(403).json({ error: "You are not authorized to modify this order" });
      }
      
      // Buyers can ONLY set status to 'cancelled'
      if (status !== 'cancelled') {
        return res.status(403).json({ error: "Buyers can only cancel orders" });
      }

      // Buyers can ONLY cancel if currently 'pending'
      if (existingOrder.status !== 'pending') {
        return res.status(400).json({ error: "Cannot cancel order. It is already processed or shipped." });
      }
    }
    // ----------------------------------------

    // Standard Seller check: prevent changing final states
    // (Unless it's the buyer cancelling a pending order, which passed above)
    if (req.user.role === 'seller') {
        if (existingOrder.status === 'delivered' || existingOrder.status === 'cancelled') {
            return res.status(400).json({ 
                success: false, 
                error: `Order is already ${existingOrder.status} and cannot be changed.`
            });
        }
    }

    const oldStatus = existingOrder.status;
    const buyer = existingOrder.userId;

    // 2. Identify the Seller (picking product #1 seller)
    let seller = null;
    if (existingOrder.products.length > 0 && existingOrder.products[0].productId) {
      seller = existingOrder.products[0].productId.sellerId;
    }

    // 3. Update the Order
    const updatedOrder = await Order.findByIdAndUpdate(
      id,
      { status }, // Use specific field update to be safe
      { new: true }
    );

    // 4. Send Email IF status changed AND Seller has credentials
    // FIX: Added (status !== 'cancelled') to suppress emails on cancellation
    if (status && oldStatus !== status && status !== 'cancelled' && buyer && seller && seller.googleAppPassword) {

      console.log(`Attempting to send email via Seller: ${seller.email}`);

      const sellerTransporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
          user: seller.email,
          pass: seller.googleAppPassword,
        },
      });

      const mailOptions = {
        from: `"${seller.storeName}" <${seller.email}>`,
        to: buyer.email,
        subject: `Order Update: #${id}`,
        html: `
          <h3>Hello ${buyer.name},</h3>
          <p>This is an update from <strong>${seller.storeName}</strong>.</p>
          <p>Your order status is now: <strong style="color:blue">${status}</strong>.</p>
        `
      };

      sellerTransporter.sendMail(mailOptions, (err, info) => {
        if (err) {
          console.error(`❌ Failed to send email via ${seller.email}:`, err.message);
        } else {
          console.log(`✅ Email sent from ${seller.email} to ${buyer.email}`);
        }
      });

    } else if (status && oldStatus !== status && status !== 'cancelled') {
      console.log("Skipping email: Seller has not configured App Password.");
    }

    // --- STOCK RESTORATION FOR CANCELLED ORDERS ---
    if (oldStatus !== 'cancelled' && status === 'cancelled') {
      for (const item of existingOrder.products) {
        const product = await Product.findById(item.productId);
        if (product) {
          product.stock += item.quantity;
          await product.save();
        }
      }
    }

    // ---- SEND SINGLE JSON RESPONSE ----
    return res.json({
      success: true,
      order: updatedOrder
    });

  } catch (error) {
    return res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
};


exports.deleteOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ 
        success: false,
        error: "Order not found" 
      });
    }

    // Restore stock if order wasn't already cancelled
    if (order.status !== 'cancelled') {
      for (const item of order.products) {
        const product = await Product.findById(item.productId);
        if (product) {
          product.stock += item.quantity;
          await product.save();
        }
      }
    }

    await Order.findByIdAndDelete(req.params.id);

    res.json({ 
      success: true,
      message: "Order removed and stock restored" 
    });

  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
};