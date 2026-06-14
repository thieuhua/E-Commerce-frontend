import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  Container, Grid, Box, Typography, Select, MenuItem,
  FormControl, InputLabel, Pagination, Drawer, IconButton,
  Button, useMediaQuery, useTheme,
} from '@mui/material'
import FilterListIcon from '@mui/icons-material/FilterList'
import { useQuery } from '@tanstack/react-query'
import { productApi } from '@/api'
import ProductCard from '@/components/product/ProductCard'
import ProductFilter from '@/components/product/ProductFilter'
import EmptyState from '@/components/common/EmptyState'
import SearchOffIcon from '@mui/icons-material/SearchOff'

const SORT_OPTIONS = [
  { value: 'created_at:desc', label: 'Mới nhất' },
  { value: 'created_at:asc',  label: 'Cũ nhất'  },
  { value: 'price:asc',       label: 'Giá thấp → cao' },
  { value: 'price:desc',      label: 'Giá cao → thấp' },
  { value: 'name:asc',        label: 'Tên A → Z' },
]

const ProductListPage = () => {
  const theme   = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const [searchParams, setSearchParams] = useSearchParams()
  const [mobileFilter, setMobileFilter] = useState(false)

  const getFilters = () => ({
    page:        Number(searchParams.get('page') || 1),
    limit:       20,
    search:      searchParams.get('search')      || undefined,
    category_id: searchParams.get('category_id') || undefined,
    brand_id:    searchParams.get('brand_id')    || undefined,
    sort_by:     searchParams.get('sort_by')     || 'created_at',
    order:       searchParams.get('order')       || 'desc',
    min_price:   searchParams.get('min_price')   ? Number(searchParams.get('min_price')) : undefined,
    max_price:   searchParams.get('max_price')   ? Number(searchParams.get('max_price')) : undefined,
    status:      'active',
  })

  const filters = getFilters()

  const { data, isLoading } = useQuery({
    queryKey: ['products', filters],
    queryFn:  () => productApi.list(filters),
    keepPreviousData: true,
  })

  const products   = data?.data?.data ?? []
  const pagination = data?.data?.pagination ?? {}

  const updateFilters = (changes) => {
    const next = new URLSearchParams(searchParams)
    Object.entries(changes).forEach(([k, v]) => {
      if (v === undefined || v === '') next.delete(k)
      else next.set(k, String(v))
    })
    setSearchParams(next)
  }

  const sortValue = `${filters.sort_by}:${filters.order}`

  const filterPanel = (
    <ProductFilter
      filters={filters}
      onChange={(c) => { updateFilters(c); setMobileFilter(false) }}
    />
  )

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {filters.search && (
        <Typography variant="h6" gutterBottom>
          Kết quả tìm kiếm: <strong>"{filters.search}"</strong>
          {pagination.total !== undefined && ` (${pagination.total} sản phẩm)`}
        </Typography>
      )}

      <Grid container spacing={3}>
        {/* Desktop sidebar */}
        {!isMobile && (
          <Grid item md={2.5}>
            {filterPanel}
          </Grid>
        )}

        {/* Mobile drawer */}
        {isMobile && (
          <Drawer open={mobileFilter} onClose={() => setMobileFilter(false)}
                  PaperProps={{ sx: { p: 3, width: 280 } }}>
            {filterPanel}
          </Drawer>
        )}

        {/* Products */}
        <Grid item xs={12} md={9.5}>
          {/* Toolbar */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            {isMobile && (
              <Button startIcon={<FilterListIcon />} onClick={() => setMobileFilter(true)}
                      variant="outlined" size="small">
                Bộ lọc
              </Button>
            )}
            <Typography variant="body2" color="text.secondary" sx={{ ml: 'auto', mr: 2 }}>
              {pagination.total ?? 0} sản phẩm
            </Typography>
            <FormControl size="small" sx={{ minWidth: 160 }}>
              <InputLabel>Sắp xếp</InputLabel>
              <Select
                value={sortValue} label="Sắp xếp"
                onChange={(e) => {
                  const [sort_by, order] = e.target.value.split(':')
                  updateFilters({ sort_by, order, page: 1 })
                }}
              >
                {SORT_OPTIONS.map(o => (
                  <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          {/* Grid */}
          {!isLoading && products.length === 0 ? (
            <EmptyState icon={SearchOffIcon} title="Không tìm thấy sản phẩm"
                        description="Thử thay đổi bộ lọc hoặc từ khoá tìm kiếm" />
          ) : (
            <>
              <Grid container spacing={2}>
                {isLoading
                  ? Array.from({ length: 12 }).map((_, i) => (
                      <Grid item xs={6} sm={4} lg={3} key={i}>
                        <ProductCard loading />
                      </Grid>
                    ))
                  : products.map((p) => (
                      <Grid item xs={6} sm={4} lg={3} key={p.product_id}>
                        <ProductCard product={p} />
                      </Grid>
                    ))}
              </Grid>

              {pagination.totalPages > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                  <Pagination
                    count={pagination.totalPages}
                    page={filters.page}
                    color="primary"
                    onChange={(_, p) => updateFilters({ page: p })}
                  />
                </Box>
              )}
            </>
          )}
        </Grid>
      </Grid>
    </Container>
  )
}

export default ProductListPage
