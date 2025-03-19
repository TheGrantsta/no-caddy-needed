import { getRandomNumber } from '../assets/random-number';

describe('Random number generator', () => {
    it('returns number between lower and upper limit in increments of 5', () => {
        const validNumbers = [30, 40];
        const range = '30-40';
        const increment = 5;

        const actual = getRandomNumber(range, increment, 35);

        expect(actual).toBeGreaterThanOrEqual(30);
        expect(actual).toBeLessThanOrEqual(40);
        expect(validNumbers).toContain(actual);
    });

    it('returns number between lower and upper limit in increments of 1', () => {
        const validNumbers = [4, 5, 6, 7, 8];
        const range = '3-8';
        const increment = 1;

        const actual = getRandomNumber(range, increment, 3);

        expect(actual).toBeGreaterThanOrEqual(4);
        expect(actual).toBeLessThanOrEqual(8);
        expect(validNumbers).toContain(actual);
    });

    it('returns number between lower and upper limit in increments of 1 even if upper is supplied first', () => {
        const validNumbers = [4, 5, 6, 7, 8];
        const range = '8-3';
        const increment = 1;

        const actual = getRandomNumber(range, increment, 3);

        expect(actual).toBeGreaterThanOrEqual(4);
        expect(actual).toBeLessThanOrEqual(8);
        expect(validNumbers).toContain(actual);
    });

    it('returns number between lower and upper limit in increments of 1 even if upper limit is negative', () => {
        const validNumbers = [4, 5, 6, 7, 8];
        const range = '3--8';
        const increment = 1;

        const actual = getRandomNumber(range, increment, 3);

        expect(actual).toBeGreaterThanOrEqual(4);
        expect(actual).toBeLessThanOrEqual(8);
        expect(validNumbers).toContain(actual);
    });

    it('returns number between lower and upper limit in increments of 1 even if lower limit is negative', () => {
        const validNumbers = [4, 5, 6, 7, 8];
        const range = '-3-8';
        const increment = 1;

        const actual = getRandomNumber(range, increment, 3);

        expect(actual).toBeGreaterThanOrEqual(4);
        expect(actual).toBeLessThanOrEqual(8);
        expect(validNumbers).toContain(actual);
    });

    it('returns number between lower and upper limit in increments of 1 even if multiple hyphens used', () => {
        const validNumbers = [4, 5, 6, 7, 8];
        const range = '3---8';
        const increment = 1;

        const actual = getRandomNumber(range, increment, 3);

        expect(actual).toBeGreaterThanOrEqual(4);
        expect(actual).toBeLessThanOrEqual(8);
        expect(validNumbers).toContain(actual);
    });

    it('returns number between lower and upper limit in increments of 1 when there is only one number', () => {
        const validNumbers = [1];
        const range = '1-1';
        const increment = 1;

        const actual = getRandomNumber(range, increment, 0);

        expect(actual).toBeGreaterThanOrEqual(1);
        expect(actual).toBeLessThanOrEqual(1);
        expect(actual).toBe(1);
    });

    it('returns nunber that is not the same as the previous random number', () => {
        const expected = 4;
        const range = '2-4';
        const increment = 2;
        const previousNumber = 2;

        const actual = getRandomNumber(range, increment, previousNumber);

        expect(actual).toBe(expected);
    });

    it('returns zero when the random function returns empty list', () => {
        const expected = 0;
        const range = '2-4';
        const increment = 5;
        const previousNumber = 2;

        const actual = getRandomNumber(range, increment, previousNumber);

        expect(actual).toBe(expected);
    });
});