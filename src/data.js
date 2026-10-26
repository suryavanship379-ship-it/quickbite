// Initial mock dataset for QuickBite Food Delivery Application
// Supports all 10 Agile User Stories (US1 - US10)

const INITIAL_RESTAURANTS = [
  {
    id: 'rest-1',
    name: 'Spice Symphony',
    cuisine: 'North Indian',
    cuisines: ['North Indian', 'Mughlai', 'Biryani'],
    rating: 4.6,
    ratingCount: 1420,
    deliveryTimeMinutes: 25,
    costForTwo: 350,
    isOpen: true,
    image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=600&q=80',
    banner: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80',
    address: 'Shop 12, Heritage Galleria, Central Avenue',
    distanceKm: 1.8,
    isVegOnly: false
  },
  {
    id: 'rest-2',
    name: 'Bella Italia Trattoria',
    cuisine: 'Italian',
    cuisines: ['Italian', 'Pizza', 'Pasta'],
    rating: 4.8,
    ratingCount: 980,
    deliveryTimeMinutes: 30,
    costForTwo: 450,
    isOpen: true,
    image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=600&q=80',
    banner: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80',
    address: '45 Bella Vista Lane, Lake Promenade',
    distanceKm: 2.4,
    isVegOnly: false
  },
  {
    id: 'rest-3',
    name: 'Dragon Wok Express',
    cuisine: 'Chinese',
    cuisines: ['Chinese', 'Asian', 'Noodles'],
    rating: 4.3,
    ratingCount: 750,
    deliveryTimeMinutes: 20,
    costForTwo: 280,
    isOpen: true,
    image: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=600&q=80',
    banner: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=1200&q=80',
    address: 'Floor 2, Phoenix Walk, Sector 9',
    distanceKm: 3.1,
    isVegOnly: false
  },
  {
    id: 'rest-4',
    name: 'Burger Barn & Brew',
    cuisine: 'American',
    cuisines: ['American', 'Burgers', 'Fast Food'],
    rating: 4.5,
    ratingCount: 1890,
    deliveryTimeMinutes: 20,
    costForTwo: 220,
    isOpen: true,
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80',
    banner: 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=1200&q=80',
    address: '10 High Street Cross, Near Metro Station',
    distanceKm: 1.2,
    isVegOnly: false
  },
  {
    id: 'rest-5',
    name: 'Royal Nizami Biryani',
    cuisine: 'Biryani',
    cuisines: ['Biryani', 'Hyderabadi', 'Kebabs'],
    rating: 4.7,
    ratingCount: 2310,
    deliveryTimeMinutes: 35,
    costForTwo: 400,
    isOpen: true,
    image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=600&q=80',
    banner: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=1200&q=80',
    address: 'Palace Road, Old Fort Market',
    distanceKm: 4.0,
    isVegOnly: false
  },
  {
    id: 'rest-6',
    name: 'Green Leaf Pure Veg',
    cuisine: 'Healthy',
    cuisines: ['Healthy', 'South Indian', 'Pure Veg'],
    rating: 4.4,
    ratingCount: 620,
    deliveryTimeMinutes: 25,
    costForTwo: 200,
    isOpen: true,
    image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80',
    banner: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=1200&q=80',
    address: 'Temple Crossway, Gandhi Nagar',
    distanceKm: 1.5,
    isVegOnly: true
  },
  {
    id: 'rest-7',
    name: 'Midnight Munchies & Shakes',
    cuisine: 'Desserts',
    cuisines: ['Desserts', 'Shakes', 'Late Night'],
    rating: 4.2,
    ratingCount: 310,
    deliveryTimeMinutes: 45,
    costForTwo: 250,
    isOpen: false, // Explicitly closed for US2 Acceptance Criteria: "Currently closed restaurants are clearly flagged as unavailable"
    closedReason: 'Opens at 11:00 PM for late night orders',
    image: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=600&q=80',
    banner: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=1200&q=80',
    address: 'Night Market Hub, Outer Ring Road',
    distanceKm: 5.2,
    isVegOnly: false
  }
];

