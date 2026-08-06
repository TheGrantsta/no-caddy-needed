import * as FileSystem from 'expo-file-system/legacy';
import {
    getAllRoundHistoryService,
    getAllDeadlySinsRoundsService,
    getPuttingMakeRatesService,
    getPuttingProximityService,
    getClubDistancesService,
    getWedgeChartService,
    getAllDrillHistoryService,
    getAllHoleSinDetailsService,
    getAllRoundHoleScoresDetailService,
    getAllHoleDeadlySinsDetailService,
    getAllPuttingStatsDetailService,
    Round,
    DeadlySinsRound,
    PuttingMakeRate,
    PuttingProximity,
    ClubDistance,
    WedgeChartData,
    HoleSinDetails,
    RoundHoleScoreDetail,
    HoleDeadlySinsDetail,
    PuttingStatDetail,
} from './DbService';

export type StatsExportPayload = {
    generatedAt: string;
    roundHistory: Round[];
    deadlySinsRounds: DeadlySinsRound[];
    puttingMakeRates: PuttingMakeRate[];
    puttingProximity: PuttingProximity[];
    clubDistances: ClubDistance[];
    wedgeChart: WedgeChartData;
    drillHistory: any[];
    holeSinDetails: HoleSinDetails[];
    roundHoleScores: RoundHoleScoreDetail[];
    holeDeadlySins: HoleDeadlySinsDetail[];
    puttingStats: PuttingStatDetail[];
};

const COACHING_PROMPT = `You are a golf coach. I've exported all my golf statistics from my practice companion app. Please analyze my data and provide a focused practice plan.

For each of the top 3 weaknesses ranked by impact on my score:
1. Identify the specific weakness
2. Explain why it's costing me strokes
3. Recommend 2-3 targeted drills to improve this area
4. Estimate the potential score improvement

Also identify any positive trends or strengths to maintain.

The data below contains my complete round history with hole-by-hole scoring, deadly sins (3-putts, doubles, etc.), putting statistics with distances, and practice drill results.`;

export const buildStatsExportPayload = (): StatsExportPayload => {
    return {
        generatedAt: new Date().toISOString(),
        roundHistory: getAllRoundHistoryService(),
        deadlySinsRounds: getAllDeadlySinsRoundsService(),
        puttingMakeRates: getPuttingMakeRatesService(),
        puttingProximity: getPuttingProximityService(),
        clubDistances: getClubDistancesService(),
        wedgeChart: getWedgeChartService(),
        drillHistory: getAllDrillHistoryService(),
        holeSinDetails: getAllHoleSinDetailsService(),
        roundHoleScores: getAllRoundHoleScoresDetailService(),
        holeDeadlySins: getAllHoleDeadlySinsDetailService(),
        puttingStats: getAllPuttingStatsDetailService(),
    };
};

export const formatStatsExportText = (payload: StatsExportPayload): string => {
    return `${COACHING_PROMPT}\n\n---\n\n${JSON.stringify(payload, null, 2)}`;
};

export const writeStatsExportFile = async (text: string): Promise<string> => {
    const fileUri = `${FileSystem.cacheDirectory}no-caddy-needed-stats-export.txt`;
    await FileSystem.writeAsStringAsync(fileUri, text);
    return fileUri;
};
