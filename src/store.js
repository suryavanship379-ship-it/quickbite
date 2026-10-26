const {
  INITIAL_RESTAURANTS,
  INITIAL_FOOD_ITEMS,
  INITIAL_PROMO_CODES,
  INITIAL_USERS,
  INITIAL_ORDERS
} = require('./data');

class QuickBiteStore {
  constructor() {
    this.reset();
  }

  reset() {
    this.restaurants = JSON.parse(JSON.stringify(INITIAL_RESTAURANTS));
    this.foods = JSON.parse(JSON.stringify(INITIAL_FOOD_ITEMS));
    this.promos = JSON.parse(JSON.stringify(INITIAL_PROMO_CODES));
    this.users = JSON.parse(JSON.stringify(INITIAL_USERS));
    this.orders = JSON.parse(JSON.stringify(INITIAL_ORDERS));
  }

  // US1: Auth & User Management
  registerUser({ name, email, password, address, phone }) {
    if (!name || !email || !password) {
      throw new Error('Name, email, and password are required');
    }
    const cleanEmail = email.trim().toLowerCase();
    if (this.users.some(u => u.email.toLowerCase() === cleanEmail)) {
      throw new Error('An account with this email already exists');
    }
    // US1 Acceptance Criteria: "Passwords must be at least 8 characters in length."
    if (password.length < 8) {
      throw new Error('Password must be at least 8 characters in length');
    }

    const newUser = {
      id: `user-${Date.now()}`,
      name: name.trim(),
      email: cleanEmail,
      password, // In-memory demo
      role: 'customer',
      phone: phone || '+91 98765 00000',
      address: address || 'Flat 101, Palm Grove, Main Street'
    };
    this.users.push(newUser);
    const { password: _, ...userSafe } = newUser;
    return userSafe;
  }

  loginUser({ email, password }) {
    if (!email || !password) {
      throw new Error('Please enter both email and password');
    }
    const cleanEmail = email.trim().toLowerCase();
    const user = this.users.find(u => u.email.toLowerCase() === cleanEmail && u.password === password);
    if (!user) {
      // US1 Acceptance Criteria: "Submitting invalid credentials displays a clear error message."
      throw new Error('Invalid email or password. Please check your credentials.');
    }
    const { password: _, ...userSafe } = user;
    return userSafe;
  }

  getUserById(userId) {
    const user = this.users.find(u => u.id === userId);
    if (!user) return null;
    const { password: _, ...userSafe } = user;
    return userSafe;
  }

  // US2: Browse Restaurants & Menus
  getRestaurants() {
    return this.restaurants;
  }

  getRestaurantById(id) {
    const restaurant = this.restaurants.find(r => r.id === id);
    if (!restaurant) return null;
    const menu = this.foods.filter(f => f.restaurantId === id);
    return { ...restaurant, menu };
  }

  // US3: Search and Filter Foods
  searchFoods({ q, cuisine, rating, maxPrice, isVeg, restaurantId }) {
    let results = [...this.foods];

    if (restaurantId) {
      results = results.filter(f => f.restaurantId === restaurantId);
    }

    if (q && q.trim()) {
      const query = q.trim().toLowerCase();
      results = results.filter(f =>
        f.name.toLowerCase().includes(query) ||
        f.description.toLowerCase().includes(query) ||
        f.cuisine.toLowerCase().includes(query) ||
        f.restaurantName.toLowerCase().includes(query)
      );
    }

    if (cuisine && cuisine.toLowerCase() !== 'all') {
      const c = cuisine.trim().toLowerCase();
      results = results.filter(f => f.cuisine.toLowerCase() === c);
    }

    if (rating && !isNaN(Number(rating))) {
      const minRating = Number(rating);
      results = results.filter(f => f.rating >= minRating);
    }

    if (maxPrice && !isNaN(Number(maxPrice))) {
      const maxP = Number(maxPrice);
      results = results.filter(f => f.price <= maxP);
    }

    if (isVeg === true || isVeg === 'true') {
      results = results.filter(f => f.isVeg === true);
    }

    return results;
  }

