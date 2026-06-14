import { useNavigate, useRouteError } from 'react-router-dom'
import { Box, Button, Typography, Container } from '@mui/material'
import HomeIcon from '@mui/icons-material/Home'

export const NotFoundPage = () => {
  const navigate = useNavigate()
  return (
    <Container maxWidth="sm">
      <Box sx={{ textAlign: 'center', py: 10 }}>
        <Typography variant="h1" fontWeight={900} color="primary.main" sx={{ fontSize: '6rem', lineHeight: 1 }}>
          404
        </Typography>
        <Typography variant="h5" fontWeight={700} gutterBottom sx={{ mt: 2 }}>
          Trang không tồn tại
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 4 }}>
          Trang bạn tìm kiếm có thể đã bị xoá hoặc đường dẫn không đúng.
        </Typography>
        <Button variant="contained" size="large" startIcon={<HomeIcon />} onClick={() => navigate('/')}>
          Về trang chủ
        </Button>
      </Box>
    </Container>
  )
}

export const ErrorPage = () => {
  const error    = useRouteError()
  const navigate = useNavigate()
  return (
    <Container maxWidth="sm">
      <Box sx={{ textAlign: 'center', py: 10 }}>
        <Typography variant="h1" fontWeight={900} color="error.main" sx={{ fontSize: '5rem' }}>
          Oops!
        </Typography>
        <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
          Đã có lỗi xảy ra
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 4 }}>
          {error?.statusText || error?.message || 'Lỗi không xác định'}
        </Typography>
        <Button variant="contained" onClick={() => navigate('/')}>Về trang chủ</Button>
      </Box>
    </Container>
  )
}
