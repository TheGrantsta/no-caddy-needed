import * as ExportService from '../../service/ExportService';
import * as DbService from '../../service/DbService';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';

jest.mock('../../service/DbService', () => ({
    getAllRoundHistoryService: jest.fn(),
    getAllDeadlySinsRoundsService: jest.fn(),
    getPuttingMakeRatesService: jest.fn(),
    getPuttingProximityService: jest.fn(),
    getClubDistancesService: jest.fn(),
    getWedgeChartService: jest.fn(),
    getAllDrillHistoryService: jest.fn(),
    getAllHoleSinDetailsService: jest.fn(),
    getAllRoundHoleScoresDetailService: jest.fn(),
    getAllHoleDeadlySinsDetailService: jest.fn(),
    getAllPuttingStatsDetailService: jest.fn(),
}));

jest.mock('expo-file-system/legacy', () => ({
    cacheDirectory: '/cache/',
    writeAsStringAsync: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('expo-sharing', () => ({
    isAvailableAsync: jest.fn().mockResolvedValue(true),
    shareAsync: jest.fn().mockResolvedValue(undefined),
}));

const mockGetAllRoundHistoryService = DbService.getAllRoundHistoryService as jest.Mock;
const mockGetAllDeadlySinsRoundsService = DbService.getAllDeadlySinsRoundsService as jest.Mock;
const mockGetPuttingMakeRatesService = DbService.getPuttingMakeRatesService as jest.Mock;
const mockGetPuttingProximityService = DbService.getPuttingProximityService as jest.Mock;
const mockGetClubDistancesService = DbService.getClubDistancesService as jest.Mock;
const mockGetWedgeChartService = DbService.getWedgeChartService as jest.Mock;
const mockGetAllDrillHistoryService = DbService.getAllDrillHistoryService as jest.Mock;
const mockGetAllHoleSinDetailsService = DbService.getAllHoleSinDetailsService as jest.Mock;
const mockGetAllRoundHoleScoresDetailService = DbService.getAllRoundHoleScoresDetailService as jest.Mock;
const mockGetAllHoleDeadlySinsDetailService = DbService.getAllHoleDeadlySinsDetailService as jest.Mock;
const mockGetAllPuttingStatsDetailService = DbService.getAllPuttingStatsDetailService as jest.Mock;

describe('ExportService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('buildStatsExportPayload', () => {
        it('calls all service functions and returns aggregated payload', () => {
            mockGetAllRoundHistoryService.mockReturnValue([]);
            mockGetAllDeadlySinsRoundsService.mockReturnValue([]);
            mockGetPuttingMakeRatesService.mockReturnValue([]);
            mockGetPuttingProximityService.mockReturnValue([]);
            mockGetClubDistancesService.mockReturnValue([]);
            mockGetWedgeChartService.mockReturnValue({ distanceNames: [], clubs: [] });
            mockGetAllDrillHistoryService.mockReturnValue([]);
            mockGetAllHoleSinDetailsService.mockReturnValue([]);
            mockGetAllRoundHoleScoresDetailService.mockReturnValue([]);
            mockGetAllHoleDeadlySinsDetailService.mockReturnValue([]);
            mockGetAllPuttingStatsDetailService.mockReturnValue([]);

            const payload = ExportService.buildStatsExportPayload();

            expect(mockGetAllRoundHistoryService).toHaveBeenCalledTimes(1);
            expect(mockGetAllDeadlySinsRoundsService).toHaveBeenCalledTimes(1);
            expect(mockGetPuttingMakeRatesService).toHaveBeenCalledTimes(1);
            expect(mockGetPuttingProximityService).toHaveBeenCalledTimes(1);
            expect(mockGetClubDistancesService).toHaveBeenCalledTimes(1);
            expect(mockGetWedgeChartService).toHaveBeenCalledTimes(1);
            expect(mockGetAllDrillHistoryService).toHaveBeenCalledTimes(1);
            expect(mockGetAllHoleSinDetailsService).toHaveBeenCalledTimes(1);
            expect(mockGetAllRoundHoleScoresDetailService).toHaveBeenCalledTimes(1);
            expect(mockGetAllHoleDeadlySinsDetailService).toHaveBeenCalledTimes(1);
            expect(mockGetAllPuttingStatsDetailService).toHaveBeenCalledTimes(1);

            expect(payload).toHaveProperty('generatedAt');
            expect(payload).toHaveProperty('roundHistory');
            expect(payload).toHaveProperty('deadlySinsRounds');
            expect(payload).toHaveProperty('puttingMakeRates');
            expect(payload).toHaveProperty('puttingProximity');
            expect(payload).toHaveProperty('clubDistances');
            expect(payload).toHaveProperty('wedgeChart');
            expect(payload).toHaveProperty('drillHistory');
            expect(payload).toHaveProperty('holeSinDetails');
            expect(payload).toHaveProperty('roundHoleScores');
            expect(payload).toHaveProperty('holeDeadlySins');
            expect(payload).toHaveProperty('puttingStats');
        });

        it('includes data from all services in payload', () => {
            const roundData = [{ Id: 1, CourseName: 'Pine Valley', TotalScore: -5 } as any];
            const drillData = [{ Id: 1, Name: 'Test Drill', Result: 1 } as any];

            mockGetAllRoundHistoryService.mockReturnValue(roundData);
            mockGetAllDeadlySinsRoundsService.mockReturnValue([]);
            mockGetPuttingMakeRatesService.mockReturnValue([]);
            mockGetPuttingProximityService.mockReturnValue([]);
            mockGetClubDistancesService.mockReturnValue([]);
            mockGetWedgeChartService.mockReturnValue({ distanceNames: [], clubs: [] });
            mockGetAllDrillHistoryService.mockReturnValue(drillData);
            mockGetAllHoleSinDetailsService.mockReturnValue([]);
            mockGetAllRoundHoleScoresDetailService.mockReturnValue([]);
            mockGetAllHoleDeadlySinsDetailService.mockReturnValue([]);
            mockGetAllPuttingStatsDetailService.mockReturnValue([]);

            const payload = ExportService.buildStatsExportPayload();

            expect(payload.roundHistory).toEqual(roundData);
            expect(payload.drillHistory).toEqual(drillData);
        });
    });

    describe('formatStatsExportText', () => {
        it('returns coaching prompt followed by JSON data', () => {
            const payload = {
                generatedAt: '2026-08-04T10:00:00Z',
                roundHistory: [],
                deadlySinsRounds: [],
                puttingMakeRates: [],
                puttingProximity: [],
                clubDistances: [],
                wedgeChart: { distanceNames: [], clubs: [] },
                drillHistory: [],
                holeSinDetails: [],
                roundHoleScores: [],
                holeDeadlySins: [],
                puttingStats: [],
            };

            const text = ExportService.formatStatsExportText(payload);

            expect(text).toContain('---');
            const parts = text.split('---');
            expect(parts.length).toBe(2);

            const prompt = parts[0].trim();
            const jsonPart = parts[1].trim();

            expect(prompt.length).toBeGreaterThan(0);
            expect(prompt).toMatch(/weaknesses|analysis|focus|practice/i);

            const parsedJson = JSON.parse(jsonPart);
            expect(parsedJson).toHaveProperty('generatedAt');
            expect(parsedJson).toHaveProperty('roundHistory');
            expect(parsedJson.generatedAt).toEqual('2026-08-04T10:00:00Z');
        });
    });

    describe('writeStatsExportFile', () => {
        it('writes text to cache directory and returns file URI', async () => {
            const mockWriteAsStringAsync = FileSystem.writeAsStringAsync as jest.Mock;
            const testText = 'test content';

            const uri = await ExportService.writeStatsExportFile(testText);

            expect(mockWriteAsStringAsync).toHaveBeenCalledTimes(1);
            expect(mockWriteAsStringAsync.mock.calls[0][0]).toContain('no-caddy-needed-stats-export.txt');
            expect(mockWriteAsStringAsync.mock.calls[0][1]).toEqual(testText);
            expect(uri).toContain('no-caddy-needed-stats-export.txt');
        });
    });
});
