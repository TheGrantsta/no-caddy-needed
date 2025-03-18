import * as SQLite from 'expo-sqlite';

const dbName = 'NoCaddyNeeded.db';

export const initialize = async () => {
    const db = await SQLite.openDatabaseAsync(dbName);

    await db.execAsync(`
        PRAGMA journal_mode = WAL;
        CREATE TABLE IF NOT EXISTS WedgeChart (Id INTEGER PRIMARY KEY AUTOINCREMENT, Club TEXT NOT NULL, HalfSwing INTEGER NOT NULL, ThreeQuarterSwing INTEGER NOT NULL, FullSwing INTEGER NOT NULL);
        CREATE TABLE IF NOT EXISTS Drills (Id INTEGER PRIMARY KEY AUTOINCREMENT, Name TEXT NOT NULL, Result BOOLEAN NOT NULL, Created_At TEXT NOT NULL);
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

function get(sql: string) {
    const rows: any[] = [];
    const db = SQLite.openDatabaseSync(dbName);

    const allRows = db.getAllSync(sql);

    allRows.forEach((item) => {
        rows.push(item);
    });

    return rows;
};
