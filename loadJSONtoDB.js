"use strict";
const { Pool } = require('pg')
/*CREATE TABLE imgs (
    imID INT PRIMARY KEY,
    explicitness CHAR(1) NOT NULL,
    score INT,
    width INT,
    height INT,
    file_size INT,
    uploader_id INT,
    file_ext CHAR(3),
    path VARCHAR(255)
);*/
/*CREATE TABLE userRatings (
    userID INT NOT NULL,
    id INT NOT NULL,
    rating FLOAT NOT NULL
);*/
/*CREATE TABLE tags (
    tagID INT PRIMARY KEY,
    name VARCHAR(1024)
);*/
/*CREATE TABLE imtags (
    tagID INT,
    imID INT
);*/

const pool = new Pool({
    user: 'node',
    host: 'localhost',
    database: 'danbooru',
    password: 'System5362<cut<<',
    port: 5432,
});

let base = "/home/lukas/Documents/metadata/20190000000000";
const fs = require('fs');

const cliProgress = require('cli-progress');
const bar1 = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
bar1.start(3708763, 0);

let tagIDs = new Set();

const jitson = require('jitson');
const parse = jitson()
async function quieres() {
    await pool.query("DELETE FROM tags");
    await pool.query("DELETE FROM imgs");
    await pool.query("DELETE FROM imtags");

    for (let i = 0; i < 13; i++) {
        var lines = fs.readFileSync(base + i.toString().padStart(2, '0'), 'utf-8').split('\n').filter(Boolean);
        let queryTAG = [];
        let queryIMTAG = [];
        let querys = []
        for (const line of lines) {
            bar1.increment();
            //console.log(JSON.parse(line));

            //line = JSON.parse(line);
            let json = parse(line);
            let path = getPathGlob(json.id, json.file_ext);
            //console.log(path);
            //console.log(line.id);
            if (path && (json.file_ext === "jpg" || json.file_ext === "png")) {
                let q = "(" + json.id + ",";
                q += "'" + json.rating + "',";
                q += json.score + ",";
                q += json.image_width + ",";
                q += json.image_height + ",";
                q += json.file_size + ",";
                q += json.uploader_id + ",";
                q += "'" + json.file_ext + "',";
                q += "'" + path + "'";
                q += ")";
                querys.push(q);
                //console.log(query);
                if (querys.length > 1000) {
                    await pool.query("INSERT INTO imgs (imID, explicitness, score, width, height, file_size, uploader_id, file_ext, path) VALUES " + querys.join(","));
                    querys = [];
                }

                for (const tag of json.tags) {
                    if (queryIMTAG.length > 1000) {
                        await pool.query("INSERT INTO imtags (imID, tagID) VALUES " + queryIMTAG.join(","));
                        queryIMTAG = [];
                    }
                    queryIMTAG.push("(" + json.id + "," + tag.id + ")");
    
                    if (!tagIDs.has(tag.id)) {
                        queryTAG.push("(" + tag.id + ",'" + tag.name.replace(/'/g, "`") + "')");
                        if (queryTAG.length > 1000) {
                            await pool.query("INSERT INTO tags (tagID, name) VALUES " + queryTAG.join(","));
                            queryTAG = [];
                        }
                        tagIDs.add(tag.id);
                    }
                }
            }
        }
        if (querys.length > 0)
            await pool.query("INSERT INTO imgs (imID, explicitness, score, width, height, file_size, uploader_id, file_ext, path) VALUES " + querys.join(","));
        if (queryTAG.length > 0)
            await pool.query("INSERT INTO tags (tagID, name) VALUES " + queryTAG.join(","));
        if (queryIMTAG.length > 0)
            await pool.query("INSERT INTO imtags (imID, tagID) VALUES " + queryIMTAG.join(","));
    }
}

//var glob = require("glob")

//console.log("loading Files...")
//let files = {jpg:glob.sync("/run/media/lukas/Data4Tb/danbooru2019/original/**/*.jpg"),
// png:glob.sync("/run/media/lukas/Data4Tb/danbooru2019/original/**/*.png")};
//fs.writeFileSync('files.json',JSON.stringify(files))

//console.time("load")
let files = require('./files.json');
files.jpg = new Set(files.jpg);
files.png = new Set(files.png);
//console.timeEnd("load")

function getPathGlob(identifier, file_ext) {
    let string = "/run/media/lukas/Data4Tb/danbooru2019/original/";
    string += '0' + (identifier % 1000).toString().padStart(3, '0') + '/'
    string += identifier + '.'
    if (Object.keys(files).includes(file_ext) && files[file_ext].has(string + file_ext))
        string += file_ext;
    else {
        return false;
    }
    return string.slice(47);
}


quieres().then(()=>process.exit());

function getPath(identifier, file_ext) {
    let string = "/run/media/lukas/Data4Tb/danbooru2019/original/";
    string += '0' + (identifier % 1000).toString().padStart(3, '0') + '/'
    string += identifier + '.'
    if (fs.existsSync(string + file_ext))
        string += file_ext;
    else {
        return false;
    }
    return string.slice(47);
}

function getPathCheck(identifier) {
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
    return string.slice(47);
}

//pool.query("INSERT INTO imgs (id, explicitness, file_ext, path)")