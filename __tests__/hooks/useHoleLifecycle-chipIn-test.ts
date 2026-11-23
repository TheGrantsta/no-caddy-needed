import { renderHook, act } from '@testing-library/react-native';
import { useHoleLifecycle } from '../../hooks/useHoleLifecycle';

describe('useHoleLifecycle chip-in validation', () => {
    it('shouldAcceptAChipInWithNoSecondPuttAsValid', () => {
        const { result } = renderHook(() => useHoleLifecycle());

        let valid = false;
        act(() => {
            valid = result.current.validatePuttingStats({
                firstPutt: 0,
                secondPutt: 0,
                secondIsLong: false,
                greenInRegulation: false,
            });
        });

        expect(valid).toBe(true);
        expect(result.current.puttingFirstPuttError).toBe(false);
        expect(result.current.puttingSecondPuttRequiredError).toBe(false);
    });

    it('shouldNotRequireASecondPuttForAChipInEvenWhen3PuttIsSelected', () => {
        const { result } = renderHook(() => useHoleLifecycle());
        act(() => {
            result.current.setDeadlySinsValues(prev => ({ ...prev, threePutts: true }));
        });

        let valid = false;
        act(() => {
            valid = result.current.validatePuttingStats({
                firstPutt: 0,
                secondPutt: undefined,
                secondIsLong: false,
                greenInRegulation: false,
            });
        });

        expect(valid).toBe(true);
        expect(result.current.puttingSecondPuttRequiredError).toBe(false);
    });

    it('shouldStillRequireASecondPuttForA3PuttThatIsNotAChipIn', () => {
        const { result } = renderHook(() => useHoleLifecycle());
        act(() => {
            result.current.setDeadlySinsValues(prev => ({ ...prev, threePutts: true }));
        });

        let valid = true;
        act(() => {
            valid = result.current.validatePuttingStats({
                firstPutt: 20,
                secondPutt: undefined,
                secondIsLong: false,
                greenInRegulation: false,
            });
        });

        expect(valid).toBe(false);
        expect(result.current.puttingSecondPuttRequiredError).toBe(true);
    });

    it('shouldStillRejectAMissingFirstPuttEvenWithNoChipIn', () => {
        const { result } = renderHook(() => useHoleLifecycle());

        let valid = true;
        act(() => {
            valid = result.current.validatePuttingStats(null);
        });

        expect(valid).toBe(false);
        expect(result.current.puttingFirstPuttError).toBe(true);
    });
});
