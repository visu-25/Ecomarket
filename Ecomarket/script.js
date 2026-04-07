// Demo products (bundled). Admin-added products load from /api/products/ and are merged on startup.
const STATIC_PRODUCTS = [
    {
        id: 1,
        name: "Bamboo Toothbrush Set",
        description: "100% biodegradable bamboo toothbrushes with soft bristles",
        price: 299,
        emoji: "🪥",
        image: "https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?w=500&h=500&fit=crop",
        category: "Personal Care"
    },
    {
        id: 2,
        name: "Reusable Cotton Shopping Bags",
        description: "Eco-friendly cotton bags, set of 5, washable and durable",
        price: 499,
        emoji: "🛍️",
        image: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=500&h=500&fit=crop",
        category: "Accessories"
    },
    {
        id: 3,
        name: "Stainless Steel Water Bottle",
        description: "BPA-free, leak-proof, keeps drinks cold for 24 hours",
        price: 799,
        emoji: "💧",
        image: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=500&h=500&fit=crop",
        category: "Kitchen"
    },
    {
        id: 4,
        name: "Organic Cotton T-Shirt",
        description: "100% organic cotton, fair trade, multiple colors available",
        price: 899,
        emoji: "👕",
        image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&h=500&fit=crop",
        category: "Clothing"
    },
    {
        id: 5,
        name: "Bamboo Cutting Board",
        description: "Natural bamboo, antimicrobial, easy to clean",
        price: 1299,
        emoji: "🪵",
        image: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=500&h=500&fit=crop",
        category: "Kitchen"
    },
    {
        id: 7,
        name: "Compostable Phone Case",
        description: "Biodegradable phone case, protects your device",
        price: 599,
        emoji: "📱",
        image: "https://images.unsplash.com/photo-1556656793-08538906a9f8?w=500&h=500&fit=crop",
        category: "Electronics"
    },
    {
        id: 8,
        name: "Hemp Yoga Mat",
        description: "Natural hemp fiber, non-slip, eco-friendly",
        price: 1999,
        emoji: "🧘",
        image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=500&h=500&fit=crop",
        category: "Fitness"
    },
    {
        id: 9,
        name: "Beeswax Food Wraps",
        description: "Reusable alternative to plastic wrap, set of 3",
        price: 699,
        emoji: "🍯",
        image: "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=500&h=500&fit=crop",
        category: "Kitchen"
    },
    {
        id: 10,
        name: "Organic Face Cleanser",
        description: "Natural ingredients, cruelty-free, suitable for all skin types",
        price: 449,
        emoji: "🧴",
        image: "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=500&h=500&fit=crop",
        category: "Personal Care"
    },
    {
        id: 11,
        name: "Bamboo Straws Set",
        description: "Reusable bamboo straws with cleaning brush, set of 6",
        price: 349,
        emoji: "🥤",
        image: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=500&h=500&fit=crop",
        category: "Kitchen"
    },
    {
        id: 12,
        name: "Recycled Paper Notebook",
        description: "Made from 100% recycled paper, 200 pages",
        price: 249,
        emoji: "📓",
        image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500&h=500&fit=crop",
        category: "Stationery"
    },
    {
        id: 13,
        name: "Coconut Fiber Scrubber",
        description: "Natural coconut fiber, perfect for cleaning dishes",
        price: 199,
        emoji: "🌴",
        image: "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=500&h=500&fit=crop",
        category: "Kitchen"
    },
    {
        id: 14,
        name: "Organic Cotton Towels",
        description: "Set of 2 bath towels, soft and absorbent",
        price: 1299,
        emoji: "🛁",
        image: "https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=500&h=500&fit=crop",
        category: "Home & Garden"
    },
    {
        id: 15,
        name: "Wooden Hair Brush",
        description: "Natural wood bristles, reduces frizz, promotes shine",
        price: 599,
        emoji: "🪮",
        image: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=500&h=500&fit=crop",
        category: "Personal Care"
    }
];

/** Merged list: static first, then active DB products (ids >= 100000). */
let products = [];

const filterState = {
    category: '',
    priceMin: null,
    priceMax: null,
};

const PRICE_PRESETS = [
    { label: 'Any price', min: null, max: null },
    { label: 'Under ₹500', min: null, max: 499 },
    { label: '₹500 – ₹1,000', min: 500, max: 1000 },
    { label: '₹1,000 – ₹2,000', min: 1000, max: 2000 },
    { label: 'Above ₹2,000', min: 2000, max: null },
];

async function loadAndMergeProducts() {
    products = [...STATIC_PRODUCTS];
    try {
        const response = await fetch('/api/products/');
        if (!response.ok) return;
        const fromDb = await response.json();
        if (Array.isArray(fromDb)) {
            products = [...STATIC_PRODUCTS, ...fromDb];
        }
    } catch (e) {
        console.warn('Could not load products from server:', e);
    }
}

/** Text / alt attributes: avoid breaking HTML and XSS from names or descriptions. */
function escapeHtmlAttr(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

/** Image URLs only: fix `&` in query strings; do not encode `<`/`>` (valid in rare URLs). */
function escapeUrlForHtmlAttr(url) {
    return String(url)
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function escapeHtml(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

const PAYMENT_LABELS = {
    cod: 'Cash on delivery (COD)',
    card: 'Credit / debit card',
    upi: 'UPI',
    netbanking: 'Net banking',
    wallet: 'Wallet',
};

/** @type {Array<object>} */
let checkoutAddressesCache = [];
let checkoutSelectedAddressId = null;

// Initialize cart from localStorage
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// Logged-in user comes from Django session (/api/me/)
let currentUser = null;

async function loadMe() {
    try {
        const res = await fetch('/api/me/', { credentials: 'include' });
        const data = await res.json();
        if (data && data.authenticated) {
            currentUser = {
                name: data.name,
                email: data.email,
                phone: data.phone || '',
            };
        } else {
            currentUser = null;
        }
    } catch (e) {
        // If the API fails, treat user as logged out (don't break the page).
        currentUser = null;
    }
}

async function apiLogout() {
    try {
        await fetch('/api/logout/', { method: 'POST', credentials: 'include' });
    } catch (e) {
        // Ignore logout failures; we'll clear local state anyway.
    }
}

// Update cart count on all pages
function updateCartCount() {
    const cartCountElements = document.querySelectorAll('#cart-count');
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCountElements.forEach(el => {
        if (el) el.textContent = totalItems;
    });
}

// Save cart to localStorage
function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
}

// Add to cart
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const existingItem = cart.find(item => item.id === productId);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            emoji: product.emoji,
            image: product.image,
            quantity: 1
        });
    }
    saveCart();
    alert(`${product.name} added to cart!`);
}

