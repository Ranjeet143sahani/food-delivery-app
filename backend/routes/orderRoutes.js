const express = require("express");
const Order = require("../models/Order");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Create a new order
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { items, totalAmount } = req.body;

    console.log("Order creation attempt:", { items: items?.length, totalAmount, userId: req.user?.id });

    if (!items || items.length === 0) {
      return res.status(400).json({ message: "Order items required" });
    }

    // Assume single-vendor cart - take vendor from first item
    const vendorId = items[0].vendorId;
    if (!vendorId) {
      return res.status(400).json({ message: "Vendor ID required in first cart item" });
    }

    // Convert string vendorId to ObjectId (mongoose will validate format)
    const mongoose = require('mongoose');
    let orderVendorId;
    try {
      orderVendorId = new mongoose.Types.ObjectId(vendorId);
    } catch (idError) {
      return res.status(400).json({ message: `Invalid vendorId format: ${vendorId}. Must be valid ObjectId` });
    }

    const order = new Order({
      userId: req.user.id,
      vendorId: orderVendorId,
      items,
      totalAmount
    });

    const savedOrder = await order.save();
    console.log("Order created successfully:", savedOrder._id);
    
    res.status(201).json({ _id: savedOrder._id, message: "Order placed successfully" });
  } catch (err) {
    console.error("Order creation error:", err);
    res.status(500).json({ message: "Failed to create order", error: err.message });
  }
});

// Get orders for the logged-in user (sorted by newest first)
router.get("/", authMiddleware, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user.id })
      .populate('vendorId', 'restaurantName')
      .sort({ createdAt: -1 });
    
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Vendor routes
// Get vendor's orders (Pending only)
router.get("/vendor", authMiddleware, async (req, res) => {
  try {
    if (req.user.userType !== 'vendor') {
      return res.status(403).json({ message: "Vendor access only" });
    }
    const orders = await Order.find({ vendorId: req.user.id, status: 'Pending' })
      .populate('userId', 'name phone')
      .populate('vendorId', 'restaurantName')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Vendor accepts order - set to Preparing
router.put("/:id/accept", authMiddleware, async (req, res) => {
  try {
    if (req.user.userType !== 'vendor') {
      return res.status(403).json({ message: "Vendor access only" });
    }
    const order = await Order.findOneAndUpdate(
      { _id: req.params.id, vendorId: req.user.id, status: 'Pending' },
      { status: 'Preparing' },
      { new: true }
    ).populate('userId', 'name phone');
    if (!order) {
      return res.status(404).json({ message: "Order not found or not pending" });
    }
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Vendor marks ready
router.put("/:id/ready", authMiddleware, async (req, res) => {
  try {
    if (req.user.userType !== 'vendor') {
      return res.status(403).json({ message: "Vendor access only" });
    }
    const order = await Order.findOneAndUpdate(
      { _id: req.params.id, vendorId: req.user.id, status: 'Preparing' },
      { status: 'Ready' },
      { new: true }
    ).populate('userId', 'name phone');
    if (!order) {
      return res.status(404).json({ message: "Order not found or not preparing" });
    }
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
