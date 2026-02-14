import { db, auth } from './firebase-config.js';
import {
    doc,
    getDoc,
    collection,
    query,
    where,
    getDocs,
    addDoc,
    serverTimestamp,
    orderBy
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

// Global Product State
let currentProduct = null;
let currentVariation = {
    priceAdjustment: 0,
    details: {}
};
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// === PDP LOGIC ===

// 1. Get Product ID from URL
function getProductId() {
    const params = new URLSearchParams(window.location.search);
    return params.get('id');
}

// 2. Fetch & Render Product
async function initProductPage() {
    const productId = getProductId();
    if (!productId) {
        showNotFound();
        return;
    }

    try {
        const docRef = doc(db, "products", productId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            currentProduct = { id: docSnap.id, ...docSnap.data() };
            renderProduct(currentProduct);
            loadReviews(productId);
            updateCartUI(); // Initialize cart UI
            document.getElementById('product-loader').style.display = 'none';
            document.getElementById('pdp-content').style.display = 'grid';
            document.getElementById('reviews-section').style.display = 'block';
        } else {
            showNotFound();
        }
    } catch (error) {
        console.error("Error fetching product:", error);
        showNotFound();
    }
}

function showNotFound() {
    document.getElementById('product-loader').style.display = 'none';
    document.getElementById('product-not-found').style.display = 'block';
}

function renderProduct(product) {
    // Basic Info
    document.title = `${product.title} | Watch Wala`;
    document.getElementById('p-title').innerText = product.title;
    document.getElementById('p-description').innerText = product.description || "No description available.";

    // Price
    renderPrice(product.price, product.originalPrice);

    // Stock
    const stockEl = document.getElementById('p-stock');
    if (product.stock) {
        stockEl.innerHTML = '<span class="badge in-stock" style="background:#2ecc71; color:white; padding:4px 8px; border-radius:4px;">In Stock</span>';
    } else {
        stockEl.innerHTML = '<span class="badge out-stock" style="background:#e74c3c; color:white; padding:4px 8px; border-radius:4px;">Out of Stock</span>';
        document.querySelector('.action-buttons .primary-btn').disabled = true;
        document.querySelector('.action-buttons .primary-btn').innerText = "Out of Stock";
    }

    // Badge
    if (product.badge) {
        const badge = document.getElementById('p-badge');
        badge.innerText = product.badge;
        badge.style.display = 'inline-block';
        badge.style.background = 'var(--secondary-color)';
    }

    // Images
    const mainImg = document.getElementById('main-image');
    mainImg.src = product.image; // Default

    // If multiple images (array)
    // For now assuming product.images (plural) might exist or just single product.image
    // The requirement says "product document must support: images: ['url1', 'url2']"
    // If not present, use [product.image]
    const images = product.images && product.images.length > 0 ? product.images : [product.image];

    // Ensure main image is first
    mainImg.src = images[0];

    const thumbContainer = document.getElementById('thumbnail-container');
    thumbContainer.innerHTML = images.map((img, index) => `
        <img src="${img}" class="thumbnail ${index === 0 ? 'active' : ''}" onclick="changeImage('${img}', this)">
    `).join('');

    // Review Variations (Assuming stored as separate fields or parsed from description for now? 
    // Wait, admin panel saves them as comma-separated text in specific fields p-colors, p-sizes, p-straps)
    // Let's assume the product object has these fields as strings or arrays.
    // Admin saves them as Strings? "Black, Silver" or "40mm:0, 42mm:200"
    // We need to parse them if they are strings.

    // Clear previous variations to prevent duplication
    document.getElementById('variations-container').innerHTML = '';

    if (product.variations) {
        renderVariations(product.variations.colors, 'Color', 'colors');
        renderVariations(product.variations.sizes, 'Size', 'sizes');
        renderVariations(product.variations.straps, 'Strap', 'straps');
    }

    // Specs
    if (product.specs) { // JSON or String? Assuming simple object or string map?
        // Implementation detail: Admin saves specific fields like p-spec-material. 
        // Let's assume standard object structure if we updated Admin to save structured data, 
        // but if it's flat, we render what we have.
        // Let's just assume we display Description for now as requested.
    }
}

function renderPrice(basePrice, originalPrice, adjustment = 0) {
    const finalPrice = Number(basePrice) + adjustment;
    document.getElementById('p-price').innerText = `PKR ${finalPrice.toLocaleString()}`;

    if (originalPrice && Number(originalPrice) > finalPrice) {
        document.getElementById('p-original-price').innerText = `PKR ${Number(originalPrice).toLocaleString()}`;
        document.getElementById('p-original-price').style.display = 'inline';

        // Update badge
        const discount = Math.round(((originalPrice - finalPrice) / originalPrice) * 100);
        const badge = document.getElementById('p-badge');
        badge.innerText = `Save ${discount}%`;
        badge.style.display = 'inline-block';
    } else {
        document.getElementById('p-original-price').style.display = 'none';
        if (!currentProduct.badge) document.getElementById('p-badge').style.display = 'none';
    }
}

function renderVariations(data, label, type) {
    if (!data) return;

    // Parse if string (e.g. "Name:Price")
    // If array of strings or objects, handle accordingly.
    // Admin implementation wasn't fully detailed on storage format, assumes simplistic parsing for now.

    let options = [];
    if (typeof data === 'string') {
        options = data.split(',').map(s => {
            const [name, price] = s.split(':');
            return { name: name.trim(), price: price ? Number(price) : 0 };
        });
    } else if (Array.isArray(data)) {
        options = data; // Assuming already objects
    } else {
        return; // Empty or invalid
    }

    if (options.length === 0 || (options.length === 1 && !options[0].name)) return;

    const container = document.getElementById('variations-container');
    const wrapper = document.createElement('div');
    wrapper.className = 'variation-section';

    wrapper.innerHTML = `<span class="variation-label">${label}</span>`;
    const optsDiv = document.createElement('div');
    optsDiv.className = 'variation-options';

    options.forEach((opt, idx) => {
        const btn = document.createElement('button');
        btn.className = `variation-btn ${idx === 0 ? 'selected' : ''}`; // Default select first
        btn.innerText = opt.name + (opt.price > 0 ? ` (+${opt.price})` : '');
        btn.onclick = () => {
            // Deselect siblings
            optsDiv.querySelectorAll('.variation-btn').forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');

            // Update State
            currentVariation.details[type] = opt;
            updateTotalVariantPrice();
        };
        optsDiv.appendChild(btn);

        // Set default selection state
        if (idx === 0) currentVariation.details[type] = opt;
    });

    wrapper.appendChild(optsDiv);
    container.appendChild(wrapper);
}

function updateTotalVariantPrice() {
    let adjustment = 0;
    Object.values(currentVariation.details).forEach(opt => {
        if (opt && opt.price) adjustment += opt.price;
    });
    renderPrice(currentProduct.price, currentProduct.originalPrice, adjustment);
}

// Global Image Changer
window.changeImage = (src, thumb) => {
    document.getElementById('main-image').src = src;
    document.querySelectorAll('.thumbnail').forEach(t => t.classList.remove('active'));
    thumb.classList.add('active');
};

// === CART & ORDER LOGIC ===

// Quantity Logic for PDP
window.updateQtyPDP = (change) => {
    const qtyInput = document.getElementById('product-quantity');
    let newQty = parseInt(qtyInput.value) + change;
    if (newQty < 1) newQty = 1;
    qtyInput.value = newQty;
};

// Cart Logic
window.updateCartQty = (index, change) => {
    if (cart[index]) {
        let newQty = cart[index].quantity + change;
        if (newQty < 1) newQty = 1;

        // Note: In PDP cart, 'quantity' property might not exist on old items, but we should adding it.
        // Wait, addToCartPDP pushed an item. We need to ensure it pushed quantity.
        cart[index].quantity = newQty;
        updateCartUI(); // This saves cart too
    }
};

window.addToCartPDP = () => {
    if (!currentProduct) return;

    // Get quantity
    const qtyInput = document.getElementById('product-quantity');
    const quantity = parseInt(qtyInput.value) || 1;

    // Get selected variants
    const variantLabel = Object.entries(currentVariation.details)
        .map(([key, val]) => `${key}: ${val.name}`)
        .join(', ');

    // Calculate final price (Unit Price)
    let unitPrice = Number(currentProduct.price);
    Object.values(currentVariation.details).forEach(opt => { if (opt.price) unitPrice += opt.price; });

    // Check for existing item with exact same ID and Variant
    const existingIndex = cart.findIndex(item => item.id === currentProduct.id && item.variant === variantLabel);

    if (existingIndex > -1) {
        // Update quantity
        cart[existingIndex].quantity = (cart[existingIndex].quantity || 1) + quantity;
    } else {
        const cartItem = {
            id: currentProduct.id,
            title: currentProduct.title,
            price: unitPrice,
            image: currentProduct.image,
            variant: variantLabel,
            quantity: quantity,
            cartId: Date.now()
        };
        cart.push(cartItem);
    }

    saveCart();
    updateCartUI();
    window.toggleCart(); // Open cart
};

window.orderNowPDP = () => {
    if (!currentProduct) return;

    const qtyInput = document.getElementById('product-quantity');
    const quantity = parseInt(qtyInput.value) || 1;

    // Build message
    const variantLabel = Object.entries(currentVariation.details)
        .map(([key, val]) => `${key}: ${val.name}`)
        .join(', ');

    let unitPrice = Number(currentProduct.price);
    Object.values(currentVariation.details).forEach(opt => { if (opt.price) unitPrice += opt.price; });

    const total = unitPrice * quantity;

    const message = `Hello, I want to order:
    
*${currentProduct.title}*
Variant: ${variantLabel || 'Standard'}
Quantity: ${quantity}
Unit Price: PKR ${unitPrice}
Total: PKR ${total}
    
Please confirm availability.`;

    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/923078552135?text=${encodedMessage}`, '_blank');
};

// Reuse Cart Logic from script.js (Simplified copy)
function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
    const count = document.getElementById('cart-count');
    const totalCount = document.getElementById('cart-total-count');
    // Sum quantities
    const totalQty = cart.reduce((acc, item) => acc + (item.quantity || 1), 0);

    if (count) count.innerText = totalQty;
    if (totalCount) totalCount.innerText = `(${totalQty})`;
}

function updateCartUI() {
    const container = document.getElementById('cart-items');
    const totalEl = document.getElementById('cart-total-price');
    if (!container) return;

    container.innerHTML = cart.map((item, index) => `
        <div class="cart-item">
            <img class="cart-thumb" src="${item.image}" alt="${item.title}">
            <div class="cart-item-info">
                <h4>${item.title}</h4>
                <p>${item.variant || ''}</p>
                <span class="cart-item-price">PKR ${Number(item.price).toLocaleString()}</span>
                
                <div class="qty-control" style="width: 80px; padding: 0; margin-top: 5px;">
                    <button type="button" class="qty-btn" style="padding: 2px 8px; font-size: 1rem;" onclick="window.updateCartQty(${index}, -1)">-</button>
                    <input type="number" value="${item.quantity || 1}" readonly style="padding: 2px 0; font-size: 0.9rem;">
                    <button type="button" class="qty-btn" style="padding: 2px 8px; font-size: 1rem;" onclick="window.updateCartQty(${index}, 1)">+</button>
                </div>
            </div>
            <span class="remove-item" onclick="window.removeItem(${index})">&times;</span>
        </div>
    `).join('');

    const total = cart.reduce((sum, item) => sum + (Number(item.price) * (item.quantity || 1)), 0);
    if (totalEl) totalEl.innerText = `PKR ${total.toLocaleString()}`;
    saveCart();
}

window.removeItem = (index) => {
    cart.splice(index, 1);
    updateCartUI();
};

window.toggleCart = () => {
    const modal = document.getElementById('cart-modal');
    modal.classList.toggle('show');
};

window.checkoutWhatsApp = () => {
    if (cart.length === 0) return alert("Cart is empty!");

    let message = "New Order Request:\n\n";
    let total = 0;

    cart.forEach(item => {
        message += `• ${item.title} ${item.variant ? `(${item.variant})` : ''} - PKR ${item.price}\n`;
        total += Number(item.price);
    });

    message += `\nTotal: PKR ${total.toLocaleString()}`;
    window.open(`https://wa.me/923078552135?text=${encodeURIComponent(message)}`, '_blank');
};


// === REVIEWS SYSTEM ===

async function loadReviews(productId) {
    const reviewList = document.getElementById('reviews-list');
    const avgRatingEl = document.getElementById('avg-rating');
    const countEl = document.getElementById('review-count');

    const q = query(
        collection(db, "reviews"),
        where("productId", "==", productId),
        orderBy("createdAt", "desc")
    );

    try {
        const querySnapshot = await getDocs(q);
        const reviews = [];
        querySnapshot.forEach((doc) => {
            reviews.push(doc.data());
        });

        if (reviews.length === 0) {
            reviewList.innerHTML = '<p style="color:#777;">No reviews yet. Be the first to review!</p>';
            return;
        }

        // Display
        reviewList.innerHTML = reviews.map(r => `
            <div class="review-card">
                <div style="display:flex; justify-content:space-between; margin-bottom:5px;">
                    <strong>${r.name}</strong>
                    <span class="star-rating">${getStars(r.rating)}</span>
                </div>
                <p style="margin:0; color:#555;">${r.comment}</p>
                <small style="color:#999;">${new Date(r.createdAt?.toDate()).toLocaleDateString()}</small>
            </div>
        `).join('');

        // Stats
        const totalStars = reviews.reduce((acc, r) => acc + Number(r.rating), 0);
        const avg = (totalStars / reviews.length).toFixed(1);

        avgRatingEl.innerText = avg;
        countEl.innerText = reviews.length;

    } catch (e) {
        console.error("Error loading reviews:", e);
    }
}

function getStars(rating) {
    let stars = '';
    for (let i = 1; i <= 5; i++) {
        if (i <= rating) stars += '<i class="fa-solid fa-star"></i>';
        else stars += '<i class="fa-regular fa-star"></i>';
    }
    return stars;
}

// Interactive Star Input
document.querySelectorAll('.star-rating-input i').forEach(star => {
    star.addEventListener('click', function () {
        const val = this.getAttribute('data-val');
        document.getElementById('review-rating').value = val;

        // Visual update
        document.querySelectorAll('.star-rating-input i').forEach(s => {
            if (s.getAttribute('data-val') <= val) {
                s.classList.remove('fa-regular');
                s.classList.add('fa-solid');
                s.style.color = '#f1c40f';
            } else {
                s.classList.remove('fa-solid');
                s.classList.add('fa-regular');
                s.style.color = '#ccc';
            }
        });
    });
});

// Submit Review
document.getElementById('review-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const productId = getProductId();
    const name = document.getElementById('review-name').value;
    const comment = document.getElementById('review-comment').value;
    const rating = document.getElementById('review-rating').value;

    if (!productId) return;

    try {
        await addDoc(collection(db, "reviews"), {
            productId,
            name,
            comment,
            rating: Number(rating),
            createdAt: serverTimestamp()
        });

        alert("Review submitted!");
        document.getElementById('review-form').reset();
        loadReviews(productId); // Reload
    } catch (e) {
        alert("Error submitting review: " + e.message);
    }
});


// Call Init
initProductPage();
window.toggleMenu = function () {
    const menu = document.getElementById('mobileMenu');
    menu.style.display = menu.style.display === 'flex' ? 'none' : 'flex';
};
