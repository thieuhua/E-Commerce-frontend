import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  Container, Grid, Box, Typography, Button, Chip,
  Divider, Tab, Tabs, Paper, Avatar, Rating,
  Skeleton, Stack, IconButton, Alert,
} from '@mui/material'
import AddIcon          from '@mui/icons-material/Add'
import RemoveIcon       from '@mui/icons-material/Remove'
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart'
import LocalShippingIcon from '@mui/icons-material/LocalShipping'
import VerifiedIcon     from '@mui/icons-material/Verified'
import ReplayIcon       from '@mui/icons-material/Replay'
import { useQuery }     from '@tanstack/react-query'
import { productApi, reviewApi } from '@/api'
import { formatVND, formatDateTime, getImageUrl } from '@/utils'
import StarRating    from '@/components/common/StarRating'
import Breadcrumb    from '@/components/common/Breadcrumb'
import ReviewForm    from '@/components/product/ReviewForm'
import { useCart }   from '@/hooks'
import useAuthStore  from '@/stores/authStore'

const ProductDetailPage = () => {
  const { id }    = useParams()
  const navigate  = useNavigate()
  const { addItem } = useCart()
  const isAuth    = useAuthStore((s) => s.isAuth)
  const user      = useAuthStore((s) => s.user)

  const [qty,       setQty]      = useState(1)
  const [tab,       setTab]      = useState(0)
  const [activeImg, setActiveImg] = useState(0)
  const [adding,    setAdding]   = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['product', id],
    queryFn:  () => productApi.getById(id),
  })
  const { data: reviewData } = useQuery({
    queryKey: ['reviews', id],
    queryFn:  () => reviewApi.listByProduct(id, { limit: 50 }),
  })

  const product  = data?.data?.data
  const reviews  = reviewData?.data?.data ?? []
  const summary  = reviewData?.data?.summary
  const myReview = reviews.find((r) => r.user_id === user?.user_id)

  const handleAdd = async () => {
    setAdding(true)
    await addItem(product.product_id, qty)
    setAdding(false)
  }

  const handleBuyNow = async () => {
    setAdding(true)
    const ok = await addItem(product.product_id, qty)
    setAdding(false)
    if (ok) navigate('/checkout')
  }

  // ── Loading skeleton ────────────────────────────────────────
  if (isLoading) return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Skeleton width={320} height={24} sx={{ mb: 2 }} />
      <Grid container spacing={4}>
        <Grid item xs={12} md={5}>
          <Skeleton variant="rectangular" height={420} sx={{ borderRadius: 2 }} />
          <Box sx={{ display: 'flex', gap: 1, mt: 1.5 }}>
            {[1,2,3].map(i => <Skeleton key={i} variant="rectangular" width={64} height={64} sx={{ borderRadius: 1 }} />)}
          </Box>
        </Grid>
        <Grid item xs={12} md={7}>
          <Skeleton width="80%" height={44} />
          <Skeleton width="40%" height={28} sx={{ mt: 1 }} />
          <Skeleton width="50%" height={52} sx={{ mt: 2 }} />
          <Skeleton height={100} sx={{ mt: 2 }} />
          <Skeleton height={52} sx={{ mt: 3 }} />
          <Skeleton height={52} sx={{ mt: 1.5 }} />
        </Grid>
      </Grid>
    </Container>
  )

  if (!product) return (
    <Container maxWidth="lg" sx={{ py: 8, textAlign: 'center' }}>
      <Typography>Không tìm thấy sản phẩm.</Typography>
      <Button sx={{ mt: 2 }} onClick={() => navigate('/products')}>Quay lại</Button>
    </Container>
  )

  const { name, price, stock_quantity, status, images, brand, category, description } = product
  const outOfStock = status !== 'active' || stock_quantity === 0

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Breadcrumb */}
      <Breadcrumb crumbs={[
        { label: 'Sản phẩm', to: '/products' },
        ...(category ? [{ label: category.name, to: `/products?category_id=${category.category_id}` }] : []),
        { label: name },
      ]} />

      <Grid container spacing={4}>
        {/* ── Images ── */}
        <Grid item xs={12} md={5}>
          <Box sx={{ borderRadius: 2, overflow: 'hidden', border: '1px solid',
                     borderColor: 'divider', bgcolor: '#fafafa',
                     aspectRatio: '1', display: 'flex', alignItems: 'center',
                     justifyContent: 'center', p: 3 }}>
            <img
              src={getImageUrl(images?.[activeImg]?.image_url)}
              alt={name}
              style={{ maxWidth: '100%', maxHeight: 380, objectFit: 'contain' }}
            />
          </Box>

          {images?.length > 1 && (
            <Box sx={{ display: 'flex', gap: 1, mt: 1.5, flexWrap: 'wrap' }}>
              {images.map((img, i) => (
                <Box key={img.image_id} onClick={() => setActiveImg(i)} sx={{
                  width: 64, height: 64, borderRadius: 1, overflow: 'hidden',
                  cursor: 'pointer', border: '2px solid',
                  borderColor: activeImg === i ? 'primary.main' : 'divider',
                  bgcolor: '#fafafa', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'border-color .15s',
                  '&:hover': { borderColor: 'primary.light' },
                }}>
                  <img src={getImageUrl(img.image_url)} alt=""
                       style={{ width: '100%', height: '100%', objectFit: 'contain', padding: 4 }} />
                </Box>
              ))}
            </Box>
          )}
        </Grid>

        {/* ── Info ── */}
        <Grid item xs={12} md={7}>
          <Stack direction="row" spacing={1} sx={{ mb: 1.5, flexWrap: 'wrap' }}>
            {brand    && <Chip label={brand.name}    size="small" variant="outlined" color="primary" />}
            {category && <Chip label={category.name} size="small" variant="outlined" />}
            {outOfStock && <Chip label="Hết hàng" size="small" color="error" />}
          </Stack>

          <Typography variant="h4" fontWeight={700} lineHeight={1.3}>{name}</Typography>

          {summary?.avg_rating && (
            <Box sx={{ mt: 1.5 }}>
              <StarRating value={summary.avg_rating} count={reviews.length} />
            </Box>
          )}

          <Typography variant="h3" color="error.main" fontWeight={800} sx={{ mt: 2.5, letterSpacing: '-1px' }}>
            {formatVND(price)}
          </Typography>

          <Divider sx={{ my: 2.5 }} />

          {/* Quantity picker */}
          {!outOfStock && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <Typography fontWeight={600} color="text.secondary">Số lượng</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center',
                         border: '1px solid', borderColor: 'divider', borderRadius: 1.5 }}>
                <IconButton size="small" onClick={() => setQty(Math.max(1, qty - 1))} disabled={qty <= 1}>
                  <RemoveIcon fontSize="small" />
                </IconButton>
                <Typography sx={{ px: 2, minWidth: 36, textAlign: 'center', fontWeight: 600 }}>{qty}</Typography>
                <IconButton size="small" onClick={() => setQty(Math.min(stock_quantity, qty + 1))}
                            disabled={qty >= stock_quantity}>
                  <AddIcon fontSize="small" />
                </IconButton>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Còn {stock_quantity} sản phẩm
              </Typography>
            </Box>
          )}

          {/* Action buttons */}
          <Stack spacing={1.5} sx={{ mb: 3 }}>
            <Button variant="contained" size="large" fullWidth
                    startIcon={<ShoppingCartIcon />}
                    disabled={outOfStock || adding}
                    onClick={handleAdd}>
              {adding ? 'Đang thêm...' : outOfStock ? 'Hết hàng' : 'Thêm vào giỏ hàng'}
            </Button>
            {!outOfStock && (
              <Button variant="outlined" size="large" fullWidth
                      disabled={adding} onClick={handleBuyNow}
                      sx={{ borderColor: 'secondary.main', color: 'secondary.main',
                            '&:hover': { borderColor: 'secondary.dark', bgcolor: 'secondary.50' } }}>
                Mua ngay
              </Button>
            )}
          </Stack>

          {/* Policies */}
          <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, bgcolor: 'grey.50' }}>
            <Stack spacing={1.25}>
              {[
                [LocalShippingIcon, 'primary', 'Giao hàng toàn quốc — phí 30.000đ'],
                [VerifiedIcon, 'success', 'Hàng chính hãng, bảo hành 12 tháng'],
                [ReplayIcon, 'info', 'Đổi trả trong 30 ngày nếu lỗi do nhà sản xuất'],
              ].map(([Icon, color, text]) => (
                <Box key={text} sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
                  <Icon color={color} fontSize="small" />
                  <Typography variant="body2">{text}</Typography>
                </Box>
              ))}
            </Stack>
          </Paper>
        </Grid>
      </Grid>

      {/* ── Tabs ── */}
      <Box sx={{ mt: 6 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tab label="Mô tả sản phẩm" />
          <Tab label={`Đánh giá (${reviews.length})`} />
        </Tabs>

        {/* Tab 0: Description */}
        {tab === 0 && (
          <Box sx={{ py: 3, maxWidth: 800 }}>
            <Typography color="text.secondary" whiteSpace="pre-line" lineHeight={1.9}>
              {description || 'Chưa có mô tả chi tiết cho sản phẩm này.'}
            </Typography>
          </Box>
        )}

        {/* Tab 1: Reviews */}
        {tab === 1 && (
          <Box sx={{ py: 3 }}>
            {/* Summary */}
            {reviews.length > 0 && summary && (
              <Paper variant="outlined" sx={{ p: 3, mb: 4, borderRadius: 2 }}>
                <Grid container spacing={3} alignItems="center">
                  <Grid item xs="auto" sx={{ textAlign: 'center', minWidth: 120 }}>
                    <Typography variant="h2" fontWeight={900} color="warning.main" lineHeight={1}>
                      {summary.avg_rating}
                    </Typography>
                    <Rating value={Number(summary.avg_rating)} precision={0.1} readOnly sx={{ mt: 0.5 }} />
                    <Typography variant="caption" color="text.secondary">{reviews.length} đánh giá</Typography>
                  </Grid>
                  <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
                  <Grid item xs>
                    {[5, 4, 3, 2, 1].map((star) => (
                      <Box key={star} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.75 }}>
                        <Typography variant="caption" sx={{ minWidth: 14, textAlign: 'right' }}>{star}</Typography>
                        <Rating value={1} max={1} size="small" readOnly />
                        <Box sx={{ flex: 1, bgcolor: 'divider', height: 8, borderRadius: 4, overflow: 'hidden' }}>
                          <Box sx={{
                            width: `${reviews.length ? (summary.breakdown[star] / reviews.length) * 100 : 0}%`,
                            height: '100%', bgcolor: 'warning.main', borderRadius: 4,
                            transition: 'width .3s',
                          }} />
                        </Box>
                        <Typography variant="caption" color="text.secondary" sx={{ minWidth: 16 }}>
                          {summary.breakdown[star]}
                        </Typography>
                      </Box>
                    ))}
                  </Grid>
                </Grid>
              </Paper>
            )}

            {/* Review form */}
            {!myReview ? (
              <ReviewForm productId={id} />
            ) : (
              <Alert severity="success" sx={{ mb: 3 }}>
                Bạn đã đánh giá sản phẩm này — {myReview.rating}★ "{myReview.comment}"
              </Alert>
            )}

            <Divider sx={{ my: 3 }} />

            {/* Review list */}
            {reviews.length === 0 ? (
              <Typography color="text.secondary" textAlign="center" py={4}>
                Chưa có đánh giá nào. Hãy là người đầu tiên!
              </Typography>
            ) : (
              <Stack spacing={2}>
                {reviews.map((r) => (
                  <Paper key={r.review_id} variant="outlined" sx={{ p: 2.5, borderRadius: 2 }}>
                    <Box sx={{ display: 'flex', gap: 1.5, mb: 1.5 }}>
                      <Avatar sx={{ width: 38, height: 38, bgcolor: 'primary.main', fontSize: 15 }}>
                        {r.User?.full_name?.[0]?.toUpperCase()}
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <Typography variant="body2" fontWeight={700}>{r.User?.full_name}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {formatDateTime(r.created_at)}
                          </Typography>
                        </Box>
                        <Rating value={r.rating} size="small" readOnly sx={{ mt: 0.25 }} />
                      </Box>
                    </Box>
                    {r.comment && (
                      <Typography variant="body2" color="text.primary" sx={{ ml: 6.5, lineHeight: 1.7 }}>
                        {r.comment}
                      </Typography>
                    )}
                  </Paper>
                ))}
              </Stack>
            )}
          </Box>
        )}
      </Box>
    </Container>
  )
}

export default ProductDetailPage
