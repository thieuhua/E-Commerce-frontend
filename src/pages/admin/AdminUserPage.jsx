import { useState } from 'react'
import {
  Box, Card, Table, TableBody, TableCell, TableHead, TableRow,
  Typography, Select, MenuItem, FormControl, Pagination,
  Avatar, Chip, InputAdornment, TextField, Button,
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminApi } from '@/api'
import { formatDate } from '@/utils'
import { useToast } from '@/hooks'

const ROLES = [
  { value: 'customer', label: 'Khách hàng', color: 'default'  },
  { value: 'staff',    label: 'Nhân viên',  color: 'info'     },
  { value: 'admin',    label: 'Admin',      color: 'warning'  },
]

const AdminUserPage = () => {
  const qc    = useQueryClient()
  const toast = useToast()

  const [page,   setPage]   = useState(1)
  const [role,   setRole]   = useState('')
  const [search, setSearch] = useState('')
  const [query,  setQuery]  = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users', page, role, query],
    queryFn:  () => adminApi.listUsers({
      page, limit: 15,
      role:   role   || undefined,
      search: query  || undefined,
    }),
  })

  const users      = data?.data?.data ?? []
  const pagination = data?.data?.pagination ?? {}

  const roleMut = useMutation({
    mutationFn: ({ id, newRole }) => adminApi.setUserRole(id, newRole),
    onSuccess:  () => { qc.invalidateQueries(['admin-users']); toast.success('Đã cập nhật quyền') },
    onError:    (err) => toast.apiError(err),
  })

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight={700}>Quản lý người dùng</Typography>
        <Typography variant="body2" color="text.secondary">{pagination.total ?? 0} người dùng</Typography>
      </Box>

      {/* Filters */}
      <Card sx={{ mb: 2 }}>
        <Box sx={{ p: 2, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
          <TextField
            size="small" placeholder="Tìm tên, email..." sx={{ flex: 1, maxWidth: 320 }}
            value={search} onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (setQuery(search), setPage(1))}
            InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> }}
          />
          <Button variant="outlined" size="small" onClick={() => { setQuery(search); setPage(1) }}>
            Tìm
          </Button>

          <FormControl size="small" sx={{ minWidth: 150 }}>
            <Select value={role} onChange={(e) => { setRole(e.target.value); setPage(1) }}
                    displayEmpty renderValue={(v) => v ? ROLES.find(r => r.value === v)?.label : 'Tất cả role'}>
              <MenuItem value="">Tất cả</MenuItem>
              {ROLES.map(r => <MenuItem key={r.value} value={r.value}>{r.label}</MenuItem>)}
            </Select>
          </FormControl>

          {(query || role) && (
            <Button size="small" onClick={() => { setSearch(''); setQuery(''); setRole(''); setPage(1) }}>
              Xoá lọc
            </Button>
          )}
        </Box>
      </Card>

      <Card>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Người dùng</TableCell>
              <TableCell>Số điện thoại</TableCell>
              <TableCell>Ngày đăng ký</TableCell>
              <TableCell align="center">Quyền hiện tại</TableCell>
              <TableCell align="center">Đổi quyền</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading
              ? Array.from({ length: 8 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 5 }).map((_, j) => (
                      <TableCell key={j}>
                        <Box sx={{ height: 20, bgcolor: 'grey.100', borderRadius: 1 }} />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              : users.map((u) => {
                  const roleInfo = ROLES.find(r => r.value === u.role)
                  return (
                    <TableRow key={u.user_id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Avatar sx={{ width: 36, height: 36, bgcolor: 'primary.main', fontSize: 14 }}>
                            {u.full_name?.[0]?.toUpperCase()}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" fontWeight={600}>{u.full_name}</Typography>
                            <Typography variant="caption" color="text.secondary">{u.email}</Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{u.phone || '—'}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption">{formatDate(u.created_at)}</Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Chip label={roleInfo?.label ?? u.role} color={roleInfo?.color ?? 'default'} size="small" />
                      </TableCell>
                      <TableCell align="center">
                        <FormControl size="small" sx={{ minWidth: 130 }}>
                          <Select
                            value={u.role}
                            onChange={(e) => roleMut.mutate({ id: u.user_id, newRole: e.target.value })}
                          >
                            {ROLES.map(r => (
                              <MenuItem key={r.value} value={r.value}>{r.label}</MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </TableCell>
                    </TableRow>
                  )
                })}
          </TableBody>
        </Table>

        {pagination.totalPages > 1 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
            <Pagination count={pagination.totalPages} page={page}
                        color="primary" onChange={(_, p) => setPage(p)} />
          </Box>
        )}
      </Card>
    </Box>
  )
}

export default AdminUserPage
