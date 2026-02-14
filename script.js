/* Watch Wala - Core Logic with Variations */

import { db } from './firebase-config.js';
// import { collection, getDocs } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";


// Global Products Array
let products = [];

// State
let cart = [];
let discountApplied = false;
let currentDiscount = 0;

// New State for Variations
let isDirectOrder = false;
let currentDirectProduct = null;
let currentVariationPrice = 0;

// Popup Mode State
let popupMode = "order"; // "cart" or "order"

// Init
document.addEventListener('DOMContentLoaded', async () => {
    await fetchProducts();
    updateCartCount();
});

// Fetch Products from Firestore
async function fetchProducts() {
    const grid = document.getElementById('products-grid');
    grid.innerHTML = '<p style="text-align:center; width:100%;">Loading latest collection...</p>';

    try {
        const querySnapshot = await getDocs(collection(db, "products"));
        products = [];
        querySnapshot.forEach((doc) => {
            // Prioritize Firestore Document ID
            products.push({
                ...doc.data(),
                id: doc.id
            });
        });
        renderProducts();
    } catch (error) {
        console.error("Error fetching products:", error);
        grid.innerHTML = '<p style="text-align:center; width:100%; color:red;">Failed to load products. Please try again later.</p>';
    }
}

// Global Safe Navigation Function
window.openProduct = function (id) {
    if (!id) return;
    window.location.href = `./product.html?id=${id}`;
};

// Render Products
function renderProducts() {
    const grid = document.getElementById('products-grid');
    if (products.length === 0) {
        grid.innerHTML = '<p style="text-align:center; width:100%;">No products available.</p>';
        return;
    }

    grid.innerHTML = products.map(product => {
        // Discount Logic
        const hasDiscount = product.discountEnabled && product.originalPrice > product.price;
        const discountPercentage = hasDiscount ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : 0;

        return `
        <div class="product-card ${!product.stock ? 'out-of-stock-card' : ''}" onclick="window.openProduct('${product.id}')" style="cursor: pointer;">
            ${product.badge ? `<span class="badge">${product.badge}</span>` : ''}
            ${!product.stock ? `<span class="badge" style="background:red;">Out of Stock</span>` : ''}
            
            ${hasDiscount ? `<span class="badge" style="background:#e74c3c; left: 10px; right: auto;">Save ${discountPercentage}%</span>` : ''}

            <div class="product-img-container">
                <img src="${product.image}" alt="${product.title}">
            </div>
            <div class="product-info">
                <h3 class="product-title">${product.title}</h3>
                
                <div class="price-container">
                    ${hasDiscount ? `<span class="original-price">PKR ${product.originalPrice.toLocaleString()}</span>` : ''}
                    <span class="product-price">PKR ${product.price.toLocaleString()}</span>
                </div>

                <div class="product-buttons" onclick="event.stopPropagation();">
                    <button class="btn add-cart-btn" 
                        ${!product.stock ? 'disabled style="background:#ccc; cursor:not-allowed;"' : ''} 
                        onclick="window.addToCart('${product.id}')">Add to Cart</button>
                    <button class="btn primary-btn order-now-btn" 
                        ${!product.stock ? 'disabled style="background:#ccc; cursor:not-allowed;"' : ''} 
                        onclick="window.orderNow('${product.id}')">Order Now</button>
                </div>
            </div>
        </div>
    `}).join('');
}

// Mobile Menu Toggle
window.toggleMenu = function () {
    const menu = document.getElementById('mobileMenu');
    const toggle = document.querySelector('.menu-toggle');

    menu.classList.toggle('active');
    toggle.classList.toggle('active');
}