// Buy Now - Add to cart and redirect to cart page
function buyNow(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    // Add to cart first
    const existingItem = cart.find(item => item.id === productId);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            emoji: product.emoji,
            image: product.image,
            quantity: 1
        });
    }
    saveCart();

    // Check if user is logged in before redirecting
    if (!currentUser) {
        if (confirm('Please login to proceed with purchase. Would you like to login now?')) {
            window.location.href = '/login/';
            return;
        }
    }

    // Redirect to cart page
    window.location.href = '/cart/';
}

// View product details
function viewProductDetails(productId) {
    window.location.href = `/product-details/?id=${productId}`;
}

// Display product details
function displayProductDetails() {
    const productDetails = document.getElementById('product-details');
    if (!productDetails) return;

    // Get product ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const productId = parseInt(urlParams.get('id'));

    if (!productId) {
        productDetails.innerHTML = '<p>Product not found. <a href="/">Go back to products</a></p>';
        return;
    }

    const product = products.find(p => p.id === productId);
    if (!product) {
        productDetails.innerHTML = '<p>Product not found. <a href="/">Go back to products</a></p>';
        return;
    }

    productDetails.innerHTML = `
        <div class="product-details-wrapper">
            <div class="product-details-image">
                <img src="${escapeUrlForHtmlAttr(product.image)}" alt="${escapeHtmlAttr(product.name)}" onerror="this.onerror=null; this.parentElement.innerHTML='<div style=\\'font-size: 8rem;\\'>${product.emoji}</div>'">
            </div>
            <div class="product-details-info">
                <h1 class="product-details-name">${escapeHtmlAttr(product.name)}</h1>
                <div class="product-details-category">Category: ${escapeHtmlAttr(product.category)}</div>
                <div class="product-details-price">₹${product.price}</div>
                <div class="product-details-description">
                    <h3>Description</h3>
                    <p>${escapeHtmlAttr(product.description)}</p>
                </div>
                <div class="product-details-features">
                    <h3>Features</h3>
                    <ul>
                        <li>100% Eco-friendly and sustainable</li>
                        <li>High quality materials</li>
                        <li>Environmentally conscious packaging</li>
                        <li>Certified organic where applicable</li>
                    </ul>
                </div>
                <div class="product-details-actions">
                    <button class="btn-primary btn-large" onclick="addToCart(${product.id})">Add to Cart</button>
                    <button class="btn-secondary btn-large" onclick="buyNow(${product.id})">Buy Now</button>
                </div>
                <div class="product-details-shipping">
                    <h3>Shipping & Returns</h3>
                    <p>✓ Free shipping on orders above ₹500</p>
                    <p>✓ 7-day return policy</p>
                    <p>✓ Secure packaging</p>
                </div>
            </div>
        </div>
    `;
}

// Remove from cart
function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCart();
    if (window.location.pathname.includes('/cart/')) {
        displayCart();
    }
}

// Update quantity
function updateQuantity(productId, change) {
    const item = cart.find(item => item.id === productId);
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
            removeFromCart(productId);
        } else {
            saveCart();
            if (window.location.pathname.includes('/cart/')) {
                displayCart();
            }
        }
    }
}

