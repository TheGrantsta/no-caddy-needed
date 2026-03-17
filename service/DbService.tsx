import getTwoDigitDayAndMonth from '@/app/DateFormatter';
import { DrillData, GameData } from '@/types/ShortGame';
import {
    getWedgeChartDistanceNames,
    getWedgeChartEntries,
    insertWedgeChart,
    insertDrillResult,
    getAllDrillHistory,
    getDrillsByCategory,
    insertDrill,
    softDeleteDrill,
    restoreDrill,
    insertDeadlySinsRound,
    getAllDeadlySinsRounds,
    getDeadlySinsRoundByRoundId,
    insertRound,
    updateRound,
    insertRoundHole,
    getRoundById,
    getRoundHoles,
    getActiveRound,
    getAllRounds,
    getClubDistances,
    insertClubDistances,
    getDistinctCourseNames,
    getDistinctPlayerNames,
    getHolesPlayedForRound,
    insertRoundPlayer,
    getRoundPlayers,
    insertRoundHoleScore,
    getRoundHoleScores,
    updateRoundHoleScore,
    deleteRoundHoleScoresByHole,
    updateRoundTotalScore,
    deleteRound,
    getSettings,
    saveSettings,
    getGamesByCategory,
    insertGame,
    softDeleteGame,
    restoreGame,
    getAllPracticeReminders,
    insertPracticeReminder,
    deletePracticeReminder,
} from '../database/db';

export type WedgeChartClub = {
    club: string;
    distances: { name: string; distance: number }[];
};

export type WedgeChartData = {
    distanceNames: string[];
    clubs: WedgeChartClub[];
};

export const getWedgeChartService = (): WedgeChartData => {
    const nameRows = getWedgeChartDistanceNames() as { Id: number; Name: string; SortOrder: number }[];
    const entryRows = getWedgeChartEntries() as { Id: number; Club: string; DistanceName: string; Distance: number; ClubSortOrder: number; DistanceSortOrder: number }[];

    const distanceNames = nameRows.map(r => r.Name);

    const clubMap = new Map<string, { sortOrder: number; distances: { name: string; distance: number }[] }>();
    for (const entry of entryRows) {
        if (!clubMap.has(entry.Club)) {
            clubMap.set(entry.Club, { sortOrder: entry.ClubSortOrder, distances: [] });
        }
        clubMap.get(entry.Club)!.distances.push({ name: entry.DistanceName, distance: entry.Distance });
    }

    const clubs: WedgeChartClub[] = Array.from(clubMap.entries())
        .sort((a, b) => a[1].sortOrder - b[1].sortOrder)
        .map(([club, data]) => ({ club, distances: data.distances }));

    return { distanceNames, clubs };
};

export const saveWedgeChartService = async (data: WedgeChartData): Promise<boolean> => {
    const distanceNames = data.distanceNames.map((name, i) => ({ Name: name, SortOrder: i + 1 }));
    const entries: { Club: string; DistanceName: string; Distance: number; ClubSortOrder: number; DistanceSortOrder: number }[] = [];

    data.clubs.forEach((club, clubIndex) => {
        club.distances.forEach((d, distIndex) => {
            entries.push({
                Club: club.club,
                DistanceName: d.name,
                Distance: d.distance,
                ClubSortOrder: clubIndex + 1,
                DistanceSortOrder: distIndex + 1,
            });
        });
    });

    return insertWedgeChart(distanceNames, entries);
};

export const insertDrillResultService = (name: string, result: boolean, drillId: number | null = null) => {
    return insertDrillResult(name, result, drillId);
}

export const getDrillsByCategoryService = (category: string): DrillData[] => {
    const rows = getDrillsByCategory(category) as {
        Id: number;
        Category: string;
        Label: string;
        IconName: string;
        Target: string;
        Objective: string;
        SetUp: string;
        HowToPlay: string;
    }[];

    return rows.map(row => ({
        id: row.Id,
        label: row.Label,
        iconName: row.IconName as DrillData['iconName'],
        target: row.Target,
        objective: row.Objective,
        setup: row.SetUp,
        howToPlay: row.HowToPlay,
    }));
};

export const insertDrillService = (category: string, label: string, iconName: string, target: string, objective: string, setUp: string, howToPlay: string): Promise<boolean> => {
    return insertDrill(category, label, iconName, target, objective, setUp, howToPlay);
};

export const deleteDrillService = (id: number): Promise<boolean> => {
    return softDeleteDrill(id);
};

export const restoreDrillService = (id: number): Promise<boolean> => {
    return restoreDrill(id);
};

