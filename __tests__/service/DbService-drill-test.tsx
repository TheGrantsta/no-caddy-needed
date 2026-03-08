import { insertDrillResultService, getAllDrillHistoryService, getDrillsByCategoryService, insertDrillService, deleteDrillService, restoreDrillService } from '../../service/DbService';
import { insertDrillResult, getAllDrillHistory, getDrillsByCategory, insertDrill, softDeleteDrill, restoreDrill } from '../../database/db';

jest.mock('../../database/db', () => ({
    insertDrillResult: jest.fn(),
    getAllDrillHistory: jest.fn(),
    getDrillsByCategory: jest.fn(),
    insertDrill: jest.fn(),
    softDeleteDrill: jest.fn(),
    restoreDrill: jest.fn(),
}));

const mockInsertDrillResult = insertDrillResult as jest.Mock;
const mockGetAllDrillHistory = getAllDrillHistory as jest.Mock;
const mockGetDrillsByCategory = getDrillsByCategory as jest.Mock;
const mockInsertDrill = insertDrill as jest.Mock;
const mockSoftDeleteDrill = softDeleteDrill as jest.Mock;
const mockRestoreDrill = restoreDrill as jest.Mock;

describe('insertDrillResultService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('callsInsertDrillResultWithNameAndTrueResult', () => {
        mockInsertDrillResult.mockReturnValue(true);

        insertDrillResultService('Putting - Gate', true, null);

        expect(mockInsertDrillResult).toHaveBeenCalledWith('Putting - Gate', true, null);
    });

    it('callsInsertDrillResultWithFalseResult', () => {
        mockInsertDrillResult.mockReturnValue(false);

        insertDrillResultService('Chipping - Hoop', false, null);

        expect(mockInsertDrillResult).toHaveBeenCalledWith('Chipping - Hoop', false, null);
    });

    it('forwardsDrillIdToInsertDrillResult', () => {
        mockInsertDrillResult.mockReturnValue(true);

        insertDrillResultService('Putting - Gate', true, 5);

        expect(mockInsertDrillResult).toHaveBeenCalledWith('Putting - Gate', true, 5);
    });

    it('defaultsToNullDrillIdWhenNotProvided', () => {
        mockInsertDrillResult.mockReturnValue(true);

        insertDrillResultService('Putting - Gate', true);

        expect(mockInsertDrillResult).toHaveBeenCalledWith('Putting - Gate', true, null);
    });

    it('returnsValueFromDatabase', () => {
        mockInsertDrillResult.mockReturnValue(true);

        const result = insertDrillResultService('Putting - Gate', true, null);

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

describe('getDrillsByCategoryService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('callsGetDrillsByCategoryWithCategory', () => {
        mockGetDrillsByCategory.mockReturnValue([]);

        getDrillsByCategoryService('putting');

        expect(mockGetDrillsByCategory).toHaveBeenCalledWith('putting');
    });

    it('returnsEmptyArrayWhenNoDrillsExist', () => {
        mockGetDrillsByCategory.mockReturnValue([]);

        const result = getDrillsByCategoryService('putting');

        expect(result).toEqual([]);
    });

    it('mapsDbRowToDrillData', () => {
        mockGetDrillsByCategory.mockReturnValue([{
            Id: 7,
            Category: 'putting',
            Label: 'Gate',
            IconName: 'data-array',
            Target: '8 / 10',
            Objective: 'improve accuracy',
            SetUp: 'place two tees',
            HowToPlay: 'ten putts',
        }]);

        const result = getDrillsByCategoryService('putting');

        expect(result[0].id).toBe(7);
        expect(result[0].label).toBe('Gate');
        expect(result[0].iconName).toBe('data-array');
        expect(result[0].target).toBe('8 / 10');
        expect(result[0].objective).toBe('improve accuracy');
        expect(result[0].setup).toBe('place two tees');
        expect(result[0].howToPlay).toBe('ten putts');
    });

    it('returnsMultipleRows', () => {
        mockGetDrillsByCategory.mockReturnValue([
            { Id: 1, Category: 'putting', Label: 'Gate', IconName: 'data-array', Target: '8 / 10', Objective: 'o', SetUp: 's', HowToPlay: 'h' },
            { Id: 2, Category: 'putting', Label: 'Ladder', IconName: 'sort', Target: '10 / 12', Objective: 'o', SetUp: 's', HowToPlay: 'h' },
        ]);

        const result = getDrillsByCategoryService('putting');

        expect(result).toHaveLength(2);
        expect(result[1].id).toBe(2);
    });
});

describe('insertDrillService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('delegatesToInsertDrillWithAllFields', async () => {
        mockInsertDrill.mockResolvedValue(true);

        await insertDrillService('putting', 'Gate', 'golf-course', '8/10', 'Obj', 'Setup', 'HowToPlay');

        expect(mockInsertDrill).toHaveBeenCalledWith('putting', 'Gate', 'golf-course', '8/10', 'Obj', 'Setup', 'HowToPlay');
    });

    it('returnsTrueOnSuccess', async () => {
        mockInsertDrill.mockResolvedValue(true);

        const result = await insertDrillService('putting', 'Gate', 'golf-course', '8/10', 'Obj', 'Setup', 'HowToPlay');

        expect(result).toBe(true);
    });

    it('returnsFalseOnFailure', async () => {
        mockInsertDrill.mockResolvedValue(false);

        const result = await insertDrillService('putting', 'Gate', 'golf-course', '8/10', 'Obj', 'Setup', 'HowToPlay');

        expect(result).toBe(false);
    });
});

describe('deleteDrillService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('callsSoftDeleteDrillWithId', async () => {
        mockSoftDeleteDrill.mockResolvedValue(true);

        await deleteDrillService(7);

        expect(mockSoftDeleteDrill).toHaveBeenCalledWith(7);
    });

    it('returnsTrueOnSuccess', async () => {
        mockSoftDeleteDrill.mockResolvedValue(true);

        const result = await deleteDrillService(7);

        expect(result).toBe(true);
    });

    it('returnsFalseOnFailure', async () => {
        mockSoftDeleteDrill.mockResolvedValue(false);

        const result = await deleteDrillService(7);

        expect(result).toBe(false);
    });
});

describe('restoreDrillService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('callsRestoreDrillWithId', async () => {
        mockRestoreDrill.mockResolvedValue(true);

        await restoreDrillService(7);

        expect(mockRestoreDrill).toHaveBeenCalledWith(7);
    });

    it('returnsTrueOnSuccess', async () => {
        mockRestoreDrill.mockResolvedValue(true);

        const result = await restoreDrillService(7);

        expect(result).toBe(true);
    });

    it('returnsFalseOnFailure', async () => {
        mockRestoreDrill.mockResolvedValue(false);

        const result = await restoreDrillService(7);

        expect(result).toBe(false);
    });
});
