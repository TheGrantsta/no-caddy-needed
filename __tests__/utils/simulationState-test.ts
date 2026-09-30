import { clampValue, writeAtIndex, SimulationPhase } from '../../utils/simulationState';

describe('clampValue', () => {
    it('clamps value above max', () => {
        expect(clampValue(10, 1, 5)).toBe(5);
    });

    it('clamps value below min', () => {
        expect(clampValue(0, 1, 5)).toBe(1);
    });

    it('returns value when within range', () => {
        expect(clampValue(3, 1, 5)).toBe(3);
    });

    it('returns value when at min boundary', () => {
        expect(clampValue(1, 1, 5)).toBe(1);
    });

    it('returns value when at max boundary', () => {
        expect(clampValue(5, 1, 5)).toBe(5);
    });
});

describe('writeAtIndex', () => {
    it('returns a new array (does not mutate input)', () => {
        const original = [1, 2, 3];
        const result = writeAtIndex(original, 1, 99);

        expect(result).not.toBe(original);
        expect(original).toEqual([1, 2, 3]);
    });

    it('writes value at given index', () => {
        const arr = [1, 2, 3, 4, 5];
        const result = writeAtIndex(arr, 2, 99);

        expect(result).toEqual([1, 2, 99, 4, 5]);
    });

    it('works at index 0', () => {
        const arr = [1, 2, 3];
        const result = writeAtIndex(arr, 0, 99);

        expect(result).toEqual([99, 2, 3]);
    });

    it('works at last index', () => {
        const arr = [1, 2, 3];
        const result = writeAtIndex(arr, 2, 99);

        expect(result).toEqual([1, 2, 99]);
    });

    it('works on sparse/undersized arrays', () => {
        const arr = new Array(5).fill(2);
        const result = writeAtIndex(arr, 3, 99);

        expect(result).toEqual([2, 2, 2, 99, 2]);
    });
});

describe('SimulationPhase type', () => {
    it('type is exported', () => {
        const phase: SimulationPhase = 'in-progress';
        expect(phase).toBe('in-progress');
    });

    it('accepts complete phase', () => {
        const phase: SimulationPhase = 'complete';
        expect(phase).toBe('complete');
    });
});
