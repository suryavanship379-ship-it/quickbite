const { test, before, after } = require('node:test');
const assert = require('node:assert');
const app = require('./app');

let server;
let baseUrl;

before(async () => {
  return new Promise((resolve) => {
    server = app.listen(0, () => {
      baseUrl = `http://localhost:${server.address().port}`;
      resolve();
    });
  });
});

after(async () => {
  return new Promise((resolve) => {
    if (server.closeAllConnections) server.closeAllConnections();
    server.close(resolve);
  });
});

// -------------------------------------------------------------
// Baseline CI/CD Pipeline Contract Verification
// -------------------------------------------------------------
test('GET /health returns status ok', async () => {
  const res = await fetch(`${baseUrl}/health`);
  const body = await res.json();
  assert.strictEqual(res.status, 200);
  assert.strictEqual(body.status, 'ok');
});

// -------------------------------------------------------------
// Acceptance Test: Root route serves actual QuickBite Web Application (not placeholder)
// -------------------------------------------------------------
test('GET / returns full QuickBite HTML web application', async () => {
  const res = await fetch(`${baseUrl}/`);
  const html = await res.text();
  assert.strictEqual(res.status, 200);
  assert.ok(html.includes('<!DOCTYPE html>'), 'Must serve HTML document');
  assert.ok(html.includes('<title>QuickBite'), 'Must have QuickBite title');
  assert.ok(html.includes('restaurantsContainer'), 'Must have restaurant discovery elements');
  assert.ok(html.includes('cartDrawer'), 'Must have cart drawer component');
});

// -------------------------------------------------------------
// US1: Registration & Authentication
// -------------------------------------------------------------
test('US1: POST /api/auth/register enforces password length >= 8', async () => {
  // Too short password
  const failRes = await fetch(`${baseUrl}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Shorty', email: 'short@test.com', password: '123' })
  });
  const failBody = await failRes.json();
  assert.strictEqual(failRes.status, 400);
  assert.ok(failBody.error.includes('8 characters'), 'Error must specify minimum 8 characters');

  // Valid password
  const successRes = await fetch(`${baseUrl}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Aarav Mehta', email: `aarav_${Date.now()}@test.com`, password: 'password123' })
  });
  const successBody = await successRes.json();
  assert.strictEqual(successRes.status, 201);
  assert.strictEqual(successBody.success, true);
  assert.ok(successBody.user.id);
});

test('US1: POST /api/auth/login validates credentials', async () => {
  // Invalid
  const failRes = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'priya@quickbite.com', password: 'wrongpassword' })
  });
  assert.strictEqual(failRes.status, 401);

  // Valid demo user
  const successRes = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'priya@quickbite.com', password: 'password123' })
  });
  const successBody = await successRes.json();
  assert.strictEqual(successRes.status, 200);
  assert.strictEqual(successBody.user.email, 'priya@quickbite.com');
});

// -------------------------------------------------------------
// US2: Restaurant Discovery & Closed Restaurant Flagging
// -------------------------------------------------------------
test('US2: GET /api/restaurants returns restaurants and flags closed establishments', async () => {
  const res = await fetch(`${baseUrl}/api/restaurants`);
  const data = await res.json();
  assert.strictEqual(res.status, 200);
  assert.ok(data.restaurants.length >= 6);

  const openRest = data.restaurants.find(r => r.isOpen === true);
  assert.ok(openRest, 'Must have active open restaurants');

  const closedRest = data.restaurants.find(r => r.isOpen === false);
  assert.ok(closedRest, 'Must flag closed restaurants per US2 acceptance criteria');
  assert.strictEqual(closedRest.isOpen, false);
});

