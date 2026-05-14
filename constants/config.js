export const COLORS = {
    // deep purple/blue backgrounds
    background: '#000000',
    backgroundSecondary: '#12121e',
    cardBg: 'rgba(20, 20, 35, 0.7)',
    glass: 'rgba(255, 255, 255, 0.05)',
    glassHighlight: 'rgba(255, 255, 255, 0.1)',
    glassBorder: 'rgba(255, 255, 255, 0.12)',
    
    // purple/pink gradients for accents
    purpleGradientStart: '#6366f1',
    purpleGradientEnd: '#a855f7',
    pinkGradientStart: '#ec4899',
    pinkGradientEnd: '#f43f5e',
    
    // risk colors (keeping your scheme)
    tooCold: '#60a5fa', // light blue
    tooColdGlow: 'rgba(96, 165, 250, 0.3)',
    tooColdDark: 'rgba(96, 165, 250, 0.15)',
    
    safe: '#10b981', // emerald green (slightly more vibrant)
    safeGlow: 'rgba(16, 185, 129, 0.3)',
    safeDark: 'rgba(16, 185, 129, 0.15)',
    
    caution: '#fbbf24', // yellow
    cautionGlow: 'rgba(251, 191, 36, 0.3)',
    cautionDark: 'rgba(251, 191, 36, 0.15)',
    
    danger: '#ef4444', // red
    dangerGlow: 'rgba(239, 68, 68, 0.3)',
    dangerDark: 'rgba(239, 68, 68, 0.15)',
    
    text: {
      primary: '#ffffff',
      secondary: '#c0c0d0', // bumped for WCAG AA on near-black
      muted: '#9090a0',     // bumped from #6b6b7b (failed AA at 3.1:1)
    },
  };
  
  export const OPENWEATHER_API_KEY = process.env.EXPO_PUBLIC_OPENWEATHER_API_KEY;
  
  export const SURFACE_TYPES = [
    { id: 'asphalt', label: 'Asphalt', multiplier: 1.0 },
    { id: 'concrete', label: 'Concrete', multiplier: 0.95 },
    { id: 'turf', label: 'Turf', multiplier: 0.7 },
    { id: 'sand', label: 'Sand', multiplier: 1.1 },
  ];
  
  export const SUN_EXPOSURE = [
    { id: 'full', label: 'Full Sun', multiplier: 1.0 },
    { id: 'partial', label: 'Partial', multiplier: 0.85 },
    { id: 'shade', label: 'Shade', multiplier: 0.7 },
  ];
  
  // temp thresholds (in Fahrenheit)
  // < tooCold = tooCold, < safe = safe, < caution = caution, >= caution = danger
  export const TEMP_THRESHOLDS = {
    tooCold: 32,
    safe: 77,
    caution: 86,
  };