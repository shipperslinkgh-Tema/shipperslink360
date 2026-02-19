/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './resources/views/**/*.blade.php',
    './resources/js/**/*.js',
    './resources/js/**/*.vue',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // ── Brand palette ────────────────────────────────────────
        brand: {
          50:  '#f0f4ff',
          100: '#e0e9ff',
          200: '#c0d3ff',
          300: '#93b5ff',
          400: '#5b8fff',
          500: '#3b6fd4',
          600: '#2553b4',
          700: '#1d3f8c',
          800: '#172e6b',
          900: '#111f4a',
        },
        // ── Gray scale (dark theme base) ─────────────────────────
        gray: {
          950: '#0a0e1a',
          900: '#0f1629',
          850: '#141b33',
          800: '#1a2240',
          750: '#1e2a4a',
          700: '#243054',
          600: '#2e3d6b',
          500: '#4a5a8a',
          400: '#6b7db0',
          300: '#8fa3cc',
          200: '#b8cae0',
          100: '#d8e6f5',
          50:  '#f0f5fb',
        },
        // ── Status colours ───────────────────────────────────────
        success:  { DEFAULT: '#22c55e', light: '#dcfce7', dark: '#166534' },
        warning:  { DEFAULT: '#f59e0b', light: '#fef3c7', dark: '#92400e' },
        danger:   { DEFAULT: '#ef4444', light: '#fee2e2', dark: '#991b1b' },
        info:     { DEFAULT: '#3b82f6', light: '#dbeafe', dark: '#1e40af' },
        // ── Department badge colours ─────────────────────────────
        ops:      { DEFAULT: '#3b82f6', bg: '#1e3a5f' },
        finance:  { DEFAULT: '#22c55e', bg: '#14532d' },
        docs:     { DEFAULT: '#a855f7', bg: '#3b1060' },
        logistics:{ DEFAULT: '#f59e0b', bg: '#5c3200' },
        customs:  { DEFAULT: '#14b8a6', bg: '#0f3d38' },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '0.875rem' }],
      },
      spacing: {
        sidebar: '16rem',        // 256px sidebar width
        'sidebar-sm': '4rem',    // 64px collapsed sidebar
        topbar: '3.5rem',        // 56px topbar height
      },
      borderRadius: {
        xl:  '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        card:  '0 1px 3px 0 rgba(0,0,0,0.4), 0 1px 2px -1px rgba(0,0,0,0.4)',
        modal: '0 20px 60px -10px rgba(0,0,0,0.6)',
        glow:  '0 0 20px rgba(59,111,212,0.3)',
      },
      animation: {
        'slide-in-left':  'slideInLeft 0.3s ease-out',
        'slide-in-right': 'slideInRight 0.3s ease-out',
        'fade-in':        'fadeIn 0.2s ease-out',
        'bounce-dot':     'bounceDot 1.4s infinite ease-in-out both',
        'pulse-slow':     'pulse 3s cubic-bezier(0.4,0,0.6,1) infinite',
      },
      keyframes: {
        slideInLeft:  { from: { transform: 'translateX(-100%)', opacity: 0 }, to: { transform: 'translateX(0)', opacity: 1 } },
        slideInRight: { from: { transform: 'translateX(100%)',  opacity: 0 }, to: { transform: 'translateX(0)', opacity: 1 } },
        fadeIn:       { from: { opacity: 0 }, to: { opacity: 1 } },
        bounceDot: {
          '0%, 80%, 100%': { transform: 'scale(0)' },
          '40%':           { transform: 'scale(1)' },
        },
      },
      backgroundImage: {
        'gradient-radial':   'radial-gradient(var(--tw-gradient-stops))',
        'gradient-sidebar':  'linear-gradient(180deg, #0f1629 0%, #0a0e1a 100%)',
        'gradient-card':     'linear-gradient(135deg, #1a2240 0%, #141b33 100%)',
        'gradient-brand':    'linear-gradient(135deg, #3b6fd4 0%, #2553b4 100%)',
      },
    },
  },
  plugins: [
    // Custom plugin for reusable component classes
    function ({ addComponents, addBase, theme }) {
      // ── Base styles ──────────────────────────────────────────
      addBase({
        'html': { scrollBehavior: 'smooth' },
        'body': {
          backgroundColor: theme('colors.gray.950'),
          color: theme('colors.gray.100'),
          fontFamily: theme('fontFamily.sans').join(', '),
        },
        '*': { boxSizing: 'border-box' },
        '::-webkit-scrollbar': { width: '5px', height: '5px' },
        '::-webkit-scrollbar-track': { background: theme('colors.gray.900') },
        '::-webkit-scrollbar-thumb': { background: theme('colors.gray.600'), borderRadius: '9999px' },
        '::-webkit-scrollbar-thumb:hover': { background: theme('colors.gray.500') },
      });

      // ── Component classes ────────────────────────────────────
      addComponents({
        // Cards
        '.card': {
          backgroundColor: theme('colors.gray.800'),
          borderRadius: theme('borderRadius.xl'),
          border: `1px solid ${theme('colors.gray.700')}`,
          padding: theme('spacing.6'),
          boxShadow: theme('boxShadow.card'),
        },
        '.card-sm': {
          backgroundColor: theme('colors.gray.800'),
          borderRadius: theme('borderRadius.xl'),
          border: `1px solid ${theme('colors.gray.700')}`,
          padding: theme('spacing.4'),
        },

        // Buttons
        '.btn': {
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: theme('spacing.2'),
          padding: `${theme('spacing.2')} ${theme('spacing.4')}`,
          borderRadius: theme('borderRadius.lg'),
          fontSize: theme('fontSize.sm')[0],
          fontWeight: theme('fontWeight.medium'),
          lineHeight: theme('lineHeight.5'),
          transition: 'all 150ms ease',
          cursor: 'pointer',
          border: 'none',
          textDecoration: 'none',
          '&:focus-visible': { outline: `2px solid ${theme('colors.brand.500')}`, outlineOffset: '2px' },
          '&:disabled': { opacity: '0.5', cursor: 'not-allowed' },
        },
        '.btn-primary': {
          backgroundColor: theme('colors.brand.500'),
          color: '#ffffff',
          '&:hover:not(:disabled)': { backgroundColor: theme('colors.brand.600') },
          '&:active': { backgroundColor: theme('colors.brand.700') },
        },
        '.btn-secondary': {
          backgroundColor: theme('colors.gray.700'),
          color: theme('colors.gray.100'),
          '&:hover:not(:disabled)': { backgroundColor: theme('colors.gray.600') },
        },
        '.btn-danger': {
          backgroundColor: theme('colors.danger.DEFAULT'),
          color: '#ffffff',
          '&:hover:not(:disabled)': { backgroundColor: '#dc2626' },
        },
        '.btn-ghost': {
          backgroundColor: 'transparent',
          color: theme('colors.gray.300'),
          '&:hover:not(:disabled)': { backgroundColor: theme('colors.gray.700'), color: theme('colors.gray.100') },
        },
        '.btn-success': {
          backgroundColor: theme('colors.success.DEFAULT'),
          color: '#ffffff',
          '&:hover:not(:disabled)': { backgroundColor: '#16a34a' },
        },
        '.btn-sm': {
          padding: `${theme('spacing.1')} ${theme('spacing.3')}`,
          fontSize: theme('fontSize.xs')[0],
        },
        '.btn-lg': {
          padding: `${theme('spacing.3')} ${theme('spacing.6')}`,
          fontSize: theme('fontSize.base')[0],
        },
        '.btn-icon': {
          padding: theme('spacing.2'),
          borderRadius: theme('borderRadius.lg'),
        },

        // Form inputs
        '.input': {
          width: '100%',
          backgroundColor: theme('colors.gray.900'),
          border: `1px solid ${theme('colors.gray.600')}`,
          borderRadius: theme('borderRadius.lg'),
          padding: `${theme('spacing[2.5]')} ${theme('spacing.3')}`,
          color: theme('colors.gray.100'),
          fontSize: theme('fontSize.sm')[0],
          transition: 'border-color 150ms ease, box-shadow 150ms ease',
          '&::placeholder': { color: theme('colors.gray.500') },
          '&:focus': {
            outline: 'none',
            borderColor: theme('colors.brand.500'),
            boxShadow: `0 0 0 3px ${theme('colors.brand.500')}33`,
          },
          '&:disabled': { opacity: '0.5', cursor: 'not-allowed' },
        },
        '.input-error': {
          borderColor: theme('colors.danger.DEFAULT'),
          '&:focus': { boxShadow: `0 0 0 3px ${theme('colors.danger.DEFAULT')}33` },
        },
        '.label': {
          display: 'block',
          fontSize: theme('fontSize.sm')[0],
          fontWeight: theme('fontWeight.medium'),
          color: theme('colors.gray.300'),
          marginBottom: theme('spacing.1'),
        },
        '.select': {
          width: '100%',
          backgroundColor: theme('colors.gray.900'),
          border: `1px solid ${theme('colors.gray.600')}`,
          borderRadius: theme('borderRadius.lg'),
          padding: `${theme('spacing[2.5]')} ${theme('spacing.3')}`,
          color: theme('colors.gray.100'),
          fontSize: theme('fontSize.sm')[0],
          cursor: 'pointer',
          '&:focus': {
            outline: 'none',
            borderColor: theme('colors.brand.500'),
            boxShadow: `0 0 0 3px ${theme('colors.brand.500')}33`,
          },
        },
        '.textarea': {
          width: '100%',
          backgroundColor: theme('colors.gray.900'),
          border: `1px solid ${theme('colors.gray.600')}`,
          borderRadius: theme('borderRadius.lg'),
          padding: `${theme('spacing[2.5]')} ${theme('spacing.3')}`,
          color: theme('colors.gray.100'),
          fontSize: theme('fontSize.sm')[0],
          resize: 'vertical',
          '&::placeholder': { color: theme('colors.gray.500') },
          '&:focus': {
            outline: 'none',
            borderColor: theme('colors.brand.500'),
            boxShadow: `0 0 0 3px ${theme('colors.brand.500')}33`,
          },
        },

        // Badges / Pills
        '.badge': {
          display: 'inline-flex',
          alignItems: 'center',
          gap: theme('spacing.1'),
          padding: `${theme('spacing.0')} ${theme('spacing.2')}`,
          borderRadius: '9999px',
          fontSize: theme('fontSize.xs')[0],
          fontWeight: theme('fontWeight.medium'),
          whiteSpace: 'nowrap',
        },
        '.badge-sm': { padding: `1px ${theme('spacing[1.5]')}`, fontSize: theme('fontSize["2xs"]')[0] },
        '.badge-blue':   { backgroundColor: '#1e3a5f', color: '#60a5fa' },
        '.badge-green':  { backgroundColor: '#14532d', color: '#4ade80' },
        '.badge-yellow': { backgroundColor: '#5c3200', color: '#fbbf24' },
        '.badge-red':    { backgroundColor: '#450a0a', color: '#f87171' },
        '.badge-purple': { backgroundColor: '#3b1060', color: '#c084fc' },
        '.badge-teal':   { backgroundColor: '#0f3d38', color: '#2dd4bf' },
        '.badge-gray':   { backgroundColor: theme('colors.gray.700'), color: theme('colors.gray.300') },
        '.badge-orange': { backgroundColor: '#431407', color: '#fb923c' },

        // Tables
        '.table-wrapper': {
          width: '100%',
          overflowX: 'auto',
          borderRadius: theme('borderRadius.xl'),
          border: `1px solid ${theme('colors.gray.700')}`,
        },
        '.table': {
          width: '100%',
          borderCollapse: 'collapse',
          fontSize: theme('fontSize.sm')[0],
        },
        '.table thead th': {
          padding: `${theme('spacing.3')} ${theme('spacing.4')}`,
          textAlign: 'left',
          fontSize: theme('fontSize.xs')[0],
          fontWeight: theme('fontWeight.semibold'),
          color: theme('colors.gray.400'),
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          backgroundColor: theme('colors.gray.900'),
          borderBottom: `1px solid ${theme('colors.gray.700')}`,
          whiteSpace: 'nowrap',
        },
        '.table tbody td': {
          padding: `${theme('spacing.3')} ${theme('spacing.4')}`,
          color: theme('colors.gray.200'),
          borderBottom: `1px solid ${theme('colors.gray.800')}`,
          verticalAlign: 'middle',
        },
        '.table tbody tr': {
          transition: 'background-color 150ms ease',
          '&:hover': { backgroundColor: theme('colors.gray.750') },
          '&:last-child td': { borderBottom: 'none' },
        },

        // Modals
        '.modal-backdrop': {
          position: 'fixed',
          inset: '0',
          backgroundColor: 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(2px)',
          zIndex: '50',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: theme('spacing.4'),
        },
        '.modal': {
          backgroundColor: theme('colors.gray.800'),
          borderRadius: theme('borderRadius["2xl"]'),
          border: `1px solid ${theme('colors.gray.700')}`,
          boxShadow: theme('boxShadow.modal'),
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
        },
        '.modal-header': {
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: `${theme('spacing.5')} ${theme('spacing.6')}`,
          borderBottom: `1px solid ${theme('colors.gray.700')}`,
        },
        '.modal-body': { padding: theme('spacing.6') },
        '.modal-footer': {
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          gap: theme('spacing.3'),
          padding: `${theme('spacing.4')} ${theme('spacing.6')}`,
          borderTop: `1px solid ${theme('colors.gray.700')}`,
        },

        // Alerts
        '.alert': {
          display: 'flex',
          alignItems: 'flex-start',
          gap: theme('spacing.3'),
          padding: theme('spacing.4'),
          borderRadius: theme('borderRadius.lg'),
          border: '1px solid transparent',
          fontSize: theme('fontSize.sm')[0],
        },
        '.alert-success': {
          backgroundColor: '#14532d33',
          borderColor: '#22c55e55',
          color: '#4ade80',
        },
        '.alert-error': {
          backgroundColor: '#7f1d1d33',
          borderColor: '#ef444455',
          color: '#f87171',
        },
        '.alert-warning': {
          backgroundColor: '#78350f33',
          borderColor: '#f59e0b55',
          color: '#fbbf24',
        },
        '.alert-info': {
          backgroundColor: '#1e3a5f33',
          borderColor: '#3b82f655',
          color: '#60a5fa',
        },

        // Tabs
        '.tab-bar': {
          display: 'flex',
          gap: theme('spacing.1'),
          padding: theme('spacing.1'),
          backgroundColor: theme('colors.gray.900'),
          borderRadius: theme('borderRadius.xl'),
          overflowX: 'auto',
        },
        '.tab-btn': {
          padding: `${theme('spacing.2')} ${theme('spacing.4')}`,
          borderRadius: theme('borderRadius.lg'),
          fontSize: theme('fontSize.sm')[0],
          fontWeight: theme('fontWeight.medium'),
          color: theme('colors.gray.400'),
          whiteSpace: 'nowrap',
          transition: 'all 150ms ease',
          cursor: 'pointer',
          border: 'none',
          backgroundColor: 'transparent',
          '&:hover': { color: theme('colors.gray.200'), backgroundColor: theme('colors.gray.800') },
          '&.active': { backgroundColor: theme('colors.gray.800'), color: theme('colors.gray.100'), boxShadow: theme('boxShadow.card') },
        },

        // Sidebar
        '.sidebar-link': {
          display: 'flex',
          alignItems: 'center',
          gap: theme('spacing.3'),
          padding: `${theme('spacing.2')} ${theme('spacing.3')}`,
          borderRadius: theme('borderRadius.lg'),
          color: theme('colors.gray.400'),
          fontSize: theme('fontSize.sm')[0],
          fontWeight: theme('fontWeight.medium'),
          transition: 'all 150ms ease',
          cursor: 'pointer',
          textDecoration: 'none',
          '&:hover': { backgroundColor: theme('colors.gray.700'), color: theme('colors.gray.100') },
          '&.active': {
            backgroundColor: `${theme('colors.brand.500')}22`,
            color: theme('colors.brand.400'),
            borderLeft: `2px solid ${theme('colors.brand.500')}`,
          },
        },

        // Stat cards
        '.stat-card': {
          backgroundColor: theme('colors.gray.800'),
          borderRadius: theme('borderRadius.xl'),
          border: `1px solid ${theme('colors.gray.700')}`,
          padding: theme('spacing.5'),
          transition: 'border-color 150ms ease',
          '&:hover': { borderColor: theme('colors.gray.600') },
        },

        // Loading skeleton
        '.skeleton': {
          backgroundColor: theme('colors.gray.700'),
          borderRadius: theme('borderRadius.DEFAULT'),
          animation: 'pulse 2s cubic-bezier(0.4,0,0.6,1) infinite',
        },

        // Divider
        '.divider': {
          borderColor: theme('colors.gray.700'),
          borderTopWidth: '1px',
          margin: `${theme('spacing.4')} 0`,
        },

        // Section heading
        '.section-title': {
          fontSize: theme('fontSize.base')[0],
          fontWeight: theme('fontWeight.semibold'),
          color: theme('colors.gray.100'),
          marginBottom: theme('spacing.4'),
        },
        '.page-title': {
          fontSize: theme('fontSize.xl')[0],
          fontWeight: theme('fontWeight.bold'),
          color: theme('colors.gray.50'),
        },

        // Empty state
        '.empty-state': {
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: theme('spacing.16'),
          color: theme('colors.gray.500'),
          textAlign: 'center',
        },

        // Chat widget
        '.chat-bubble-out': {
          backgroundColor: theme('colors.brand.600'),
          color: '#ffffff',
          borderRadius: '1rem 1rem 0.25rem 1rem',
          padding: `${theme('spacing.2')} ${theme('spacing.3')}`,
          maxWidth: '80%',
          alignSelf: 'flex-end',
          fontSize: theme('fontSize.sm')[0],
          wordBreak: 'break-word',
        },
        '.chat-bubble-in': {
          backgroundColor: theme('colors.gray.700'),
          color: theme('colors.gray.100'),
          borderRadius: '1rem 1rem 1rem 0.25rem',
          padding: `${theme('spacing.2')} ${theme('spacing.3')}`,
          maxWidth: '80%',
          alignSelf: 'flex-start',
          fontSize: theme('fontSize.sm')[0],
          wordBreak: 'break-word',
        },

        // Scrollbar hide utility
        '.scrollbar-hide': {
          '-ms-overflow-style': 'none',
          'scrollbar-width': 'none',
          '&::-webkit-scrollbar': { display: 'none' },
        },
      });
    },
  ],
};
