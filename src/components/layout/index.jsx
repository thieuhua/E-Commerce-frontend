import { Box } from '@mui/material'
import { Outlet } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Navbar from './Navbar'
import Footer from './Footer'
import ScrollToTop from '@/components/common/ScrollToTop'

export const MainLayout = () => (
  <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
    <Toaster position="top-center" toastOptions={{ duration: 3000,
      style: { borderRadius: '8px', fontSize: '14px' } }} />
    <ScrollToTop />
    <Navbar />
    <Box component="main" sx={{ flex: 1 }}>
      <Outlet />
    </Box>
    <Footer />
  </Box>
)

export const AuthLayout = () => (
  <Box sx={{ minHeight: '100vh', bgcolor: 'background.default',
             display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2 }}>
    <Toaster position="top-center" />
    <Outlet />
  </Box>
)
