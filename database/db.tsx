import * as SQLite from 'expo-sqlite';

const dbName = 'NoCaddyNeeded.db';

export const initialize = async () => {
    const db = await SQLite.openDatabaseAsync(dbName);

    await db.execAsync(`
        PRAGMA journal_mode = WAL;
        CREATE TABLE IF NOT EXISTS WedgeChart (Id INTEGER PRIMARY KEY AUTOINCREMENT, Club TEXT NOT NULL, HalfSwing INTEGER NOT NULL, ThreeQuarterSwing INTEGER NOT NULL, FullSwing INTEGER NOT NULL);
    `);
};

export const getWedgeChart = () => {
    const sqlStatement = 'SELECT * FROM WedgeChart ORDER BY FullSwing DESC;';

    return get(sqlStatement);
}

export const insertWedgeChart = (wedgeChart: any[]) => {
    const db = SQLite.openDatabaseSync(dbName);

    db.execSync('DELETE FROM WedgeChart');

    wedgeChart.forEach((item) => {
        const statement = db.prepareSync(
            'INSERT INTO WedgeChart (Club, HalfSwing, ThreeQuarterSwing, FullSwing) VALUES ($Club, $HalfSwing, $ThreeQuarterSwing, $FullSwing)'
        );

        try {
            statement.executeSync({ $Club: item[0], $HalfSwing: item[1], $ThreeQuarterSwing: item[2], $FullSwing: item[3] });
        } finally {
            statement.finalizeSync();
        }
    });
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
