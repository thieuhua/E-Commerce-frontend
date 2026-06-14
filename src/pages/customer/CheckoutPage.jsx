import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Container, Grid, Box, Typography, Button, Paper, Divider,
  Stack, Radio, RadioGroup, FormControlLabel, TextField,
  Alert, Chip, CircularProgress, Card, CardContent,
} from '@mui/material'
import LocationOnIcon   from '@mui/icons-material/LocationOn'
import AddIcon          from '@mui/icons-material/Add'
import LocalOfferIcon   from '@mui/icons-material/LocalOffer'
import { useQuery }     from '@tanstack/react-query'
import { addressApi, orderApi, paymentApi, couponApi } from '@/api'
import { formatVND, getImageUrl } from '@/utils'
import { useCart, useToast } from '@/hooks'
import AddressFormDialog from '@/components/common/AddressFormDialog'

const PAYMENT_METHODS = [
  { value: 'cod',           label: 'Thanh toán khi nhận hàng (COD)', icon: '💵' },
  { value: 'bank_transfer', label: 'Chuyển khoản ngân hàng',          icon: '🏦' },
  { value: 'e_wallet',      label: 'Ví điện tử (MoMo, ZaloPay...)',   icon: '📱' },
]

const CheckoutPage = () => {
  const navigate   = useNavigate()
  const toast      = useToast()
  const { cart, fetchCart } = useCart()

  const [selectedAddr, setSelectedAddr]     = useState(null)
  const [paymentMethod, setPaymentMethod]   = useState('cod')
  const [couponCode, setCouponCode]         = useState('')
  const [couponData, setCouponData]         = useState(null)
  const [couponError, setCouponError]       = useState('')
  const [checkingCoupon, setCheckingCoupon] = useState(false)
  const [note, setNote]                     = useState('')
  const [submitting, setSubmitting]         = useState(false)
  const [addrDialog, setAddrDialog]         = useState(false)

  const { data: addrRes, refetch: refetchAddr } = useQuery({
    queryKey: ['addresses'],
    queryFn:  () => addressApi.list(),
    onSuccess: (res) => {
      const addrs = res.data.data
      if (!selectedAddr && addrs.length) {
        setSelectedAddr(addrs.find(a => a.is_default)?.address_id ?? addrs[0].address_id)
      }
    },
  })
  const addresses = addrRes?.data?.data ?? []

  const items    = cart?.items ?? []
  const subtotal = cart?.total ?? 0
  const shipping = 30000
  const discount = couponData?.discountAmount ?? 0
  const total    = subtotal + shipping - discount

  // ── Coupon ───────────────────────────────────────────────
  const handleCheckCoupon = async () => {
    if (!couponCode.trim()) return
    setCheckingCoupon(true)
    setCouponError('')
    setCouponData(null)
    try {
      const { data } = await couponApi.check(couponCode.trim(), subtotal)
      setCouponData(data.data)
      toast.success(`Áp dụng thành công — giảm ${formatVND(data.data.discountAmount)}`)
    } catch (err) {
      setCouponError(err.response?.data?.message ?? 'Mã không hợp lệ')
    } finally {
      setCheckingCoupon(false)
    }
  }

  const removeCoupon = () => { setCouponData(null); setCouponCode(''); setCouponError('') }

  // ── Submit ────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!selectedAddr) return toast.error('Vui lòng chọn địa chỉ giao hàng')
    if (items.length === 0) return toast.error('Giỏ hàng trống')

    setSubmitting(true)
    try {
      const { data: orderRes } = await orderApi.create({
        address_id:  selectedAddr,
        coupon_code: couponData?.code,
        note:        note || undefined,
      })
      const order = orderRes.data

      await paymentApi.initiate(order.order_id, paymentMethod)
      await fetchCart()

      toast.success('Đặt hàng thành công!')
      navigate(`/orders/${order.order_id}`, { replace: true })
    } catch (err) {
      toast.apiError(err, 'Đặt hàng thất bại')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h5" fontWeight={700} gutterBottom>Thanh toán</Typography>

      <Grid container spacing={3}>
        {/* Left */}
        <Grid item xs={12} md={7}>
          <Stack spacing={3}>
            {/* Address */}
            <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography fontWeight={700} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LocationOnIcon color="primary" /> Địa chỉ giao hàng
                </Typography>
                <Button size="small" startIcon={<AddIcon />} onClick={() => setAddrDialog(true)}>
                  Thêm mới
                </Button>
              </Box>

              {addresses.length === 0 ? (
                <Alert severity="warning">Bạn chưa có địa chỉ giao hàng. Vui lòng thêm mới.</Alert>
              ) : (
                <RadioGroup value={selectedAddr} onChange={(e) => setSelectedAddr(Number(e.target.value))}>
                  <Stack spacing={1.5}>
                    {addresses.map((addr) => (
                      <Paper key={addr.address_id} variant="outlined" sx={{
                        p: 2, borderRadius: 1.5, cursor: 'pointer',
                        borderColor: selectedAddr === addr.address_id ? 'primary.main' : 'divider',
                        bgcolor: selectedAddr === addr.address_id ? 'primary.50' : 'transparent',
                      }} onClick={() => setSelectedAddr(addr.address_id)}>
                        <FormControlLabel
                          value={addr.address_id} control={<Radio size="small" />}
                          sx={{ m: 0, width: '100%' }}
                          label={
                            <Box>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Typography variant="body2" fontWeight={600}>{addr.receiver_name}</Typography>
                                <Typography variant="body2" color="text.secondary">|</Typography>
                                <Typography variant="body2" color="text.secondary">{addr.phone}</Typography>
                                {addr.is_default === 1 && <Chip label="Mặc định" size="small" color="primary" />}
                              </Box>
                              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
                                {addr.detail}, {addr.ward}, {addr.district}, {addr.province}
                              </Typography>
                            </Box>
                          }
                        />
                      </Paper>
                    ))}
                  </Stack>
                </RadioGroup>
              )}
            </Paper>

            {/* Payment method */}
            <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
              <Typography fontWeight={700} sx={{ mb: 2 }}>Phương thức thanh toán</Typography>
              <RadioGroup value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                <Stack spacing={1}>
                  {PAYMENT_METHODS.map((m) => (
                    <Paper key={m.value} variant="outlined" sx={{
                      p: 1.5, borderRadius: 1.5, cursor: 'pointer',
                      borderColor: paymentMethod === m.value ? 'primary.main' : 'divider',
                    }} onClick={() => setPaymentMethod(m.value)}>
                      <FormControlLabel value={m.value} control={<Radio size="small" />} sx={{ m: 0 }}
                        label={<Typography variant="body2">{m.icon} {m.label}</Typography>} />
                    </Paper>
                  ))}
                </Stack>
              </RadioGroup>
            </Paper>

            {/* Note */}
            <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
              <Typography fontWeight={700} sx={{ mb: 2 }}>Ghi chú đơn hàng</Typography>
              <TextField fullWidth multiline rows={3} placeholder="Ghi chú cho người giao hàng..."
                         value={note} onChange={(e) => setNote(e.target.value)} />
            </Paper>
          </Stack>
        </Grid>

        {/* Right — Order summary */}
        <Grid item xs={12} md={5}>
          <Paper variant="outlined" sx={{ p: 3, borderRadius: 2, position: 'sticky', top: 80 }}>
            <Typography fontWeight={700} gutterBottom>Đơn hàng ({items.length} sản phẩm)</Typography>

            {/* Items */}
            <Stack spacing={1.5} sx={{ mb: 2 }}>
              {items.map(({ cart_item_id, quantity, product }) => (
                <Box key={cart_item_id} sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
                  <Box component="img" src={getImageUrl(product?.images?.[0]?.image_url)}
                       sx={{ width: 48, height: 48, objectFit: 'contain', bgcolor: '#fafafa',
                             borderRadius: 1, flexShrink: 0 }} />
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="caption" noWrap display="block" fontWeight={600}>
                      {product?.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">x{quantity}</Typography>
                  </Box>
                  <Typography variant="body2" fontWeight={600}>
                    {formatVND(Number(product?.price) * quantity)}
                  </Typography>
                </Box>
              ))}
            </Stack>

            <Divider sx={{ mb: 2 }} />

            {/* Coupon */}
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" fontWeight={600} sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <LocalOfferIcon fontSize="small" color="secondary" /> Mã giảm giá
              </Typography>
              {couponData ? (
                <Alert severity="success" onClose={removeCoupon}>
                  {couponData.code} — Giảm {formatVND(couponData.discountAmount)}
                </Alert>
              ) : (
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <TextField size="small" placeholder="Nhập mã giảm giá" fullWidth
                             value={couponCode} onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                             error={!!couponError} helperText={couponError}
                             onKeyDown={(e) => e.key === 'Enter' && handleCheckCoupon()} />
                  <Button variant="outlined" onClick={handleCheckCoupon}
                          disabled={checkingCoupon || !couponCode.trim()} sx={{ flexShrink: 0 }}>
                    {checkingCoupon ? <CircularProgress size={18} /> : 'Áp dụng'}
                  </Button>
                </Box>
              )}
            </Box>

            <Divider sx={{ mb: 2 }} />

            {/* Price breakdown */}
            <Stack spacing={1.5}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography color="text.secondary">Tạm tính</Typography>
                <Typography>{formatVND(subtotal)}</Typography>
              </Box>
              {discount > 0 && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography color="success.main">Giảm giá</Typography>
                  <Typography color="success.main" fontWeight={600}>-{formatVND(discount)}</Typography>
                </Box>
              )}
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography color="text.secondary">Phí vận chuyển</Typography>
                <Typography>{formatVND(shipping)}</Typography>
              </Box>
              <Divider />
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography fontWeight={700} variant="h6">Tổng cộng</Typography>
                <Typography fontWeight={800} variant="h6" color="error.main">{formatVND(total)}</Typography>
              </Box>
            </Stack>

            <Button
              fullWidth variant="contained" size="large" sx={{ mt: 3 }}
              onClick={handleSubmit} disabled={submitting || items.length === 0}
            >
              {submitting ? <CircularProgress size={22} color="inherit" /> : 'Đặt hàng'}
            </Button>
          </Paper>
        </Grid>
      </Grid>

      <AddressFormDialog
        open={addrDialog}
        onClose={() => setAddrDialog(false)}
        onSuccess={() => { refetchAddr(); setAddrDialog(false) }}
      />
    </Container>
  )
}

export default CheckoutPage
