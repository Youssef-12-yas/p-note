import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.249a20895ddd485599a44c5cdd14e396',
  appName: 'p-note',
  webDir: 'dist',
  server: {
    url: 'https://249a2089-5ddd-4855-99a4-4c5cdd14e396.lovableproject.com?forceHideBadge=true',
    cleartext: true,
  },
  plugins: {
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
  },
};

export default config;