// Cart Logic - Open Modal for Variation Selection
window.addToCart = function (id) {
    const product = products.find(p => p.id === id);
    if (!product) return;

    // Open modal in Cart Mode
    popupMode = "cart";
    isDirectOrder = true; // Reuse variation logic
    currentDirectProduct = product;
    currentVariationPrice = 0;

    // UI Updates
    document.getElementById('cart-summary').style.display = 'none';
    document.getElementById('product-variation-container').style.display = 'block';

    // Render Variation Fields
    renderVariationFields(product);

    // Reset quantity to 1
    document.getElementById('product-quantity').value = 1;

    updateFinalPrice();
    setModalUIForMode();
    openModal();
}

window.removeFromCart = function (index) {
    cart.splice(index, 1);
    updateCartListUI();
    updateCartCount();
}

function updateCartCount() {
    document.getElementById('cart-count').innerText = cart.reduce((total, item) => total + item.quantity, 0);
}

// ==========================================
// MODAL & VARIATION LOGIC
// ==========================================

function openModal() {
    const modal = document.getElementById('orderModal');
    modal.style.display = 'block';
    setTimeout(() => {
        modal.classList.add('show');
    }, 10);
}

// Set Modal UI based on mode
function setModalUIForMode() {
    const customerSection = document.querySelector('.customer-form-section');
    const voucherSection = document.querySelector('.voucher-section');
    const submitBtn = document.getElementById('modal-submit-btn');

    if (popupMode === "cart") {
        // Cart Mode: Hide customer form and voucher
        if (customerSection) customerSection.classList.add('hidden-section');
        if (voucherSection) voucherSection.classList.add('hidden-section');
        if (submitBtn) {
            submitBtn.innerHTML = 'Add to Cart <i class="fa-solid fa-cart-plus"></i>';
        }
    } else {
        // Order Mode: Show all sections
        if (customerSection) customerSection.classList.remove('hidden-section');
        if (voucherSection) voucherSection.classList.remove('hidden-section');
        if (submitBtn) {
            submitBtn.innerHTML = 'Confirm Order <i class="fa-brands fa-whatsapp"></i>';
        }
    }
}

window.closeModal = function () {
    const modal = document.getElementById('orderModal');
    modal.classList.remove('show');
    setTimeout(() => {
        modal.style.display = 'none';
        discountApplied = false;
        currentDiscount = 0;
        document.getElementById('voucher-message').innerText = '';
        document.getElementById('voucher-code').value = '';

        // Reset Direct Order State
        isDirectOrder = false;
        currentDirectProduct = null;
        currentVariationPrice = 0;
        popupMode = "order"; // Reset to default
    }, 300);
}

window.onclick = function (event) {
    if (event.target == document.getElementById('orderModal')) {
        closeModal();
    }
}

// 1. Order Now (Direct Order with Variations)
window.orderNow = function (id) {
    popupMode = "order"; // Set to Order Mode
    isDirectOrder = true;
    currentDirectProduct = products.find(p => p.id === id);
    if (!currentDirectProduct) return;

    currentVariationPrice = 0; // Reset

    // UI Updates
    document.getElementById('cart-summary').style.display = 'none';
    document.getElementById('product-variation-container').style.display = 'block';

    // Render Variation Fields
    renderVariationFields(currentDirectProduct);

    // Reset quantity to 1
    document.getElementById('product-quantity').value = 1;

    updateFinalPrice(); // Initial calc
    setModalUIForMode();
    openModal();
}

// 2. Open Cart
window.toggleCart = function () {
    if (cart.length === 0) {
        showToast("Your cart is empty!");
        return;
    }

    popupMode = "order"; // Cart checkout is still order mode
    isDirectOrder = false;
    currentDirectProduct = null;

    // UI Updates
    document.getElementById('cart-summary').style.display = 'block';
    document.getElementById('product-variation-container').style.display = 'none';

    updateCartListUI();
    setModalUIForMode();
    openModal();
}

