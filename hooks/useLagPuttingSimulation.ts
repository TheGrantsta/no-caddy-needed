import { useState, useCallback } from 'react';

export type SimulationPhase = 'in-progress' | 'complete';

export function useLagPuttingSimulation() {
    const [phase, setPhase] = useState<SimulationPhase>('in-progress');
    const [score, setScore] = useState(0);

    const setScoreAndComplete = useCallback((value: number) => {
        setScore(Math.max(0, Math.min(15, value))); // Clamp 0-15
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
