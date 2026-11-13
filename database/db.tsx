import * as SQLite from 'expo-sqlite';
import { logError } from '../service/ErrorLoggingService';

const dbName = 'NoCaddyNeeded.db';

// _db is kept alive at module level so the underlying native sqlite3* handle
// is not released on Android (openDatabaseSync shares the same native handle;
// if the async connection goes out of scope Android nulls it out, causing a
// NullPointerException in prepareSync).
let _db: SQLite.SQLiteDatabase | null = null;

// _syncDb is opened with openDatabaseSync so that getAllSync / execSync /
// prepareSync run on the JS thread without deadlocking (calling those methods
// on an openDatabaseAsync connection deadlocks iOS).
let _syncDb: SQLite.SQLiteDatabase | null = null;

function getSyncDb(): SQLite.SQLiteDatabase {
    if (!_syncDb) {
        throw new Error('Database not initialized. Call initialize() first.');
    }
    return _syncDb;
}

// Runs one write statement. Any failure is logged under `context` and reported as false.
const runStatement = async (context: string, sql: string, params: Record<string, string | number | null>): Promise<boolean> => {
    try {
        const db = await SQLite.openDatabaseAsync(dbName);
        const statement = await db.prepareAsync(sql);
        try {
            await statement.executeAsync(params);
        } finally {
            await statement.finalizeAsync();
        }
        return true;
    } catch (e) {
        void logError(context, e);
        return false;
    }
};

// One round's or one hole's deadly sin counts, as read back from HoleDeadlySins
export type DeadlySinCountsRow = {
    ThreePutts: number;
    DoubleBogeys: number;
    BogeysPar5: number;
    BogeysInside9Iron: number;
    DoubleChips: number;
    TroubleOffTee: number;
    Penalties: number;
};

export type TableAmendment = {
    table: string;
    columnsToAdd: string[];
    columnsToRemove: string[];
};

const amendTable = (syncDb: SQLite.SQLiteDatabase, amendment: TableAmendment): void => {
    const tableInfo: { name: string }[] = syncDb.getAllSync(`PRAGMA table_info(${amendment.table})`);
    const existingColumns = new Set(tableInfo.map(col => col.name));

    for (const columnDef of amendment.columnsToAdd) {
        const columnName = columnDef.split(' ')[0];
        if (!existingColumns.has(columnName)) {
            syncDb.execSync(`ALTER TABLE ${amendment.table} ADD COLUMN ${columnDef}`);
        }
    }

    for (const columnName of amendment.columnsToRemove) {
        if (existingColumns.has(columnName)) {
            syncDb.execSync(`ALTER TABLE ${amendment.table} DROP COLUMN ${columnName}`);
        }
    }
};

