import { useNavigate } from 'react-router-dom'
import {
  Box, Container, Typography, Button, Grid,
  Card, CardContent, CardActionArea, Skeleton, Paper,
} from '@mui/material'
import { useQuery } from '@tanstack/react-query'
import PhoneAndroidIcon from '@mui/icons-material/PhoneAndroid'
import LaptopIcon       from '@mui/icons-material/Laptop'
import HeadphonesIcon   from '@mui/icons-material/Headphones'
import WatchIcon        from '@mui/icons-material/Watch'
import LocalShippingIcon from '@mui/icons-material/LocalShipping'
import VerifiedIcon      from '@mui/icons-material/Verified'
import SupportAgentIcon  from '@mui/icons-material/SupportAgent'
import CachedIcon        from '@mui/icons-material/Cached'
import { productApi } from '@/api'
import ProductCard from '@/components/product/ProductCard'

const CATEGORIES = [
  { id: 1, label: 'Điện thoại & Tablet', Icon: PhoneAndroidIcon, color: '#1565C0', bg: '#E3F2FD' },
  { id: 2, label: 'Laptop & Máy tính',   Icon: LaptopIcon,       color: '#2E7D32', bg: '#E8F5E9' },
  { id: 3, label: 'Âm thanh',            Icon: HeadphonesIcon,   color: '#6A1B9A', bg: '#F3E5F5' },
  { id: 4, label: 'Đồng hồ thông minh',  Icon: WatchIcon,        color: '#E65100', bg: '#FFF3E0' },
]

const POLICIES = [
  { Icon: LocalShippingIcon, color: '#1565C0', title: 'Giao hàng toàn quốc', desc: 'Nhanh chóng, an toàn' },
  { Icon: VerifiedIcon,      color: '#2E7D32', title: 'Hàng chính hãng 100%', desc: 'Bảo hành 12 tháng' },
  { Icon: CachedIcon,        color: '#E65100', title: 'Đổi trả 30 ngày',     desc: 'Không cần lý do' },
  { Icon: SupportAgentIcon,  color: '#6A1B9A', title: 'Hỗ trợ 24/7',         desc: 'Tư vấn miễn phí' },
]

