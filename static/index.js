"use strict";
let ws;
let image;
let id = 0;

function send(data) { ws.send(JSON.stringify(data)); }
window.onload = function () {
    image = this.document.getElementById("image");
    id = (this.Math.random() * 3652312) | 0;
    let src = "/img/" + id;
    console.log(src);
    image.src = src;
    if(this.location.href === "http://luksab.de:8000/")
        ws = new WebSocket(`ws://luksab.de:8000/index.html`);
    else
        ws = new WebSocket(`ws://192.168.2.253:8000/index.html`);
    ws.addEventListener('message', event => {
        if (typeof event.data === "string") {
            const msg = JSON.parse(event.data);
        }
    })

    image = this.document.getElementById("image");
    image.addEventListener("click", (e) => {
        let score = e.offsetX / image.width;
        console.log(id + " " + score);
        send({ type: "rate", id: id, rating: score });
        id = (this.Math.random() * 3652312) | 0;
        let src = "/img/" + id;
        console.log(src);
        image.src = src;
    });
};

function send(obj) {
    ws.send(JSON.stringify(obj));
}

window.setInterval(() => {
    if (ws.readyState === 1) {
        ws.send("ping");
        console.log("ping!");
    }
}, 5000)