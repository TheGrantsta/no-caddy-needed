import { getTwoDigitDayAndMonth } from '@/app/DateFormatter';
import {
    getWedgeChart,
    insertDrillResult,
    insertWedgeChart,
    getAllDrillHistory
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