// Display products
function displayProducts(filteredProducts = products) {
    const productsGrid = document.getElementById('products-grid');
    if (!productsGrid) return;

    if (filteredProducts.length === 0) {
        productsGrid.innerHTML = '<p style="text-align: center; grid-column: 1/-1; padding: 2rem;">No products found matching your search.</p>';
        return;
    }

    productsGrid.innerHTML = filteredProducts.map(product => `
        <div class="product-card" onclick="viewProductDetails(${product.id})">
            <div class="product-image">
                <img src="${escapeUrlForHtmlAttr(product.image)}" alt="${escapeHtmlAttr(product.name)}" onerror="this.onerror=null; this.parentElement.innerHTML='${product.emoji}'">
            </div>
            <div class="product-info">
                <div class="product-name">${escapeHtmlAttr(product.name)}</div>
                <div class="product-description">${escapeHtmlAttr(product.description)}</div>
                <div class="product-footer">
                    <div class="product-price">₹${product.price}</div>
                    <div class="product-buttons">
                        <button class="add-to-cart-btn" onclick="event.stopPropagation(); addToCart(${product.id})">Add to Cart</button>
                        <button class="buy-now-btn" onclick="event.stopPropagation(); buyNow(${product.id})">Buy Now</button>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

// Display cart
function displayCart() {
    const cartItems = document.getElementById('cart-items');
    const cartSummary = document.getElementById('cart-summary');

    if (!cartItems) return;

    if (cart.length === 0) {
        cartItems.innerHTML = `
            <div class="empty-cart">
                <div class="empty-cart-icon">🛒</div>
                <h3>Your cart is empty</h3>
                <p>Start adding eco-friendly products to your cart!</p>
                <a href="/" class="btn-primary" style="display: inline-block; text-decoration: none; margin-top: 1rem;">Continue Shopping</a>
            </div>
        `;
        if (cartSummary) {
            cartSummary.innerHTML = '';
        }
        return;
    }

    cartItems.innerHTML = cart.map(item => `
        <div class="cart-item">
            <div class="cart-item-image">
                <img src="${item.image ? escapeUrlForHtmlAttr(item.image) : 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22><text>' + item.emoji + '</text></svg>'}" alt="${escapeHtmlAttr(item.name)}" onerror="this.onerror=null; this.parentElement.innerHTML='${item.emoji}'">
            </div>
            <div class="cart-item-details">
                <div class="cart-item-name">${escapeHtmlAttr(item.name)}</div>
                <div class="cart-item-price">₹${item.price}</div>
                <div class="quantity-controls">
                    <button class="quantity-btn" onclick="updateQuantity(${item.id}, -1)">-</button>
                    <span class="quantity-display">${item.quantity}</span>
                    <button class="quantity-btn" onclick="updateQuantity(${item.id}, 1)">+</button>
                    <button class="remove-btn" onclick="removeFromCart(${item.id})">Remove</button>
                </div>
            </div>
        </div>
    `).join('');

    // Update summary
    if (cartSummary) {
        const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const total = subtotal;

        document.getElementById('subtotal').textContent = `₹${subtotal}`;
        document.getElementById('total').textContent = `₹${total}`;
    }
}

function filterBySearchQuery(list, query) {
    if (!query || query.trim() === '') {
        return list;
    }
    const lowerQuery = query.toLowerCase();
    return list.filter(product =>
        product.name.toLowerCase().includes(lowerQuery) ||
        product.description.toLowerCase().includes(lowerQuery) ||
        (product.category || '').toLowerCase().includes(lowerQuery)
    );
}

function getActiveFilteredProducts() {
    const searchInput = document.getElementById('search-input');
    const q = searchInput ? searchInput.value.trim() : '';
    let list = filterBySearchQuery(products, q);
    if (filterState.category) {
        list = list.filter(p => (p.category || 'General') === filterState.category);
    }
    const minV = filterState.priceMin;
    const maxV = filterState.priceMax;
    if (minV != null && minV !== '' && !Number.isNaN(Number(minV))) {
        const n = Number(minV);
        list = list.filter(p => Number(p.price) >= n);
    }
    if (maxV != null && maxV !== '' && !Number.isNaN(Number(maxV))) {
        const n = Number(maxV);
        list = list.filter(p => Number(p.price) <= n);
    }
    return list;
}

function updateProductsMeta(count) {
    const el = document.getElementById('products-result-meta');
    if (!el) return;
    const total = products.length;
    if (count === total) {
        el.textContent = `${total} product${total !== 1 ? 's' : ''}`;
    } else {
        el.textContent = `Showing ${count} of ${total} product${total !== 1 ? 's' : ''}`;
    }
}

function refreshProductGrid() {
    const list = getActiveFilteredProducts();
    displayProducts(list);
    updateProductsMeta(list.length);
}

function buildCategoryFilters() {
    const container = document.getElementById('filter-categories');
    if (!container) return;
    const categories = [...new Set(products.map(p => (p.category || 'General').trim() || 'General'))].sort((a, b) =>
        a.localeCompare(b)
    );
    container.replaceChildren();
    const frag = document.createDocumentFragment();

    function addRadio(value, labelText) {
        const labelEl = document.createElement('label');
        labelEl.className = 'filter-option';
        const input = document.createElement('input');
        input.type = 'radio';
        input.name = 'filter-category';
        input.value = value;
        if (value === '') input.checked = true;
        labelEl.appendChild(input);
        labelEl.appendChild(document.createTextNode(` ${labelText}`));
        frag.appendChild(labelEl);
    }

    addRadio('', 'All Categories');
    categories.forEach(cat => addRadio(cat, cat));
    container.appendChild(frag);

    container.querySelectorAll('input[name="filter-category"]').forEach(radio => {
        radio.addEventListener('change', () => {
            if (radio.checked) {
                filterState.category = radio.value;
                refreshProductGrid();
            }
        });
    });
}

function buildPricePresets() {
    const container = document.getElementById('filter-price-presets');
    if (!container) return;
    container.replaceChildren();
    const frag = document.createDocumentFragment();
    PRICE_PRESETS.forEach((preset) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'filter-chip';
        btn.textContent = preset.label;
        btn.addEventListener('click', () => {
            filterState.priceMin = preset.min;
            filterState.priceMax = preset.max;
            container.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('is-active'));
            btn.classList.add('is-active');
            const minIn = document.getElementById('price-min');
            const maxIn = document.getElementById('price-max');
            if (minIn) minIn.value = preset.min != null ? String(preset.min) : '';
            if (maxIn) maxIn.value = preset.max != null ? String(preset.max) : '';
            refreshProductGrid();
        });
        frag.appendChild(btn);
    });
    container.appendChild(frag);
}

function setupProductFilters() {
    buildCategoryFilters();
    buildPricePresets();
    const firstChip = document.querySelector('#filter-price-presets .filter-chip');
    if (firstChip) firstChip.classList.add('is-active');

    document.getElementById('price-apply-btn')?.addEventListener('click', () => {
        const minIn = document.getElementById('price-min');
        const maxIn = document.getElementById('price-max');
        let minVal = minIn && minIn.value !== '' ? Number(minIn.value) : null;
        let maxVal = maxIn && maxIn.value !== '' ? Number(maxIn.value) : null;
        if (minVal != null && Number.isNaN(minVal)) minVal = null;
        if (maxVal != null && Number.isNaN(maxVal)) maxVal = null;
        if (minVal != null && maxVal != null && minVal > maxVal) {
            const t = minVal;
            minVal = maxVal;
            maxVal = t;
            if (minIn) minIn.value = String(minVal);
            if (maxIn) maxIn.value = String(maxVal);
        }
        filterState.priceMin = minVal;
        filterState.priceMax = maxVal;
        document.querySelectorAll('#filter-price-presets .filter-chip').forEach(c => c.classList.remove('is-active'));
        refreshProductGrid();
    });

    document.getElementById('clear-filters-btn')?.addEventListener('click', () => {
        filterState.category = '';
        filterState.priceMin = null;
        filterState.priceMax = null;
        document.querySelectorAll('input[name="filter-category"]').forEach(r => {
            r.checked = r.value === '';
        });
        const minIn = document.getElementById('price-min');
        const maxIn = document.getElementById('price-max');
        if (minIn) minIn.value = '';
        if (maxIn) maxIn.value = '';
        document.querySelectorAll('#filter-price-presets .filter-chip').forEach((c, i) => {
            c.classList.toggle('is-active', i === 0);
        });
        const si = document.getElementById('search-input');
        if (si) si.value = '';
        refreshProductGrid();
    });

    const toggle = document.getElementById('filters-toggle');
    const panel = document.getElementById('filters-panel');
    const toggleText = toggle?.querySelector('.filters-toggle-text');
    toggle?.addEventListener('click', () => {
        if (!panel) return;
        const open = panel.classList.toggle('is-open');
        toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
        if (toggleText) toggleText.textContent = open ? 'Hide filters' : 'Show filters';
    });
}

function handleSearch() {
    const searchInput = document.getElementById('search-input');
    const searchBtn = document.getElementById('search-btn');
    const run = () => refreshProductGrid();
    if (searchInput && searchBtn) {
        searchBtn.addEventListener('click', run);
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') run();
        });
        searchInput.addEventListener('input', run);
    }
}

// Signup form handler
function handleSignup() {
    const signupForm = document.getElementById('signup-form');
    if (!signupForm) return;

    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const name = document.getElementById('signup-name').value;
        const email = document.getElementById('signup-email').value;
        const phone = document.getElementById('signup-phone').value;
        const password = document.getElementById('signup-password').value;
        const confirmPassword = document.getElementById('signup-confirm-password').value;
        const messageDiv = document.getElementById('signup-message');

        // Validation
        if (password !== confirmPassword) {
            messageDiv.textContent = 'Passwords do not match!';
            messageDiv.className = 'message error';
            return;
        }

        if (password.length < 6) {
            messageDiv.textContent = 'Password must be at least 6 characters!';
            messageDiv.className = 'message error';
            return;
        }

        try {
            const res = await fetch('/api/signup/', {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, phone, password })
            });

            const data = await res.json().catch(() => ({}));
            if (!res.ok) {
                messageDiv.textContent = data.error || 'Signup failed!';
                messageDiv.className = 'message error';
                return;
            }

            messageDiv.textContent = 'Account created successfully! Redirecting to login...';
            messageDiv.className = 'message success';

            setTimeout(() => {
                window.location.href = '/login/';
            }, 2000);
        } catch (err) {
            messageDiv.textContent = 'Signup failed. Please try again.';
            messageDiv.className = 'message error';
        }
    });
}

// Login form handler
function handleLogin() {
    const loginForm = document.getElementById('login-form');
    if (!loginForm) return;

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        const messageDiv = document.getElementById('login-message');

        try {
            const res = await fetch('/api/login/', {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await res.json().catch(() => ({}));
            if (!res.ok) {
                messageDiv.textContent = data.error || 'Invalid email or password!';
                messageDiv.className = 'message error';
                return;
            }

            currentUser = {
                name: data.name,
                email: data.email,
                phone: data.phone || '',
            };
            updateAuthLinks();

            messageDiv.textContent = 'Login successful! Redirecting...';
            messageDiv.className = 'message success';

            const target = getPostLoginRedirect();
            setTimeout(() => {
                window.location.href = target;
            }, 1500);
        } catch (err) {
            messageDiv.textContent = 'Login failed. Please try again.';
            messageDiv.className = 'message error';
        }
    });
}

function handleForgotPassword() {
    const forgotForm = document.getElementById('forgot-password-form');
    if (!forgotForm) return;

    forgotForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = document.getElementById('reset-email').value;
        const messageDiv = document.getElementById('reset-message');

        try {
            const res = await fetch('/api/forgot-password/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });

            const data = await res.json().catch(() => ({}));

            if (res.ok) {
                messageDiv.textContent = data.message || 'A reset link has been sent to your email!';
                messageDiv.className = 'message success';
                forgotForm.reset();
            } else {
                messageDiv.textContent = data.error || 'An error occurred. Please try again.';
                messageDiv.className = 'message error';
            }
        } catch (err) {
            // For demo purposes, we'll show success even if API fails
            messageDiv.textContent = 'A reset link has been sent to your email!';
            messageDiv.className = 'message success';
            forgotForm.reset();
        }
    });
}

function getPostLoginRedirect() {
    try {
        const params = new URLSearchParams(window.location.search);
        const next = params.get('next');
        if (next && next.startsWith('/') && !next.startsWith('//')) {
            return next;
        }
    } catch {
        /* ignore */
    }
    return '/';
}

// Update login/logout links
function updateAuthLinks() {
    const loginLink = document.getElementById('login-link');
    const signupLink = document.getElementById('signup-link');

    if (currentUser) {
        if (loginLink) {
            loginLink.textContent = `Logout (${currentUser.name})`;
            loginLink.href = '#';
            loginLink.onclick = async (e) => {
                e.preventDefault();
                await apiLogout();
                currentUser = null;
                updateAuthLinks();
                window.location.reload();
            };
        }
        if (signupLink) {
            signupLink.style.display = 'none';
        }
    } else {
        if (loginLink) {
            loginLink.textContent = 'Login';
            loginLink.href = '/login/';
            loginLink.onclick = null;
        }
        if (signupLink) {
            signupLink.style.display = '';
        }
    }
}

function showAccountMessage(text, kind) {
    const el = document.getElementById('account-message');
    if (!el) return;
    el.textContent = text;
    el.className = 'message ' + (kind === 'error' ? 'error' : 'success');
    el.style.display = 'block';
}

function hideAccountMessage() {
    const el = document.getElementById('account-message');
    if (!el) return;
    el.style.display = 'none';
    el.textContent = '';
}

function switchAccountTab(name) {
    document.querySelectorAll('.account-tab').forEach((btn) => {
        const on = btn instanceof HTMLElement && btn.dataset.tab === name;
        btn.classList.toggle('is-active', !!on);
        btn.setAttribute('aria-selected', on ? 'true' : 'false');
    });
    ['profile', 'addresses', 'orders'].forEach((id) => {
        const panel = document.getElementById(`tab-${id}`);
        if (panel) panel.classList.toggle('is-hidden', id !== name);
    });
}

function openAddressEditModal(address) {
    const modal = document.getElementById('address-edit-modal');
    if (!modal) return;
    const idEl = document.getElementById('edit-address-id');
    if (idEl instanceof HTMLInputElement) idEl.value = String(address.id);
    const setVal = (id, v) => {
        const n = document.getElementById(id);
        if (n instanceof HTMLInputElement) n.value = v;
    };
    setVal('edit-addr-label', address.label || '');
    setVal('edit-addr-full-name', address.full_name || '');
    setVal('edit-addr-line1', address.line1 || '');
    setVal('edit-addr-line2', address.line2 || '');
    setVal('edit-addr-city', address.city || '');
    setVal('edit-addr-state', address.state || '');
    setVal('edit-addr-postal', address.postal_code || '');
    setVal('edit-addr-country', address.country || 'India');
    setVal('edit-addr-phone', address.phone || '');
    const def = document.getElementById('edit-addr-is-default');
    if (def instanceof HTMLInputElement) def.checked = !!address.is_default;
    modal.classList.remove('is-hidden');
    modal.setAttribute('aria-hidden', 'false');
}

function closeAddressEditModal() {
    const modal = document.getElementById('address-edit-modal');
    if (!modal) return;
    modal.classList.add('is-hidden');
    modal.setAttribute('aria-hidden', 'true');
}

function renderAccountAddressList(addresses) {
    const container = document.getElementById('account-address-list');
    if (!container) return;
    container.replaceChildren();

    if (!addresses.length) {
        const p = document.createElement('p');
        p.className = 'field-hint';
        p.textContent = 'You have no saved addresses yet. Add one below.';
        container.appendChild(p);
        return;
    }

    const frag = document.createDocumentFragment();
    addresses.forEach((a) => {
        const card = document.createElement('div');
        card.className = 'account-address-card';

        const top = document.createElement('div');
        top.className = 'account-address-card-top';
        const title = document.createElement('div');
        title.className = 'account-address-card-title';
        const labelPart = a.label ? `${escapeHtml(a.label)} — ` : '';
        title.innerHTML =
            labelPart +
            escapeHtml(a.full_name) +
            (a.is_default ? ' <span class="default-badge">Default</span>' : '');

        const actions = document.createElement('div');
        actions.className = 'address-card-actions';

        const editBtn = document.createElement('button');
        editBtn.type = 'button';
        editBtn.className = 'btn-text';
        editBtn.textContent = 'Edit';
        editBtn.addEventListener('click', () => openAddressEditModal(a));

        if (!a.is_default) {
            const setDef = document.createElement('button');
            setDef.type = 'button';
            setDef.className = 'btn-text';
            setDef.textContent = 'Set as default';
            setDef.addEventListener('click', async () => {
                try {
                    const res = await fetch(`/api/addresses/${a.id}/`, {
                        method: 'PATCH',
                        credentials: 'include',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ is_default: true }),
                    });
                    const data = await res.json().catch(() => ({}));
                    if (!res.ok) {
                        showAccountMessage(data.error || 'Could not update address.', 'error');
                        return;
                    }
                    hideAccountMessage();
                    await refreshAccountPageData();
                } catch {
                    showAccountMessage('Could not update address.', 'error');
                }
            });
            actions.appendChild(setDef);
        }

        const delBtn = document.createElement('button');
        delBtn.type = 'button';
        delBtn.className = 'btn-danger-text';
        delBtn.textContent = 'Remove';
        delBtn.addEventListener('click', async () => {
            if (!confirm('Remove this address from your account?')) return;
            try {
                const res = await fetch(`/api/addresses/${a.id}/`, {
                    method: 'DELETE',
                    credentials: 'include',
                });
                const data = await res.json().catch(() => ({}));
                if (!res.ok) {
                    showAccountMessage(data.error || 'Could not remove address.', 'error');
                    return;
                }
                hideAccountMessage();
                await refreshAccountPageData();
            } catch {
                showAccountMessage('Could not remove address.', 'error');
            }
        });

        actions.appendChild(editBtn);
        actions.appendChild(delBtn);
        top.appendChild(title);
        top.appendChild(actions);

        const meta = document.createElement('div');
        meta.className = 'account-address-card-meta';
        const line2 = a.line2 ? `${a.line2}, ` : '';
        meta.textContent = `${a.line1}, ${line2}${a.city}, ${a.state} ${a.postal_code}, ${a.country}`;

        card.appendChild(top);
        card.appendChild(meta);
        frag.appendChild(card);
    });
    container.appendChild(frag);
}

function renderAccountOrders(orders) {
    const container = document.getElementById('account-orders-list');
    if (!container) return;
    container.replaceChildren();

    if (!orders.length) {
        const p = document.createElement('p');
        p.className = 'field-hint';
        p.textContent = 'No orders yet. When you place an order at checkout, it will show up here.';
        container.appendChild(p);
        return;
    }

    const frag = document.createDocumentFragment();
    orders.forEach((o) => {
        const card = document.createElement('div');
        card.className = 'order-history-card';

        const head = document.createElement('div');
        head.className = 'order-history-head';
        const left = document.createElement('div');
        const oid = document.createElement('div');
        oid.className = 'order-history-id';
        oid.textContent = `Order #${o.id}`;
        const meta = document.createElement('div');
        meta.className = 'order-history-meta';
        const when = new Date(o.created_at);
        meta.textContent = `${when.toLocaleString()} · ${o.payment_label || o.payment_method}`;
        left.appendChild(oid);
        left.appendChild(meta);
        const total = document.createElement('div');
        total.className = 'order-history-total';
        total.textContent = `₹${o.total}`;
        head.appendChild(left);
        head.appendChild(total);

        const ship = document.createElement('div');
        ship.className = 'order-ship-block';
        const s = o.shipping || {};
        const snapLine2 = s.line2 ? `${s.line2}, ` : '';
        ship.innerHTML = `<strong>Shipped to:</strong><br>${escapeHtml(
            `${s.full_name || ''}\n${s.line1 || ''}\n${snapLine2}${s.city || ''}, ${s.state || ''} ${s.postal_code || ''}\n${s.country || ''}`,
        ).replace(/\n/g, '<br>')}`;

        const table = document.createElement('table');
        table.className = 'order-items-table';
        table.innerHTML =
            '<thead><tr><th>Item</th><th>Qty</th><th>Each</th><th>Line</th></tr></thead>';
        const tb = document.createElement('tbody');
        (o.items || []).forEach((li) => {
            const tr = document.createElement('tr');
            tr.innerHTML = `<td>${escapeHtml(li.name)}</td><td>${li.quantity}</td><td>₹${li.unit_price}</td><td>₹${li.line_total}</td>`;
            tb.appendChild(tr);
        });
        table.appendChild(tb);

        card.appendChild(head);
        card.appendChild(ship);
        card.appendChild(table);
        frag.appendChild(card);
    });
    container.appendChild(frag);
}

