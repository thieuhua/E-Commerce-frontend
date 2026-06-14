import { useState, useEffect } from 'react'
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, Grid, FormControlLabel, Switch, Alert,
} from '@mui/material'
import { addressApi } from '@/api'

const DEFAULT_FORM = { receiver_name: '', phone: '', province: '', district: '', ward: '', detail: '', is_default: false }

const AddressFormDialog = ({ open, onClose, onSuccess, editData = null }) => {
  const [form, setForm]       = useState(DEFAULT_FORM)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors]   = useState({})

  useEffect(() => {
    if (editData) setForm({ ...editData, is_default: editData.is_default === 1 })
    else          setForm(DEFAULT_FORM)
    setErrors({})
  }, [editData, open])

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  const handleSubmit = async () => {
    setLoading(true)
    setErrors({})
    try {
      if (editData) await addressApi.update(editData.address_id, form)
      else          await addressApi.create(form)
      onSuccess?.()
    } catch (err) {
      const apiErrors = err.response?.data?.errors
      if (apiErrors) {
        const map = {}
        apiErrors.forEach(({ field, message }) => { map[field] = message })
        setErrors(map)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{editData ? 'Sửa địa chỉ' : 'Thêm địa chỉ mới'}</DialogTitle>
      <DialogContent sx={{ pt: '16px !important' }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth label="Tên người nhận" value={form.receiver_name} onChange={set('receiver_name')}
                       required error={!!errors.receiver_name} helperText={errors.receiver_name} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth label="Số điện thoại" value={form.phone} onChange={set('phone')}
                       required error={!!errors.phone} helperText={errors.phone} />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField fullWidth label="Tỉnh / Thành phố" value={form.province} onChange={set('province')}
                       required error={!!errors.province} helperText={errors.province} />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField fullWidth label="Quận / Huyện" value={form.district} onChange={set('district')}
                       required error={!!errors.district} helperText={errors.district} />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField fullWidth label="Phường / Xã" value={form.ward} onChange={set('ward')}
                       required error={!!errors.ward} helperText={errors.ward} />
          </Grid>
          <Grid item xs={12}>
            <TextField fullWidth label="Số nhà, tên đường" value={form.detail} onChange={set('detail')}
                       required error={!!errors.detail} helperText={errors.detail} />
          </Grid>
          <Grid item xs={12}>
            <FormControlLabel
              control={<Switch checked={form.is_default} onChange={(e) => setForm({ ...form, is_default: e.target.checked })} />}
              label="Đặt làm địa chỉ mặc định"
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button onClick={onClose} disabled={loading}>Huỷ</Button>
        <Button variant="contained" onClick={handleSubmit} disabled={loading}>
          {loading ? 'Đang lưu...' : editData ? 'Cập nhật' : 'Thêm địa chỉ'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default AddressFormDialog
