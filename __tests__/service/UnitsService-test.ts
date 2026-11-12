import { yardsToDisplayUnit, displayUnitToYards, distanceUnitLabel, _DistanceUnit } from '../../service/UnitsService';

describe('UnitsService', () => {
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

	describe('distanceUnitLabel', () => {
		it('returns yd for yards', () => {
			expect(distanceUnitLabel('yards')).toBe('yd');
		});

		it('returns m for metres', () => {
			expect(distanceUnitLabel('metres')).toBe('m');
		});
	});
});
