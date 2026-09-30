import { useReducer, useCallback } from 'react';
import { shuffleDistances } from '../assets/upAndDownDistances';

export type SimulationPhase = 'in-progress' | 'complete';
const TOTAL_HOLES = 9;

interface State {
    phase: SimulationPhase;
    distances: number[];
    holeNumber: number;
    shots: number[];
    currentShots: number;
}

type Action =
    | { type: 'setShots'; count: number; hole: number }
    | { type: 'goToNextHole' }
    | { type: 'goToPreviousHole' }
    | { type: 'reset'; distances: number[] };

function reducer(state: State, action: Action): State {
    switch (action.type) {
        case 'setShots': {
            const clamped = Math.max(1, Math.min(4, action.count));
            const newShots = [...state.shots];
            newShots[action.hole - 1] = clamped;
            return {
                ...state,
                shots: newShots,
                currentShots: clamped,
            };
        }
        case 'goToNextHole': {
            const nextHole = state.holeNumber + 1;
            if (nextHole > TOTAL_HOLES) {
                return {
                    ...state,
                    phase: 'complete',
                };
            }
            const newShots = [...state.shots];
            newShots[state.holeNumber - 1] = state.currentShots;
            return {
                ...state,
                holeNumber: nextHole,
                shots: newShots,
                currentShots: newShots[nextHole - 1] || 1,
            };
        }
        case 'goToPreviousHole': {
            if (state.holeNumber <= 1) return state;
            const prevHole = state.holeNumber - 1;
            const newShots = [...state.shots];
            newShots[state.holeNumber - 1] = state.currentShots;
            return {
                ...state,
                holeNumber: prevHole,
                shots: newShots,
                currentShots: newShots[prevHole - 1],
            };
        }
        case 'reset': {
            return {
                phase: 'in-progress',
                distances: action.distances,
                holeNumber: 1,
                shots: new Array(TOTAL_HOLES).fill(1),
                currentShots: 1,
            };
        }
        default:
            return state;
    }
}

export function useUpAndDownSimulation(rng?: () => number) {
    const [state, dispatch] = useReducer(reducer, {
        phase: 'in-progress',
        distances: shuffleDistances(rng),
        holeNumber: 1,
        shots: new Array(TOTAL_HOLES).fill(1),
        currentShots: 1,
    });

    const setShots = useCallback((count: number) => {
        dispatch({ type: 'setShots', count, hole: state.holeNumber });
    }, [state.holeNumber]);

    const goToNextHole = useCallback(() => {
        dispatch({ type: 'goToNextHole' });
    }, []);

    const goToPreviousHole = useCallback(() => {
        dispatch({ type: 'goToPreviousHole' });
    }, []);

    const start = useCallback(() => {
        dispatch({ type: 'reset', distances: shuffleDistances(rng) });
    }, [rng]);

    const reset = useCallback(() => {
        dispatch({ type: 'reset', distances: shuffleDistances(rng) });
    }, [rng]);

    const currentDistance = state.distances[state.holeNumber - 1];
    const upAndDownCount = state.shots.slice(0, state.holeNumber - 1).filter((s) => s <= 2).length;
    const completedHoles = state.holeNumber - 1;
    const successPercentage = completedHoles > 0 ? Math.round((upAndDownCount / completedHoles) * 100) : 0;
    const isComplete = state.phase === 'complete';

    return {
        phase: state.phase,
        distances: state.distances,
        shots: state.shots,
        start,
        setShots,
        goToNextHole,
        goToPreviousHole,
        reset,
        holeNumber: state.holeNumber,
        currentDistance,
        currentShots: state.currentShots,
        upAndDownCount,
        successPercentage,
        isComplete,
        totalHoles: TOTAL_HOLES,
    };
}
