import { useReducer, useCallback } from 'react';

export type SimulationPhase = 'in-progress' | 'complete';
const LEVELS = [4, 5, 6, 7, 8, 9, 10]; // 7 levels total
const MIN_LEVEL = 4;
const MAX_LEVEL = 10;

interface State {
    phase: SimulationPhase;
    levelIndex: number; // 0-6 corresponding to levels 4-10
    results: number[]; // attempts at each level (1-10)
    currentResult: number; // pending entry at current level (1-10)
}

type Action =
    | { type: 'setResult'; result: number }
    | { type: 'goToNextLevel' }
    | { type: 'goToPreviousLevel' }
    | { type: 'finish' }
    | { type: 'reset' };

function reducer(state: State, action: Action): State {
    switch (action.type) {
        case 'setResult': {
            const newResults = [...state.results];
            newResults[state.levelIndex] = action.result;
            return {
                ...state,
                results: newResults,
                currentResult: action.result,
            };
        }
        case 'goToNextLevel': {
            if (state.levelIndex >= LEVELS.length - 1) return state;
            const newResults = [...state.results];
            newResults[state.levelIndex] = state.currentResult;
            const nextIndex = state.levelIndex + 1;
            return {
                ...state,
                levelIndex: nextIndex,
                results: newResults,
                currentResult: newResults[nextIndex] || 1,
            };
        }
        case 'goToPreviousLevel': {
            if (state.levelIndex <= 0) return state;
            const newResults = [...state.results];
            newResults[state.levelIndex] = state.currentResult;
            const prevIndex = state.levelIndex - 1;
            return {
                ...state,
                levelIndex: prevIndex,
                results: newResults,
                currentResult: newResults[prevIndex] || 1,
            };
        }
        case 'finish': {
            const finalResults = [...state.results];
            finalResults[state.levelIndex] = state.currentResult;
            const makes = finalResults.filter(r => r === 1).length;
            return {
                ...state,
                phase: 'complete',
                results: finalResults,
            };
        }
        case 'reset': {
            return {
                phase: 'in-progress',
                levelIndex: 0,
                results: [],
                currentResult: 1,
            };
        }
        default:
            return state;
    }
}

export function useShortPuttingLadderSimulation() {
    const [state, dispatch] = useReducer(reducer, {
        phase: 'in-progress',
        levelIndex: 0,
        results: [],
        currentResult: 1,
    });

    const setResult = useCallback((result: 0 | 1) => {
        dispatch({ type: 'setResult', result });
    }, []);

    const goToNextLevel = useCallback(() => {
        dispatch({ type: 'goToNextLevel' });
    }, []);

    const goToPreviousLevel = useCallback(() => {
        dispatch({ type: 'goToPreviousLevel' });
    }, []);

    const finish = useCallback(() => {
        dispatch({ type: 'finish' });
    }, []);

    const reset = useCallback(() => {
        dispatch({ type: 'reset' });
    }, []);

    const currentLevel = LEVELS[state.levelIndex];
    const totalAttempts = state.results.reduce((sum, attempts) => sum + attempts, 0);
    const isComplete = state.phase === 'complete';

    return {
        phase: state.phase,
        levelIndex: state.levelIndex,
        currentLevel,
        currentResult: state.currentResult,
        totalAttempts,
        results: state.results,
        setResult,
        goToNextLevel,
        goToPreviousLevel,
        finish,
        reset,
        isComplete,
        levelCount: LEVELS.length,
    };
}
