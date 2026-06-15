import { useNavigate } from 'react-router-dom'
import {
  Grid, Box, Typography, Card, CardContent, Table, TableBody,
  TableCell, TableHead, TableRow, Button, Chip, Paper, Divider,
  Alert,
} from '@mui/material'
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong'
import InventoryIcon   from '@mui/icons-material/Inventory'
import PeopleIcon      from '@mui/icons-material/People'
import AttachMoneyIcon from '@mui/icons-material/AttachMoney'
import WarningAmberIcon from '@mui/icons-material/WarningAmber'
import { useQuery }    from '@tanstack/react-query'
import { adminApi }    from '@/api'
import { formatVND, formatDateTime, getOrderStatus } from '@/utils'
import { StatCard, MiniBarChart } from '@/components/admin/StatCard'
import StatusChip from '@/components/common/StatusChip'

const AdminDashboardPage = () => {
  const navigate = useNavigate()

  const { data, isLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn:  () => adminApi.stats(),
    refetchInterval: 60_000, // auto refresh mỗi phút
  })

  const stats = data?.data?.data

  const statCards = [
    {
      icon: AttachMoneyIcon, color: '#1565C0', bg: '#E3F2FD',
      label: 'Doanh thu tháng này',
      value: formatVND(stats?.revenue?.thisMonth ?? 0),
      sub:   `Hôm nay: ${formatVND(stats?.revenue?.today ?? 0)}`,
      trend: stats?.revenue?.growth,
    },
    {
      icon: ReceiptLongIcon, color: '#2E7D32', bg: '#E8F5E9',
      label: 'Tổng đơn hàng',
      value: (stats?.orders?.total ?? 0).toLocaleString('vi'),
      sub:   `Hôm nay: ${stats?.orders?.today ?? 0} đơn · Chờ xử lý: ${stats?.orders?.pending ?? 0}`,
    },
    {
      icon: InventoryIcon, color: '#E65100', bg: '#FFF3E0',
      label: 'Sản phẩm',
      value: (stats?.products?.total ?? 0).toLocaleString('vi'),
      sub:   `Sắp hết hàng: ${stats?.products?.lowStock ?? 0} sản phẩm`,
    },
    {
      icon: PeopleIcon, color: '#6A1B9A', bg: '#F3E5F5',
      label: 'Khách hàng',
      value: (stats?.users?.total ?? 0).toLocaleString('vi'),
      sub:   `Mới tháng này: +${stats?.users?.newThisMonth ?? 0}`,
    },
  ]

  const byStatus = stats?.orders?.byStatus ?? {}

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight={700}>Tổng quan</Typography>
        <Typography variant="body2" color="text.secondary">
          Cập nhật lúc {new Date().toLocaleTimeString('vi-VN')}
        </Typography>
      </Box>

      {/* Low stock alert */}
      {(stats?.products?.lowStock ?? 0) > 0 && (
        <Alert severity="warning" icon={<WarningAmberIcon />} sx={{ mb: 3 }}
               action={<Button size="small" onClick={() => navigate('/admin/products')}>Xem ngay</Button>}>
          Có <strong>{stats.products.lowStock}</strong> sản phẩm sắp hết hàng (tồn kho ≤ 5).
        </Alert>
      )}

      {/* Stat cards */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        {statCards.map((card) => (
          <Grid item xs={12} sm={6} lg={3} key={card.label}>
            <StatCard {...card} loading={isLoading} />
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={2.5}>
        {/* Revenue chart */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Box>
                  <Typography variant="h6" fontWeight={700}>Doanh thu 7 ngày qua</Typography>
                  <Typography variant="caption" color="text.secondary">Tính theo ngày thanh toán</Typography>
                </Box>
                <Typography variant="h6" fontWeight={800} color="primary.main">
                  {formatVND(stats?.revenue?.last7Days?.reduce((s, d) => s + d.revenue, 0) ?? 0)}
                </Typography>
              </Box>
              <MiniBarChart data={stats?.revenue?.last7Days ?? []} loading={isLoading} />
            </CardContent>
          </Card>
        </Grid>

        {/* Order status breakdown */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" fontWeight={700} gutterBottom>Trạng thái đơn hàng</Typography>
              <Divider sx={{ mb: 2 }} />
              {Object.entries(byStatus).length === 0 && isLoading
                ? <Typography color="text.secondary">Đang tải...</Typography>
                : Object.entries({
                    pending: 0, confirmed: 0, processing: 0,
                    shipping: 0, delivered: 0, cancelled: 0,
                    ...byStatus,
                  }).map(([status, count]) => {
                    const { label } = getOrderStatus(status)
                    const total     = Object.values(byStatus).reduce((a, b) => a + b, 0) || 1
                    const pct       = Math.round((count / total) * 100)
                    return (
                      <Box key={status} sx={{ mb: 1.5 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.4 }}>
                          <Typography variant="body2">{label}</Typography>
                          <Typography variant="body2" fontWeight={700}>{count}</Typography>
                        </Box>
                        <Box sx={{ height: 6, bgcolor: 'divider', borderRadius: 3, overflow: 'hidden' }}>
                          <Box sx={{ height: '100%', width: `${pct}%`, bgcolor: 'primary.main',
                                     borderRadius: 3, transition: 'width .4s' }} />
                        </Box>
                      </Box>
                    )
                  })}
            </CardContent>
          </Card>
        </Grid>

        {/* Recent orders */}
        <Grid item xs={12}>
          <Card>
            <CardContent sx={{ pb: '16px !important' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" fontWeight={700}>Đơn hàng gần đây</Typography>
                <Button size="small" onClick={() => navigate('/admin/orders')}>Xem tất cả →</Button>
              </Box>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Mã đơn</TableCell>
                    <TableCell>Khách hàng</TableCell>
                    <TableCell>Thời gian</TableCell>
                    <TableCell align="right">Tổng tiền</TableCell>
                    <TableCell align="center">Trạng thái</TableCell>
                    <TableCell />
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(stats?.recentOrders ?? []).map((o) => (
                    <TableRow key={o.order_id} hover>
                      <TableCell sx={{ fontWeight: 700 }}>#{o.order_id}</TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600}>{o.User?.full_name}</Typography>
                        <Typography variant="caption" color="text.secondary">{o.User?.email}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption">{formatDateTime(o.order_date)}</Typography>
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700 }}>
                        {formatVND(o.total_amount)}
                      </TableCell>
                      <TableCell align="center">
                        <StatusChip type="order" status={o.status} />
                      </TableCell>
                      <TableCell>
                        <Button size="small" onClick={() => navigate(`/admin/orders/${o.order_id}`)}>
                          Xem
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}

export default AdminDashboardPage
