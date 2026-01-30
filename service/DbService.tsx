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

// Club distance services
export const getClubDistancesService = (): ClubDistance[] => {
    return getClubDistances() as ClubDistance[];
};

export const saveClubDistancesService = async (distances: { Club: string; CarryDistance: number; SortOrder: number }[]): Promise<boolean> => {
    return insertClubDistances(distances);
};
