import { yardsToMetres, metresToYards, yardsToDisplayUnit, displayUnitToYards, extractDistanceAndUnit, DistanceUnit, METRES_PER_YARD } from '../../service/UnitsService';

describe('UnitsService', () => {
	describe('yardsToMetres', () => {
		it('converts 100 yards to metres', () => {
			expect(yardsToMetres(100)).toBe(100 * METRES_PER_YARD);
		});

		it('returns approximately 91.44 for 100 yards', () => {
			const result = yardsToMetres(100);
			expect(result).toBeCloseTo(91.44, 2);
		});

		it('handles zero', () => {
			expect(yardsToMetres(0)).toBe(0);
		});

		it('handles decimal yards', () => {
			expect(yardsToMetres(50.5)).toBe(50.5 * METRES_PER_YARD);
		});
	});

	describe('metresToYards', () => {
		it('converts 100 metres to yards', () => {
			const result = metresToYards(100);
			expect(result).toBeCloseTo(109.36, 2);
		});

		it('handles zero', () => {
			expect(metresToYards(0)).toBe(0);
		});

		it('is the inverse of yardsToMetres (within rounding)', () => {
			const yards = 75;
			const metres = yardsToMetres(yards);
			const backToYards = metresToYards(metres);
			expect(backToYards).toBeCloseTo(yards, 0);
		});
	});

	describe('yardsToDisplayUnit', () => {
		it('returns rounded yards when unit is yards', () => {
			expect(yardsToDisplayUnit(100, 'yards')).toBe(100);
		});

		it('returns rounded metres when unit is metres', () => {
			expect(yardsToDisplayUnit(100, 'metres')).toBe(91);
		});

		it('rounds 91.44 metres down to 91', () => {
			expect(yardsToDisplayUnit(100, 'metres')).toBe(91);
		});

		it('rounds correctly for .5 case', () => {
			const yards = 54.5; // 54.5 * 0.9144 = 49.8318, rounds to 50
			expect(yardsToDisplayUnit(yards, 'metres')).toBe(50);
		});

		it('handles zero', () => {
			expect(yardsToDisplayUnit(0, 'yards')).toBe(0);
			expect(yardsToDisplayUnit(0, 'metres')).toBe(0);
		});
	});

	describe('displayUnitToYards', () => {
		it('returns the same value when unit is yards (identity)', () => {
			expect(displayUnitToYards(100, 'yards')).toBe(100);
		});

		it('converts metres to yards', () => {
			expect(displayUnitToYards(91, 'metres')).toBe(100);
		});

		it('round-trips 100 yards to 91 metres back to 100 yards', () => {
			const original = 100;
			const displayed = yardsToDisplayUnit(original, 'metres');
			const roundTrip = displayUnitToYards(displayed, 'metres');
			expect(roundTrip).toBe(original);
		});

		it('handles zero', () => {
			expect(displayUnitToYards(0, 'yards')).toBe(0);
			expect(displayUnitToYards(0, 'metres')).toBe(0);
		});

		it('rounds correctly when converting from metres', () => {
			expect(displayUnitToYards(50, 'metres')).toBe(55);
		});
	});

	describe('extractDistanceAndUnit', () => {
		it('extracts yards from transcript', () => {
			const result = extractDistanceAndUnit('97 yards');
			expect(result).toEqual({ value: 97, unit: 'yards' });
		});

		it('extracts metres from transcript', () => {
			const result = extractDistanceAndUnit('91 metres');
			expect(result).toEqual({ value: 91, unit: 'metres' });
		});

		it('extracts meter (american spelling)', () => {
			const result = extractDistanceAndUnit('91 meters');
			expect(result).toEqual({ value: 91, unit: 'metres' });
		});

		it('extracts singular yard', () => {
			const result = extractDistanceAndUnit('1 yard');
			expect(result).toEqual({ value: 1, unit: 'yards' });
		});

		it('extracts singular metre', () => {
			const result = extractDistanceAndUnit('1 metre');
			expect(result).toEqual({ value: 1, unit: 'metres' });
		});

		it('extracts number and unit from a complex transcript', () => {
			const result = extractDistanceAndUnit('okay um I think it is 85 yards away');
			expect(result).toEqual({ value: 85, unit: 'yards' });
		});

		it('returns null for a bare number without a unit word', () => {
			const result = extractDistanceAndUnit('97');
			expect(result).toBeNull();
		});

		it('returns null when no number is found', () => {
			const result = extractDistanceAndUnit('can you repeat that');
			expect(result).toBeNull();
		});

		it('returns null for a unit word without a number', () => {
			const result = extractDistanceAndUnit('yards please');
			expect(result).toBeNull();
		});

		it('is case-insensitive', () => {
			const result = extractDistanceAndUnit('85 YARDS');
			expect(result).toEqual({ value: 85, unit: 'yards' });
		});

		it('extracts the last number-unit pair if multiple exist', () => {
			const result = extractDistanceAndUnit('between 50 and 100 yards');
			expect(result).toEqual({ value: 100, unit: 'yards' });
		});
	});
});