async function refreshAccountPageData() {
    const [addrRes, ordRes] = await Promise.all([
        fetch('/api/addresses/', { credentials: 'include' }),
        fetch('/api/orders/', { credentials: 'include' }),
    ]);
    if (addrRes.status === 401 || ordRes.status === 401) {
        window.location.href = '/login/?next=/account/';
        return;
    }
    const addresses = addrRes.ok ? await addrRes.json() : [];
    const orders = ordRes.ok ? await ordRes.json() : [];
    if (!Array.isArray(addresses) || !Array.isArray(orders)) {
        showAccountMessage('Could not load account data.', 'error');
        return;
    }
    renderAccountAddressList(addresses);
    renderAccountOrders(orders);
}

async function initAccountPage() {
    if (!document.getElementById('account-page')) return;

    updateCartCount();
    await loadMe();
    if (!currentUser) {
        window.location.href = '/login/?next=/account/';
        return;
    }
    updateAuthLinks();

    document.getElementById('account-logout-btn')?.addEventListener('click', async () => {
        await apiLogout();
        currentUser = null;
        window.location.href = '/';
    });

    const emailEl = document.getElementById('profile-email');
    const nameEl = document.getElementById('profile-name');
    const phoneEl = document.getElementById('profile-phone');
    if (emailEl instanceof HTMLInputElement) emailEl.value = currentUser.email || '';
    if (nameEl instanceof HTMLInputElement) nameEl.value = currentUser.name || '';
    if (phoneEl instanceof HTMLInputElement) phoneEl.value = currentUser.phone || '';

    hideAccountMessage();
    await refreshAccountPageData();

    document.querySelectorAll('.account-tab').forEach((btn) => {
        btn.addEventListener('click', () => {
            const t = btn instanceof HTMLElement ? btn.dataset.tab : null;
            if (t) {
                switchAccountTab(t);
                hideAccountMessage();
            }
        });
    });

    if (window.location.hash === '#orders') {
        switchAccountTab('orders');
    }

    const profileForm = document.getElementById('profile-form');
    if (profileForm) {
        profileForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            hideAccountMessage();
            const fd = new FormData(profileForm);
            const body = {
                name: (fd.get('name') || '').toString().trim(),
                phone: (fd.get('phone') || '').toString().trim(),
            };
            try {
                const res = await fetch('/api/me/', {
                    method: 'PATCH',
                    credentials: 'include',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(body),
                });
                const data = await res.json().catch(() => ({}));
                if (!res.ok) {
                    showAccountMessage(data.error || 'Could not save profile.', 'error');
                    return;
                }
                currentUser = {
                    name: data.name,
                    email: data.email,
                    phone: data.phone || '',
                };
                updateAuthLinks();
                showAccountMessage('Profile updated.', 'success');
            } catch {
                showAccountMessage('Could not save profile.', 'error');
            }
        });
    }

    const newAddr = document.getElementById('account-new-address-form');
    if (newAddr) {
        newAddr.addEventListener('submit', async (e) => {
            e.preventDefault();
            hideAccountMessage();
            const fd = new FormData(newAddr);
            const body = {
                label: (fd.get('label') || '').toString().trim(),
                full_name: (fd.get('full_name') || '').toString().trim(),
                line1: (fd.get('line1') || '').toString().trim(),
                line2: (fd.get('line2') || '').toString().trim(),
                city: (fd.get('city') || '').toString().trim(),
                state: (fd.get('state') || '').toString().trim(),
                postal_code: (fd.get('postal_code') || '').toString().trim(),
                country: (fd.get('country') || 'India').toString().trim() || 'India',
                phone: (fd.get('phone') || '').toString().trim(),
                is_default: !!newAddr.querySelector('#acc-addr-is-default')?.checked,
            };
            try {
                const res = await fetch('/api/addresses/', {
                    method: 'POST',
                    credentials: 'include',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(body),
                });
                const data = await res.json().catch(() => ({}));
                if (!res.ok) {
                    showAccountMessage(data.error || 'Could not save address.', 'error');
                    return;
                }
                newAddr.reset();
                const cEl = document.getElementById('acc-addr-country');
                if (cEl instanceof HTMLInputElement) cEl.value = 'India';
                showAccountMessage('Address saved.', 'success');
                await refreshAccountPageData();
            } catch {
                showAccountMessage('Could not save address.', 'error');
            }
        });
    }

    const editForm = document.getElementById('address-edit-form');
    if (editForm) {
        editForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            hideAccountMessage();
            const fd = new FormData(editForm);
            const idRaw = (fd.get('id') || '').toString();
            const id = Number(idRaw);
            if (!Number.isFinite(id)) return;
            const body = {
                label: (fd.get('label') || '').toString().trim(),
                full_name: (fd.get('full_name') || '').toString().trim(),
                line1: (fd.get('line1') || '').toString().trim(),
                line2: (fd.get('line2') || '').toString().trim(),
                city: (fd.get('city') || '').toString().trim(),
                state: (fd.get('state') || '').toString().trim(),
                postal_code: (fd.get('postal_code') || '').toString().trim(),
                country: (fd.get('country') || 'India').toString().trim() || 'India',
                phone: (fd.get('phone') || '').toString().trim(),
            };
            if (editForm.querySelector('#edit-addr-is-default')?.checked) {
                body.is_default = true;
            }
            try {
                const res = await fetch(`/api/addresses/${id}/`, {
                    method: 'PATCH',
                    credentials: 'include',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(body),
                });
                const data = await res.json().catch(() => ({}));
                if (!res.ok) {
                    showAccountMessage(data.error || 'Could not update address.', 'error');
                    return;
                }
                closeAddressEditModal();
                showAccountMessage('Address updated.', 'success');
                await refreshAccountPageData();
            } catch {
                showAccountMessage('Could not update address.', 'error');
            }
        });
    }

    document.getElementById('address-edit-close')?.addEventListener('click', () => closeAddressEditModal());
    document.getElementById('address-edit-modal')?.addEventListener('click', (e) => {
        if (e.target instanceof HTMLElement && e.target.id === 'address-edit-modal') {
            closeAddressEditModal();
        }
    });
}

