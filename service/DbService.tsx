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
    insertHoleDeadlySins,
    getDeadlySinsForRound,
    getAllDeadlySinsRoundTotals,
    getHoleDeadlySins,
    deleteHoleDeadlySinsByHole,
    getHolesWithSinsForRound,
    insertRound,
    updateRound,
    getRoundById,
    getActiveRound,
    getAllRounds,
    getClubDistances,
    insertClubDistances,
    getDistinctCourseNames,
    getDistinctPlayerNames,
    addHiddenRecent,
    getHolesPlayedForRound,
    insertRoundPlayer,
    getRoundPlayers,
    insertRoundHoleScore,
    getRoundHoleScores,
    updateRoundHoleScore,
    deleteRoundHoleScoresByHole,
    updateRoundTotalScore,
    deleteRound,
    getAllRoundsWithPlayersAndScores,
    getSettings,
    saveSettings,
    getGamesByCategory,
    insertGame,
    softDeleteGame,
    restoreGame,
    getAllPracticeReminders,
    insertPracticeReminder,
    deletePracticeReminder,
    getHoleParsForCourse,
    getAllHoleNotesForCourse,
    upsertHoleNote,
    deleteHoleNote,
    getSinFrequenciesSync,
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

export type DeadlySinsValues = {
    threePutts: boolean;
    doubleBogeys: boolean;
    bogeysPar5: boolean;
    bogeysInside9Iron: boolean;
    doubleChips: boolean;
    troubleOffTee: boolean;
    penalties: boolean;
};

export const insertHoleDeadlySinsService = async (roundId: number, holeNumber: number, sins: DeadlySinsValues): Promise<boolean> => {
    await deleteHoleDeadlySinsByHole(roundId, holeNumber);
    return insertHoleDeadlySins(roundId, holeNumber, sins);
};

export const getHoleDeadlySinsService = (roundId: number, holeNumber: number): DeadlySinsValues | null => {
    const row = getHoleDeadlySins(roundId, holeNumber) as any;
    if (!row) return null;
    return {
        threePutts: row.ThreePutts === 1,
        doubleBogeys: row.DoubleBogeys === 1,
        bogeysPar5: row.BogeysPar5 === 1,
        bogeysInside9Iron: row.BogeysInside9Iron === 1,
        doubleChips: row.DoubleChips === 1,
        troubleOffTee: row.TroubleOffTee === 1,
        penalties: row.Penalties === 1,
    };
};

export const getHolesWithSinsForRoundService = (roundId: number): Set<number> => {
    const rows = getHolesWithSinsForRound(roundId) as { HoleNumber: number }[];
    return new Set(rows.map(r => r.HoleNumber));
};

export const replaceHoleDeadlySinsService = (roundId: number, holeNumber: number, sins: DeadlySinsValues): Promise<boolean> => {
    return insertHoleDeadlySinsService(roundId, holeNumber, sins);
};

export const getAllDeadlySinsRoundsService = (): DeadlySinsRound[] => {
    const totals = getAllDeadlySinsRoundTotals() as any[];
    const rounds = getAllRounds() as { Id: number; Created_At: string }[];
    const roundMap = new Map(rounds.map(r => [r.Id, r.Created_At]));

    return totals.map(t => ({
        Id: t.RoundId,
        ThreePutts: t.ThreePutts ?? 0,
        DoubleBogeys: t.DoubleBogeys ?? 0,
        BogeysPar5: t.BogeysPar5 ?? 0,
        BogeysInside9Iron: t.BogeysInside9Iron ?? 0,
        DoubleChips: t.DoubleChips ?? 0,
        TroubleOffTee: t.TroubleOffTee ?? 0,
        Penalties: t.Penalties ?? 0,
        Total: t.Total ?? 0,
        RoundId: t.RoundId,
        Created_At: getTwoDigitDayAndMonth(roundMap.get(t.RoundId) ?? ''),
    }));
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
    const holeScores = getRoundHoleScores(roundId) as RoundHoleScore[];
    const userPlayer = players.find(p => p.IsUser === 1);
    const userScores = userPlayer ? holeScores.filter(s => s.RoundPlayerId === userPlayer.Id) : [];
    const totalScore = userScores.reduce((sum, s) => sum + (s.Score - s.HolePar), 0);
    return updateRound(roundId, totalScore);
};

export const getRoundScorecardService = (roundId: number): RoundScorecard | null => {
    const round = getRoundById(roundId) as Round | null;
    if (!round) return null;

    return { round: { ...round, Created_At: getTwoDigitDayAndMonth(round.Created_At) }, holes: [] };
};

