// VERVE Modern E-Commerce Store JavaScript Logic

let allProducts = [];
let cart = [
    { title: "Classic Denim Jacket", price: 79.99, image: "/images/Classic Denim Jacket.png", qty: 1 },
    { title: "Amazon Echo (4th Gen) Smart Speaker", price: 99.99, image: "/images/Amazon Echo (4th Gen) Smart Speaker.png", qty: 1 }
];
let currentPdpQty = 1;

document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('products-grid') && !window.location.pathname.includes('product')) {
        initStore();
    }
});

function initStore() {
    loadProducts('all');
    setupNavigation();
    setupSearch();
    updateCartUI();
}

// Fetch products from database backend
async function loadProducts(categoryFilter = 'all') {
    const grid = document.getElementById('products-grid');
    if (!grid) return;

    grid.innerHTML = `<div style="grid-column: 1/-1; text-align: center; color: var(--text-muted); padding: 4rem;">Loading catalog items...</div>`;

    try {
        const response = await fetch('/api/products/detailed');
        if (response.ok) {
            const data = await response.json();
            allProducts = data.products || [];
        }

        if (!allProducts.length) {
            allProducts = getFallbackCatalog();
        }

        renderProducts(filterProducts(categoryFilter));
    } catch (err) {
        console.error('Failed to load product catalog:', err);
        allProducts = getFallbackCatalog();
        renderProducts(filterProducts(categoryFilter));
    }
}

function filterProducts(category) {
    if (category === 'recommended') {
        return [...allProducts].sort((a, b) => (b.weightage || 0) - (a.weightage || 0));
    }
    if (category === 'all') return allProducts;
    return allProducts.filter(p => p.category.toLowerCase().includes(category.toLowerCase()));
}

