import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { ApiService } from './ApiService';
import { StorageService } from './StorageService';
import { API_CONFIG } from '../config/api';
import { log } from '../utils/logger';

// Show notifications when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export class NotificationService {
  static async requestPermission(): Promise<boolean> {
    if (!Device.isDevice) {
      log.warn('Notifications', 'Push notifications require a physical device');
      return false;
    }

    const { status: existing } = await Notifications.getPermissionsAsync();
    if (existing === 'granted') return true;

    const { status } = await Notifications.requestPermissionsAsync();
    return status === 'granted';
  }

  static async getExpoPushToken(): Promise<string | null> {
    if (!Device.isDevice) return null;

    try {
      const projectId = Constants.expoConfig?.extra?.eas?.projectId as string | undefined;
      const tokenData = await Notifications.getExpoPushTokenAsync(
        projectId ? { projectId } : undefined,
      );
      return tokenData.data;
    } catch (err) {
      log.warn('Notifications', 'Failed to get Expo push token', err);
      return null;
    }
  }

  static async registerToken(): Promise<void> {
    const granted = await this.requestPermission();
    if (!granted) return;

    const token = await this.getExpoPushToken();
    if (!token) return;

    const accessToken = await StorageService.getAccessToken();
    if (!accessToken) return;

    const platform = Platform.OS === 'ios' ? 'ios' : 'android';

    try {
      await ApiService.post(
        API_CONFIG.ENDPOINTS.USERS.DEVICE_TOKEN,
        { token, platform },
        accessToken,
      );
      log.debug('Notifications', 'Device token registered');
    } catch (err) {
      // Non-fatal — app still works without push
      log.warn('Notifications', 'Failed to register device token', err);
    }
  }

  static setupForegroundHandler(): () => void {
    const receivedSub = Notifications.addNotificationReceivedListener(notification => {
      log.debug('Notifications', 'Foreground notification received', {
        title: notification.request.content.title,
        data: notification.request.content.data,
      });
    });

    const responseSub = Notifications.addNotificationResponseReceivedListener(response => {
      const data = response.notification.request.content.data as Record<string, string> | undefined;
      log.debug('Notifications', 'Notification tapped', { data });
      // Future: navigate to vault detail using data.vault_id
    });

    return () => {
      receivedSub.remove();
      responseSub.remove();
    };
  }

  /** Call once after successful login. Fire-and-forget. */
  static async initialize(): Promise<void> {
    try {
      await this.registerToken();
      this.setupForegroundHandler();
    } catch (err) {
      log.warn('Notifications', 'Notification initialization failed', err);
    }
  }
}
