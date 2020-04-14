"use strict";
const { Pool } = require('pg')
/*CREATE TABLE imgs (
    id INT PRIMARY KEY,
    explicitness CHAR(1),
    rating FLOAT,
    file_ext CHAR(3),
    path VARCHAR(128)
)*/
/*CREATE TABLE userRatings (
    userID INT,
    id INT,
    rating FLOAT
)*/

const pool = new Pool({
    user: 'node',
    host: 'localhost',
    database: 'danbooru',
    password: 'System5362<cut<<',
    port: 5432,
});

let base = "/home/lukas/Documents/metadata/20190000000000"
const readline = require('readline');
const fs = require('fs');

const cliProgress = require('cli-progress');
const bar1 = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
bar1.start(3708763, 0);
let querys = []

const jitson = require('jitson');
const parse = jitson()
for (let i = 0; i < 13; i++) {
    var lines = fs.readFileSync(base + i.toString().padStart(2,'0'), 'utf-8').split('\n').filter(Boolean);
    for (const line of lines) {
        bar1.increment();
        //console.log(JSON.parse(line));
        let query = "INSERT INTO imgs (id, explicitness, file_ext, path) VALUES (";
        //line = JSON.parse(line);
        let json = parse(line);
        let path = getPath(json.id);
        //console.log(line.id);
        if(path){
            query += json.id+",";
            query += "'"+json.rating+"',";
            query += "'"+json.file_ext+"',";
            query += "'"+path+"'";
            query += ");";
            //console.log(query);
            querys.push(query);
            //console.log("hi")
            //await pool.query(query);
            //console.log(result);
        }
    }
}
const bar2 = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
bar2.start(querys.length, 0);
console.log(querys.length)
async function queries() {
    for (let i = 0; i < querys.length; i++) {
        try {
            await pool.query(querys[i]);
        } catch (e) {
            console.log(e)
        }
        bar2.increment();
    }
}
queries();
console.log(querys.length)


function getPath(identifier) {
    let string = "/run/media/lukas/Data4Tb/danbooru2019/original/";
    string += '0' + (identifier % 1000).toString().padStart(3, '0') + '/'
    string += identifier + '.'
    if (fs.existsSync(string + 'jpg'))
        string += 'jpg'
    else if (fs.existsSync(string + 'png'))
        string += 'png'
    else {
        return false;
    }
    return string
}

//pool.query("INSERT INTO imgs (id, explicitness, file_ext, path)")