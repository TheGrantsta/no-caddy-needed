import { buildRoundAnalysisPayload } from '../../service/AnalysisService';
import { getMultiplayerScorecardService, getDeadlySinsForRoundService } from '../../service/DbService';

jest.mock('../../service/DbService', () => ({
    getMultiplayerScorecardService: jest.fn(),
    getDeadlySinsForRoundService: jest.fn(),
}));

const mockGetMultiplayerScorecard = getMultiplayerScorecardService as jest.Mock;
const mockGetDeadlySins = getDeadlySinsForRoundService as jest.Mock;

const makeScorecard = (overrides = {}) => ({
    round: { Id: 5, TotalScore: 3, CourseName: 'Test Course', Created_At: '01/01' },
    players: [
        { Id: 1, RoundId: 5, PlayerName: 'User', IsUser: 1, SortOrder: 0 },
        { Id: 2, RoundId: 5, PlayerName: 'Friend', IsUser: 0, SortOrder: 1 },
    ],
    holeScores: [
        { Id: 1, RoundId: 5, RoundPlayerId: 1, HoleNumber: 1, HolePar: 4, Score: 5 },
        { Id: 2, RoundId: 5, RoundPlayerId: 1, HoleNumber: 2, HolePar: 3, Score: 3 },
        { Id: 3, RoundId: 5, RoundPlayerId: 1, HoleNumber: 3, HolePar: 5, Score: 7 },
        { Id: 4, RoundId: 5, RoundPlayerId: 2, HoleNumber: 1, HolePar: 4, Score: 4 },
        { Id: 5, RoundId: 5, RoundPlayerId: 2, HoleNumber: 2, HolePar: 3, Score: 4 },
        { Id: 6, RoundId: 5, RoundPlayerId: 2, HoleNumber: 3, HolePar: 5, Score: 6 },
    ],
    ...overrides,
});

const makeDeadlySins = (overrides = {}) => ({
    Id: 10,
    ThreePutts: 4,
    DoubleBogeys: 3,
    BogeysPar5: 0,
    BogeysInside9Iron: 2,
    DoubleChips: 1,
    TroubleOffTee: 3,
    Penalties: 0,
    Total: 13,
    RoundId: 5,
    Created_At: '01/01',
    ...overrides,
});

