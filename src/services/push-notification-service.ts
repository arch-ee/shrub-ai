import { PushNotifications } from '@capacitor/push-notifications';
import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';

export interface PushNotificationToken {
  value: string;
}

export interface PushNotificationActionPerformed {
  actionId: string;
  inputValue?: string;
  notification: any;
}

class PushNotificationService {
  async register(): Promise<void> {
    if (!Capacitor.isNativePlatform()) {
      console.log('Push notifications not available in browser');
      return;
    }

    try {
      // Request permission to use push notifications
      const permissionStatus = await PushNotifications.requestPermissions();
      
      if (permissionStatus.receive === 'granted') {
        // Register with the push notification service
        await PushNotifications.register();
        console.log('Push notifications registered successfully');
      } else {
        console.log('Push notification permission denied');
      }
    } catch (e) {
      console.error('Error registering push notifications', e);
    }
  }

  addListeners(
    onTokenReceived?: (token: PushNotificationToken) => void,
    onNotificationReceived?: (notification: any) => void,
    onActionPerformed?: (notification: PushNotificationActionPerformed) => void
  ): void {
    if (!Capacitor.isNativePlatform()) {
      return;
    }

    try {
      // On successful registration
      PushNotifications.addListener('registration', (token: PushNotificationToken) => {
        console.log('Push notification token:', token.value);
        if (onTokenReceived) {
          onTokenReceived(token);
        }
      });

      // On registration error
      PushNotifications.addListener('registrationError', (error: any) => {
        console.error('Push notification registration error:', error);
      });

      // When notification is received
      PushNotifications.addListener('pushNotificationReceived', (notification: any) => {
        console.log('Push notification received:', notification);
        if (onNotificationReceived) {
          onNotificationReceived(notification);
        }
      });

      // When user taps on notification
      PushNotifications.addListener('pushNotificationActionPerformed', (notification: PushNotificationActionPerformed) => {
        console.log('Push notification action performed:', notification);
        if (onActionPerformed) {
          onActionPerformed(notification);
        }
      });
    } catch (error) {
      console.warn('Failed to add push notification listeners:', error);
    }
  }

  removeAllListeners(): void {
    if (!Capacitor.isNativePlatform()) {
      return;
    }
    
    try {
      PushNotifications.removeAllListeners();
    } catch (error) {
      console.warn('Failed to remove push notification listeners:', error);
    }
  }

  // Send a local test notification
  async sendLocalTestNotification(title: string, body: string): Promise<void> {
    if (!Capacitor.isNativePlatform()) {
      console.log('Local notifications not available in browser');
      return;
    }
    
    try {
      await LocalNotifications.schedule({
        notifications: [
          {
            title: title,
            body: body,
            id: Math.floor(Math.random() * 10000),
            schedule: { at: new Date(Date.now() + 1000) },
            sound: 'beep.wav',
            attachments: undefined,
            actionTypeId: '',
            extra: undefined
          }
        ]
      });
      console.log('Local notification scheduled');
    } catch (error) {
      console.error('Error scheduling local notification', error);
    }
  }
}

export const pushNotificationService = new PushNotificationService();