// -------------------------------------------------------------
// US3: Food Search & Multi-Filter Logic (< 2 seconds)
// -------------------------------------------------------------
test('US3: GET /api/foods supports search and multi-filtering within 2s', async () => {
  const start = Date.now();
  const res = await fetch(`${baseUrl}/api/foods?q=biryani&isVeg=true`);
  const duration = Date.now() - start;
  const data = await res.json();

  assert.strictEqual(res.status, 200);
  assert.ok(duration < 2000, `Query duration (${duration}ms) must be under 2000ms`);
  assert.ok(data.foods.every(f => f.isVeg === true), 'All returned items must be veg');
});

// -------------------------------------------------------------
// US4: Cart Single-Restaurant Restriction
// -------------------------------------------------------------
test('US4: POST /api/orders rejects cross-restaurant cart mixing', async () => {
  const res = await fetch(`${baseUrl}/api/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId: 'user-1',
      restaurantId: 'rest-1',
      items: [
        { id: 'food-101', quantity: 1 }, // rest-1
        { id: 'food-201', quantity: 1 }  // rest-2
      ],
      paymentMethod: 'UPI'
    })
  });
  const body = await res.json();

  assert.strictEqual(res.status, 400);
  assert.ok(body.error.includes('Cart collision') || body.error.includes('same restaurant'));
});

// -------------------------------------------------------------
// US5: Checkout & Payment with Unique Order ID
// -------------------------------------------------------------
test('US5: POST /api/orders creates unique order ID and preserves cart on failure', async () => {
  // Test Simulated Failure
  const failRes = await fetch(`${baseUrl}/api/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId: 'user-1',
      restaurantId: 'rest-1',
      items: [{ id: 'food-101', quantity: 1 }],
      simulatePaymentFailure: true
    })
  });
  const failBody = await failRes.json();
  assert.strictEqual(failRes.status, 400);
  assert.ok(failBody.error.includes('Simulated Payment'));

  // Test Success
  const successRes = await fetch(`${baseUrl}/api/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId: 'user-1',
      restaurantId: 'rest-1',
      items: [{ id: 'food-101', quantity: 2 }],
      paymentMethod: 'UPI (PhonePe)'
    })
  });
  const successBody = await successRes.json();

  assert.strictEqual(successRes.status, 201);
  assert.ok(successBody.order.id.startsWith('QB-'), 'Must generate unique QB- order ID');
  assert.strictEqual(successBody.order.status, 'Placed');
});

// -------------------------------------------------------------
// US6: Order Lifecycle Sequencing (Placed -> Preparing -> Out for Delivery -> Delivered)
// -------------------------------------------------------------
test('US6: PATCH /api/orders/:id/status sequences milestones strictly', async () => {
  // Create order
  const createRes = await fetch(`${baseUrl}/api/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId: 'user-1',
      restaurantId: 'rest-1',
      items: [{ id: 'food-102', quantity: 1 }]
    })
  });
  const { order } = await createRes.json();
  const orderId = order.id;

  // Step 1: Placed -> Preparing
  const step1 = await fetch(`${baseUrl}/api/orders/${orderId}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({})
  });
  const s1 = await step1.json();
  assert.strictEqual(s1.order.status, 'Preparing');

  // Step 2: Preparing -> Out for Delivery
  const step2 = await fetch(`${baseUrl}/api/orders/${orderId}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({})
  });
  const s2 = await step2.json();
  assert.strictEqual(s2.order.status, 'Out for Delivery');

  // Step 3: Out for Delivery -> Delivered
  const step3 = await fetch(`${baseUrl}/api/orders/${orderId}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({})
  });
  const s3 = await step3.json();
  assert.strictEqual(s3.order.status, 'Delivered');
  assert.strictEqual(s3.order.etaMinutes, 0);
});

// -------------------------------------------------------------
// US7: Ratings restricted strictly to Delivered status & one per order
// -------------------------------------------------------------
test('US7: POST /api/orders/:id/review restricts review to Delivered orders', async () => {
  // Create new active order (Placed)
  const createRes = await fetch(`${baseUrl}/api/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId: 'user-1',
      restaurantId: 'rest-1',
      items: [{ id: 'food-103', quantity: 1 }]
    })
  });
  const { order } = await createRes.json();

  // Attempting to rate un-delivered order must be rejected
  const prematureRes = await fetch(`${baseUrl}/api/orders/${order.id}/review`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ rating: 5, comment: 'Premature review' })
  });
  const prematureBody = await prematureRes.json();
  assert.strictEqual(prematureRes.status, 400);
  assert.ok(prematureBody.error.toLowerCase().includes('delivered'));

  // Advance order to Delivered
  await fetch(`${baseUrl}/api/orders/${order.id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: 'Delivered' })
  });

  // Now submit review
  const validRes = await fetch(`${baseUrl}/api/orders/${order.id}/review`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ rating: 5, comment: 'Exceptional dal makhani!' })
  });
  const validBody = await validRes.json();
  assert.strictEqual(validRes.status, 201);
  assert.strictEqual(validBody.success, true);

  // Attempting second review must be rejected (US7: exactly 1 review per completed order)
  const duplicateRes = await fetch(`${baseUrl}/api/orders/${order.id}/review`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ rating: 4, comment: 'Second review attempt' })
  });
  assert.strictEqual(duplicateRes.status, 400);
});

// -------------------------------------------------------------
// US8: Restaurant Kitchen Dashboard (Accept/Reject/5-min Timeout)
// -------------------------------------------------------------
test('US8: PATCH /api/orders/:id/kitchen supports accept, reject, and timeout auto-cancel', async () => {
  const createRes = await fetch(`${baseUrl}/api/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId: 'user-1',
      restaurantId: 'rest-1',
      items: [{ id: 'food-101', quantity: 1 }]
    })
  });
  const { order } = await createRes.json();

  // Simulate timeout
  const timeoutRes = await fetch(`${baseUrl}/api/orders/${order.id}/kitchen`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'timeout' })
  });
  const timeoutBody = await timeoutRes.json();

  assert.strictEqual(timeoutRes.status, 200);
  assert.strictEqual(timeoutBody.order.status, 'Cancelled');
  assert.ok(timeoutBody.order.rejectionReason.includes('5-minute'));
});

