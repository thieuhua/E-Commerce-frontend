import { Box, Card, CardContent, Typography, Skeleton } from '@mui/material'
import TrendingUpIcon   from '@mui/icons-material/TrendingUp'
import TrendingDownIcon from '@mui/icons-material/TrendingDown'

export const StatCard = ({ icon: Icon, color, bg, label, value, sub, trend, loading }) => {
  if (loading) return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Skeleton width="60%" height={20} />
        <Skeleton width="40%" height={40} sx={{ my: 1 }} />
        <Skeleton width="50%" height={16} />
      </CardContent>
    </Card>
  )

  const trendUp = trend > 0

  return (
    <Card sx={{ height: '100%', position: 'relative', overflow: 'hidden' }}>
      <CardContent sx={{ p: 2.5 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography variant="caption" color="text.secondary" fontWeight={600}
                        textTransform="uppercase" letterSpacing={0.5}>
              {label}
            </Typography>
            <Typography variant="h4" fontWeight={800} sx={{ mt: 0.5, lineHeight: 1.2 }}>
              {value}
            </Typography>
            {sub && (
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                {sub}
              </Typography>
            )}
            {trend !== undefined && trend !== null && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1 }}>
                {trendUp
                  ? <TrendingUpIcon sx={{ fontSize: 16, color: 'success.main' }} />
                  : <TrendingDownIcon sx={{ fontSize: 16, color: 'error.main' }} />}
                <Typography variant="caption" color={trendUp ? 'success.main' : 'error.main'} fontWeight={700}>
                  {trendUp ? '+' : ''}{trend}% so với tháng trước
                </Typography>
              </Box>
            )}
          </Box>
          <Box sx={{ width: 48, height: 48, borderRadius: 2, bgcolor: bg,
                     display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Icon sx={{ color, fontSize: 26 }} />
          </Box>
        </Box>
      </CardContent>
    </Card>
  )
}

// Mini bar chart thuần CSS — không cần thư viện
export const MiniBarChart = ({ data = [], loading }) => {
  if (loading) return <Skeleton height={120} sx={{ borderRadius: 2 }} />
  const max = Math.max(...data.map(d => d.revenue), 1)
  return (
    <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: '3px', height: 80 }}>
      {data.map((d, i) => (
        <Box key={i} sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
          <Box sx={{
            width: '100%', borderRadius: '3px 3px 0 0',
            height: `${Math.max((d.revenue / max) * 72, 4)}px`,
            bgcolor: i === data.length - 1 ? 'primary.main' : 'primary.200',
            transition: 'height .3s',
          }} />
          <Typography variant="caption" sx={{ fontSize: 9, color: 'text.secondary', writingMode: 'unset' }}>
            {d.date}
          </Typography>
        </Box>
      ))}
    </Box>
  )
}
