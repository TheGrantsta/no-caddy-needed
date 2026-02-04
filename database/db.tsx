import * as SQLite from 'expo-sqlite';

const dbName = 'NoCaddyNeeded.db';

export const initialize = async () => {
    const db = await SQLite.openDatabaseAsync(dbName);

    await db.execAsync(`
        PRAGMA journal_mode = WAL;
        CREATE TABLE IF NOT EXISTS WedgeChart (Id INTEGER PRIMARY KEY AUTOINCREMENT, Club TEXT NOT NULL, HalfSwing INTEGER NOT NULL, ThreeQuarterSwing INTEGER NOT NULL, FullSwing INTEGER NOT NULL);
        CREATE TABLE IF NOT EXISTS Drills (Id INTEGER PRIMARY KEY AUTOINCREMENT, Name TEXT NOT NULL, Result BOOLEAN NOT NULL, Created_At TEXT NOT NULL);
        CREATE TABLE IF NOT EXISTS Tiger5Rounds (Id INTEGER PRIMARY KEY AUTOINCREMENT, ThreePutts INTEGER NOT NULL DEFAULT 0, DoubleBogeys INTEGER NOT NULL DEFAULT 0, BogeysPar5 INTEGER NOT NULL DEFAULT 0, BogeysInside9Iron INTEGER NOT NULL DEFAULT 0, DoubleChips INTEGER NOT NULL DEFAULT 0, Total INTEGER NOT NULL DEFAULT 0, RoundId INTEGER, Created_At TEXT NOT NULL);
        CREATE TABLE IF NOT EXISTS Rounds (Id INTEGER PRIMARY KEY AUTOINCREMENT, CoursePar INTEGER NOT NULL, TotalScore INTEGER NOT NULL DEFAULT 0, StartTime TEXT NOT NULL, EndTime TEXT, IsCompleted INTEGER NOT NULL DEFAULT 0, Created_At TEXT NOT NULL);
        CREATE TABLE IF NOT EXISTS RoundHoles (Id INTEGER PRIMARY KEY AUTOINCREMENT, RoundId INTEGER NOT NULL, HoleNumber INTEGER NOT NULL, ScoreRelativeToPar INTEGER NOT NULL, FOREIGN KEY (RoundId) REFERENCES Rounds(Id));
        CREATE TABLE IF NOT EXISTS ClubDistances (Id INTEGER PRIMARY KEY AUTOINCREMENT, Club TEXT NOT NULL UNIQUE, CarryDistance INTEGER NOT NULL);
        CREATE TABLE IF NOT EXISTS RoundPlayers (Id INTEGER PRIMARY KEY AUTOINCREMENT, RoundId INTEGER NOT NULL, PlayerName TEXT NOT NULL, IsUser INTEGER NOT NULL DEFAULT 0, SortOrder INTEGER NOT NULL, FOREIGN KEY (RoundId) REFERENCES Rounds(Id));
        CREATE TABLE IF NOT EXISTS RoundHoleScores (Id INTEGER PRIMARY KEY AUTOINCREMENT, RoundId INTEGER NOT NULL, RoundPlayerId INTEGER NOT NULL, HoleNumber INTEGER NOT NULL, HolePar INTEGER NOT NULL, Score INTEGER NOT NULL, FOREIGN KEY (RoundId) REFERENCES Rounds(Id), FOREIGN KEY (RoundPlayerId) REFERENCES RoundPlayers(Id));
    `);
};

export const insertDrillResult = async (name: string, result: boolean) => {
    let success = true;
    const db = await SQLite.openDatabaseAsync(dbName);

    const statement = await db.prepareAsync(
        'INSERT INTO Drills (Name, Result, Created_At) VALUES ($Name, $Result, $Created_At);'
    );

    try {
        await statement.executeAsync({ $Name: name, $Result: result, $Created_At: new Date().toISOString() });
    } catch (e) {
        console.log(e);
        success = false;
    } finally {
        await statement.finalizeAsync();
    }

    return success;
};

export const getWedgeChart = () => {
    const sqlStatement = 'SELECT * FROM WedgeChart ORDER BY FullSwing DESC;';

    return get(sqlStatement);
}

export const insertWedgeChart = async (wedgeChart: any[]) => {
    let success = true;
    const db = SQLite.openDatabaseSync(dbName);

    db.execSync('DELETE FROM WedgeChart');

    wedgeChart.forEach(async (item) => {
        const statement = db.prepareSync(
            'INSERT INTO WedgeChart (Club, HalfSwing, ThreeQuarterSwing, FullSwing) VALUES ($Club, $HalfSwing, $ThreeQuarterSwing, $FullSwing)'
        );

        try {
            await statement.executeAsync({ $Club: item[0], $HalfSwing: item[1], $ThreeQuarterSwing: item[2], $FullSwing: item[3] });
        } catch (e) {
            console.log(e);
            success = false;
        } finally {
            await statement.finalizeAsync();
        }
    });

    return success;
};

export const insertTiger5Round = async (threePutts: number, doubleBogeys: number, bogeysPar5: number, bogeysInside9Iron: number, doubleChips: number, total: number) => {
    let success = true;
    const db = await SQLite.openDatabaseAsync(dbName);

    const statement = await db.prepareAsync(
        'INSERT INTO Tiger5Rounds (ThreePutts, DoubleBogeys, BogeysPar5, BogeysInside9Iron, DoubleChips, Total, Created_At) VALUES ($ThreePutts, $DoubleBogeys, $BogeysPar5, $BogeysInside9Iron, $DoubleChips, $Total, $Created_At);'
    );

    try {
        await statement.executeAsync({ $ThreePutts: threePutts, $DoubleBogeys: doubleBogeys, $BogeysPar5: bogeysPar5, $BogeysInside9Iron: bogeysInside9Iron, $DoubleChips: doubleChips, $Total: total, $Created_At: new Date().toISOString() });
    } catch (e) {
        console.log(e);
        success = false;
    } finally {
        await statement.finalizeAsync();
    }

    return success;
};

export const getAllTiger5Rounds = () => {
    const sqlStatement = 'SELECT * FROM Tiger5Rounds ORDER BY Id DESC;';

    return get(sqlStatement);
};

export const getAllDrillHistory = () => {
    const sqlStatement = `SELECT * FROM Drills ORDER BY Id DESC;`

    return get(sqlStatement);
}

export const insertRound = async (coursePar: number): Promise<number | null> => {
    try {
        const db = await SQLite.openDatabaseAsync(dbName);
        const now = new Date().toISOString();

        const statement = await db.prepareAsync(
            'INSERT INTO Rounds (CoursePar, TotalScore, StartTime, IsCompleted, Created_At) VALUES ($CoursePar, 0, $StartTime, 0, $Created_At);'
        );

        try {
            const result = await statement.executeAsync({ $CoursePar: coursePar, $StartTime: now, $Created_At: now });
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
        alert(e.message);
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

function get(sql: string) {
    const rows: any[] = [];
    const db = SQLite.openDatabaseSync(dbName);

    const allRows = db.getAllSync(sql);

    allRows.forEach((item) => {
        rows.push(item);
    });

    return rows;
};
