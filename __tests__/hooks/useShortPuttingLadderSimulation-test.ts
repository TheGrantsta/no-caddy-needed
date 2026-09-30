import { renderHook, act } from '@testing-library/react-native';
import { useShortPuttingLadderSimulation } from '../../hooks/useShortPuttingLadderSimulation';

describe('useShortPuttingLadderSimulation', () => {
    describe('initialization', () => {
        it('initializes in in-progress phase', () => {
            const { result } = renderHook(() => useShortPuttingLadderSimulation());
            expect(result.current.phase).toBe('in-progress');
        });

        it('starts at level 4 ft (index 0)', () => {
            const { result } = renderHook(() => useShortPuttingLadderSimulation());
            expect(result.current.levelIndex).toBe(0);
            expect(result.current.currentLevel).toBe(4);
        });

        it('starts with currentResult as 1', () => {
            const { result } = renderHook(() => useShortPuttingLadderSimulation());
            expect(result.current.currentResult).toBe(1);
        });

        it('is not complete initially', () => {
            const { result } = renderHook(() => useShortPuttingLadderSimulation());
            expect(result.current.isComplete).toBe(false);
        });

        it('has 7 levels total', () => {
            const { result } = renderHook(() => useShortPuttingLadderSimulation());
            expect(result.current.levelCount).toBe(7);
        });
    });

    describe('setResult()', () => {
        it('sets current result to attempts (1-10)', () => {
            const { result } = renderHook(() => useShortPuttingLadderSimulation());

            act(() => {
                result.current.setResult(1);
            });

            expect(result.current.currentResult).toBe(1);

            act(() => {
                result.current.setResult(5);
            });

            expect(result.current.currentResult).toBe(5);

            act(() => {
                result.current.setResult(10);
            });

            expect(result.current.currentResult).toBe(10);
        });
    });

    describe('goToNextLevel()', () => {
        it('advances to next level', () => {
            const { result } = renderHook(() => useShortPuttingLadderSimulation());

            act(() => {
                result.current.setResult(1);
                result.current.goToNextLevel();
            });

            expect(result.current.levelIndex).toBe(1);
            expect(result.current.currentLevel).toBe(5);
        });

        it('does not advance past level 10', () => {
            const { result } = renderHook(() => useShortPuttingLadderSimulation());

            for (let i = 0; i < 7; i++) {
                act(() => {
                    result.current.setResult(1);
                    result.current.goToNextLevel();
                });
            }

            expect(result.current.levelIndex).toBe(6);
            expect(result.current.currentLevel).toBe(10);
        });

        it('saves current result before advancing', () => {
            const { result } = renderHook(() => useShortPuttingLadderSimulation());

            act(() => {
                result.current.setResult(3);
                result.current.goToNextLevel();
            });

            expect(result.current.results[0]).toBe(3);
            expect(result.current.levelIndex).toBe(1);
        });
    });

    describe('goToPreviousLevel()', () => {
        it('goes back to previous level', () => {
            const { result } = renderHook(() => useShortPuttingLadderSimulation());

            act(() => {
                result.current.goToNextLevel();
                result.current.goToNextLevel();
            });

            expect(result.current.levelIndex).toBe(2);

            act(() => {
                result.current.goToPreviousLevel();
            });

            expect(result.current.levelIndex).toBe(1);
            expect(result.current.currentLevel).toBe(5);
        });

        it('does not go before level 4', () => {
            const { result } = renderHook(() => useShortPuttingLadderSimulation());

            act(() => {
                result.current.goToPreviousLevel();
            });

            expect(result.current.levelIndex).toBe(0);
        });
    });

    describe('finish()', () => {
        it('transitions to complete phase', () => {
            const { result } = renderHook(() => useShortPuttingLadderSimulation());

            act(() => {
                result.current.setResult(1);
                result.current.finish();
            });

            expect(result.current.phase).toBe('complete');
        });

        it('saves all results', () => {
            const { result } = renderHook(() => useShortPuttingLadderSimulation());

            act(() => {
                result.current.setResult(1);
                result.current.goToNextLevel();
                result.current.setResult(0);
                result.current.goToNextLevel();
                result.current.setResult(1);
                result.current.finish();
            });

            expect(result.current.results).toEqual([1, 0, 1]);
        });

        it('calculates total attempts on finish', () => {
            const { result } = renderHook(() => useShortPuttingLadderSimulation());

            act(() => {
                result.current.setResult(2);
                result.current.goToNextLevel();
                result.current.setResult(3);
                result.current.goToNextLevel();
                result.current.setResult(1);
                result.current.finish();
            });

            expect(result.current.totalAttempts).toBe(6); // 2 + 3 + 1
        });
    });

    describe('reset()', () => {
        it('returns to in-progress at level 4', () => {
            const { result } = renderHook(() => useShortPuttingLadderSimulation());

            act(() => {
                result.current.setResult(1);
                result.current.goToNextLevel();
                result.current.finish();
            });

            act(() => {
                result.current.reset();
            });

            expect(result.current.phase).toBe('in-progress');
            expect(result.current.levelIndex).toBe(0);
            expect(result.current.currentLevel).toBe(4);
        });
    });
});
