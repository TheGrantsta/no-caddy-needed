import getTwoDigitDayAndMonth from '@/app/DateFormatter';
import {
    getWedgeChart,
    insertDrillResult,
    insertWedgeChart,
    getAllDrillHistory,
    insertTiger5Round,
    getAllTiger5Rounds
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