const INITIAL_FOOD_ITEMS = [
  // Spice Symphony (rest-1)
  {
    id: 'food-101',
    restaurantId: 'rest-1',
    restaurantName: 'Spice Symphony',
    name: 'Butter Chicken & Garlic Naan Combo',
    description: 'Tender tandoori chicken simmered in rich creamy tomato butter gravy, served with 2 hot garlic naans.',
    price: 320,
    isVeg: false,
    category: 'Main Course',
    cuisine: 'North Indian',
    rating: 4.8,
    ratingCount: 520,
    image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'food-102',
    restaurantId: 'rest-1',
    restaurantName: 'Spice Symphony',
    name: 'Paneer Tikka Masala',
    description: 'Char-grilled cottage cheese cubes cooked in spiced onion-tomato gravy with bell peppers.',
    price: 270,
    isVeg: true,
    category: 'Main Course',
    cuisine: 'North Indian',
    rating: 4.6,
    ratingCount: 340,
    image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'food-103',
    restaurantId: 'rest-1',
    restaurantName: 'Spice Symphony',
    name: 'Dal Makhani Special',
    description: 'Slow-cooked black lentils simmered overnight with fresh cream and butter.',
    price: 210,
    isVeg: true,
    category: 'Main Course',
    cuisine: 'North Indian',
    rating: 4.7,
    ratingCount: 410,
    image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'food-104',
    restaurantId: 'rest-1',
    restaurantName: 'Spice Symphony',
    name: 'Tandoori Murgh (Half)',
    description: 'Juicy chicken roasted in clay oven marinated with hung curd and freshly ground spices.',
    price: 290,
    isVeg: false,
    category: 'Starters',
    cuisine: 'North Indian',
    rating: 4.5,
    ratingCount: 230,
    image: 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?auto=format&fit=crop&w=600&q=80'
  },

  // Bella Italia (rest-2)
  {
    id: 'food-201',
    restaurantId: 'rest-2',
    restaurantName: 'Bella Italia Trattoria',
    name: 'Woodfired Margherita Pizza',
    description: 'San Marzano tomato sauce, fresh buffalo mozzarella, fragrant basil leaves and extra virgin olive oil.',
    price: 360,
    isVeg: true,
    category: 'Pizza',
    cuisine: 'Italian',
    rating: 4.9,
    ratingCount: 680,
    image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'food-202',
    restaurantId: 'rest-2',
    restaurantName: 'Bella Italia Trattoria',
    name: 'Creamy Fettuccine Alfredo',
    description: 'Handmade fettuccine pasta tossed in rich parmesan cream sauce, cracked black pepper and parsley.',
    price: 340,
    isVeg: true,
    category: 'Pasta',
    cuisine: 'Italian',
    rating: 4.7,
    ratingCount: 420,
    image: 'https://images.unsplash.com/photo-1645112411341-6c4fd023714a?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'food-203',
    restaurantId: 'rest-2',
    restaurantName: 'Bella Italia Trattoria',
    name: 'Spicy Pepperoni & Jalapeno Pizza',
    description: 'Crispy crust loaded with sliced artisan cured pepperoni, pickled jalapenos, and melted mozzarella.',
    price: 430,
    isVeg: false,
    category: 'Pizza',
    cuisine: 'Italian',
    rating: 4.8,
    ratingCount: 510,
    image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'food-204',
    restaurantId: 'rest-2',
    restaurantName: 'Bella Italia Trattoria',
    name: 'Tiramisu Classico',
    description: 'Authentic Italian dessert made with espresso-soaked ladyfingers and whipped mascarpone cream.',
    price: 220,
    isVeg: true,
    category: 'Desserts',
    cuisine: 'Italian',
    rating: 4.9,
    ratingCount: 390,
    image: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?auto=format&fit=crop&w=600&q=80'
  },

  // Dragon Wok (rest-3)
  {
    id: 'food-301',
    restaurantId: 'rest-3',
    restaurantName: 'Dragon Wok Express',
    name: 'Schezwan Hakka Noodles (Chicken)',
    description: 'Wok-tossed noodles with shredded chicken, crunchy scallions, bell peppers, and spicy Schezwan sauce.',
    price: 240,
    isVeg: false,
    category: 'Noodles',
    cuisine: 'Chinese',
    rating: 4.4,
    ratingCount: 490,
    image: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'food-302',
    restaurantId: 'rest-3',
    restaurantName: 'Dragon Wok Express',
    name: 'Crispy Veg Spring Rolls (6 pcs)',
    description: 'Golden fried crispy rolls filled with seasoned shredded vegetables, served with sweet chili dip.',
    price: 180,
    isVeg: true,
    category: 'Starters',
    cuisine: 'Chinese',
    rating: 4.5,
    ratingCount: 310,
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'food-303',
    restaurantId: 'rest-3',
    restaurantName: 'Dragon Wok Express',
    name: 'Chili Paneer Gravy',
    description: 'Crispy cottage cheese wok-tossed with green capsicum, onion pearls, soy sauce, and green chillies.',
    price: 230,
    isVeg: true,
    category: 'Main Course',
    cuisine: 'Chinese',
    rating: 4.3,
    ratingCount: 260,
    image: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'food-304',
    restaurantId: 'rest-3',
    restaurantName: 'Dragon Wok Express',
    name: 'Steamed Chicken Momos (8 pcs)',
    description: 'Delicate Himalayan steamed dumplings stuffed with minced juicy spiced chicken and garlic chutney.',
    price: 190,
    isVeg: false,
    category: 'Starters',
    cuisine: 'Chinese',
    rating: 4.6,
    ratingCount: 420,
    image: 'https://images.unsplash.com/photo-1625398407796-82650a8c135f?auto=format&fit=crop&w=600&q=80'
  },

  // Burger Barn (rest-4)
  {
    id: 'food-401',
    restaurantId: 'rest-4',
    restaurantName: 'Burger Barn & Brew',
    name: 'Smoky BBQ Smash Bacon Cheeseburger',
    description: 'Double grilled beef-style patty with melted cheddar, smoky BBQ sauce, crispy onions, and pickle relish.',
    price: 260,
    isVeg: false,
    category: 'Burgers',
    cuisine: 'American',
    rating: 4.7,
    ratingCount: 880,
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'food-402',
    restaurantId: 'rest-4',
    restaurantName: 'Burger Barn & Brew',
    name: 'Crispy Truffle Veggie Burger',
    description: 'Golden spiced potato & corn crisp patty topped with truffle mayo, tomato, and butterhead lettuce.',
    price: 190,
    isVeg: true,
    category: 'Burgers',
    cuisine: 'American',
    rating: 4.4,
    ratingCount: 430,
    image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'food-403',
    restaurantId: 'rest-4',
    restaurantName: 'Burger Barn & Brew',
    name: 'Loaded Peri-Peri Crinkle Fries',
    description: 'Crispy crinkle-cut fries dusted with fiery peri-peri seasoning and drizzled with warm cheese sauce.',
    price: 140,
    isVeg: true,
    category: 'Sides',
    cuisine: 'American',
    rating: 4.6,
    ratingCount: 610,
    image: 'https://images.unsplash.com/photo-1576107232684-1279f3908594?auto=format&fit=crop&w=600&q=80'
  },

  // Royal Nizami Biryani (rest-5)
  {
    id: 'food-501',
    restaurantId: 'rest-5',
    restaurantName: 'Royal Nizami Biryani',
    name: 'Hyderabadi Chicken Dum Biryani',
    description: 'Long grain aged basmati rice layered with aromatic saffron spices and succulent bone-in chicken. Served with mirchi ka salan & raita.',
    price: 310,
    isVeg: false,
    category: 'Biryani',
    cuisine: 'Biryani',
    rating: 4.9,
    ratingCount: 1250,
    image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'food-502',
    restaurantId: 'rest-5',
    restaurantName: 'Royal Nizami Biryani',
    name: 'Nawabi Paneer Dum Biryani',
    description: 'Fragrant saffron basmati rice layered with marinated paneer tikka, fried brown onions, mint, and desi ghee.',
    price: 260,
    isVeg: true,
    category: 'Biryani',
    cuisine: 'Biryani',
    rating: 4.6,
    ratingCount: 540,
    image: 'https://images.unsplash.com/photo-1642821373181-696a54913e93?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'food-503',
    restaurantId: 'rest-5',
    restaurantName: 'Royal Nizami Biryani',
    name: 'Galouti Kebab with Roomali Roti (4 pcs)',
    description: 'Melt-in-mouth smoked minced mutton kebabs served with flaky paper-thin roomali rotis and mint dip.',
    price: 340,
    isVeg: false,
    category: 'Starters',
    cuisine: 'Biryani',
    rating: 4.8,
    ratingCount: 480,
    image: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?auto=format&fit=crop&w=600&q=80'
  },

  // Green Leaf Pure Veg (rest-6)
  {
    id: 'food-601',
    restaurantId: 'rest-6',
    restaurantName: 'Green Leaf Pure Veg',
    name: 'Mysore Masala Butter Dosa',
    description: 'Crisp golden crepe smeared with spicy garlic red chutney and stuffed with seasoned potato masala.',
    price: 150,
    isVeg: true,
    category: 'South Indian',
    cuisine: 'Healthy',
    rating: 4.7,
    ratingCount: 510,
    image: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'food-602',
    restaurantId: 'rest-6',
    restaurantName: 'Green Leaf Pure Veg',
    name: 'Steamed Idli Sambar Platter (3 pcs)',
    description: 'Soft pillow-like steamed rice cakes served with piping hot piping drumstick sambar and fresh coconut chutney.',
    price: 110,
    isVeg: true,
    category: 'South Indian',
    cuisine: 'Healthy',
    rating: 4.5,
    ratingCount: 320,
    image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'food-603',
    restaurantId: 'rest-6',
    restaurantName: 'Green Leaf Pure Veg',
    name: 'Quinoa & Avocado Superfood Salad',
    description: 'Organic tri-color quinoa, ripe avocado, cherry tomatoes, baby spinach, and lemon-herb vinaigrette.',
    price: 240,
    isVeg: true,
    category: 'Healthy',
    cuisine: 'Healthy',
    rating: 4.6,
    ratingCount: 190,
    image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80'
  },

  // Midnight Munchies (rest-7 - Currently Closed)
  {
    id: 'food-701',
    restaurantId: 'rest-7',
    restaurantName: 'Midnight Munchies & Shakes',
    name: 'Death by Chocolate Brownie Sundae',
    description: 'Fudgy warm walnut brownie crowned with double scoops of Belgian chocolate gelato and hot fudge.',
    price: 210,
    isVeg: true,
    category: 'Desserts',
    cuisine: 'Desserts',
    rating: 4.7,
    ratingCount: 220,
    image: 'https://images.unsplash.com/photo-1579954115545-a95591f28bfc?auto=format&fit=crop&w=600&q=80'
  }
];

