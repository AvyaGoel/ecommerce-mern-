# ShopMERN - Full Stack E-Commerce Application

A complete, production-ready MERN stack e-commerce application with all modern features.

## 🚀 Tech Stack

**Backend:** Node.js, Express.js, MongoDB (Mongoose), JWT Auth  
**Frontend:** React 18, React Router v6, Context API, Recharts  
**Services:** Cloudinary (images), Razorpay (payments), Nodemailer (emails)

---

## 📁 Project Structure

```
ecommerce/
├── backend/
│   ├── config/
│   │   └── cloudinary.js          # Cloudinary + Multer config
│   ├── controllers/
│   │   ├── authController.js      # Register, login, refresh, forgot/reset password
│   │   ├── productController.js   # CRUD, reviews, low stock
│   │   ├── cartController.js      # Add/update/remove/clear cart
│   │   ├── orderController.js     # Create order, order history, status updates
│   │   ├── paymentController.js   # Razorpay integration + verification
│   │   ├── adminController.js     # Dashboard stats, user management
│   │   └── userController.js      # Profile, password, addresses
│   ├── middleware/
│   │   └── authMiddleware.js      # JWT protect + role authorization
│   ├── models/
│   │   ├── userModel.js
│   │   ├── productModel.js
│   │   ├── cartModel.js
│   │   └── orderModel.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── productRoutes.js
│   │   ├── cartRoutes.js
│   │   ├── orderRoutes.js
│   │   ├── paymentRoutes.js
│   │   ├── adminRoutes.js
│   │   └── userRoutes.js
│   ├── utils/
│   │   ├── generateToken.js       # Access + refresh token generation
│   │   ├── sendEmail.js           # Nodemailer email utility
│   │   ├── errorHandler.js        # Custom error class
│   │   └── apiFeatures.js         # Search, filter, sort, paginate
│   └── server.js
├── frontend/
│   ├── public/
│   │   └── index.html
│   └── src/
│       ├── components/
│       │   ├── admin/
│       │   │   └── AdminLayout.js  # Sidebar admin layout
│       │   ├── common/
│       │   │   ├── ProductCard.js
│       │   │   ├── Pagination.js
│       │   │   ├── LoadingSpinner.js
│       │   │   └── OrderStatusBadge.js
│       │   └── layout/
│       │       ├── Navbar.js
│       │       └── Footer.js
│       ├── context/
│       │   ├── AuthContext.js      # User auth state + login/logout
│       │   └── CartContext.js      # Cart state synced with DB
│       ├── pages/
│       │   ├── HomePage.js
│       │   ├── auth/               # Login, Register, Forgot/Reset Password
│       │   ├── products/           # Product listing + detail
│       │   ├── cart/               # Cart page
│       │   ├── orders/             # Checkout, Success, History, Detail
│       │   ├── user/               # Profile management
│       │   └── admin/              # Dashboard, Products, Orders, Users
│       ├── services/
│       │   └── api.js              # Axios instance + all API calls
│       ├── App.js
│       ├── index.js
│       └── index.css
├── package.json
├── .env.example
└── README.md
```

---

## ⚙️ Setup Instructions

### 1. Clone & Install
```bash
git clone <repo>
cd ecommerce
npm run install-all
```

### 2. Configure Environment
```bash
cp .env.example .env
# Fill in your values:
# - MONGO_URI (MongoDB Atlas or local)
# - JWT_SECRET, JWT_REFRESH_SECRET
# - CLOUDINARY_* credentials
# - EMAIL_* (Gmail App Password)
# - RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET
# - CLIENT_URL=http://localhost:3000
```

### 3. Run Development
```bash
npm run dev
# Backend: http://localhost:5000
# Frontend: http://localhost:3000
```

---

## 🔑 API Endpoints