// Checkout handler (cart page → full checkout flow)
function handleCheckout() {
    const checkoutBtn = document.getElementById('checkout-btn');
    if (!checkoutBtn) return;

    checkoutBtn.addEventListener('click', () => {
        if (cart.length === 0) {
            alert('Your cart is empty!');
            return;
        }

        if (!currentUser) {
            alert('Please login to proceed with checkout!');
            window.location.href = '/login/';
            return;
        }

        window.location.href = '/checkout/';
    });
}

function showCheckoutMessage(text, kind) {
    const el = document.getElementById('checkout-message');
    if (!el) return;
    el.textContent = text;
    el.className = 'message ' + (kind === 'error' ? 'error' : 'success');
    el.style.display = 'block';
}

function hideCheckoutMessage() {
    const el = document.getElementById('checkout-message');
    if (!el) return;
    el.style.display = 'none';
    el.textContent = '';
}

function formatAddressLines(a) {
    const line2 = a.line2 ? `\n${a.line2}` : '';
    return `${a.full_name}\n${a.line1}${line2}\n${a.city}, ${a.state} ${a.postal_code}\n${a.country}${a.phone ? `\nPhone: ${a.phone}` : ''}`;
}

function renderCheckoutCartSummary(items) {
    const linesEl = document.getElementById('checkout-cart-lines');
    const subEl = document.getElementById('checkout-subtotal');
    const totalEl = document.getElementById('checkout-total');
    if (!linesEl || !subEl || !totalEl) return;

    linesEl.replaceChildren();
    const frag = document.createDocumentFragment();
    let subtotal = 0;
    items.forEach((item) => {
        const line = item.price * item.quantity;
        subtotal += line;
        const row = document.createElement('div');
        row.className = 'checkout-cart-line';
        row.innerHTML = `<span>${escapeHtml(item.name)} × ${item.quantity}</span><span>₹${line}</span>`;
        frag.appendChild(row);
    });
    linesEl.appendChild(frag);
    subEl.textContent = `₹${subtotal}`;
    totalEl.textContent = `₹${subtotal}`;
}

