import { useState, useCallback } from 'react';
import { pickWeightedDistances, getExpectedMakes } from '../assets/pgaPuttingBenchmarks';

export type SimulationPhase = 'in-progress' | 'complete';
const TOTAL_HOLES = 18;

export function usePuttingSimulation(rng?: () => number) {
    const [phase, setPhase] = useState<SimulationPhase>('in-progress');
    const [distances, setDistances] = useState<number[]>(() => pickWeightedDistances(TOTAL_HOLES, rng));
    const [results, setResults] = useState<boolean[]>([]);

    const start = useCallback(() => {
        setDistances(pickWeightedDistances(TOTAL_HOLES, rng));
        setResults([]);
        setPhase('in-progress');
    }, [rng]);

    const recordPutt = useCallback((made: boolean) => {
        setResults((prev) => {
            if (prev.length >= TOTAL_HOLES) return prev;
            const next = [...prev, made];
            if (next.length >= TOTAL_HOLES) setPhase('complete');
            return next;
        });
    }, []);

    const reset = useCallback(() => {
        setDistances(pickWeightedDistances(TOTAL_HOLES, rng));
        setResults([]);
        setPhase('in-progress');
    }, [rng]);

    const holeNumber = results.length + 1;
    const currentDistance = phase === 'in-progress' ? distances[results.length] : undefined;
    const makesCount = results.filter(Boolean).length;
    const isComplete = phase === 'complete';
    const expectedTourMakes = distances.length === TOTAL_HOLES ? getExpectedMakes(distances) : 0;

    return {
        phase,
        distances,
        results,
        start,
        recordPutt,
        reset,
        holeNumber,
        currentDistance,
        makesCount,
        isComplete,
        expectedTourMakes,
        totalHoles: TOTAL_HOLES,
    };
}
