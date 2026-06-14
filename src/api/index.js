import api from './axios'

// ── Auth ─────────────────────────────────────────────────────
export const authApi = {
  register:  (data)         => api.post('/auth/register', data),
  login:     (data)         => api.post('/auth/login', data),
  logout:    ()             => api.post('/auth/logout'),
  me:        ()             => api.get('/auth/me'),
  refresh:   (token)        => api.post('/auth/refresh', { refresh_token: token }),
}

// ── User ─────────────────────────────────────────────────────
export const userApi = {
  getProfile:     ()       => api.get('/users/profile'),
  updateProfile:  (data)   => api.patch('/users/profile', data),
  changePassword: (data)   => api.patch('/users/change-password', data),
}

// ── Address ──────────────────────────────────────────────────
export const addressApi = {
  list:       ()           => api.get('/addresses'),
  create:     (data)       => api.post('/addresses', data),
  update:     (id, data)   => api.patch(`/addresses/${id}`, data),
  remove:     (id)         => api.delete(`/addresses/${id}`),
  setDefault: (id)         => api.patch(`/addresses/${id}/default`),
}

// ── Catalog ───────────────────────────────────────────────────
export const catalogApi = {
  categories: ()           => api.get('/categories'),
  brands:     ()           => api.get('/brands'),
}

// ── Product ──────────────────────────────────────────────────
export const productApi = {
  list:    (params)        => api.get('/products', { params }),
  getById: (id)            => api.get(`/products/${id}`),
}

// ── Cart ─────────────────────────────────────────────────────
export const cartApi = {
  get:        ()                       => api.get('/cart'),
  addItem:    (product_id, quantity)   => api.post('/cart/items', { product_id, quantity }),
  updateItem: (itemId, quantity)       => api.patch(`/cart/items/${itemId}`, { quantity }),
  removeItem: (itemId)                 => api.delete(`/cart/items/${itemId}`),
  clear:      ()                       => api.delete('/cart'),
}

// ── Order ────────────────────────────────────────────────────
export const orderApi = {
  create:    (data)        => api.post('/orders', data),
  myOrders:  ()            => api.get('/orders/my'),
  getMyOrder:(id)          => api.get(`/orders/my/${id}`),
  cancel:    (id)          => api.patch(`/orders/my/${id}/cancel`),
}

// ── Payment ──────────────────────────────────────────────────
export const paymentApi = {
  initiate:  (orderId, method) => api.post(`/payments/order/${orderId}/initiate`, { method }),
  getByOrder:(orderId)         => api.get(`/payments/order/${orderId}`),
}

// ── Shipment ─────────────────────────────────────────────────
export const shipmentApi = {
  getByOrder: (orderId)    => api.get(`/shipments/order/${orderId}`),
}

// ── Review ───────────────────────────────────────────────────
export const reviewApi = {
  listByProduct: (productId, params) => api.get(`/reviews/product/${productId}`, { params }),
  create:        (productId, data)   => api.post(`/reviews/product/${productId}`, data),
  update:        (reviewId, data)    => api.patch(`/reviews/${reviewId}`, data),
  remove:        (reviewId)          => api.delete(`/reviews/${reviewId}`),
}

// ── Coupon ───────────────────────────────────────────────────
export const couponApi = {
  check: (code, subtotal) => api.get('/coupons/check', { params: { code, subtotal } }),
}
