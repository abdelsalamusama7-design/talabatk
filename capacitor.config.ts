import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.f1fb9734debc4aad8482bc3ce44dcc81',
  appName: 'طلباتك',
  webDir: 'dist',
  server: {
    url: 'https://f1fb9734-debc-4aad-8482-bc3ce44dcc81.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"],
    },
    Geolocation: {
      permissions: ["location"],
    },
  },
};

export default config;
