import * as SQLite from 'expo-sqlite';
import { drillSeedData } from '../data/drillSeedData';

const dbName = 'NoCaddyNeeded.db';

export type TableAmendment = {
    table: string;
    columnsToAdd: string[];
    columnsToRemove: string[];
};

export const amendTable = (syncDb: SQLite.SQLiteDatabase, amendment: TableAmendment): void => {
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
    const db = await SQLite.openDatabaseAsync(dbName);

    await db.execAsync(`
        PRAGMA journal_mode = WAL;
        CREATE TABLE IF NOT EXISTS WedgeChartDistanceNames (Id INTEGER PRIMARY KEY AUTOINCREMENT, Name TEXT NOT NULL, SortOrder INTEGER NOT NULL);
        CREATE TABLE IF NOT EXISTS WedgeChartEntries (Id INTEGER PRIMARY KEY AUTOINCREMENT, Club TEXT NOT NULL, DistanceName TEXT NOT NULL, Distance INTEGER NOT NULL, ClubSortOrder INTEGER NOT NULL, DistanceSortOrder INTEGER NOT NULL);
        CREATE TABLE IF NOT EXISTS DrillHistory (Id INTEGER PRIMARY KEY AUTOINCREMENT, Name TEXT NOT NULL, Result BOOLEAN NOT NULL, DrillId INTEGER, Created_At TEXT NOT NULL);
        CREATE TABLE IF NOT EXISTS Drills (Id INTEGER PRIMARY KEY AUTOINCREMENT, Category TEXT NOT NULL, Label TEXT NOT NULL, IconName TEXT NOT NULL, Target TEXT NOT NULL, Objective TEXT NOT NULL, SetUp TEXT NOT NULL, HowToPlay TEXT NOT NULL, IsActive INTEGER NOT NULL DEFAULT 1);
        CREATE TABLE IF NOT EXISTS DeadlySinsRounds (Id INTEGER PRIMARY KEY AUTOINCREMENT, ThreePutts INTEGER NOT NULL DEFAULT 0, DoubleBogeys INTEGER NOT NULL DEFAULT 0, BogeysPar5 INTEGER NOT NULL DEFAULT 0, BogeysInside9Iron INTEGER NOT NULL DEFAULT 0, DoubleChips INTEGER NOT NULL DEFAULT 0, TroubleOffTee INTEGER NOT NULL DEFAULT 0, Penalties INTEGER NOT NULL DEFAULT 0, Total INTEGER NOT NULL DEFAULT 0, RoundId INTEGER, Created_At TEXT NOT NULL);
        CREATE TABLE IF NOT EXISTS Rounds (Id INTEGER PRIMARY KEY AUTOINCREMENT, CoursePar INTEGER NOT NULL DEFAULT 0, TotalScore INTEGER NOT NULL DEFAULT 0, StartTime TEXT NOT NULL, EndTime TEXT, IsCompleted INTEGER NOT NULL DEFAULT 0, CourseName TEXT, Created_At TEXT NOT NULL);
        CREATE TABLE IF NOT EXISTS RoundHoles (Id INTEGER PRIMARY KEY AUTOINCREMENT, RoundId INTEGER NOT NULL, HoleNumber INTEGER NOT NULL, ScoreRelativeToPar INTEGER NOT NULL, FOREIGN KEY (RoundId) REFERENCES Rounds(Id));
        CREATE TABLE IF NOT EXISTS ClubDistances (Id INTEGER PRIMARY KEY AUTOINCREMENT, Club TEXT NOT NULL UNIQUE, CarryDistance INTEGER NOT NULL);
        CREATE TABLE IF NOT EXISTS RoundPlayers (Id INTEGER PRIMARY KEY AUTOINCREMENT, RoundId INTEGER NOT NULL, PlayerName TEXT NOT NULL, IsUser INTEGER NOT NULL DEFAULT 0, SortOrder INTEGER NOT NULL, FOREIGN KEY (RoundId) REFERENCES Rounds(Id));
        CREATE TABLE IF NOT EXISTS RoundHoleScores (Id INTEGER PRIMARY KEY AUTOINCREMENT, RoundId INTEGER NOT NULL, RoundPlayerId INTEGER NOT NULL, HoleNumber INTEGER NOT NULL, HolePar INTEGER NOT NULL, Score INTEGER NOT NULL, FOREIGN KEY (RoundId) REFERENCES Rounds(Id), FOREIGN KEY (RoundPlayerId) REFERENCES RoundPlayers(Id));
        CREATE TABLE IF NOT EXISTS Settings (Id INTEGER PRIMARY KEY AUTOINCREMENT, Theme TEXT NOT NULL DEFAULT 'dark', NotificationsEnabled INTEGER NOT NULL DEFAULT 1, Voice TEXT NOT NULL DEFAULT 'female', SoundsEnabled INTEGER NOT NULL DEFAULT 1, WedgeChartOnboardingSeen INTEGER NOT NULL DEFAULT 0, DistancesOnboardingSeen INTEGER NOT NULL DEFAULT 0, PlayOnboardingSeen INTEGER NOT NULL DEFAULT 0, HomeOnboardingSeen INTEGER NOT NULL DEFAULT 0, PracticeOnboardingSeen INTEGER NOT NULL DEFAULT 0);
    `);

    const syncDb = SQLite.openDatabaseSync(dbName);

    const tiger5Columns = syncDb.getAllSync('PRAGMA table_info(Tiger5Rounds)');
    if (tiger5Columns.length > 0) {
        syncDb.execSync('ALTER TABLE Tiger5Rounds RENAME TO DeadlySinsRounds');
    }

    const oldDrillsColumns = syncDb.getAllSync('PRAGMA table_info(Drills)') as { name: string }[];
    const isOldDrillsTable = oldDrillsColumns.some(col => col.name === 'Name');
    if (isOldDrillsTable) {
        syncDb.execSync('ALTER TABLE Drills RENAME TO DrillHistory');
    }

    const migrations: TableAmendment[] = [
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
            ],
            columnsToRemove: [],
        },
        {
            table: 'Rounds',
            columnsToAdd: [],
            columnsToRemove: [
                'CoursePar'
            ],
        },
        {
            table: 'DeadlySinsRounds',
            columnsToAdd: [
                'TroubleOffTee INTEGER NOT NULL DEFAULT 0',
                'Penalties INTEGER NOT NULL DEFAULT 0',
                'RoundId INTEGER',
            ],
            columnsToRemove: [],
        },
        {
            table: 'DrillHistory',
            columnsToAdd: ['DrillId INTEGER'],
            columnsToRemove: [],
        },
    ];

    for (const migration of migrations) {
        amendTable(syncDb, migration);
    }

    const drillCount = syncDb.getAllSync('SELECT COUNT(*) as count FROM Drills') as { count: number }[];
    if (drillCount.length > 0 && drillCount[0].count === 0) {
        const escape = (s: string) => s.replace(/'/g, "''");
        const values = drillSeedData.map(d =>
            `('${escape(d.category)}', '${escape(d.label)}', '${escape(d.iconName)}', '${escape(d.target)}', '${escape(d.objective)}', '${escape(d.setUp)}', '${escape(d.howToPlay)}', 1)`
        ).join(', ');
        await db.execAsync(`INSERT INTO Drills (Category, Label, IconName, Target, Objective, SetUp, HowToPlay, IsActive) VALUES ${values};`);
    }
};

