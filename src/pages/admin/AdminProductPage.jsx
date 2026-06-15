import { useState, useRef } from 'react'
import {
  Box, Button, Card, Table, TableBody, TableCell, TableHead, TableRow,
  Typography, TextField, IconButton, Chip, Dialog, DialogTitle,
  DialogContent, DialogActions, Grid, MenuItem, Select, FormControl,
  InputLabel, Stack, Alert, Pagination, Tooltip, InputAdornment,
} from '@mui/material'
import AddIcon        from '@mui/icons-material/Add'
import EditIcon       from '@mui/icons-material/Edit'
import DeleteIcon     from '@mui/icons-material/Delete'
import SearchIcon     from '@mui/icons-material/Search'
import PhotoIcon      from '@mui/icons-material/Photo'
import CloseIcon      from '@mui/icons-material/Close'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminApi, catalogApi } from '@/api'
import { formatVND, getImageUrl } from '@/utils'
import ConfirmDialog from '@/components/common/ConfirmDialog'
import { useToast }  from '@/hooks'

const STATUS_OPTS = [
  { value: 'active',       label: 'Đang bán',   color: 'success' },
  { value: 'inactive',     label: 'Ngừng bán',  color: 'default' },
  { value: 'out_of_stock', label: 'Hết hàng',   color: 'error'   },
]

const EMPTY_FORM = {
  name: '', description: '', price: '', stock_quantity: '',
  category_id: '', brand_id: '', status: 'active',
}

