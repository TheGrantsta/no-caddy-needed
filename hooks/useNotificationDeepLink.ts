import { useEffect, useRef } from 'react';
import { useRouter } from 'expo-router';
import { navigateToReminders } from '../service/NavigationService';

let Notifications: typeof import('expo-notifications') | null = null;

try {
  Notifications = require('expo-notifications');
} catch {
  // Native module not available (e.g., Expo Go without dev build)
}

/**
 * Handle notification responses (taps) and navigate to reminders if appropriate.
 * - Listens for warm/background taps via listener
 * - Checks cold-start (app killed) last response on mount
 * - Guards against handling the same notification twice
 * - Supports both new tagged and legacy practice reminders
 */
export const useNotificationDeepLink = (): void => {
  const router = useRouter();
  const handledIdentifiersRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!Notifications) return;

    const handleNotificationResponse = (response: any): void => {
      const { notification } = response;
      const identifier = notification.request?.identifier;
      const content = notification.content;

      // Skip if already handled (guards against double-handling)
      if (identifier && handledIdentifiersRef.current.has(identifier)) {
        return;
      }

      // Check if this is a practice reminder (new tagged or legacy)
      const isPracticeReminder =
        content?.data?.type === 'practice-reminder' ||
        content?.title === 'Practice reminder';

      if (isPracticeReminder && identifier) {
        handledIdentifiersRef.current.add(identifier);
        navigateToReminders(router);
      }
    };

    // Listen for warm/background taps
    const subscription = Notifications.addNotificationResponseReceivedListener(
      handleNotificationResponse
    );

    // Check cold-start (app was killed when notif was tapped)
    (async () => {
      const lastResponse = await Notifications!.getLastNotificationResponseAsync();
      if (lastResponse) {
        handleNotificationResponse(lastResponse);
      }
    })();

    return () => {
      subscription?.remove();
    };
  }, [router]);
};
