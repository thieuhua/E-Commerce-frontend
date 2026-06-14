import { Box, Rating, Typography } from '@mui/material'

const StarRating = ({ value, count, size = 'small', showCount = true }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
    <Rating value={Number(value)} precision={0.1} size={size} readOnly />
    {showCount && (
      <Typography variant="caption" color="text.secondary">
        ({count ?? 0})
      </Typography>
    )}
  </Box>
)

export default StarRating
