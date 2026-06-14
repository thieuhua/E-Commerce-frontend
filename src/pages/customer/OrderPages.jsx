import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  Container, Typography, Box, Card, CardContent, Stack,
  Divider, Button, Chip, Grid, Paper, Stepper, Step,
  StepLabel, Alert, Skeleton, Table, TableBody, TableCell,
  TableHead, TableRow,
} from '@mui/material'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { orderApi, shipmentApi, paymentApi } from '@/api'
import { formatVND, formatDateTime, getImageUrl, getPaymentMethod } from '@/utils'
import StatusChip from '@/components/common/StatusChip'
import ConfirmDialog from '@/components/common/ConfirmDialog'
import EmptyState from '@/components/common/EmptyState'
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong'
import { useToast } from '@/hooks'

// ── Order status stepper ─────────────────────────────────────
const ORDER_STEPS = ['pending', 'confirmed', 'processing', 'shipping', 'delivered']
const STEP_LABELS = ['Chờ xác nhận', 'Đã xác nhận', 'Đang xử lý', 'Đang giao', 'Đã giao']

const OrderStepper = ({ status }) => {
  const activeStep = ORDER_STEPS.indexOf(status)
  if (status === 'cancelled' || status === 'refunded') return (
    <Alert severity="error" sx={{ mb: 2 }}>
      Đơn hàng đã {status === 'cancelled' ? 'bị huỷ' : 'được hoàn tiền'}
    </Alert>
  )
  return (
    <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 3 }}>
      {STEP_LABELS.map((label) => (
        <Step key={label}><StepLabel>{label}</StepLabel></Step>
      ))}
    </Stepper>
  )
}

