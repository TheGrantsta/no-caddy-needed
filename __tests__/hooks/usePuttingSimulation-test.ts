import { renderHook, act } from '@testing-library/react-native';
import { usePuttingSimulation } from '../../hooks/usePuttingSimulation';

describe('usePuttingSimulation', () => {
    describe('initialization', () => {
        it('initializes in intro phase', () => {
            const { result } = renderHook(() => usePuttingSimulation());
            expect(result.current.phase).toBe('intro');
        });

        it('starts at hole 1', () => {
            const { result } = renderHook(() => usePuttingSimulation());
            expect(result.current.holeNumber).toBe(1);
        });

        it('has no current distance in intro phase', () => {
            const { result } = renderHook(() => usePuttingSimulation());
            expect(result.current.currentDistance).toBeUndefined();
        });

        it('starts with zero makes', () => {
            const { result } = renderHook(() => usePuttingSimulation());
            expect(result.current.makesCount).toBe(0);
        });

        it('is not complete initially', () => {
            const { result } = renderHook(() => usePuttingSimulation());
            expect(result.current.isComplete).toBe(false);
        });

        it('has zero distances initially', () => {
            const { result } = renderHook(() => usePuttingSimulation());
            expect(result.current.distances).toEqual([]);
        });
    });

    describe('start()', () => {
        it('generates 18 distances', () => {
            const { result } = renderHook(() => usePuttingSimulation());

            act(() => {
                result.current.start();
            });

            expect(result.current.distances.length).toBe(18);
        });

        it('transitions to in-progress phase', () => {
            const { result } = renderHook(() => usePuttingSimulation());

            act(() => {
                result.current.start();
            });

            expect(result.current.phase).toBe('in-progress');
        });

        it('sets currentDistance to first distance', () => {
            const { result } = renderHook(() => usePuttingSimulation());

            act(() => {
                result.current.start();
            });

            expect(result.current.currentDistance).toBe(result.current.distances[0]);
        });

        it('clears results on start', () => {
            const { result } = renderHook(() =>
                usePuttingSimulation(() => 0.5)
            );

            act(() => {
                result.current.start();
                result.current.recordPutt(true);
            });

            const firstMakesCount = result.current.makesCount;
            expect(firstMakesCount).toBe(1);

            act(() => {
                result.current.start();
            });

            expect(result.current.makesCount).toBe(0);
        });

        it('computes expectedTourMakes after start', () => {
            const { result } = renderHook(() => usePuttingSimulation());

            act(() => {
                result.current.start();
            });

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

            act(() => {
                result.current.start();
            });

            const distances = [...result.current.distances];

            for (let i = 0; i < 5; i++) {
                expect(result.current.currentDistance).toBe(distances[i]);
                act(() => {
                    result.current.recordPutt(true);
                });
            }
        });

        it('is a no-op before start()', () => {
            const { result } = renderHook(() => usePuttingSimulation());

            act(() => {
                result.current.recordPutt(true);
                result.current.recordPutt(false);
            });

            expect(result.current.phase).toBe('intro');
            expect(result.current.makesCount).toBe(0);
            expect(result.current.results).toEqual([]);
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
        it('returns to intro phase', () => {
            const { result } = renderHook(() => usePuttingSimulation());

            act(() => {
                result.current.start();
                result.current.reset();
            });

            expect(result.current.phase).toBe('intro');
        });

        it('clears distances', () => {
            const { result } = renderHook(() => usePuttingSimulation());

            act(() => {
                result.current.start();
                result.current.reset();
            });

            expect(result.current.distances).toEqual([]);
        });

        it('clears results', () => {
            const { result } = renderHook(() => usePuttingSimulation());

            act(() => {
                result.current.start();
                result.current.recordPutt(true);
                result.current.recordPutt(false);
                result.current.reset();
            });

            expect(result.current.results).toEqual([]);
        });

        it('returns to hole 1', () => {
            const { result } = renderHook(() => usePuttingSimulation());

            act(() => {
                result.current.start();
                result.current.recordPutt(true);
                result.current.recordPutt(false);
                result.current.reset();
            });

            expect(result.current.holeNumber).toBe(1);
        });
    });

    describe('with injected RNG', () => {
        it('uses provided RNG for deterministic generation', () => {
            let callCount = 0;
            const distances1 = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18];
            const mockRng = jest.fn(() => {
                const val = callCount < distances1.length ? 0.01 + callCount * 0.05 : 0.5;
                callCount++;
                return val;
            });

            const { result: result1 } = renderHook(() => usePuttingSimulation(mockRng));

            act(() => {
                result1.current.start();
            });

            const firstDistances = [...result1.current.distances];

            // Reset mock for second run
            mockRng.mockClear();
            callCount = 0;

            const { result: result2 } = renderHook(() => usePuttingSimulation(mockRng));

            act(() => {
                result2.current.start();
            });

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