// ── Product Form Dialog ───────────────────────────────────────
const ProductFormDialog = ({ open, onClose, editData, categories, brands }) => {
  const qc    = useQueryClient()
  const toast = useToast()
  const fileRef = useRef()

  const [form,     setForm]     = useState(editData ?? EMPTY_FORM)
  const [files,    setFiles]    = useState([])
  const [previews, setPreviews] = useState([])
  const [errors,   setErrors]   = useState({})

  // Reset when opening
  useState(() => {
    if (open) { setForm(editData ?? EMPTY_FORM); setFiles([]); setPreviews([]); setErrors({}) }
  }, [open])

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleFiles = (e) => {
    const selected = Array.from(e.target.files)
    setFiles(selected)
    setPreviews(selected.map(f => URL.createObjectURL(f)))
  }

  const mutation = useMutation({
    mutationFn: () => {
      const fd = new FormData()
      Object.entries(form).forEach(([k, v]) => v !== '' && fd.append(k, v))
      files.forEach(f => fd.append('images', f))
      return editData
        ? adminApi.updateProduct(editData.product_id, fd)
        : adminApi.createProduct(fd)
    },
    onSuccess: () => {
      qc.invalidateQueries(['admin-products'])
      toast.success(editData ? 'Cập nhật thành công!' : 'Tạo sản phẩm thành công!')
      onClose()
    },
    onError: (err) => {
      const apiErrors = err.response?.data?.errors
      if (apiErrors) {
        const map = {}; apiErrors.forEach(({ field, message }) => { map[field] = message }); setErrors(map)
      } else toast.apiError(err)
    },
  })

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {editData ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}
        <IconButton onClick={onClose}><CloseIcon /></IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={2.5}>
          {/* Name */}
          <Grid item xs={12}>
            <TextField fullWidth label="Tên sản phẩm" value={form.name} onChange={set('name')}
                       required error={!!errors.name} helperText={errors.name} />
          </Grid>
          {/* Category + Brand */}
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth required error={!!errors.category_id}>
              <InputLabel>Danh mục</InputLabel>
              <Select value={form.category_id} label="Danh mục" onChange={set('category_id')}>
                {categories.map(c => (
                  <MenuItem key={c.category_id} value={c.category_id}>{c.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth required error={!!errors.brand_id}>
              <InputLabel>Thương hiệu</InputLabel>
              <Select value={form.brand_id} label="Thương hiệu" onChange={set('brand_id')}>
                {brands.map(b => (
                  <MenuItem key={b.brand_id} value={b.brand_id}>{b.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          {/* Price + Stock */}
          <Grid item xs={12} sm={4}>
            <TextField fullWidth label="Giá (VNĐ)" type="number" value={form.price} onChange={set('price')}
                       required error={!!errors.price} helperText={errors.price}
                       InputProps={{ startAdornment: <InputAdornment position="start">₫</InputAdornment> }} />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField fullWidth label="Tồn kho" type="number" value={form.stock_quantity}
                       onChange={set('stock_quantity')} error={!!errors.stock_quantity} />
          </Grid>
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth>
              <InputLabel>Trạng thái</InputLabel>
              <Select value={form.status} label="Trạng thái" onChange={set('status')}>
                {STATUS_OPTS.map(o => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
          {/* Description */}
          <Grid item xs={12}>
            <TextField fullWidth multiline rows={4} label="Mô tả sản phẩm"
                       value={form.description} onChange={set('description')} />
          </Grid>
          {/* Images */}
          <Grid item xs={12}>
            <Typography variant="body2" fontWeight={600} gutterBottom>
              Hình ảnh {editData ? '(thêm mới)' : ''}
            </Typography>
            <Button variant="outlined" startIcon={<PhotoIcon />}
                    onClick={() => fileRef.current.click()} size="small">
              Chọn ảnh (tối đa 10)
            </Button>
            <input ref={fileRef} type="file" multiple accept="image/*"
                   style={{ display: 'none' }} onChange={handleFiles} />
            {previews.length > 0 && (
              <Box sx={{ display: 'flex', gap: 1, mt: 1.5, flexWrap: 'wrap' }}>
                {previews.map((src, i) => (
                  <Box key={i} component="img" src={src}
                       sx={{ width: 72, height: 72, objectFit: 'cover', borderRadius: 1,
                             border: '1px solid', borderColor: 'divider' }} />
                ))}
              </Box>
            )}
            {/* Existing images when editing */}
            {editData?.images?.length > 0 && (
              <Box sx={{ mt: 1.5 }}>
                <Typography variant="caption" color="text.secondary">Ảnh hiện tại:</Typography>
                <Box sx={{ display: 'flex', gap: 1, mt: 0.5, flexWrap: 'wrap' }}>
                  {editData.images.map((img) => (
                    <Box key={img.image_id} sx={{ position: 'relative' }}>
                      <Box component="img" src={getImageUrl(img.image_url)}
                           sx={{ width: 72, height: 72, objectFit: 'contain', borderRadius: 1,
                                 border: '1px solid', borderColor: 'divider', bgcolor: '#fafafa' }} />
                    </Box>
                  ))}
                </Box>
              </Box>
            )}
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose}>Huỷ</Button>
        <Button variant="contained" onClick={() => mutation.mutate()} disabled={mutation.isPending}>
          {mutation.isPending ? 'Đang lưu...' : editData ? 'Cập nhật' : 'Tạo sản phẩm'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

// ── Main Page ─────────────────────────────────────────────────
const AdminProductPage = () => {
  const qc    = useQueryClient()
  const toast = useToast()

  const [page,    setPage]    = useState(1)
  const [search,  setSearch]  = useState('')
  const [query,   setQuery]   = useState('')
  const [dialog,  setDialog]  = useState(false)
  const [editData, setEditData] = useState(null)
  const [deleteId, setDeleteId] = useState(null)

  const { data, isLoading } = useQuery({
    queryKey: ['admin-products', page, query],
    queryFn:  () => adminApi.listProducts({ page, limit: 15, search: query || undefined }),
  })
  const { data: catRes }   = useQuery({ queryKey: ['categories'], queryFn: () => catalogApi.categories() })
  const { data: brandRes } = useQuery({ queryKey: ['brands'],     queryFn: () => catalogApi.brands() })

  const products   = data?.data?.data ?? []
  const pagination = data?.data?.pagination ?? {}

  // Flatten all categories (parent + children)
  const rawCats = catRes?.data?.data ?? []
  const allCats = rawCats.flatMap(c => [c, ...(c.children ?? [])])
  const brands  = brandRes?.data?.data ?? []

  const deleteMut = useMutation({
    mutationFn: (id) => adminApi.deleteProduct(id),
    onSuccess:  () => { qc.invalidateQueries(['admin-products']); toast.success('Đã xoá sản phẩm') },
    onError:    (err) => toast.apiError(err),
  })

  const openCreate = () => { setEditData(null); setDialog(true) }
  const openEdit   = (p)  => { setEditData(p);  setDialog(true) }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h5" fontWeight={700}>Quản lý sản phẩm</Typography>
          <Typography variant="body2" color="text.secondary">
            {pagination.total ?? 0} sản phẩm
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>
          Thêm sản phẩm
        </Button>
      </Box>

      {/* Search */}
      <Card sx={{ mb: 2 }}>
        <Box sx={{ p: 2, display: 'flex', gap: 2 }}>
          <TextField
            placeholder="Tìm tên sản phẩm..." size="small" sx={{ flex: 1, maxWidth: 360 }}
            value={search} onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (setQuery(search), setPage(1))}
            InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> }}
          />
          <Button variant="outlined" onClick={() => { setQuery(search); setPage(1) }}>Tìm</Button>
          {query && <Button onClick={() => { setSearch(''); setQuery(''); setPage(1) }}>Xoá lọc</Button>}
        </Box>
      </Card>

      {/* Table */}
      <Card>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Sản phẩm</TableCell>
              <TableCell>Danh mục</TableCell>
              <TableCell align="right">Giá</TableCell>
              <TableCell align="center">Tồn kho</TableCell>
              <TableCell align="center">Trạng thái</TableCell>
              <TableCell align="center">Thao tác</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading
              ? Array.from({ length: 8 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 6 }).map((_, j) => (
                      <TableCell key={j}><Box sx={{ height: 20, bgcolor: 'grey.100', borderRadius: 1 }} /></TableCell>
                    ))}
                  </TableRow>
                ))
              : products.map((p) => (
                  <TableRow key={p.product_id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Box component="img" src={getImageUrl(p.images?.[0]?.image_url)}
                             sx={{ width: 44, height: 44, objectFit: 'contain', borderRadius: 1,
                                   bgcolor: '#fafafa', border: '1px solid', borderColor: 'divider', flexShrink: 0 }} />
                        <Box>
                          <Typography variant="body2" fontWeight={600} sx={{ maxWidth: 240, overflow: 'hidden',
                                                                             textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {p.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">{p.brand?.name}</Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{p.category?.name}</Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography fontWeight={700} color="error.main">{formatVND(p.price)}</Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Chip label={p.stock_quantity}
                            color={p.stock_quantity <= 5 ? 'error' : p.stock_quantity <= 20 ? 'warning' : 'default'}
                            size="small" />
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={STATUS_OPTS.find(s => s.value === p.status)?.label ?? p.status}
                        color={STATUS_OPTS.find(s => s.value === p.status)?.color ?? 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="Chỉnh sửa">
                        <IconButton size="small" onClick={() => openEdit(p)}><EditIcon fontSize="small" /></IconButton>
                      </Tooltip>
                      <Tooltip title="Xoá">
                        <IconButton size="small" color="error" onClick={() => setDeleteId(p.product_id)}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
          </TableBody>
        </Table>

        {pagination.totalPages > 1 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
            <Pagination count={pagination.totalPages} page={page}
                        color="primary" onChange={(_, p) => setPage(p)} />
          </Box>
        )}
      </Card>

      <ProductFormDialog
        open={dialog} onClose={() => setDialog(false)}
        editData={editData} categories={allCats} brands={brands}
      />

      <ConfirmDialog
        open={!!deleteId} onClose={() => setDeleteId(null)}
        onConfirm={() => { deleteMut.mutate(deleteId); setDeleteId(null) }}
        loading={deleteMut.isPending}
        title="Xoá sản phẩm?"
        description="Sản phẩm và toàn bộ ảnh sẽ bị xoá vĩnh viễn. Hành động không thể hoàn tác."
        confirmLabel="Xoá sản phẩm"
      />
    </Box>
  )
}

export default AdminProductPage
