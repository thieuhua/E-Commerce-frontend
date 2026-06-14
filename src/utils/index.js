// ── Currency ─────────────────────────────────────────────────
export const formatVND = (amount) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(amount) || 0)

// ── Date ─────────────────────────────────────────────────────
export const formatDate = (date) =>
  date ? new Intl.DateTimeFormat('vi-VN', {
    year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(new Date(date)) : '—'

export const formatDateTime = (date) =>
  date ? new Intl.DateTimeFormat('vi-VN', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit',
  }).format(new Date(date)) : '—'

// ── Order status ─────────────────────────────────────────────
const ORDER_STATUS = {
  pending:    { label: 'Chờ xác nhận', color: 'warning' },
  confirmed:  { label: 'Đã xác nhận',  color: 'info'    },
  processing: { label: 'Đang xử lý',   color: 'info'    },
  shipping:   { label: 'Đang giao',    color: 'primary' },
  delivered:  { label: 'Đã giao',      color: 'success' },
  cancelled:  { label: 'Đã huỷ',       color: 'error'   },
  refunded:   { label: 'Đã hoàn tiền', color: 'default' },
}
export const getOrderStatus = (s) => ORDER_STATUS[s] ?? { label: s, color: 'default' }

// ── Payment status ───────────────────────────────────────────
const PAYMENT_STATUS = {
  pending:  { label: 'Chờ thanh toán', color: 'warning' },
  paid:     { label: 'Đã thanh toán',  color: 'success' },
  failed:   { label: 'Thất bại',       color: 'error'   },
  refunded: { label: 'Đã hoàn tiền',   color: 'default' },
}
export const getPaymentStatus = (s) => PAYMENT_STATUS[s] ?? { label: s, color: 'default' }

// ── Payment method ───────────────────────────────────────────
const PAYMENT_METHOD = {
  cod:           'Thanh toán khi nhận hàng (COD)',
  bank_transfer: 'Chuyển khoản ngân hàng',
  e_wallet:      'Ví điện tử',
  credit_card:   'Thẻ tín dụng',
}
export const getPaymentMethod = (m) => PAYMENT_METHOD[m] ?? m

// ── Shipment status ──────────────────────────────────────────
const SHIPMENT_STATUS = {
  preparing:  { label: 'Đang chuẩn bị',    color: 'warning' },
  picked_up:  { label: 'Đã lấy hàng',      color: 'info'    },
  in_transit: { label: 'Đang vận chuyển',   color: 'primary' },
  delivered:  { label: 'Đã giao',           color: 'success' },
  failed:     { label: 'Giao thất bại',     color: 'error'   },
  returned:   { label: 'Đã hoàn hàng',      color: 'default' },
}
export const getShipmentStatus = (s) => SHIPMENT_STATUS[s] ?? { label: s, color: 'default' }

// ── Image URL ─────────────────────────────────────────────────
export const getImageUrl = (path) => {
  if (!path) return '/placeholder.png'
  if (path.startsWith('http')) return path   // picsum từ seeder
  if (path.startsWith('/uploads')) return path  // local upload
  return '/placeholder.png'
}

// ── Text helpers ──────────────────────────────────────────────
export const truncate = (str, n = 80) =>
  str && str.length > n ? str.slice(0, n) + '…' : (str ?? '')
