import { Box, Container, Grid, Typography, Link, Divider, Stack } from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'

const Footer = () => (
  <Box component="footer" sx={{ bgcolor: '#1A2035', color: 'grey.400', mt: 'auto' }}>
    <Container maxWidth="lg" sx={{ py: 5 }}>
      <Grid container spacing={4}>
        <Grid item xs={12} sm={4}>
          <Typography variant="h6" fontWeight={800} color="white" gutterBottom>
            Tech<span style={{ color: '#FF6F00' }}>Shop</span>
          </Typography>
          <Typography variant="body2" sx={{ lineHeight: 1.8 }}>
            Chuyên cung cấp thiết bị công nghệ chính hãng, giá tốt nhất thị trường.
          </Typography>
        </Grid>
        <Grid item xs={6} sm={2}>
          <Typography variant="subtitle2" color="white" fontWeight={600} gutterBottom>
            Mua sắm
          </Typography>
          <Stack spacing={0.5}>
            {[['Điện thoại', '/products?category_id=1'],
              ['Laptop', '/products?category_id=2'],
              ['Tai nghe', '/products?category_id=3'],
              ['Đồng hồ', '/products?category_id=4'],
            ].map(([label, to]) => (
              <Link key={label} component={RouterLink} to={to}
                    color="inherit" underline="hover" variant="body2">{label}</Link>
            ))}
          </Stack>
        </Grid>
        <Grid item xs={6} sm={2}>
          <Typography variant="subtitle2" color="white" fontWeight={600} gutterBottom>
            Hỗ trợ
          </Typography>
          <Stack spacing={0.5}>
            {['Chính sách đổi trả', 'Bảo hành', 'Hướng dẫn mua hàng', 'Liên hệ'].map(l => (
              <Typography key={l} variant="body2">{l}</Typography>
            ))}
          </Stack>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Typography variant="subtitle2" color="white" fontWeight={600} gutterBottom>
            Thông tin
          </Typography>
          <Stack spacing={0.5}>
            <Typography variant="body2">📍 123 Nguyễn Trãi, Hà Nội</Typography>
            <Typography variant="body2">📞 1800 1234 (Miễn phí)</Typography>
            <Typography variant="body2">✉️ support@techshop.vn</Typography>
            <Typography variant="body2">🕐 8:00 – 22:00 hàng ngày</Typography>
          </Stack>
        </Grid>
      </Grid>
      <Divider sx={{ borderColor: 'grey.800', my: 3 }} />
      <Typography variant="body2" textAlign="center">
        © {new Date().getFullYear()} TechShop. Mọi quyền được bảo lưu.
      </Typography>
    </Container>
  </Box>
)

export default Footer