export const initialize = async () => {
    _db = await SQLite.openDatabaseAsync(dbName);
    if (!_syncDb) {
        _syncDb = SQLite.openDatabaseSync(dbName);
    }
    const db = _db;
    const syncDb = _syncDb;

    // Rename migrations must run BEFORE CREATE TABLE IF NOT EXISTS to avoid name conflicts
    const tiger5Columns = syncDb.getAllSync('PRAGMA table_info(Tiger5Rounds)');
    if (tiger5Columns.length > 0) {
        syncDb.execSync('ALTER TABLE Tiger5Rounds RENAME TO DeadlySinsRounds');
    }

    const oldDrillsColumns = syncDb.getAllSync('PRAGMA table_info(Drills)') as { name: string }[];
    const isOldDrillsTable = oldDrillsColumns.some(col => col.name === 'Name');
    if (isOldDrillsTable) {
        const drillHistoryColumns = syncDb.getAllSync('PRAGMA table_info(DrillHistory)');
        if (drillHistoryColumns.length === 0) {
            syncDb.execSync('ALTER TABLE Drills RENAME TO DrillHistory');
        } else {
            syncDb.execSync('INSERT INTO DrillHistory (Name, Result, Created_At) SELECT Name, Result, Created_At FROM Drills');
            syncDb.execSync('DROP TABLE Drills');
        }
    }

    await db.execAsync(`
        PRAGMA journal_mode = WAL;
        CREATE TABLE IF NOT EXISTS WedgeChartDistanceNames (Id INTEGER PRIMARY KEY AUTOINCREMENT, Name TEXT NOT NULL, SortOrder INTEGER NOT NULL);
        CREATE TABLE IF NOT EXISTS WedgeChartEntries (Id INTEGER PRIMARY KEY AUTOINCREMENT, Club TEXT NOT NULL, DistanceName TEXT NOT NULL, Distance INTEGER NOT NULL, ClubSortOrder INTEGER NOT NULL, DistanceSortOrder INTEGER NOT NULL);
        CREATE TABLE IF NOT EXISTS DrillHistory (Id INTEGER PRIMARY KEY AUTOINCREMENT, Name TEXT NOT NULL, Result BOOLEAN NOT NULL, DrillId INTEGER, Created_At TEXT NOT NULL);
        CREATE TABLE IF NOT EXISTS HoleDeadlySins (Id INTEGER PRIMARY KEY AUTOINCREMENT, RoundId INTEGER NOT NULL, HoleNumber INTEGER NOT NULL, ThreePutts INTEGER NOT NULL DEFAULT 0, DoubleBogeys INTEGER NOT NULL DEFAULT 0, BogeysPar5 INTEGER NOT NULL DEFAULT 0, BogeysInside9Iron INTEGER NOT NULL DEFAULT 0, DoubleChips INTEGER NOT NULL DEFAULT 0, TroubleOffTee INTEGER NOT NULL DEFAULT 0, Penalties INTEGER NOT NULL DEFAULT 0);
        CREATE TABLE IF NOT EXISTS Rounds (Id INTEGER PRIMARY KEY AUTOINCREMENT, TotalScore INTEGER NOT NULL DEFAULT 0, StartTime TEXT NOT NULL, EndTime TEXT, IsCompleted INTEGER NOT NULL DEFAULT 0, CourseName TEXT, Created_At TEXT NOT NULL, IsScoreOnly INTEGER NOT NULL DEFAULT 0);
        CREATE TABLE IF NOT EXISTS ClubDistances (Id INTEGER PRIMARY KEY AUTOINCREMENT, Club TEXT NOT NULL UNIQUE, CarryDistance INTEGER NOT NULL);
        CREATE TABLE IF NOT EXISTS RoundPlayers (Id INTEGER PRIMARY KEY AUTOINCREMENT, RoundId INTEGER NOT NULL, PlayerName TEXT NOT NULL, IsUser INTEGER NOT NULL DEFAULT 0, SortOrder INTEGER NOT NULL, FOREIGN KEY (RoundId) REFERENCES Rounds(Id));
        CREATE TABLE IF NOT EXISTS RoundHoleScores (Id INTEGER PRIMARY KEY AUTOINCREMENT, RoundId INTEGER NOT NULL, RoundPlayerId INTEGER NOT NULL, HoleNumber INTEGER NOT NULL, HolePar INTEGER NOT NULL, Score INTEGER NOT NULL, FOREIGN KEY (RoundId) REFERENCES Rounds(Id), FOREIGN KEY (RoundPlayerId) REFERENCES RoundPlayers(Id));
        CREATE TABLE IF NOT EXISTS Settings (Id INTEGER PRIMARY KEY AUTOINCREMENT, Theme TEXT NOT NULL DEFAULT 'dark', NotificationsEnabled INTEGER NOT NULL DEFAULT 1, Voice TEXT NOT NULL DEFAULT 'female', SoundsEnabled INTEGER NOT NULL DEFAULT 1, WedgeChartOnboardingSeen INTEGER NOT NULL DEFAULT 0, DistancesOnboardingSeen INTEGER NOT NULL DEFAULT 0, PlayOnboardingSeen INTEGER NOT NULL DEFAULT 0, HomeOnboardingSeen INTEGER NOT NULL DEFAULT 0, PracticeOnboardingSeen INTEGER NOT NULL DEFAULT 0, ReviewPromptShown INTEGER NOT NULL DEFAULT 0, WhatsNewVersionSeen TEXT NOT NULL DEFAULT '', SettingsOnboardingSeen INTEGER NOT NULL DEFAULT 0, PerformOnboardingSeen INTEGER NOT NULL DEFAULT 0, TempoBpm INTEGER NOT NULL DEFAULT 60, Units TEXT NOT NULL DEFAULT 'yards', SkipStatsFlowEnabled INTEGER NOT NULL DEFAULT 0, BadHoleReassuranceEnabled INTEGER NOT NULL DEFAULT 1, QuickTools TEXT NOT NULL DEFAULT 'wind,tempo,random');
        CREATE TABLE IF NOT EXISTS PracticeReminders (Id INTEGER PRIMARY KEY AUTOINCREMENT, Label TEXT NOT NULL, ScheduledFor TEXT NOT NULL, NotificationId TEXT, Created_At TEXT NOT NULL);
        CREATE TABLE IF NOT EXISTS HiddenRecents (Id INTEGER PRIMARY KEY AUTOINCREMENT, Type TEXT NOT NULL, Name TEXT NOT NULL, UNIQUE(Type, Name));
        CREATE TABLE IF NOT EXISTS UiPreferences (Id INTEGER PRIMARY KEY, RoundFilter TEXT NOT NULL DEFAULT 'all');
        CREATE TABLE IF NOT EXISTS HoleNotes (Id INTEGER PRIMARY KEY AUTOINCREMENT, CourseName TEXT NOT NULL, HoleNumber INTEGER NOT NULL, Note TEXT NOT NULL, Updated_At TEXT NOT NULL, UNIQUE(CourseName, HoleNumber));
        CREATE TABLE IF NOT EXISTS PuttingStats (Id INTEGER PRIMARY KEY AUTOINCREMENT, RoundId INTEGER NOT NULL, HoleNumber INTEGER NOT NULL, FirstPuttDistance INTEGER NOT NULL, SecondPuttDistance INTEGER NOT NULL, SecondPuttIsLong INTEGER NOT NULL DEFAULT 0, ThirdPuttDistance INTEGER, ThirdPuttIsLong INTEGER, GreenInRegulation INTEGER NOT NULL DEFAULT 0, FOREIGN KEY (RoundId) REFERENCES Rounds(Id));
        CREATE TABLE IF NOT EXISTS HoleSinDetails (Id INTEGER PRIMARY KEY AUTOINCREMENT, RoundId INTEGER NOT NULL, HoleNumber INTEGER NOT NULL, TroubleOffTeeClub TEXT, PenaltyType TEXT, BogeysInside9IronClub TEXT, DoubleChipsReason TEXT, FOREIGN KEY (RoundId) REFERENCES Rounds(Id));
    `);

    const migrations: TableAmendment[] = [
        {
            table: 'HoleSinDetails',
            columnsToAdd: ['DoubleChipsReason TEXT'],
            columnsToRemove: [],
        },
        {
            table: 'ClubDistances',
            columnsToAdd: ['TotalDistance INTEGER NOT NULL DEFAULT 0'],
            columnsToRemove: [],
        },
        {
            table: 'Settings',
            columnsToAdd: [
                'WedgeChartOnboardingSeen INTEGER NOT NULL DEFAULT 0',
                'DistancesOnboardingSeen INTEGER NOT NULL DEFAULT 0',
                'PlayOnboardingSeen INTEGER NOT NULL DEFAULT 0',
                'HomeOnboardingSeen INTEGER NOT NULL DEFAULT 0',
                'PracticeOnboardingSeen INTEGER NOT NULL DEFAULT 0',
                "Voice TEXT NOT NULL DEFAULT 'female'",
                'SoundsEnabled INTEGER NOT NULL DEFAULT 1',
                'ReviewPromptShown INTEGER NOT NULL DEFAULT 0',
                "WhatsNewVersionSeen TEXT NOT NULL DEFAULT ''",
                'SettingsOnboardingSeen INTEGER NOT NULL DEFAULT 0',
                'PerformOnboardingSeen INTEGER NOT NULL DEFAULT 0',
                'TempoBpm INTEGER NOT NULL DEFAULT 60',
                "Units TEXT NOT NULL DEFAULT 'yards'",
                'SkipStatsFlowEnabled INTEGER NOT NULL DEFAULT 0',
                'BadHoleReassuranceEnabled INTEGER NOT NULL DEFAULT 1',
                "QuickTools TEXT NOT NULL DEFAULT 'wind,tempo,random'",
            ],
            columnsToRemove: ['PracticeFrequencyDays', 'PreShotReminderEnabled', 'PreShotRoutineText'],
        },
        {
            table: 'Rounds',
            columnsToAdd: ['IsScoreOnly INTEGER NOT NULL DEFAULT 0', 'StartHole INTEGER NOT NULL DEFAULT 1'],
            columnsToRemove: [
                'CoursePar'
            ],
        },
        {
            table: 'DrillHistory',
            columnsToAdd: ['DrillId INTEGER', 'Score INTEGER'],
            columnsToRemove: [],
        },
        {
            table: 'PuttingStats',
            columnsToAdd: ['GreenInRegulation INTEGER NOT NULL DEFAULT 0'],
            columnsToRemove: [],
        },
    ];

    for (const migration of migrations) {
        amendTable(syncDb, migration);
    }

    // Infer IsScoreOnly for existing rounds based on whether putting stats were recorded.
    // If a round has no putting stats (putts = 0), it was played in score-only mode.
    syncDb.execSync(`
        UPDATE Rounds SET IsScoreOnly = 1
        WHERE IsCompleted = 1 AND Id NOT IN (
            SELECT DISTINCT RoundId FROM PuttingStats
        )
    `);

    syncDb.execSync('DROP TABLE IF EXISTS DeadlySinsRounds;');
    syncDb.execSync('DROP TABLE IF EXISTS Drills;');
    syncDb.execSync('DROP TABLE IF EXISTS Games;');
    syncDb.execSync(
        'DELETE FROM HoleDeadlySins WHERE Id NOT IN (SELECT MAX(Id) FROM HoleDeadlySins GROUP BY RoundId, HoleNumber);'
    );

};

