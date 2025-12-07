import { useState, useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { useAuthStore, useSettingsStore } from '../store';
import type { BillPayment } from '../types/database';
import { getDaysUntilDue } from '../domain/recurrence';
import { formatCurrency, formatDate } from '../utils/format';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export interface UseNotificationsReturn {
  expoPushToken: string | null;
  notification: Notifications.Notification | null;
  isRegistered: boolean;
  error: string | null;
  registerForPushNotifications: () => Promise<string | null>;
  schedulePaymentReminder: (payment: BillPayment, daysBefore: number) => Promise<string | null>;
  scheduleBillReminders: (payments: BillPayment[]) => Promise<void>;
  cancelNotification: (notificationId: string) => Promise<void>;
  cancelAllNotifications: () => Promise<void>;
}

export function useNotifications(): UseNotificationsReturn {
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [notification, setNotification] = useState<Notifications.Notification | null>(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const notificationListener = useRef<Notifications.Subscription | null>(null);
  const responseListener = useRef<Notifications.Subscription | null>(null);

  const user = useAuthStore(state => state.user);
  const savePushToken = useSettingsStore(state => state.savePushToken);
  const notificationSettings = useSettingsStore(state => state.notificationSettings);

  useEffect(() => {
    // Set up notification listeners
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      setNotification(notification);
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      // Handle notification tap - navigate to relevant screen
      const data = response.notification.request.content.data;
      // Navigation can be handled here based on data.type and data.paymentId
      console.warn('Notification tapped:', data);
    });

    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, []);

  /**
   * Register for push notifications
   */
  async function registerForPushNotifications(): Promise<string | null> {
    let token: string | null = null;

    try {
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#1E88E5',
        });

        await Notifications.setNotificationChannelAsync('reminders', {
          name: 'Bill Reminders',
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF5722',
        });
      }

      if (!Device.isDevice) {
        setError('Push notifications require a physical device');
        return null;
      }

      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        setError('Permission not granted for push notifications');
        return null;
      }

      const tokenData = await Notifications.getExpoPushTokenAsync({
        projectId: 'your-project-id', // Replace with your Expo project ID
      });
      token = tokenData.data;
      setExpoPushToken(token);
      setIsRegistered(true);

      // Save token to backend
      if (user && token) {
        const deviceType = Platform.OS === 'ios' ? 'ios' : 'android';
        await savePushToken(user.id, token, deviceType);
      }
    } catch (e) {
      setError(`Failed to register: ${e}`);
    }

    return token;
  }

  /**
   * Schedule a reminder for a specific payment
   */
  async function schedulePaymentReminder(
    payment: BillPayment,
    daysBefore: number
  ): Promise<string | null> {
    try {
      // Calculate trigger date
      const dueDate = new Date(payment.due_date);
      const triggerDate = new Date(dueDate);
      triggerDate.setDate(triggerDate.getDate() - daysBefore);
      triggerDate.setHours(9, 0, 0, 0); // Send at 9 AM

      // Check quiet hours
      if (notificationSettings?.quiet_hours_start && notificationSettings?.quiet_hours_end) {
        const [startHour] = notificationSettings.quiet_hours_start.split(':').map(Number);
        const [endHour] = notificationSettings.quiet_hours_end.split(':').map(Number);
        const triggerHour = triggerDate.getHours();

        if (triggerHour >= startHour || triggerHour < endHour) {
          // Adjust to after quiet hours
          triggerDate.setHours(endHour + 1, 0, 0, 0);
        }
      }

      // Don't schedule if date is in the past
      if (triggerDate <= new Date()) {
        return null;
      }

      const title =
        daysBefore > 0
          ? `Напомняне: ${payment.title}`
          : daysBefore === 0
            ? `Днес е падежът: ${payment.title}`
            : `Просрочена сметка: ${payment.title}`;

      const body =
        daysBefore > 0
          ? `Падеж след ${daysBefore} дни - ${formatCurrency(payment.amount)}`
          : daysBefore === 0
            ? `Сума за плащане: ${formatCurrency(payment.amount)}`
            : `Просрочена с ${Math.abs(daysBefore)} дни - ${formatCurrency(payment.amount)}`;

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data: {
            type: 'bill_reminder',
            paymentId: payment.id,
            categoryId: payment.category_id,
          },
          sound: true,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: triggerDate,
          channelId: 'reminders',
        },
      });

      return notificationId;
    } catch (e) {
      console.error('Failed to schedule notification:', e);
      return null;
    }
  }

  /**
   * Schedule reminders for all unpaid bills
   */
  async function scheduleBillReminders(payments: BillPayment[]): Promise<void> {
    if (!notificationSettings?.enable_push) return;

    const daysBefore = notificationSettings?.days_before || [3, 0];

    for (const payment of payments) {
      if (payment.is_paid) continue;

      const daysUntilDue = getDaysUntilDue(payment);
      if (daysUntilDue < -7) continue; // Don't remind for very old bills

      for (const days of daysBefore) {
        if (daysUntilDue >= days) {
          await schedulePaymentReminder(payment, days);
        }
      }
    }
  }

  /**
   * Cancel a scheduled notification
   */
  async function cancelNotification(notificationId: string): Promise<void> {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  }

  /**
   * Cancel all scheduled notifications
   */
  async function cancelAllNotifications(): Promise<void> {
    await Notifications.cancelAllScheduledNotificationsAsync();
  }

  return {
    expoPushToken,
    notification,
    isRegistered,
    error,
    registerForPushNotifications,
    schedulePaymentReminder,
    scheduleBillReminders,
    cancelNotification,
    cancelAllNotifications,
  };
}
