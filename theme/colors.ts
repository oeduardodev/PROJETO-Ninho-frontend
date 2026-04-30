const brandLight = '#B86F52';
const brandDark = '#F1D2C3';

export const Colors = {
  dark: {
    background: '#111315',
    icon: '#98A2AD',
    surface: '#1B1F24',
    tabIconDefault: '#6F7A85',
    tabIconSelected: brandDark,
    text: '#F4F7FA',
    tint: brandDark,
  },
  light: {
    background: '#FFFFFF',
    icon: '#687076',
    surface: '#F6F7F8',
    tabIconDefault: '#7D8790',
    tabIconSelected: brandLight,
    text: '#11181C',
    tint: brandLight,
  },
} as const;
