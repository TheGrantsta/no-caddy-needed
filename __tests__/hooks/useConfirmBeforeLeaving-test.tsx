import { renderHook, act } from '@testing-library/react-native';
import { useConfirmBeforeLeaving } from '../../hooks/useConfirmBeforeLeaving';

const mockRouterBack = jest.fn();
let capturedListener: ((e: any) => void) | undefined;
const mockUnsubscribe = jest.fn();

jest.mock('expo-router', () => ({
    useRouter: () => ({ back: mockRouterBack }),
}));

jest.mock('@react-navigation/native', () => ({
    useNavigation: () => ({
        addListener: (_event: string, listener: (e: any) => void) => {
            capturedListener = listener;
            return mockUnsubscribe;
        },
    }),
}));

const fakeLeaveEvent = () => ({ preventDefault: jest.fn(), data: { action: {} } });

describe('useConfirmBeforeLeaving', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        capturedListener = undefined;
    });

    it('shouldPreventLeavingAndAskWhenActive', () => {
        const onAttemptLeave = jest.fn();
        renderHook(() => useConfirmBeforeLeaving(true, onAttemptLeave));

        const event = fakeLeaveEvent();
        capturedListener?.(event);

        expect(event.preventDefault).toHaveBeenCalledTimes(1);
        expect(onAttemptLeave).toHaveBeenCalledTimes(1);
    });

    it('shouldLetScreenLeaveWhenNotActive', () => {
        const onAttemptLeave = jest.fn();
        renderHook(() => useConfirmBeforeLeaving(false, onAttemptLeave));

        const event = fakeLeaveEvent();
        capturedListener?.(event);

        expect(event.preventDefault).not.toHaveBeenCalled();
        expect(onAttemptLeave).not.toHaveBeenCalled();
    });

    it('shouldLetLeaveProceedAfterUserConfirmedQuit', () => {
        const onAttemptLeave = jest.fn();
        const { result } = renderHook(() => useConfirmBeforeLeaving(true, onAttemptLeave));

        act(() => {
            result.current.leave();
        });

        const event = fakeLeaveEvent();
        capturedListener?.(event);

        expect(mockRouterBack).toHaveBeenCalledTimes(1);
        expect(event.preventDefault).not.toHaveBeenCalled();
    });

    it('shouldRemoveListenerOnUnmount', () => {
        const { unmount } = renderHook(() => useConfirmBeforeLeaving(true, jest.fn()));
        unmount();

        expect(mockUnsubscribe).toHaveBeenCalled();
    });
});