export const insertDrillResult = async (name: string, result: boolean, drillId: number | null = null, score: number | null = null) => {
    let success = true;
    const db = await SQLite.openDatabaseAsync(dbName);

    const statement = await db.prepareAsync(
        'INSERT INTO DrillHistory (Name, Result, DrillId, Score, Created_At) VALUES ($Name, $Result, $DrillId, $Score, $Created_At);'
    );

    try {
        await statement.executeAsync({ $Name: name, $Result: result, $DrillId: drillId, $Score: score, $Created_At: new Date().toISOString() });
    } catch (e) {
        void logError('db.insertDrillResult', e);
        success = false;
    } finally {
        await statement.finalizeAsync();
    }

    return success;
};

export const getWedgeChartDistanceNames = () => {
    return getSyncDb().getAllSync('SELECT * FROM WedgeChartDistanceNames ORDER BY SortOrder ASC;');
};

export const getWedgeChartEntries = () => {
    return getSyncDb().getAllSync('SELECT * FROM WedgeChartEntries ORDER BY ClubSortOrder ASC, DistanceSortOrder ASC;');
};

export const insertWedgeChart = async (
    distanceNames: { Name: string; SortOrder: number }[],
    entries: { Club: string; DistanceName: string; Distance: number; ClubSortOrder: number; DistanceSortOrder: number }[]
): Promise<boolean> => {
    let success = true;
    try {
        getSyncDb().execSync('DELETE FROM WedgeChartDistanceNames');
        getSyncDb().execSync('DELETE FROM WedgeChartEntries');

        for (const dn of distanceNames) {
            const statement = getSyncDb().prepareSync(
                'INSERT INTO WedgeChartDistanceNames (Name, SortOrder) VALUES ($Name, $SortOrder)'
            );
            try {
                await statement.executeAsync({ $Name: dn.Name, $SortOrder: dn.SortOrder });
            } finally {
                await statement.finalizeAsync();
            }
        }

        for (const entry of entries) {
            const statement = getSyncDb().prepareSync(
                'INSERT INTO WedgeChartEntries (Club, DistanceName, Distance, ClubSortOrder, DistanceSortOrder) VALUES ($Club, $DistanceName, $Distance, $ClubSortOrder, $DistanceSortOrder)'
            );
            try {
                await statement.executeAsync({
                    $Club: entry.Club,
                    $DistanceName: entry.DistanceName,
                    $Distance: entry.Distance,
                    $ClubSortOrder: entry.ClubSortOrder,
                    $DistanceSortOrder: entry.DistanceSortOrder,
                });
            } finally {
                await statement.finalizeAsync();
            }
        }
    } catch (e) {
        void logError('db.insertWedgeChart', e);
        success = false;
    }

    return success;
};