const HomePage = () => {
  const navigate = useNavigate()

  const { data: newData, isLoading: loadingNew } = useQuery({
    queryKey: ['products', 'newest'],
    queryFn:  () => productApi.list({ limit: 8, sort_by: 'created_at', order: 'desc', status: 'active' }),
  })

  const { data: saleData, isLoading: loadingSale } = useQuery({
    queryKey: ['products', 'cheapest'],
    queryFn:  () => productApi.list({ limit: 4, sort_by: 'price', order: 'asc', status: 'active' }),
  })

  const newest   = newData?.data?.data ?? []
  const cheapest = saleData?.data?.data ?? []

  return (
    <Box>
      {/* ── Hero ── */}
      <Box sx={{
        background: 'linear-gradient(135deg, #0D47A1 0%, #1565C0 40%, #1976D2 100%)',
        color: 'white', py: { xs: 7, md: 12 },
      }}>
        <Container maxWidth="lg">
          <Grid container alignItems="center" spacing={4}>
            <Grid item xs={12} md={6}>
              <Typography variant="overline" sx={{ opacity: .7, letterSpacing: 3 }}>
                TECHSHOP 2026
              </Typography>
              <Typography variant="h1" fontWeight={900} lineHeight={1.15}
                          sx={{ fontSize: { xs: '2.25rem', md: '3.5rem' }, mt: 1, mb: 2 }}>
                Công nghệ đỉnh cao,<br />
                <Box component="span" sx={{ color: '#FFA000' }}>giá tốt nhất</Box>
              </Typography>
              <Typography variant="h6" fontWeight={400} sx={{ opacity: .85, mb: 4, lineHeight: 1.6 }}>
                Hơn 200+ sản phẩm chính hãng từ các thương hiệu hàng đầu thế giới.
                Giao hàng toàn quốc — bảo hành 12 tháng.
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Button variant="contained" size="large"
                  sx={{ bgcolor: '#FF6F00', '&:hover': { bgcolor: '#E65100' },
                        px: 4, py: 1.5, fontSize: '1rem' }}
                  onClick={() => navigate('/products')}>
                  Mua sắm ngay
                </Button>
                <Button variant="outlined" size="large"
                  sx={{ color: 'white', borderColor: 'rgba(255,255,255,.5)',
                        px: 4, py: 1.5, fontSize: '1rem',
                        '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,.08)' } }}
                  onClick={() => navigate('/products?sort_by=price&order=asc')}>
                  Xem khuyến mãi
                </Button>
              </Box>
            </Grid>
            <Grid item xs={12} md={6} sx={{ display: { xs: 'none', md: 'block' } }}>
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, opacity: .9 }}>
                {['iphone16pro', 'sonywh1000xm5', 'macbookairm3', 'applewatch10'].map((seed, i) => (
                  <Paper key={i} sx={{ borderRadius: 2, overflow: 'hidden', aspectRatio: '1',
                                       bgcolor: 'rgba(255,255,255,.1)', display: 'flex',
                                       alignItems: 'center', justifyContent: 'center', p: 2 }}>
                    <img src={`https://picsum.photos/seed/${seed}/200/200`} alt=""
                         style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 8 }} />
                  </Paper>
                ))}
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* ── Policies ── */}
      <Box sx={{ bgcolor: 'white', borderBottom: '1px solid', borderColor: 'divider' }}>
        <Container maxWidth="lg">
          <Grid container>
            {POLICIES.map(({ Icon, color, title, desc }) => (
              <Grid item xs={6} md={3} key={title}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 2.5, px: 2,
                           borderRight: '1px solid', borderColor: 'divider' }}>
                  <Box sx={{ width: 44, height: 44, borderRadius: 1.5, bgcolor: `${color}15`,
                             display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon sx={{ color, fontSize: 22 }} />
                  </Box>
                  <Box>
                    <Typography variant="body2" fontWeight={700} lineHeight={1.2}>{title}</Typography>
                    <Typography variant="caption" color="text.secondary">{desc}</Typography>
                  </Box>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: 6 }}>
        {/* ── Categories ── */}
        <Typography variant="h5" fontWeight={700} sx={{ mb: 2.5 }}>Danh mục nổi bật</Typography>
        <Grid container spacing={2} sx={{ mb: 7 }}>
          {CATEGORIES.map(({ id, label, Icon, color, bg }) => (
            <Grid item xs={6} sm={3} key={id}>
              <Card sx={{ cursor: 'pointer', transition: 'transform .2s, box-shadow .2s',
                          '&:hover': { transform: 'translateY(-4px)', boxShadow: 3 } }}>
                <CardActionArea onClick={() => navigate(`/products?category_id=${id}`)}>
                  <CardContent sx={{ textAlign: 'center', py: 3.5 }}>
                    <Box sx={{ width: 64, height: 64, borderRadius: 2, bgcolor: bg,
                               display: 'flex', alignItems: 'center', justifyContent: 'center',
                               mx: 'auto', mb: 1.5 }}>
                      <Icon sx={{ color, fontSize: 32 }} />
                    </Box>
                    <Typography variant="body2" fontWeight={700}>{label}</Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* ── New arrivals ── */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography variant="h5" fontWeight={700}>Sản phẩm mới nhất</Typography>
            <Typography variant="body2" color="text.secondary">Cập nhật liên tục mỗi ngày</Typography>
          </Box>
          <Button variant="outlined" onClick={() => navigate('/products')}>Xem tất cả →</Button>
        </Box>
        <Grid container spacing={2.5} sx={{ mb: 7 }}>
          {loadingNew
            ? Array.from({ length: 8 }).map((_, i) => (
                <Grid item xs={6} sm={4} md={3} key={i}><ProductCard loading /></Grid>
              ))
            : newest.map((p) => (
                <Grid item xs={6} sm={4} md={3} key={p.product_id}>
                  <ProductCard product={p} />
                </Grid>
              ))}
        </Grid>

        {/* ── Budget picks ── */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography variant="h5" fontWeight={700}>Giá tốt hôm nay 🔥</Typography>
            <Typography variant="body2" color="text.secondary">Sản phẩm giá rẻ nhất hiện tại</Typography>
          </Box>
          <Button variant="outlined" color="secondary"
                  onClick={() => navigate('/products?sort_by=price&order=asc')}>
            Xem tất cả →
          </Button>
        </Box>
        <Grid container spacing={2.5}>
          {loadingSale
            ? Array.from({ length: 4 }).map((_, i) => (
                <Grid item xs={6} sm={4} md={3} key={i}><ProductCard loading /></Grid>
              ))
            : cheapest.map((p) => (
                <Grid item xs={6} sm={4} md={3} key={p.product_id}>
                  <ProductCard product={p} />
                </Grid>
              ))}
        </Grid>
      </Container>
    </Box>
  )
}

export default HomePage
