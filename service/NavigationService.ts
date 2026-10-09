import { useRouter } from 'expo-router';

export type Router = ReturnType<typeof useRouter>;

/**
 * Navigate to the Practice > Tools > Reminders screen.
 * Uses the same deep-link pattern as the overdue-badge tab listener.
 */
export const navigateToReminders = (router: Router): void => {
  router.navigate({
    pathname: '/practice',
    params: { section: 'tools', t: String(Date.now()) }
  });
  router.push('/tools/reminders');
};
