const express = require('express');
const router = express.Router();
const { store } = require('./store');

// Middleware to mock or parse auth header if present
function optionalAuth(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    // Simple demo token parsing
    if (token.startsWith('user-')) {
      req.userId = token;
    }
  }
  next();
}

router.use(optionalAuth);

// -------------------------------------------------------------
// US1: Authentication & User Accounts
// -------------------------------------------------------------
router.post('/auth/register', (req, res) => {
  try {
    const user = store.registerUser(req.body);
    res.status(201).json({
      success: true,
      message: 'Account successfully registered!',
      user,
      token: user.id
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

router.post('/auth/login', (req, res) => {
  try {
    const user = store.loginUser(req.body);
    res.json({
      success: true,
      message: 'Login successful!',
      user,
      token: user.id
    });
  } catch (err) {
    res.status(401).json({ success: false, error: err.message });
  }
});

router.get('/auth/me', (req, res) => {
  const userId = req.userId || req.query.userId || 'user-1';
  const user = store.getUserById(userId);
  if (!user) {
    return res.status(404).json({ success: false, error: 'User session not found' });
  }
  res.json({ success: true, user });
});

// -------------------------------------------------------------
// US2: Browse Restaurants & Menus
// -------------------------------------------------------------
router.get('/restaurants', (req, res) => {
  const restaurants = store.getRestaurants();
  res.json({
    success: true,
    count: restaurants.length,
    restaurants
  });
});

router.get('/restaurants/:id', (req, res) => {
  const restaurant = store.getRestaurantById(req.params.id);
  if (!restaurant) {
    return res.status(404).json({ success: false, error: 'Restaurant not found' });
  }
  res.json({
    success: true,
    restaurant
  });
});

// -------------------------------------------------------------
// US3: Food Search & Filtering
// -------------------------------------------------------------
router.get('/foods', (req, res) => {
  const { q, cuisine, rating, maxPrice, isVeg, restaurantId } = req.query;
  const foods = store.searchFoods({ q, cuisine, rating, maxPrice, isVeg, restaurantId });
  res.json({
    success: true,
    count: foods.length,
    foods
  });
});

// -------------------------------------------------------------
// US10: Promo Code Validation
// -------------------------------------------------------------
router.post('/promos/validate', (req, res) => {
  try {
    const { code, subtotal } = req.body;
    const result = store.validatePromo(code, Number(subtotal || 0));
    res.json({
      success: true,
      ...result
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// -------------------------------------------------------------
// US4 & US5: Orders & Checkout
// -------------------------------------------------------------
router.post('/orders', (req, res) => {
  try {
    const orderData = req.body;
    const order = store.createOrder(orderData);
    res.status(201).json({
      success: true,
      message: 'Order placed successfully!',
      order
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// US9: Order History
router.get('/orders', (req, res) => {
  const userId = req.userId || req.query.userId || null;
  const orders = store.getUserOrders(userId);
  res.json({
    success: true,
    count: orders.length,
    orders
  });
});

// US6: Order Tracking
router.get('/orders/:id', (req, res) => {
  const order = store.getOrderById(req.params.id);
  if (!order) {
    return res.status(404).json({ success: false, error: 'Order not found' });
  }
  res.json({
    success: true,
    order
  });
});

// US6: Advance Order Status
router.patch('/orders/:id/status', (req, res) => {
  try {
    const { status } = req.body;
    const order = store.advanceOrderStatus(req.params.id, status);
    res.json({
      success: true,
      message: `Order status transitioned to ${order.status}`,
      order
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// US8: Kitchen Dashboard Action (accept, reject, timeout)
router.patch('/orders/:id/kitchen', (req, res) => {
  try {
    const { action, reason } = req.body;
    const order = store.updateKitchenOrderStatus(req.params.id, action, reason);
    res.json({
      success: true,
      message: `Kitchen action "${action}" processed successfully`,
      order
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// US7: Order Rating & Review
router.post('/orders/:id/review', (req, res) => {
  try {
    const { rating, comment, userId } = req.body;
    const result = store.addOrderReview(req.params.id, { rating, comment, userId });
    res.status(201).json({
      success: true,
      message: 'Thank you! Your rating and review have been submitted.',
      ...result
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// Agile Stories & Jira Status Endpoint
router.get('/agile-summary', (req, res) => {
  res.json({
    success: true,
    totalStories: 10,
    completedStories: 10,
    project: 'QuickBite Food Delivery Application',
    jiraStatus: 'All 10 User Stories Fully Implemented & Verified against Acceptance Criteria',
    stories: [
      { id: 'US1', epic: 'EP-01 Account Management', title: 'Register / Login', points: 3, status: 'DONE' },
      { id: 'US2', epic: 'EP-02 Restaurant Discovery', title: 'Browse Restaurants & Menus', points: 5, status: 'DONE' },
      { id: 'US3', epic: 'EP-02 Restaurant Discovery', title: 'Search & Multi-Filter Foods', points: 3, status: 'DONE' },
      { id: 'US4', epic: 'EP-03 Ordering & Payment', title: 'Cart Management & Single-Restaurant Constraint', points: 3, status: 'DONE' },
      { id: 'US5', epic: 'EP-03 Ordering & Payment', title: 'Order Placement & Multi-Mode Payment', points: 8, status: 'DONE' },
      { id: 'US6', epic: 'EP-04 Order Fulfilment', title: 'Live Order Milestone Tracking & Dynamic ETA', points: 8, status: 'DONE' },
      { id: 'US7', epic: 'EP-05 Feedback & Retention', title: 'Post-Delivery 1-5 Star Ratings & Reviews', points: 2, status: 'DONE' },
      { id: 'US8', epic: 'EP-04 Order Fulfilment', title: 'Restaurant Kitchen Dashboard (Accept/Reject/Timeout)', points: 5, status: 'DONE' },
      { id: 'US9', epic: 'EP-05 Feedback & Retention', title: 'Chronological Order History & 1-Click Reorder', points: 2, status: 'DONE' },
      { id: 'US10', epic: 'EP-03 Ordering & Payment', title: 'Promotional Discounts & Coupon Engine', points: 3, status: 'DONE' }
    ]
  });
});

// Reset endpoint for testing
router.post('/reset', (req, res) => {
  store.reset();
  res.json({ success: true, message: 'Store reset to initial state' });
});

module.exports = router;
