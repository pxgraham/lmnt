const socket = io({transports: ['websocket'], upgrade: false});

//moves cursor to this field after pressing 'enter' on the chatbox. wouldn't focus view/canvas for whatever reason
const trickField = document.getElementById('trick');

const mainMenu = document.getElementById('mainMenu');
const startBtn = document.getElementById('startBtn');

//entire game view
const game = document.getElementById('game');

const chatBox = document.getElementById('chatbox');

//actual game
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

//players view
const view = document.getElementById('view');
const vctx = view.getContext('2d');

//items on the field
let mapData = [];

const playerImg = new Image();
playerImg.src  = '/public/images/player.png';

let viewX = 0;
let viewY = 0;

//stops camera at map boundary
const clamp = (n, lo, hi) => n < lo ? lo : n > hi ? hi : n;

let joined = false;

startBtn.addEventListener('click', () => {
    mainMenu.style.display = 'none';
    game.style.display = 'block';
    socket.emit('join');
    joined = true
})

//switch from close view to entire map
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

//green dots on background
let background = [];
for (let i = 0; i < 250; i++) {
    x = Math.random() * canvas.width + 1;
    y = Math.random() * canvas.height + 1;
    background.push(new Object(x, y, 5, 5))
}

//stores the map data
socket.on('mapData', (data) => {
    mapData = data;
})

//receive data from server
socket.on('update', (data) => {
    clear();
    setMapBackground();
    
    //paint players and extracts your id for your fixed viewport
    let player_index = data.map((x) => {
        let player = x;       
        ctx.fillStyle = player.c;
        ctx.drawImage(
            playerImg, player.sx, player.sy, player.sw, player.sh,
            player.x - 12.5, player.y - 15, player.w * 2, player.h * 2
        );
        ctx.font = '19px ABeeZee';
        ctx.fillStyle = 'white';
        ctx.fillText(player.message, player.x - player.message.length*2.5 + 5, player.y - 15)
        
        player.clip.forEach((bullet) => {
            ctx.fillStyle = bullet.c;
            ctx.fillRect(bullet.x, bullet.y, bullet.w, bullet.h);
        })
        return x.id; 
    }).indexOf(socket.id);

    //verification of existence check then uses your extracted id as mentioned above
    if(data[player_index] !== undefined) {

        //sets your viewport coordinates
        viewX = -data[player_index].x + canvas.width/2 - 1250;
        viewY = -data[player_index].y + canvas.height/2 - 650;

        //clamps view so the camera doesn't move off the screen
        viewX = clamp(viewX, view.width - canvas.width, 0);
        viewY = clamp(viewY, view.height - canvas.height, 0);
    }
    
    //sets your viewport center on your player
    setMapForeground()
    setView();
})

//clear frame
clear = () => {
    // view.style.display = 'block';
    // canvas.style.display = 'none';
    //clear frame with background image
    ctx.fillStyle = '#209c00';
    ctx.fillRect(0, 0, canvas.width, canvas.height); 
}

setMapBackground = () => {  
    background.forEach((star) => {
        ctx.fillStyle = 'darkGreen';
        ctx.fillRect(star.x, star.y, star.w, star.h);
    }) 
}

setMapForeground = () => {
    for(let i in mapData) {
        let item = mapData[i];
        item.forEach((lmnt) => {
            ctx.fillStyle = lmnt.c;
            ctx.fillRect(lmnt.x, lmnt.y, lmnt.w, lmnt.h);
        })
    }
}

setView = () => {
    vctx.drawImage(canvas, viewX, viewY);
}

document.addEventListener('keyup', (e) => {
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
        //enter
        case 13: {
            socket.emit('move', {input: 'up', state: false});
            socket.emit('move', {input: 'down', state: false});
            socket.emit('move', {input: 'left', state: false});
            socket.emit('move', {input: 'right', state: false});
            if(chatFocus) {
                trickField.focus();
                socket.emit('message', chatBox.value)
                chatBox.value = '';
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
        case 32:
            if(!chatFocus) {
                socket.emit('attack');
            }
        default: //do nothing
    }

})


