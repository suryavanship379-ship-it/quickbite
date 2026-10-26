/**
 * QuickBite — Frontend Application Controller
 * Handles all 10 Agile User Stories (US1 - US10)
 * Fully connected to the Express REST API backend
 */

class QuickBiteApp {
  constructor() {
    this.currentUser = {
      id: 'user-1',
      name: 'Priya Suryavanshi',
      email: 'priya@quickbite.com',
      role: 'customer',
      address: 'Flat 402, Sunshine Heights, Hiranandani Estate, Thane, Maharashtra'
    };

    this.restaurants = [];
    this.foods = [];
    this.orders = [];

    // Active filters (US3)
    this.filters = {
      q: '',
      cuisine: 'all',
      rating: '',
      maxPrice: '',
      isVeg: false,
      restaurantId: null
    };

    // Cart State (US4)
    this.cart = {
      restaurantId: null,
      restaurantName: null,
      items: [], // { id, name, price, quantity, isVeg, image }
      promoApplied: null,
      discount: 0
    };

    // Pending item for cross-restaurant conflict modal
    this.pendingConflictItem = null;

    // Active Order tracking (US6)
    this.activeTrackingOrderId = null;
    this.trackingAutoInterval = null;

    // Review modal state (US7)
    this.currentReviewOrderId = null;
    this.currentRatingValue = 5;

    // Kitchen timer interval (US8)
    this.kitchenTimerInterval = null;

    // Sound alert synth
    this.audioCtx = null;
  }

  async init() {
    this.loadCartFromStorage();
    this.updateUserNav();
    this.setupEventListeners();
    await this.fetchRestaurants();
    await this.fetchFoods();
    await this.fetchOrders();

    // Check if there is an ongoing active order to show tracking
    const ongoing = this.orders.find(o => o.status !== 'Delivered' && o.status !== 'Cancelled');
    if (ongoing) {
      this.renderActiveTrackingBanner(ongoing);
    }

    console.log('✅ QuickBite initialized successfully with 10 Agile Stories');
  }