export const getActiveRoundService = (): Round | null => {
    return getActiveRound() as Round | null;
};

export const getAllRoundHistoryService = (): Round[] => {
    return getAllRoundsWithPlayersAndScores().map((row: any) => ({
        Id: row.Id,
        TotalScore: row.TotalScore,
        StrokeTotal: row.UserPlayerId ? (row.StrokeTotal ?? null) : null,
        StartTime: row.StartTime,
        EndTime: row.EndTime,
        IsCompleted: row.IsCompleted,
        CourseName: row.CourseName ?? null,
        Created_At: getTwoDigitDayAndMonth(row.Created_At),
        HolesPlayed: row.HolesPlayed ?? 0,
    }));
};

export const deleteRoundService = async (roundId: number): Promise<boolean> => {
    return deleteRound(roundId);
};

export const getRecentCourseNamesService = (): string[] => {
    const rows = getDistinctCourseNames() as { CourseName: string }[];
    return rows.map(r => r.CourseName);
};

export const getCourseHoleParsService = (courseName: string): Record<number, number> => {
    const rows = getHoleParsForCourse(courseName) as { HoleNumber: number; HolePar: number }[];
    return rows.reduce((acc, r) => ({ ...acc, [r.HoleNumber]: r.HolePar }), {} as Record<number, number>);
};

export const loadCourseNotesService = (courseName: string): Record<number, string> => {
    const rows = getAllHoleNotesForCourse(courseName) as { HoleNumber: number; Note: string }[];
    return rows.reduce((acc, r) => ({ ...acc, [r.HoleNumber]: r.Note }), {} as Record<number, string>);
};

export const saveHoleNoteService = async (courseName: string, holeNumber: number, note: string): Promise<boolean> => {
    if (note.trim() === '') {
        return deleteHoleNote(courseName, holeNumber);
    }
    return upsertHoleNote(courseName, holeNumber, note.trim());
};

export const getRecentPlayerNamesService = (): string[] => {
    const rows = getDistinctPlayerNames() as { PlayerName: string }[];
    return rows.map(r => r.PlayerName);
};

export const hideCourseFromRecentsService = async (name: string): Promise<boolean> => {
    return addHiddenRecent('course', name);
};

export const hidePlayerFromRecentsService = async (name: string): Promise<boolean> => {
    return addHiddenRecent('player', name);
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
    const r = getDeadlySinsForRound(roundId) as any;
    if (!r) return null;
    const round = getRoundById(roundId) as any;
    const total = (r.ThreePutts ?? 0) + (r.DoubleBogeys ?? 0) + (r.BogeysPar5 ?? 0) +
        (r.BogeysInside9Iron ?? 0) + (r.DoubleChips ?? 0) + (r.TroubleOffTee ?? 0) + (r.Penalties ?? 0);
    return {
        Id: roundId,
        ThreePutts: r.ThreePutts ?? 0,
        DoubleBogeys: r.DoubleBogeys ?? 0,
        BogeysPar5: r.BogeysPar5 ?? 0,
        BogeysInside9Iron: r.BogeysInside9Iron ?? 0,
        DoubleChips: r.DoubleChips ?? 0,
        TroubleOffTee: r.TroubleOffTee ?? 0,
        Penalties: r.Penalties ?? 0,
        Total: total,
        RoundId: roundId,
        Created_At: round ? getTwoDigitDayAndMonth(round.Created_At) : '',
    };
};

// Settings services
export type AppSettings = {
    notificationsEnabled: boolean;
    voice: 'female' | 'male' | 'neutral';
    soundsEnabled: boolean;
    wedgeChartOnboardingSeen: boolean;
    distancesOnboardingSeen: boolean;
    playOnboardingSeen: boolean;
    homeOnboardingSeen: boolean;
    practiceOnboardingSeen: boolean;
    practiceFrequencyDays: number;
};

