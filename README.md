# TechShop — Frontend (React + MUI)

## Tech stack
- **React 18** + Vite
- **MUI v6** — UI components
- **React Router v6** — routing
- **TanStack Query v5** — server state, caching
- **Zustand** — client state (auth, cart)
- **Axios** — HTTP client với JWT interceptor

## Cấu trúc thư mục
```
src/
├── api/
│   ├── axios.js          # Axios instance + JWT interceptor + auto refresh
│   └── index.js          # Tất cả API functions theo module
├── components/
│   ├── common/
│   │   ├── LoadingScreen.jsx
│   │   ├── EmptyState.jsx
│   │   ├── ConfirmDialog.jsx
│   │   ├── StatusChip.jsx
│   │   ├── StarRating.jsx
│   │   ├── RouteGuards.jsx
│   │   └── AddressFormDialog.jsx
│   ├── layout/
│   │   ├── Navbar.jsx
│   │   ├── Footer.jsx
│   │   └── index.jsx     # MainLayout, AuthLayout
│   └── product/
│       ├── ProductCard.jsx
│       └── ProductFilter.jsx
├── hooks/
│   ├── useAuth.js        # login, register, logout
│   ├── useCart.js        # addItem, updateItem, removeItem
│   └── useToast.js       # wrapper react-hot-toast
├── pages/
│   ├── auth/
│   │   └── AuthPages.jsx       # LoginPage, RegisterPage
│   ├── customer/
│   │   ├── HomePage.jsx
│   │   ├── ProductListPage.jsx
│   │   ├── ProductDetailPage.jsx
│   │   ├── CartPage.jsx
│   │   ├── CheckoutPage.jsx
│   │   ├── OrderPages.jsx      # OrderListPage, OrderDetailPage
│   │   └── ProfilePages.jsx    # ProfilePage, AddressPage, ChangePasswordPage
│   └── error/
│       └── ErrorPages.jsx      # NotFoundPage, ErrorPage
├── stores/
│   ├── authStore.js      # Zustand — user, isAuth, restoreSession
│   └── cartStore.js      # Zustand — cart, itemCount, total
├── theme/
│   └── index.js          # MUI theme (màu, typography, components)
├── utils/
│   └── index.js          # formatVND, formatDate, status helpers
├── App.jsx               # Router + Provider wiring + session restore
└── main.jsx
```

## Chạy local
```bash
# Đảm bảo backend đang chạy tại port 3000
npm install
npm run dev    # → http://localhost:5173
```

Vite proxy tự forward `/api/*` và `/uploads/*` sang backend — không cần cấu hình CORS khi dev.

## Trang đã có
| Trang | Route |
|---|---|
| Trang chủ | `/` |
| Danh sách sản phẩm | `/products` |
| Chi tiết sản phẩm | `/products/:id` |
| Giỏ hàng | `/cart` |
| Thanh toán | `/checkout` |
| Danh sách đơn hàng | `/orders` |
| Chi tiết đơn hàng | `/orders/:id` |
| Hồ sơ cá nhân | `/profile` |
| Địa chỉ giao hàng | `/addresses` |
| Đổi mật khẩu | `/change-password` |
| Đăng nhập | `/login` |
| Đăng ký | `/register` |

## Tài khoản test (sau khi seed)
```
admin@shop.vn   / Admin@123   (admin)
vana@gmail.com  / Pass@1234   (customer — có đơn delivered, có thể review)
```

## Quick fill buttons
Ở môi trường dev, trang login có nút quick-fill để điền sẵn tài khoản test.