### Auth
| Method | Route | Description |
|--------|-------|-------------|
| POST | /api/auth/register | Register new user |
| POST | /api/auth/login | Login |
| POST | /api/auth/logout | Logout |
| POST | /api/auth/refresh-token | Refresh access token |
| POST | /api/auth/forgot-password | Send reset email |
| PUT | /api/auth/reset-password/:token | Reset password |
| GET | /api/auth/me | Get current user |

### Products
| Method | Route | Description |
|--------|-------|-------------|
| GET | /api/products | Get all (search, filter, sort, paginate) |
| GET | /api/products/:id | Get single product |
| GET | /api/products/categories | All categories |
| POST | /api/products | Create (Admin) |
| PUT | /api/products/:id | Update (Admin) |
| DELETE | /api/products/:id | Delete (Admin) |
| POST | /api/products/:id/review | Add review |
| GET | /api/products/low-stock | Low stock alert (Admin) |

### Cart
| Method | Route | Description |
|--------|-------|-------------|
| GET | /api/cart | Get cart |
| POST | /api/cart/add | Add item |
| PUT | /api/cart/item/:productId | Update quantity |
| DELETE | /api/cart/item/:productId | Remove item |
| DELETE | /api/cart/clear | Clear cart |

### Orders
| Method | Route | Description |
|--------|-------|-------------|
| POST | /api/orders | Create order |
| GET | /api/orders/my-orders | My orders |
| GET | /api/orders/:id | Order detail |
| GET | /api/orders | All orders (Admin) |
| PUT | /api/orders/:id/status | Update status (Admin) |

### Payment
| Method | Route | Description |
|--------|-------|-------------|
| POST | /api/payment/create-order | Create Razorpay order |
| POST | /api/payment/verify | Verify payment signature |

### Admin
| Method | Route | Description |
|--------|-------|-------------|
| GET | /api/admin/dashboard | Stats, charts, best sellers |
| GET | /api/admin/users | All users |
| PUT | /api/admin/users/:id/role | Change user role |
| PUT | /api/admin/users/:id/toggle-status | Activate/deactivate |

---

## 🎯 Features Checklist

### Authentication
- [x] JWT Access Token (15 min) + Refresh Token (7 days)
- [x] HTTP-only cookie for refresh token security
- [x] Auto token refresh on expiry
- [x] Role-based access (User / Admin)
- [x] Protected routes frontend + backend
- [x] Forgot Password with email token
- [x] Reset Password page

### Products
- [x] Full product listing with pagination
- [x] Search (case-insensitive, partial match)
- [x] Filter by category, price range
- [x] Sort by price, rating, newest, best selling
- [x] Admin: Add/Edit/Delete product
- [x] Image upload via Cloudinary (up to 5 images)
- [x] Stock management with low stock alerts
- [x] Product reviews & star ratings

### Cart
- [x] Persistent cart in MongoDB (not localStorage)
- [x] Stock validation on add
- [x] Quantity controls with max = stock
- [x] Auto total calculation (subtotal, shipping, GST)
- [x] Free shipping over ₹999

### Orders
- [x] Checkout with shipping address form
- [x] Payment method selection (Razorpay / COD)
- [x] Order status: Pending → Processing → Shipped → Delivered
- [x] Status history tracking
- [x] Order detail with progress tracker
- [x] Admin order management with notes

### Payment
- [x] Razorpay integration (test + live ready)
- [x] Payment signature verification (HMAC SHA256)
- [x] COD option

### Admin Dashboard
- [x] Total users, orders, revenue, products
- [x] Monthly revenue line chart (Recharts)
- [x] Order status breakdown bar chart
- [x] Best selling products list
- [x] Low stock alerts
- [x] User management (role, activate/deactivate)

---

## 🔐 Default Admin

To create your first admin, register normally then update the role in MongoDB:
```js
db.users.updateOne({ email: "admin@example.com" }, { $set: { role: "admin" } })
```

---

## 📦 Production Build

```bash
cd frontend && npm run build
# Then serve with Express static or deploy frontend to Vercel/Netlify
# Deploy backend to Railway/Render/Heroku
```
