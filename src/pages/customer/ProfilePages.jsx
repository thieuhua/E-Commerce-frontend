import { useState } from 'react'
import {
  Container, Grid, Paper, Typography, Box, TextField, Button,
  Stack, Divider, Alert, IconButton, Chip,
} from '@mui/material'
import EditIcon   from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import AddIcon    from '@mui/icons-material/Add'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { userApi, addressApi } from '@/api'
import { useAuth, useToast } from '@/hooks'
import AddressFormDialog from '@/components/common/AddressFormDialog'
import ConfirmDialog from '@/components/common/ConfirmDialog'

// ── ProfilePage ───────────────────────────────────────────────
export const ProfilePage = () => {
  const { user, updateUser } = useAuth()
  const toast  = useToast()
  const [form, setForm]       = useState({ full_name: user?.full_name ?? '', phone: user?.phone ?? '' })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSave = async () => {
    setLoading(true)
    setSuccess(false)
    try {
      const { data } = await userApi.updateProfile(form)
      updateUser(data.data)
      setSuccess(true)
      toast.success('Cập nhật hồ sơ thành công!')
    } catch (err) {
      toast.apiError(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Typography variant="h5" fontWeight={700} gutterBottom>Hồ sơ của tôi</Typography>
      <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
        <Stack spacing={2.5}>
          <TextField label="Tên đăng nhập" value={user?.username ?? ''} disabled />
          <TextField label="Email" value={user?.email ?? ''} disabled />
          <TextField label="Họ và tên" value={form.full_name}
                     onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
          <TextField label="Số điện thoại" value={form.phone}
                     onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          {success && <Alert severity="success">Cập nhật thành công!</Alert>}
          <Button variant="contained" onClick={handleSave} disabled={loading}>
            {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
          </Button>
        </Stack>
      </Paper>
    </Container>
  )
}

// ── ChangePasswordPage ────────────────────────────────────────
export const ChangePasswordPage = () => {
  const toast  = useToast()
  const [form, setForm]       = useState({ current_password: '', new_password: '', confirm: '' })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors]   = useState({})

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.new_password !== form.confirm) {
      setErrors({ confirm: 'Mật khẩu xác nhận không khớp' })
      return
    }
    setErrors({})
    setLoading(true)
    try {
      await userApi.changePassword({ current_password: form.current_password, new_password: form.new_password })
      toast.success('Đổi mật khẩu thành công!')
      setForm({ current_password: '', new_password: '', confirm: '' })
    } catch (err) {
      const apiErrors = err.response?.data?.errors
      if (apiErrors) {
        const map = {}
        apiErrors.forEach(({ field, message }) => { map[field] = message })
        setErrors(map)
      } else {
        toast.apiError(err)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Typography variant="h5" fontWeight={700} gutterBottom>Đổi mật khẩu</Typography>
      <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
        <Box component="form" onSubmit={handleSubmit}>
          <Stack spacing={2.5}>
            <TextField label="Mật khẩu hiện tại" type="password" value={form.current_password}
                       onChange={set('current_password')} required
                       error={!!errors.current_password} helperText={errors.current_password} />
            <TextField label="Mật khẩu mới" type="password" value={form.new_password}
                       onChange={set('new_password')} required
                       error={!!errors.new_password} helperText={errors.new_password || 'Tối thiểu 8 ký tự'} />
            <TextField label="Xác nhận mật khẩu mới" type="password" value={form.confirm}
                       onChange={set('confirm')} required
                       error={!!errors.confirm} helperText={errors.confirm} />
            <Button type="submit" variant="contained" disabled={loading}>
              {loading ? 'Đang xử lý...' : 'Đổi mật khẩu'}
            </Button>
          </Stack>
        </Box>
      </Paper>
    </Container>
  )
}

// ── AddressPage ───────────────────────────────────────────────
export const AddressPage = () => {
  const toast = useToast()
  const qc    = useQueryClient()
  const [dialog, setDialog]     = useState(false)
  const [editAddr, setEditAddr] = useState(null)
  const [deleteId, setDeleteId] = useState(null)

  const { data, isLoading } = useQuery({
    queryKey: ['addresses'],
    queryFn:  () => addressApi.list(),
  })
  const addresses = data?.data?.data ?? []

  const deleteMut = useMutation({
    mutationFn: (id) => addressApi.remove(id),
    onSuccess:  () => { qc.invalidateQueries(['addresses']); toast.success('Đã xoá địa chỉ') },
    onError:    (err) => toast.apiError(err),
  })

  const setDefaultMut = useMutation({
    mutationFn: (id) => addressApi.setDefault(id),
    onSuccess:  () => { qc.invalidateQueries(['addresses']); toast.success('Đã đặt làm mặc định') },
  })

  const handleEdit = (addr) => { setEditAddr(addr); setDialog(true) }
  const handleAdd  = ()      => { setEditAddr(null); setDialog(true) }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" fontWeight={700}>Địa chỉ giao hàng</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleAdd}>
          Thêm địa chỉ
        </Button>
      </Box>

      {isLoading ? (
        <Typography color="text.secondary">Đang tải...</Typography>
      ) : addresses.length === 0 ? (
        <Paper variant="outlined" sx={{ p: 4, textAlign: 'center', borderRadius: 2 }}>
          <Typography color="text.secondary" gutterBottom>Bạn chưa có địa chỉ nào</Typography>
          <Button variant="outlined" startIcon={<AddIcon />} onClick={handleAdd} sx={{ mt: 1 }}>
            Thêm địa chỉ đầu tiên
          </Button>
        </Paper>
      ) : (
        <Stack spacing={2}>
          {addresses.map((addr) => (
            <Paper key={addr.address_id} variant="outlined" sx={{ p: 2.5, borderRadius: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box sx={{ flex: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                    <Typography fontWeight={700}>{addr.receiver_name}</Typography>
                    <Typography color="text.secondary">|</Typography>
                    <Typography color="text.secondary">{addr.phone}</Typography>
                    {addr.is_default === 1 && <Chip label="Mặc định" size="small" color="primary" />}
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {[addr.detail, addr.ward, addr.district, addr.province].join(', ')}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 0.5, ml: 2 }}>
                  <IconButton size="small" onClick={() => handleEdit(addr)}><EditIcon fontSize="small" /></IconButton>
                  <IconButton size="small" color="error" onClick={() => setDeleteId(addr.address_id)}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
              </Box>
              {addr.is_default !== 1 && (
                <>
                  <Divider sx={{ my: 1.5 }} />
                  <Button size="small" onClick={() => setDefaultMut.mutate(addr.address_id)}>
                    Đặt làm mặc định
                  </Button>
                </>
              )}
            </Paper>
          ))}
        </Stack>
      )}

      <AddressFormDialog
        open={dialog} editData={editAddr}
        onClose={() => setDialog(false)}
        onSuccess={() => { qc.invalidateQueries(['addresses']); setDialog(false) }}
      />

      <ConfirmDialog
        open={!!deleteId} onClose={() => setDeleteId(null)}
        onConfirm={() => { deleteMut.mutate(deleteId); setDeleteId(null) }}
        loading={deleteMut.isPending}
        title="Xoá địa chỉ?" description="Địa chỉ này sẽ bị xoá vĩnh viễn."
        confirmLabel="Xoá"
      />
    </Container>
  )
}