function pickInitialAddressSelection(addresses) {
    const def = addresses.find((a) => a.is_default);
    if (def) return def.id;
    return addresses.length ? addresses[0].id : null;
}

function renderAddressCards(addresses, selectedId) {
    const container = document.getElementById('address-list');
    if (!container) return;

    container.replaceChildren();
    if (!addresses.length) {
        const p = document.createElement('p');
        p.className = 'checkout-hint';
        p.textContent = 'No saved addresses yet. Add one below.';
        container.appendChild(p);
        return;
    }

    const frag = document.createDocumentFragment();
    addresses.forEach((a) => {
        const label = document.createElement('label');
        label.className = 'address-card';
        const radio = document.createElement('input');
        radio.type = 'radio';
        radio.name = 'delivery_address';
        radio.value = String(a.id);
        if (selectedId === a.id) radio.checked = true;

        const body = document.createElement('div');
        body.className = 'address-card-body';

        const title = document.createElement('div');
        title.className = 'address-card-title';
        const labelText = a.label ? `${escapeHtml(a.label)} — ` : '';
        title.innerHTML =
            labelText +
            escapeHtml(a.full_name) +
            (a.is_default ? ' <span class="default-badge">Default</span>' : '');

        const meta = document.createElement('div');
        meta.className = 'address-card-meta';
        const line2 = a.line2 ? `${a.line2}, ` : '';
        meta.textContent = `${a.line1}, ${line2}${a.city}, ${a.state} ${a.postal_code}, ${a.country}`;

        const actions = document.createElement('div');
        actions.className = 'address-card-actions';
        if (!a.is_default) {
            const setDef = document.createElement('button');
            setDef.type = 'button';
            setDef.className = 'btn-text';
            setDef.textContent = 'Set as default';
            setDef.dataset.setDefaultAddress = String(a.id);
            actions.appendChild(setDef);
        }
        const delBtn = document.createElement('button');
        delBtn.type = 'button';
        delBtn.className = 'btn-danger-text';
        delBtn.textContent = 'Remove';
        delBtn.dataset.deleteAddress = String(a.id);
        actions.appendChild(delBtn);

        body.appendChild(title);
        body.appendChild(meta);
        body.appendChild(actions);

        label.appendChild(radio);
        label.appendChild(body);
        frag.appendChild(label);
    });
    container.appendChild(frag);
}