export const insertHoleDeadlySins = async (
    roundId: number,
    holeNumber: number,
    sins: { threePutts: boolean; doubleBogeys: boolean; bogeysPar5: boolean; bogeysInside9Iron: boolean; doubleChips: boolean; troubleOffTee: boolean; penalties: boolean }
): Promise<boolean> => {
    let success = true;
    try {
        const db = await SQLite.openDatabaseAsync(dbName);
        const statement = await db.prepareAsync(
            'INSERT INTO HoleDeadlySins (RoundId, HoleNumber, ThreePutts, DoubleBogeys, BogeysPar5, BogeysInside9Iron, DoubleChips, TroubleOffTee, Penalties) VALUES ($RoundId, $HoleNumber, $ThreePutts, $DoubleBogeys, $BogeysPar5, $BogeysInside9Iron, $DoubleChips, $TroubleOffTee, $Penalties);'
        );
        try {
            await statement.executeAsync({
                $RoundId: roundId,
                $HoleNumber: holeNumber,
                $ThreePutts: sins.threePutts ? 1 : 0,
                $DoubleBogeys: sins.doubleBogeys ? 1 : 0,
                $BogeysPar5: sins.bogeysPar5 ? 1 : 0,
                $BogeysInside9Iron: sins.bogeysInside9Iron ? 1 : 0,
                $DoubleChips: sins.doubleChips ? 1 : 0,
                $TroubleOffTee: sins.troubleOffTee ? 1 : 0,
                $Penalties: sins.penalties ? 1 : 0,
            });
        } finally {
            await statement.finalizeAsync();
        }
    } catch (e) {
        void logError('db.insertHoleDeadlySins', e);
        success = false;
    }
    return success;
};

export const getDeadlySinsForRound = (roundId: number) => {
    const rows = getSyncDb().getAllSync(`
        SELECT SUM(ThreePutts) as ThreePutts, SUM(DoubleBogeys) as DoubleBogeys,
               SUM(BogeysPar5) as BogeysPar5, SUM(BogeysInside9Iron) as BogeysInside9Iron,
               SUM(DoubleChips) as DoubleChips, SUM(TroubleOffTee) as TroubleOffTee,
               SUM(Penalties) as Penalties
        FROM HoleDeadlySins WHERE RoundId = ?
    `, [roundId]) as DeadlySinCountsRow[];

    if (rows.length === 0) return null;
    // SUM() over no rows is NULL, so the totals are typed as nullable
    const row = rows[0] as { [K in keyof DeadlySinCountsRow]: DeadlySinCountsRow[K] | null };
    if (row.ThreePutts === null && row.DoubleBogeys === null) return null;
    return row;
};

export const getAllDeadlySinsRoundTotals = () => {
    return getSyncDb().getAllSync(`
        SELECT RoundId,
               SUM(ThreePutts) as ThreePutts, SUM(DoubleBogeys) as DoubleBogeys,
               SUM(BogeysPar5) as BogeysPar5, SUM(BogeysInside9Iron) as BogeysInside9Iron,
               SUM(DoubleChips) as DoubleChips, SUM(TroubleOffTee) as TroubleOffTee,
               SUM(Penalties) as Penalties,
               SUM(ThreePutts + DoubleBogeys + BogeysPar5 + BogeysInside9Iron + DoubleChips + TroubleOffTee + Penalties) as Total
        FROM HoleDeadlySins GROUP BY RoundId ORDER BY RoundId DESC
    `);
};

export const getHolesWithSinsForRound = (roundId: number) => {
    return getSyncDb().getAllSync(
        'SELECT HoleNumber FROM HoleDeadlySins WHERE RoundId = ? AND (ThreePutts + DoubleBogeys + BogeysPar5 + BogeysInside9Iron + DoubleChips + TroubleOffTee + Penalties) > 0',
        [roundId]
    );
};

export const getHoleDeadlySins = (roundId: number, holeNumber: number) => {
    const rows = getSyncDb().getAllSync(
        'SELECT ThreePutts, DoubleBogeys, BogeysPar5, BogeysInside9Iron, DoubleChips, TroubleOffTee, Penalties FROM HoleDeadlySins WHERE RoundId = ? AND HoleNumber = ? LIMIT 1',
        [roundId, holeNumber]
    ) as DeadlySinCountsRow[];
    return rows.length > 0 ? rows[0] : null;
};

export const getRoundHoleScoresByHole = (roundId: number, holeNumber: number) => {
    return getSyncDb().getAllSync(
        'SELECT * FROM RoundHoleScores WHERE RoundId = ? AND HoleNumber = ?;',
        [roundId, holeNumber]
    );
};

export const insertPuttingStats = async (roundId: number, holeNumber: number, firstPuttDistance: number, secondPuttDistance: number, secondPuttIsLong: boolean, thirdPuttDistance?: number, thirdPuttIsLong?: boolean, greenInRegulation: boolean = false): Promise<boolean> => {
    return runStatement('db.insertPuttingStats', 'INSERT INTO PuttingStats (RoundId, HoleNumber, FirstPuttDistance, SecondPuttDistance, SecondPuttIsLong, ThirdPuttDistance, ThirdPuttIsLong, GreenInRegulation) VALUES ($RoundId, $HoleNumber, $FirstPuttDistance, $SecondPuttDistance, $SecondPuttIsLong, $ThirdPuttDistance, $ThirdPuttIsLong, $GreenInRegulation);', {
                $RoundId: roundId,
                $HoleNumber: holeNumber,
                $FirstPuttDistance: firstPuttDistance,
                $SecondPuttDistance: secondPuttDistance,
                $SecondPuttIsLong: secondPuttIsLong ? 1 : 0,
                $ThirdPuttDistance: thirdPuttDistance ?? null,
                $ThirdPuttIsLong: thirdPuttIsLong ? 1 : 0,
                $GreenInRegulation: greenInRegulation ? 1 : 0,
            });
};

