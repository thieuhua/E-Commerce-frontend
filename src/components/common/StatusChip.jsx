import { Chip } from '@mui/material'
import { getOrderStatus, getPaymentStatus, getShipmentStatus } from '@/utils'

const getters = { order: getOrderStatus, payment: getPaymentStatus, shipment: getShipmentStatus }

const StatusChip = ({ type = 'order', status, size = 'small', ...props }) => {
  const { label, color } = (getters[type] ?? getOrderStatus)(status)
  return <Chip label={label} color={color} size={size} variant="outlined" {...props} />
}

export default StatusChip
