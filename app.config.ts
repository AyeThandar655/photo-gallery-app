import type { ConfigContext, ExpoConfig } from '@expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'Photo Gallery',
  slug: 'photo-gallery-app',
  version: '1.0.0',
  scheme: 'photo-gallery',
  orientation: 'portrait',
  userInterfaceStyle: 'automatic',
  ios: {
    supportsTablet: false,
    bundleIdentifier: 'com.photogallery.app',
  },
  android: {
    package: 'com.photogallery.app',
    adaptiveIcon: {
      backgroundColor: '#ffffff',
    },
  },
  web: {
    bundler: 'metro',
    output: 'static',
  },
  plugins: ['expo-router'],
  experiments: {
    typedRoutes: true,
  },
});
