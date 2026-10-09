import { renderHook } from '@testing-library/react-native';
import { useNotificationDeepLink } from '../../hooks/useNotificationDeepLink';
import { navigateToReminders } from '../../service/NavigationService';
import * as Notifications from 'expo-notifications';

jest.mock('expo-router', () => ({
  useRouter: jest.fn(() => mockRouter),
}));

jest.mock('../../service/NavigationService');

jest.mock('expo-notifications', () => ({
  addNotificationResponseReceivedListener: jest.fn(),
  getLastNotificationResponseAsync: jest.fn(),
}));

const mockRouter = {
  navigate: jest.fn(),
  push: jest.fn(),
};

const mockNavigateToReminders = navigateToReminders as jest.Mock;
const mockAddListener = Notifications.addNotificationResponseReceivedListener as jest.Mock;
const mockGetLastResponse = Notifications.getLastNotificationResponseAsync as jest.Mock;

describe('useNotificationDeepLink', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shouldNavigateOnListenerTapOfPracticeReminder', () => {
    let capturedListener: any;
    mockAddListener.mockImplementation((cb) => {
      capturedListener = cb;
      return { remove: jest.fn() };
    });
    mockGetLastResponse.mockResolvedValue(null);

    renderHook(() => useNotificationDeepLink());

    const response = {
      notification: {
        request: { identifier: 'notif-1' },
        content: {
          title: 'Practice reminder',
          body: 'Test',
          data: { type: 'practice-reminder' },
        },
      },
    };

    capturedListener(response);

    expect(mockNavigateToReminders).toHaveBeenCalledWith(mockRouter);
  });

  it('shouldNavigateLegacyNotificationWithoutDataTag', () => {
    let capturedListener: any;
    mockAddListener.mockImplementation((cb) => {
      capturedListener = cb;
      return { remove: jest.fn() };
    });
    mockGetLastResponse.mockResolvedValue(null);

    renderHook(() => useNotificationDeepLink());

    const response = {
      notification: {
        request: { identifier: 'notif-1' },
        content: {
          title: 'Practice reminder',
          body: 'Putting practice',
          data: undefined,
        },
      },
    };

    capturedListener(response);

    expect(mockNavigateToReminders).toHaveBeenCalledWith(mockRouter);
  });

  it('shouldNotNavigateRoundReminderOnTap', () => {
    let capturedListener: any;
    mockAddListener.mockImplementation((cb) => {
      capturedListener = cb;
      return { remove: jest.fn() };
    });
    mockGetLastResponse.mockResolvedValue(null);

    renderHook(() => useNotificationDeepLink());

    const response = {
      notification: {
        request: { identifier: 'notif-1' },
        content: {
          title: 'Round still in progress',
          body: 'Reminder',
          data: undefined,
        },
      },
    };

    capturedListener(response);

    expect(mockNavigateToReminders).not.toHaveBeenCalled();
  });

  it('shouldHandleColdStartLastResponseOnce', async () => {
    mockGetLastResponse.mockResolvedValue({
      notification: {
        request: { identifier: 'notif-cold-1' },
        content: {
          title: 'Practice reminder',
          body: 'Cold start',
          data: { type: 'practice-reminder' },
        },
      },
    });
    mockAddListener.mockReturnValue({ remove: jest.fn() });

    renderHook(() => useNotificationDeepLink());

    await new Promise(resolve => setTimeout(resolve, 0));

    expect(mockNavigateToReminders).toHaveBeenCalledTimes(1);
  });

  it('shouldNotDoubleHandleSameResponseIdentifier', async () => {
    const removeListener = jest.fn();
    mockAddListener.mockImplementation((cb) => {
      // On cold start, getLastResponse returns the same ID that will be passed to listener
      setTimeout(() => {
        cb({
          notification: {
            request: { identifier: 'notif-same-id' },
            content: {
              title: 'Practice reminder',
              body: 'Same',
              data: { type: 'practice-reminder' },
            },
          },
        });
      }, 0);
      return { remove: removeListener };
    });
    mockGetLastResponse.mockResolvedValue({
      notification: {
        request: { identifier: 'notif-same-id' },
        content: {
          title: 'Practice reminder',
          body: 'Same',
          data: { type: 'practice-reminder' },
        },
      },
    });

    renderHook(() => useNotificationDeepLink());

    await new Promise(resolve => setTimeout(resolve, 10));

    expect(mockNavigateToReminders).toHaveBeenCalledTimes(1);
  });

  it('shouldRemoveListenerOnUnmount', () => {
    const removeListener = jest.fn();
    mockAddListener.mockReturnValue({ remove: removeListener });
    mockGetLastResponse.mockResolvedValue(null);

    const { unmount } = renderHook(() => useNotificationDeepLink());

    unmount();

    expect(removeListener).toHaveBeenCalled();
  });

  it('shouldCleanupListenerWithEmptyHandledSet', () => {
    const removeListener = jest.fn();
    mockAddListener.mockReturnValue({ remove: removeListener });
    mockGetLastResponse.mockResolvedValue(null);

    const { rerender } = renderHook(() => useNotificationDeepLink());

    expect(mockAddListener).toHaveBeenCalled();
    expect(removeListener).not.toHaveBeenCalled();

    rerender();

    // Listener should remain active on rerender
    expect(removeListener).not.toHaveBeenCalled();
  });
});