// Render Dropdowns / Buttons
function renderVariationFields(product) {
    const container = document.getElementById('variation-fields');
    document.getElementById('modal-product-title').innerText = product.title;
    document.getElementById('modal-base-price').innerText = `Base Price: PKR ${product.price.toLocaleString()}`;

    let html = '';

    if (product.variations) {
        // Color (Circular Buttons)
        if (product.variations.colors && product.variations.colors.length > 0) {
            html += `
                <div class="form-group" id="group-color">
                    <label>Select Color *</label>
                    <div class="var-options-container" data-type="color">
                        ${product.variations.colors.map(c => `
                            <button type="button" class="var-btn" onclick="window.selectVariation('color', '${c}', 0, this)">${c}</button>
                        `).join('')}
                    </div>
                    <p class="validation-error" id="error-color">Please select a color</p>
                </div>
            `;
        }

        // Strap (Circular Buttons)
        if (product.variations.straps && product.variations.straps.length > 0) {
            html += `
                <div class="form-group" id="group-strap">
                    <label>Select Strap</label>
                    <div class="var-options-container" data-type="strap">
                        ${product.variations.straps.map(s => `
                            <button type="button" class="var-btn" data-price="${s.price}" onclick="window.selectVariation('strap', '${s.name}', ${s.price}, this)">${s.name} (${s.price > 0 ? '+' : ''}${s.price})</button>
                        `).join('')}
                    </div>
                    <p class="validation-error" id="error-strap">Please select a strap</p>
                </div>
            `;
        }

        // Size (Circular Buttons)
        if (product.variations.sizes && product.variations.sizes.length > 0) {
            html += `
                <div class="form-group" id="group-size">
                    <label>Select Size</label>
                    <div class="var-options-container" data-type="size">
                         ${product.variations.sizes.map(s => `
                            <button type="button" class="var-btn" data-price="${s.price}" onclick="window.selectVariation('size', '${s.name}', ${s.price}, this)">${s.name} (${s.price > 0 ? '+' + s.price : s.price})</button>
                        `).join('')}
                    </div>
                    <p class="validation-error" id="error-size">Please select a size</p>
                </div>
            `;
        }
    } else {
        html = '<p>No variations available for this product</p>';
    }

    container.innerHTML = html;
}

// Selection Logic for Buttons
window.selectVariation = function (type, value, price, element) {
    // Deselect siblings
    const parent = element.parentElement;
    const siblings = parent.getElementsByClassName('var-btn');
    for (let btn of siblings) {
        btn.classList.remove('selected');
    }

    // Select clicked
    element.classList.add('selected');

    // Hide error if valid
    const errorMsg = document.getElementById(`error-${type}`);
    if (errorMsg) errorMsg.style.display = 'none';

    updateFinalPrice();
}

// Calculate logic
window.updateFinalPrice = function () {
    let total = 0;

    if (isDirectOrder && currentDirectProduct) {
        let base = currentDirectProduct.price;
        let varPrice = 0;

        // Strap (Button)
        const strapContainer = document.querySelector('.var-options-container[data-type="strap"]');
        if (strapContainer) {
            const selectedBtn = strapContainer.querySelector('.selected');
            if (selectedBtn) {
                varPrice += parseInt(selectedBtn.getAttribute('data-price') || 0);
            }
        }

        // Size (Button)
        const sizeContainer = document.querySelector('.var-options-container[data-type="size"]');
        if (sizeContainer) {
            const selectedBtn = sizeContainer.querySelector('.selected');
            if (selectedBtn) {
                varPrice += parseInt(selectedBtn.getAttribute('data-price') || 0);
            }
        }

        // Get quantity
        const quantityInput = document.getElementById('product-quantity');
        const quantity = quantityInput ? parseInt(quantityInput.value) || 1 : 1;

        total = (base + varPrice) * quantity;
        currentVariationPrice = varPrice;

        const final = total - currentDiscount;
        document.getElementById('modal-final-price').innerText = `PKR ${final.toLocaleString()} ${discountApplied ? '(Discounted)' : ''}`;

    } else {
        // Cart Mode
        total = cart.reduce((sum, item) => sum + (item.finalPrice * item.quantity), 0);
        const final = total - currentDiscount;
        document.getElementById('cart-total').innerText = `PKR ${final.toLocaleString()} ${discountApplied ? '(Discounted)' : ''}`;
    }
}

