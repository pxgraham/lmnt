const socket = io({transports: ['websocket'], upgrade: false});
const game = document.getElementById('game');
const mainMenu = document.getElementById('mainMenu');
const startBtn = document.getElementById('startBtn');
const chatBox = document.getElementById('chatbox');
const trickField = document.getElementById('trick');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const view = document.getElementById('view');
const vctx = view.getContext('2d');
let mapData = [];
const pic = new Image();
pic.src  = '/public/images/pic.png';
const playerImg = new Image();
playerImg.src  = '/public/images/player.png';
let viewX = 0;
let viewY = 0;
const clamp = (n, lo, hi) => n < lo ? lo : n > hi ? hi : n;
let joined = false;
startBtn.addEventListener('click', () => {
    start();
})
const start = () => {
    mainMenu.style.display = 'none';
    game.style.display = 'block';
    socket.emit('join');
    joined = true
}
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

socket.on('mapData', (data) => {
    mapData = data;
})

socket.on('update', (data) => {
    clear();
    setMapBackground();
    
    //paint players and extract your id
    let player_index = data.map((x) => {
        let player = x;       
        ctx.fillStyle = player.c;
        // ctx.fillRect(player.x, player.y, player.w, player.h);
        // ctx.drawImage(playerImg, player.x, player.y, player.w * 2, player.h * 2)
        ctx.font = '19px ABeeZee';
        ctx.fillStyle = 'white';
        ctx.drawImage(playerImg, player.sx, player.sy, player.sw, player.sh,
            player.x - 12.5, player.y - 15, player.w * 2, player.h * 2);
        ctx.fillText(player.message, player.x - player.message.length*2.5 + 5, player.y - 15)
            return x.id; 
    }).indexOf(socket.id);

    if(data[player_index] !== undefined) {
        //sets your viewport coordinates
        viewX = clamp(-data[player_index].x + canvas.width/2 - 1250, view.width - canvas.width, 0);
        viewY = clamp(-data[player_index].y + canvas.height/2 - 650, view.height - canvas.height, 0);
    }
    
    //sets your viewport center on your player
    setMapForeground()
    setView();
})


clear = () => {
    // view.style.display = 'block';
    // canvas.style.display = 'none';
    //clear frame with background image
    ctx.fillStyle = '#209c00';
    ctx.fillRect(0, 0, canvas.width, canvas.height); 
}
//paints entire map
setMapBackground = () => {  
    background.forEach((star) => {
        ctx.fillStyle = 'darkGreen';
        ctx.fillRect(star.x, star.y, star.w, star.h);
    }) 
    // ctx.drawImage(pic, 0, 0, 4000 , 3000);
}

setMapForeground = () => {
    // mapData.forEach((lmnt) => {
    //     ctx.fillStyle = lmnt.c;
    //     ctx.fillRect(lmnt.x, lmnt.y, lmnt.w, lmnt.h);
    // }) 
}
//paints viewport
setView = () => {
    vctx.drawImage(canvas, viewX, viewY);
}

document.addEventListener('keyup', (e) => {
    
    // console.log(e.keyCode);
    switch(e.keyCode) {
        case 87:
            socket.emit('move', {input: 'up', state: false});
            break;
        case 83:
            socket.emit('move', {input: 'down', state: false});
            break;
        case 65:
            socket.emit('move', {input: 'left', state: false});
            break;
        case 68:
            socket.emit('move', {input: 'right', state: false});
            break;
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
let chatFocus = false;
document.addEventListener('keydown', (e) => {
    console.log(e.keyCode);
    switch(e.keyCode) {
        case 13: {
            socket.emit('move', {input: 'up', state: false});
            socket.emit('move', {input: 'down', state: false});
            socket.emit('move', {input: 'left', state: false});
            socket.emit('move', {input: 'right', state: false});
            if(chatFocus) {
                trickField.focus();
                socket.emit('message', chatBox.value)
                chatBox.value = '';
                console.log('message sent!');
                chatFocus = false;
            } else {
                chatBox.focus();
                chatFocus = true;
            }
        }
            break;
        case 87:
            if(!chatFocus) {
                socket.emit('move', {input: 'up', state: true});
            }
            break;
        case 83:
            if(!chatFocus) {                
                socket.emit('move', {input: 'down', state: true});
            }
            break;
        case 65:
            if(!chatFocus) {                    
                socket.emit('move', {input: 'left', state: true});
            }
            break;
        case 68:
            if(!chatFocus) {                    
                socket.emit('move', {input: 'right', state: true});
            }
            break;
        case 38:
            if(!chatFocus) {                    
                socket.emit('move', {input: 'up', state: true});
            }
            break;
        case 40:
            if(!chatFocus) {                    
                socket.emit('move', {input: 'down', state: true});
            }
            break;
        case 37:
            if(!chatFocus) {                    
                socket.emit('move', {input: 'left', state: true});
            }
            break;
        case 39:
            if(!chatFocus) {                    
                socket.emit('move', {input: 'right', state: true});
            }
            break;
        default: //do nothing
    }

})


