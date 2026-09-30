import { useReducer, useCallback } from 'react';

export type SimulationPhase = 'in-progress' | 'complete';
const MIN_LEVEL = 4;
const MAX_LEVEL = 10;

interface State {
    phase: SimulationPhase;
    currentLevel: number;
    totalAttempts: number;
    levelReached: number;
}

type Action =
    | { type: 'recordMake' }
    | { type: 'recordMiss' }
    | { type: 'finish' }
    | { type: 'reset' };

function reducer(state: State, action: Action): State {
    switch (action.type) {
        case 'recordMake': {
            const nextLevel = Math.min(state.currentLevel + 1, MAX_LEVEL);
            return {
                ...state,
                currentLevel: nextLevel,
                totalAttempts: state.totalAttempts + 1,
            };
        }
        case 'recordMiss': {
            return {
                ...state,
                totalAttempts: state.totalAttempts + 1,
            };
        }
        case 'finish': {
            return {
                ...state,
                phase: 'complete',
                levelReached: state.currentLevel,
            };
        }
        case 'reset': {
            return {
                phase: 'in-progress',
                currentLevel: MIN_LEVEL,
                totalAttempts: 0,
                levelReached: 0,
            };
        }
        default:
            return state;
    }
}

export function useShortPuttingLadderSimulation() {
    const [state, dispatch] = useReducer(reducer, {
        phase: 'in-progress',
        currentLevel: MIN_LEVEL,
        totalAttempts: 0,
        levelReached: 0,
    });

    const recordMake = useCallback(() => {
        dispatch({ type: 'recordMake' });
    }, []);

    const recordMiss = useCallback(() => {
        dispatch({ type: 'recordMiss' });
    }, []);

    const finish = useCallback(() => {
        dispatch({ type: 'finish' });
    }, []);

    const reset = useCallback(() => {
        dispatch({ type: 'reset' });
    }, []);

    const isComplete = state.phase === 'complete';

    return {
        phase: state.phase,
        currentLevel: state.currentLevel,
        totalAttempts: state.totalAttempts,
        levelReached: state.levelReached,
        recordMake,
        recordMiss,
        finish,
        reset,
        isComplete,
        minLevel: MIN_LEVEL,
        maxLevel: MAX_LEVEL,
    };
}
