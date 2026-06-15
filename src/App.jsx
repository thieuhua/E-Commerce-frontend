import { useEffect, useState } from 'react'
import { RouterProvider, createBrowserRouter } from 'react-router-dom'
import { ThemeProvider, CssBaseline } from '@mui/material'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

import theme from '@/theme'
import useAuthStore from '@/stores/authStore'
import useCartStore from '@/stores/cartStore'

import { MainLayout, AuthLayout }     from '@/components/layout'
import AdminLayout                    from '@/components/admin/AdminLayout'
import { ProtectedRoute, GuestRoute } from '@/components/common/RouteGuards'
import LoadingScreen                  from '@/components/common/LoadingScreen'

// Customer pages
import HomePage          from '@/pages/customer/HomePage'
import ProductListPage   from '@/pages/customer/ProductListPage'
import ProductDetailPage from '@/pages/customer/ProductDetailPage'
import CartPage          from '@/pages/customer/CartPage'
import CheckoutPage      from '@/pages/customer/CheckoutPage'
import { OrderListPage, OrderDetailPage }             from '@/pages/customer/OrderPages'
import { ProfilePage, AddressPage, ChangePasswordPage } from '@/pages/customer/ProfilePages'
import { LoginPage, RegisterPage }                    from '@/pages/auth/AuthPages'
import { NotFoundPage, ErrorPage }                    from '@/pages/error/ErrorPages'

// Admin pages
import AdminDashboardPage from '@/pages/admin/AdminDashboardPage'
import AdminProductPage   from '@/pages/admin/AdminProductPage'
import AdminOrderPage     from '@/pages/admin/AdminOrderPage'
import AdminUserPage      from '@/pages/admin/AdminUserPage'

// ── QueryClient ───────────────────────────────────────────────
const qc = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 60_000, retry: 1, refetchOnWindowFocus: false },
  },
})

// ── Router ────────────────────────────────────────────────────
const router = createBrowserRouter([
  // ── Public / Customer ──────────────────────────────────────
  {
    path: '/',
    element: <MainLayout />,
    errorElement: <ErrorPage />,
    children: [
      { index: true,          element: <HomePage /> },
      { path: 'products',     element: <ProductListPage /> },
      { path: 'products/:id', element: <ProductDetailPage /> },
      { path: 'cart',         element: <CartPage /> },
      { path: 'checkout',     element: <ProtectedRoute><CheckoutPage /></ProtectedRoute> },
      { path: 'orders',       element: <ProtectedRoute><OrderListPage /></ProtectedRoute> },
      { path: 'orders/:id',   element: <ProtectedRoute><OrderDetailPage /></ProtectedRoute> },
      { path: 'profile',      element: <ProtectedRoute><ProfilePage /></ProtectedRoute> },
      { path: 'addresses',    element: <ProtectedRoute><AddressPage /></ProtectedRoute> },
      { path: 'change-password', element: <ProtectedRoute><ChangePasswordPage /></ProtectedRoute> },
      { path: '*',            element: <NotFoundPage /> },
    ],
  },

  // ── Auth ───────────────────────────────────────────────────
  {
    element: <AuthLayout />,
    children: [
      { path: 'login',    element: <GuestRoute><LoginPage /></GuestRoute> },
      { path: 'register', element: <GuestRoute><RegisterPage /></GuestRoute> },
    ],
  },

  // ── Admin ──────────────────────────────────────────────────
  {
    path: '/admin',
    element: (
      <ProtectedRoute roles={['admin', 'staff']}>
        <AdminLayout />
      </ProtectedRoute>
    ),
    errorElement: <ErrorPage />,
    children: [
      { index: true,           element: <AdminDashboardPage /> },
      { path: 'products',      element: <AdminProductPage /> },
      { path: 'orders',        element: <AdminOrderPage /> },
      { path: 'users',         element: (
          <ProtectedRoute roles={['admin']}>
            <AdminUserPage />
          </ProtectedRoute>
        ),
      },
    ],
  },
])

const Bootstrap = () => {
  const [booting, setBooting]  = useState(true)
  const restoreSession = useAuthStore((s) => s.restoreSession)
  const fetchCart      = useCartStore((s) => s.fetchCart)

  useEffect(() => {
    const boot = async () => {
      try {
        const ok = await restoreSession()
        if (ok) await fetchCart()
      } catch { /* silent */ }
      finally { setBooting(false) }
    }
    boot()

    const onLogout = () => {
      useAuthStore.getState().logout()
      useCartStore.getState().reset()
    }
    window.addEventListener('auth:logout', onLogout)
    return () => window.removeEventListener('auth:logout', onLogout)
  }, [])

  if (booting) return <LoadingScreen message="Đang khởi động TechShop..." />
  return <RouterProvider router={router} />
}

// ── App ───────────────────────────────────────────────────────
const App = () => (
  <QueryClientProvider client={qc}>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Bootstrap />
    </ThemeProvider>
    {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
  </QueryClientProvider>
)

export default App
