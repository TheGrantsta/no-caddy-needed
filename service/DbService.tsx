import getTwoDigitDayAndMonth from '@/app/DateFormatter';
import {
    getWedgeChart,
    insertDrillResult,
    insertWedgeChart,
    getAllDrillHistory,
    insertTiger5Round,
    getAllTiger5Rounds,
    insertRound,
    updateRound,
    insertRoundHole,
    getRoundById,
    getRoundHoles,
    getActiveRound,
    getAllRounds,
    getClubDistances,
    insertClubDistances,
    insertRoundPlayer,
    getRoundPlayers,
    insertRoundHoleScore,
    getRoundHoleScores,
    updateRoundHoleScore,
    updateRoundTotalScore,
} from '../database/db';

export const getWedgeChartService = () => {
    let wedgeChart: any[][] = [];
    const items = getWedgeChart();

    items.forEach((item) => {
        wedgeChart.push([item.Club, item.HalfSwing, item.ThreeQuarterSwing, item.FullSwing]);
    });

    return wedgeChart;
};

export const insertWedgeChartService = (wedgeChart: any) => {
    return insertWedgeChart(wedgeChart);
};

export const insertDrillResultService = (name: any, result: boolean) => {
    return insertDrillResult(name, result);
}

export const getAllDrillHistoryService = () => {
    let history: any[] = [];

    getAllDrillHistory().forEach((drill) => {
        history.push({
            Id: drill.Id,
            Name: drill.Name,
            Result: drill.Result,
            Created_At: getTwoDigitDayAndMonth(drill.Created_At)
        });
    })

    return history;
}

export type DrillStats = {
    name: string;
    total: number;
    met: number;
    successRate: number;
};

export const getDrillStatsByTypeService = (): DrillStats[] => {
    const drills = getAllDrillHistory();
    const statsMap = new Map<string, { total: number; met: number }>();

    drills.forEach((drill) => {
        const name = drill.Name;
        const current = statsMap.get(name) || { total: 0, met: 0 };
        current.total += 1;
        if (drill.Result === 1) {
            current.met += 1;
        }
        statsMap.set(name, current);
    });

    const stats: DrillStats[] = [];
    statsMap.forEach((value, key) => {
        stats.push({
            name: key,
            total: value.total,
            met: value.met,
            successRate: Math.round((value.met / value.total) * 100)
        });
    });

    return stats.sort((a, b) => b.total - a.total);
}

export type Tiger5Round = {
    Id: number;
    ThreePutts: number;
    DoubleBogeys: number;
    BogeysPar5: number;
    BogeysInside9Iron: number;
    DoubleChips: number;
    Total: number;
    Created_At: string;
};

export const insertTiger5RoundService = (threePutts: number, doubleBogeys: number, bogeysPar5: number, bogeysInside9Iron: number, doubleChips: number) => {
    const total = threePutts + doubleBogeys + bogeysPar5 + bogeysInside9Iron + doubleChips;
    return insertTiger5Round(threePutts, doubleBogeys, bogeysPar5, bogeysInside9Iron, doubleChips, total);
};

export const getAllTiger5RoundsService = (): Tiger5Round[] => {
    const rounds: Tiger5Round[] = [];

    getAllTiger5Rounds().forEach((round: any) => {
        rounds.push({
            Id: round.Id,
            ThreePutts: round.ThreePutts,
            DoubleBogeys: round.DoubleBogeys,
            BogeysPar5: round.BogeysPar5,
            BogeysInside9Iron: round.BogeysInside9Iron,
            DoubleChips: round.DoubleChips,
            Total: round.Total,
            Created_At: getTwoDigitDayAndMonth(round.Created_At),
        });
    });

    return rounds;
}

// Round types
export type Round = {
    Id: number;
    CoursePar: number;
    TotalScore: number;
    StartTime: string;
    EndTime: string | null;
    IsCompleted: number;
    Created_At: string;
};

export type RoundHole = {
    Id: number;
    RoundId: number;
    HoleNumber: number;
    ScoreRelativeToPar: number;
};

export type RoundScorecard = {
    round: Round;
    holes: RoundHole[];
};

export type RoundPlayer = {
    Id: number;
    RoundId: number;
    PlayerName: string;
    IsUser: number;
    SortOrder: number;
};

export type RoundHoleScore = {
    Id: number;
    RoundId: number;
    RoundPlayerId: number;
    HoleNumber: number;
    HolePar: number;
    Score: number;
};

export type MultiplayerRoundScorecard = {
    round: Round;
    players: RoundPlayer[];
    holeScores: RoundHoleScore[];
};

