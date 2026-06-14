import axios from 'axios'

// Access token sống trong memory — không bao giờ lưu localStorage
let _accessToken = null

export const setAccessToken  = (t) => { _accessToken = t }
export const getAccessToken  = ()  => _accessToken
export const clearAccessToken = () => { _accessToken = null }

const api = axios.create({
  baseURL: '/api',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
})

// ── Request: gắn Bearer token ────────────────────────────────
api.interceptors.request.use((config) => {
  if (_accessToken) config.headers.Authorization = `Bearer ${_accessToken}`
  return config
})

// ── Response: tự refresh khi 401 ─────────────────────────────
let _refreshing = null  // singleton promise — tránh gọi refresh song song

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config

    // Bỏ qua nếu: không phải 401, hoặc đã retry, hoặc chính là call /auth/refresh
    if (
      err.response?.status !== 401 ||
      original._retry ||
      original.url === '/auth/refresh'
    ) {
      return Promise.reject(err)
    }

    original._retry = true

    try {
      if (!_refreshing) {
        const rt = localStorage.getItem('refreshToken')
        if (!rt) throw new Error('No refresh token')

        _refreshing = api
          .post('/auth/refresh', { refresh_token: rt })
          .then(({ data }) => {
            setAccessToken(data.data.accessToken)
            localStorage.setItem('refreshToken', data.data.refreshToken)
            return data.data.accessToken
          })
          .finally(() => { _refreshing = null })
      }

      const newToken = await _refreshing
      original.headers.Authorization = `Bearer ${newToken}`
      return api(original)
    } catch {
      // Refresh thất bại → đăng xuất
      clearAccessToken()
      localStorage.removeItem('refreshToken')
      window.dispatchEvent(new Event('auth:logout'))
      return Promise.reject(err)
    }
  }
)

export default api
