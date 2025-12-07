import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { BillPayment } from '../types/database';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

/**
 * Request notification permissions and register device
 */
export async function registerForPushNotifications(): Promise<string | null> {
  if (!Device.isDevice) {
    console.warn('Must use physical device for Push Notifications');
    return null;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.warn('Failed to get push token for push notification!');
    return null;
  }

  const token = (await Notifications.getExpoPushTokenAsync()).data;
  console.log('Push token:', token);

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  return token;
}

/**
 * Schedule a notification for a bill payment
 */
export async function scheduleBillReminder(
  bill: BillPayment,
  daysBefore: number
): Promise<string | null> {
  const dueDate = new Date(bill.due_date);
  const notificationDate = new Date(dueDate);
  notificationDate.setDate(dueDate.getDate() - daysBefore);
  notificationDate.setHours(9, 0, 0, 0); // 9 AM

  // Don't schedule if the date is in the past
  if (notificationDate < new Date()) {
    return null;
  }

  const notificationId = await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Напомняне за сметка',
      body: `${bill.title} - ${Number(bill.amount).toFixed(2)} лв (${dueDate.toLocaleDateString('bg-BG')})`,
      data: { billId: bill.id },
      sound: true,
    },
    trigger: notificationDate,
  });

  return notificationId;
}

/**
 * Schedule all reminders for a bill payment
 */
export async function scheduleBillReminders(
  bill: BillPayment,
  reminderDays: number[]
): Promise<string[]> {
  const notificationIds: string[] = [];

  for (const daysBefore of reminderDays) {
    const id = await scheduleBillReminder(bill, daysBefore);
    if (id) {
      notificationIds.push(id);
    }
  }

  return notificationIds;
}

/**
 * Cancel all notifications for a bill
 */
export async function cancelBillNotifications(notificationIds: string[]): Promise<void> {
  for (const id of notificationIds) {
    await Notifications.cancelScheduledNotificationAsync(id);
  }
}

/**
 * Cancel all scheduled notifications
 */
export async function cancelAllNotifications(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}
