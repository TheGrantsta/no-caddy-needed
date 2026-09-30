import { useReducer, useCallback } from 'react';
import { pickWeightedDistances, getExpectedMakes } from '../assets/pgaPuttingBenchmarks';

export type SimulationPhase = 'in-progress' | 'complete';
const TOTAL_HOLES = 18;

interface State {
    phase: SimulationPhase;
    distances: number[];
    holeNumber: number;
    putts: number[];
    currentPutts: number;
}

type Action =
    | { type: 'setPutts'; count: number; hole: number }
    | { type: 'goToNextHole' }
    | { type: 'goToPreviousHole' }
    | { type: 'reset'; distances: number[] };

function reducer(state: State, action: Action): State {
    switch (action.type) {
        case 'setPutts': {
            const clamped = Math.max(1, Math.min(5, action.count));
            const newPutts = [...state.putts];
            newPutts[action.hole - 1] = clamped;
            return {
                ...state,
                putts: newPutts,
                currentPutts: clamped,
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
            const newPutts = [...state.putts];
            newPutts[state.holeNumber - 1] = state.currentPutts;
            return {
                ...state,
                holeNumber: nextHole,
                putts: newPutts,
                currentPutts: newPutts[nextHole - 1] || 1,
            };
        }
        case 'goToPreviousHole': {
            if (state.holeNumber <= 1) return state;
            const prevHole = state.holeNumber - 1;
            const newPutts = [...state.putts];
            newPutts[state.holeNumber - 1] = state.currentPutts;
            return {
                ...state,
                holeNumber: prevHole,
                putts: newPutts,
                currentPutts: newPutts[prevHole - 1],
            };
        }
        case 'reset': {
            return {
                phase: 'in-progress',
                distances: action.distances,
                holeNumber: 1,
                putts: new Array(TOTAL_HOLES).fill(1),
                currentPutts: 1,
            };
        }
        default:
            return state;
    }
}

export function usePuttingSimulation(rng?: () => number) {
    const [state, dispatch] = useReducer(reducer, {
        phase: 'in-progress',
        distances: pickWeightedDistances(TOTAL_HOLES, rng),
        holeNumber: 1,
        putts: new Array(TOTAL_HOLES).fill(1),
        currentPutts: 1,
    });

    const setPutts = useCallback((count: number) => {
        dispatch({ type: 'setPutts', count, hole: state.holeNumber });
    }, [state.holeNumber]);

    const goToNextHole = useCallback(() => {
        dispatch({ type: 'goToNextHole' });
    }, []);

    const goToPreviousHole = useCallback(() => {
        dispatch({ type: 'goToPreviousHole' });
    }, []);

    const start = useCallback(() => {
        dispatch({ type: 'reset', distances: pickWeightedDistances(TOTAL_HOLES, rng) });
    }, [rng]);

    const reset = useCallback(() => {
        dispatch({ type: 'reset', distances: pickWeightedDistances(TOTAL_HOLES, rng) });
    }, [rng]);

    const currentDistance = state.distances[state.holeNumber - 1];
    const makesCount = state.putts.slice(0, state.holeNumber - 1).filter((p) => p === 1).length;
    const isComplete = state.phase === 'complete';
    const expectedTourMakes = state.distances.length === TOTAL_HOLES ? getExpectedMakes(state.distances) : 0;

    return {
        phase: state.phase,
        distances: state.distances,
        putts: state.putts,
        start,
        setPutts,
        goToNextHole,
        goToPreviousHole,
        reset,
        holeNumber: state.holeNumber,
        currentDistance,
        currentPutts: state.currentPutts,
        makesCount,
        isComplete,
        expectedTourMakes,
        totalHoles: TOTAL_HOLES,
    };
}
