import {
    saveScorecardEditsService,
    scorecardChangesFor,
    HoleEditInput,
} from '../../service/ScorecardEditService';
import {
    updateScorecardService,
    replaceHoleDeadlySinsService,
    replaceHoleSinDetailsService,
    deleteHoleSinDetailsService,
    insertPuttingStatsService,
    updateRoundStartTimeService,
} from '../../service/DbService';

jest.mock('../../service/DbService', () => ({
    updateScorecardService: jest.fn(),
    replaceHoleDeadlySinsService: jest.fn(),
    replaceHoleSinDetailsService: jest.fn(),
    deleteHoleSinDetailsService: jest.fn(),
    insertPuttingStatsService: jest.fn(),
    updateRoundStartTimeService: jest.fn(),
}));

const mockUpdateScorecard = updateScorecardService as jest.Mock;
const mockReplaceSins = replaceHoleDeadlySinsService as jest.Mock;
const mockReplaceSinDetails = replaceHoleSinDetailsService as jest.Mock;
const mockDeleteSinDetails = deleteHoleSinDetailsService as jest.Mock;
const mockInsertPutting = insertPuttingStatsService as jest.Mock;
const mockUpdateStartTime = updateRoundStartTimeService as jest.Mock;

const NO_SINS = { threePutts: false, doubleBogeys: false, bogeysPar5: false, bogeysInside9Iron: false, doubleChips: false, troubleOffTee: false, penalties: false };

const score = (Id: number, HoleNumber: number, Score: number, HolePar = 4) =>
    ({ Id, HoleNumber, Score, HolePar, RoundPlayerId: 1 }) as any;

const noHoleEdit: HoleEditInput = {
    holeNumber: null,
    sins: null,
    sinDetails: {},
    hadPriorSinDetails: false,
    puttingStats: null,
};

const holeEdit = (overrides: Partial<HoleEditInput> = {}): HoleEditInput => ({
    ...noHoleEdit,
    holeNumber: 3,
    sins: NO_SINS,
    ...overrides,
});

const save = (overrides: Partial<Parameters<typeof saveScorecardEditsService>[0]> = {}) =>
    saveScorecardEditsService({
        roundId: 7,
        original: [score(1, 1, 4)],
        edited: [score(1, 1, 4)],
        hole: noHoleEdit,
        newStartTime: null,
        ...overrides,
    });

