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


let base = "/home/lukas/Documents/metadata/20190000000000"
const readline = require('readline');
const fs = require('fs');

const cliProgress = require('cli-progress');
const bar1 = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
let querys = []

let records = [];
let rating;

async function read() {
    let DO = true;
    let offset = 0;
    let result = await pool.query("SELECT count(*) FROM imgs");
    console.log(result.rows[0])
    bar1.start(result.rows[0].count, offset);
    while (DO) {
        result = await pool.query("SELECT * FROM imgs LIMIT " + 1000 + " OFFSET " +offset);
        bar1.increment(result.rowCount);
        //console.log(JSON.stringify(result));
        DO = result.rowCount === 1000;
        
        offset += 1000;
        for (const line of result.rows) {
            var rating = 1.0;
            if (line.explicitness == 's'){
                console.log("s")
                rating = 0.0;
            }
            if (line.explicitness === 'q')
                rating = 0.5;
            records.push({ path: line.path.slice(47), rating: rating });
        }
        if(records.length >= 10000) DO = false;
    }
    pool.end();
    csvWriter.writeRecords(records)       // returns a promise
    .then(() => {
        console.log('...Done');
        process.exit();
    });
}
read();