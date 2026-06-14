import { Link as RouterLink } from 'react-router-dom'
import { Breadcrumbs, Link, Typography } from '@mui/material'
import NavigateNextIcon from '@mui/icons-material/NavigateNext'

// crumbs = [{ label, to? }]  — cuối cùng không có `to`
const Breadcrumb = ({ crumbs = [] }) => (
  <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} sx={{ mb: 2 }}>
    <Link component={RouterLink} to="/" color="inherit" underline="hover" variant="body2">
      Trang chủ
    </Link>
    {crumbs.map((c, i) =>
      c.to && i < crumbs.length - 1 ? (
        <Link key={i} component={RouterLink} to={c.to}
              color="inherit" underline="hover" variant="body2">
          {c.label}
        </Link>
      ) : (
        <Typography key={i} variant="body2" color="text.primary" noWrap sx={{ maxWidth: 240 }}>
          {c.label}
        </Typography>
      )
    )}
  </Breadcrumbs>
)

export default Breadcrumb
