// LoginPage.jsx
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Box, Card, CardContent, Typography, TextField, Button, Alert, Divider } from '@mui/material'
import { useAuth } from '@/hooks'
import { useToast } from '@/hooks'

export const LoginPage = () => {
  const { login }  = useAuth()
  const toast      = useToast()
  const [form, setForm]       = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  const handle = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try { await login(form) }
    catch (err) { setError(err.response?.data?.message ?? 'Đăng nhập thất bại') }
    finally { setLoading(false) }
  }

  return (
    <Card sx={{ width: '100%', maxWidth: 420 }}>
      <CardContent sx={{ p: 4 }}>
        <Typography variant="h5" fontWeight={700} gutterBottom textAlign="center">
          Đăng nhập
        </Typography>
        <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ mb: 3 }}>
          Chào mừng bạn quay lại TechShop!
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Box component="form" onSubmit={handle}>
          <TextField fullWidth label="Email" type="email" value={form.email} required sx={{ mb: 2 }}
            onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <TextField fullWidth label="Mật khẩu" type="password" value={form.password} required sx={{ mb: 3 }}
            onChange={(e) => setForm({ ...form, password: e.target.value })} />
          <Button fullWidth variant="contained" size="large" type="submit" disabled={loading}>
            {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </Button>
        </Box>

        <Divider sx={{ my: 2.5 }} />

        <Typography variant="body2" textAlign="center">
          Chưa có tài khoản?{' '}
          <Link to="/register" style={{ color: 'inherit', fontWeight: 600 }}>Đăng ký ngay</Link>
        </Typography>

        {/* Quick fill for dev */}
        {import.meta.env.DEV && (
          <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {[
              ['Admin', 'admin@shop.vn', 'Admin@123'],
              ['Customer', 'vana@gmail.com', 'Pass@1234'],
            ].map(([label, email, password]) => (
              <Button key={label} size="small" variant="outlined"
                onClick={() => setForm({ email, password })}>
                {label}
              </Button>
            ))}
          </Box>
        )}
      </CardContent>
    </Card>
  )
}

// RegisterPage.jsx
export const RegisterPage = () => {
  const { register } = useAuth()
  const [form, setForm]       = useState({ username: '', email: '', password: '', full_name: '', phone: '' })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors]   = useState({})

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  const handle = async (e) => {
    e.preventDefault()
    setErrors({})
    setLoading(true)
    try { await register(form) }
    catch (err) {
      const apiErrors = err.response?.data?.errors
      if (apiErrors) {
        const map = {}
        apiErrors.forEach(({ field, message }) => { map[field] = message })
        setErrors(map)
      }
    }
    finally { setLoading(false) }
  }

  return (
    <Card sx={{ width: '100%', maxWidth: 480 }}>
      <CardContent sx={{ p: 4 }}>
        <Typography variant="h5" fontWeight={700} gutterBottom textAlign="center">Đăng ký</Typography>
        <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ mb: 3 }}>
          Tạo tài khoản để bắt đầu mua sắm
        </Typography>

        <Box component="form" onSubmit={handle} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField label="Họ và tên" value={form.full_name} onChange={set('full_name')} required
                     error={!!errors.full_name} helperText={errors.full_name} />
          <TextField label="Tên đăng nhập" value={form.username} onChange={set('username')} required
                     error={!!errors.username} helperText={errors.username} />
          <TextField label="Email" type="email" value={form.email} onChange={set('email')} required
                     error={!!errors.email} helperText={errors.email} />
          <TextField label="Số điện thoại" value={form.phone} onChange={set('phone')}
                     error={!!errors.phone} helperText={errors.phone} />
          <TextField label="Mật khẩu" type="password" value={form.password} onChange={set('password')} required
                     error={!!errors.password} helperText={errors.password || 'Tối thiểu 8 ký tự'} />
          <Button fullWidth variant="contained" size="large" type="submit" disabled={loading} sx={{ mt: 1 }}>
            {loading ? 'Đang xử lý...' : 'Đăng ký'}
          </Button>
        </Box>

        <Divider sx={{ my: 2.5 }} />
        <Typography variant="body2" textAlign="center">
          Đã có tài khoản?{' '}
          <Link to="/login" style={{ color: 'inherit', fontWeight: 600 }}>Đăng nhập</Link>
        </Typography>
      </CardContent>
    </Card>
  )
}
