import { useState, useCallback, useRef } from 'react';
import { pickWeightedDistances, getExpectedMakes } from '../assets/pgaPuttingBenchmarks';

export type SimulationPhase = 'intro' | 'in-progress' | 'complete';
const TOTAL_HOLES = 18;

export function usePuttingSimulation(rng?: () => number) {
    const [phase, setPhase] = useState<SimulationPhase>('intro');
    const [distances, setDistances] = useState<number[]>([]);
    const [results, setResults] = useState<boolean[]>([]);
    const hasStartedRef = useRef(false);

    const start = useCallback(() => {
        hasStartedRef.current = true;
        setDistances(pickWeightedDistances(TOTAL_HOLES, rng));
        setResults([]);
        setPhase('in-progress');
    }, [rng]);

    const recordPutt = useCallback((made: boolean) => {
        setResults((prev) => {
            // Only record if we've started and we haven't filled all 18 holes
            if (!hasStartedRef.current || prev.length >= TOTAL_HOLES) return prev;
            const next = [...prev, made];
            if (next.length >= TOTAL_HOLES) setPhase('complete');
            return next;
        });
    }, []);

    const reset = useCallback(() => {
        hasStartedRef.current = false;
        setPhase('intro');
        setDistances([]);
        setResults([]);
    }, []);

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