// ── OrderListPage ────────────────────────────────────────────
export const OrderListPage = () => {
  const navigate = useNavigate()
  const { data, isLoading } = useQuery({
    queryKey: ['my-orders'],
    queryFn:  () => orderApi.myOrders(),
  })
  const orders = data?.data?.data ?? []

  if (isLoading) return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {Array.from({ length: 3 }).map((_, i) => (
        <Skeleton key={i} height={120} sx={{ mb: 2, borderRadius: 2 }} />
      ))}
    </Container>
  )

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h5" fontWeight={700} gutterBottom>Đơn hàng của tôi</Typography>

      {orders.length === 0 ? (
        <EmptyState icon={ReceiptLongIcon} title="Chưa có đơn hàng nào"
                    description="Hãy đặt hàng để bắt đầu theo dõi đơn của bạn"
                    action={() => navigate('/products')} actionLabel="Mua sắm ngay" />
      ) : (
        <Stack spacing={2}>
          {orders.map((order) => (
            <Card key={order.order_id} variant="outlined"
                  sx={{ cursor: 'pointer', '&:hover': { borderColor: 'primary.main' } }}
                  onClick={() => navigate(`/orders/${order.order_id}`)}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                  <Box>
                    <Typography variant="body2" fontWeight={700}>
                      Đơn #{order.order_id}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {formatDateTime(order.order_date)}
                    </Typography>
                  </Box>
                  <StatusChip type="order" status={order.status} />
                </Box>

                <Stack direction="row" spacing={1} sx={{ mb: 1.5, flexWrap: 'wrap' }}>
                  {order.items?.slice(0, 3).map((item) => (
                    <Box key={item.order_item_id} component="img"
                         src={getImageUrl(item.product?.images?.[0]?.image_url)}
                         sx={{ width: 48, height: 48, objectFit: 'contain',
                               borderRadius: 1, border: '1px solid', borderColor: 'divider', bgcolor: '#fafafa' }} />
                  ))}
                  {order.items?.length > 3 && (
                    <Box sx={{ width: 48, height: 48, borderRadius: 1, bgcolor: 'grey.100',
                               display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Typography variant="caption">+{order.items.length - 3}</Typography>
                    </Box>
                  )}
                </Stack>

                <Divider sx={{ mb: 1.5 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    {order.items?.length} sản phẩm
                  </Typography>
                  <Typography fontWeight={700} color="error.main">
                    {formatVND(order.total_amount)}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}
    </Container>
  )
}

// ── OrderDetailPage ──────────────────────────────────────────
export const OrderDetailPage = () => {
  const { id }       = useParams()
  const navigate     = useNavigate()
  const toast        = useToast()
  const qc           = useQueryClient()
  const [cancelDlg, setCancelDlg] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['order', id],
    queryFn:  () => orderApi.getMyOrder(id),
  })
  const { data: shipData } = useQuery({
    queryKey: ['shipment', id],
    queryFn:  () => shipmentApi.getByOrder(id),
    retry:    false,
  })
  const { data: payData } = useQuery({
    queryKey: ['payment', id],
    queryFn:  () => paymentApi.getByOrder(id),
    retry:    false,
  })

  const cancelMut = useMutation({
    mutationFn: () => orderApi.cancel(id),
    onSuccess:  () => {
      qc.invalidateQueries(['order', id])
      qc.invalidateQueries(['my-orders'])
      toast.success('Đơn hàng đã được huỷ')
      setCancelDlg(false)
    },
    onError: (err) => toast.apiError(err, 'Huỷ đơn thất bại'),
  })

  if (isLoading) return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Skeleton height={60} sx={{ mb: 2 }} />
      <Skeleton height={200} sx={{ mb: 2, borderRadius: 2 }} />
      <Skeleton height={300} sx={{ borderRadius: 2 }} />
    </Container>
  )

  const order    = data?.data?.data
  const shipment = shipData?.data?.data
  const payments = payData?.data?.data ?? []
  if (!order) return null

  const canCancel = ['pending', 'confirmed'].includes(order.status)

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h5" fontWeight={700}>Đơn hàng #{order.order_id}</Typography>
          <Typography variant="body2" color="text.secondary">
            Đặt lúc {formatDateTime(order.order_date)}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <StatusChip type="order" status={order.status} />
          {canCancel && (
            <Button variant="outlined" color="error" size="small" onClick={() => setCancelDlg(true)}>
              Huỷ đơn
            </Button>
          )}
        </Box>
      </Box>

      <Stack spacing={3}>
        {/* Stepper */}
        <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
          <OrderStepper status={order.status} />
          {shipment && (
            <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
              <Box><Typography variant="caption" color="text.secondary">Đơn vị vận chuyển</Typography>
                <Typography variant="body2" fontWeight={600}>{shipment.carrier ?? '—'}</Typography></Box>
              <Box><Typography variant="caption" color="text.secondary">Mã vận đơn</Typography>
                <Typography variant="body2" fontWeight={600}>{shipment.tracking_code ?? '—'}</Typography></Box>
              <Box><Typography variant="caption" color="text.secondary">Trạng thái vận chuyển</Typography>
                <StatusChip type="shipment" status={shipment.status} /></Box>
            </Box>
          )}
        </Paper>

        {/* Items */}
        <Paper variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden' }}>
          <Box sx={{ px: 3, py: 2, bgcolor: 'grey.50' }}>
            <Typography fontWeight={700}>Sản phẩm đã đặt</Typography>
          </Box>
          <Divider />
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Sản phẩm</TableCell>
                <TableCell align="center">Số lượng</TableCell>
                <TableCell align="right">Đơn giá</TableCell>
                <TableCell align="right">Thành tiền</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {order.items?.map((item) => (
                <TableRow key={item.order_item_id}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Box component="img"
                           src={getImageUrl(item.product?.images?.[0]?.image_url ?? item.product?.image_url)}
                           sx={{ width: 48, height: 48, objectFit: 'contain', borderRadius: 1,
                                 bgcolor: '#fafafa', flexShrink: 0 }} />
                      <Typography variant="body2" fontWeight={600}
                                  component={Link} to={`/products/${item.product_id}`}
                                  sx={{ textDecoration: 'none', color: 'inherit',
                                        '&:hover': { color: 'primary.main' } }}>
                        {item.product?.name ?? `Sản phẩm #${item.product_id}`}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell align="center">{item.quantity}</TableCell>
                  <TableCell align="right">{formatVND(item.unit_price)}</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>{formatVND(item.subtotal)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>

        {/* Summary + Address */}
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2, height: '100%' }}>
              <Typography fontWeight={700} gutterBottom>Địa chỉ giao hàng</Typography>
              {order.address_id && (
                <Stack spacing={0.5}>
                  <Typography variant="body2" fontWeight={600}>{order.address?.receiver_name}</Typography>
                  <Typography variant="body2" color="text.secondary">{order.address?.phone}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {[order.address?.detail, order.address?.ward, order.address?.district, order.address?.province]
                      .filter(Boolean).join(', ')}
                  </Typography>
                </Stack>
              )}
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2 }}>
              <Typography fontWeight={700} gutterBottom>Tổng tiền</Typography>
              <Stack spacing={1}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography color="text.secondary">Tạm tính</Typography>
                  <Typography>{formatVND(order.subtotal)}</Typography>
                </Box>
                {Number(order.discount_amount) > 0 && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography color="success.main">Giảm giá</Typography>
                    <Typography color="success.main">-{formatVND(order.discount_amount)}</Typography>
                  </Box>
                )}
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography color="text.secondary">Phí vận chuyển</Typography>
                  <Typography>{formatVND(order.shipping_fee)}</Typography>
                </Box>
                <Divider />
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography fontWeight={700}>Tổng cộng</Typography>
                  <Typography fontWeight={800} color="error.main">{formatVND(order.total_amount)}</Typography>
                </Box>
              </Stack>
            </Paper>
          </Grid>
        </Grid>

        {/* Payment */}
        {payments.length > 0 && (
          <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2 }}>
            <Typography fontWeight={700} gutterBottom>Thông tin thanh toán</Typography>
            <Stack spacing={1}>
              {payments.map((p) => (
                <Box key={p.payment_id} sx={{ display: 'flex', justifyContent: 'space-between',
                                              alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                  <Box>
                    <Typography variant="body2" fontWeight={600}>{getPaymentMethod(p.method)}</Typography>
                    {p.paid_at && (
                      <Typography variant="caption" color="text.secondary">
                        {formatDateTime(p.paid_at)}
                      </Typography>
                    )}
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography fontWeight={600}>{formatVND(p.amount)}</Typography>
                    <StatusChip type="payment" status={p.status} />
                  </Box>
                </Box>
              ))}
            </Stack>
          </Paper>
        )}

        <Button variant="outlined" onClick={() => navigate('/orders')} sx={{ alignSelf: 'flex-start' }}>
          ← Quay lại danh sách đơn hàng
        </Button>
      </Stack>

      <ConfirmDialog
        open={cancelDlg} onClose={() => setCancelDlg(false)}
        onConfirm={() => cancelMut.mutate()}
        loading={cancelMut.isPending}
        title="Huỷ đơn hàng?"
        description="Bạn có chắc muốn huỷ đơn hàng này? Hành động không thể hoàn tác."
        confirmLabel="Huỷ đơn"
      />
    </Container>
  )
}
