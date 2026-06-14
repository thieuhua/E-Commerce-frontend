import { useNavigate, useLocation } from 'react-router-dom'
import toast from 'react-hot-toast'
import useAuthStore from '@/stores/authStore'
import useCartStore from '@/stores/cartStore'

const useAuth = () => {
  const navigate  = useNavigate()
  const location  = useLocation()
  const store     = useAuthStore()
  const resetCart = useCartStore((s) => s.reset)
  const fetchCart = useCartStore((s) => s.fetchCart)

  const login = async (credentials) => {
    const { authApi } = await import('@/api')
    const { data } = await authApi.login(credentials)
    store.setAuth(data.data)
    await fetchCart()
    toast.success(`Chào mừng, ${data.data.user.full_name}!`)
    // Redirect về trang trước nếu có
    const from = location.state?.from?.pathname ?? '/'
    navigate(from, { replace: true })
  }

  const register = async (payload) => {
    const { authApi } = await import('@/api')
    const { data } = await authApi.register(payload)
    store.setAuth(data.data)
    await fetchCart()
    toast.success('Đăng ký thành công! Chào mừng bạn đến TechShop.')
    navigate('/')
  }

  const logout = async () => {
    await store.logout()
    resetCart()
    toast.success('Đã đăng xuất')
    navigate('/login')
  }

  return {
    user:       store.user,
    isAuth:     store.isAuth,
    isAdmin:    store.isAdmin(),
    isStaff:    store.isStaff(),
    isCustomer: store.isCustomer(),
    login,
    register,
    logout,
    updateUser: store.updateUser,
  }
}

export default useAuth
