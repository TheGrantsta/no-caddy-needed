import { useReducer, useCallback } from 'react';
import { SimulationPhase, clampValue, writeAtIndex } from '../utils/simulationState';
import { getExpectedMakes } from '../assets/pgaPuttingBenchmarks';
const TOTAL_HOLES = 18;
const BASE_DISTANCES = [3, 8, 40, 14, 2, 5, 33, 16, 24, 9, 18, 52, 2, 28, 6, 4, 11, 21];

function shuffleDistances(rng?: () => number): number[] {
    const distances = [...BASE_DISTANCES];
    const randomFn = rng || Math.random;

    // Fisher-Yates shuffle
    for (let i = distances.length - 1; i > 0; i--) {
        const j = Math.floor(randomFn() * (i + 1));
        [distances[i], distances[j]] = [distances[j], distances[i]];
    }

    return distances;
}

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
            const clamped = clampValue(action.count, 1, 5);
            const newPutts = writeAtIndex(state.putts, action.hole - 1, clamped);
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
            const newPutts = writeAtIndex(state.putts, state.holeNumber - 1, state.currentPutts);
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
            const newPutts = writeAtIndex(state.putts, state.holeNumber - 1, state.currentPutts);
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
        distances: shuffleDistances(rng),
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
        dispatch({ type: 'reset', distances: shuffleDistances(rng) });
    }, [rng]);

    const reset = useCallback(() => {
        dispatch({ type: 'reset', distances: shuffleDistances(rng) });
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
