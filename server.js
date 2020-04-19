"use strict";
const { Pool } = require('pg')

const pool = new Pool({
    user: 'node',
    host: 'localhost',
    database: 'danbooru',
    password: 'System5362<cut<<',
    port: 5432,
})
async function startDB() {
    console.log((await pool.query('SELECT NOW()')).rows[0].now);
}
startDB();



const fs = require('fs'),
    path = require('path');
require('uWebSockets.js').App({}).ws('/*', {
    /* Options */
    compression: 1,
    maxPayloadLength: 16 * 1024 * 1024,
    idleTimeout: 3600000,
    /* Handlers */
    open: (ws, req) => {
        console.log('A WebSocket connected via URL: ' + req.getUrl() + '!');
    },
    message: async (ws, message, isBinary) => {
        if (bufToStr(message) === "ping")
            return;

        /*console.log(isBinary);
        console.log(bufToStr(message));
        console.log(new Uint8Array(message));*/
        if (!isBinary) {
            message = bufToStr(message);
            let msg = JSON.parse(message);
            switch (msg.type) {
                case "request":
                    ws.send(JSON.stringify({ type: "response", data: (await pool.query('SELECT * FROM imgs WHERE ID = ' + msg.id | 0)).rows }));
                    break;
                case "rate":
                        await pool.query("INSERT INTO userRatings (userID, id, rating) VALUES (" + msg.userid + "," + msg.id + "," + msg.rating + ")");
                default:
                    break;
            }
            //console.log(JSON.parse(message));
            //fs.appendFileSync('ratings.txt', message + '\n');
        }
    }
}).any('/*', (res, req) => {
    let data;
    if (req.getUrl() == "/")
        data = fs.readFileSync('./static/index.html');
    else if (req.getUrl().startsWith("/img/")) {
        let id = req.getUrl().slice(5);
        console.log(id);
        console.log(getPath(id));
        data = fs.readFileSync(getPath(id) || getPath("1"));
    }
    else
        try {
            data = fs.readFileSync('./static' + req.getUrl());
        } catch (error) {
            data = error.message;
        }
    if (data == null) {
        res.end("nö");
    }
    res.end(data);
    //res.end(global["index"]);
}).listen(8000, (token) => {
    if (token) {
        console.log('Listening to port ' + 8000);
    } else {
        console.log('Failed to listen to port ' + 8000);
    }
});



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

let bufToStr = (message) => Buffer.from(message).toString();