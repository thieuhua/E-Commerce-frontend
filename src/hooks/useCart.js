import useCartStore from '@/stores/cartStore'
import useAuthStore from '@/stores/authStore'
import toast from 'react-hot-toast'

const useCart = () => {
  const store  = useCartStore()
  const isAuth = useAuthStore((s) => s.isAuth)

  const addItem = async (productId, quantity = 1) => {
    if (!isAuth) {
      toast.error('Vui lòng đăng nhập để thêm vào giỏ hàng')
      return false
    }
    try {
      await store.addItem(productId, quantity)
      toast.success('Đã thêm vào giỏ hàng!')
      return true
    } catch (err) {
      toast.error(err.response?.data?.message ?? 'Không thể thêm sản phẩm')
      return false
    }
  }

  const updateItem = async (itemId, quantity) => {
    try {
      await store.updateItem(itemId, quantity)
    } catch (err) {
      toast.error(err.response?.data?.message ?? 'Cập nhật thất bại')
    }
  }

  const removeItem = async (itemId) => {
    try {
      await store.removeItem(itemId)
      toast.success('Đã xoá khỏi giỏ hàng')
    } catch {
      toast.error('Không thể xoá sản phẩm')
    }
  }

  return {
    cart:       store.cart,
    loading:    store.loading,
    itemCount:  store.itemCount(),
    total:      store.total(),
    fetchCart:  store.fetchCart,
    addItem,
    updateItem,
    removeItem,
    clearCart:  store.clearCart,
  }
}

export default useCart