export const insertDrillResult = async (name: string, result: boolean, drillId: number | null = null) => {
    let success = true;
    const db = await SQLite.openDatabaseAsync(dbName);

    const statement = await db.prepareAsync(
        'INSERT INTO DrillHistory (Name, Result, DrillId, Created_At) VALUES ($Name, $Result, $DrillId, $Created_At);'
    );

    try {
        await statement.executeAsync({ $Name: name, $Result: result, $DrillId: drillId, $Created_At: new Date().toISOString() });
    } catch (e) {
        console.log(e);
        success = false;
    } finally {
        await statement.finalizeAsync();
    }

    return success;
};

export const getWedgeChartDistanceNames = () => {
    const db = SQLite.openDatabaseSync(dbName);
    return db.getAllSync('SELECT * FROM WedgeChartDistanceNames ORDER BY SortOrder ASC;');
};

export const getWedgeChartEntries = () => {
    const db = SQLite.openDatabaseSync(dbName);
    return db.getAllSync('SELECT * FROM WedgeChartEntries ORDER BY ClubSortOrder ASC, DistanceSortOrder ASC;');
};

export const insertWedgeChart = async (
    distanceNames: { Name: string; SortOrder: number }[],
    entries: { Club: string; DistanceName: string; Distance: number; ClubSortOrder: number; DistanceSortOrder: number }[]
): Promise<boolean> => {
    let success = true;
    try {
        const db = SQLite.openDatabaseSync(dbName);
        db.execSync('DELETE FROM WedgeChartDistanceNames');
        db.execSync('DELETE FROM WedgeChartEntries');

        for (const dn of distanceNames) {
            const statement = db.prepareSync(
                'INSERT INTO WedgeChartDistanceNames (Name, SortOrder) VALUES ($Name, $SortOrder)'
            );
            try {
                await statement.executeAsync({ $Name: dn.Name, $SortOrder: dn.SortOrder });
            } finally {
                await statement.finalizeAsync();
            }
        }

        for (const entry of entries) {
            const statement = db.prepareSync(
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
        console.log(e);
        success = false;
    }

    return success;
};

export const insertDeadlySinsRound = async (roundId: number | null, threePutts: number, doubleBogeys: number, bogeysPar5: number, bogeysInside9Iron: number, doubleChips: number, troubleOffTee: number, penalties: number, total: number) => {
    let success = true;
    const db = await SQLite.openDatabaseAsync(dbName);

    const statement = await db.prepareAsync(
        'INSERT INTO DeadlySinsRounds (RoundId, ThreePutts, DoubleBogeys, BogeysPar5, BogeysInside9Iron, DoubleChips, TroubleOffTee, Penalties, Total, Created_At) VALUES ($RoundId, $ThreePutts, $DoubleBogeys, $BogeysPar5, $BogeysInside9Iron, $DoubleChips, $TroubleOffTee, $Penalties, $Total, $Created_At);'
    );

    try {
        await statement.executeAsync({ $RoundId: roundId, $ThreePutts: threePutts, $DoubleBogeys: doubleBogeys, $BogeysPar5: bogeysPar5, $BogeysInside9Iron: bogeysInside9Iron, $DoubleChips: doubleChips, $TroubleOffTee: troubleOffTee, $Penalties: penalties, $Total: total, $Created_At: new Date().toISOString() });
    } catch (e) {
        console.log(e);
        success = false;
    } finally {
        await statement.finalizeAsync();
    }

    return success;
};

export const getAllDeadlySinsRounds = () => {
    const sqlStatement = 'SELECT * FROM DeadlySinsRounds ORDER BY Id DESC;';

    return get(sqlStatement);
};

export const getDeadlySinsRoundByRoundId = (roundId: number) => {
    const db = SQLite.openDatabaseSync(dbName);
    const rows = db.getAllSync('SELECT * FROM DeadlySinsRounds WHERE RoundId = ?;', [roundId]);
    return rows.length > 0 ? rows[0] : null;
};

export const getAllDrillHistory = () => {
    const sqlStatement = `SELECT * FROM DrillHistory ORDER BY Id DESC;`

    return get(sqlStatement);
}

export const getDrillsByCategory = (category: string) => {
    const db = SQLite.openDatabaseSync(dbName);
    return db.getAllSync(
        'SELECT * FROM Drills WHERE Category = ? ORDER BY IsActive DESC, Label ASC;',
        [category]
    );
};

export const updateDrillIsActive = async (id: number, isActive: boolean): Promise<boolean> => {
    let success = true;
    try {
        const db = await SQLite.openDatabaseAsync(dbName);

        const statement = await db.prepareAsync(
            'UPDATE Drills SET IsActive = $IsActive WHERE Id = $Id;'
        );

        try {
            await statement.executeAsync({ $IsActive: isActive ? 1 : 0, $Id: id });
        } finally {
            await statement.finalizeAsync();
        }
    } catch (e) {
        console.log(e);
        success = false;
    }

    return success;
};

export const insertDrill = async (category: string, label: string, iconName: string, target: string, objective: string, setUp: string, howToPlay: string): Promise<boolean> => {
    let success = true;
    try {
        const db = await SQLite.openDatabaseAsync(dbName);

        const statement = await db.prepareAsync(
            'INSERT INTO Drills (Category, Label, IconName, Target, Objective, SetUp, HowToPlay, IsActive) VALUES ($Category, $Label, $IconName, $Target, $Objective, $SetUp, $HowToPlay, $IsActive);'
        );

        try {
            await statement.executeAsync({ $Category: category, $Label: label, $IconName: iconName, $Target: target, $Objective: objective, $SetUp: setUp, $HowToPlay: howToPlay, $IsActive: 1 });
        } finally {
            await statement.finalizeAsync();
        }
    } catch (e) {
        console.log(e);
        success = false;
    }

    return success;
};

export const insertRound = async (courseName: string): Promise<number | null> => {
    try {
        const db = await SQLite.openDatabaseAsync(dbName);
        const now = new Date().toISOString();

        const statement = await db.prepareAsync(
            'INSERT INTO Rounds (TotalScore, StartTime, IsCompleted, CourseName, Created_At) VALUES (0, $StartTime, 0, $CourseName, $Created_At);'
        );

        try {
            const result = await statement.executeAsync({ $StartTime: now, $CourseName: courseName || null, $Created_At: now });
            return result.lastInsertRowId;
        } finally {
            await statement.finalizeAsync();
        }
    } catch (e) {
        console.log(e);
        return null;
    }
};

export const updateRound = async (roundId: number, totalScore: number): Promise<boolean> => {
    let success = true;
    try {
        const db = await SQLite.openDatabaseAsync(dbName);
        const now = new Date().toISOString();

        const statement = await db.prepareAsync(
            'UPDATE Rounds SET TotalScore = $TotalScore, EndTime = $EndTime, IsCompleted = 1 WHERE Id = $Id;'
        );

        try {
            await statement.executeAsync({ $TotalScore: totalScore, $EndTime: now, $Id: roundId });
        } finally {
            await statement.finalizeAsync();
        }
    } catch (e) {
        console.log(e);
        success = false;
    }

    return success;
};

export const insertRoundHole = async (roundId: number, holeNumber: number, scoreRelativeToPar: number): Promise<boolean> => {
    let success = true;
    try {
        const db = await SQLite.openDatabaseAsync(dbName);

        const statement = await db.prepareAsync(
            'INSERT INTO RoundHoles (RoundId, HoleNumber, ScoreRelativeToPar) VALUES ($RoundId, $HoleNumber, $ScoreRelativeToPar);'
        );

        try {
            await statement.executeAsync({ $RoundId: roundId, $HoleNumber: holeNumber, $ScoreRelativeToPar: scoreRelativeToPar });
        } finally {
            await statement.finalizeAsync();
        }
    } catch (e) {
        console.log(e);
        success = false;
    }

    return success;
};

export const getRoundById = (roundId: number) => {
    const db = SQLite.openDatabaseSync(dbName);
    const rows = db.getAllSync('SELECT * FROM Rounds WHERE Id = ?;', [roundId]);
    return rows.length > 0 ? rows[0] : null;
};

export const getRoundHoles = (roundId: number) => {
    const db = SQLite.openDatabaseSync(dbName);
    return db.getAllSync('SELECT * FROM RoundHoles WHERE RoundId = ? ORDER BY HoleNumber ASC;', [roundId]);
};

export const getActiveRound = () => {
    const db = SQLite.openDatabaseSync(dbName);
    const rows = db.getAllSync('SELECT * FROM Rounds WHERE IsCompleted = 0 ORDER BY Id DESC LIMIT 1;');
    return rows.length > 0 ? rows[0] : null;
};

export const getAllRounds = () => {
    const db = SQLite.openDatabaseSync(dbName);
    return db.getAllSync('SELECT * FROM Rounds WHERE IsCompleted = 1 ORDER BY Id DESC;');
};

export const getDistinctCourseNames = () => {
    const db = SQLite.openDatabaseSync(dbName);
    return db.getAllSync("SELECT DISTINCT CourseName FROM Rounds WHERE CourseName IS NOT NULL AND CourseName != '' ORDER BY Id DESC;");
};

export const getDistinctPlayerNames = () => {
    const db = SQLite.openDatabaseSync(dbName);
    return db.getAllSync("SELECT DISTINCT PlayerName FROM RoundPlayers WHERE IsUser = 0 AND PlayerName IS NOT NULL AND PlayerName != '' ORDER BY Id DESC;");
};

export const getHolesPlayedForRound = (roundId: number): number => {
    const db = SQLite.openDatabaseSync(dbName);
    const multiRows = db.getAllSync('SELECT COUNT(DISTINCT HoleNumber) as count FROM RoundHoleScores WHERE RoundId = ?;', [roundId]) as { count: number }[];
    if (multiRows[0]?.count > 0) return multiRows[0].count;
    const legacyRows = db.getAllSync('SELECT COUNT(*) as count FROM RoundHoles WHERE RoundId = ?;', [roundId]) as { count: number }[];
    return legacyRows[0]?.count ?? 0;
};

export const getClubDistances = () => {
    const db = SQLite.openDatabaseSync(dbName);
    return db.getAllSync('SELECT * FROM ClubDistances ORDER BY CarryDistance DESC;');
};

export const insertClubDistances = async (distances: { Club: string; CarryDistance: number; }[]): Promise<boolean> => {
    let success = true;
    try {
        const db = SQLite.openDatabaseSync(dbName);
        db.execSync('DELETE FROM ClubDistances');

        for (const item of distances) {
            const statement = db.prepareSync(
                'INSERT INTO ClubDistances (Club, CarryDistance) VALUES ($Club, $CarryDistance)'
            );

            try {
                await statement.executeAsync({ $Club: item.Club, $CarryDistance: item.CarryDistance });
            } finally {
                await statement.finalizeAsync();
            }
        }
    } catch (e) {
        console.log(e);
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
        console.log(e);
        return null;
    }
};

export const getRoundPlayers = (roundId: number) => {
    const db = SQLite.openDatabaseSync(dbName);
    return db.getAllSync('SELECT * FROM RoundPlayers WHERE RoundId = ? ORDER BY SortOrder ASC;', [roundId]);
};

export const insertRoundHoleScore = async (roundId: number, roundPlayerId: number, holeNumber: number, holePar: number, score: number): Promise<boolean> => {
    let success = true;
    try {
        const db = await SQLite.openDatabaseAsync(dbName);

        const statement = await db.prepareAsync(
            'INSERT INTO RoundHoleScores (RoundId, RoundPlayerId, HoleNumber, HolePar, Score) VALUES ($RoundId, $RoundPlayerId, $HoleNumber, $HolePar, $Score);'
        );

        try {
            await statement.executeAsync({ $RoundId: roundId, $RoundPlayerId: roundPlayerId, $HoleNumber: holeNumber, $HolePar: holePar, $Score: score });
        } finally {
            await statement.finalizeAsync();
        }
    } catch (e) {
        console.log(e);
        success = false;
    }

    return success;
};

export const deleteRoundHoleScoresByHole = async (roundId: number, holeNumber: number): Promise<boolean> => {
    let success = true;
    try {
        const db = await SQLite.openDatabaseAsync(dbName);
        const statement = await db.prepareAsync(
            'DELETE FROM RoundHoleScores WHERE RoundId = $RoundId AND HoleNumber = $HoleNumber;'
        );
        try {
            await statement.executeAsync({ $RoundId: roundId, $HoleNumber: holeNumber });
        } finally {
            await statement.finalizeAsync();
        }
    } catch (e) {
        console.log(e);
        success = false;
    }
    return success;
};

export const getRoundHoleScores = (roundId: number) => {
    const db = SQLite.openDatabaseSync(dbName);
    return db.getAllSync('SELECT * FROM RoundHoleScores WHERE RoundId = ? ORDER BY HoleNumber ASC, RoundPlayerId ASC;', [roundId]);
};

export const updateRoundHoleScore = async (id: number, score: number): Promise<boolean> => {
    let success = true;
    try {
        const db = await SQLite.openDatabaseAsync(dbName);

        const statement = await db.prepareAsync(
            'UPDATE RoundHoleScores SET Score = $Score WHERE Id = $Id;'
        );

        try {
            await statement.executeAsync({ $Score: score, $Id: id });
        } finally {
            await statement.finalizeAsync();
        }
    } catch (e) {
        console.log(e);
        success = false;
    }

    return success;
};

export const updateRoundTotalScore = async (roundId: number, totalScore: number): Promise<boolean> => {
    let success = true;
    try {
        const db = await SQLite.openDatabaseAsync(dbName);

        const statement = await db.prepareAsync(
            'UPDATE Rounds SET TotalScore = $TotalScore WHERE Id = $Id;'
        );

        try {
            await statement.executeAsync({ $TotalScore: totalScore, $Id: roundId });
        } finally {
            await statement.finalizeAsync();
        }
    } catch (e) {
        console.log(e);
        success = false;
    }

    return success;
};

export const deleteRound = async (roundId: number): Promise<boolean> => {
    let success = true;
    try {
        const db = await SQLite.openDatabaseAsync(dbName);

        await db.execAsync(`
            DELETE FROM DeadlySinsRounds WHERE RoundId = ${roundId};
            DELETE FROM RoundHoleScores WHERE RoundId = ${roundId};
            DELETE FROM RoundPlayers WHERE RoundId = ${roundId};
            DELETE FROM RoundHoles WHERE RoundId = ${roundId};
            DELETE FROM Rounds WHERE Id = ${roundId};
        `);
    } catch (e) {
        console.log(e);
        success = false;
    }

    return success;
};

export const getSettings = () => {
    const db = SQLite.openDatabaseSync(dbName);
    const rows = db.getAllSync('SELECT * FROM Settings LIMIT 1;');
    return rows.length > 0 ? rows[0] : null;
};

export const saveSettings = async (theme: string, notificationsEnabled: number, voice: string, soundsEnabled: number, wedgeChartOnboardingSeen: number, distancesOnboardingSeen: number, playOnboardingSeen: number, homeOnboardingSeen: number, practiceOnboardingSeen: number): Promise<boolean> => {
    let success = true;
    try {
        const db = SQLite.openDatabaseSync(dbName);
        db.execSync('DELETE FROM Settings');

        const statement = db.prepareSync(
            'INSERT INTO Settings (Theme, NotificationsEnabled, Voice, SoundsEnabled, WedgeChartOnboardingSeen, DistancesOnboardingSeen, PlayOnboardingSeen, HomeOnboardingSeen, PracticeOnboardingSeen) VALUES ($Theme, $NotificationsEnabled, $Voice, $SoundsEnabled, $WedgeChartOnboardingSeen, $DistancesOnboardingSeen, $PlayOnboardingSeen, $HomeOnboardingSeen, $PracticeOnboardingSeen)'
        );

        try {
            await statement.executeAsync({ $Theme: theme, $NotificationsEnabled: notificationsEnabled, $Voice: voice, $SoundsEnabled: soundsEnabled, $WedgeChartOnboardingSeen: wedgeChartOnboardingSeen, $DistancesOnboardingSeen: distancesOnboardingSeen, $PlayOnboardingSeen: playOnboardingSeen, $HomeOnboardingSeen: homeOnboardingSeen, $PracticeOnboardingSeen: practiceOnboardingSeen });
        } finally {
            await statement.finalizeAsync();
        }
    } catch (e) {
        console.log(e);
        success = false;
    }

    return success;
};

function get(sql: string) {
    const rows: any[] = [];
    const db = SQLite.openDatabaseSync(dbName);

    const allRows = db.getAllSync(sql);

    allRows.forEach((item) => {
        rows.push(item);
    });

    return rows;
};
