import { renderHook, act } from '@testing-library/react-native';
import { useLagPuttingSimulation } from '../../hooks/useLagPuttingSimulation';

describe('useLagPuttingSimulation', () => {
    describe('initialization', () => {
        it('initializes in in-progress phase', () => {
            const { result } = renderHook(() => useLagPuttingSimulation());
            expect(result.current.phase).toBe('in-progress');
        });

        it('starts with score 0', () => {
            const { result } = renderHook(() => useLagPuttingSimulation());
            expect(result.current.score).toBe(0);
        });

        it('is not complete initially', () => {
            const { result } = renderHook(() => useLagPuttingSimulation());
            expect(result.current.isComplete).toBe(false);
        });
    });

    describe('setScore()', () => {
        it('sets score value', () => {
            const { result } = renderHook(() => useLagPuttingSimulation());

            act(() => {
                result.current.setScore(5);
            });

            expect(result.current.score).toBe(5);
        });

        it('clamps score to 0-15 range', () => {
            const { result } = renderHook(() => useLagPuttingSimulation());

            act(() => {
                result.current.setScore(-1);
            });

            expect(result.current.score).toBe(0);

            act(() => {
                result.current.setScore(20);
            });

            expect(result.current.score).toBe(15);
        });
    });

    describe('submit()', () => {
        it('transitions to complete phase', () => {
            const { result } = renderHook(() => useLagPuttingSimulation());

            act(() => {
                result.current.setScore(5);
                result.current.submit();
            });

            expect(result.current.phase).toBe('complete');
            expect(result.current.isComplete).toBe(true);
        });
    });

    describe('reset()', () => {
        it('returns to in-progress with score 0', () => {
            const { result } = renderHook(() => useLagPuttingSimulation());

            act(() => {
                result.current.setScore(7);
                result.current.submit();
            });

            act(() => {
                result.current.reset();
            });

            expect(result.current.phase).toBe('in-progress');
            expect(result.current.score).toBe(0);
            expect(result.current.isComplete).toBe(false);
        });
    });
});
