import { useState } from 'react'
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import {
  Box, Drawer, List, ListItem, ListItemButton, ListItemIcon,
  ListItemText, Toolbar, AppBar, Typography, IconButton,
  Avatar, Divider, Tooltip, Chip, useMediaQuery, useTheme,
} from '@mui/material'
import DashboardIcon   from '@mui/icons-material/Dashboard'
import InventoryIcon   from '@mui/icons-material/Inventory'
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong'
import PeopleIcon      from '@mui/icons-material/People'
import MenuIcon        from '@mui/icons-material/Menu'
import LogoutIcon      from '@mui/icons-material/Logout'
import StorefrontIcon  from '@mui/icons-material/Storefront'
import ArrowBackIcon   from '@mui/icons-material/ArrowBack'
import { Toaster }     from 'react-hot-toast'
import { useAuth }     from '@/hooks'
import ScrollToTop     from '@/components/common/ScrollToTop'

const DRAWER_WIDTH = 240

const NAV_ITEMS = [
  { label: 'Tổng quan',     icon: DashboardIcon,   to: '/admin' },
  { label: 'Sản phẩm',      icon: InventoryIcon,   to: '/admin/products' },
  { label: 'Đơn hàng',      icon: ReceiptLongIcon, to: '/admin/orders' },
  { label: 'Người dùng',    icon: PeopleIcon,      to: '/admin/users' },
]

const AdminLayout = () => {
  const { user, logout } = useAuth()
  const location   = useLocation()
  const navigate   = useNavigate()
  const theme      = useTheme()
  const isMobile   = useMediaQuery(theme.breakpoints.down('md'))
  const [open, setOpen] = useState(false)

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Logo */}
      <Box sx={{ px: 2.5, py: 2.5, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Box sx={{ width: 36, height: 36, borderRadius: 1.5, bgcolor: 'primary.main',
                   display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <StorefrontIcon sx={{ color: 'white', fontSize: 20 }} />
        </Box>
        <Box>
          <Typography variant="subtitle2" fontWeight={800} lineHeight={1}>TechShop</Typography>
          <Typography variant="caption" color="text.secondary">Admin Panel</Typography>
        </Box>
      </Box>
      <Divider />

      {/* Nav */}
      <List sx={{ flex: 1, px: 1.5, py: 1.5 }}>
        {NAV_ITEMS.map(({ label, icon: Icon, to }) => {
          const active = to === '/admin'
            ? location.pathname === '/admin'
            : location.pathname.startsWith(to)
          return (
            <ListItem key={to} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                component={Link} to={to}
                onClick={() => isMobile && setOpen(false)}
                sx={{
                  borderRadius: 1.5, py: 1,
                  bgcolor: active ? 'primary.main' : 'transparent',
                  color:   active ? 'white' : 'text.primary',
                  '&:hover': { bgcolor: active ? 'primary.dark' : 'action.hover' },
                }}
              >
                <ListItemIcon sx={{ minWidth: 36, color: active ? 'white' : 'text.secondary' }}>
                  <Icon fontSize="small" />
                </ListItemIcon>
                <ListItemText primary={label} primaryTypographyProps={{ fontSize: 13.5, fontWeight: active ? 700 : 500 }} />
              </ListItemButton>
            </ListItem>
          )
        })}
      </List>

      <Divider />

      {/* User info */}
      <Box sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
          <Avatar sx={{ width: 34, height: 34, bgcolor: 'primary.main', fontSize: 14 }}>
            {user?.full_name?.[0]?.toUpperCase()}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="body2" fontWeight={700} noWrap>{user?.full_name}</Typography>
            <Chip label={user?.role} size="small" color="warning" sx={{ height: 16, fontSize: 10 }} />
          </Box>
        </Box>
        <ListItemButton onClick={() => navigate('/')} sx={{ borderRadius: 1.5, py: 0.75, mb: 0.5 }}>
          <ListItemIcon sx={{ minWidth: 32 }}><ArrowBackIcon fontSize="small" /></ListItemIcon>
          <ListItemText primary="Về trang chủ" primaryTypographyProps={{ fontSize: 13 }} />
        </ListItemButton>
        <ListItemButton onClick={logout} sx={{ borderRadius: 1.5, py: 0.75, color: 'error.main' }}>
          <ListItemIcon sx={{ minWidth: 32, color: 'error.main' }}><LogoutIcon fontSize="small" /></ListItemIcon>
          <ListItemText primary="Đăng xuất" primaryTypographyProps={{ fontSize: 13 }} />
        </ListItemButton>
      </Box>
    </Box>
  )

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
      <ScrollToTop />

      {/* Sidebar desktop */}
      {!isMobile && (
        <Drawer variant="permanent" sx={{
          width: DRAWER_WIDTH, flexShrink: 0,
          '& .MuiDrawer-paper': { width: DRAWER_WIDTH, boxSizing: 'border-box', border: 'none',
                                   borderRight: '1px solid', borderColor: 'divider' },
        }}>
          {drawer}
        </Drawer>
      )}

      {/* Drawer mobile */}
      {isMobile && (
        <Drawer open={open} onClose={() => setOpen(false)}
                PaperProps={{ sx: { width: DRAWER_WIDTH } }}>
          {drawer}
        </Drawer>
      )}

      {/* Main */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Mobile AppBar */}
        {isMobile && (
          <AppBar position="sticky" elevation={0}
                  sx={{ borderBottom: '1px solid', borderColor: 'divider', bgcolor: 'white' }}>
            <Toolbar>
              <IconButton onClick={() => setOpen(true)} sx={{ mr: 1 }}>
                <MenuIcon />
              </IconButton>
              <Typography variant="h6" fontWeight={700} color="primary.main">TechShop Admin</Typography>
            </Toolbar>
          </AppBar>
        )}

        <Box component="main" sx={{ flex: 1, p: { xs: 2, md: 3 } }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  )
}

export default AdminLayout
