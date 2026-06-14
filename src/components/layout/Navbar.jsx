import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  AppBar, Toolbar, Typography, IconButton, Badge, Box, Button,
  Avatar, Menu, MenuItem, Divider, InputBase, Tooltip,
} from '@mui/material'
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart'
import SearchIcon       from '@mui/icons-material/Search'
import PersonIcon       from '@mui/icons-material/Person'
import LogoutIcon       from '@mui/icons-material/Logout'
import ReceiptLongIcon  from '@mui/icons-material/ReceiptLong'
import LocationOnIcon   from '@mui/icons-material/LocationOn'
import LockIcon         from '@mui/icons-material/Lock'
import { useAuth, useCart } from '@/hooks'

const Navbar = () => {
  const { user, isAuth, logout } = useAuth()
  const { itemCount } = useCart()
  const navigate      = useNavigate()

  const [anchorEl, setAnchorEl] = useState(null)
  const [search,   setSearch]   = useState('')

  const handleSearch = (e) => {
    e.preventDefault()
    if (search.trim()) navigate(`/products?search=${encodeURIComponent(search.trim())}`)
  }

  return (
    <AppBar position="sticky" sx={{ zIndex: (t) => t.zIndex.drawer + 1 }}>
      <Toolbar sx={{ gap: 1.5, minHeight: 64 }}>
        {/* Logo */}
        <Typography
          component={Link} to="/"
          variant="h6" fontWeight={800}
          sx={{ textDecoration: 'none', color: 'primary.main',
                flexShrink: 0, letterSpacing: '-0.5px' }}
        >
          Tech<span style={{ color: '#FF6F00' }}>Shop</span>
        </Typography>

        {/* Search */}
        <Box
          component="form" onSubmit={handleSearch}
          sx={{ flex: 1, maxWidth: 520, mx: 'auto',
                display: 'flex', alignItems: 'center',
                bgcolor: '#F5F7FA', borderRadius: 2,
                px: 1.5, border: '1px solid', borderColor: 'divider' }}
        >
          <SearchIcon sx={{ color: 'text.secondary', mr: 1, fontSize: 20 }} />
          <InputBase
            fullWidth placeholder="Tìm kiếm sản phẩm..."
            value={search} onChange={(e) => setSearch(e.target.value)}
            sx={{ fontSize: 14 }}
          />
        </Box>

        {/* Right actions */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, ml: 'auto' }}>
          {/* Cart */}
          <Tooltip title="Giỏ hàng">
            <IconButton component={Link} to="/cart">
              <Badge badgeContent={itemCount} color="error" max={99}>
                <ShoppingCartIcon />
              </Badge>
            </IconButton>
          </Tooltip>

          {/* Auth */}
          {isAuth ? (
            <>
              <Tooltip title={user.full_name}>
                <IconButton onClick={(e) => setAnchorEl(e.currentTarget)} size="small">
                  <Avatar sx={{ width: 34, height: 34, bgcolor: 'primary.main', fontSize: 14 }}>
                    {user.full_name?.[0]?.toUpperCase()}
                  </Avatar>
                </IconButton>
              </Tooltip>

              <Menu
                anchorEl={anchorEl} open={Boolean(anchorEl)}
                onClose={() => setAnchorEl(null)}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                PaperProps={{ sx: { mt: 1, minWidth: 200, boxShadow: 3 } }}
              >
                <Box sx={{ px: 2, py: 1.5 }}>
                  <Typography fontWeight={600}>{user.full_name}</Typography>
                  <Typography variant="caption" color="text.secondary">{user.email}</Typography>
                </Box>
                <Divider />
                <MenuItem component={Link} to="/profile" onClick={() => setAnchorEl(null)}>
                  <PersonIcon fontSize="small" sx={{ mr: 1.5, color: 'text.secondary' }} />
                  Hồ sơ của tôi
                </MenuItem>
                <MenuItem component={Link} to="/orders" onClick={() => setAnchorEl(null)}>
                  <ReceiptLongIcon fontSize="small" sx={{ mr: 1.5, color: 'text.secondary' }} />
                  Đơn hàng của tôi
                </MenuItem>
                <MenuItem component={Link} to="/addresses" onClick={() => setAnchorEl(null)}>
                  <LocationOnIcon fontSize="small" sx={{ mr: 1.5, color: 'text.secondary' }} />
                  Địa chỉ giao hàng
                </MenuItem>
                <MenuItem component={Link} to="/change-password" onClick={() => setAnchorEl(null)}>
                  <LockIcon fontSize="small" sx={{ mr: 1.5, color: 'text.secondary' }} />
                  Đổi mật khẩu
                </MenuItem>
                <Divider />
                <MenuItem onClick={() => { setAnchorEl(null); logout() }} sx={{ color: 'error.main' }}>
                  <LogoutIcon fontSize="small" sx={{ mr: 1.5 }} />
                  Đăng xuất
                </MenuItem>
              </Menu>
            </>
          ) : (
            <>
              <Button component={Link} to="/login" variant="outlined" size="small">Đăng nhập</Button>
              <Button component={Link} to="/register" variant="contained" size="small">Đăng ký</Button>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  )
}

export default Navbar