export const getGamesByCategoryService = (category: string): GameData[] => {
    const rows = getGamesByCategory(category) as {
        Id: number;
        Category: string;
        Header: string;
        Objective: string;
        SetUp: string;
        HowToPlay: string;
    }[];

    return rows.map(row => ({
        id: row.Id,
        header: row.Header,
        objective: row.Objective,
        setup: row.SetUp,
        howToPlay: row.HowToPlay,
    }));
};

export const insertGameService = (category: string, header: string, objective: string, setUp: string, howToPlay: string): Promise<boolean> => {
    return insertGame(category, header, objective, setUp, howToPlay);
};

export const deleteGameService = (id: number): Promise<boolean> => {
    return softDeleteGame(id);
};

export const restoreGameService = (id: number): Promise<boolean> => {
    return restoreGame(id);
};

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

export type DeadlySinsRound = {
    Id: number;
    ThreePutts: number;
    DoubleBogeys: number;
    BogeysPar5: number;
    BogeysInside9Iron: number;
    DoubleChips: number;
    TroubleOffTee: number;
    Penalties: number;
    Total: number;
    RoundId: number | null;
    Created_At: string;
};

export const insertDeadlySinsRoundService = (roundId: number | null, threePutts: number, doubleBogeys: number, bogeysPar5: number, bogeysInside9Iron: number, doubleChips: number, troubleOffTee: number, penalties: number) => {
    const total = threePutts + doubleBogeys + bogeysPar5 + bogeysInside9Iron + doubleChips + troubleOffTee + penalties;
    return insertDeadlySinsRound(roundId, threePutts, doubleBogeys, bogeysPar5, bogeysInside9Iron, doubleChips, troubleOffTee, penalties, total);
};

export const getAllDeadlySinsRoundsService = (): DeadlySinsRound[] => {
    const rounds: DeadlySinsRound[] = [];

    getAllDeadlySinsRounds().filter((round: any) => round.RoundId != null).forEach((round: any) => {
        rounds.push({
            Id: round.Id,
            ThreePutts: round.ThreePutts,
            DoubleBogeys: round.DoubleBogeys,
            BogeysPar5: round.BogeysPar5,
            BogeysInside9Iron: round.BogeysInside9Iron,
            DoubleChips: round.DoubleChips,
            TroubleOffTee: round.TroubleOffTee,
            Penalties: round.Penalties,
            Total: round.Total,
            RoundId: round.RoundId ?? null,
            Created_At: getTwoDigitDayAndMonth(round.Created_At),
        });
    });

    return rounds;
};


// Round types
export type Round = {
    Id: number;
    TotalScore: number;
    StrokeTotal: number | null;
    StartTime: string;
    EndTime: string | null;
    IsCompleted: number;
    CourseName: string | null;
    Created_At: string;
    HolesPlayed: number;
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
    TotalDistance: number;
    SortOrder: number;
};

// Round services
export const startRoundService = async (courseName: string): Promise<number | null> => {
    return insertRound(courseName);
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
    return { round: { ...round, Created_At: getTwoDigitDayAndMonth(round.Created_At) }, holes };
};

export const getActiveRoundService = (): Round | null => {
    return getActiveRound() as Round | null;
};

export const getAllRoundHistoryService = (): Round[] => {
    const rounds: Round[] = [];

    getAllRounds().forEach((round: any) => {
        const players = getRoundPlayers(round.Id) as RoundPlayer[];
        const userPlayer = players.find(p => p.IsUser === 1);

        let strokeTotal: number | null = null;
        if (userPlayer) {
            const holeScores = getRoundHoleScores(round.Id) as RoundHoleScore[];
            const userScores = holeScores.filter(s => s.RoundPlayerId === userPlayer.Id);
            if (userScores.length > 0) {
                strokeTotal = userScores.reduce((sum, s) => sum + s.Score, 0);
            }
        }

        rounds.push({
            Id: round.Id,
            TotalScore: round.TotalScore,
            StrokeTotal: strokeTotal,
            StartTime: round.StartTime,
            EndTime: round.EndTime,
            IsCompleted: round.IsCompleted,
            CourseName: round.CourseName ?? null,
            Created_At: getTwoDigitDayAndMonth(round.Created_At),
            HolesPlayed: getHolesPlayedForRound(round.Id),
        });
    });

    return rounds;
};

export const deleteRoundService = async (roundId: number): Promise<boolean> => {
    return deleteRound(roundId);
};

export const getRecentCourseNamesService = (): string[] => {
    const rows = getDistinctCourseNames() as { CourseName: string }[];
    return rows.map(r => r.CourseName);
};

export const getRecentPlayerNamesService = (): string[] => {
    const rows = getDistinctPlayerNames() as { PlayerName: string }[];
    return rows.map(r => r.PlayerName);
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
    await deleteRoundHoleScoresByHole(roundId, holeNumber);
    for (const s of scores) {
        const success = await insertRoundHoleScore(roundId, s.playerId, holeNumber, holePar, s.score);
        if (!success) return false;
    }
    return true;
};

