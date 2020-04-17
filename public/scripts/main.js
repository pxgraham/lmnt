const socket = io({transports: ['websocket'], upgrade: false});
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const view = document.getElementById('view');
const vctx = view.getContext('2d');
let viewX = 0;
let viewY = 0;
const clamp = (n, lo, hi) => n < lo ? lo : n > hi ? hi : n;
let joined = false;

const join = (color) => {
    socket.emit('join', color);
    joined = true;
}
const switchView = (screen) => {
    switch(screen) {
        case 'map':
            view.style.display = 'none';
            canvas.style.display = 'block';
            break;
        case 'player':
            view.style.display = 'block';
            canvas.style.display = 'none';
            break;
    }
}

class Object {
    constructor(x, y, w, h) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
    }
}

let background = [];
for( let i = 0; i < 100; i++) {
    let x = Math.random() * canvas.width + 1;
    let y = Math.random() * canvas.height + 1;
    let w = 5;
    let h = 5;
    background.push(new Object(x, y, w, h));
}

socket.on('update', (data) => {
    setMap();

    //retreive yourself
    let player_index = data.map((x) => {return x.id; }).indexOf(socket.id);
    if(data[player_index] !== undefined) {
        viewX = -data[player_index].x + canvas.width/2 - 500;
        viewX = clamp(viewX, view.width - canvas.width, 0);
        viewY = -data[player_index].y + canvas.height/2 - 500;
        viewY = clamp(viewY, view.height - canvas.height, 0);
    }

    //paints all players on map
    for(let i = 0; i < data.length; i++) {
        let player = data[i];       
        ctx.fillStyle = player.c;
        ctx.fillRect(player.x, player.y, player.w, player.h);
    }

    //sets your viewport center on your player
    setView();
})

//paints entire map
setMap = () => {
    //clear frame
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    //y axis
    ctx.fillStyle = 'lime';
    ctx.fillRect(canvas.width/2, 0, 5, canvas.height);

    //x axis
    ctx.fillStyle = 'lime';
    ctx.fillRect(0, canvas.height/2, canvas.width, 5); 

    //background specs
    background.forEach((object) => {
        ctx.fillStyle = 'white';
        ctx.fillRect(object.x, object.y, object.w, object.h);
    })
}

//paints viewport
setView = () => {
    vctx.drawImage(canvas, viewX, viewY);
}

document.addEventListener('keyup', (e) => {
    // console.log(e.keyCode);
    switch(e.keyCode) {
        case 38:
            socket.emit('move', {input: 'up', state: false});
            break;
        case 40:
            socket.emit('move', {input: 'down', state: false});
            break;
        case 37:
            socket.emit('move', {input: 'left', state: false});
            break;
        case 39:
            socket.emit('move', {input: 'right', state: false});
            break;
        default: //do nothing
    }
})

document.addEventListener('keydown', (e) => {
    // console.log(e.keyCode);
    switch(e.keyCode) {
        case 38:
            socket.emit('move', {input: 'up', state: true});
            break;
        case 40:
            socket.emit('move', {input: 'down', state: true});
            break;
        case 37:
            socket.emit('move', {input: 'left', state: true});
            break;
        case 39:
            socket.emit('move', {input: 'right', state: true});
            break;
        default: //do nothing
    }
})


