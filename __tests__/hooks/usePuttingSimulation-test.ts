import { renderHook, act } from '@testing-library/react-native';
import { usePuttingSimulation } from '../../hooks/usePuttingSimulation';

describe('usePuttingSimulation', () => {
    describe('initialization', () => {
        it('initializes in in-progress phase', () => {
            const { result } = renderHook(() => usePuttingSimulation());
            expect(result.current.phase).toBe('in-progress');
        });

        it('starts at hole 1', () => {
            const { result } = renderHook(() => usePuttingSimulation());
            expect(result.current.holeNumber).toBe(1);
        });

        it('generates 18 distances immediately', () => {
            const { result } = renderHook(() => usePuttingSimulation());
            expect(result.current.distances).toHaveLength(18);
            expect(result.current.distances.every((d: number) => d > 0)).toBe(true);
        });

        it('has currentDistance set to first distance', () => {
            const { result } = renderHook(() => usePuttingSimulation());
            expect(result.current.currentDistance).toBe(result.current.distances[0]);
        });

        it('starts with zero makes', () => {
            const { result } = renderHook(() => usePuttingSimulation());
            expect(result.current.makesCount).toBe(0);
        });

        it('is not complete initially', () => {
            const { result } = renderHook(() => usePuttingSimulation());
            expect(result.current.isComplete).toBe(false);
        });

        it('computes expectedTourMakes on initialization', () => {
            const { result } = renderHook(() => usePuttingSimulation());
            expect(result.current.expectedTourMakes).toBeGreaterThan(0);
            expect(result.current.expectedTourMakes).toBeLessThan(18);
        });
    });

    describe('start()', () => {
        it('generates new 18 distances', () => {
            const { result } = renderHook(() => usePuttingSimulation());

            const firstDistances = [...result.current.distances];

            act(() => {
                result.current.start();
            });

            expect(result.current.distances.length).toBe(18);
            // Should have new distances (not guaranteed to be different, but testing the behavior)
        });

        it('keeps in-progress phase', () => {
            const { result } = renderHook(() => usePuttingSimulation());

            act(() => {
                result.current.start();
            });

            expect(result.current.phase).toBe('in-progress');
        });

        it('resets to hole 1', () => {
            const { result } = renderHook(() => usePuttingSimulation());

            act(() => {
                result.current.recordPutt(true);
                result.current.recordPutt(false);
            });

            expect(result.current.holeNumber).toBe(3);

            act(() => {
                result.current.start();
            });

            expect(result.current.holeNumber).toBe(1);
        });

        it('clears results on start', () => {
            const { result } = renderHook(() =>
                usePuttingSimulation(() => 0.5)
            );

            act(() => {
                result.current.recordPutt(true);
            });

            const firstMakesCount = result.current.makesCount;
            expect(firstMakesCount).toBe(1);

            act(() => {
                result.current.start();
            });

            expect(result.current.makesCount).toBe(0);
        });

        it('recomputes expectedTourMakes with new distances', () => {
            const { result } = renderHook(() => usePuttingSimulation());

            const expectedBefore = result.current.expectedTourMakes;

            act(() => {
                result.current.start();
            });

            // Should still be a valid value (even if same, that's okay)
            expect(result.current.expectedTourMakes).toBeGreaterThan(0);
            expect(result.current.expectedTourMakes).toBeLessThan(18);
        });
    });

    describe('recordPutt()', () => {
        it('increments holeNumber on each putt', () => {
            const { result } = renderHook(() => usePuttingSimulation());

            act(() => {
                result.current.start();
            });

            expect(result.current.holeNumber).toBe(1);

            act(() => {
                result.current.recordPutt(false);
            });

            expect(result.current.holeNumber).toBe(2);

            act(() => {
                result.current.recordPutt(true);
            });

            expect(result.current.holeNumber).toBe(3);
        });

        it('increments makesCount only on made putts', () => {
            const { result } = renderHook(() => usePuttingSimulation());

            act(() => {
                result.current.start();
            });

            act(() => {
                result.current.recordPutt(false); // missed
                result.current.recordPutt(true); // made
                result.current.recordPutt(true); // made
            });

            expect(result.current.makesCount).toBe(2);
        });

        it('transitions to complete after 18 putts', () => {
            const { result } = renderHook(() => usePuttingSimulation());

            act(() => {
                result.current.start();
            });

            for (let i = 0; i < 18; i++) {
                expect(result.current.phase).not.toBe('complete');
                act(() => {
                    result.current.recordPutt(i % 2 === 0);
                });
            }

            expect(result.current.phase).toBe('complete');
            expect(result.current.isComplete).toBe(true);
        });

        it('has correct currentDistance for each hole', () => {
            const { result } = renderHook(() => usePuttingSimulation());

            const distances = [...result.current.distances];

            for (let i = 0; i < 5; i++) {
                expect(result.current.currentDistance).toBe(distances[i]);
                act(() => {
                    result.current.recordPutt(true);
                });
            }
        });

        it('is a no-op after complete', () => {
            const { result } = renderHook(() => usePuttingSimulation());

            act(() => {
                result.current.start();
                for (let i = 0; i < 18; i++) {
                    result.current.recordPutt(true);
                }
            });

            const completeMakesCount = result.current.makesCount;

            act(() => {
                result.current.recordPutt(true);
            });

            expect(result.current.makesCount).toBe(completeMakesCount);
        });
    });

    describe('reset()', () => {
        it('returns to in-progress phase', () => {
            const { result } = renderHook(() => usePuttingSimulation());

            act(() => {
                result.current.recordPutt(true);
                result.current.recordPutt(false);
                for (let i = 0; i < 16; i++) {
                    result.current.recordPutt(true);
                }
            });

            expect(result.current.phase).toBe('complete');

            act(() => {
                result.current.reset();
            });

            expect(result.current.phase).toBe('in-progress');
        });

        it('generates new distances on reset', () => {
            const { result } = renderHook(() => usePuttingSimulation());

            const firstDistances = [...result.current.distances];

            act(() => {
                result.current.reset();
            });

            expect(result.current.distances).toHaveLength(18);
        });

        it('clears results', () => {
            const { result } = renderHook(() => usePuttingSimulation());

            act(() => {
                result.current.recordPutt(true);
                result.current.recordPutt(false);
                result.current.reset();
            });

            expect(result.current.results).toEqual([]);
        });

        it('returns to hole 1', () => {
            const { result } = renderHook(() => usePuttingSimulation());

            act(() => {
                result.current.recordPutt(true);
                result.current.recordPutt(false);
                result.current.reset();
            });

            expect(result.current.holeNumber).toBe(1);
        });
    });

    describe('with injected RNG', () => {
        it('uses provided RNG for deterministic generation on init', () => {
            let callCount = 0;
            const distances1 = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18];
            const mockRng = jest.fn(() => {
                const val = callCount < distances1.length ? 0.01 + callCount * 0.05 : 0.5;
                callCount++;
                return val;
            });

            const { result: result1 } = renderHook(() => usePuttingSimulation(mockRng));

            const firstDistances = [...result1.current.distances];

            // Reset mock for second run
            mockRng.mockClear();
            callCount = 0;

            const { result: result2 } = renderHook(() => usePuttingSimulation(mockRng));

            const secondDistances = [...result2.current.distances];

            // With same RNG sequence, should get same distances
            expect(firstDistances).toEqual(secondDistances);
        });
    });

    describe('expectedTourMakes stability', () => {
        it('is stable across putt recordings', () => {
            const { result } = renderHook(() => usePuttingSimulation(() => 0.5));

            act(() => {
                result.current.start();
            });

            const expectedBefore = result.current.expectedTourMakes;

            act(() => {
                result.current.recordPutt(true);
                result.current.recordPutt(false);
                result.current.recordPutt(true);
            });

            const expectedAfter = result.current.expectedTourMakes;

            expect(expectedAfter).toBe(expectedBefore);
        });
    });
});