export const getPuttingStats = (roundId: number, holeNumber: number) => {
    return getSyncDb().getAllSync(
        'SELECT * FROM PuttingStats WHERE RoundId = ? AND HoleNumber = ? LIMIT 1;',
        [roundId, holeNumber]
    );
};

export const getAllPuttingStatsWithThreePutts = () => {
    return getSyncDb().getAllSync(
        `SELECT ps.RoundId, ps.FirstPuttDistance, ps.SecondPuttDistance, ps.SecondPuttIsLong, ps.GreenInRegulation, COALESCE(hds.ThreePutts, 0) AS ThreePutts
         FROM PuttingStats ps
         LEFT JOIN HoleDeadlySins hds ON hds.RoundId = ps.RoundId AND hds.HoleNumber = ps.HoleNumber;`
    );
};

export const deletePuttingStatsByHole = async (roundId: number, holeNumber: number): Promise<boolean> => {
    return runStatement('db.deletePuttingStatsByHole', 'DELETE FROM PuttingStats WHERE RoundId = $RoundId AND HoleNumber = $HoleNumber;', { $RoundId: roundId, $HoleNumber: holeNumber });
};

export const insertHoleSinDetails = async (roundId: number, holeNumber: number, troubleOffTeeClub?: string, penaltyType?: string, bogeysInside9IronClub?: string, doubleChipsReason?: string): Promise<boolean> => {
    return runStatement('db.insertHoleSinDetails', 'INSERT INTO HoleSinDetails (RoundId, HoleNumber, TroubleOffTeeClub, PenaltyType, BogeysInside9IronClub, DoubleChipsReason) VALUES ($RoundId, $HoleNumber, $TroubleOffTeeClub, $PenaltyType, $BogeysInside9IronClub, $DoubleChipsReason);', { $RoundId: roundId, $HoleNumber: holeNumber, $TroubleOffTeeClub: troubleOffTeeClub ?? null, $PenaltyType: penaltyType ?? null, $BogeysInside9IronClub: bogeysInside9IronClub ?? null, $DoubleChipsReason: doubleChipsReason ?? null });
};

export const getHoleSinDetails = (roundId: number, holeNumber: number) => {
    return getSyncDb().getAllSync(
        'SELECT * FROM HoleSinDetails WHERE RoundId = ? AND HoleNumber = ? LIMIT 1;',
        [roundId, holeNumber]
    );
};

export const getAllHoleSinDetails = () => {
    return getSyncDb().getAllSync('SELECT * FROM HoleSinDetails;');
};

export const deleteHoleSinDetailsByHole = async (roundId: number, holeNumber: number): Promise<boolean> => {
    return runStatement('db.deleteHoleSinDetailsByHole', 'DELETE FROM HoleSinDetails WHERE RoundId = $RoundId AND HoleNumber = $HoleNumber;', { $RoundId: roundId, $HoleNumber: holeNumber });
};

export const deleteHoleDeadlySinsByHole = async (roundId: number, holeNumber: number): Promise<boolean> => {
    return runStatement('db.deleteHoleDeadlySinsByHole', 'DELETE FROM HoleDeadlySins WHERE RoundId = $RoundId AND HoleNumber = $HoleNumber;', { $RoundId: roundId, $HoleNumber: holeNumber });
};

// One row of DrillHistory as stored
export type DrillHistoryRow = {
    Id: number;
    Name: string;
    Result: number;
    DrillId: number | null;
    Score: number | null;
    Created_At: string;
};

export const getAllDrillHistory = () => {
    const sqlStatement = `SELECT * FROM DrillHistory ORDER BY Id DESC;`

    return get<DrillHistoryRow>(sqlStatement);
}


export const insertRound = async (courseName: string, isScoreOnly: boolean, startHole: number = 1): Promise<number | null> => {
    try {
        const db = await SQLite.openDatabaseAsync(dbName);
        const now = new Date().toISOString();

        const statement = await db.prepareAsync(
            'INSERT INTO Rounds (TotalScore, StartTime, IsCompleted, CourseName, Created_At, IsScoreOnly, StartHole) VALUES (0, $StartTime, 0, $CourseName, $Created_At, $IsScoreOnly, $StartHole);'
        );

        try {
            const result = await statement.executeAsync({ $StartTime: now, $CourseName: courseName || null, $Created_At: now, $IsScoreOnly: isScoreOnly ? 1 : 0, $StartHole: startHole });
            return result.lastInsertRowId;
        } finally {
            await statement.finalizeAsync();
        }
    } catch (e) {
        void logError('db.insertRound', e);
        return null;
    }
};

export const updateRoundStartTime = async (roundId: number, startTime: string): Promise<boolean> => {
    return runStatement('db.updateRoundStartTime', 'UPDATE Rounds SET StartTime = $StartTime WHERE Id = $Id;', { $StartTime: startTime, $Id: roundId });
};

export const updateRound = async (roundId: number, totalScore: number): Promise<boolean> => {
    const now = new Date().toISOString();
    return runStatement('db.updateRound', 'UPDATE Rounds SET TotalScore = $TotalScore, EndTime = $EndTime, IsCompleted = 1 WHERE Id = $Id;', { $TotalScore: totalScore, $EndTime: now, $Id: roundId });
};

export const getRoundById = (roundId: number) => {
    const rows = getSyncDb().getAllSync('SELECT * FROM Rounds WHERE Id = ?;', [roundId]);
    return rows.length > 0 ? rows[0] : null;
};

export const getActiveRound = () => {
    const rows = getSyncDb().getAllSync('SELECT * FROM Rounds WHERE IsCompleted = 0 ORDER BY Id DESC LIMIT 1;');
    return rows.length > 0 ? rows[0] : null;
};

