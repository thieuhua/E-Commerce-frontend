import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box, Card, Table, TableBody, TableCell, TableHead, TableRow,
  Typography, Button, Select, MenuItem, FormControl, Pagination,
  Chip, Dialog, DialogTitle, DialogContent, DialogActions,
  Grid, Paper, Stack, Divider, TextField, IconButton, InputAdornment,
} from '@mui/material'
import SearchIcon       from '@mui/icons-material/Search'
import LocalShippingIcon from '@mui/icons-material/LocalShipping'
import CloseIcon        from '@mui/icons-material/Close'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminApi, paymentApi, shipmentApi } from '@/api'
import { formatVND, formatDateTime, getOrderStatus, getPaymentMethod } from '@/utils'
import StatusChip from '@/components/common/StatusChip'
import { useToast } from '@/hooks'

const ORDER_STATUSES = ['pending','confirmed','processing','shipping','delivered','cancelled','refunded']

// ── Order Detail Dialog ───────────────────────────────────────
const OrderDetailDialog = ({ order, open, onClose }) => {
  const qc    = useQueryClient()
  const toast = useToast()
  const [newStatus,     setNewStatus]     = useState(order?.status ?? '')
  const [trackingCode,  setTrackingCode]  = useState('')
  const [carrier,       setCarrier]       = useState('')
  const [updatingStatus, setUpdatingStatus] = useState(false)
  const [creatingShip,   setCreatingShip]   = useState(false)

  const { data: payData } = useQuery({
    queryKey: ['admin-payment', order?.order_id],
    queryFn:  () => paymentApi.getByOrder(order?.order_id),
    enabled:  !!order?.order_id,
  })
  const { data: shipData } = useQuery({
    queryKey: ['admin-shipment', order?.order_id],
    queryFn:  () => shipmentApi.getByOrder(order?.order_id),
    enabled:  !!order?.order_id,
    retry:    false,
  })

  const payments = payData?.data?.data  ?? []
  const shipment = shipData?.data?.data ?? null

  const handleUpdateStatus = async () => {
    if (newStatus === order.status) return
    setUpdatingStatus(true)
    try {
      await adminApi.updateOrderStatus(order.order_id, newStatus)
      qc.invalidateQueries(['admin-orders'])
      toast.success('Đã cập nhật trạng thái đơn hàng')
      onClose()
    } catch (err) { toast.apiError(err) }
    finally { setUpdatingStatus(false) }
  }

  const handleCreateShipment = async () => {
    setCreatingShip(true)
    try {
      await adminApi.createShipment(order.order_id, { tracking_code: trackingCode, carrier })
      qc.invalidateQueries(['admin-shipment', order.order_id])
      qc.invalidateQueries(['admin-orders'])
      toast.success('Đã tạo thông tin vận chuyển')
    } catch (err) { toast.apiError(err) }
    finally { setCreatingShip(false) }
  }

  const handleConfirmPayment = async (paymentId) => {
    try {
      await adminApi.confirmPayment(paymentId, {})
      qc.invalidateQueries(['admin-payment', order.order_id])
      toast.success('Đã xác nhận thanh toán')
    } catch (err) { toast.apiError(err) }
  }

  if (!order) return null

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h6" fontWeight={700}>Đơn hàng #{order.order_id}</Typography>
          <Typography variant="caption" color="text.secondary">{formatDateTime(order.order_date)}</Typography>
        </Box>
        <IconButton onClick={onClose}><CloseIcon /></IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <Grid container spacing={2.5}>
          {/* Status control */}
          <Grid item xs={12}>
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
              <Typography variant="subtitle2" fontWeight={700} gutterBottom>Cập nhật trạng thái</Typography>
              <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', flexWrap: 'wrap' }}>
                <Typography variant="body2" color="text.secondary">Hiện tại:</Typography>
                <StatusChip type="order" status={order.status} />
                <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>→ Chuyển sang:</Typography>
                <FormControl size="small" sx={{ minWidth: 180 }}>
                  <Select value={newStatus} onChange={(e) => setNewStatus(e.target.value)}>
                    {ORDER_STATUSES.map(s => {
                      const { label } = getOrderStatus(s)
                      return <MenuItem key={s} value={s}>{label}</MenuItem>
                    })}
                  </Select>
                </FormControl>
                <Button variant="contained" size="small"
                        disabled={newStatus === order.status || updatingStatus}
                        onClick={handleUpdateStatus}>
                  {updatingStatus ? 'Đang lưu...' : 'Cập nhật'}
                </Button>
              </Box>
            </Paper>
          </Grid>

          {/* Items */}
          <Grid item xs={12}>
            <Typography variant="subtitle2" fontWeight={700} gutterBottom>Sản phẩm đặt mua</Typography>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Sản phẩm</TableCell>
                  <TableCell align="center">SL</TableCell>
                  <TableCell align="right">Đơn giá</TableCell>
                  <TableCell align="right">Thành tiền</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {order.items?.map((item) => (
                  <TableRow key={item.order_item_id}>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>
                        {item.product?.name ?? `#${item.product_id}`}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">{item.quantity}</TableCell>
                    <TableCell align="right">{formatVND(item.unit_price)}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700 }}>{formatVND(item.subtotal)}</TableCell>
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell colSpan={3} align="right" sx={{ fontWeight: 600 }}>Tạm tính</TableCell>
                  <TableCell align="right">{formatVND(order.subtotal)}</TableCell>
                </TableRow>
                {Number(order.discount_amount) > 0 && (
                  <TableRow>
                    <TableCell colSpan={3} align="right" sx={{ color: 'success.main' }}>Giảm giá</TableCell>
                    <TableCell align="right" sx={{ color: 'success.main' }}>-{formatVND(order.discount_amount)}</TableCell>
                  </TableRow>
                )}
                <TableRow>
                  <TableCell colSpan={3} align="right" sx={{ fontWeight: 700 }}>Tổng cộng</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 800, color: 'error.main' }}>
                    {formatVND(order.total_amount)}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </Grid>

          {/* Payment */}
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" fontWeight={700} gutterBottom>Thanh toán</Typography>
            <Stack spacing={1}>
              {payments.map(p => (
                <Paper key={p.payment_id} variant="outlined" sx={{ p: 1.5, borderRadius: 1.5 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography variant="body2" fontWeight={600}>{getPaymentMethod(p.method)}</Typography>
                      <Typography variant="caption" color="text.secondary">{formatVND(p.amount)}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                      <StatusChip type="payment" status={p.status} />
                      {p.status === 'pending' && (
                        <Button size="small" variant="outlined" color="success"
                                onClick={() => handleConfirmPayment(p.payment_id)}>
                          Xác nhận
                        </Button>
                      )}
                    </Box>
                  </Box>
                </Paper>
              ))}
            </Stack>
          </Grid>

          {/* Shipment */}
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" fontWeight={700} gutterBottom>Vận chuyển</Typography>
            {shipment ? (
              <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 1.5 }}>
                <Stack spacing={0.75}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">Trạng thái</Typography>
                    <StatusChip type="shipment" status={shipment.status} />
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">Mã vận đơn</Typography>
                    <Typography variant="body2" fontWeight={600}>{shipment.tracking_code || '—'}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">Đơn vị VC</Typography>
                    <Typography variant="body2">{shipment.carrier || '—'}</Typography>
                  </Box>
                </Stack>
              </Paper>
            ) : ['confirmed','processing'].includes(order.status) ? (
              <Paper variant="outlined" sx={{ p: 2, borderRadius: 1.5 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>Tạo thông tin vận chuyển</Typography>
                <Stack spacing={1.5}>
                  <TextField size="small" label="Đơn vị vận chuyển (GHN, GHTK...)"
                             value={carrier} onChange={e => setCarrier(e.target.value)} />
                  <TextField size="small" label="Mã vận đơn"
                             value={trackingCode} onChange={e => setTrackingCode(e.target.value)} />
                  <Button variant="contained" size="small" startIcon={<LocalShippingIcon />}
                          onClick={handleCreateShipment} disabled={creatingShip}>
                    {creatingShip ? 'Đang tạo...' : 'Tạo vận chuyển'}
                  </Button>
                </Stack>
              </Paper>
            ) : (
              <Typography variant="body2" color="text.secondary">
                Chưa có thông tin vận chuyển
              </Typography>
            )}
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose}>Đóng</Button>
      </DialogActions>
    </Dialog>
  )
}

