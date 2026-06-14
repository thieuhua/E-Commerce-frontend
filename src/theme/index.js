import { createTheme } from '@mui/material/styles'

const theme = createTheme({
  palette: {
    mode: 'light',
    primary:   { main: '#1565C0', light: '#1976D2', dark: '#0D47A1', contrastText: '#fff' },
    secondary: { main: '#FF6F00', light: '#FFA000', dark: '#E65100', contrastText: '#fff' },
    error:     { main: '#D32F2F' },
    success:   { main: '#2E7D32' },
    warning:   { main: '#F57C00' },
    background:{ default: '#F5F7FA', paper: '#FFFFFF' },
    text:      { primary: '#1A2035', secondary: '#637381' },
    divider:   '#E8ECF0',
  },

  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif',
    h1: { fontSize: '2.25rem', fontWeight: 700, lineHeight: 1.2 },
    h2: { fontSize: '1.875rem', fontWeight: 700, lineHeight: 1.3 },
    h3: { fontSize: '1.5rem',   fontWeight: 600, lineHeight: 1.4 },
    h4: { fontSize: '1.25rem',  fontWeight: 600, lineHeight: 1.4 },
    h5: { fontSize: '1.125rem', fontWeight: 600, lineHeight: 1.5 },
    h6: { fontSize: '1rem',     fontWeight: 600, lineHeight: 1.5 },
    body1: { fontSize: '0.9375rem', lineHeight: 1.6 },
    body2: { fontSize: '0.875rem',  lineHeight: 1.6 },
    caption: { fontSize: '0.75rem', color: '#637381' },
  },

  shape: { borderRadius: 10 },

  shadows: [
    'none',
    '0 1px 3px rgba(0,0,0,.06), 0 1px 2px rgba(0,0,0,.04)',
    '0 4px 6px rgba(0,0,0,.05), 0 2px 4px rgba(0,0,0,.04)',
    '0 10px 15px rgba(0,0,0,.05), 0 4px 6px rgba(0,0,0,.04)',
    '0 20px 25px rgba(0,0,0,.05), 0 10px 10px rgba(0,0,0,.03)',
    ...Array(20).fill('none'),
  ],

  components: {
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: { textTransform: 'none', fontWeight: 600, borderRadius: 8, padding: '8px 20px' },
        sizeLarge: { padding: '12px 28px', fontSize: '1rem' },
        sizeSmall: { padding: '4px 12px', fontSize: '0.8125rem' },
      },
    },
    MuiCard: {
      defaultProps: { elevation: 1 },
      styleOverrides: {
        root: { borderRadius: 12, border: '1px solid #E8ECF0' },
      },
    },
    MuiTextField: {
      defaultProps: { size: 'small', variant: 'outlined' },
      styleOverrides: {
        root: { '& .MuiOutlinedInput-root': { borderRadius: 8 } },
      },
    },
    MuiChip: {
      styleOverrides: { root: { borderRadius: 6 } },
    },
    MuiPaper: {
      styleOverrides: { root: { backgroundImage: 'none' } },
    },
    MuiAppBar: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: { borderBottom: '1px solid #E8ECF0', backgroundColor: '#fff', color: '#1A2035' },
      },
    },
    MuiDivider: {
      styleOverrides: { root: { borderColor: '#E8ECF0' } },
    },
    MuiTableCell: {
      styleOverrides: {
        head: { fontWeight: 600, backgroundColor: '#F5F7FA', color: '#637381', fontSize: '0.8125rem' },
      },
    },
    MuiAlert: {
      styleOverrides: { root: { borderRadius: 8 } },
    },
    MuiSkeleton: {
      defaultProps: { animation: 'wave' },
    },
  },
})

export default theme
