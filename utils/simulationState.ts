export type SimulationPhase = 'in-progress' | 'complete';

export const clampValue = (value: number, min: number, max: number): number =>
    Math.max(min, Math.min(max, value));

export const writeAtIndex = <T,>(arr: T[], index: number, value: T): T[] => {
    const next = [...arr];
    next[index] = value;
    return next;
};
