import { getRoundFilterPreferenceService, saveRoundFilterPreferenceService } from '../../service/RoundFilterPreferenceService';
import { getRoundFilterPreference, saveRoundFilterPreference } from '../../database/db';

// The global setup mocks this module; this test exercises the real one
jest.unmock('../../service/RoundFilterPreferenceService');

jest.mock('../../database/db', () => ({
    getRoundFilterPreference: jest.fn(),
    saveRoundFilterPreference: jest.fn(),
}));

const mockGet = getRoundFilterPreference as jest.Mock;
const mockSave = saveRoundFilterPreference as jest.Mock;

describe('getRoundFilterPreferenceService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('shouldReturnAStoredCount', () => {
        mockGet.mockReturnValue('10');

        expect(getRoundFilterPreferenceService()).toBe(10);
    });

    it('shouldReturnAStoredYear', () => {
        mockGet.mockReturnValue('2025');

        expect(getRoundFilterPreferenceService()).toEqual({ year: 2025 });
    });

    it('shouldDefaultToAllWhenNothingIsStored', () => {
        mockGet.mockReturnValue(null);

        expect(getRoundFilterPreferenceService()).toBe('all');
    });

    it('shouldDefaultToAllWhenTheStoredValueIsNotAValidFilter', () => {
        mockGet.mockReturnValue('banana');

        expect(getRoundFilterPreferenceService()).toBe('all');
    });

    it('shouldDefaultToAllWhenReadingTheDatabaseThrows', () => {
        mockGet.mockImplementation(() => { throw new Error('db not ready'); });

        expect(getRoundFilterPreferenceService()).toBe('all');
    });
});

describe('saveRoundFilterPreferenceService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('shouldSaveTheSerialisedFilter', async () => {
        mockSave.mockResolvedValue(true);

        await saveRoundFilterPreferenceService({ year: 2026 });

        expect(mockSave).toHaveBeenCalledWith('2026');
    });

    it('shouldReturnWhetherTheSaveSucceeded', async () => {
        mockSave.mockResolvedValue(false);

        await expect(saveRoundFilterPreferenceService('all')).resolves.toBe(false);
    });
});