describe('buildRoundAnalysisPayload', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('round summary', () => {
        it('returns null when round not found', () => {
            mockGetMultiplayerScorecard.mockReturnValue(null);
            mockGetDeadlySins.mockReturnValue(null);

            const result = buildRoundAnalysisPayload(5);

            expect(result).toBeNull();
        });

        it('sets round_id from roundId param', () => {
            mockGetMultiplayerScorecard.mockReturnValue(makeScorecard());
            mockGetDeadlySins.mockReturnValue(makeDeadlySins());

            const result = buildRoundAnalysisPayload(5);

            expect(result!.round.round_id).toBe('r_5');
        });

        it('computes course_par as sum of unique hole pars', () => {
            mockGetMultiplayerScorecard.mockReturnValue(makeScorecard());
            mockGetDeadlySins.mockReturnValue(makeDeadlySins());

            const result = buildRoundAnalysisPayload(5);

            expect(result!.round.course_par).toBe(12); // 4 + 3 + 5
        });

        it('computes score as total strokes for the user player', () => {
            mockGetMultiplayerScorecard.mockReturnValue(makeScorecard());
            mockGetDeadlySins.mockReturnValue(makeDeadlySins());

            const result = buildRoundAnalysisPayload(5);

            expect(result!.round.score).toBe(15); // 5 + 3 + 7
        });

        it('includes only user player hole scores in holes array', () => {
            mockGetMultiplayerScorecard.mockReturnValue(makeScorecard());
            mockGetDeadlySins.mockReturnValue(makeDeadlySins());

            const result = buildRoundAnalysisPayload(5);

            expect(result!.round.holes).toHaveLength(3);
            expect(result!.round.holes).toEqual([
                { hole: 1, par: 4, score: 5 },
                { hole: 2, par: 3, score: 3 },
                { hole: 3, par: 5, score: 7 },
            ]);
        });

        it('sorts holes by hole number ascending', () => {
            const scorecard = makeScorecard({
                holeScores: [
                    { Id: 3, RoundId: 5, RoundPlayerId: 1, HoleNumber: 3, HolePar: 5, Score: 7 },
                    { Id: 1, RoundId: 5, RoundPlayerId: 1, HoleNumber: 1, HolePar: 4, Score: 5 },
                    { Id: 2, RoundId: 5, RoundPlayerId: 1, HoleNumber: 2, HolePar: 3, Score: 3 },
                ],
            });
            mockGetMultiplayerScorecard.mockReturnValue(scorecard);
            mockGetDeadlySins.mockReturnValue(makeDeadlySins());

            const result = buildRoundAnalysisPayload(5);

            expect(result!.round.holes.map(h => h.hole)).toEqual([1, 2, 3]);
        });
    });

    describe('deadly sins mapping', () => {
        it('maps deadly sins to snake_case payload fields', () => {
            mockGetMultiplayerScorecard.mockReturnValue(makeScorecard());
            mockGetDeadlySins.mockReturnValue(makeDeadlySins());

            const result = buildRoundAnalysisPayload(5);

            expect(result!.round.deadly_sins).toEqual({
                three_putts: 4,
                double_bogeys: 3,
                trouble_off_tee: 3,
                penalties: 0,
                double_chips: 1,
                bogeys_inside_9iron: 2,
                bogeys_par_5: 0,
            });
        });

        it('uses all zeros for deadly sins when no deadly sins record exists', () => {
            mockGetMultiplayerScorecard.mockReturnValue(makeScorecard());
            mockGetDeadlySins.mockReturnValue(null);

            const result = buildRoundAnalysisPayload(5);

            expect(result!.round.deadly_sins).toEqual({
                three_putts: 0,
                double_bogeys: 0,
                trouble_off_tee: 0,
                penalties: 0,
                double_chips: 0,
                bogeys_inside_9iron: 0,
                bogeys_par_5: 0,
            });
        });
    });

    describe('detected_issues', () => {
        it('excludes issues with count of zero', () => {
            mockGetMultiplayerScorecard.mockReturnValue(makeScorecard());
            mockGetDeadlySins.mockReturnValue(makeDeadlySins());

            const result = buildRoundAnalysisPayload(5);

            const types = result!.detected_issues.map(i => i.issue_type);
            expect(types).not.toContain('penalties');
            expect(types).not.toContain('bogeys_par_5');
        });

        it('orders detected_issues by count descending', () => {
            mockGetMultiplayerScorecard.mockReturnValue(makeScorecard());
            mockGetDeadlySins.mockReturnValue(makeDeadlySins());

            const result = buildRoundAnalysisPayload(5);

            const counts = result!.detected_issues.map(i => i.evidence.count);
            expect(counts).toEqual([...counts].sort((a, b) => b - a));
        });

        it('assigns high severity when count is 3 or more', () => {
            mockGetMultiplayerScorecard.mockReturnValue(makeScorecard());
            mockGetDeadlySins.mockReturnValue(makeDeadlySins());

            const result = buildRoundAnalysisPayload(5);

            const highIssues = result!.detected_issues.filter(i => i.severity === 'high');
            expect(highIssues.every(i => i.evidence.count >= 3)).toBe(true);
        });

        it('assigns medium severity when count is less than 3', () => {
            mockGetMultiplayerScorecard.mockReturnValue(makeScorecard());
            mockGetDeadlySins.mockReturnValue(makeDeadlySins());

            const result = buildRoundAnalysisPayload(5);

            const mediumIssues = result!.detected_issues.filter(i => i.severity === 'medium');
            expect(mediumIssues.every(i => i.evidence.count < 3)).toBe(true);
        });

        it('includes evidence count matching the deadly sin value', () => {
            mockGetMultiplayerScorecard.mockReturnValue(makeScorecard());
            mockGetDeadlySins.mockReturnValue(makeDeadlySins());

            const result = buildRoundAnalysisPayload(5);

            const threePutts = result!.detected_issues.find(i => i.issue_type === 'three_putts');
            expect(threePutts!.evidence.count).toBe(4);
        });

        it('includes non-empty possible_causes for each issue', () => {
            mockGetMultiplayerScorecard.mockReturnValue(makeScorecard());
            mockGetDeadlySins.mockReturnValue(makeDeadlySins());

            const result = buildRoundAnalysisPayload(5);

            result!.detected_issues.forEach(issue => {
                expect(issue.possible_causes.length).toBeGreaterThan(0);
            });
        });

        it('returns empty detected_issues when no deadly sins record exists', () => {
            mockGetMultiplayerScorecard.mockReturnValue(makeScorecard());
            mockGetDeadlySins.mockReturnValue(null);

            const result = buildRoundAnalysisPayload(5);

            expect(result!.detected_issues).toEqual([]);
        });

        it('returns empty detected_issues when all deadly sins counts are zero', () => {
            mockGetMultiplayerScorecard.mockReturnValue(makeScorecard());
            mockGetDeadlySins.mockReturnValue(makeDeadlySins({
                ThreePutts: 0, DoubleBogeys: 0, BogeysPar5: 0,
                BogeysInside9Iron: 0, DoubleChips: 0, TroubleOffTee: 0, Penalties: 0, Total: 0,
            }));

            const result = buildRoundAnalysisPayload(5);

            expect(result!.detected_issues).toEqual([]);
        });
    });
});