export const getRoundPlayersService = (roundId: number): RoundPlayer[] => {
    return getRoundPlayers(roundId) as RoundPlayer[];
};

export const getHolesPlayedForRoundService = (roundId: number): number => {
    return getHolesPlayedForRound(roundId);
};

export const getMultiplayerScorecardService = (roundId: number): MultiplayerRoundScorecard | null => {
    const round = getRoundById(roundId) as Round | null;
    if (!round) return null;

    const players = getRoundPlayers(roundId) as RoundPlayer[];
    if (players.length === 0) return null;

    const holeScores = getRoundHoleScores(roundId) as RoundHoleScore[];
    return { round: { ...round, Created_At: getTwoDigitDayAndMonth(round.Created_At) }, players, holeScores };
};

// Club distance services
export const getClubDistancesService = (): ClubDistance[] => {
    return getClubDistances() as ClubDistance[];
};

export const saveClubDistancesService = async (distances: { Club: string; CarryDistance: number; TotalDistance: number; SortOrder: number }[]): Promise<boolean> => {
    return insertClubDistances(distances);
};

export const getDeadlySinsForRoundService = (roundId: number): DeadlySinsRound | null => {
    const r = getDeadlySinsRoundByRoundId(roundId) as any;
    if (!r) return null;
    return {
        Id: r.Id,
        ThreePutts: r.ThreePutts,
        DoubleBogeys: r.DoubleBogeys,
        BogeysPar5: r.BogeysPar5,
        BogeysInside9Iron: r.BogeysInside9Iron,
        DoubleChips: r.DoubleChips,
        TroubleOffTee: r.TroubleOffTee,
        Penalties: r.Penalties,
        Total: r.Total,
        RoundId: r.RoundId ?? null,
        Created_At: getTwoDigitDayAndMonth(r.Created_At),
    };
};

// Settings services
export type AppSettings = {
    theme: 'dark' | 'light';
    notificationsEnabled: boolean;
    voice: 'female' | 'male' | 'neutral';
    soundsEnabled: boolean;
    wedgeChartOnboardingSeen: boolean;
    distancesOnboardingSeen: boolean;
    playOnboardingSeen: boolean;
    homeOnboardingSeen: boolean;
    practiceOnboardingSeen: boolean;
};

export const getSettingsService = (): AppSettings => {
    const row = getSettings() as { Id: number; Theme: string; NotificationsEnabled: number; Voice: string; SoundsEnabled: number; WedgeChartOnboardingSeen: number; DistancesOnboardingSeen: number; PlayOnboardingSeen: number; HomeOnboardingSeen: number; PracticeOnboardingSeen: number } | null;

    if (!row) {
        return { theme: 'dark', notificationsEnabled: true, voice: 'female', soundsEnabled: true, wedgeChartOnboardingSeen: false, distancesOnboardingSeen: false, playOnboardingSeen: false, homeOnboardingSeen: false, practiceOnboardingSeen: false };
    }

    return {
        theme: row.Theme as 'dark' | 'light',
        notificationsEnabled: row.NotificationsEnabled === 1,
        voice: (row.Voice ?? 'female') as 'female' | 'male' | 'neutral',
        soundsEnabled: (row.SoundsEnabled ?? 1) === 1,
        wedgeChartOnboardingSeen: row.WedgeChartOnboardingSeen === 1,
        distancesOnboardingSeen: row.DistancesOnboardingSeen === 1,
        playOnboardingSeen: row.PlayOnboardingSeen === 1,
        homeOnboardingSeen: row.HomeOnboardingSeen === 1,
        practiceOnboardingSeen: row.PracticeOnboardingSeen === 1,
    };
};

export const saveSettingsService = async (settings: AppSettings): Promise<boolean> => {
    return saveSettings(settings.theme, settings.notificationsEnabled ? 1 : 0, settings.voice, settings.soundsEnabled ? 1 : 0, settings.wedgeChartOnboardingSeen ? 1 : 0, settings.distancesOnboardingSeen ? 1 : 0, settings.playOnboardingSeen ? 1 : 0, settings.homeOnboardingSeen ? 1 : 0, settings.practiceOnboardingSeen ? 1 : 0);
};

export type PracticeReminder = {
    Id: number;
    Label: string;
    ScheduledFor: string;
    NotificationId: string | null;
    Created_At: string;
};

export const getPracticeRemindersService = (): PracticeReminder[] => getAllPracticeReminders() as PracticeReminder[];

export const addPracticeReminderService = (label: string, scheduledFor: string, notificationId: string | null) =>
    insertPracticeReminder(label, scheduledFor, notificationId);

export const deletePracticeReminderService = (id: number) => deletePracticeReminder(id);

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
