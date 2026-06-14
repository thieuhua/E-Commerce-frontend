import { Box, Typography, Divider } from '@mui/material'

const PageHeader = ({ title, subtitle, action }) => (
  <Box sx={{ mb: 3 }}>
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <Box>
        <Typography variant="h5" fontWeight={700}>{title}</Typography>
        {subtitle && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>{subtitle}</Typography>
        )}
      </Box>
      {action && <Box>{action}</Box>}
    </Box>
    <Divider sx={{ mt: 2 }} />
  </Box>
)

export default PageHeader
