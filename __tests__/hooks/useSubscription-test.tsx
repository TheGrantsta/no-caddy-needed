import { renderHook, waitFor } from '@testing-library/react-native';
import { useSubscription } from '../../hooks/useSubscription';
import { checkPremiumEntitlement } from '../../service/SubscriptionService';

jest.mock('../../service/SubscriptionService', () => ({
    checkPremiumEntitlement: jest.fn(),
}));

const mockCheckPremiumEntitlement = checkPremiumEntitlement as jest.Mock;

describe('useSubscription', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('returns isLoading true and isPremium false on initial render', () => {
        mockCheckPremiumEntitlement.mockReturnValue(new Promise(() => {}));

        const { result } = renderHook(() => useSubscription());

        expect(result.current.isPremium).toBe(false);
        expect(result.current.isLoading).toBe(true);
        expect(result.current.error).toBeNull();
    });

    it('returns isPremium true when checkPremiumEntitlement resolves true', async () => {
        mockCheckPremiumEntitlement.mockResolvedValue(true);

        const { result } = renderHook(() => useSubscription());

        await waitFor(() => expect(result.current.isLoading).toBe(false));

        expect(result.current.isPremium).toBe(true);
        expect(result.current.error).toBeNull();
    });

    it('returns isPremium false when checkPremiumEntitlement resolves false', async () => {
        mockCheckPremiumEntitlement.mockResolvedValue(false);

        const { result } = renderHook(() => useSubscription());

        await waitFor(() => expect(result.current.isLoading).toBe(false));

        expect(result.current.isPremium).toBe(false);
        expect(result.current.error).toBeNull();
    });

    it('returns error when checkPremiumEntitlement throws', async () => {
        mockCheckPremiumEntitlement.mockRejectedValue(new Error('Network error'));

        const { result } = renderHook(() => useSubscription());

        await waitFor(() => expect(result.current.isLoading).toBe(false));

        expect(result.current.isPremium).toBe(false);
        expect(result.current.error).toBe('Failed to check subscription');
    });

    it('calls checkPremiumEntitlement exactly once on mount', async () => {
        mockCheckPremiumEntitlement.mockResolvedValue(false);

        const { result } = renderHook(() => useSubscription());

        await waitFor(() => expect(result.current.isLoading).toBe(false));

        expect(mockCheckPremiumEntitlement).toHaveBeenCalledTimes(1);
    });
});
