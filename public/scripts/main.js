const socket = io({transports: ['websocket'], upgrade: false});
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const view = document.getElementById('view');
const vctx = view.getContext('2d');
let viewX = -875;
let viewY = -750;
let left = false;
let right = false;
const join = (color) => {
    socket.emit('join', color);
    setInterval(() => {
        if(left) {viewX+=10}
        if(right) {viewX-=10}
        vctx.drawImage(canvas, viewX, viewY);
    }, 1000/60)
}
let enemies = [];
let map = {};
socket.on('update', (data) => {
    draw();
    ctx.fillStyle = 'lime';
    ctx.fillRect(1000, 800, 10, 100)
    for(let i = 0; i < data.length; i++) {
        let player = data[i];        
        ctx.fillStyle = player.c;
        ctx.fillRect(player.x, player.y, player.w, player.h);
    }
})

const draw = () => {
    vctx.drawImage(canvas, viewX, viewY);
    //clear bkgnd
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    //boundaires
    ctx.fillStyle = 'red';
    ctx.fillRect(0, 850, canvas.width, 5);
    ctx.fillRect(0, 50, canvas.width, 5);

    //paint map
    if(left) {viewX++}
    if(right) {viewX--}
}

document.addEventListener('keyup', (e) => {
    console.log(e.keyCode);
    switch(e.keyCode) {
        case 38:
            // socket.emit('')
            break;
        case 40:
            // dir.down = true;
            break;
        case 37:
            left = false;
            socket.emit('move', {input: 'left', state: false});
            break;
        case 39:
            right = false;
            socket.emit('move', {input: 'right', state: false});
            break;
        default: //do nothing
    }
})

document.addEventListener('keydown', (e) => {
    console.log(e.keyCode);
    switch(e.keyCode) {
        case 38:
            // dir.up = true;
            break;
        case 40:
            // dir.down = true;
            break;
        case 37:
            left = true;
            socket.emit('move', {input: 'left', state: true});
            break;
        case 39:
            right = true;
            socket.emit('move', {input: 'right', state: true});
            break;
        default: //do nothing
    }
})