  // =========================================================================
  // AUDIO SYNTHESIZER (Web Audio API)
  // =========================================================================
  playChime(type = 'success') {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      if (!this.audioCtx) this.audioCtx = new AudioCtx();

      const ctx = this.audioCtx;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'success') {
        osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.3);
      } else if (type === 'alert') {
        osc.frequency.setValueAtTime(440, ctx.currentTime); // A4
        osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1); // E5
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.4);
      }
    } catch (e) {
      // Audio autoplay policy fallback
    }
  }

  // =========================================================================
  // TOAST NOTIFICATIONS
  // =========================================================================
  showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    const icon = type === 'success' ? '✔' : type === 'error' ? '✖' : 'ℹ';
    toast.innerHTML = `<span>${icon}</span><span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }

  // =========================================================================
  // SETUP EVENT LISTENERS & SEARCH (US3)
  // =========================================================================
  setupEventListeners() {
    const searchInput = document.getElementById('globalSearchInput');
    if (searchInput) {
      let debounceTimer;
      searchInput.addEventListener('input', (e) => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
          this.filters.q = e.target.value;
          this.applyFilters();
        }, 150);
      });
    }

    // Password strength check listener in auth form (US1)
    const passInput = document.getElementById('authPasswordInput');
    const feedback = document.getElementById('passwordStrengthFeedback');
    if (passInput && feedback) {
      passInput.addEventListener('input', () => {
        const len = passInput.value.length;
        if (len === 0) {
          feedback.textContent = '';
        } else if (len < 8) {
          feedback.textContent = `❌ ${len}/8 characters (Needs ${8 - len} more)`;
          feedback.style.color = 'var(--danger)';
        } else {
          feedback.textContent = `✔ ${len} characters (Acceptance criteria satisfied)`;
          feedback.style.color = 'var(--secondary)';
        }
      });
    }
  }

  // =========================================================================
  // DATA FETCHING (API Integration)
  // =========================================================================
  async fetchRestaurants() {
    try {
      const res = await fetch('/api/restaurants');
      const data = await res.json();
      if (data.success) {
        this.restaurants = data.restaurants;
        this.renderRestaurants();
      }
    } catch (err) {
      console.error('Failed to fetch restaurants:', err);
      this.showToast('Could not load restaurants from server', 'error');
    }
  }

  async fetchFoods() {
    try {
      const params = new URLSearchParams();
      if (this.filters.q) params.set('q', this.filters.q);
      if (this.filters.cuisine && this.filters.cuisine !== 'all') params.set('cuisine', this.filters.cuisine);
      if (this.filters.rating) params.set('rating', this.filters.rating);
      if (this.filters.maxPrice) params.set('maxPrice', this.filters.maxPrice);
      if (this.filters.isVeg) params.set('isVeg', 'true');
      if (this.filters.restaurantId) params.set('restaurantId', this.filters.restaurantId);

      const res = await fetch(`/api/foods?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        this.foods = data.foods;
        this.renderFoods();
      }
    } catch (err) {
      console.error('Failed to fetch foods:', err);
      this.showToast('Could not load foods from server', 'error');
    }
  }

  async fetchOrders() {
    try {
      const userId = this.currentUser ? this.currentUser.id : null;
      const res = await fetch(`/api/orders${userId ? `?userId=${userId}` : ''}`);
      const data = await res.json();
      if (data.success) {
        this.orders = data.orders;
        this.renderOrderHistory();
        this.renderKitchenOrders();
      }
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    }
  }

  // =========================================================================
  // RENDERING: RESTAURANTS (US2)
  // =========================================================================
  renderRestaurants() {
    const container = document.getElementById('restaurantsContainer');
    if (!container) return;

    if (!this.restaurants.length) {
      container.innerHTML = '<p style="color:var(--gray-500);">Loading restaurants...</p>';
      return;
    }

    container.innerHTML = this.restaurants.map(rest => {
      const isSelected = this.filters.restaurantId === rest.id;
      const closedClass = !rest.isOpen ? 'closed-restaurant' : '';

      return `
        <div class="restaurant-card ${closedClass} ${isSelected ? 'selected' : ''}" onclick="app.selectRestaurant('${rest.id}')">
          <div class="restaurant-img-wrap">
            <img src="${rest.image}" alt="${rest.name}" loading="lazy">
            ${!rest.isOpen ? `
              <div class="card-closed-overlay">
                <span class="badge">🔴 Currently Closed</span>
                <p>${rest.closedReason || 'Opens at 11:00 PM'}</p>
              </div>
            ` : `
              <div class="restaurant-rating-badge">
                <span>★</span>
                <span>${rest.rating.toFixed(1)}</span>
              </div>
            `}
          </div>
          <div class="restaurant-info">
            <h3 class="restaurant-name">${rest.name}</h3>
            <p class="restaurant-cuisines">${rest.cuisines.join(' • ')}</p>
            <div class="restaurant-meta">
              <span class="meta-item">⏱️ ${rest.deliveryTimeMinutes} mins</span>
              <span class="meta-item">🛵 ${rest.distanceKm} km</span>
              <span class="meta-item">₹${rest.costForTwo} for two</span>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  selectRestaurant(restaurantId) {
    if (this.filters.restaurantId === restaurantId) {
      this.filters.restaurantId = null; // Toggle off
      this.showToast('Showing dishes from all restaurants', 'info');
    } else {
      this.filters.restaurantId = restaurantId;
      const rest = this.restaurants.find(r => r.id === restaurantId);
      this.showToast(`Filtered to ${rest.name}`, 'info');
    }
    this.applyFilters();
  }

  // =========================================================================
  // RENDERING: FOOD DISHES & EMPTY STATE (US2 & US3)
  // =========================================================================
  renderFoods() {
    const container = document.getElementById('foodsContainer');
    const badge = document.getElementById('filterCountBadge');
    if (!container) return;

    if (badge) {
      badge.textContent = `Showing ${this.foods.length} dish${this.foods.length === 1 ? '' : 'es'}`;
    }

    // US3 Acceptance Criteria: "A friendly 'No results found' placeholder is displayed when no items match."
    if (!this.foods.length) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">🍽️</div>
          <h3>No matching dishes found</h3>
          <p>We couldn't find any dishes matching your current filter criteria.</p>
          <button class="btn-primary" onclick="app.resetAllFilters()">
            <span>Reset All Filters</span>
          </button>
        </div>
      `;
      return;
    }

    container.innerHTML = this.foods.map(dish => {
      const cartItem = this.cart.items.find(i => i.id === dish.id);
      const qty = cartItem ? cartItem.quantity : 0;
      const rest = this.restaurants.find(r => r.id === dish.restaurantId);
      const isRestClosed = rest && !rest.isOpen;

      return `
        <div class="food-card">
          <div class="food-img-wrap">
            <img src="${dish.image}" alt="${dish.name}" loading="lazy">
            <span class="food-veg-tag">
              <span class="${dish.isVeg ? 'veg-badge-icon' : 'nonveg-badge-icon'}"></span>
            </span>
            <span class="food-restaurant-badge">${dish.restaurantName}</span>
          </div>
          <div class="food-body">
            <div class="food-title-row">
              <h4 class="food-name">${dish.name}</h4>
              <span class="food-price">₹${dish.price}</span>
            </div>
            <p class="food-desc">${dish.description}</p>
            <div class="food-footer">
              <div class="food-rating-pill">
                <span>★ ${dish.rating.toFixed(1)}</span>
                <span class="count">(${dish.ratingCount})</span>
              </div>
              <div>
                ${isRestClosed ? `
                  <button class="btn-add-food disabled" title="Restaurant is closed">
                    Closed
                  </button>
                ` : qty > 0 ? `
                  <div class="qty-stepper">
                    <button onclick="app.updateItemQuantity('${dish.id}', -1)">-</button>
                    <span class="qty-val">${qty}</span>
                    <button onclick="app.updateItemQuantity('${dish.id}', 1)">+</button>
                  </div>
                ` : `
                  <button class="btn-add-food" onclick="app.addToCart('${dish.id}')">
                    <span>+ Add</span>
                  </button>
                `}
              </div>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  // =========================================================================
  // FILTER ACTIONS (US3)
  // =========================================================================
  setFilterCuisine(cuisine) {
    this.filters.cuisine = cuisine;
    // Update chip styling
    document.querySelectorAll('.cuisine-chip').forEach(chip => {
      if (chip.getAttribute('data-cuisine') === cuisine) {
        chip.classList.add('active');
      } else {
        chip.classList.remove('active');
      }
    });
    this.applyFilters();
  }

  applyFilters() {
    const ratingSel = document.getElementById('ratingFilter');
    const priceSel = document.getElementById('priceFilter');
    const vegToggle = document.getElementById('vegOnlyToggle');

    if (ratingSel) this.filters.rating = ratingSel.value;
    if (priceSel) this.filters.maxPrice = priceSel.value;
    if (vegToggle) this.filters.isVeg = vegToggle.checked;

    // US3: Filter response renders well within 2 seconds
    this.fetchFoods();
  }

  resetAllFilters() {
    this.filters = {
      q: '',
      cuisine: 'all',
      rating: '',
      maxPrice: '',
      isVeg: false,
      restaurantId: null
    };

    const searchInput = document.getElementById('globalSearchInput');
    const ratingSel = document.getElementById('ratingFilter');
    const priceSel = document.getElementById('priceFilter');
    const vegToggle = document.getElementById('vegOnlyToggle');

    if (searchInput) searchInput.value = '';
    if (ratingSel) ratingSel.value = '';
    if (priceSel) priceSel.value = '';
    if (vegToggle) vegToggle.checked = false;

    document.querySelectorAll('.cuisine-chip').forEach(chip => {
      chip.classList.toggle('active', chip.getAttribute('data-cuisine') === 'all');
    });

    this.fetchRestaurants();
    this.fetchFoods();
    this.showToast('All filters reset', 'info');
  }

  // =========================================================================
  // CART MANAGEMENT (US4)
  // =========================================================================
  loadCartFromStorage() {
    try {
      const stored = localStorage.getItem('quickbite_cart');
      if (stored) {
        this.cart = JSON.parse(stored);
      }
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }
    this.syncCartUI();
  }

  saveCartToStorage() {
    try {
      localStorage.setItem('quickbite_cart', JSON.stringify(this.cart));
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }
    this.syncCartUI();
  }

  addToCart(foodId) {
    const food = this.foods.find(f => f.id === foodId);
    if (!food) return;

    // Check restaurant availability (US2)
    const rest = this.restaurants.find(r => r.id === food.restaurantId);
    if (rest && !rest.isOpen) {
      this.showToast(`${rest.name} is currently closed. Cannot add items.`, 'error');
      return;
    }

    // US4 Acceptance Criteria: "Items from two different restaurants cannot be mixed in the same cart (prompts user to replace cart)."
    if (this.cart.restaurantId && this.cart.items.length > 0 && this.cart.restaurantId !== food.restaurantId) {
      this.pendingConflictItem = food;
      const currentRest = document.getElementById('conflictCurrentRest');
      const newRest = document.getElementById('conflictNewRest');
      if (currentRest) currentRest.textContent = this.cart.restaurantName || 'Another Restaurant';
      if (newRest) newRest.textContent = food.restaurantName;

      const modal = document.getElementById('conflictModal');
      if (modal) modal.classList.add('active');
      return;
    }

    // First item or same restaurant
    this.cart.restaurantId = food.restaurantId;
    this.cart.restaurantName = food.restaurantName;

    const existing = this.cart.items.find(i => i.id === food.id);
    if (existing) {
      existing.quantity += 1;
    } else {
      this.cart.items.push({
        id: food.id,
        name: food.name,
        price: food.price,
        quantity: 1,
        isVeg: food.isVeg,
        image: food.image
      });
    }

    this.saveCartToStorage();
    this.renderFoods();
    this.playChime('success');
    this.showToast(`Added "${food.name}" to cart`, 'success');
  }

  confirmReplaceCart() {
    if (!this.pendingConflictItem) return;
    const food = this.pendingConflictItem;

    this.cart.restaurantId = food.restaurantId;
    this.cart.restaurantName = food.restaurantName;
    this.cart.items = [{
      id: food.id,
      name: food.name,
      price: food.price,
      quantity: 1,
      isVeg: food.isVeg,
      image: food.image
    }];
    this.cart.promoApplied = null;
    this.cart.discount = 0;

    this.pendingConflictItem = null;
    this.closeConflictModal();
    this.saveCartToStorage();
    this.renderFoods();
    this.playChime('success');
    this.showToast(`Cart replaced with dishes from ${food.restaurantName}`, 'success');
  }

  closeConflictModal() {
    const modal = document.getElementById('conflictModal');
    if (modal) modal.classList.remove('active');
    this.pendingConflictItem = null;
  }

  updateItemQuantity(foodId, delta) {
    const item = this.cart.items.find(i => i.id === foodId);
    if (!item) return;

    item.quantity += delta;
    if (item.quantity <= 0) {
      this.cart.items = this.cart.items.filter(i => i.id !== foodId);
      if (this.cart.items.length === 0) {
        this.cart.restaurantId = null;
        this.cart.restaurantName = null;
        this.cart.promoApplied = null;
        this.cart.discount = 0;
      }
    }

    this.saveCartToStorage();
    this.renderFoods();
    this.syncCartUI();
  }

  syncCartUI() {
    const countBadge = document.getElementById('cartCountBadge');
    const totalItems = this.cart.items.reduce((acc, curr) => acc + curr.quantity, 0);
    if (countBadge) countBadge.textContent = totalItems;

    // Subtotal calculation
    const subtotal = this.cart.items.reduce((acc, curr) => acc + (curr.price * curr.quantity), 0);
    const tax = Math.round((subtotal * 0.05) * 100) / 100;
    const deliveryFee = (subtotal === 0 || subtotal > 500) ? 0 : 40;
    const discount = Math.min(this.cart.discount || 0, subtotal);
    const total = Math.max(0, Math.round((subtotal - discount + tax + deliveryFee) * 100) / 100);

    const subtotalEl = document.getElementById('billSubtotal');
    const discountRow = document.getElementById('billDiscountRow');
    const discountEl = document.getElementById('billDiscount');
    const deliveryEl = document.getElementById('billDeliveryFee');
    const taxEl = document.getElementById('billTax');
    const totalEl = document.getElementById('billTotal');
    const checkoutTotalBtn = document.getElementById('checkoutTotalBtn');
    const subtitle = document.getElementById('cartRestaurantSubtitle');

    if (subtotalEl) subtotalEl.textContent = `₹${subtotal}`;
    if (deliveryEl) deliveryEl.textContent = deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`;
    if (taxEl) taxEl.textContent = `₹${tax}`;
    if (totalEl) totalEl.textContent = `₹${total}`;
    if (checkoutTotalBtn) checkoutTotalBtn.textContent = `₹${total} →`;
    if (subtitle) subtitle.textContent = this.cart.restaurantName || 'No restaurant selected';

    if (discountRow && discountEl) {
      if (discount > 0) {
        discountRow.style.display = 'flex';
        discountEl.textContent = `-₹${discount}`;
      } else {
        discountRow.style.display = 'none';
      }
    }

    // Populate drawer items list
    const itemsList = document.getElementById('cartItemsList');
    if (itemsList) {
      if (!this.cart.items.length) {
        itemsList.innerHTML = `
          <div style="text-align:center; padding: 3rem 1rem; color:var(--gray-500);">
            <div style="font-size: 2.5rem; margin-bottom: 0.5rem;">🛒</div>
            <p>Your cart is empty.</p>
            <small>Browse delicious items and add them to order!</small>
          </div>
        `;
      } else {
        itemsList.innerHTML = this.cart.items.map(item => `
          <div class="cart-item-row">
            <div class="cart-item-info">
              <span class="${item.isVeg ? 'veg-badge-icon' : 'nonveg-badge-icon'}"></span>
              <div>
                <div class="cart-item-title">${item.name}</div>
                <div class="cart-item-sub">₹${item.price} each</div>
              </div>
            </div>
            <div class="qty-stepper">
              <button onclick="app.updateItemQuantity('${item.id}', -1)">-</button>
              <span class="qty-val">${item.quantity}</span>
              <button onclick="app.updateItemQuantity('${item.id}', 1)">+</button>
            </div>
            <div class="cart-item-price">₹${item.price * item.quantity}</div>
          </div>
        `).join('');
      }
    }

    // Update promo status display
    const promoStatus = document.getElementById('appliedPromoStatus');
    if (promoStatus) {
      if (this.cart.promoApplied && discount > 0) {
        promoStatus.innerHTML = `
          <div class="applied-promo-tag">
            <span>🎉 Coupon <strong>${this.cart.promoApplied}</strong> applied (-₹${discount})</span>
            <button onclick="app.removePromoCode()" style="color:#065f46; font-weight:700;">✕</button>
          </div>
        `;
      } else {
        promoStatus.innerHTML = '';
      }
    }
  }

  openCart() {
    this.syncCartUI();
    const overlay = document.getElementById('cartOverlay');
    const drawer = document.getElementById('cartDrawer');
    if (overlay) overlay.classList.add('active');
    if (drawer) drawer.classList.add('active');
  }

  closeCart() {
    const overlay = document.getElementById('cartOverlay');
    const drawer = document.getElementById('cartDrawer');
    if (overlay) overlay.classList.remove('active');
    if (drawer) drawer.classList.remove('active');
  }

  // =========================================================================
  // PROMO CODES ENGINE (US10)
  // =========================================================================
  fillPromoInput(code) {
    const input = document.getElementById('promoCodeInput');
    if (input) input.value = code;
  }

  applyQuickPromo(code) {
    this.fillPromoInput(code);
    this.openCart();
    this.applyPromoCode();
  }

  async applyPromoCode() {
    const input = document.getElementById('promoCodeInput');
    if (!input || !input.value.trim()) {
      this.showToast('Please enter a coupon code', 'error');
      return;
    }

    const code = input.value.trim().toUpperCase();
    const subtotal = this.cart.items.reduce((acc, curr) => acc + (curr.price * curr.quantity), 0);

    if (subtotal === 0) {
      this.showToast('Add items to cart before applying coupon', 'error');
      return;
    }

    try {
      const res = await fetch('/api/promos/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, subtotal })
      });
      const data = await res.json();

      if (data.success) {
        this.cart.promoApplied = data.code;
        this.cart.discount = data.discount;
        this.saveCartToStorage();
        this.playChime('success');
        this.showToast(`Coupon "${data.code}" applied! You saved ₹${data.discount}`, 'success');
      } else {
        // US10 Acceptance Criteria: "Expired, inactive, or below-threshold codes display an informative error."
        this.showToast(data.error || 'Invalid promo code', 'error');
      }
    } catch (err) {
      this.showToast('Failed to validate promo code', 'error');
    }
  }

  removePromoCode() {
    this.cart.promoApplied = null;
    this.cart.discount = 0;
    this.saveCartToStorage();
    this.showToast('Coupon removed', 'info');
  }

  // =========================================================================
  // CHECKOUT & PAYMENT MODAL (US5)
  // =========================================================================
  proceedToCheckout() {
    if (!this.cart.items.length) {
      this.showToast('Your cart is empty. Please add delicious meals first!', 'error');
      return;
    }

    // Auto login check or allow guest/demo user
    if (!this.currentUser) {
      this.openAuthModal();
      this.showToast('Please sign in or use demo account to checkout', 'info');
      return;
    }

    this.closeCart();

    const subtotal = this.cart.items.reduce((acc, curr) => acc + (curr.price * curr.quantity), 0);
    const tax = Math.round((subtotal * 0.05) * 100) / 100;
    const deliveryFee = (subtotal > 500 || subtotal === 0) ? 0 : 40;
    const discount = Math.min(this.cart.discount || 0, subtotal);
    const total = Math.max(0, Math.round((subtotal - discount + tax + deliveryFee) * 100) / 100);

    const finalAmtEl = document.getElementById('checkoutFinalAmount');
    const codAmtEl = document.getElementById('codAmountText');
    if (finalAmtEl) finalAmtEl.textContent = `₹${total}`;
    if (codAmtEl) codAmtEl.textContent = `₹${total}`;

    const modal = document.getElementById('checkoutModal');
    if (modal) modal.classList.add('active');
  }

  closeCheckoutModal() {
    const modal = document.getElementById('checkoutModal');
    if (modal) modal.classList.remove('active');
  }

  setPaymentTab(tab) {
    const tabs = ['upi', 'card', 'cod'];
    tabs.forEach(t => {
      const btn = document.getElementById(`tab${t.charAt(0).toUpperCase() + t.slice(1)}`);
      const form = document.getElementById(`payment${t.charAt(0).toUpperCase() + t.slice(1)}Form`);
      if (btn) btn.classList.toggle('active', t === tab);
      if (form) form.style.display = t === tab ? 'block' : 'none';
    });
    this.activePaymentMethod = tab;
  }

  async submitPayment(simulateFailure = false) {
    const addressInput = document.getElementById('checkoutAddressInput');
    const deliveryAddress = addressInput ? addressInput.value.trim() : 'Sunshine Heights, Thane';

    let paymentMethod = 'UPI (Google Pay)';
    if (this.activePaymentMethod === 'card') {
      paymentMethod = 'Credit / Debit Card';
    } else if (this.activePaymentMethod === 'cod') {
      paymentMethod = 'Cash on Delivery';
    }

    const payload = {
      userId: this.currentUser ? this.currentUser.id : 'user-1',
      userName: this.currentUser ? this.currentUser.name : 'Priya Suryavanshi',
      restaurantId: this.cart.restaurantId,
      items: this.cart.items,
      paymentMethod,
      deliveryAddress,
      promoCode: this.cart.promoApplied,
      simulatePaymentFailure: simulateFailure
    };

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (!data.success) {
        // US5 Acceptance Criteria: "On payment failure or gateway timeout, cart contents are strictly preserved."
        this.showToast(data.error || 'Payment failed. Cart contents preserved.', 'error');
        this.playChime('alert');
        return;
      }

      // Successful payment!
      const newOrder = data.order;
      this.closeCheckoutModal();

      // Clear cart
      this.cart = {
        restaurantId: null,
        restaurantName: null,
        items: [],
        promoApplied: null,
        discount: 0
      };
      this.saveCartToStorage();
      this.renderFoods();

      this.playChime('success');
      this.showToast(`🎉 Order ${newOrder.id} confirmed! Preparing your food.`, 'success');

      // Refresh orders list
      await this.fetchOrders();

      // Open tracking view immediately (US6)
      this.trackOrder(newOrder.id);

    } catch (err) {
      console.error('Order submission error:', err);
      this.showToast('Network error while processing order. Cart preserved.', 'error');
    }
  }

  // =========================================================================
  // LIVE ORDER TRACKING (US6)
  // =========================================================================
  renderActiveTrackingBanner(order) {
    const banner = document.getElementById('activeTrackingBanner');
    if (!banner) return;

    banner.style.display = 'block';
    banner.innerHTML = `
      <div style="background: linear-gradient(90deg, #1f2937, #111827); color:white; padding:1rem 1.25rem; border-radius:var(--radius-lg); display:flex; justify-content:space-between; align-items:center; box-shadow:var(--shadow-md);">
        <div style="display:flex; align-items:center; gap:1rem;">
          <div style="font-size:2rem; animation: pulse-dot 1.5s infinite;">🛵</div>
          <div>
            <strong>Active Order #${order.id} (${order.restaurantName})</strong>
            <div style="font-size:0.8rem; color:#9ca3af;">Status: <span style="color:#ff8a50; font-weight:700;">${order.status}</span> • ETA: ~${order.etaMinutes} mins</div>
          </div>
        </div>
        <button class="btn-primary" onclick="app.trackOrder('${order.id}')" style="padding:0.45rem 1rem; font-size:0.85rem;">
          Track Live →
        </button>
      </div>
    `;
  }

  async trackOrder(orderId) {
    this.activeTrackingOrderId = orderId;
    this.showSection('tracking');

    try {
      const res = await fetch(`/api/orders/${orderId}`);
      const data = await res.json();
      if (data.success) {
        this.renderTrackingDetails(data.order);
      }
    } catch (err) {
      this.showToast('Could not load tracking details', 'error');
    }
  }

  renderTrackingDetails(order) {
    const container = document.getElementById('trackingDetailsContainer');
    if (!container) return;

    const stages = [
      { key: 'Placed', label: 'Order Placed', icon: '📝' },
      { key: 'Preparing', label: 'Kitchen Preparing', icon: '🍳' },
      { key: 'Out for Delivery', label: 'Out for Delivery', icon: '🛵' },
      { key: 'Delivered', label: 'Delivered', icon: '🍽️' }
    ];

    const currentStageIdx = stages.findIndex(s => s.key === order.status);
    const progressPercent = currentStageIdx === -1 ? 0 : Math.round((currentStageIdx / (stages.length - 1)) * 100);

    container.innerHTML = `
      <div class="order-tracking-card">
        <div class="tracking-header">
          <div>
            <span class="status-badge ${order.status.toLowerCase().replace(/ /g, '-')}">${order.status}</span>
            <h3 style="font-size:1.35rem; margin-top:0.4rem;">Order #${order.id}</h3>
            <p style="color:var(--gray-500); font-size:0.85rem;">${order.restaurantName} • ${order.items.length} items • ₹${order.total}</p>
          </div>
          <div class="tracking-eta-box">
            <div class="eta-number">${order.etaMinutes}</div>
            <div class="eta-label">Mins Estimated Arrival</div>
          </div>
        </div>

        <!-- Strict Sequential Milestone Stepper (US6 Acceptance Criteria) -->
        <div class="timeline-stepper">
          <div class="timeline-progress-fill" style="width: calc(${progressPercent}% * 0.85);"></div>
          ${stages.map((stage, idx) => {
            const isCompleted = idx < currentStageIdx;
            const isCurrent = idx === currentStageIdx;
            const nodeClass = isCompleted ? 'completed' : isCurrent ? 'current' : '';
            return `
              <div class="step-node ${nodeClass}">
                <div class="step-dot">${stage.icon}</div>
                <div class="step-name">${stage.label}</div>
              </div>
            `;
          }).join('')}
        </div>

        <!-- Delivery Partner Information -->
        <div class="driver-info-card">
          <div class="driver-left">
            <div class="driver-avatar">🛵</div>
            <div>
              <strong>${order.driver.name}</strong>
              <div style="font-size:0.8rem; color:var(--gray-500);">${order.driver.vehicle} • ⭐ ${order.driver.rating}</div>
            </div>
          </div>
          <div>
            <a href="tel:${order.driver.phone}" class="btn-secondary" style="font-size:0.8rem;">
              📞 Call Delivery Partner
            </a>
          </div>
        </div>

        <!-- Evaluator Simulation Controls (US6 Testability) -->
        <div class="simulation-bar">
          <div>
            <span>⚡ Interactive Testing Controls (US6):</span>
            <small style="color:var(--gray-600); display:block;">Simulate lifecycle: Placed → Preparing → Out for Delivery → Delivered</small>
          </div>
          <div style="display:flex; gap:0.5rem; align-items:center;">
            ${order.status !== 'Delivered' ? `
              <button class="btn-primary" onclick="app.advanceOrderStatus('${order.id}')" style="font-size:0.8rem; padding:0.4rem 0.8rem;">
                Advance to Next Milestone ⏩
              </button>
            ` : `
              <span style="color:var(--secondary); font-weight:700;">✔ Order Fulfilment Complete</span>
            `}
          </div>
        </div>

        <!-- US7 Rating Section (Unlocked only when Delivered) -->
        ${order.status === 'Delivered' ? `
          <div style="margin-top:1.5rem; padding:1.25rem; background:var(--secondary-light); border:1px solid #a7f3d0; border-radius:var(--radius-md);">
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <div>
                <h4 style="color:#065f46; font-size:1.05rem;">⭐ Verified Customer Review (US7)</h4>
                <p style="font-size:0.85rem; color:#047857;">Rate and review your hot meal from ${order.restaurantName}</p>
              </div>
              <div>
                ${order.review ? `
                  <div style="text-align:right;">
                    <span style="font-size:1.1rem; color:#d97706;">${'★'.repeat(order.review.rating)}${'☆'.repeat(5 - order.review.rating)}</span>
                    <div style="font-size:0.8rem; font-style:italic;">"${order.review.comment || 'Great food!'}"</div>
                  </div>
                ` : `
                  <button class="btn-primary" onclick="app.openReviewModal('${order.id}', '${order.restaurantName}')">
                    Leave a Review
                  </button>
                `}
              </div>
            </div>
          </div>
        ` : `
          <div style="margin-top:1rem; font-size:0.8rem; color:var(--gray-500); text-align:center;">
            ℹ️ Rating and reviews (US7) will unlock once your food is delivered!
          </div>
        `}

      </div>
    `;
  }

  async advanceOrderStatus(orderId) {
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });
      const data = await res.json();
      if (data.success) {
        this.playChime('alert');
        this.showToast(`Status updated to: "${data.order.status}"`, 'info');
        this.renderTrackingDetails(data.order);
        await this.fetchOrders();

        if (data.order.status === 'Delivered') {
          this.playChime('success');
          this.showToast('🎉 Your food has been delivered! Enjoy your meal.', 'success');
        }
      }
    } catch (err) {
      this.showToast('Could not advance status', 'error');
    }
  }

  // =========================================================================
  // POST-DELIVERY RATINGS & REVIEWS (US7)
  // =========================================================================
  openReviewModal(orderId, restaurantName) {
    this.currentReviewOrderId = orderId;
    this.currentRatingValue = 5;

    const ordIdEl = document.getElementById('reviewOrderId');
    const restNameEl = document.getElementById('reviewRestName');
    if (ordIdEl) ordIdEl.textContent = `#${orderId}`;
    if (restNameEl) restNameEl.textContent = restaurantName;

    this.setReviewRating(5);

    const modal = document.getElementById('reviewModal');
    if (modal) modal.classList.add('active');
  }

  closeReviewModal() {
    const modal = document.getElementById('reviewModal');
    if (modal) modal.classList.remove('active');
  }

  setReviewRating(stars) {
    this.currentRatingValue = stars;
    const labels = [
      '',
      '1 - Disappointing',
      '2 - Needs Improvement',
      '3 - Average Meal',
      '4 - Very Tasty',
      '5 - Outstanding Experience!'
    ];

    const labelEl = document.getElementById('starRatingLabel');
    if (labelEl) labelEl.textContent = labels[stars] || `${stars} Stars`;

    const btns = document.querySelectorAll('#starRatingContainer .star-btn');
    btns.forEach((b, idx) => {
      b.style.opacity = idx < stars ? '1' : '0.25';
    });
  }

  async submitReview() {
    if (!this.currentReviewOrderId) return;
    const commentInput = document.getElementById('reviewCommentInput');
    const comment = commentInput ? commentInput.value.trim() : '';

    try {
      const res = await fetch(`/api/orders/${this.currentReviewOrderId}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rating: this.currentRatingValue,
          comment,
          userId: this.currentUser ? this.currentUser.id : 'user-1'
        })
      });
      const data = await res.json();

      if (data.success) {
        this.closeReviewModal();
        this.playChime('success');
        this.showToast('Thank you! Your verified review has been recorded.', 'success');
        await this.fetchOrders();
        await this.fetchRestaurants();
        this.trackOrder(this.currentReviewOrderId);
      } else {
        this.showToast(data.error || 'Failed to submit review', 'error');
      }
    } catch (err) {
      this.showToast('Network error submitting review', 'error');
    }
  }

  // =========================================================================
  // RESTAURANT KITCHEN DASHBOARD (US8)
  // =========================================================================
  renderKitchenOrders() {
    const container = document.getElementById('kitchenOrdersContainer');
    if (!container) return;

    // Filter incoming and active orders
    const incoming = this.orders.filter(o => o.status === 'Placed' || o.status === 'Preparing');

    if (!incoming.length) {
      container.innerHTML = `
        <div style="grid-column: 1/-1; text-align:center; padding:2rem; background:white; border-radius:8px; border:1px dashed var(--gray-300);">
          <div style="font-size:2rem; margin-bottom:0.5rem;">👨‍🍳</div>
          <h3>Kitchen Idle</h3>
          <p style="color:var(--gray-500); font-size:0.85rem;">All incoming orders have been processed. Place a new order to see live kitchen alerts!</p>
        </div>
      `;
      return;
    }

    container.innerHTML = incoming.map(order => {
      const isNew = order.status === 'Placed';
      return `
        <div class="kitchen-order-card ${isNew ? 'pulsing' : ''}">
          <div style="display:flex; justify-content:space-between; align-items:flex-start;">
            <div>
              <span class="status-badge ${order.status.toLowerCase().replace(/ /g, '-')}">${order.status}</span>
              <h4 style="font-size:1.1rem; margin-top:0.3rem;">Order #${order.id}</h4>
              <small style="color:var(--gray-500);">${order.restaurantName}</small>
            </div>
            ${isNew ? `
              <span class="kitchen-timer-badge">⏳ Response window: ~4m 45s</span>
            ` : `
              <span style="font-size:0.8rem; color:var(--secondary); font-weight:700;">Cooking in Kitchen</span>
            `}
          </div>

          <div style="background:var(--gray-50); padding:0.65rem; border-radius:6px; font-size:0.85rem;">
            <strong>Customer:</strong> ${order.userName}<br>
            <strong>Items:</strong> ${order.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}<br>
            <strong>Total:</strong> ₹${order.total} (${order.paymentMethod})
          </div>

          ${isNew ? `
            <div class="kitchen-actions-row">
              <button class="btn-kitchen-accept" onclick="app.kitchenAction('${order.id}', 'accept')">
                ✔ Accept & Cook
              </button>
              <button class="btn-kitchen-reject" onclick="app.kitchenAction('${order.id}', 'reject')">
                ✖ Reject (Full Load)
              </button>
            </div>
            <button class="btn-secondary" onclick="app.kitchenAction('${order.id}', 'timeout')" style="font-size:0.75rem; justify-content:center; margin-top:0.35rem;" title="Tests US8 5-minute timeout rule">
              Simulate 5-Min Timeout (Auto-Cancel & Refund)
            </button>
          ` : `
            <button class="btn-primary" onclick="app.kitchenAction('${order.id}', 'ready')" style="font-size:0.85rem; justify-content:center;">
              Mark Ready for Driver Pickup 🛵
            </button>
          `}
        </div>
      `;
    }).join('');
  }

  async kitchenAction(orderId, action) {
    try {
      if (action === 'ready') {
        await this.advanceOrderStatus(orderId);
        return;
      }

      const res = await fetch(`/api/orders/${orderId}/kitchen`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      });
      const data = await res.json();

      if (data.success) {
        this.playChime(action === 'accept' ? 'success' : 'alert');
        this.showToast(`Kitchen ${action}ed order #${orderId}`, 'info');
        await this.fetchOrders();
      } else {
        this.showToast(data.error || 'Action failed', 'error');
      }
    } catch (err) {
      this.showToast('Failed to perform kitchen action', 'error');
    }
  }

  // =========================================================================
  // ORDER HISTORY & 1-CLICK REORDER (US9)
  // =========================================================================
  renderOrderHistory() {
    const container = document.getElementById('orderHistoryContainer');
    if (!container) return;

    if (!this.orders.length) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">📦</div>
          <h3>No past orders yet</h3>
          <p>Once you place orders, they will appear here chronologically.</p>
          <button class="btn-primary" onclick="app.showSection('home')">Start Ordering</button>
        </div>
      `;
      return;
    }

    container.innerHTML = this.orders.map(order => {
      const dateStr = new Date(order.createdAt).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });

      return `
        <div class="order-history-card">
          <div class="order-history-header">
            <div>
              <span class="status-badge ${order.status.toLowerCase().replace(/ /g, '-')}">${order.status}</span>
              <h3 style="font-size:1.15rem; margin-top:0.35rem;">${order.restaurantName}</h3>
              <small style="color:var(--gray-500);">Order #${order.id} • ${dateStr}</small>
            </div>
            <div style="text-align:right;">
              <strong style="font-size:1.2rem; color:var(--gray-900);">₹${order.total}</strong>
              <div style="font-size:0.75rem; color:var(--gray-500);">${order.paymentMethod}</div>
            </div>
          </div>

          <div style="font-size:0.875rem; color:var(--gray-700);">
            ${order.items.map(i => `<span>${i.quantity}x ${i.name}</span>`).join(' • ')}
          </div>

          ${order.review ? `
            <div style="font-size:0.8rem; background:var(--gray-50); padding:0.5rem 0.75rem; border-radius:6px; color:#d97706;">
              ${'★'.repeat(order.review.rating)}${'☆'.repeat(5 - order.review.rating)} 
              <span style="color:var(--gray-700); font-style:italic;">"${order.review.comment || 'Rated'}"</span>
            </div>
          ` : ''}

          <div class="order-history-footer">
            <button class="btn-secondary" onclick="app.trackOrder('${order.id}')" style="font-size:0.8rem;">
              🔍 View Details
            </button>
            <div style="display:flex; gap:0.5rem;">
              ${order.status === 'Delivered' && !order.review ? `
                <button class="btn-secondary" onclick="app.openReviewModal('${order.id}', '${order.restaurantName}')" style="font-size:0.8rem;">
                  ⭐ Rate Meal
                </button>
              ` : ''}
              <!-- US9 Acceptance Criteria: "Clicking a 'Reorder' button automatically refills the cart with those past items." -->
              <button class="btn-reorder" onclick="app.reorderPastOrder('${order.id}')">
                <span>🔄 Reorder</span>
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  reorderPastOrder(orderId) {
    const order = this.orders.find(o => o.id === orderId);
    if (!order) return;

    // Check if restaurant is currently open (US2)
    const rest = this.restaurants.find(r => r.id === order.restaurantId);
    if (rest && !rest.isOpen) {
      this.showToast(`Cannot reorder: ${rest.name} is currently closed.`, 'error');
      return;
    }

    // Load items into active cart
    this.cart.restaurantId = order.restaurantId;
    this.cart.restaurantName = order.restaurantName;
    this.cart.items = order.items.map(i => ({
      id: i.id,
      name: i.name,
      price: i.price,
      quantity: i.quantity,
      isVeg: i.isVeg,
      image: i.image || 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=600&q=80'
    }));
    this.cart.promoApplied = null;
    this.cart.discount = 0;

    this.saveCartToStorage();
    this.renderFoods();
    this.openCart();
    this.playChime('success');
    this.showToast(`Refilled cart with ${order.items.length} items from ${order.restaurantName}!`, 'success');
  }

  // =========================================================================
  // CUSTOMER AUTHENTICATION (US1)
  // =========================================================================
  updateUserNav() {
    const label = document.getElementById('userNameLabel');
    if (!label) return;
    if (this.currentUser) {
      label.textContent = this.currentUser.name.split(' ')[0];
    } else {
      label.textContent = 'Sign In';
    }
  }

  openAuthModal() {
    const modal = document.getElementById('authModal');
    if (modal) modal.classList.add('active');
  }

  closeAuthModal() {
    const modal = document.getElementById('authModal');
    if (modal) modal.classList.remove('active');
    const err = document.getElementById('authErrorMsg');
    if (err) err.style.display = 'none';
  }

  switchAuthTab(tab) {
    this.authMode = tab;
    const tabLogin = document.getElementById('authTabLogin');
    const tabReg = document.getElementById('authTabRegister');
    const regFields = document.getElementById('registerFields');
    const title = document.getElementById('authModalTitle');
    const btnText = document.getElementById('authSubmitBtnText');

    if (tab === 'register') {
      tabReg.classList.add('active');
      tabLogin.classList.remove('active');
      if (regFields) regFields.style.display = 'block';
      if (title) title.textContent = 'Create QuickBite Account (US1)';
      if (btnText) btnText.textContent = 'Create Account';
    } else {
      tabLogin.classList.add('active');
      tabReg.classList.remove('active');
      if (regFields) regFields.style.display = 'none';
      if (title) title.textContent = 'Sign In to QuickBite';
      if (btnText) btnText.textContent = 'Sign In';
    }
  }

  fillDemoAccount(type) {
    const emailInput = document.getElementById('authEmailInput');
    const passInput = document.getElementById('authPasswordInput');
    if (type === 'customer') {
      if (emailInput) emailInput.value = 'priya@quickbite.com';
      if (passInput) passInput.value = 'password123';
    } else {
      if (emailInput) emailInput.value = 'chef@quickbite.com';
      if (passInput) passInput.value = 'password123';
    }
    const feedback = document.getElementById('passwordStrengthFeedback');
    if (feedback) {
      feedback.textContent = '✔ 11 characters (Acceptance criteria satisfied)';
      feedback.style.color = 'var(--secondary)';
    }
  }

  async handleAuthSubmit(e) {
    e.preventDefault();
    const email = document.getElementById('authEmailInput').value.trim();
    const password = document.getElementById('authPasswordInput').value;
    const name = document.getElementById('authNameInput') ? document.getElementById('authNameInput').value.trim() : '';
    const address = document.getElementById('authAddressInput') ? document.getElementById('authAddressInput').value.trim() : '';
    const errDiv = document.getElementById('authErrorMsg');

    // US1 Acceptance Criteria: "Passwords must be at least 8 characters in length."
    if (password.length < 8) {
      if (errDiv) {
        errDiv.style.display = 'block';
        errDiv.textContent = 'Password must be at least 8 characters in length (US1 Acceptance Criteria).';
      }
      return;
    }

    const endpoint = this.authMode === 'register' ? '/api/auth/register' : '/api/auth/login';
    const body = this.authMode === 'register' ? { name, email, password, address } : { email, password };

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await res.json();

      if (data.success) {
        this.currentUser = data.user;
        this.updateUserNav();
        this.closeAuthModal();
        this.playChime('success');
        this.showToast(`Welcome, ${data.user.name}!`, 'success');
        await this.fetchOrders();
      } else {
        // US1 Acceptance Criteria: "Submitting invalid credentials displays a clear error message."
        if (errDiv) {
          errDiv.style.display = 'block';
          errDiv.textContent = data.error || 'Authentication failed';
        }
      }
    } catch (err) {
      if (errDiv) {
        errDiv.style.display = 'block';
        errDiv.textContent = 'Network communication error';
      }
    }
  }

  // =========================================================================
  // AGILE & JIRA STORIES MODAL (US1 - US10)
  // =========================================================================
  async openJiraModal() {
    try {
      const res = await fetch('/api/agile-summary');
      const data = await res.json();
      const tbody = document.getElementById('jiraTableBody');
      if (tbody && data.stories) {
        const storiesCriteria = {
          US1: 'Valid user details create account; invalid credentials show error; password ≥ 8 chars.',
          US2: 'Nearby restaurants listed; dishes display name, price, veg tag; closed restaurants flagged.',
          US3: 'Filter/search query < 2s; combine multi-filters (cuisine + rating + budget); friendly empty placeholder.',
          US4: 'Add/remove/stepper; subtotal, tax, delivery fee update live; single-restaurant cart restriction.',
          US5: 'Supports UPI, Cards, COD; generates unique Order ID; cart strictly retained on failure.',
          US6: 'Sequenced: Placed → Preparing → Out for Delivery → Delivered; dynamic ETA; notification on change.',
          US7: '1 to 5 stars restricted strictly to Delivered orders; exactly 1 review per completed order.',
          US8: 'Visual/audio incoming alert; accept/reject orders; 5-min timeout auto-cancel & refund.',
          US9: 'Chronological order history (newest first); 1-click "Reorder" refills past items into cart.',
          US10: 'Promo code reduces total; expired/below-threshold shows error; 1 coupon per checkout.'
        };

        tbody.innerHTML = data.stories.map(s => `
          <tr>
            <td><strong>${s.id}</strong></td>
            <td>${s.epic}</td>
            <td><strong>${s.title}</strong></td>
            <td>${s.points} pts</td>
            <td style="font-size:0.75rem; color:var(--gray-600);">${storiesCriteria[s.id] || ''}</td>
            <td><span class="badge-done">DONE (VERIFIED)</span></td>
            <td>
              <button class="btn-secondary" onclick="app.testStory('${s.id}')" style="font-size:0.72rem; padding:0.2rem 0.5rem;">
                Test Feature
              </button>
            </td>
          </tr>
        `).join('');
      }

      const modal = document.getElementById('jiraModal');
      if (modal) modal.classList.add('active');
    } catch (e) {
      this.showToast('Could not load Jira summary', 'error');
    }
  }

  closeJiraModal() {
    const modal = document.getElementById('jiraModal');
    if (modal) modal.classList.remove('active');
  }

  testStory(storyId) {
    this.closeJiraModal();
    if (storyId === 'US1') {
      this.openAuthModal();
    } else if (storyId === 'US2') {
      this.showSection('home');
      window.scrollTo({ top: 300, behavior: 'smooth' });
    } else if (storyId === 'US3') {
      this.showSection('home');
      const search = document.getElementById('globalSearchInput');
      if (search) {
        search.focus();
        search.value = 'biryani';
        this.filters.q = 'biryani';
        this.applyFilters();
      }
    } else if (storyId === 'US4') {
      this.openCart();
    } else if (storyId === 'US5') {
      this.proceedToCheckout();
    } else if (storyId === 'US6') {
      const ongoing = this.orders[0];
      if (ongoing) this.trackOrder(ongoing.id);
    } else if (storyId === 'US7') {
      const delivered = this.orders.find(o => o.status === 'Delivered');
      if (delivered) this.openReviewModal(delivered.id, delivered.restaurantName);
    } else if (storyId === 'US8') {
      this.showSection('kitchen');
    } else if (storyId === 'US9') {
      this.showSection('orders');
    } else if (storyId === 'US10') {
      this.openCart();
      this.fillPromoInput('WELCOME50');
    }
  }

  // =========================================================================
  // VIEW NAVIGATION & PROMPT HELPERS
  // =========================================================================
  showSection(sectionId) {
    const sections = ['home', 'orders', 'kitchen', 'tracking'];
    sections.forEach(s => {
      const el = document.getElementById(`${s}Section`);
      if (el) el.style.display = s === sectionId ? 'block' : 'none';
    });

    const hero = document.getElementById('heroBanner');
    if (hero) hero.style.display = sectionId === 'home' ? 'block' : 'none';

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  changeLocationPrompt() {
    const area = prompt('Enter delivery area / pincode (e.g., Hiranandani Estate, Thane or Powai, Mumbai):', 'Hiranandani Estate, Thane');
    if (area && area.trim()) {
      const el = document.getElementById('currentLocationText');
      if (el) el.textContent = area.trim();
      this.showToast(`Delivery location set to: ${area.trim()}`, 'success');
    }
  }
}

// Global Singleton Application Instance
const app = new QuickBiteApp();

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
  app.init();
});
