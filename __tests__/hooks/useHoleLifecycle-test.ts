import { renderHook, act } from '@testing-library/react-native';
import { useHoleLifecycle } from '../../hooks/useHoleLifecycle';

describe('useHoleLifecycle', () => {
    describe('initialization', () => {
        it('initializes with default state', () => {
            const { result } = renderHook(() => useHoleLifecycle());

            expect(result.current.currentHole).toBe(1);
            expect(result.current.holePhase).toBe('score');
            expect(result.current.skipStatsFlow).toBe(false);
        });
    });

    describe('phase transitions', () => {
        it('transitions from score to stats when advancing', () => {
            const { result } = renderHook(() => useHoleLifecycle());

            act(() => {
                result.current.setHolePhase('stats');
            });

            expect(result.current.holePhase).toBe('stats');
        });

        it('transitions back to score from stats', () => {
            const { result } = renderHook(() => useHoleLifecycle());

            act(() => {
                result.current.setHolePhase('stats');
            });

            act(() => {
                result.current.setHolePhase('score');
            });

            expect(result.current.holePhase).toBe('score');
        });

        it('transitions from stats to sinDetails when sins exist', () => {
            const { result } = renderHook(() => useHoleLifecycle());

            act(() => {
                result.current.setDeadlySinsValues({ threePutts: true, doubleBogeys: false, bogeysPar5: false, bogeysInside9Iron: false, doubleChips: false, troubleOffTee: false, penalties: false });
                result.current.setHolePhase('sinDetails');
            });

            expect(result.current.holePhase).toBe('sinDetails');
        });
    });

    describe('hole progression', () => {
        it('increments hole number', () => {
            const { result } = renderHook(() => useHoleLifecycle());

            act(() => {
                result.current.advanceHole();
            });

            expect(result.current.currentHole).toBe(2);
        });

        it('stops at hole 18', () => {
            const { result } = renderHook(() => useHoleLifecycle());

            act(() => {
                for (let i = 0; i < 20; i++) {
                    result.current.advanceHole();
                }
            });

            expect(result.current.currentHole).toBe(18);
        });

        it('decrements hole number', () => {
            const { result } = renderHook(() => useHoleLifecycle());

            act(() => {
                result.current.advanceHole();
                result.current.advanceHole();
            });

            act(() => {
                result.current.goBackHole();
            });

            expect(result.current.currentHole).toBe(2);
        });

        it('stops at hole 1 when going back', () => {
            const { result } = renderHook(() => useHoleLifecycle());

            act(() => {
                result.current.goBackHole();
                result.current.goBackHole();
            });

            expect(result.current.currentHole).toBe(1);
        });
    });

    describe('deadly sins state', () => {
        it('updates deadly sins values', () => {
            const { result } = renderHook(() => useHoleLifecycle());
            const newSins = {
                threePutts: true,
                doubleBogeys: true,
                bogeysPar5: false,
                bogeysInside9Iron: false,
                doubleChips: false,
                troubleOffTee: false,
                penalties: false,
            };

            act(() => {
                result.current.setDeadlySinsValues(newSins);
            });

            expect(result.current.deadlySinsValues).toEqual(newSins);
        });

        it('resets deadly sins on hole advance', () => {
            const { result } = renderHook(() => useHoleLifecycle());

            act(() => {
                result.current.setDeadlySinsValues({
                    threePutts: true,
                    doubleBogeys: true,
                    bogeysPar5: false,
                    bogeysInside9Iron: false,
                    doubleChips: false,
                    troubleOffTee: false,
                    penalties: false,
                });
                result.current.resetForNewHole();
            });

            expect(result.current.deadlySinsValues).toEqual({
                threePutts: false,
                doubleBogeys: false,
                bogeysPar5: false,
                bogeysInside9Iron: false,
                doubleChips: false,
                troubleOffTee: false,
                penalties: false,
            });
        });
    });

    describe('putting stats state', () => {
        it('updates putting stats', () => {
            const { result } = renderHook(() => useHoleLifecycle());
            const stats = { firstPutt: 20, secondPutt: undefined, secondIsLong: false };

            act(() => {
                result.current.setPuttingStats(stats);
            });

            expect(result.current.puttingStats).toEqual(stats);
        });

        it('validates first putt is set', () => {
            const { result } = renderHook(() => useHoleLifecycle());

            act(() => {
                result.current.validatePuttingStats(null);
            });

            expect(result.current.puttingFirstPuttError).toBe(true);
        });

        it('validates second putt required for three putts', () => {
            const { result } = renderHook(() => useHoleLifecycle());

            act(() => {
                result.current.setDeadlySinsValues({
                    threePutts: true,
                    doubleBogeys: false,
                    bogeysPar5: false,
                    bogeysInside9Iron: false,
                    doubleChips: false,
                    troubleOffTee: false,
                    penalties: false,
                });
            });

            act(() => {
                result.current.validatePuttingStats({ firstPutt: 20, secondPutt: undefined, secondIsLong: false });
            });

            expect(result.current.puttingSecondPuttRequiredError).toBe(true);
        });
    });

    describe('sin details state', () => {
        it('updates trouble off tee club', () => {
            const { result } = renderHook(() => useHoleLifecycle());

            act(() => {
                result.current.setSelectedOffTeeClub('Driver');
            });

            expect(result.current.selectedOffTeeClub).toBe('Driver');
        });

        it('validates required sin details fields', () => {
            const { result } = renderHook(() => useHoleLifecycle());

            act(() => {
                result.current.setDeadlySinsValues({
                    threePutts: false,
                    doubleBogeys: false,
                    bogeysPar5: false,
                    bogeysInside9Iron: false,
                    doubleChips: false,
                    troubleOffTee: true,
                    penalties: false,
                });
            });

            act(() => {
                result.current.validateSinDetails([{ id: 'driver' }], true, false, false, false);
            });

            expect(result.current.sinDetailsClubError).toBe(true);
        });
    });

    describe('reset', () => {
        it('resets all state to initial values', () => {
            const { result } = renderHook(() => useHoleLifecycle());

            act(() => {
                result.current.setHolePhase('putting');
                result.current.advanceHole();
                result.current.setDeadlySinsValues({
                    threePutts: true,
                    doubleBogeys: false,
                    bogeysPar5: false,
                    bogeysInside9Iron: false,
                    doubleChips: false,
                    troubleOffTee: false,
                    penalties: false,
                });
                result.current.resetAll();
            });

            expect(result.current.currentHole).toBe(1);
            expect(result.current.holePhase).toBe('score');
            expect(result.current.deadlySinsValues.threePutts).toBe(false);
        });
    });
});
