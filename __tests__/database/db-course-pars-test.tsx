import { getHoleParsForCourse, initialize } from '../../database/db';
import * as SQLite from 'expo-sqlite';

const mockExecAsync = jest.fn();
const mockGetAllSync = jest.fn();
const mockExecSync = jest.fn();

jest.mock('expo-sqlite', () => ({
    openDatabaseAsync: jest.fn(() => Promise.resolve({
        execAsync: mockExecAsync,
        getAllSync: mockGetAllSync,
        execSync: mockExecSync,
    })),
    openDatabaseSync: jest.fn(() => ({ getAllSync: mockGetAllSync, execSync: mockExecSync })),
}));

beforeAll(async () => {
    mockGetAllSync.mockReturnValue([]);
    mockExecAsync.mockResolvedValue(undefined);
    await initialize();
});

describe('getHoleParsForCourse', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('queriesRoundHoleScoresWithSubqueryForMostRecentCompletedRound', () => {
        mockGetAllSync.mockReturnValue([]);
        getHoleParsForCourse('St Andrews');
        const [sql] = mockGetAllSync.mock.calls[0];
        expect(sql).toContain('RoundHoleScores');
        expect(sql).toContain('IsCompleted = 1');
        expect(sql).toContain('ORDER BY Id DESC LIMIT 1');
    });

    it('passesCoursNameAsQueryParameter', () => {
        mockGetAllSync.mockReturnValue([]);
        getHoleParsForCourse('Augusta');
        const [, params] = mockGetAllSync.mock.calls[0];
        expect(params).toEqual(['Augusta']);
    });

    it('returnsEmptyArrayWhenNoPriorRoundForCourse', () => {
        mockGetAllSync.mockReturnValue([]);
        const result = getHoleParsForCourse('Unknown Course');
        expect(result).toEqual([]);
    });

    it('returnsHoleParRowsForMatchingCourse', () => {
        const mockRows = [
            { HoleNumber: 1, HolePar: 3 },
            { HoleNumber: 2, HolePar: 5 },
        ];
        mockGetAllSync.mockReturnValue(mockRows);
        const result = getHoleParsForCourse('St Andrews');
        expect(result).toEqual(mockRows);
    });

    it('matchesCourseNameCaseInsensitivelyAndTrimsWhitespace', () => {
        mockGetAllSync.mockReturnValue([]);
        getHoleParsForCourse('st andrews');
        const [sql] = mockGetAllSync.mock.calls[0];
        expect(sql).toContain('LOWER(TRIM(CourseName))');
        expect(sql).toContain('LOWER(TRIM(?))');
    });
});
