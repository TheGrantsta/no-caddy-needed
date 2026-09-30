import { useReducer, useCallback } from 'react';

export type SimulationPhase = 'in-progress' | 'complete';

interface State {
    phase: SimulationPhase;
    puttNumber: number;
    results: number[]; // 1 = in-window success, values represent putt sequence
}

type Action =
    | { type: 'recordInWindow' }
    | { type: 'recordShortOfPrevious' }
    | { type: 'recordPastTee3' }
    | { type: 'reset' };

function reducer(state: State, action: Action): State {
    switch (action.type) {
        case 'recordInWindow': {
            // Putt 1: must reach Tee 2 (no previous ball to compare)
            if (state.puttNumber === 1) {
                return {
                    ...state,
                    puttNumber: 2,
                    results: [...state.results, 1],
                };
            }
            // Putt 2+: continue sequence
            return {
                ...state,
                puttNumber: state.puttNumber + 1,
                results: [...state.results, 1],
            };
        }
        case 'recordShortOfPrevious': {
            // Putt 1: restart (no score)
            if (state.puttNumber === 1) {
                return state; // Stay at putt 1, results empty
            }
            // Putt 2+: end drill
            return {
                ...state,
                phase: 'complete',
            };
        }
        case 'recordPastTee3': {
            // Only valid for putt 2+
            if (state.puttNumber === 1) {
                return state;
            }
            return {
                ...state,
                phase: 'complete',
            };
        }
        case 'reset': {
            return {
                phase: 'in-progress',
                puttNumber: 1,
                results: [],
            };
        }
        default:
            return state;
    }
}

export function useLagPuttingSimulation() {
    const [state, dispatch] = useReducer(reducer, {
        phase: 'in-progress',
        puttNumber: 1,
        results: [],
    });

    const recordInWindow = useCallback(() => {
        dispatch({ type: 'recordInWindow' });
    }, []);

    const recordShortOfPrevious = useCallback(() => {
        dispatch({ type: 'recordShortOfPrevious' });
    }, []);

    const recordPastTee3 = useCallback(() => {
        dispatch({ type: 'recordPastTee3' });
    }, []);

    const reset = useCallback(() => {
        dispatch({ type: 'reset' });
    }, []);

    const score = state.results.length;
    const isComplete = state.phase === 'complete';

    return {
        phase: state.phase,
        puttNumber: state.puttNumber,
        results: state.results,
        score,
        recordInWindow,
        recordShortOfPrevious,
        recordPastTee3,
        reset,
        isComplete,
    };
}
