import { create } from 'zustand'
import { cartApi } from '@/api'

const useCartStore = create((set, get) => ({
  cart:    null,   // { cart_id, items[], total }
  loading: false,

  // Fetch toàn bộ cart từ server
  fetchCart: async () => {
    set({ loading: true })
    try {
      const { data } = await cartApi.get()
      set({ cart: data.data })
    } catch {
      set({ cart: null })
    } finally {
      set({ loading: false })
    }
  },

  addItem: async (productId, quantity = 1) => {
    const { data } = await cartApi.addItem(productId, quantity)
    set({ cart: data.data })
  },

  updateItem: async (itemId, quantity) => {
    const { data } = await cartApi.updateItem(itemId, quantity)
    set({ cart: data.data })
  },

  removeItem: async (itemId) => {
    const { data } = await cartApi.removeItem(itemId)
    set({ cart: data.data })
  },

  clearCart: async () => {
    await cartApi.clear()
    set({ cart: { ...get().cart, items: [], total: 0 } })
  },

  // Reset local state (sau logout)
  reset: () => set({ cart: null }),

  // Computed
  itemCount: () => get().cart?.items?.reduce((s, i) => s + i.quantity, 0) ?? 0,
  total:     () => get().cart?.total ?? 0,
}))

export default useCartStore
