// Capacitor + Web push/local notifications helper.
// On the web this is a no-op; on Android (Capacitor) it asks for permission and registers FCM.
import { Capacitor } from '@capacitor/core';

export async function initNotifications(onToken?: (token: string) => void) {
  if (!Capacitor.isNativePlatform()) return;

  try {
    const { PushNotifications } = await import('@capacitor/push-notifications');
    const { LocalNotifications } = await import('@capacitor/local-notifications');

    await LocalNotifications.requestPermissions();

    const perm = await PushNotifications.checkPermissions();
    if (perm.receive !== 'granted') {
      const r = await PushNotifications.requestPermissions();
      if (r.receive !== 'granted') return;
    }

    await PushNotifications.register();

    PushNotifications.addListener('registration', (t) => {
      onToken?.(t.value);
    });

    PushNotifications.addListener('pushNotificationReceived', async (n) => {
      await LocalNotifications.schedule({
        notifications: [
          {
            id: Date.now() % 100000,
            title: n.title || 'P-Note',
            body: n.body || '',
          },
        ],
      });
    });
  } catch (e) {
    console.warn('Notifications init failed', e);
  }
}

export async function notifyLocal(title: string, body: string) {
  if (!Capacitor.isNativePlatform()) return;
  try {
    const { LocalNotifications } = await import('@capacitor/local-notifications');
    await LocalNotifications.schedule({
      notifications: [{ id: Date.now() % 100000, title, body }],
    });
  } catch {}
}
