import { renderHook, act } from '@testing-library/react-native';
import { useShortPuttingLadderSimulation } from '../../hooks/useShortPuttingLadderSimulation';

describe('useShortPuttingLadderSimulation', () => {
    describe('initialization', () => {
        it('initializes in in-progress phase', () => {
            const { result } = renderHook(() => useShortPuttingLadderSimulation());
            expect(result.current.phase).toBe('in-progress');
        });

        it('starts at level 4 ft', () => {
            const { result } = renderHook(() => useShortPuttingLadderSimulation());
            expect(result.current.currentLevel).toBe(4);
        });

        it('starts with zero attempts', () => {
            const { result } = renderHook(() => useShortPuttingLadderSimulation());
            expect(result.current.totalAttempts).toBe(0);
        });

        it('is not complete initially', () => {
            const { result } = renderHook(() => useShortPuttingLadderSimulation());
            expect(result.current.isComplete).toBe(false);
        });
    });

    describe('recordMake()', () => {
        it('advances to next level on make', () => {
            const { result } = renderHook(() => useShortPuttingLadderSimulation());

            act(() => {
                result.current.recordMake();
            });

            expect(result.current.currentLevel).toBe(5);
            expect(result.current.totalAttempts).toBe(1);
        });

        it('increments attempts on make', () => {
            const { result } = renderHook(() => useShortPuttingLadderSimulation());

            act(() => {
                result.current.recordMake();
            });

            expect(result.current.totalAttempts).toBe(1);

            act(() => {
                result.current.recordMake();
            });

            expect(result.current.totalAttempts).toBe(2);
        });

        it('advances through all levels to 10 ft', () => {
            const { result } = renderHook(() => useShortPuttingLadderSimulation());

            for (let i = 0; i < 6; i++) {
                act(() => {
                    result.current.recordMake();
                });
            }

            expect(result.current.currentLevel).toBe(10);
            expect(result.current.totalAttempts).toBe(6);
        });
    });

    describe('recordMiss()', () => {
        it('stays at same level on miss', () => {
            const { result } = renderHook(() => useShortPuttingLadderSimulation());

            act(() => {
                result.current.recordMake(); // advance to 5 ft
            });

            const levelBefore = result.current.currentLevel;

            act(() => {
                result.current.recordMiss();
            });

            expect(result.current.currentLevel).toBe(levelBefore);
        });

        it('increments attempts on miss', () => {
            const { result } = renderHook(() => useShortPuttingLadderSimulation());

            act(() => {
                result.current.recordMiss();
            });

            expect(result.current.totalAttempts).toBe(1);
        });

        it('allows retrying at same level', () => {
            const { result } = renderHook(() => useShortPuttingLadderSimulation());

            act(() => {
                result.current.recordMiss();
                result.current.recordMiss();
                result.current.recordMake();
            });

            expect(result.current.currentLevel).toBe(5);
            expect(result.current.totalAttempts).toBe(3);
        });
    });

    describe('finish()', () => {
        it('transitions to complete phase', () => {
            const { result } = renderHook(() => useShortPuttingLadderSimulation());

            act(() => {
                result.current.recordMake();
            });

            act(() => {
                result.current.finish();
            });

            expect(result.current.phase).toBe('complete');
        });

        it('records levelReached at finish', () => {
            const { result } = renderHook(() => useShortPuttingLadderSimulation());

            act(() => {
                result.current.recordMake();
                result.current.recordMake();
                result.current.finish();
            });

            expect(result.current.levelReached).toBe(6);
        });
    });

    describe('reset()', () => {
        it('returns to in-progress at level 4 with zero attempts', () => {
            const { result } = renderHook(() => useShortPuttingLadderSimulation());

            act(() => {
                result.current.recordMake();
                result.current.recordMake();
                result.current.finish();
            });

            act(() => {
                result.current.reset();
            });

            expect(result.current.phase).toBe('in-progress');
            expect(result.current.currentLevel).toBe(4);
            expect(result.current.totalAttempts).toBe(0);
        });
    });

    describe('isComplete', () => {
        it('is true only after finish', () => {
            const { result } = renderHook(() => useShortPuttingLadderSimulation());

            expect(result.current.isComplete).toBe(false);

            act(() => {
                result.current.recordMake();
            });

            expect(result.current.isComplete).toBe(false);

            act(() => {
                result.current.finish();
            });

            expect(result.current.isComplete).toBe(true);
        });
    });
});
