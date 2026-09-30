import { renderHook, act } from '@testing-library/react-native';
import { useUpAndDownSimulation } from '../../hooks/useUpAndDownSimulation';

describe('useUpAndDownSimulation', () => {
    describe('initialization', () => {
        it('initializes in in-progress phase', () => {
            const { result } = renderHook(() => useUpAndDownSimulation());
            expect(result.current.phase).toBe('in-progress');
        });

        it('starts at hole 1', () => {
            const { result } = renderHook(() => useUpAndDownSimulation());
            expect(result.current.holeNumber).toBe(1);
        });

        it('generates 9 distances immediately', () => {
            const { result } = renderHook(() => useUpAndDownSimulation());
            expect(result.current.distances).toHaveLength(9);
            expect(result.current.distances.every((d: number) => d > 0)).toBe(true);
        });

        it('has currentDistance set to first distance', () => {
            const { result } = renderHook(() => useUpAndDownSimulation());
            expect(result.current.currentDistance).toBe(result.current.distances[0]);
        });

        it('starts with currentShots at 1', () => {
            const { result } = renderHook(() => useUpAndDownSimulation());
            expect(result.current.currentShots).toBe(1);
        });

        it('starts with zero up-and-downs', () => {
            const { result } = renderHook(() => useUpAndDownSimulation());
            expect(result.current.upAndDownCount).toBe(0);
        });

        it('is not complete initially', () => {
            const { result } = renderHook(() => useUpAndDownSimulation());
            expect(result.current.isComplete).toBe(false);
        });

        it('computes success percentage on initialization', () => {
            const { result } = renderHook(() => useUpAndDownSimulation());
            expect(result.current.successPercentage).toBe(0);
        });
    });

    describe('setShots()', () => {
        it('sets currentShots for the hole (1-4 range)', () => {
            const { result } = renderHook(() => useUpAndDownSimulation());

            expect(result.current.currentShots).toBe(1);

            act(() => {
                result.current.setShots(3);
            });

            expect(result.current.currentShots).toBe(3);

            act(() => {
                result.current.setShots(4);
            });

            expect(result.current.currentShots).toBe(4);
        });

        it('clamps shots to 1-4 range', () => {
            const { result } = renderHook(() => useUpAndDownSimulation());

            act(() => {
                result.current.setShots(0);
            });
            expect(result.current.currentShots).toBe(1);

            act(() => {
                result.current.setShots(5);
            });
            expect(result.current.currentShots).toBe(4);
        });

        it('increments upAndDownCount only on 2-or-fewer shots', () => {
            const { result } = renderHook(() => useUpAndDownSimulation());

            act(() => {
                result.current.setShots(1);
                result.current.goToNextHole();
            });

            expect(result.current.upAndDownCount).toBe(1);

            act(() => {
                result.current.setShots(2);
                result.current.goToNextHole();
            });

            expect(result.current.upAndDownCount).toBe(2);

            act(() => {
                result.current.setShots(3);
                result.current.goToNextHole();
            });

            expect(result.current.upAndDownCount).toBe(2); // still 2, didn't add another
        });
    });

    describe('goToNextHole()', () => {
        it('advances to next hole', () => {
            const { result } = renderHook(() => useUpAndDownSimulation());

            expect(result.current.holeNumber).toBe(1);

            act(() => {
                result.current.goToNextHole();
            });

            expect(result.current.holeNumber).toBe(2);
        });

        it('resets currentShots to 1 on next hole', () => {
            const { result } = renderHook(() => useUpAndDownSimulation());

            act(() => {
                result.current.setShots(4);
                result.current.goToNextHole();
            });

            expect(result.current.currentShots).toBe(1);
        });

        it('transitions to complete after hole 9', () => {
            const { result } = renderHook(() => useUpAndDownSimulation());

            for (let i = 0; i < 9; i++) {
                expect(result.current.phase).toBe('in-progress');
                act(() => {
                    result.current.goToNextHole();
                });
            }

            expect(result.current.phase).toBe('complete');
        });

        it('updates currentDistance when advancing', () => {
            const { result } = renderHook(() => useUpAndDownSimulation());

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
            const { result } = renderHook(() => useUpAndDownSimulation());

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
            const { result } = renderHook(() => useUpAndDownSimulation());

            expect(result.current.holeNumber).toBe(1);

            act(() => {
                result.current.goToPreviousHole();
            });

            expect(result.current.holeNumber).toBe(1);
        });

        it('restores previous hole data', () => {
            const { result } = renderHook(() => useUpAndDownSimulation());

            act(() => {
                result.current.setShots(2);
            });

            act(() => {
                result.current.goToNextHole();
            });

            act(() => {
                result.current.setShots(3);
            });

            act(() => {
                result.current.goToPreviousHole();
            });

            expect(result.current.currentShots).toBe(2);
        });
    });

    describe('reset()', () => {
        it('returns to in-progress at hole 1 with cleared data', () => {
            const { result } = renderHook(() => useUpAndDownSimulation());

            act(() => {
                for (let i = 0; i < 9; i++) {
                    result.current.goToNextHole();
                }
            });

            expect(result.current.phase).toBe('complete');

            act(() => {
                result.current.reset();
            });

            expect(result.current.phase).toBe('in-progress');
            expect(result.current.holeNumber).toBe(1);
            expect(result.current.upAndDownCount).toBe(0);
        });
    });

    describe('successPercentage', () => {
        it('calculates percentage correctly', () => {
            const { result } = renderHook(() => useUpAndDownSimulation());

            act(() => {
                result.current.setShots(1);
                result.current.goToNextHole();
            });

            expect(result.current.successPercentage).toBe(100); // 1/1 = 100%

            act(() => {
                result.current.setShots(2);
                result.current.goToNextHole();
            });

            expect(result.current.successPercentage).toBe(100); // 2/2 = 100%

            act(() => {
                result.current.setShots(3);
                result.current.goToNextHole();
            });

            expect(result.current.successPercentage).toBe(67); // 2/3 = 66.67 -> 67%
        });

        it('is 0% when no holes completed', () => {
            const { result } = renderHook(() => useUpAndDownSimulation());
            expect(result.current.successPercentage).toBe(0);
        });
    });

    describe('with injected RNG', () => {
        it('uses provided RNG for deterministic generation on init', () => {
            let callCount = 0;
            const mockRng = jest.fn(() => {
                const val = callCount < 9 ? 0.01 + callCount * 0.1 : 0.5;
                callCount++;
                return val;
            });

            const { result: result1 } = renderHook(() => useUpAndDownSimulation(mockRng));
            const firstDistances = [...result1.current.distances];

            mockRng.mockClear();
            callCount = 0;

            const { result: result2 } = renderHook(() => useUpAndDownSimulation(mockRng));
            const secondDistances = [...result2.current.distances];

            expect(firstDistances).toEqual(secondDistances);
        });
    });
});