// ── Main Page ─────────────────────────────────────────────────
const AdminOrderPage = () => {
  const [page,    setPage]    = useState(1)
  const [status,  setStatus]  = useState('')
  const [search,  setSearch]  = useState('')
  const [query,   setQuery]   = useState('')
  const [selected, setSelected] = useState(null)

  const { data, isLoading } = useQuery({
    queryKey: ['admin-orders', page, status, query],
    queryFn:  () => adminApi.listOrders({ page, limit: 15, status: status || undefined }),
  })

  const orders     = data?.data?.data ?? []
  const pagination = data?.data?.pagination ?? {}

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight={700}>Quản lý đơn hàng</Typography>
        <Typography variant="body2" color="text.secondary">{pagination.total ?? 0} đơn hàng</Typography>
      </Box>

      {/* Filters */}
      <Card sx={{ mb: 2 }}>
        <Box sx={{ p: 2, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <Select value={status} onChange={e => { setStatus(e.target.value); setPage(1) }}
                    displayEmpty renderValue={v => v ? getOrderStatus(v).label : 'Tất cả trạng thái'}>
              <MenuItem value="">Tất cả</MenuItem>
              {ORDER_STATUSES.map(s => (
                <MenuItem key={s} value={s}>{getOrderStatus(s).label}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </Card>

      <Card>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Mã đơn</TableCell>
              <TableCell>Khách hàng</TableCell>
              <TableCell>Thời gian đặt</TableCell>
              <TableCell align="right">Tổng tiền</TableCell>
              <TableCell align="center">Trạng thái</TableCell>
              <TableCell align="center">Thao tác</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading
              ? Array.from({ length: 8 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 6 }).map((_, j) => (
                      <TableCell key={j}><Box sx={{ height: 20, bgcolor: 'grey.100', borderRadius: 1 }} /></TableCell>
                    ))}
                  </TableRow>
                ))
              : orders.map((o) => (
                  <TableRow key={o.order_id} hover>
                    <TableCell sx={{ fontWeight: 700 }}>#{o.order_id}</TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>{o.User?.full_name ?? '—'}</Typography>
                      <Typography variant="caption" color="text.secondary">{o.User?.email}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption">{formatDateTime(o.order_date)}</Typography>
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700, color: 'error.main' }}>
                      {formatVND(o.total_amount)}
                    </TableCell>
                    <TableCell align="center">
                      <StatusChip type="order" status={o.status} />
                    </TableCell>
                    <TableCell align="center">
                      <Button size="small" variant="outlined" onClick={() => setSelected(o)}>
                        Chi tiết
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
          </TableBody>
        </Table>

        {pagination.totalPages > 1 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
            <Pagination count={pagination.totalPages} page={page}
                        color="primary" onChange={(_, p) => setPage(p)} />
          </Box>
        )}
      </Card>

      <OrderDetailDialog
        order={selected} open={!!selected}
        onClose={() => setSelected(null)}
      />
    </Box>
  )
}

export default AdminOrderPage