function renderProducts(products) {
    const grid = document.getElementById('products-grid');
    if (!grid) return;

    if (products.length === 0) {
        grid.innerHTML = `<div style="grid-column: 1/-1; text-align: center; color: var(--text-muted); padding: 4rem;">No products found in this category.</div>`;
        return;
    }

    grid.innerHTML = products.map((p, idx) => {
        const stars = '★'.repeat(Math.round(p.avg_rating || 4.5)) + '☆'.repeat(5 - Math.round(p.avg_rating || 4.5));
        const price = (p.price || getDeterministicPrice(p.title, idx)).toFixed(2);
        const categoryName = p.category.replace('Amazon_', '').replace('_', ' ');
        const imgSrc = p.image_url || '/images/image.png';

        const badgeTag = idx % 3 === 0 ? 'Top Pick' : (idx % 2 === 0 ? 'Best Seller' : null);

        return `
            <div class="product-card" onclick="navigateToProduct('${p.asin}')">
                ${badgeTag ? `<span class="product-badge">${badgeTag}</span>` : ''}
                <div class="product-image-box">
                    <img src="${imgSrc}" alt="${escapeHtml(p.title)}" onerror="this.src='https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80'">
                </div>
                <div class="product-details">
                    <span class="product-category-label">${categoryName}</span>
                    <h3 class="product-name">${p.title}</h3>
                    
                    <div class="product-rating">
                        <span>${stars}</span>
                        <span class="review-count">(${p.review_count || 14})</span>
                    </div>

                    <div class="product-price-row">
                        <span class="product-price">$${price}</span>
                        <button class="btn-add-cart" onclick="event.stopPropagation(); addToCart('${escapeHtml(p.title)}', ${price}, '${imgSrc}')">Add to Cart</button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function navigateToProduct(asin) {
    window.location.href = `/product?asin=${asin}`;
}

// -------------------------------------------------------------
// Standalone Product Detail Page Logic (product.html)
// -------------------------------------------------------------
async function initProductPage() {
    updateCartUI();
    setupSearch();
    
    const urlParams = new URLSearchParams(window.location.search);
    const asin = urlParams.get('asin') || 'B08N5WRWNW';

    const container = document.getElementById('pdp-container');
    const relatedGrid = document.getElementById('related-grid');

    try {
        const response = await fetch(`/api/products/${asin}`);
        let item;

        if (response.ok) {
            item = await response.json();
        } else {
            item = getFallbackCatalog()[0];
        }

        renderStandalonePdp(item);
    } catch (err) {
        console.error('Error loading standalone product page:', err);
        renderStandalonePdp(getFallbackCatalog()[0]);
    }
}

function renderStandalonePdp(item) {
    const container = document.getElementById('pdp-container');
    const breadcrumbTitle = document.getElementById('breadcrumb-title');
    const breadcrumbCategory = document.getElementById('breadcrumb-category');
    const relatedGrid = document.getElementById('related-grid');

    if (!container) return;

    const categoryName = (item.category || 'Fashion').replace('Amazon_', '').replace('_', ' ');
    if (breadcrumbTitle) breadcrumbTitle.innerText = item.title;
    if (breadcrumbCategory) breadcrumbCategory.innerText = categoryName;

    const stars = '★'.repeat(Math.round(item.avg_rating || 4.7)) + '☆'.repeat(5 - Math.round(item.avg_rating || 4.7));
    const price = (item.price || getDeterministicPrice(item.title, 1)).toFixed(2);
    const imgSrc = item.image_url || '/images/image.png';

    const reviews = item.reviews || [];
    const reviewsHtml = reviews.length ? reviews.slice(0, 4).map(r => `
        <div class="review-item">
            <div class="review-header">
                <span style="font-weight: 600; color: var(--text-main);">${r.user_id || 'Verified Buyer'}</span>
                <span style="color: #f59e0b;">${'★'.repeat(r.rating || 5)}</span>
            </div>
            <h5 style="color: var(--text-main); font-size: 0.9rem; margin-bottom: 0.25rem;">${r.title || 'Verified Purchase'}</h5>
            <p style="color: var(--text-muted); font-size: 0.875rem;">${r.text}</p>
        </div>
    `).join('') : `<p style="color: var(--text-dark);">No customer reviews submitted yet.</p>`;

    container.innerHTML = `
        <div class="pdp-img-wrapper">
            <img src="${imgSrc}" alt="${escapeHtml(item.title)}" onerror="this.src='https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80'">
        </div>

        <div class="pdp-info">
            <span class="pdp-category">${categoryName}</span>
            <h1 class="pdp-title">${item.title}</h1>

            <div class="pdp-rating-row">
                <span class="pdp-stars">${stars}</span>
                <span style="color: var(--text-muted); font-size: 0.95rem;">${(item.avg_rating || 4.7).toFixed(1)} (${item.review_count || 12} customer reviews)</span>
                <span class="pdp-stock-badge">${item.stock || 'In Stock — Ready to Ship'}</span>
            </div>

            <div class="pdp-price">$${price}</div>

            <p class="pdp-desc">${item.description || 'Crafted with premium materials for timeless design, durability, and elegance.'}</p>

            <div class="pdp-actions-row">
                <div class="qty-picker">
                    <button class="qty-btn" onclick="adjustPdpQty(-1)">-</button>
                    <span id="pdp-qty-val" class="qty-val">1</span>
                    <button class="qty-btn" onclick="adjustPdpQty(1)">+</button>
                </div>

                <button class="btn-pdp-add" onclick="addPdpToCart('${escapeHtml(item.title)}', ${price}, '${imgSrc}')">Add to Cart</button>
            </div>

            <div class="pdp-features-list">
                <h4>Product Details & Highlights</h4>
                <ul>
                    ${(item.features || [
                        "Premium grade construction for daily performance",
                        "Backed by VERVE 1-Year Guarantee",
                        "Complimentary 30-day return policy"
                    ]).map(f => `<li>${f}</li>`).join('')}
                </ul>
            </div>

            <div style="margin-top: 1rem;">
                <h3 style="font-family: var(--font-title); font-size: 1.2rem; margin-bottom: 1rem; color: var(--text-main);">Customer Feedback</h3>
                ${reviewsHtml}
            </div>
        </div>
    `;

    // Render Category-Matched Recommended Products
    if (relatedGrid) {
        const related = item.related || [];
        if (related.length === 0) {
            relatedGrid.innerHTML = `<div style="grid-column: 1/-1; color: var(--text-muted);">Discover more items in our catalog.</div>`;
        } else {
            relatedGrid.innerHTML = related.map((r, idx) => {
                const rPrice = getDeterministicPrice(r.title, idx).toFixed(2);
                const rStars = '★'.repeat(Math.round(r.avg_rating || 4.5)) + '☆'.repeat(5 - Math.round(r.avg_rating || 4.5));
                const rCategory = r.category.replace('Amazon_', '').replace('_', ' ');
                const rImg = r.image_url || '/images/image.png';

                return `
                    <div class="product-card" onclick="navigateToProduct('${r.asin}')">
                        <div class="product-image-box">
                            <img src="${rImg}" alt="${escapeHtml(r.title)}" onerror="this.src='https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80'">
                        </div>
                        <div class="product-details">
                            <span class="product-category-label">${rCategory}</span>
                            <h3 class="product-name">${r.title}</h3>
                            <div class="product-rating">
                                <span>${rStars}</span>
                                <span class="review-count">(${r.avg_rating})</span>
                            </div>
                            <div class="product-price-row">
                                <span class="product-price">$${rPrice}</span>
                                <button class="btn-add-cart" onclick="event.stopPropagation(); addToCart('${escapeHtml(r.title)}', ${rPrice}, '${rImg}')">Add to Cart</button>
                            </div>
                        </div>
                    </div>
                `;
            }).join('');
        }
    }
}

function adjustPdpQty(delta) {
    currentPdpQty = Math.max(1, currentPdpQty + delta);
    const val = document.getElementById('pdp-qty-val');
    if (val) val.innerText = currentPdpQty;
}

function addPdpToCart(title, price, image) {
    for (let i = 0; i < currentPdpQty; i++) {
        cart.push({ title, price, image });
    }
    updateCartUI();
    showToast(`Added ${currentPdpQty} item(s) to your cart!`);
}

function setupNavigation() {
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            const category = link.getAttribute('data-category');
            if (!category) return;
            e.preventDefault();
            document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            
            document.querySelectorAll('.pill-btn').forEach(btn => {
                btn.classList.toggle('active', btn.getAttribute('data-category') === category);
            });

            renderProducts(filterProducts(category));
            const catEl = document.getElementById('catalog');
            if (catEl) catEl.scrollIntoView({ behavior: 'smooth' });
        });
    });

    document.querySelectorAll('.pill-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.pill-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const category = btn.getAttribute('data-category');
            renderProducts(filterProducts(category));
        });
    });
}

function setupSearch() {
    const input = document.getElementById('search-input');
    if (input) {
        input.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase().trim();
            if (document.getElementById('products-grid')) {
                const filtered = allProducts.filter(p => 
                    p.title.toLowerCase().includes(query) || p.category.toLowerCase().includes(query)
                );
                renderProducts(filtered);
            }
        });
    }
}

// Cart Functionality
function addToCart(title, price, image) {
    cart.push({ title, price, image });
    updateCartUI();
    showToast(`Added "${title}" to your cart!`);
}

function updateCartUI() {
    const badge = document.getElementById('cart-count');
    const drawerCount = document.getElementById('cart-drawer-count');
    const itemsList = document.getElementById('cart-items');
    const totalPriceEl = document.getElementById('cart-total-price');

    if (badge) badge.innerText = cart.length;
    if (drawerCount) drawerCount.innerText = cart.length;

    let total = 0;
    if (itemsList) {
        if (cart.length === 0) {
            itemsList.innerHTML = `<p style="color: var(--text-dark); text-align: center; padding: 2rem;">Your bag is currently empty.</p>`;
        } else {
            itemsList.innerHTML = cart.map((item, i) => {
                total += item.price;
                return `
                    <div class="cart-item">
                        <img src="${item.image}" class="cart-item-img" alt="${item.title}" onerror="this.src='https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100'">
                        <div style="flex-grow: 1;">
                            <div class="cart-item-title">${item.title}</div>
                            <div class="cart-item-price">$${item.price.toFixed(2)}</div>
                        </div>
                        <button onclick="removeFromCart(${i})" style="background:none; border:none; color: var(--text-dark); cursor:pointer;">&times;</button>
                    </div>
                `;
            }).join('');
        }
    }

    if (totalPriceEl) totalPriceEl.innerText = `$${total.toFixed(2)}`;
}

function removeFromCart(index) {
    cart.splice(index, 1);
    updateCartUI();
}

function toggleCartDrawer() {
    const drawer = document.getElementById('cart-drawer');
    if (drawer) drawer.classList.toggle('active');
}

// Helper Utilities
function getDeterministicPrice(title, idx) {
    let hash = 0;
    for (let i = 0; i < title.length; i++) {
        hash = title.charCodeAt(i) + ((hash << 5) - hash);
    }
    const prices = [29.99, 45.00, 68.50, 89.99, 120.00, 149.99, 199.00, 249.50];
    return prices[Math.abs(hash) % prices.length];
}

function escapeHtml(str) {
    return str ? str.replace(/'/g, "\\'").replace(/"/g, '&quot;') : '';
}

function showToast(message) {
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed; bottom: 20px; right: 20px;
        background: #d4af37; color: #000; padding: 12px 24px;
        border-radius: 8px; font-weight: 600; font-family: var(--font-title);
        box-shadow: 0 10px 25px rgba(0,0,0,0.5); z-index: 3000;
        transition: opacity 0.3s ease;
    `;
    toast.innerText = message;
    document.body.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
    }, 2500);
}

