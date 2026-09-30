import { useState, useCallback } from 'react';
import { SimulationPhase, clampValue } from '../utils/simulationState';

export function useLagPuttingSimulation() {
    const [phase, setPhase] = useState<SimulationPhase>('in-progress');
    const [score, setScore] = useState(0);

    const setScoreAndComplete = useCallback((value: number) => {
        setScore(clampValue(value, 0, 15));
    }, []);

    const submit = useCallback(() => {
        setPhase('complete');
    }, []);

    const reset = useCallback(() => {
        setPhase('in-progress');
        setScore(0);
    }, []);

    const isComplete = phase === 'complete';

    return {
        phase,
        score,
        setScore: setScoreAndComplete,
        submit,
        reset,
        isComplete,
    };
}