export const getSettingsService = (): AppSettings => {
    const row = getSettings() as { Id: number; Theme: string; NotificationsEnabled: number; Voice: string; SoundsEnabled: number; WedgeChartOnboardingSeen: number; DistancesOnboardingSeen: number; PlayOnboardingSeen: number; HomeOnboardingSeen: number; PracticeOnboardingSeen: number; PracticeFrequencyDays: number } | null;

    if (!row) {
        return { notificationsEnabled: true, voice: 'female', soundsEnabled: true, wedgeChartOnboardingSeen: false, distancesOnboardingSeen: false, playOnboardingSeen: false, homeOnboardingSeen: false, practiceOnboardingSeen: false, practiceFrequencyDays: 7 };
    }

    return {
        notificationsEnabled: row.NotificationsEnabled === 1,
        voice: (row.Voice ?? 'female') as 'female' | 'male' | 'neutral',
        soundsEnabled: (row.SoundsEnabled ?? 1) === 1,
        wedgeChartOnboardingSeen: row.WedgeChartOnboardingSeen === 1,
        distancesOnboardingSeen: row.DistancesOnboardingSeen === 1,
        playOnboardingSeen: row.PlayOnboardingSeen === 1,
        homeOnboardingSeen: row.HomeOnboardingSeen === 1,
        practiceOnboardingSeen: row.PracticeOnboardingSeen === 1,
        practiceFrequencyDays: row.PracticeFrequencyDays ?? 7,
    };
};

export const saveSettingsService = async (settings: AppSettings): Promise<boolean> => {
    return saveSettings(settings.notificationsEnabled ? 1 : 0, settings.voice, settings.soundsEnabled ? 1 : 0, settings.wedgeChartOnboardingSeen ? 1 : 0, settings.distancesOnboardingSeen ? 1 : 0, settings.playOnboardingSeen ? 1 : 0, settings.homeOnboardingSeen ? 1 : 0, settings.practiceOnboardingSeen ? 1 : 0, settings.practiceFrequencyDays);
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

export type ParAverages = {
    par3: number | null;
    par4: number | null;
    par5: number | null;
};

export const getParAveragesService = (rounds: Round[]): ParAverages => {
    const totals: Record<number, { sum: number; count: number }> = {};

    for (const round of rounds) {
        const players = getRoundPlayers(round.Id) as RoundPlayer[];
        const userPlayer = players.find(p => p.IsUser === 1);
        if (!userPlayer) continue;

        const holeScores = getRoundHoleScores(round.Id) as RoundHoleScore[];
        const userScores = holeScores.filter(s => s.RoundPlayerId === userPlayer.Id);

        for (const score of userScores) {
            const par = score.HolePar;
            if (!totals[par]) totals[par] = { sum: 0, count: 0 };
            totals[par].sum += score.Score;
            totals[par].count += 1;
        }
    }

    const avg = (par: number): number | null =>
        totals[par]?.count > 0 ? totals[par].sum / totals[par].count : null;

    return { par3: avg(3), par4: avg(4), par5: avg(5) };
};

const SIN_TO_PRACTICE: Record<string, { category: string; reminderLabel: string; drillLabel: string }> = {
    ThreePutts: { category: 'Putting', reminderLabel: 'Putting practice — reduce 3-putts', drillLabel: 'Ladder' },
    DoubleChips: { category: 'Chipping', reminderLabel: 'Chipping practice — eliminate double chips', drillLabel: 'Hoop' },
    DoubleBogeys: { category: 'Chipping', reminderLabel: 'Chipping practice — reduce double bogeys', drillLabel: 'Gate' },
    BogeysInside9Iron: { category: 'Pitching', reminderLabel: 'Pitching practice — sharpen approach shots', drillLabel: 'Three ball' },
    BogeysPar5: { category: 'Pitching', reminderLabel: 'Pitching practice — improve par 5 approaches', drillLabel: 'Ladder' },
    TroubleOffTee: { category: 'Full swing', reminderLabel: 'Full swing practice — hit more fairways', drillLabel: 'Gate' },
    Penalties: { category: 'Full swing', reminderLabel: 'Full swing practice — improve course management', drillLabel: 'Tempo' },
};

export type PracticePlanItem = { reminderLabel: string; drillLabel: string; count: number };

export const getTopSinsForPracticePlanService = (): PracticePlanItem[] => {
    const freqs = getSinFrequenciesSync();
    const entries = (Object.keys(SIN_TO_PRACTICE) as string[])
        .map(key => ({ ...SIN_TO_PRACTICE[key], count: (freqs as any)[key] as number }))
        .filter(e => e.count > 0)
        .sort((a, b) => b.count - a.count);

    const seen = new Set<string>();
    return entries.reduce<PracticePlanItem[]>((acc, e) => {
        if (!seen.has(e.category)) {
            seen.add(e.category);
            acc.push({ reminderLabel: e.reminderLabel, drillLabel: e.drillLabel, count: e.count });
        }
        return acc;
    }, []);
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
