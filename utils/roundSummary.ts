// Builds the "Round saved" summary from a finished round's stored data.

export type SummaryPlayer = { Id: number; PlayerName: string };
export type SummaryHoleScore = { RoundPlayerId: number; HoleNumber: number; Score: number };
export type SummaryPutting = { hole: number; firstPutt?: number; secondPutt?: number; greenInRegulation: boolean };
export type SummarySins = Record<string, number>;

type Input = {
    courseName: string;
    players: SummaryPlayer[];
    holeScores: SummaryHoleScore[];
    putting: SummaryPutting[];
    sins: SummarySins;
    isScoreOnly: boolean;
};

// Shown in this order; double bogeys and bogeys on par 5s only appear when they happened
const SIN_ROWS: { label: string; key: string; alwaysShow: boolean }[] = [
    { label: 'Trouble off tee', key: 'TroubleOffTee', alwaysShow: true },
    { label: 'Penalties', key: 'Penalties', alwaysShow: true },
    { label: '3-putts', key: 'ThreePutts', alwaysShow: true },
    { label: 'Bogeys inside 9-iron', key: 'BogeysInside9Iron', alwaysShow: true },
    { label: 'Double chips', key: 'DoubleChips', alwaysShow: true },
    { label: 'Double bogeys', key: 'DoubleBogeys', alwaysShow: false },
    { label: 'Bogeys on par 5s', key: 'BogeysPar5', alwaysShow: false },
];

export const buildRoundSummary = ({ courseName, players, holeScores, putting, sins, isScoreOnly }: Input) => {
    const strokes = players.map(player => ({
        playerId: player.Id,
        name: player.PlayerName,
        strokes: holeScores
            .filter(h => h.RoundPlayerId === player.Id)
            .reduce((sum, h) => sum + h.Score, 0),
    }));

    const holesPlayed = new Set(holeScores.map(h => h.HoleNumber)).size;

    // Putts: one for each first putt, plus one for each second putt entered
    const putts = putting.reduce(
        (sum, p) => sum + (p.firstPutt !== undefined ? 1 : 0) + (p.secondPutt !== undefined ? 1 : 0),
        0,
    );

    const rows = SIN_ROWS
        .map(row => ({ label: row.label, count: sins[row.key] ?? 0, alwaysShow: row.alwaysShow }))
        .filter(row => row.alwaysShow || row.count > 0)
        .map(({ label, count }) => ({ label, count, muted: count === 0 }));

    return {
        courseName,
        holesPlayed,
        subtitle: `${courseName} · ${holesPlayed} holes · Today`,
        strokes,
        putting: isScoreOnly ? null : {
            putts,
            greensInRegulation: putting.filter(p => p.greenInRegulation).length,
            holes: holesPlayed,
        },
        sins: isScoreOnly ? null : {
            rows,
            total: rows.reduce((sum, row) => sum + row.count, 0),
        },
    };
};

export type RoundSummary = ReturnType<typeof buildRoundSummary>;
