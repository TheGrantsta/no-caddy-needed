import { describeSequence } from '../../utils/randomSequence';

describe('describeSequence', () => {
    it('shouldListTheFirstThreeNumbersThenAnEllipsisWhenThereAreMore', () => {
        expect(describeSequence('30', '100', '10')).toBe('Numbers from 30 to 100 inclusive, in steps of 10: 30, 40, 50…');
    });

    it('shouldListEveryNumberWithoutEllipsisWhenThereAreThreeOrFewer', () => {
        expect(describeSequence('10', '20', '10')).toBe('Numbers from 10 to 20 inclusive, in steps of 10: 10, 20');
    });

    it('shouldListASingleNumberWhenFromAndToAreEqual', () => {
        expect(describeSequence('15', '15', '5')).toBe('Numbers from 15 to 15 inclusive, in steps of 5: 15');
    });

    it('shouldReturnNullWhenFromIsEmpty', () => {
        expect(describeSequence('', '100', '10')).toBeNull();
    });

    it('shouldReturnNullWhenToIsEmpty', () => {
        expect(describeSequence('30', '', '10')).toBeNull();
    });

    it('shouldReturnNullWhenIncrementIsZeroOrEmpty', () => {
        expect(describeSequence('30', '100', '0')).toBeNull();
        expect(describeSequence('30', '100', '')).toBeNull();
    });

    it('shouldReturnNullWhenFromIsGreaterThanTo', () => {
        expect(describeSequence('100', '30', '10')).toBeNull();
    });
});