describe('ScorecardEditService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockUpdateScorecard.mockResolvedValue(true);
        mockReplaceSins.mockResolvedValue(true);
        mockReplaceSinDetails.mockResolvedValue(true);
        mockDeleteSinDetails.mockResolvedValue(true);
        mockInsertPutting.mockResolvedValue(true);
        mockUpdateStartTime.mockResolvedValue(true);
    });

    describe('scorecardChangesFor', () => {
        it('shouldReturnOnlyTheScoresThatChanged', () => {
            const original = [score(1, 1, 4), score(2, 2, 5)];
            const edited = [score(1, 1, 4), score(2, 2, 6)];

            expect(scorecardChangesFor(original, edited).changes).toEqual([{ id: 2, score: 6 }]);
        });

        it('shouldReturnOneParChangePerHoleEvenWhenTwoPlayersShareTheHole', () => {
            const original = [score(1, 1, 4, 4), score(2, 1, 4, 4)];
            const edited = [score(1, 1, 4, 5), score(2, 1, 4, 5)];

            expect(scorecardChangesFor(original, edited).parChanges).toEqual([{ holeNumber: 1, holePar: 5 }]);
        });

        it('shouldReturnNothingWhenNothingChanged', () => {
            const scores = [score(1, 1, 4)];

            expect(scorecardChangesFor(scores, scores)).toEqual({ changes: [], parChanges: [] });
        });
    });

    describe('saveScorecardEditsService', () => {
        it('shouldSaveScoreChangesAndReturnSaved', async () => {
            const result = await save({ original: [score(1, 1, 4)], edited: [score(1, 1, 5)] });

            expect(mockUpdateScorecard).toHaveBeenCalledWith(7, [{ id: 1, score: 5 }], []);
            expect(result).toBe('saved');
        });

        it('shouldReturnFailedAndWriteNothingElseWhenTheScoreUpdateFails', async () => {
            mockUpdateScorecard.mockResolvedValue(false);

            const result = await save({
                edited: [score(1, 1, 5)],
                hole: holeEdit({ puttingStats: { firstPutt: 10, secondIsLong: false, greenInRegulation: false } }),
                newStartTime: new Date('2026-05-01T09:00:00'),
            });

            expect(result).toBe('failed');
            expect(mockInsertPutting).not.toHaveBeenCalled();
            expect(mockReplaceSins).not.toHaveBeenCalled();
            expect(mockUpdateStartTime).not.toHaveBeenCalled();
        });

        it('shouldReplaceTheHoleSinsWhenAHoleIsBeingEdited', async () => {
            const sins = { ...NO_SINS, threePutts: true };

            await save({ hole: holeEdit({ holeNumber: 3, sins }) });

            expect(mockReplaceSins).toHaveBeenCalledWith(7, 3, sins);
        });

        it('shouldSaveSinDetailsWhenASinNeedsOne', async () => {
            const sins = { ...NO_SINS, penalties: true };

            await save({
                hole: holeEdit({
                    holeNumber: 3,
                    sins,
                    sinDetails: { penaltyType: 'Water', troubleOffTeeClub: '7-iron' },
                }),
            });

            expect(mockReplaceSinDetails).toHaveBeenCalledWith(7, 3, {
                troubleOffTeeClub: '7-iron',
                penaltyType: 'Water',
                bogeysInside9IronClub: undefined,
                doubleChipsReason: undefined,
            });
            expect(mockDeleteSinDetails).not.toHaveBeenCalled();
        });

        it('shouldDeletePriorSinDetailsWhenNoSinNeedsThemAnymore', async () => {
            await save({ hole: holeEdit({ holeNumber: 3, sins: NO_SINS, hadPriorSinDetails: true }) });

            expect(mockDeleteSinDetails).toHaveBeenCalledWith(7, 3);
            expect(mockReplaceSinDetails).not.toHaveBeenCalled();
        });

        it('shouldNotDeleteSinDetailsWhenThereWereNoPriorOnes', async () => {
            await save({ hole: holeEdit({ holeNumber: 3, sins: NO_SINS, hadPriorSinDetails: false }) });

            expect(mockDeleteSinDetails).not.toHaveBeenCalled();
        });

        it('shouldSavePuttingStatsWithGreenInRegulation', async () => {
            await save({
                hole: holeEdit({
                    holeNumber: 3,
                    puttingStats: { firstPutt: 20, secondPutt: 3, secondIsLong: true, greenInRegulation: true },
                }),
            });

            expect(mockInsertPutting).toHaveBeenCalledWith(7, 3, 20, 3, true, undefined, undefined, true);
        });

        it('shouldStoreAMissingSecondPuttAsZeroMeaningNoSecondPutt', async () => {
            await save({
                hole: holeEdit({
                    holeNumber: 3,
                    puttingStats: { firstPutt: 20, secondIsLong: false, greenInRegulation: false },
                }),
            });

            expect(mockInsertPutting).toHaveBeenCalledWith(7, 3, 20, 0, false, undefined, undefined, false);
        });

        it('shouldBlockTheSaveWithMissingFirstPuttAndWriteNothing', async () => {
            const result = await save({
                edited: [score(1, 1, 5)],
                hole: holeEdit({ puttingStats: { secondPutt: 3, secondIsLong: false, greenInRegulation: false } }),
            });

            expect(result).toBe('missing-first-putt');
            expect(mockUpdateScorecard).not.toHaveBeenCalled();
            expect(mockInsertPutting).not.toHaveBeenCalled();
        });

        it('shouldUpdateTheRoundStartTimeWhenADateWasPicked', async () => {
            const date = new Date('2026-05-01T09:00:00');

            await save({ newStartTime: date });

            expect(mockUpdateStartTime).toHaveBeenCalledWith(7, date);
        });

        it('shouldLeaveTheStartTimeAloneWhenNoDateWasPicked', async () => {
            await save({ newStartTime: null });

            expect(mockUpdateStartTime).not.toHaveBeenCalled();
        });

        it('shouldOnlyUpdateScoresWhenNoHoleWasOpened', async () => {
            await save({ hole: noHoleEdit });

            expect(mockReplaceSins).not.toHaveBeenCalled();
            expect(mockInsertPutting).not.toHaveBeenCalled();
            expect(mockUpdateScorecard).toHaveBeenCalled();
        });
    });
});
