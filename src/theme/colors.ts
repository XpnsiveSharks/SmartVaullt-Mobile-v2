export const darkColors = {
  bg:      { default: '#0a0a0a' },
  cards:   { default: '#141414', dark: '#0f0f0f' },
  surface: { default: '#141414', active: '#1b1b1b', dark: '#0a0a0a' },
  border:  { default: '#2a2a2a', dark: '#3a3a3a' },
  text:    { default: '#f5f5f5', light: '#ffffff', dark: '#000000' },
  muted:   { default: '#a3a3a3', dark: '#a3a3a3' },
  icons:   { default: '#f5f5f5', dark: '#000000', light: '#a3a3a3' },
  accent:  { default: '#BFFF00', dim: '#8fbf00' },
  accent2: { default: '#34d399', dim: '#059669' },
  status:  { success: '#34d399', warning: '#fbbf24', danger: '#ef4444', neutral: '#a3a3a3' },
};

export const lightColors = {
  bg:      { default: '#f8f9fa' },
  cards:   { default: '#ffffff', dark: '#f0f2f5' },
  surface: { default: '#f0f2f5', active: '#e4e6ea', dark: '#f8f9fa' },
  border:  { default: '#e0e2e6', dark: '#c8ccd4' },
  text:    { default: '#111111', light: '#ffffff', dark: '#000000' },
  muted:   { default: '#6b7280', dark: '#9ca3af' },
  icons:   { default: '#111111', dark: '#000000', light: '#6b7280' },
  accent:  { default: '#4a7c00', dim: '#3a6200' },
  accent2: { default: '#059669', dim: '#047857' },
  status:  { success: '#059669', warning: '#d97706', danger: '#dc2626', neutral: '#6b7280' },
};

export type ThemeColors = typeof darkColors;