function showCheckoutStep(step) {
    const addrPanel = document.getElementById('checkout-step-address');
    const payPanel = document.getElementById('checkout-step-payment');
    const ind1 = document.getElementById('step-indicator-address');
    const ind2 = document.getElementById('step-indicator-payment');
    if (!addrPanel || !payPanel || !ind1 || !ind2) return;

    if (step === 'address') {
        addrPanel.classList.remove('is-hidden');
        payPanel.classList.add('is-hidden');
        ind1.classList.add('is-active');
        ind2.classList.remove('is-active');
    } else {
        addrPanel.classList.add('is-hidden');
        payPanel.classList.remove('is-hidden');
        ind1.classList.remove('is-active');
        ind2.classList.add('is-active');
    }
}

function fillDeliveryReview() {
    const box = document.getElementById('checkout-delivery-review');
    if (!box) return;
    const a = checkoutAddressesCache.find((x) => x.id === checkoutSelectedAddressId);
    if (!a) {
        box.textContent = '';
        return;
    }
    box.innerHTML = `<strong>Deliver to:</strong><br>${escapeHtml(formatAddressLines(a)).replace(/\n/g, '<br>')}`;
}

async function reloadCheckoutAddresses() {
    const res = await fetch('/api/addresses/', { credentials: 'include' });
    if (res.status === 401) {
        window.location.href = '/login/';
        return false;
    }
    if (!res.ok) {
        showCheckoutMessage('Could not load your addresses. Please refresh.', 'error');
        return false;
    }
    checkoutAddressesCache = await res.json();
    if (!Array.isArray(checkoutAddressesCache)) checkoutAddressesCache = [];

    let sel = checkoutSelectedAddressId;
    if (!checkoutAddressesCache.some((x) => x.id === sel)) {
        sel = pickInitialAddressSelection(checkoutAddressesCache);
        checkoutSelectedAddressId = sel;
    }
    renderAddressCards(checkoutAddressesCache, sel);
    return true;
}

