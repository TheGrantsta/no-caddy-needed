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

        it('starts with currentPutts at 1', () => {
            const { result } = renderHook(() => usePuttingSimulation());
            expect(result.current.currentPutts).toBe(1);
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
        it('generates new 18 distances and resets round', () => {
            const { result } = renderHook(() => usePuttingSimulation());

            act(() => {
                result.current.goToNextHole();
                result.current.setPutts(3);
                result.current.start();
            });

            expect(result.current.phase).toBe('in-progress');
            expect(result.current.holeNumber).toBe(1);
            expect(result.current.currentPutts).toBe(1);
            expect(result.current.makesCount).toBe(0);
        });
    });

    describe('setPutts()', () => {
        it('sets currentPutts for the hole', () => {
            const { result } = renderHook(() => usePuttingSimulation());

            expect(result.current.currentPutts).toBe(1);

            act(() => {
                result.current.setPutts(3);
            });

            expect(result.current.currentPutts).toBe(3);
        });

        it('increments makesCount only on 1-putt holes', () => {
            const { result } = renderHook(() => usePuttingSimulation());

            act(() => {
                result.current.setPutts(1);
                result.current.goToNextHole();
            });

            expect(result.current.makesCount).toBe(1);

            act(() => {
                result.current.setPutts(2);
                result.current.goToNextHole();
            });

            expect(result.current.makesCount).toBe(1); // still 1, didn't add another
        });
    });

    describe('goToNextHole()', () => {
        it('advances to next hole', () => {
            const { result } = renderHook(() => usePuttingSimulation());

            expect(result.current.holeNumber).toBe(1);

            act(() => {
                result.current.goToNextHole();
            });

            expect(result.current.holeNumber).toBe(2);
        });

        it('resets currentPutts to 1 on next hole', () => {
            const { result } = renderHook(() => usePuttingSimulation());

            act(() => {
                result.current.setPutts(4);
                result.current.goToNextHole();
            });

            expect(result.current.currentPutts).toBe(1);
        });

        it('transitions to complete after hole 18', () => {
            const { result } = renderHook(() => usePuttingSimulation());

            for (let i = 0; i < 18; i++) {
                expect(result.current.phase).toBe('in-progress');
                act(() => {
                    result.current.goToNextHole();
                });
            }

            expect(result.current.phase).toBe('complete');
        });

        it('updates currentDistance when advancing', () => {
            const { result } = renderHook(() => usePuttingSimulation());

            const distances = [...result.current.distances];
            expect(result.current.currentDistance).toBe(distances[0]);

            act(() => {
                result.current.goToNextHole();
            });

            expect(result.current.currentDistance).toBe(distances[1]);
        });
    });

    describe('goToPreviousHole()', () => {
        it('goes back to previous hole', () => {
            const { result } = renderHook(() => usePuttingSimulation());

            act(() => {
                result.current.goToNextHole();
                result.current.goToNextHole();
            });

            expect(result.current.holeNumber).toBe(3);

            act(() => {
                result.current.goToPreviousHole();
            });

            expect(result.current.holeNumber).toBe(2);
        });

        it('is a no-op on hole 1', () => {
            const { result } = renderHook(() => usePuttingSimulation());

            expect(result.current.holeNumber).toBe(1);

            act(() => {
                result.current.goToPreviousHole();
            });

            expect(result.current.holeNumber).toBe(1);
        });

        it('restores previous hole data', () => {
            const { result } = renderHook(() => usePuttingSimulation());

            act(() => {
                result.current.setPutts(2);
            });

            act(() => {
                result.current.goToNextHole();
            });

            act(() => {
                result.current.setPutts(3);
            });

            act(() => {
                result.current.goToPreviousHole();
            });

            expect(result.current.currentPutts).toBe(2);
        });
    });

    describe('reset()', () => {
        it('returns to in-progress at hole 1 with cleared data', () => {
            const { result } = renderHook(() => usePuttingSimulation());

            act(() => {
                for (let i = 0; i < 18; i++) {
                    result.current.goToNextHole();
                }
            });

            expect(result.current.phase).toBe('complete');

            act(() => {
                result.current.reset();
            });

            expect(result.current.phase).toBe('in-progress');
            expect(result.current.holeNumber).toBe(1);
            expect(result.current.makesCount).toBe(0);
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
        it('is stable across hole navigation', () => {
            const { result } = renderHook(() => usePuttingSimulation(() => 0.5));

            const expectedBefore = result.current.expectedTourMakes;

            act(() => {
                result.current.goToNextHole();
                result.current.goToNextHole();
                result.current.goToPreviousHole();
            });

            const expectedAfter = result.current.expectedTourMakes;

            expect(expectedAfter).toBe(expectedBefore);
        });
    });
});
