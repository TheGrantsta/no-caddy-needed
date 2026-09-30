import { renderHook, act } from '@testing-library/react-native';
import { useLagPuttingSimulation } from '../../hooks/useLagPuttingSimulation';

describe('useLagPuttingSimulation', () => {
    describe('initialization', () => {
        it('initializes in in-progress phase', () => {
            const { result } = renderHook(() => useLagPuttingSimulation());
            expect(result.current.phase).toBe('in-progress');
        });

        it('starts at putt 1', () => {
            const { result } = renderHook(() => useLagPuttingSimulation());
            expect(result.current.puttNumber).toBe(1);
        });

        it('starts with empty results', () => {
            const { result } = renderHook(() => useLagPuttingSimulation());
            expect(result.current.results).toEqual([]);
        });

        it('is not complete initially', () => {
            const { result } = renderHook(() => useLagPuttingSimulation());
            expect(result.current.isComplete).toBe(false);
        });
    });

    describe('putt 1 handling', () => {
        it('restarts if putt 1 is short of Tee 2', () => {
            const { result } = renderHook(() => useLagPuttingSimulation());

            act(() => {
                result.current.recordShortOfPrevious();
            });

            expect(result.current.phase).toBe('in-progress');
            expect(result.current.puttNumber).toBe(1);
            expect(result.current.results).toEqual([]);
        });

        it('advances to putt 2 if putt 1 reaches Tee 2', () => {
            const { result } = renderHook(() => useLagPuttingSimulation());

            act(() => {
                result.current.recordInWindow();
            });

            expect(result.current.puttNumber).toBe(2);
            expect(result.current.results).toEqual([1]);
        });
    });

    describe('putt 2+ handling', () => {
        it('continues if putt is in window and past previous', () => {
            const { result } = renderHook(() => useLagPuttingSimulation());

            act(() => {
                result.current.recordInWindow(); // putt 1
                result.current.recordInWindow(); // putt 2
            });

            expect(result.current.puttNumber).toBe(3);
            expect(result.current.results).toEqual([1, 1]);
        });

        it('ends drill if putt is short of previous', () => {
            const { result } = renderHook(() => useLagPuttingSimulation());

            act(() => {
                result.current.recordInWindow(); // putt 1
                result.current.recordShortOfPrevious(); // putt 2
            });

            expect(result.current.phase).toBe('complete');
            expect(result.current.score).toBe(1);
        });

        it('ends drill if putt goes beyond Tee 3', () => {
            const { result } = renderHook(() => useLagPuttingSimulation());

            act(() => {
                result.current.recordInWindow(); // putt 1
                result.current.recordPastTee3(); // putt 2
            });

            expect(result.current.phase).toBe('complete');
            expect(result.current.score).toBe(1);
        });
    });

    describe('score calculation', () => {
        it('calculates score as number of successful putts', () => {
            const { result } = renderHook(() => useLagPuttingSimulation());

            act(() => {
                result.current.recordInWindow(); // putt 1
                result.current.recordInWindow(); // putt 2
                result.current.recordInWindow(); // putt 3
                result.current.recordShortOfPrevious(); // putt 4 - ends
            });

            expect(result.current.score).toBe(3);
        });

        it('handles maximum sequence', () => {
            const { result } = renderHook(() => useLagPuttingSimulation());

            for (let i = 0; i < 6; i++) {
                act(() => {
                    result.current.recordInWindow();
                });
            }

            expect(result.current.puttNumber).toBe(7);
            expect(result.current.score).toBe(6);
        });
    });

    describe('reset()', () => {
        it('returns to in-progress at putt 1 with empty results', () => {
            const { result } = renderHook(() => useLagPuttingSimulation());

            act(() => {
                result.current.recordInWindow();
                result.current.recordInWindow();
                result.current.recordShortOfPrevious();
            });

            act(() => {
                result.current.reset();
            });

            expect(result.current.phase).toBe('in-progress');
            expect(result.current.puttNumber).toBe(1);
            expect(result.current.results).toEqual([]);
        });
    });

    describe('isComplete', () => {
        it('is true only after drill ends', () => {
            const { result } = renderHook(() => useLagPuttingSimulation());

            expect(result.current.isComplete).toBe(false);

            act(() => {
                result.current.recordInWindow();
            });

            expect(result.current.isComplete).toBe(false);

            act(() => {
                result.current.recordShortOfPrevious();
            });

            expect(result.current.isComplete).toBe(true);
        });
    });
});