// Cart UI (List)
function updateCartListUI() {
    const list = document.getElementById('cart-items-list');
    list.innerHTML = cart.map((item, index) => {
        let variationText = '';
        if (item.color) variationText += ` - ${item.color}`;
        if (item.strap) variationText += ` - ${item.strap}`;
        if (item.size) variationText += ` - ${item.size}`;

        return `
            <li>
                <div style="display:flex; justify-content:space-between; align-items:center; width:100%;">
                    <span>${item.title}${variationText}</span>
                    <div class="qty-control" style="width: 80px; padding: 0;">
                        <button type="button" class="qty-btn" style="padding: 2px 8px; font-size: 1rem;" onclick="window.updateCartQty(${index}, -1)">-</button>
                        <input type="number" value="${item.quantity}" readonly style="padding: 2px 0; font-size: 0.9rem;">
                        <button type="button" class="qty-btn" style="padding: 2px 8px; font-size: 1rem;" onclick="window.updateCartQty(${index}, 1)">+</button>
                    </div>
                </div>
                <div style="display:flex; justify-content:space-between; align-items:center; width:100%; margin-top:5px;">
                     <span style="font-weight:bold;">PKR ${(item.finalPrice * item.quantity).toLocaleString()}</span>
                     <i class="fa-solid fa-trash" style="color:red; cursor:pointer;" onclick="window.removeFromCart(${index})"></i>
                </div>
            </li>
        `;
    }).join('');
    updateFinalPrice();
}

// Voucher Logic (Works for both)
window.applyVoucher = function () {
    const code = document.getElementById('voucher-code').value.toUpperCase();
    const message = document.getElementById('voucher-message');

    // Calc base total first to determine discount amount
    let baseTotal = 0;
    if (isDirectOrder && currentDirectProduct) {
        let varPrice = 0;
        // Strap
        const strapSelect = document.getElementById('var-strap');
        if (strapSelect) varPrice += parseInt(strapSelect.options[strapSelect.selectedIndex].getAttribute('data-price') || 0);
        // Size
        const sizeContainer = document.querySelector('.var-options-container[data-type="size"]');
        if (sizeContainer) {
            const selectedBtn = sizeContainer.querySelector('.selected');
            if (selectedBtn) varPrice += parseInt(selectedBtn.getAttribute('data-price') || 0);
        }

        baseTotal = currentDirectProduct.price + varPrice;
    } else {
        baseTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    }

    if (discountApplied) {
        message.innerText = "Discount already applied!";
        message.className = "text-error";
        return;
    }

    if (code === "WATCH10") {
        currentDiscount = Math.round(baseTotal * 0.10); // 10% off
        discountApplied = true;
        message.innerText = `Success! PKR ${currentDiscount} saved.`;
        message.className = "text-success";
        updateFinalPrice();
    } else if (code === "PRO500") {
        currentDiscount = 500; // Flat 500 off
        discountApplied = true;
        message.innerText = `Success! PKR 500 saved.`;
        message.className = "text-success";
        updateFinalPrice();
    } else {
        message.innerText = "Invalid Voucher Code";
        message.className = "text-error";
    }
}