  // US10: Promo Code Validation
  validatePromo(code, subtotal) {
    if (!code) {
      throw new Error('Please enter a promotional code');
    }
    const promo = this.promos.find(p => p.code.toUpperCase() === code.trim().toUpperCase());
    if (!promo) {
      throw new Error(`Promo code "${code}" is invalid`);
    }
    // US10 Acceptance Criteria: "Expired, inactive, or below-threshold codes display an informative error."
    if (!promo.isActive) {
      throw new Error(`Promo code "${promo.code}" has expired or is inactive`);
    }
    if (subtotal < promo.minOrderValue) {
      throw new Error(`Minimum order value of ₹${promo.minOrderValue} required for promo code "${promo.code}". Add ₹${(promo.minOrderValue - subtotal).toFixed(2)} more to qualify!`);
    }

    let discount = 0;
    if (promo.type === 'flat') {
      discount = promo.discountAmount;
    } else if (promo.type === 'percent') {
      discount = (subtotal * promo.percentage) / 100;
      if (promo.maxDiscount && discount > promo.maxDiscount) {
        discount = promo.maxDiscount;
      }
    }
    discount = Math.min(discount, subtotal);
    return {
      valid: true,
      code: promo.code,
      discount: Math.round(discount * 100) / 100,
      description: promo.description
    };
  }

  // US4 & US5: Order Creation & Checkout
  createOrder({
    userId,
    userName,
    restaurantId,
    items,
    paymentMethod,
    deliveryAddress,
    promoCode,
    simulatePaymentFailure
  }) {
    if (!items || !items.length) {
      throw new Error('Your cart is empty. Add food items before placing an order.');
    }

    // US2: Currently closed restaurants are flagged
    const restaurant = this.restaurants.find(r => r.id === restaurantId);
    if (!restaurant) {
      throw new Error('Restaurant not found');
    }
    if (!restaurant.isOpen) {
      throw new Error(`Cannot place order: ${restaurant.name} is currently closed.`);
    }

    // US4 Acceptance Criteria: "Items from two different restaurants cannot be mixed in the same cart"
    for (const item of items) {
      const food = this.foods.find(f => f.id === item.id);
      if (!food) {
        throw new Error(`Food item ${item.name || item.id} not found in menu`);
      }
      if (food.restaurantId !== restaurantId) {
        throw new Error(`Cart collision: All items in an order must be from the same restaurant (${restaurant.name}).`);
      }
    }

    // US5 Acceptance Criteria: "On payment failure or gateway timeout, cart contents are strictly preserved."
    if (simulatePaymentFailure === true) {
      throw new Error('Simulated Payment Gateway Error: Card declined or transaction timed out. Your cart items have been preserved.');
    }

    // Calculate financials
    let subtotal = 0;
    const validatedItems = items.map(item => {
      const food = this.foods.find(f => f.id === item.id);
      const qty = Math.max(1, parseInt(item.quantity || 1, 10));
      subtotal += food.price * qty;
      return {
        id: food.id,
        name: food.name,
        price: food.price,
        quantity: qty,
        isVeg: food.isVeg,
        image: food.image
      };
    });

    let discount = 0;
    let promoApplied = null;
    if (promoCode) {
      const promoResult = this.validatePromo(promoCode, subtotal);
      discount = promoResult.discount;
      promoApplied = promoResult.code;
    }

    const tax = Math.round((subtotal * 0.05) * 100) / 100; // 5% GST
    const deliveryFee = subtotal > 500 ? 0 : 40; // Free delivery above 500
    const total = Math.round((subtotal - discount + tax + deliveryFee) * 100) / 100;

    // US5 Acceptance Criteria: "A unique Order ID is generated upon successful payment completion."
    const randomSuffix = Math.floor(100000 + Math.random() * 900000);
    const orderId = `QB-${randomSuffix}`;

    const newOrder = {
      id: orderId,
      userId: userId || 'guest',
      userName: userName || 'Valued Customer',
      restaurantId: restaurant.id,
      restaurantName: restaurant.name,
      restaurantAddress: restaurant.address,
      items: validatedItems,
      itemCount: validatedItems.reduce((acc, curr) => acc + curr.quantity, 0),
      subtotal,
      tax,
      deliveryFee,
      discount,
      promoApplied,
      total,
      status: 'Placed', // Initial status
      paymentMethod: paymentMethod || 'UPI (Google Pay)',
      deliveryAddress: deliveryAddress || '101 Sunshine Avenue, Mumbai',
      createdAt: new Date().toISOString(),
      deliveredAt: null,
      etaMinutes: 28,
      review: null,
      driver: {
        name: 'Rajesh Kumar',
        phone: '+91 98200 11223',
        vehicle: 'Hero Electric Bike (MH-04-AB-4029)',
        rating: 4.9
      },
      kitchenAcceptedAt: null,
      rejectionReason: null
    };

    this.orders.unshift(newOrder); // Newest first for US9
    return newOrder;
  }

  // US6: Order Tracking & Status Progression
  getOrderById(id) {
    const order = this.orders.find(o => o.id === id);
    if (!order) return null;
    return order;
  }

