import { DOUBLE_CHIP_REASONS } from '../../service/DbService';

describe('DOUBLE_CHIP_REASONS', () => {
    it('shouldOfferWrongShotSelectionBeforeOther', () => {
        expect([...DOUBLE_CHIP_REASONS]).toEqual([
            'Short sided',
            'Chunked',
            'Thinned',
            'Hero shot',
            'Wrong club selection',
            'Wrong shot selection',
            'Other',
        ]);
    });
});
