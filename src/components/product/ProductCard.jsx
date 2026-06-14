import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Card, CardMedia, CardContent, CardActions,
  Typography, Button, Box, Skeleton, Chip,
} from '@mui/material'
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart'
import { formatVND, getImageUrl, truncate } from '@/utils'
import { useCart } from '@/hooks'

const ProductCard = ({ product, loading = false }) => {
  const { addItem } = useCart()
  const [adding, setAdding] = useState(false)

  if (loading) return (
    <Card sx={{ height: '100%' }}>
      <Skeleton variant="rectangular" height={200} />
      <CardContent>
        <Skeleton width="60%" />
        <Skeleton width="40%" />
        <Skeleton width="80%" height={32} sx={{ mt: 1 }} />
      </CardContent>
    </Card>
  )

  const { product_id, name, price, stock_quantity, status, images, brand } = product
  const img = images?.[0]?.image_url
  const outOfStock = status !== 'active' || stock_quantity === 0

  const handleAdd = async (e) => {
    e.preventDefault()
    setAdding(true)
    await addItem(product_id)
    setAdding(false)
  }

  return (
    <Card
      component={Link} to={`/products/${product_id}`}
      sx={{ height: '100%', display: 'flex', flexDirection: 'column',
            textDecoration: 'none', color: 'inherit',
            transition: 'transform .2s, box-shadow .2s',
            '&:hover': { transform: 'translateY(-4px)', boxShadow: 3 } }}
    >
      <Box sx={{ position: 'relative' }}>
        <CardMedia
          component="img" height={200} image={getImageUrl(img)}
          alt={name} sx={{ objectFit: 'contain', p: 1, bgcolor: '#fafafa' }}
        />
        {outOfStock && (
          <Chip label="Hết hàng" color="error" size="small"
                sx={{ position: 'absolute', top: 8, left: 8 }} />
        )}
      </Box>

      <CardContent sx={{ flex: 1, pb: 1 }}>
        {brand && (
          <Typography variant="caption" color="primary.main" fontWeight={600}>
            {brand.name}
          </Typography>
        )}
        <Typography variant="body2" fontWeight={600} sx={{ mt: 0.25, lineHeight: 1.4, minHeight: 40 }}>
          {truncate(name, 60)}
        </Typography>
        <Typography variant="h6" color="error.main" fontWeight={700} sx={{ mt: 1 }}>
          {formatVND(price)}
        </Typography>
      </CardContent>

      <CardActions sx={{ px: 2, pb: 2 }}>
        <Button
          fullWidth variant="contained" size="small"
          startIcon={<ShoppingCartIcon />}
          disabled={outOfStock || adding}
          onClick={handleAdd}
        >
          {adding ? 'Đang thêm...' : outOfStock ? 'Hết hàng' : 'Thêm vào giỏ'}
        </Button>
      </CardActions>
    </Card>
  )
}

export default ProductCard