const INITIAL_PROMO_CODES = [
  {
    code: 'WELCOME50',
    type: 'flat',
    discountAmount: 50,
    minOrderValue: 199,
    description: 'Flat ₹50 OFF on orders above ₹199 (New Users)',
    isActive: true
  },
  {
    code: 'QUICKBITE20',
    type: 'percent',
    percentage: 20,
    maxDiscount: 100,
    minOrderValue: 299,
    description: '20% OFF up to ₹100 on orders above ₹299',
    isActive: true
  },
  {
    code: 'TASTY10',
    type: 'percent',
    percentage: 10,
    maxDiscount: 150,
    minOrderValue: 400,
    description: '10% OFF up to ₹150 on orders above ₹400',
    isActive: true
  },
  {
    code: 'EXPIRED30',
    type: 'flat',
    discountAmount: 30,
    minOrderValue: 150,
    description: 'Expired test coupon',
    isActive: false // For US10 testing expired code
  }
];

const INITIAL_USERS = [
  {
    id: 'user-1',
    name: 'Priya Suryavanshi',
    email: 'priya@quickbite.com',
    password: 'password123',
    role: 'customer',
    phone: '+91 98765 43210',
    address: 'Flat 402, Sunshine Heights, Hiranandani Estate, Thane, Maharashtra'
  },
  {
    id: 'user-2',
    name: 'Chef Vikram (Spice Symphony)',
    email: 'chef@quickbite.com',
    password: 'password123',
    role: 'restaurant_owner',
    restaurantId: 'rest-1',
    phone: '+91 98111 22233',
    address: 'Shop 12, Heritage Galleria, Central Avenue'
  }
];

