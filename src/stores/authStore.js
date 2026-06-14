import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { setAccessToken, clearAccessToken } from '@/api/axios'

const useAuthStore = create(
  persist(
    (set, get) => ({
      user:   null,
      isAuth: false,

      setAuth: ({ user, accessToken, refreshToken }) => {
        setAccessToken(accessToken)
        localStorage.setItem('refreshToken', refreshToken)
        set({ user, isAuth: true })
      },

      updateUser: (data) => set((s) => ({ user: { ...s.user, ...data } })),

      logout: async () => {
        try {
          const { authApi } = await import('@/api')
          await authApi.logout()
        } catch { /* ignore */ }
        clearAccessToken()
        localStorage.removeItem('refreshToken')
        set({ user: null, isAuth: false })
      },

      restoreSession: async () => {
        const rt = localStorage.getItem('refreshToken')
        if (!rt) return false
        try {
          const { authApi, userApi } = await import('@/api')
          const { data: refreshData } = await authApi.refresh(rt)
          setAccessToken(refreshData.data.accessToken)
          localStorage.setItem('refreshToken', refreshData.data.refreshToken)
          const { data: profileData } = await userApi.getProfile()
          set({ user: profileData.data, isAuth: true })
          return true
        } catch {
          clearAccessToken()
          localStorage.removeItem('refreshToken')
          set({ user: null, isAuth: false })
          return false
        }
      },

      isAdmin:    () => get().user?.role === 'admin',
      isStaff:    () => ['admin', 'staff'].includes(get().user?.role),
      isCustomer: () => get().user?.role === 'customer',
    }),
    {
      name: 'auth-store',
      partialize: (s) => ({ user: s.user, isAuth: s.isAuth }),
    }
  )
)

export default useAuthStore
