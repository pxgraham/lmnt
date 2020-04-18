const socket = io({transports: ['websocket'], upgrade: false});
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const view = document.getElementById('view');
const vctx = view.getContext('2d');
const pic = new Image();
pic.src  = '/public/images/pic.png';
const playerImg = new Image();
playerImg.src  = '/public/images/player3.png';
let viewX = 0;
let viewY = 0;
const clamp = (n, lo, hi) => n < lo ? lo : n > hi ? hi : n;
let joined = false;
const join = (color) => {
    playerImg.src = color;
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
for (let i = 0; i < 250; i++) {
    x = Math.random() * canvas.width + 1;
    y = Math.random() * canvas.height + 1;
    background.push(new Object(x, y, 5, 5))
    
}

socket.on('update', (data) => {
    setMap();
    
    //paint players and extract your id
    let player_index = data.map((x) => {
        let player = x;       
        ctx.fillStyle = player.c;
        // ctx.fillRect(player.x, player.y, player.w, player.h);
        // ctx.drawImage(playerImg, player.x, player.y, player.w * 2, player.h * 2)
        ctx.drawImage(playerImg, player.sx, player.sy, player.sw, player.sh,
            player.x, player.y, player.w * 2, player.h * 2);
        return x.id; 
    }).indexOf(socket.id);

    if(data[player_index] !== undefined) {
        //sets your viewport coordinates
        viewX = clamp(-data[player_index].x + canvas.width/2 - 1250, view.width - canvas.width, 0);
        viewY = clamp(-data[player_index].y + canvas.height/2 - 650, view.height - canvas.height, 0);
    }
    
    //sets your viewport center on your player
    setView();
})

//paints entire map
setMap = () => {
    //clear frame with background image
    ctx.fillStyle = '#209c00';
    ctx.fillRect(0, 0, canvas.width, canvas.height);   
    background.forEach((star) => {
        ctx.fillStyle = 'darkGreen';
        ctx.fillRect(star.x, star.y, star.w, star.h);
    }) 
    // ctx.drawImage(pic, 0, 0, 4000 , 3000);
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


