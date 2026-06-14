import { Dialog, DialogTitle, DialogContent, DialogContentText,
         DialogActions, Button } from '@mui/material'

const ConfirmDialog = ({
  open, onClose, onConfirm,
  title = 'Xác nhận',
  description = 'Bạn có chắc muốn thực hiện hành động này?',
  confirmLabel = 'Xác nhận',
  confirmColor = 'error',
  loading = false,
}) => (
  <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
    <DialogTitle>{title}</DialogTitle>
    <DialogContent>
      <DialogContentText>{description}</DialogContentText>
    </DialogContent>
    <DialogActions sx={{ px: 3, pb: 2 }}>
      <Button onClick={onClose} disabled={loading}>Huỷ</Button>
      <Button variant="contained" color={confirmColor}
              onClick={onConfirm} disabled={loading}>
        {loading ? 'Đang xử lý...' : confirmLabel}
      </Button>
    </DialogActions>
  </Dialog>
)

export default ConfirmDialog