  // US6 Acceptance Criteria: "Order lifecycle statuses are strictly sequenced: Placed -> Preparing -> Out for Delivery -> Delivered."
  advanceOrderStatus(orderId, targetStatus = null) {
    const order = this.orders.find(o => o.id === orderId);
    if (!order) throw new Error('Order not found');

    const SEQUENCE = ['Placed', 'Preparing', 'Out for Delivery', 'Delivered'];
    const currentIndex = SEQUENCE.indexOf(order.status);

    if (order.status === 'Cancelled') {
      throw new Error('Cannot advance status: Order has been cancelled.');
    }

    if (order.status === 'Delivered') {
      return order; // Already completed
    }

    let nextStatus;
    if (targetStatus) {
      if (!SEQUENCE.includes(targetStatus)) {
        throw new Error(`Invalid status: ${targetStatus}`);
      }
      const targetIndex = SEQUENCE.indexOf(targetStatus);
      if (targetIndex < currentIndex) {
        throw new Error(`Cannot reverse status from ${order.status} to ${targetStatus}`);
      }
      nextStatus = targetStatus;
    } else {
      nextStatus = SEQUENCE[currentIndex + 1];
    }

    order.status = nextStatus;

    // Dynamic ETA update
    if (nextStatus === 'Preparing') {
      order.etaMinutes = 20;
    } else if (nextStatus === 'Out for Delivery') {
      order.etaMinutes = 10;
    } else if (nextStatus === 'Delivered') {
      order.etaMinutes = 0;
      order.deliveredAt = new Date().toISOString();
    }

    return order;
  }

  // US8: Restaurant Owner Order Acceptance / Kitchen Dashboard
  updateKitchenOrderStatus(orderId, action, reason = null) {
    const order = this.orders.find(o => o.id === orderId);
    if (!order) throw new Error('Order not found');

    if (action === 'accept') {
      order.status = 'Preparing';
      order.kitchenAcceptedAt = new Date().toISOString();
      order.etaMinutes = 20;
    } else if (action === 'reject') {
      order.status = 'Cancelled';
      order.rejectionReason = reason || 'Kitchen is currently operating at maximum capacity. Full refund initiated.';
      order.etaMinutes = 0;
    } else if (action === 'timeout') {
      // US8 Acceptance Criteria: "If unaccepted within 5 minutes, order is auto-cancelled and refund triggered."
      order.status = 'Cancelled';
      order.rejectionReason = 'Auto-cancelled: Order was not accepted within the 5-minute kitchen response window. Full refund initiated.';
      order.etaMinutes = 0;
    } else {
      throw new Error(`Unknown kitchen action: ${action}`);
    }

    return order;
  }

  // US7: Ratings & Reviews
  addOrderReview(orderId, { rating, comment, userId }) {
    const order = this.orders.find(o => o.id === orderId);
    if (!order) throw new Error('Order not found');

    // US7 Acceptance Criteria: "1 to 5-star rating submission is strictly restricted to orders with status 'Delivered'."
    if (order.status !== 'Delivered') {
      throw new Error(`Rating not allowed: Order status is "${order.status}". You can only review completed orders once Delivered.`);
    }

    // US7 Acceptance Criteria: "Exactly one rating/review submission allowed per completed order."
    if (order.review) {
      throw new Error('A rating/review has already been submitted for this order.');
    }

    const numRating = Number(rating);
    if (isNaN(numRating) || numRating < 1 || numRating > 5) {
      throw new Error('Rating must be a whole number between 1 and 5 stars.');
    }

    const review = {
      rating: Math.round(numRating),
      comment: (comment || '').trim(),
      reviewedAt: new Date().toISOString(),
      userId: userId || order.userId
    };

    order.review = review;

    // Recalculate restaurant rating
    const restaurant = this.restaurants.find(r => r.id === order.restaurantId);
    if (restaurant) {
      const prevTotal = restaurant.rating * restaurant.ratingCount;
      restaurant.ratingCount += 1;
      restaurant.rating = Math.round(((prevTotal + numRating) / restaurant.ratingCount) * 10) / 10;
    }

    return { order, review };
  }

  // US9: Order History & Reorder
  getUserOrders(userId = null) {
    let ordersList = [...this.orders];
    if (userId) {
      ordersList = ordersList.filter(o => o.userId === userId || o.userId === 'user-1' || o.userId === 'guest');
    }
    // US9 Acceptance Criteria: "Historical orders are displayed sorted chronologically (newest first)."
    return ordersList.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }
}

// Singleton store instance
const store = new QuickBiteStore();

module.exports = {
  store,
  QuickBiteStore
};
