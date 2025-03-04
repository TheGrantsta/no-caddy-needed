import {
    getWedgeChart,
    insertWedgeChart,
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
    insertWedgeChart(wedgeChart);
};
