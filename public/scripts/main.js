const socket = io({transports: ['websocket'], upgrade: false});
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const view = document.getElementById('view');
const vctx = view.getContext('2d');
let viewX = 0;
let viewY = -550;
let left = false;
let right = false;
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
let enemies = [];
let map = {};
let background = [];
function Object(x, y, w, h) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
}
for( let i = 0; i < 50; i++) {
    let x = Math.random() * canvas.width + 1;
    let y = Math.random() * canvas.height + 1;
    let w = 5;
    let h = 5;
    background.push(new Object(x, y, w, h));
}
socket.on('update', (data) => {
    if(left) {viewX+=15}
    if(right) {viewX-=15}
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'red';
    ctx.fillRect(0, 850, canvas.width, 5);
    ctx.fillRect(0, 50, canvas.width, 5); 
    for(let i = 0; i < data.length; i++) {
        let player = data[i];        
        ctx.fillStyle = player.c;
        ctx.fillRect(player.x, player.y, player.w, player.h);
    }
    background.forEach((object) => {
        ctx.fillStyle = 'white';
        ctx.fillRect(object.x, object.y, object.w, object.h);
    })
    vctx.drawImage(canvas, viewX, viewY);
})


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
            if(joined) {
                left = false;
            }
            socket.emit('move', {input: 'left', state: false});
            break;
        case 39:
            if(joined) {
                right = false;
            }
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
            if(joined) {
                left = true;
            }
            socket.emit('move', {input: 'left', state: true});
            break;
        case 39:
            if(joined) {
                right = true;
            }
            socket.emit('move', {input: 'right', state: true});
            break;
        default: //do nothing
    }
})


