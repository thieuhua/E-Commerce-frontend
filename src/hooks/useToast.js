import toast from 'react-hot-toast'

const useToast = () => ({
  success: (msg)         => toast.success(msg),
  error:   (msg)         => toast.error(msg),
  info:    (msg)         => toast(msg, { icon: 'ℹ️' }),
  promise: (p, msgs)     => toast.promise(p, msgs),
  apiError:(err, fallback = 'Có lỗi xảy ra') =>
    toast.error(err?.response?.data?.message ?? fallback),
})

export default useToast