// Order Submission
window.submitOrder = function (e) {
    e.preventDefault();

    // 1. VARIATION VALIDATION (Used in both modes)
    if (isDirectOrder && currentDirectProduct) {
        let isValid = true;

        // Clear previous errors
        document.querySelectorAll('.validation-error').forEach(err => err.style.display = 'none');

        // Color Required?
        const colorContainer = document.querySelector('.var-options-container[data-type="color"]');
        if (colorContainer && currentDirectProduct.variations.colors?.length > 0) {
            const selectedColor = colorContainer.querySelector('.selected');
            if (!selectedColor) {
                document.getElementById('error-color').style.display = 'block';
                isValid = false;
            }
        }

        // Strap Required?
        const strapContainer = document.querySelector('.var-options-container[data-type="strap"]');
        if (strapContainer && currentDirectProduct.variations.straps?.length > 0) {
            const selectedStrap = strapContainer.querySelector('.selected');
            if (!selectedStrap) {
                document.getElementById('error-strap').style.display = 'block';
                isValid = false;
            }
        }

        // Size Required?
        const sizeContainer = document.querySelector('.var-options-container[data-type="size"]');
        if (sizeContainer && currentDirectProduct.variations.sizes?.length > 0) {
            const selectedSize = sizeContainer.querySelector('.selected');
            if (!selectedSize) {
                document.getElementById('error-size').style.display = 'block';
                isValid = false;
            }
        }

        if (!isValid) return;
    }

    // ==========================================
    // CASE A: CART MODE (Add to Cart logic)
    // ==========================================
    if (popupMode === "cart") {
        const colorContainer = document.querySelector('.var-options-container[data-type="color"]');
        const strapContainer = document.querySelector('.var-options-container[data-type="strap"]');
        const sizeContainer = document.querySelector('.var-options-container[data-type="size"]');

        const color = colorContainer?.querySelector('.selected')?.innerText || null;
        const strapText = strapContainer?.querySelector('.selected')?.innerText || null;
        const strap = strapText ? strapText.split(' (')[0] : null;
        const sizeText = sizeContainer?.querySelector('.selected')?.innerText || null;
        const size = sizeText ? sizeText.split(' (')[0] : null;

        const quantity = parseInt(document.getElementById('product-quantity').value) || 1;

        // Calculate variation price
        let varPrice = 0;
        if (strapContainer?.querySelector('.selected')) varPrice += parseInt(strapContainer.querySelector('.selected').getAttribute('data-price') || 0);
        if (sizeContainer?.querySelector('.selected')) varPrice += parseInt(sizeContainer.querySelector('.selected').getAttribute('data-price') || 0);

        const finalPricePerItem = currentDirectProduct.price + varPrice;

        // Check for existing duplicate with SAME variations
        const existingItemIndex = cart.findIndex(item =>
            item.id === currentDirectProduct.id &&
            item.color === color &&
            item.strap === strap &&
            item.size === size
        );

        if (existingItemIndex > -1) {
            cart[existingItemIndex].quantity += quantity;
        } else {
            cart.push({
                id: currentDirectProduct.id,
                title: currentDirectProduct.title,
                color: color,
                strap: strap,
                size: size,
                quantity: quantity,
                basePrice: currentDirectProduct.price,
                finalPrice: finalPricePerItem
            });
        }

        updateCartCount();
        closeModal();
        showToast(`Added ${currentDirectProduct.title} to Cart`);
        return;
    }

    // ==========================================
    // CASE B: ORDER MODE (WhatsApp Checkout logic)
    // ==========================================

    // CUSTOMER FORM VALIDATION
    const name = document.getElementById('name').value;
    const phone = document.getElementById('phone').value;
    const city = document.getElementById('city').value;
    const address = document.getElementById('address').value;
    const instructions = document.getElementById('instructions').value;

    const phoneRegex = /^((\+92)|(0092))-{0,1}\d{3}-{0,1}\d{7}$|^\d{11}$|^\d{4}-\d{7}$/;
    if (!phoneRegex.test(phone)) {
        alert("Please enter a valid Pakistan phone number (e.g. 03001234567)");
        return;
    }

    if (!name || !phone || !city || !address) {
        alert("Please fill all required fields");
        return;
    }

    // Generate Order ID
    let lastId = parseInt(localStorage.getItem('lastOrderId')) || 0;
    let newId = lastId + 1;
    localStorage.setItem('lastOrderId', newId);
    const orderId = `WW${String(newId).padStart(3, '0')}`;

    let message = `*New Order – Watch Wala*\n\n`;
    message += `*Order ID:* ${orderId}\n`;
    message += `------------------------\n`;

    let finalAmount = 0;

    if (isDirectOrder && currentDirectProduct) {
        // Direct Order Construction
        const colorContainer = document.querySelector('.var-options-container[data-type="color"]');
        const strapContainer = document.querySelector('.var-options-container[data-type="strap"]');
        const sizeContainer = document.querySelector('.var-options-container[data-type="size"]');

        const color = colorContainer?.querySelector('.selected')?.innerText || 'Default';
        const strapText = strapContainer?.querySelector('.selected')?.innerText || null;
        const strap = strapText ? strapText.split(' (')[0] : null;
        const sizeText = sizeContainer?.querySelector('.selected')?.innerText || null;
        const size = sizeText ? sizeText.split(' (')[0] : null;
        const quantity = parseInt(document.getElementById('product-quantity').value) || 1;

        let varPrice = 0;
        if (strapContainer?.querySelector('.selected')) varPrice += parseInt(strapContainer.querySelector('.selected').getAttribute('data-price') || 0);
        if (sizeContainer?.querySelector('.selected')) varPrice += parseInt(sizeContainer.querySelector('.selected').getAttribute('data-price') || 0);

        let itemTotal = (currentDirectProduct.price + varPrice) * quantity;

        message += `Product: ${currentDirectProduct.title}\n`;
        message += `Color: ${color}\n`;
        if (strap) message += `Strap: ${strap}\n`;
        if (size) message += `Size: ${size}\n`;
        message += `Qty: ${quantity}\n`;
        message += `Subtotal: PKR ${itemTotal}\n`;

        finalAmount = itemTotal;
    } else {
        // Cart Order Construction
        cart.forEach(item => {
            let varDesc = '';
            if (item.color) varDesc += ` [Color: ${item.color}]`;
            if (item.strap) varDesc += ` [Strap: ${item.strap}]`;
            if (item.size) varDesc += ` [Size: ${item.size}]`;

            message += `Item: ${item.title}${varDesc}\n`;
            message += `Price: PKR ${item.finalPrice}\n`;
            message += `Qty: ${item.quantity}\n`;
            message += `Subtotal: PKR ${item.finalPrice * item.quantity}\n`;
            message += `------------------------\n`;
        });
        finalAmount = cart.reduce((sum, item) => sum + (item.finalPrice * item.quantity), 0);
    }

    // Apply Voucher
    finalAmount = finalAmount - currentDiscount;

    message += `------------------------\n`;
    message += `*Total Amount:* PKR ${finalAmount}\n`;
    if (discountApplied) message += `(Voucher Applied: -PKR ${currentDiscount})\n`;

    message += `\n*Customer Details:*\n`;
    message += `Name: ${name}\n`;
    message += `Phone: ${phone}\n`;
    message += `City: ${city}\n`;
    message += `Address: ${address}\n`;
    message += `Special Instruction: ${instructions || 'None'}\n`;
    message += `\n*Payment Method:* Cash on Delivery\n`;
    message += `Delivery: All Over Pakistan`;

    const whatsappNumber = "923078552135";
    const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;

    window.open(url, '_blank');

    if (!isDirectOrder) {
        cart = [];
        updateCartCount();
    }

    // Close modal...
    closeModal();
    showToast("Order Placed! Redirecting to WhatsApp...");
}

// Quantity Stepper Logic (Homepage Popup)
window.updateQty = function (change) {
    const qtyInput = document.getElementById('product-quantity');
    let newQty = parseInt(qtyInput.value) + change;
    if (newQty < 1) newQty = 1;
    qtyInput.value = newQty;
    updateFinalPrice();
}

// Cart Quantity Logic
window.updateCartQty = function (index, change) {
    if (cart[index]) {
        let newQty = cart[index].quantity + change;
        if (newQty < 1) newQty = 1;
        cart[index].quantity = newQty;
        updateCartListUI();
        updateCartCount();
    }
}

// Toast
function showToast(msg) {
    const toast = document.getElementById('toast');
    toast.innerText = msg;
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}
