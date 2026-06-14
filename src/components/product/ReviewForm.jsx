import { useState } from 'react'
import {
  Box, Paper, Typography, Rating, TextField,
  Button, Alert, Divider,
} from '@mui/material'
import StarIcon from '@mui/icons-material/Star'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { reviewApi } from '@/api'
import useAuthStore from '@/stores/authStore'
import toast from 'react-hot-toast'

const RATING_LABELS = { 1: 'Tệ', 2: 'Không tốt', 3: 'Bình thường', 4: 'Tốt', 5: 'Tuyệt vời' }

const ReviewForm = ({ productId, existingReview = null, onSuccess }) => {
  const isAuth = useAuthStore((s) => s.isAuth)
  const qc     = useQueryClient()

  const [rating,  setRating]  = useState(existingReview?.rating ?? 0)
  const [hover,   setHover]   = useState(-1)
  const [comment, setComment] = useState(existingReview?.comment ?? '')

  const mutation = useMutation({
    mutationFn: () =>
      existingReview
        ? reviewApi.update(existingReview.review_id, { rating, comment })
        : reviewApi.create(productId, { rating, comment }),
    onSuccess: () => {
      qc.invalidateQueries(['reviews', String(productId)])
      toast.success(existingReview ? 'Đã cập nhật đánh giá!' : 'Đánh giá thành công!')
      onSuccess?.()
      if (!existingReview) { setRating(0); setComment('') }
    },
    onError: (err) => {
      toast.error(err.response?.data?.message ?? 'Không thể gửi đánh giá')
    },
  })

  if (!isAuth) return (
    <Alert severity="info" sx={{ mt: 2 }}>
      Vui lòng <strong>đăng nhập</strong> để đánh giá sản phẩm này.
    </Alert>
  )

  return (
    <Paper variant="outlined" sx={{ p: 3, borderRadius: 2, mt: 2 }}>
      <Typography variant="subtitle1" fontWeight={700} gutterBottom>
        {existingReview ? 'Chỉnh sửa đánh giá' : 'Viết đánh giá của bạn'}
      </Typography>
      <Divider sx={{ mb: 2 }} />

      {/* Star rating */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
        <Typography variant="body2" color="text.secondary" sx={{ minWidth: 70 }}>Đánh giá:</Typography>
        <Rating
          value={rating}
          onChange={(_, v) => setRating(v)}
          onChangeActive={(_, v) => setHover(v)}
          size="large"
          emptyIcon={<StarIcon fontSize="inherit" />}
        />
        {(hover !== -1 || rating !== 0) && (
          <Typography variant="body2" color="warning.main" fontWeight={600}>
            {RATING_LABELS[hover !== -1 ? hover : rating]}
          </Typography>
        )}
      </Box>

      {/* Comment */}
      <TextField
        fullWidth multiline rows={3}
        placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm..."
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        sx={{ mb: 2 }}
      />

      <Button
        variant="contained"
        disabled={rating === 0 || mutation.isPending}
        onClick={() => mutation.mutate()}
      >
        {mutation.isPending ? 'Đang gửi...' : existingReview ? 'Cập nhật' : 'Gửi đánh giá'}
      </Button>

      {rating === 0 && (
        <Typography variant="caption" color="text.secondary" sx={{ ml: 2 }}>
          Chọn số sao để bắt đầu đánh giá
        </Typography>
      )}
    </Paper>
  )
}

export default ReviewForm
