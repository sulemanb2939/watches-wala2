/* Watch Wala - Core Logic with Variations */

// Product Data with Variations
const products = [
    {
        id: 1,
        title: "Classic Silver Elite",
        price: 4999,
        image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80",
        badge: "Best Seller",
        variations: {
            colors: ["Silver", "Black", "Blue"],
            straps: [
                { name: "Stainless Steel", price: 0 },
                { name: "Leather Strap", price: -200 }
            ],
            sizes: [
                { name: "40mm", price: 0 },
                { name: "42mm", price: 200 }
            ]
        }
    },
    {
        id: 2,
        title: "Royal Gold Chrono",
        price: 6499,
        image: "https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80",
        badge: "New Arrival",
        variations: {
            colors: ["Gold", "Rose Gold"],
            sizes: [{ name: "Standard", price: 0 }]
        }
    },
    {
        id: 3,
        title: "Midnight Black Sport",
        price: 3499,
        image: "https://images.unsplash.com/photo-1524805444758-089113d48a6d?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80",
        badge: "50% OFF",
        variations: {
            colors: ["Black", "Grey"],
            straps: [
                { name: "Silicone", price: 0 },
                { name: "Nylon", price: 150 }
            ]
        }
    },
    {
        id: 4,
        title: "Vintage Leather Strap",
        price: 2999,
        image: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80",
        badge: null,
        variations: {
            colors: ["Brown", "Tan"],
        }
    },
    {
        id: 5,
        title: "Minimalist White",
        price: 3999,
        image: "https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80",
        badge: null,
        variations: {
            colors: ["White", "Eggshell"],
        }
    },
    {
        id: 6,
        title: "Diver Pro Blue",
        price: 5499,
        image: "https://images.unsplash.com/photo-1594576722512-582bcd46fba3?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80",
        badge: "Limited",
        variations: {
            colors: ["Ocean Blue", "Deep Navy"],
            straps: [{ name: "Rubber", price: 0 }, { name: "Metal", price: 500 }]
        }
    },
    {
        id: 7,
        title: "Business Executive",
        price: 7999,
        image: "https://images.unsplash.com/photo-1614164185128-e4ec99c436d7?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80",
        badge: null,
        variations: {
            colors: ["Black", "Silver"],
        }
    },
    {
        id: 8,
        title: "Rose Gold Elegance",
        price: 4499,
        image: "https://images.unsplash.com/photo-1517502474097-f9b30659dadb?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80",
        badge: "Trending",
        variations: {
            colors: ["Rose Gold"],
        }
    },
    {
        id: 9,
        title: "Smart Fitness Band",
        price: 2499,
        image: "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80",
        badge: "Sale",
        variations: {
            colors: ["Black", "Pink", "Blue"],
        }
    },
    {
        id: 10,
        title: "Luxury Skeleton",
        price: 8999,
        image: "https://images.unsplash.com/photo-1548171915-e79a380a2a4b?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80",
        badge: "Premium",
        variations: {
            colors: ["Gold", "Silver"],
            straps: [{ name: "Leather", price: 0 }, { name: "Steel", price: 800 }]
        }
    },
    {
        id: 11,
        title: "Aviator Classic",
        price: 5999,
        image: "https://images.unsplash.com/photo-1623998021450-85c29c644e0d?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80",
        badge: null,
        variations: {
            colors: ["Green", "Black"],
        }
    },
    {
        id: 12,
        title: "Digital Retro Gold",
        price: 1999,
        image: "https://images.unsplash.com/photo-1533139502658-0198f920d8e8?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80",
        badge: "Hot",
        variations: {
            colors: ["Gold", "Silver"],
        }
    }
];

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
document.addEventListener('DOMContentLoaded', () => {
    renderProducts();
    updateCartCount();
});

// Render Products (Unchanged)
function renderProducts() {
    const grid = document.getElementById('products-grid');
    grid.innerHTML = products.map(product => `
        <div class="product-card">
            ${product.badge ? `<span class="badge">${product.badge}</span>` : ''}
            <div class="product-img-container">
                <img src="${product.image}" alt="${product.title}">
            </div>
            <div class="product-info">
                <h3 class="product-title">${product.title}</h3>
                <p class="product-price">PKR ${product.price.toLocaleString()}</p>
                <div class="product-buttons">
                    <button class="btn add-cart-btn" onclick="addToCart(${product.id})">Add to Cart</button>
                    <button class="btn primary-btn order-now-btn" onclick="orderNow(${product.id})">Order Now</button>
                </div>
            </div>
        </div>
    `).join('');
}

// Mobile Menu Toggle (Unchanged)
function toggleMenu() {
    const menu = document.getElementById('mobileMenu');
    if (menu.style.display === 'flex') {
        menu.style.display = 'none';
    } else {
        menu.style.display = 'flex';
    }
}

// Cart Logic - Open Modal for Variation Selection
function addToCart(id) {
    const product = products.find(p => p.id === id);

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

function removeFromCart(index) {
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

function closeModal() {
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
function orderNow(id) {
    popupMode = "order"; // Set to Order Mode
    isDirectOrder = true;
    currentDirectProduct = products.find(p => p.id === id);
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
function toggleCart() {
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
                            <button type="button" class="var-btn" onclick="selectVariation('color', '${c}', 0, this)">${c}</button>
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
                            <button type="button" class="var-btn" data-price="${s.price}" onclick="selectVariation('strap', '${s.name}', ${s.price}, this)">${s.name} (${s.price > 0 ? '+' : ''}${s.price})</button>
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
                            <button type="button" class="var-btn" data-price="${s.price}" onclick="selectVariation('size', '${s.name}', ${s.price}, this)">${s.name} (${s.price > 0 ? '+' + s.price : s.price})</button>
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
function selectVariation(type, value, price, element) {
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
function updateFinalPrice() {
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
                <span>${item.title}${variationText} (x${item.quantity})</span>
                <span>PKR ${(item.finalPrice * item.quantity).toLocaleString()} 
                <i class="fa-solid fa-trash" style="color:red; cursor:pointer; margin-left:10px;" onclick="removeFromCart(${index})"></i></span>
            </li>
        `;
    }).join('');
    updateFinalPrice();
}

// Voucher Logic (Works for both)
function applyVoucher() {
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
// Order Submission
function submitOrder(e) {
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

    closeModal();
    showToast("Order Placed! Redirecting to WhatsApp...");
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
