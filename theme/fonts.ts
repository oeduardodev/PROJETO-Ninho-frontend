import { Platform } from 'react-native';

export const Fonts = Platform.select({
  default: {
    mono: 'monospace',
    rounded: 'normal',
    sans: 'normal',
    serif: 'serif',
  },
  ios: {
    mono: 'ui-monospace',
    rounded: 'ui-rounded',
    sans: 'system-ui',
    serif: 'ui-serif',
  },
  web: {
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, sans-serif",
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
  },
});