export type ClubDistance = {
    Id: number;
    Club: string;
    CarryDistance: number;
    SortOrder: number;
};

// Round services
export const startRoundService = async (coursePar: number): Promise<number | null> => {
    return insertRound(coursePar);
};

export const endRoundService = async (roundId: number): Promise<boolean> => {
    const players = getRoundPlayers(roundId) as RoundPlayer[];

    if (players.length > 0) {
        const holeScores = getRoundHoleScores(roundId) as RoundHoleScore[];
        const userPlayer = players.find(p => p.IsUser === 1);
        const userScores = userPlayer ? holeScores.filter(s => s.RoundPlayerId === userPlayer.Id) : [];
        const totalScore = userScores.reduce((sum, s) => sum + (s.Score - s.HolePar), 0);
        return updateRound(roundId, totalScore);
    }

    const holes: any[] = getRoundHoles(roundId);
    const totalScore = holes.reduce((sum: number, hole: any) => sum + hole.ScoreRelativeToPar, 0);
    return updateRound(roundId, totalScore);
};

export const addHoleScoreService = async (roundId: number, holeNumber: number, scoreRelativeToPar: number): Promise<boolean> => {
    return insertRoundHole(roundId, holeNumber, scoreRelativeToPar);
};

export const getRoundScorecardService = (roundId: number): RoundScorecard | null => {
    const round = getRoundById(roundId) as Round | null;
    if (!round) return null;

    const holes = getRoundHoles(roundId) as RoundHole[];
    return { round, holes };
};

export const getActiveRoundService = (): Round | null => {
    return getActiveRound() as Round | null;
};

export const getAllRoundHistoryService = (): Round[] => {
    const rounds: Round[] = [];

    getAllRounds().forEach((round: any) => {
        rounds.push({
            Id: round.Id,
            CoursePar: round.CoursePar,
            TotalScore: round.TotalScore,
            StartTime: round.StartTime,
            EndTime: round.EndTime,
            IsCompleted: round.IsCompleted,
            Created_At: getTwoDigitDayAndMonth(round.Created_At),
        });
    });

    return rounds;
};

// Multiplayer round services
export const addRoundPlayersService = async (roundId: number, playerNames: string[]): Promise<number[]> => {
    const ids: number[] = [];

    const userId = await insertRoundPlayer(roundId, 'You', 1, 0);
    if (userId === null) return [];
    ids.push(userId);

    for (let i = 0; i < playerNames.length; i++) {
        const playerId = await insertRoundPlayer(roundId, playerNames[i], 0, i + 1);
        if (playerId !== null) {
            ids.push(playerId);
        }
    }

    return ids;
};

export const addMultiplayerHoleScoresService = async (
    roundId: number,
    holeNumber: number,
    holePar: number,
    scores: { playerId: number; playerName: string; score: number }[]
): Promise<boolean> => {
    for (const s of scores) {
        const success = await insertRoundHoleScore(roundId, s.playerId, holeNumber, holePar, s.score);
        if (!success) return false;
    }
    return true;
};

export const getRoundPlayersService = (roundId: number): RoundPlayer[] => {
    return getRoundPlayers(roundId) as RoundPlayer[];
};

export const getMultiplayerScorecardService = (roundId: number): MultiplayerRoundScorecard | null => {
    const round = getRoundById(roundId) as Round | null;
    if (!round) return null;

    const players = getRoundPlayers(roundId) as RoundPlayer[];
    if (players.length === 0) return null;

    const holeScores = getRoundHoleScores(roundId) as RoundHoleScore[];
    return { round, players, holeScores };
};

// Club distance services
export const getClubDistancesService = (): ClubDistance[] => {
    return getClubDistances() as ClubDistance[];
};

export const saveClubDistancesService = async (distances: { Club: string; CarryDistance: number; SortOrder: number }[]): Promise<boolean> => {
    return insertClubDistances(distances);
};

export const updateScorecardService = async (roundId: number, updatedScores: { id: number; score: number }[]): Promise<boolean> => {
    for (const s of updatedScores) {
        const success = await updateRoundHoleScore(s.id, s.score);
        if (!success) return false;
    }

    const players = getRoundPlayers(roundId) as RoundPlayer[];
    const holeScores = getRoundHoleScores(roundId) as RoundHoleScore[];
    const userPlayer = players.find(p => p.IsUser === 1);
    const userScores = userPlayer ? holeScores.filter(s => s.RoundPlayerId === userPlayer.Id) : [];
    const totalScore = userScores.reduce((sum, s) => sum + (s.Score - s.HolePar), 0);

    return updateRoundTotalScore(roundId, totalScore);
};
