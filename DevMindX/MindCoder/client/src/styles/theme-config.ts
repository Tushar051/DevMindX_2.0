/**
 * Professional AI Theme Configuration
 * Customize colors, gradients, and effects for your DevMindX platform
 */

export const themeConfig = {
  // Primary Brand Colors
  colors: {
    primary: {
      purple: 'hsl(262, 83%, 58%)',
      blue: 'hsl(217, 91%, 60%)',
      cyan: 'hsl(189, 94%, 43%)',
      pink: 'hsl(316, 73%, 62%)',
      green: 'hsl(142, 71%, 45%)',
    },
    
    // Background Colors
    background: {
      primary: 'hsl(222, 47%, 4%)',
      secondary: 'hsl(222, 47%, 7%)',
      tertiary: 'hsl(222, 47%, 10%)',
    },
    
    // Text Colors
    text: {
      primary: 'hsl(210, 40%, 98%)',
      secondary: 'hsl(215, 20%, 65%)',
      muted: 'hsl(215, 16%, 47%)',
    },
    
    // Border Colors
    border: {
      default: 'hsl(217, 33%, 17%)',
      light: 'rgba(255, 255, 255, 0.1)',
      accent: 'rgba(139, 92, 246, 0.3)',
    },
    
    // Status Colors
    status: {
      success: 'hsl(142, 71%, 45%)',
      warning: 'hsl(38, 92%, 50%)',
      error: 'hsl(0, 84%, 60%)',
      info: 'hsl(217, 91%, 60%)',
    }
  },

  // Gradient Definitions
  gradients: {
    primary: 'linear-gradient(135deg, hsl(262, 83%, 58%) 0%, hsl(217, 91%, 60%) 100%)',
    secondary: 'linear-gradient(135deg, hsl(217, 91%, 60%) 0%, hsl(189, 94%, 43%) 100%)',
    accent: 'linear-gradient(135deg, hsl(262, 83%, 58%) 0%, hsl(316, 73%, 62%) 100%)',
    success: 'linear-gradient(135deg, hsl(142, 71%, 45%) 0%, hsl(158, 64%, 52%) 100%)',
    
    // Background Gradients
    background: {
      main: 'linear-gradient(135deg, hsl(222, 47%, 4%) 0%, hsl(262, 83%, 8%) 50%, hsl(217, 91%, 8%) 100%)',
      hero: 'linear-gradient(135deg, hsl(222, 47%, 4%) 0%, hsl(262, 83%, 8%) 25%, hsl(217, 91%, 8%) 50%, hsl(189, 94%, 8%) 75%, hsl(222, 47%, 4%) 100%)',
    },
    
    // Text Gradients
    text: {
      primary: 'linear-gradient(135deg, hsl(262, 83%, 68%) 0%, hsl(217, 91%, 70%) 50%, hsl(189, 94%, 53%) 100%)',
      accent: 'linear-gradient(135deg, hsl(316, 73%, 62%) 0%, hsl(262, 83%, 58%) 100%)',
    }
  },

  // Glass Effect Settings
  glass: {
    background: 'rgba(255, 255, 255, 0.03)',
    backgroundHover: 'rgba(255, 255, 255, 0.05)',
    border: 'rgba(255, 255, 255, 0.08)',
    borderHover: 'rgba(255, 255, 255, 0.15)',
    blur: '20px',
    shadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
  },

  // Glow Effects
  glow: {
    purple: {
      small: '0 0 20px rgba(139, 92, 246, 0.3)',
      medium: '0 0 20px rgba(139, 92, 246, 0.3), 0 0 40px rgba(139, 92, 246, 0.2)',
      large: '0 0 20px rgba(139, 92, 246, 0.3), 0 0 40px rgba(139, 92, 246, 0.2), 0 0 60px rgba(139, 92, 246, 0.1)',
    },
    blue: {
      small: '0 0 20px rgba(59, 130, 246, 0.3)',
      medium: '0 0 20px rgba(59, 130, 246, 0.3), 0 0 40px rgba(59, 130, 246, 0.2)',
      large: '0 0 20px rgba(59, 130, 246, 0.3), 0 0 40px rgba(59, 130, 246, 0.2), 0 0 60px rgba(59, 130, 246, 0.1)',
    },
    cyan: {
      small: '0 0 20px rgba(6, 182, 212, 0.3)',
      medium: '0 0 20px rgba(6, 182, 212, 0.3), 0 0 40px rgba(6, 182, 212, 0.2)',
      large: '0 0 20px rgba(6, 182, 212, 0.3), 0 0 40px rgba(6, 182, 212, 0.2), 0 0 60px rgba(6, 182, 212, 0.1)',
    }
  },

  // Animation Durations
  animation: {
    fast: '150ms',
    normal: '300ms',
    slow: '500ms',
    verySlow: '1000ms',
  },

  // Border Radius
  radius: {
    sm: '0.5rem',
    md: '0.75rem',
    lg: '1rem',
    xl: '1.5rem',
    '2xl': '2rem',
    full: '9999px',
  },

  // Spacing
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem',
    '3xl': '4rem',
  },

  // Typography
  typography: {
    fontFamily: {
      sans: 'Inter, system-ui, -apple-system, sans-serif',
      mono: 'Monaco, Menlo, Consolas, monospace',
    },
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem',
      '5xl': '3rem',
      '6xl': '3.75rem',
      '7xl': '4.5rem',
    }
  },

  // Z-Index Layers
  zIndex: {
    base: 0,
    dropdown: 1000,
    sticky: 1100,
    fixed: 1200,
    modalBackdrop: 1300,
    modal: 1400,
    popover: 1500,
    tooltip: 1600,
  }
};

export type ThemeConfig = typeof themeConfig;

// Helper function to get theme value
export const getThemeValue = (path: string): string => {
  const keys = path.split('.');
  let value: any = themeConfig;
  
  for (const key of keys) {
    value = value[key];
    if (value === undefined) return '';
  }
  
  return value;
};

// Export individual theme sections for convenience
export const { colors, gradients, glass, glow, animation, radius, spacing, typography, zIndex } = themeConfig;