const INITIAL_ORDERS = [
  {
    id: 'QB-981240',
    userId: 'user-1',
    restaurantId: 'rest-1',
    restaurantName: 'Spice Symphony',
    items: [
      { id: 'food-101', name: 'Butter Chicken & Garlic Naan Combo', price: 320, quantity: 1, isVeg: false },
      { id: 'food-103', name: 'Dal Makhani Special', price: 210, quantity: 1, isVeg: true }
    ],
    itemCount: 2,
    subtotal: 530,
    tax: 26.5,
    deliveryFee: 0,
    discount: 50,
    promoApplied: 'WELCOME50',
    total: 506.5,
    status: 'Delivered', // Delivered allows US7 review & US9 reorder
    paymentMethod: 'UPI (Google Pay)',
    deliveryAddress: 'Flat 402, Sunshine Heights, Hiranandani Estate, Thane, Maharashtra',
    createdAt: new Date(Date.now() - 3600000 * 24 * 2).toISOString(), // 2 days ago
    deliveredAt: new Date(Date.now() - 3600000 * 24 * 2 + 1800000).toISOString(),
    etaMinutes: 0,
    review: {
      rating: 5,
      comment: 'Authentic rich gravy and warm garlic naans! Super fast delivery.',
      reviewedAt: new Date(Date.now() - 3600000 * 24 * 2 + 3600000).toISOString()
    }
  },
  {
    id: 'QB-847291',
    userId: 'user-1',
    restaurantId: 'rest-2',
    restaurantName: 'Bella Italia Trattoria',
    items: [
      { id: 'food-201', name: 'Woodfired Margherita Pizza', price: 360, quantity: 1, isVeg: true }
    ],
    itemCount: 1,
    subtotal: 360,
    tax: 18,
    deliveryFee: 40,
    discount: 0,
    promoApplied: null,
    total: 418,
    status: 'Delivered',
    paymentMethod: 'Credit Card',
    deliveryAddress: 'Flat 402, Sunshine Heights, Hiranandani Estate, Thane, Maharashtra',
    createdAt: new Date(Date.now() - 3600000 * 24 * 5).toISOString(),
    deliveredAt: new Date(Date.now() - 3600000 * 24 * 5 + 2100000).toISOString(),
    etaMinutes: 0,
    review: null // Ready for US7 rating submission!
  }
];

module.exports = {
  INITIAL_RESTAURANTS,
  INITIAL_FOOD_ITEMS,
  INITIAL_PROMO_CODES,
  INITIAL_USERS,
  INITIAL_ORDERS
};
