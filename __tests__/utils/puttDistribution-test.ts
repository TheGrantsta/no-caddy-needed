import { getPuttCategory, shuffleWithoutAdjacentCategories } from '../../utils/puttDistribution';

describe('puttDistribution', () => {
  describe('getPuttCategory', () => {
    it('shouldClassifyShortPutts', () => {
      expect(getPuttCategory(2)).toBe('short');
      expect(getPuttCategory(6)).toBe('short');
    });

    it('shouldClassifyMediumPutts', () => {
      expect(getPuttCategory(8)).toBe('medium');
      expect(getPuttCategory(14)).toBe('medium');
      expect(getPuttCategory(18)).toBe('medium');
    });

    it('shouldClassifyLongPutts', () => {
      expect(getPuttCategory(21)).toBe('long');
      expect(getPuttCategory(40)).toBe('long');
    });
  });

  describe('shuffleWithoutAdjacentCategories', () => {
    it('shouldReturnSameMultiset', () => {
      const distances = [3, 8, 40, 14, 2, 5, 33, 16, 24, 9, 18, 52, 2, 28, 6, 4, 11, 21];
      const rng = jest.fn(() => 0.5);

      const result = shuffleWithoutAdjacentCategories(distances, rng);

      expect(result).toHaveLength(18);
      expect(result.sort((a, b) => a - b)).toEqual(distances.sort((a, b) => a - b));
    });

    it('shouldNotPlaceTwoAdjacentShortsWithConstantRng', () => {
      const distances = [3, 8, 40, 14, 2, 5, 33, 16, 24, 9, 18, 52, 2, 28, 6, 4, 11, 21];
      const rng = jest.fn(() => 0.5);

      const result = shuffleWithoutAdjacentCategories(distances, rng);

      for (let i = 0; i < result.length - 1; i++) {
        const cat1 = getPuttCategory(result[i]);
        const cat2 = getPuttCategory(result[i + 1]);
        expect(cat1).not.toBe(cat2);
      }
    });

    it('shouldNotPlaceTwoAdjacentWithRandomRng', () => {
      const distances = [3, 8, 40, 14, 2, 5, 33, 16, 24, 9, 18, 52, 2, 28, 6, 4, 11, 21];

      // Run 50 times with different rngs
      for (let run = 0; run < 50; run++) {
        const seed = run;
        let state = seed;
        const lcgRng = () => {
          state = (state * 1103515245 + 12345) % (2 ** 31);
          return Math.abs(state) / (2 ** 31);
        };

        const result = shuffleWithoutAdjacentCategories(distances, lcgRng);

        for (let i = 0; i < result.length - 1; i++) {
          const cat1 = getPuttCategory(result[i]);
          const cat2 = getPuttCategory(result[i + 1]);
          expect(cat1).not.toBe(cat2);
        }
      }
    });

    it('shouldBeDeterministicForSameRngSequence', () => {
      const distances = [3, 8, 40, 14, 2, 5, 33, 16, 24, 9, 18, 52, 2, 28, 6, 4, 11, 21];

      let callCount1 = 0;
      const rng1 = () => {
        const vals = [0.1, 0.5, 0.9, 0.2, 0.7, 0.3, 0.8, 0.4, 0.6, 0.1, 0.5, 0.9, 0.2, 0.7, 0.3, 0.8, 0.4, 0.6];
        const val = vals[callCount1 % vals.length];
        callCount1++;
        return val;
      };

      const result1 = shuffleWithoutAdjacentCategories(distances, rng1);

      let callCount2 = 0;
      const rng2 = () => {
        const vals = [0.1, 0.5, 0.9, 0.2, 0.7, 0.3, 0.8, 0.4, 0.6, 0.1, 0.5, 0.9, 0.2, 0.7, 0.3, 0.8, 0.4, 0.6];
        const val = vals[callCount2 % vals.length];
        callCount2++;
        return val;
      };

      const result2 = shuffleWithoutAdjacentCategories(distances, rng2);

      expect(result1).toEqual(result2);
    });

    it('shouldHandleUnarrangeableInputGracefully', () => {
      const allShorts = [2, 2, 3, 4, 5, 6, 2, 3, 4, 5, 6, 2, 3, 4, 5, 6, 2, 3];
      const rng = jest.fn(() => 0.5);

      const result = shuffleWithoutAdjacentCategories(allShorts, rng);

      expect(result).toHaveLength(18);
      expect(result.sort((a, b) => a - b)).toEqual(allShorts.sort((a, b) => a - b));
    });
  });
});
