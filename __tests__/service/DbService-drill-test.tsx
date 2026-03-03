import { insertDrillResultService, getAllDrillHistoryService } from '../../service/DbService';
import { insertDrillResult, getAllDrillHistory } from '../../database/db';

jest.mock('../../database/db', () => ({
    insertDrillResult: jest.fn(),
    getAllDrillHistory: jest.fn(),
}));

const mockInsertDrillResult = insertDrillResult as jest.Mock;
const mockGetAllDrillHistory = getAllDrillHistory as jest.Mock;

describe('insertDrillResultService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('callsInsertDrillResultWithNameAndTrueResult', () => {
        mockInsertDrillResult.mockReturnValue(true);

        insertDrillResultService('Putting - Gate', true);

        expect(mockInsertDrillResult).toHaveBeenCalledWith('Putting - Gate', true);
    });

    it('callsInsertDrillResultWithFalseResult', () => {
        mockInsertDrillResult.mockReturnValue(false);

        insertDrillResultService('Chipping - Hoop', false);

        expect(mockInsertDrillResult).toHaveBeenCalledWith('Chipping - Hoop', false);
    });

    it('returnsValueFromDatabase', () => {
        mockInsertDrillResult.mockReturnValue(true);

        const result = insertDrillResultService('Putting - Gate', true);

        expect(result).toBe(true);
    });
});

describe('getAllDrillHistoryService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('returnsEmptyArrayWhenNoHistoryExists', () => {
        mockGetAllDrillHistory.mockReturnValue([]);

        const result = getAllDrillHistoryService();

        expect(result).toEqual([]);
    });

    it('formatsCreatedAtAsDDMM', () => {
        mockGetAllDrillHistory.mockReturnValue([
            { Id: 1, Name: 'Putting - Gate', Result: 1, Created_At: '2025-06-15T10:00:00.000Z' },
        ]);

        const result = getAllDrillHistoryService();

        expect(result[0].Created_At).toBe('15/06');
    });

    it('preservesIdNameAndResultFields', () => {
        mockGetAllDrillHistory.mockReturnValue([
            { Id: 42, Name: 'Chipping - Hoop', Result: 0, Created_At: '2025-03-01T08:00:00.000Z' },
        ]);

        const result = getAllDrillHistoryService();

        expect(result[0].Id).toBe(42);
        expect(result[0].Name).toBe('Chipping - Hoop');
        expect(result[0].Result).toBe(0);
    });

    it('returnsMultipleDrillEntries', () => {
        mockGetAllDrillHistory.mockReturnValue([
            { Id: 1, Name: 'Putting - Gate', Result: 1, Created_At: '2025-06-15T10:00:00.000Z' },
            { Id: 2, Name: 'Chipping - Hoop', Result: 0, Created_At: '2025-07-01T08:00:00.000Z' },
            { Id: 3, Name: 'Pitching - Target', Result: 1, Created_At: '2025-07-02T09:00:00.000Z' },
        ]);

        const result = getAllDrillHistoryService();

        expect(result).toHaveLength(3);
        expect(result[1].Created_At).toBe('01/07');
        expect(result[2].Name).toBe('Pitching - Target');
    });
});
