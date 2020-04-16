"use strict";
const { Pool } = require('pg')
const pool = new Pool({
    user: 'node',
    host: 'localhost',
    database: 'danbooru',
    password: 'System5362<cut<<',
    port: 5432,
});


const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const csvWriter = createCsvWriter({
    path: 'ratings.csv',
    header: [
        { id: 'path', title: 'x_col' },
        { id: 'rating', title: 'y_col' }
    ]
});

let records = [];

async function read() {
    let result;
    let offset = 0;
    const numRes = 10;
    for (let i = 0; i < numRes; i++) {
        result = await pool.query("SELECT * FROM imgs where explicitness = 's' LIMIT " + 1000 + " OFFSET " + offset);
        //console.log(JSON.stringify(result));
        offset += 1000;
        for (const line of result.rows) {
            records.push({ path: line.path.slice(47), rating: 0.0 });
        }
    }
    offset = 0;
    for (let i = 0; i < numRes; i++) {
        result = await pool.query("SELECT * FROM imgs where explicitness = 'q' LIMIT " + 1000 + " OFFSET " + offset);
        //console.log(JSON.stringify(result));
        offset += 1000;
        for (const line of result.rows) {
            records.push({ path: line.path.slice(47), rating: 0.5 });
        }
    }
    offset = 0;
    for (let i = 0; i < numRes; i++) {
        result = await pool.query("SELECT * FROM imgs where explicitness = 'e' LIMIT " + 1000 + " OFFSET " + offset);
        //console.log(JSON.stringify(result));
        offset += 1000;
        for (const line of result.rows) {
            records.push({ path: line.path.slice(47), rating: 1.0 });
        }
    }

    pool.end();
    csvWriter.writeRecords(records)
        .then(() => {
            console.log('...Done');
            process.exit();
        });
}
read();