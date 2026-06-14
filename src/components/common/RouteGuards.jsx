import { Navigate, useLocation } from 'react-router-dom'
import useAuthStore from '@/stores/authStore'

// Yêu cầu đăng nhập
export const ProtectedRoute = ({ children, roles }) => {
  const { isAuth, user } = useAuthStore()
  const location = useLocation()

  if (!isAuth) return <Navigate to="/login" state={{ from: location }} replace />
  if (roles && !roles.includes(user?.role)) return <Navigate to="/" replace />

  return children
}

// Chỉ cho guest (chưa đăng nhập)
export const GuestRoute = ({ children }) => {
  const isAuth = useAuthStore((s) => s.isAuth)
  return isAuth ? <Navigate to="/" replace /> : children
}