export const getAllRounds = () => {
    return getSyncDb().getAllSync('SELECT * FROM Rounds WHERE IsCompleted = 1 ORDER BY Id DESC;');
};

export const getDistinctCourseNames = () => {
    return getSyncDb().getAllSync("SELECT CourseName, MAX(Id) as Id FROM Rounds WHERE CourseName IS NOT NULL AND CourseName != '' AND LOWER(TRIM(CourseName)) NOT IN (SELECT LOWER(TRIM(Name)) FROM HiddenRecents WHERE Type = 'course') GROUP BY LOWER(TRIM(CourseName)) ORDER BY Id DESC;");
};

export const getHoleParsForCourse = (courseName: string): { HoleNumber: number; HolePar: number }[] => {
    return getSyncDb().getAllSync(
        `SELECT HoleNumber, HolePar FROM RoundHoleScores
         WHERE RoundId = (
           SELECT Id FROM Rounds WHERE LOWER(TRIM(CourseName)) = LOWER(TRIM(?)) AND IsCompleted = 1 ORDER BY Id DESC LIMIT 1
         )
         GROUP BY HoleNumber;`,
        [courseName]
    ) as { HoleNumber: number; HolePar: number }[];
};

export const getAllHoleNotesForCourse = (courseName: string): { HoleNumber: number; Note: string }[] => {
    return getSyncDb().getAllSync(
        'SELECT HoleNumber, Note FROM HoleNotes WHERE LOWER(TRIM(CourseName)) = LOWER(TRIM(?)) ORDER BY HoleNumber ASC;',
        [courseName]
    ) as { HoleNumber: number; Note: string }[];
};

export const upsertHoleNote = async (courseName: string, holeNumber: number, note: string): Promise<boolean> => {
    let success = true;
    const db = await SQLite.openDatabaseAsync(dbName);
    const now = new Date().toISOString();

    const updateStatement = await db.prepareAsync(
        'UPDATE HoleNotes SET Note = $Note, Updated_At = $Updated_At WHERE LOWER(TRIM(CourseName)) = LOWER(TRIM($CourseName)) AND HoleNumber = $HoleNumber;'
    );
    try {
        const result = await updateStatement.executeAsync({ $CourseName: courseName, $HoleNumber: holeNumber, $Note: note, $Updated_At: now });
        if (result.changes > 0) {
            return true;
        }
    } catch (e) {
        void logError('db.upsertHoleNote', e);
        success = false;
    } finally {
        await updateStatement.finalizeAsync();
    }

    if (!success) return false;

    const insertStatement = await db.prepareAsync(
        'INSERT INTO HoleNotes (CourseName, HoleNumber, Note, Updated_At) VALUES ($CourseName, $HoleNumber, $Note, $Updated_At);'
    );
    try {
        await insertStatement.executeAsync({ $CourseName: courseName, $HoleNumber: holeNumber, $Note: note, $Updated_At: now });
    } catch (e) {
        void logError('db.upsertHoleNote', e);
        success = false;
    } finally {
        await insertStatement.finalizeAsync();
    }
    return success;
};

export const deleteHoleNote = async (courseName: string, holeNumber: number): Promise<boolean> => {
    return runStatement('db.deleteHoleNote', 'DELETE FROM HoleNotes WHERE LOWER(TRIM(CourseName)) = LOWER(TRIM($CourseName)) AND HoleNumber = $HoleNumber;', { $CourseName: courseName, $HoleNumber: holeNumber });
};

export const addHiddenRecent = async (type: 'course' | 'player', name: string): Promise<boolean> => {
    return runStatement('db.addHiddenRecent', 'INSERT OR IGNORE INTO HiddenRecents (Type, Name) VALUES ($Type, $Name);', { $Type: type, $Name: name });
};

// Single-row table for UI preferences that are not part of Settings (Settings is rewritten whole on every save)
export const getRoundFilterPreference = (): string | null => {
    const rows = getSyncDb().getAllSync('SELECT RoundFilter FROM UiPreferences WHERE Id = 1;') as { RoundFilter: string }[];
    return rows[0]?.RoundFilter ?? null;
};

export const saveRoundFilterPreference = async (value: string): Promise<boolean> => {
    return runStatement('db.saveRoundFilterPreference', 'INSERT OR REPLACE INTO UiPreferences (Id, RoundFilter) VALUES (1, $RoundFilter);', { $RoundFilter: value });
};

export const getHolesPlayedForRound = (roundId: number): number => {
    const rows = getSyncDb().getAllSync('SELECT COUNT(DISTINCT HoleNumber) as count FROM RoundHoleScores WHERE RoundId = ?;', [roundId]) as { count: number }[];
    return rows[0]?.count ?? 0;
};

export const getClubDistances = () => {
    return getSyncDb().getAllSync('SELECT * FROM ClubDistances ORDER BY CarryDistance DESC;');
};

export const insertClubDistances = async (distances: { Club: string; CarryDistance: number; TotalDistance: number; }[]): Promise<boolean> => {
    let success = true;
    try {
        getSyncDb().execSync('DELETE FROM ClubDistances');

        for (const item of distances) {
            const statement = getSyncDb().prepareSync(
                'INSERT INTO ClubDistances (Club, CarryDistance, TotalDistance) VALUES ($Club, $CarryDistance, $TotalDistance)'
            );

            try {
                await statement.executeAsync({ $Club: item.Club, $CarryDistance: item.CarryDistance, $TotalDistance: item.TotalDistance });
            } finally {
                await statement.finalizeAsync();
            }
        }
    } catch (e) {
        void logError('db.insertClubDistances', e);
        success = false;
    }

    return success;
};