// -------------------------------------------------------------
// US9: Order History Sorted Chronologically
// -------------------------------------------------------------
test('US9: GET /api/orders returns orders sorted newest first', async () => {
  const res = await fetch(`${baseUrl}/api/orders`);
  const data = await res.json();

  assert.strictEqual(res.status, 200);
  assert.ok(data.orders.length >= 2);
  for (let i = 0; i < data.orders.length - 1; i++) {
    const current = new Date(data.orders[i].createdAt).getTime();
    const next = new Date(data.orders[i + 1].createdAt).getTime();
    assert.ok(current >= next, 'Orders must be sorted in descending chronological order');
  }
});

// -------------------------------------------------------------
// US10: Promo Code Engine
// -------------------------------------------------------------
test('US10: POST /api/promos/validate validates coupons and minimum order thresholds', async () => {
  // Below minimum threshold
  const belowRes = await fetch(`${baseUrl}/api/promos/validate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code: 'WELCOME50', subtotal: 100 })
  });
  const belowBody = await belowRes.json();
  assert.strictEqual(belowRes.status, 400);
  assert.ok(belowBody.error.includes('Minimum order value'));

  // Expired coupon
  const expiredRes = await fetch(`${baseUrl}/api/promos/validate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code: 'EXPIRED30', subtotal: 500 })
  });
  const expiredBody = await expiredRes.json();
  assert.strictEqual(expiredRes.status, 400);
  assert.ok(expiredBody.error.includes('expired') || expiredBody.error.includes('inactive'));

  // Valid coupon
  const validRes = await fetch(`${baseUrl}/api/promos/validate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code: 'WELCOME50', subtotal: 350 })
  });
  const validBody = await validRes.json();

  assert.strictEqual(validRes.status, 200);
  assert.strictEqual(validBody.discount, 50);
});
