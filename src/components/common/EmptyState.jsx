import { Box, Typography, Button } from '@mui/material'
import InboxIcon from '@mui/icons-material/Inbox'

const EmptyState = ({ icon: Icon = InboxIcon, title, description, action, actionLabel }) => (
  <Box sx={{ textAlign: 'center', py: 8, px: 2 }}>
    <Icon sx={{ fontSize: 72, color: 'text.disabled', mb: 2 }} />
    <Typography variant="h6" gutterBottom>{title}</Typography>
    {description && (
      <Typography color="text.secondary" sx={{ mb: 3 }}>{description}</Typography>
    )}
    {action && (
      <Button variant="contained" onClick={action}>{actionLabel}</Button>
    )}
  </Box>
)

export default EmptyState
