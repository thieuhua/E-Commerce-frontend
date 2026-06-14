import { useNavigate } from 'react-router-dom'
import {
  Container, Grid, Box, Typography, Button, Card, CardContent,
  IconButton, Divider, Stack, Paper,
} from '@mui/material'
import DeleteIcon    from '@mui/icons-material/Delete'
import AddIcon       from '@mui/icons-material/Add'
import RemoveIcon    from '@mui/icons-material/Remove'
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart'
import { formatVND, getImageUrl } from '@/utils'
import { useCart } from '@/hooks'
import EmptyState from '@/components/common/EmptyState'

const CartPage = () => {
  const navigate = useNavigate()
  const { cart, loading, updateItem, removeItem } = useCart()

  const items = cart?.items ?? []

  if (!loading && items.length === 0) return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <EmptyState
        icon={ShoppingCartIcon}
        title="Giỏ hàng trống"
        description="Hãy thêm sản phẩm vào giỏ hàng để tiếp tục"
        action={() => navigate('/products')}
        actionLabel="Tiếp tục mua sắm"
      />
    </Container>
  )

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h5" fontWeight={700} gutterBottom>
        Giỏ hàng ({items.length} sản phẩm)
      </Typography>

      <Grid container spacing={3}>
        {/* Items */}
        <Grid item xs={12} md={8}>
          <Stack spacing={2}>
            {items.map((item) => {
              const { cart_item_id, quantity, product } = item
              if (!product) return null
              return (
                <Card key={cart_item_id} variant="outlined">
                  <CardContent sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    <Box
                      component="img"
                      src={getImageUrl(product.images?.[0]?.image_url)}
                      alt={product.name}
                      sx={{ width: 80, height: 80, objectFit: 'contain', borderRadius: 1,
                            bgcolor: '#fafafa', flexShrink: 0, cursor: 'pointer' }}
                      onClick={() => navigate(`/products/${product.product_id}`)}
                    />
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography
                        variant="body2" fontWeight={600} noWrap
                        sx={{ cursor: 'pointer', '&:hover': { color: 'primary.main' } }}
                        onClick={() => navigate(`/products/${product.product_id}`)}
                      >
                        {product.name}
                      </Typography>
                      <Typography variant="h6" color="error.main" fontWeight={700} sx={{ mt: 0.5 }}>
                        {formatVND(product.price)}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center',
                               border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                      <IconButton size="small" onClick={() => quantity > 1 && updateItem(cart_item_id, quantity - 1)}
                                  disabled={quantity <= 1}>
                        <RemoveIcon fontSize="small" />
                      </IconButton>
                      <Typography sx={{ px: 1.5, minWidth: 32, textAlign: 'center', fontSize: 14 }}>
                        {quantity}
                      </Typography>
                      <IconButton size="small"
                        onClick={() => quantity < product.stock_quantity && updateItem(cart_item_id, quantity + 1)}
                        disabled={quantity >= product.stock_quantity}>
                        <AddIcon fontSize="small" />
                      </IconButton>
                    </Box>
                    <Typography fontWeight={700} sx={{ minWidth: 90, textAlign: 'right' }}>
                      {formatVND(Number(product.price) * quantity)}
                    </Typography>
                    <IconButton color="error" onClick={() => removeItem(cart_item_id)}>
                      <DeleteIcon />
                    </IconButton>
                  </CardContent>
                </Card>
              )
            })}
          </Stack>
        </Grid>

        {/* Summary */}
        <Grid item xs={12} md={4}>
          <Paper variant="outlined" sx={{ p: 3, borderRadius: 2, position: 'sticky', top: 80 }}>
            <Typography variant="h6" fontWeight={700} gutterBottom>Tóm tắt đơn hàng</Typography>
            <Divider sx={{ mb: 2 }} />
            <Stack spacing={1.5}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography color="text.secondary">Tạm tính</Typography>
                <Typography fontWeight={600}>{formatVND(cart?.total ?? 0)}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography color="text.secondary">Phí vận chuyển</Typography>
                <Typography fontWeight={600}>{formatVND(30000)}</Typography>
              </Box>
              <Divider />
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography fontWeight={700}>Tổng cộng</Typography>
                <Typography fontWeight={800} color="error.main" variant="h6">
                  {formatVND((cart?.total ?? 0) + 30000)}
                </Typography>
              </Box>
            </Stack>
            <Button
              fullWidth variant="contained" size="large" sx={{ mt: 3 }}
              onClick={() => navigate('/checkout')}
              disabled={items.length === 0}
            >
              Tiến hành đặt hàng
            </Button>
            <Button fullWidth variant="text" sx={{ mt: 1 }} onClick={() => navigate('/products')}>
              Tiếp tục mua sắm
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  )
}

export default CartPage