function getFallbackCatalog() {
    return [
        { asin: "B08N5WRWNW", title: "Cozy Cable-Knit Sweater", category: "Fashion", avg_rating: 4.8, review_count: 34, image_url: "/images/Cozy Cable-Knit Sweater.png", price: 68.50 },
        { asin: "B00X4WHP5E", title: "Amazon Echo (4th Gen) Smart Speaker", category: "Electronics", avg_rating: 4.7, review_count: 52, image_url: "/images/Amazon Echo (4th Gen) Smart Speaker.png", price: 99.99 },
        { asin: "B00LO2943M", title: "Canon EOS 3000D DSLR Camera", category: "Electronics", avg_rating: 4.9, review_count: 41, image_url: "/images/Canon EOS 3000D DSLR Camera 1 Camera Body, 18 - 55 mm Lens .png", price: 349.00 },
        { asin: "B0794Z1N00", title: "Classic Denim Jacket", category: "Fashion", avg_rating: 4.5, review_count: 19, image_url: "/images/Classic Denim Jacket.png", price: 79.99 },
        { asin: "B07FZ8S74R", title: "Kindle Paperwhite E-Reader (8GB)", category: "Electronics", avg_rating: 4.8, review_count: 67, image_url: "/images/Kindle Paperwhite E-Reader (8GB).png", price: 139.99 },
        { asin: "B01BH83OOM", title: "Classic Tailored Trousers", category: "Fashion", avg_rating: 4.6, review_count: 28, image_url: "/images/Classic Tailored Trousers.png", price: 85.00 }
    ];
}
