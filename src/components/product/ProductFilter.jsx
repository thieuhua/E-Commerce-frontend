import { useState, useEffect } from 'react'
import {
  Box, Typography, Divider, FormGroup, FormControlLabel,
  Checkbox, Slider, Button, Accordion, AccordionSummary,
  AccordionDetails, RadioGroup, Radio, TextField,
} from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { useQuery } from '@tanstack/react-query'
import { catalogApi } from '@/api'
import { formatVND } from '@/utils'

const MAX_PRICE = 50000000

const ProductFilter = ({ filters, onChange }) => {
  const [priceRange, setPriceRange] = useState([
    filters.min_price ?? 0,
    filters.max_price ?? MAX_PRICE,
  ])

  useEffect(() => {
    setPriceRange([filters.min_price ?? 0, filters.max_price ?? MAX_PRICE])
  }, [filters.min_price, filters.max_price])

  const { data: catData }   = useQuery({ queryKey: ['categories'], queryFn: () => catalogApi.categories() })
  const { data: brandData } = useQuery({ queryKey: ['brands'],     queryFn: () => catalogApi.brands() })

  const categories = catData?.data?.data ?? []
  const brands     = brandData?.data?.data ?? []

  const allCategories = categories.flatMap(c => [c, ...(c.children ?? [])])

  const handlePriceCommit = (_, val) => {
    onChange({ min_price: val[0] || undefined, max_price: val[1] >= MAX_PRICE ? undefined : val[1] })
  }

  return (
    <Box>
      <Typography variant="h6" fontWeight={700} gutterBottom>Bộ lọc</Typography>
      <Divider sx={{ mb: 2 }} />

      {/* Category */}
      <Accordion defaultExpanded disableGutters elevation={0} sx={{ '&:before': { display: 'none' } }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ px: 0 }}>
          <Typography fontWeight={600}>Danh mục</Typography>
        </AccordionSummary>
        <AccordionDetails sx={{ px: 0 }}>
          <RadioGroup
            value={filters.category_id ?? ''}
            onChange={(e) => onChange({ category_id: e.target.value || undefined, page: 1 })}
          >
            <FormControlLabel value="" control={<Radio size="small" />} label="Tất cả" />
            {allCategories.map((c) => (
              <FormControlLabel
                key={c.category_id} value={String(c.category_id)}
                control={<Radio size="small" />}
                label={<Typography variant="body2" sx={{ pl: c.parent_id ? 1 : 0 }}>{c.name}</Typography>}
              />
            ))}
          </RadioGroup>
        </AccordionDetails>
      </Accordion>
      <Divider />

      {/* Brand */}
      <Accordion defaultExpanded disableGutters elevation={0} sx={{ '&:before': { display: 'none' } }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ px: 0 }}>
          <Typography fontWeight={600}>Thương hiệu</Typography>
        </AccordionSummary>
        <AccordionDetails sx={{ px: 0 }}>
          <FormGroup>
            {brands.map((b) => (
              <FormControlLabel
                key={b.brand_id}
                control={
                  <Checkbox
                    size="small"
                    checked={String(filters.brand_id) === String(b.brand_id)}
                    onChange={(e) => onChange({ brand_id: e.target.checked ? b.brand_id : undefined, page: 1 })}
                  />
                }
                label={<Typography variant="body2">{b.name}</Typography>}
              />
            ))}
          </FormGroup>
        </AccordionDetails>
      </Accordion>
      <Divider />

      {/* Price */}
      <Accordion defaultExpanded disableGutters elevation={0} sx={{ '&:before': { display: 'none' } }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ px: 0 }}>
          <Typography fontWeight={600}>Giá</Typography>
        </AccordionSummary>
        <AccordionDetails sx={{ px: 1 }}>
          <Slider
            value={priceRange}
            onChange={(_, v) => setPriceRange(v)}
            onChangeCommitted={handlePriceCommit}
            min={0} max={MAX_PRICE} step={500000}
            valueLabelDisplay="auto"
            valueLabelFormat={(v) => formatVND(v)}
          />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
            <Typography variant="caption" color="text.secondary">{formatVND(priceRange[0])}</Typography>
            <Typography variant="caption" color="text.secondary">{formatVND(priceRange[1])}</Typography>
          </Box>
        </AccordionDetails>
      </Accordion>
      <Divider sx={{ mb: 2 }} />

      <Button
        fullWidth variant="outlined" size="small"
        onClick={() => { setPriceRange([0, MAX_PRICE]); onChange({ category_id: undefined, brand_id: undefined, min_price: undefined, max_price: undefined, page: 1 }) }}
      >
        Xoá bộ lọc
      </Button>
    </Box>
  )
}

export default ProductFilter
