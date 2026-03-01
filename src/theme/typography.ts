import { Platform } from 'react-native';

const fontFamily = Platform.select({
  ios: 'System',
  android: 'System',
  default: 'System'
});

const typography = {
  fontFamily,
  display: { size: 32, weight: '700' },
  h1: { size: 24, weight: '700' },
  h2: { size: 20, weight: '600' },
  h3: { size: 18, weight: '600' },
  bodyLarge: { size: 16, weight: '500' },
  body: { size: 14, weight: '400' },
  caption: { size: 12, weight: '400' },
  small: { size: 11, weight: '400' }
};

export default typography;