export const insertRoundPlayer = async (roundId: number, playerName: string, isUser: number, sortOrder: number): Promise<number | null> => {
    try {
        const db = await SQLite.openDatabaseAsync(dbName);

        const statement = await db.prepareAsync(
            'INSERT INTO RoundPlayers (RoundId, PlayerName, IsUser, SortOrder) VALUES ($RoundId, $PlayerName, $IsUser, $SortOrder);'
        );

        try {
            const result = await statement.executeAsync({ $RoundId: roundId, $PlayerName: playerName, $IsUser: isUser, $SortOrder: sortOrder });
            return result.lastInsertRowId;
        } finally {
            await statement.finalizeAsync();
        }
    } catch (e) {
        void logError('db.insertRoundPlayer', e);
        return null;
    }
};

export const getRoundPlayers = (roundId: number) => {
    return getSyncDb().getAllSync('SELECT * FROM RoundPlayers WHERE RoundId = ? ORDER BY SortOrder ASC;', [roundId]);
};

export const insertRoundHoleScore = async (roundId: number, roundPlayerId: number, holeNumber: number, holePar: number, score: number): Promise<boolean> => {
    return runStatement('db.insertRoundHoleScore', 'INSERT INTO RoundHoleScores (RoundId, RoundPlayerId, HoleNumber, HolePar, Score) VALUES ($RoundId, $RoundPlayerId, $HoleNumber, $HolePar, $Score);', { $RoundId: roundId, $RoundPlayerId: roundPlayerId, $HoleNumber: holeNumber, $HolePar: holePar, $Score: score });
};

export const deleteRoundHoleScoresByHole = async (roundId: number, holeNumber: number): Promise<boolean> => {
    return runStatement('db.deleteRoundHoleScoresByHole', 'DELETE FROM RoundHoleScores WHERE RoundId = $RoundId AND HoleNumber = $HoleNumber;', { $RoundId: roundId, $HoleNumber: holeNumber });
};

export const getRoundHoleScores = (roundId: number) => {
    return getSyncDb().getAllSync('SELECT * FROM RoundHoleScores WHERE RoundId = ? ORDER BY HoleNumber ASC, RoundPlayerId ASC;', [roundId]);
};

export const updateRoundHoleScore = async (id: number, score: number): Promise<boolean> => {
    return runStatement('db.updateRoundHoleScore', 'UPDATE RoundHoleScores SET Score = $Score WHERE Id = $Id;', { $Score: score, $Id: id });
};

export const updateRoundHoleParForHole = async (roundId: number, holeNumber: number, holePar: number): Promise<boolean> => {
    return runStatement('db.updateRoundHoleParForHole', 'UPDATE RoundHoleScores SET HolePar = $HolePar WHERE RoundId = $RoundId AND HoleNumber = $HoleNumber;', { $HolePar: holePar, $RoundId: roundId, $HoleNumber: holeNumber });
};

export const updateRoundTotalScore = async (roundId: number, totalScore: number): Promise<boolean> => {
    return runStatement('db.updateRoundTotalScore', 'UPDATE Rounds SET TotalScore = $TotalScore WHERE Id = $Id;', { $TotalScore: totalScore, $Id: roundId });
};

// Child rows first, then the round itself. They run in one transaction, so a failure leaves nothing half deleted.
const DELETE_ROUND_STATEMENTS = [
    'DELETE FROM HoleDeadlySins WHERE RoundId = $RoundId;',
    'DELETE FROM RoundHoleScores WHERE RoundId = $RoundId;',
    'DELETE FROM RoundPlayers WHERE RoundId = $RoundId;',
    'DELETE FROM Rounds WHERE Id = $RoundId;',
];

export const deleteRound = async (roundId: number): Promise<boolean> => {
    try {
        const db = await SQLite.openDatabaseAsync(dbName);
        await db.withTransactionAsync(async () => {
            for (const sql of DELETE_ROUND_STATEMENTS) {
                const statement = await db.prepareAsync(sql);
                try {
                    await statement.executeAsync({ $RoundId: roundId });
                } finally {
                    await statement.finalizeAsync();
                }
            }
        });
        return true;
    } catch (e) {
        void logError('db.deleteRound', e);
        return false;
    }
};

export const getSettings = () => {
    const rows = getSyncDb().getAllSync('SELECT * FROM Settings LIMIT 1;');
    return rows.length > 0 ? rows[0] : null;
};

