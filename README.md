# 🕒 Watch Wala – Premium Watch E-Commerce Website

Watch Wala is a fully functional modern e-commerce website built using pure HTML, CSS, JavaScript, and Firebase.

It includes:

- Dynamic product management (Admin Panel)
- Product detail pages
- Variations system (Color / Size / Strap)
- Discount system
- Cart system with quantity support
- WhatsApp order integration
- Review & rating system
- Fully responsive mobile-first design

---

## 🚀 Live Features

### 🛍 Product System
- Dynamic products from Firebase Firestore
- Multiple images support
- Discount pricing (Original + Sale price)
- Badge system (Hot, Premium, etc.)
- Stock toggle (In stock / Out of stock)

### 📄 Product Detail Page (PDP)
- Image gallery with thumbnails
- Variation selection
- Live price update
- Quantity stepper (+ / -)
- Add to Cart
- Order Now (WhatsApp)
- Review system (5-star rating + comments)

### 🛒 Cart System
- LocalStorage based cart
- Quantity control per item
- Variation-based separation
- Live subtotal calculation
- WhatsApp checkout message generation

### ⭐ Review System
- Firebase-backed reviews
- 5-star rating
- Average rating calculation
- Real-time updates

### 👨‍💼 Admin Panel
- Firebase Authentication login
- Add / Edit / Delete products
- Upload images
- Add variations
- Add discount pricing
- Stock control
- Badge system

---

## 🛠 Tech Stack

- HTML5
- CSS3
- Vanilla JavaScript (ES6 Modules)
- Firebase
  - Firestore Database
  - Firebase Authentication
  - Firebase Storage
- LocalStorage
- Font Awesome Icons

---

## 📂 Project Structure

/project-root
│
├── index.html
├── product.html
├── admin.html
├── script.js
├── product.js
├── firebase-config.js
├── style.css
├── legacy-data.js
└── README.md


---

## 🔥 Firebase Setup

1. Create a Firebase project
2. Enable:
   - Firestore Database
   - Authentication (Email/Password)
   - Storage
3. Add your Firebase config inside:

firebase-config.js


---

## 🛍 Firestore Collections

### products
{
title: string,
price: number,
originalPrice: number,
image: string,
images: array,
variations: {
colors: array,
sizes: array,
straps: array
},
stock: boolean,
badge: string,
createdAt: timestamp
}


### reviews
{
productId: string,
name: string,
rating: number,
comment: string,
createdAt: timestamp
}


---

## 📱 Responsive Design

- Mobile-first layout
- Responsive product grid
- Responsive PDP
- Optimized cart modal
- Floating WhatsApp support button

---

## 📦 WhatsApp Integration

Orders are sent directly to:

+92 307 8552135


With formatted message including:
- Product name
- Variations
- Quantity
- Total price

---

## 🎯 Key Highlights

✔ No framework used  
✔ Fully custom coded  
✔ Modular structure  
✔ Clean UI  
✔ Firebase powered backend  
✔ WhatsApp order management system  
✔ Production-ready architecture  

---

## 👑 Brand Info

**Owner:** Bilal  
**Location:** Karachi – Bolton Market  
**Delivery:** All over Pakistan  
**Payment:** Cash on Delivery  

---

## 📌 Future Improvements (Optional)

- Payment gateway integration
- Order tracking system
- Admin analytics dashboard
- Inventory management
- Coupon system
- SEO optimization
- Performance optimization

---

## 🧑‍💻 Developer Notes

This project was built as a custom WhatsApp-based e-commerce solution.

All product data is dynamic and managed via Firebase Admin Panel.

Cart system is client-side (LocalStorage based).

---

## 📄 License

This project is proprietary and built for Watch Wala brand.

---

# ⭐ If you like this project, give it a star!
