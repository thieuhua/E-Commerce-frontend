import { Box, CircularProgress, Typography } from '@mui/material'

const LoadingScreen = ({ message = 'Đang tải...' }) => (
  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center',
             justifyContent: 'center', minHeight: '100vh', gap: 2 }}>
    <CircularProgress size={48} />
    <Typography color="text.secondary">{message}</Typography>
  </Box>
)

export default LoadingScreen