async function initCheckoutPage() {
    if (!document.getElementById('checkout-flow')) return;

    cart = JSON.parse(localStorage.getItem('cart')) || [];
    renderCheckoutCartSummary(cart);
    updateCartCount();

    await loadMe();
    if (!currentUser) {
        window.location.href = '/login/?next=/checkout/';
        return;
    }
    updateAuthLinks();

    if (!cart.length) {
        window.location.href = '/cart/';
        return;
    }

    hideCheckoutMessage();
    const ok = await reloadCheckoutAddresses();
    if (!ok) return;

    const addressListEl = document.getElementById('address-list');
    if (addressListEl) {
        addressListEl.addEventListener('click', async (e) => {
            const t = e.target;
            if (!(t instanceof HTMLElement)) return;

            const del = t.closest('[data-delete-address]');
            if (del && del instanceof HTMLElement) {
                e.preventDefault();
                const id = Number(del.dataset.deleteAddress);
                if (!Number.isFinite(id)) return;
                if (!confirm('Remove this address from your account?')) return;
                try {
                    const res = await fetch(`/api/addresses/${id}/`, {
                        method: 'DELETE',
                        credentials: 'include',
                    });
                    if (!res.ok) {
                        const err = await res.json().catch(() => ({}));
                        showCheckoutMessage(err.error || 'Could not delete address.', 'error');
                        return;
                    }
                    hideCheckoutMessage();
                    if (checkoutSelectedAddressId === id) checkoutSelectedAddressId = null;
                    await reloadCheckoutAddresses();
                } catch {
                    showCheckoutMessage('Could not delete address.', 'error');
                }
                return;
            }

            const setDef = t.closest('[data-set-default-address]');
            if (setDef && setDef instanceof HTMLElement) {
                e.preventDefault();
                const id = Number(setDef.dataset.setDefaultAddress);
                if (!Number.isFinite(id)) return;
                try {
                    const res = await fetch(`/api/addresses/${id}/`, {
                        method: 'PATCH',
                        credentials: 'include',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ is_default: true }),
                    });
                    if (!res.ok) {
                        const err = await res.json().catch(() => ({}));
                        showCheckoutMessage(err.error || 'Could not update default.', 'error');
                        return;
                    }
                    hideCheckoutMessage();
                    checkoutSelectedAddressId = id;
                    await reloadCheckoutAddresses();
                } catch {
                    showCheckoutMessage('Could not update default address.', 'error');
                }
            }
        });

        addressListEl.addEventListener('change', (e) => {
            const el = e.target;
            if (el instanceof HTMLInputElement && el.name === 'delivery_address') {
                checkoutSelectedAddressId = Number(el.value);
            }
        });
    }

    const form = document.getElementById('new-address-form');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            hideCheckoutMessage();
            const fd = new FormData(form);
            const body = {
                label: (fd.get('label') || '').toString().trim(),
                full_name: (fd.get('full_name') || '').toString().trim(),
                line1: (fd.get('line1') || '').toString().trim(),
                line2: (fd.get('line2') || '').toString().trim(),
                city: (fd.get('city') || '').toString().trim(),
                state: (fd.get('state') || '').toString().trim(),
                postal_code: (fd.get('postal_code') || '').toString().trim(),
                country: (fd.get('country') || 'India').toString().trim() || 'India',
                phone: (fd.get('phone') || '').toString().trim(),
                is_default: form.querySelector('#addr-is-default')?.checked || false,
            };

            try {
                const res = await fetch('/api/addresses/', {
                    method: 'POST',
                    credentials: 'include',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(body),
                });
                const data = await res.json().catch(() => ({}));
                if (!res.ok) {
                    showCheckoutMessage(data.error || 'Could not save address.', 'error');
                    return;
                }
                showCheckoutMessage('Address saved.', 'success');
                form.reset();
                const countryIn = document.getElementById('addr-country');
                if (countryIn instanceof HTMLInputElement) countryIn.value = 'India';
                checkoutSelectedAddressId = data.id;
                await reloadCheckoutAddresses();
            } catch {
                showCheckoutMessage('Could not save address.', 'error');
            }
        });
    }

    document.getElementById('checkout-continue-address')?.addEventListener('click', () => {
        hideCheckoutMessage();
        const r = document.querySelector('input[name="delivery_address"]:checked');
        if (!r || !checkoutAddressesCache.length) {
            showCheckoutMessage('Add or select a delivery address to continue.', 'error');
            return;
        }
        checkoutSelectedAddressId = Number(r.value);
        showCheckoutStep('payment');
        fillDeliveryReview();
    });

    document.getElementById('checkout-back-payment')?.addEventListener('click', () => {
        hideCheckoutMessage();
        showCheckoutStep('address');
    });

    document.getElementById('checkout-place-order')?.addEventListener('click', async () => {
        const r = document.querySelector('input[name="payment_method"]:checked');
        const method = r && r instanceof HTMLInputElement ? r.value : 'cod';
        const addr = checkoutAddressesCache.find((x) => x.id === checkoutSelectedAddressId);
        if (!addr) {
            showCheckoutMessage('Delivery address missing. Go back and select one.', 'error');
            return;
        }
        hideCheckoutMessage();
        try {
            const res = await fetch('/api/orders/', {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    address_id: checkoutSelectedAddressId,
                    payment_method: method,
                    items: cart.map((i) => ({
                        id: i.id,
                        name: i.name,
                        price: i.price,
                        quantity: i.quantity,
                    })),
                }),
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) {
                showCheckoutMessage(data.error || 'Could not place order.', 'error');
                return;
            }
            localStorage.setItem('cart', JSON.stringify([]));
            cart = [];
            updateCartCount();
            window.location.href = '/account/#orders';
        } catch {
            showCheckoutMessage('Could not place order.', 'error');
        }
    });
}

function handleResetPassword() {
    const resetForm = document.getElementById('reset-password-form');
    if (!resetForm) return;

    resetForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const password = document.getElementById('new-password').value;
        const confirmMsg = document.getElementById('confirm-new-password').value;
        const statusDiv = document.getElementById('reset-status-message');

        if (password !== confirmMsg) {
            statusDiv.textContent = 'Passwords do not match!';
            statusDiv.className = 'message error';
            return;
        }

        const params = new URLSearchParams(window.location.search);
        const token = params.get('token');
        const email = params.get('email');

        try {
            const res = await fetch('/api/reset-password/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, email, password })
            });

            const data = await res.json().catch(() => ({}));

            if (res.ok) {
                statusDiv.textContent = data.message || 'Password reset successful! Redirecting to login...';
                statusDiv.className = 'message success';
                resetForm.reset();
                setTimeout(() => {
                    window.location.href = '/login/';
                }, 3000);
            } else {
                statusDiv.textContent = data.error || 'Failed to reset password.';
                statusDiv.className = 'message error';
            }
        } catch (err) {
            statusDiv.textContent = 'An error occurred. Please try again.';
            statusDiv.className = 'message error';
        }
    });
}

// Initialize page
async function init() {
    updateCartCount();
    await loadMe();
    updateAuthLinks();

    if (document.getElementById('account-page')) {
        await initAccountPage();
        return;
    }

    if (document.getElementById('checkout-flow')) {
        await initCheckoutPage();
        return;
    }

    const needsCatalog =
        document.getElementById('products-grid') ||
        document.getElementById('product-details');
    if (needsCatalog) {
        await loadAndMergeProducts();
    }

    // Display products on homepage
    if (document.getElementById('products-grid')) {
        setupProductFilters();
        refreshProductGrid();
        handleSearch();
    }

    // Display cart on cart page
    if (document.getElementById('cart-items')) {
        displayCart();
        handleCheckout();
    }

    // Display product details on product details page
    if (document.getElementById('product-details')) {
        displayProductDetails();
    }

    // Handle auth forms
    handleSignup();
    handleLogin();
    handleForgotPassword();
    handleResetPassword();
}

// Run initialization when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        init();
    });
} else {
    init();
}
