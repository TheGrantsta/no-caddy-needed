import { renderHook, act } from '@testing-library/react-native';
import { Dimensions } from 'react-native';
import { useOrientation } from '../../hooks/useOrientation';

describe('useOrientation', () => {
    const originalGet = Dimensions.get;
    const originalAddEventListener = Dimensions.addEventListener;

    beforeEach(() => {
        Dimensions.get = originalGet;
        Dimensions.addEventListener = originalAddEventListener;
    });

    afterEach(() => {
        Dimensions.get = originalGet;
        Dimensions.addEventListener = originalAddEventListener;
    });

    it('returns isLandscape false when width < height', () => {
        Dimensions.get = jest.fn().mockReturnValue({ width: 400, height: 800 });

        const { result } = renderHook(() => useOrientation());

        expect(result.current.isLandscape).toBe(false);
        expect(result.current.isPortrait).toBe(true);
    });

    it('returns isLandscape true when width > height', () => {
        Dimensions.get = jest.fn().mockReturnValue({ width: 800, height: 400 });

        const { result } = renderHook(() => useOrientation());

        expect(result.current.isLandscape).toBe(true);
        expect(result.current.isPortrait).toBe(false);
    });

    it('returns landscapePadding with 10% horizontal padding in landscape', () => {
        Dimensions.get = jest.fn().mockReturnValue({ width: 800, height: 400 });

        const { result } = renderHook(() => useOrientation());

        expect(result.current.landscapePadding).toEqual({
            paddingHorizontal: 80,
        });
    });

    it('returns empty landscapePadding in portrait', () => {
        Dimensions.get = jest.fn().mockReturnValue({ width: 400, height: 800 });

        const { result } = renderHook(() => useOrientation());

        expect(result.current.landscapePadding).toEqual({});
    });

    it('updates when dimensions change', () => {
        let dimensionChangeHandler: ((event: { window: { width: number; height: number } }) => void) | null = null;

        Dimensions.get = jest.fn().mockReturnValue({ width: 400, height: 800 });
        Dimensions.addEventListener = jest.fn().mockImplementation((event, handler) => {
            dimensionChangeHandler = handler;
            return { remove: jest.fn() };
        });

        const { result } = renderHook(() => useOrientation());

        expect(result.current.isLandscape).toBe(false);

        act(() => {
            Dimensions.get = jest.fn().mockReturnValue({ width: 800, height: 400 });
            if (dimensionChangeHandler) {
                dimensionChangeHandler({ window: { width: 800, height: 400 } });
            }
        });

        expect(result.current.isLandscape).toBe(true);
    });
});