export const saveSettings = async (notificationsEnabled: number, voice: string, soundsEnabled: number, wedgeChartOnboardingSeen: number, distancesOnboardingSeen: number, playOnboardingSeen: number, homeOnboardingSeen: number, practiceOnboardingSeen: number, reviewPromptShown: number, whatsNewVersionSeen: string, settingsOnboardingSeen: number, performOnboardingSeen: number, tempoBpm: number, units: string, skipStatsFlowEnabled: number, badHoleReassuranceEnabled: number, quickTools: string): Promise<boolean> => {
    let success = true;
    try {
        getSyncDb().execSync('DELETE FROM Settings');

        const statement = getSyncDb().prepareSync(
            'INSERT INTO Settings (NotificationsEnabled, Voice, SoundsEnabled, WedgeChartOnboardingSeen, DistancesOnboardingSeen, PlayOnboardingSeen, HomeOnboardingSeen, PracticeOnboardingSeen, ReviewPromptShown, WhatsNewVersionSeen, SettingsOnboardingSeen, PerformOnboardingSeen, TempoBpm, Units, SkipStatsFlowEnabled, BadHoleReassuranceEnabled, QuickTools) VALUES ($NotificationsEnabled, $Voice, $SoundsEnabled, $WedgeChartOnboardingSeen, $DistancesOnboardingSeen, $PlayOnboardingSeen, $HomeOnboardingSeen, $PracticeOnboardingSeen, $ReviewPromptShown, $WhatsNewVersionSeen, $SettingsOnboardingSeen, $PerformOnboardingSeen, $TempoBpm, $Units, $SkipStatsFlowEnabled, $BadHoleReassuranceEnabled, $QuickTools)'
        );

        try {
            await statement.executeAsync({ $NotificationsEnabled: notificationsEnabled, $Voice: voice, $SoundsEnabled: soundsEnabled, $WedgeChartOnboardingSeen: wedgeChartOnboardingSeen, $DistancesOnboardingSeen: distancesOnboardingSeen, $PlayOnboardingSeen: playOnboardingSeen, $HomeOnboardingSeen: homeOnboardingSeen, $PracticeOnboardingSeen: practiceOnboardingSeen, $ReviewPromptShown: reviewPromptShown, $WhatsNewVersionSeen: whatsNewVersionSeen, $SettingsOnboardingSeen: settingsOnboardingSeen, $PerformOnboardingSeen: performOnboardingSeen, $TempoBpm: tempoBpm, $Units: units, $SkipStatsFlowEnabled: skipStatsFlowEnabled, $BadHoleReassuranceEnabled: badHoleReassuranceEnabled, $QuickTools: quickTools });
        } finally {
            await statement.finalizeAsync();
        }
    } catch (e) {
        void logError('db.saveSettings', e);
        success = false;
    }

    return success;
};


export const insertPracticeReminder = async (label: string, scheduledFor: string, notificationId: string | null): Promise<boolean> => {
    return runStatement('db.insertPracticeReminder', 'INSERT INTO PracticeReminders (Label, ScheduledFor, NotificationId, Created_At) VALUES ($Label, $ScheduledFor, $NotificationId, $Created_At);', { $Label: label, $ScheduledFor: scheduledFor, $NotificationId: notificationId, $Created_At: new Date().toISOString() });
};

export const getAllPracticeReminders = () => {
    return getSyncDb().getAllSync('SELECT * FROM PracticeReminders ORDER BY Id DESC;');
};

export const deletePracticeReminder = async (id: number): Promise<boolean> => {
    return runStatement('db.deletePracticeReminder', 'DELETE FROM PracticeReminders WHERE Id = $Id;', { $Id: id });
};

export const updatePracticeReminderNotificationId = async (id: number, notificationId: string | null): Promise<void> => {
    const db = await SQLite.openDatabaseAsync(dbName);
    const statement = await db.prepareAsync(
        'UPDATE PracticeReminders SET NotificationId = $NotificationId WHERE Id = $Id;'
    );
    try {
        await statement.executeAsync({ $NotificationId: notificationId, $Id: id });
    } finally {
        await statement.finalizeAsync();
    }
};

export const getAllRoundsWithPlayersAndScores = () => {
    const sql = `
        SELECT
            r.Id, r.TotalScore, r.StartTime, r.EndTime, r.IsCompleted, r.CourseName, r.Created_At, r.IsScoreOnly,
            rp.Id AS UserPlayerId,
            SUM(CASE WHEN rhs.RoundPlayerId = rp.Id THEN rhs.Score ELSE NULL END) AS StrokeTotal,
            COUNT(DISTINCT rhs.HoleNumber) AS HolesPlayed
        FROM Rounds r
        LEFT JOIN RoundPlayers rp ON rp.RoundId = r.Id AND rp.IsUser = 1
        LEFT JOIN RoundHoleScores rhs ON rhs.RoundId = r.Id
        WHERE r.IsCompleted = 1
        GROUP BY r.Id
        ORDER BY r.Id DESC;
    `;
    return getSyncDb().getAllSync(sql);
};

function get<T>(sql: string): T[] {
    return getSyncDb().getAllSync(sql) as T[];
};

export const getAllRoundHoleScoresWithContext = () => {
    const sql = `
        SELECT rhs.RoundId, r.CourseName, r.Created_At, rhs.HoleNumber, rhs.HolePar, rhs.Score
        FROM RoundHoleScores rhs
        JOIN RoundPlayers rp ON rhs.RoundPlayerId = rp.Id AND rp.IsUser = 1
        JOIN Rounds r ON rhs.RoundId = r.Id
        WHERE r.IsCompleted = 1
        ORDER BY r.Id DESC, rhs.HoleNumber ASC
    `;
    return getSyncDb().getAllSync(sql);
};

export const getAllHoleDeadlySinsWithContext = () => {
    const sql = `
        SELECT hds.RoundId, r.CourseName, r.Created_At, hds.HoleNumber, hds.ThreePutts, hds.DoubleBogeys,
               hds.BogeysPar5, hds.BogeysInside9Iron, hds.DoubleChips, hds.TroubleOffTee, hds.Penalties
        FROM HoleDeadlySins hds
        JOIN Rounds r ON hds.RoundId = r.Id
        WHERE r.IsCompleted = 1
        ORDER BY r.Id DESC, hds.HoleNumber ASC
    `;
    return getSyncDb().getAllSync(sql);
};

export const getAllPuttingStatsWithContext = () => {
    const sql = `
        SELECT ps.RoundId, r.CourseName, r.Created_At, ps.HoleNumber, ps.FirstPuttDistance,
               ps.SecondPuttDistance, ps.SecondPuttIsLong, ps.ThirdPuttDistance, ps.ThirdPuttIsLong, ps.GreenInRegulation
        FROM PuttingStats ps
        JOIN Rounds r ON ps.RoundId = r.Id
        WHERE r.IsCompleted = 1
        ORDER BY r.Id DESC, ps.HoleNumber ASC
    `;
    return getSyncDb().getAllSync(sql);
};

