import { renderHook, act } from '@testing-library/react-native';
import { useToggle } from '../../hooks/useToggle';

describe('useToggle', () => {
    it('initializes with false by default', () => {
        const { result } = renderHook(() => useToggle());
        expect(result.current[0]).toBe(false);
    });

    it('initializes with provided value', () => {
        const { result } = renderHook(() => useToggle(true));
        expect(result.current[0]).toBe(true);
    });

    it('toggles value when toggle is called', () => {
        const { result } = renderHook(() => useToggle(false));
        expect(result.current[0]).toBe(false);

        act(() => {
            result.current[1]();
        });

        expect(result.current[0]).toBe(true);

        act(() => {
            result.current[1]();
        });

        expect(result.current[0]).toBe(false);
    });

    it('sets value directly when setDirectly is called', () => {
        const { result } = renderHook(() => useToggle(false));

        act(() => {
            result.current[2](true);
        });

        expect(result.current[0]).toBe(true);

        act(() => {
            result.current[2](false);
        });

        expect(result.current[0]).toBe(false);
    });
});
