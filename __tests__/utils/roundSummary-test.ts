import { buildRoundSummary } from '../../utils/roundSummary';

const players = [
    { Id: 1, RoundId: 5, PlayerName: 'You', IsUser: 1, SortOrder: 0 },
    { Id: 2, RoundId: 5, PlayerName: 'James M', IsUser: 0, SortOrder: 1 },
];

const holeScores = [
    { Id: 1, RoundId: 5, RoundPlayerId: 1, HoleNumber: 1, HolePar: 4, Score: 4 },
    { Id: 2, RoundId: 5, RoundPlayerId: 2, HoleNumber: 1, HolePar: 4, Score: 5 },
    { Id: 3, RoundId: 5, RoundPlayerId: 1, HoleNumber: 2, HolePar: 3, Score: 3 },
    { Id: 4, RoundId: 5, RoundPlayerId: 2, HoleNumber: 2, HolePar: 3, Score: 4 },
];

const putting = [
    { hole: 1, firstPutt: 20, secondPutt: 3, greenInRegulation: true },
    { hole: 2, firstPutt: 8, secondPutt: undefined, greenInRegulation: false },
];

const sins = { TroubleOffTee: 1, Penalties: 0, ThreePutts: 0, BogeysInside9Iron: 0, DoubleChips: 0, DoubleBogeys: 0, BogeysPar5: 0 };

describe('buildRoundSummary', () => {
    it('shouldTotalEachPlayersStrokesAcrossTheRound', () => {
        const summary = buildRoundSummary({ courseName: 'Augusta', players, holeScores, putting, sins, isScoreOnly: false });

        expect(summary.strokes).toEqual([
            { playerId: 1, name: 'You', strokes: 7 },
            { playerId: 2, name: 'James M', strokes: 9 },
        ]);
    });

    it('shouldCountHolesPlayedFromDistinctHoleScores', () => {
        const summary = buildRoundSummary({ courseName: 'Augusta', players, holeScores, putting, sins, isScoreOnly: false });

        expect(summary.holesPlayed).toBe(2);
        expect(summary.subtitle).toBe('Augusta · 2 holes · Today');
    });

    it('shouldCountOnePuttPerFirstPuttPlusOnePerSecondPutt', () => {
        const summary = buildRoundSummary({ courseName: 'Augusta', players, holeScores, putting, sins, isScoreOnly: false });

        expect(summary.putting?.putts).toBe(3);
    });

    it('shouldCountGreensInRegulationAgainstHolesPlayed', () => {
        const summary = buildRoundSummary({ courseName: 'Augusta', players, holeScores, putting, sins, isScoreOnly: false });

        expect(summary.putting?.greensInRegulation).toBe(1);
        expect(summary.putting?.holes).toBe(2);
    });

    it('shouldListMarkedSinsWithCountsAndTheirTotal', () => {
        const summary = buildRoundSummary({ courseName: 'Augusta', players, holeScores, putting, sins, isScoreOnly: false });

        expect(summary.sins?.total).toBe(1);
        expect(summary.sins?.rows[0]).toEqual({ label: 'Trouble off tee', count: 1, muted: false });
        expect(summary.sins?.rows.find(r => r.label === 'Bogeys inside 9-iron')).toEqual({ label: 'Bogeys inside 9-iron', count: 0, muted: true });
    });

    it('shouldOnlyListDoubleBogeysAndPar5BogeysWhenTheyOccurred', () => {
        const summary = buildRoundSummary({ courseName: 'Augusta', players, holeScores, putting, sins, isScoreOnly: false });
        expect(summary.sins?.rows.map(r => r.label)).not.toContain('Double bogeys');
        expect(summary.sins?.rows.map(r => r.label)).not.toContain('Bogeys on par 5s');

        const withDoubles = buildRoundSummary({ courseName: 'Augusta', players, holeScores, putting, sins: { ...sins, DoubleBogeys: 2 }, isScoreOnly: false });
        expect(withDoubles.sins?.rows.map(r => r.label)).toContain('Double bogeys');
    });

    it('shouldOmitPuttingAndSinsForScoreOnlyRounds', () => {
        const summary = buildRoundSummary({ courseName: 'Augusta', players, holeScores, putting: [], sins, isScoreOnly: true });

        expect(summary.putting).toBeNull();
        expect(summary.sins).toBeNull();
        expect(summary.strokes.length).toBe(2);
    });
});
