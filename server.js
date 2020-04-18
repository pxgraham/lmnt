const express = require("express");
const app = express();

const PORT = process.env.PORT || 3000;
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use("/public", express.static(__dirname + "/public"));

require("./routes/htmlRoutes")(app);

const serv = require('http').createServer(app);

serv.listen(PORT, () => {
  console.log("App listening on PORT: " + PORT);
});

const io = require('socket.io')(serv, {});

let sessions = [];
let players = [];

function Player(x, y, w, h, id) {
  this.x = x;
  this.y = y;
  this.w = w;
  this.h = h;
  this.facing = 'front';
  this.moving = false;
  this.sx = 0;
  this.sy = 0;
  this.sw = 90;
  this.sh = 130;
  this.animationRate = 0;
  this.id = id;
  this.left = false;
  this.right = false;
  this.up = false;
  this.down = false;
  this.speed = 5;
  this.move = () => {    
    switch(this.facing) {
      case 'left':
        this.sy = 360;
       break;
      case 'right':
        this.sy = 120;
      break;
      case 'up':
        this.sy = 0;
      break;
      case 'down':
        this.sy = 240;
      break;
    }
    if(this.left) {
      this.x -= this.speed;
      this.facing = 'left';
    }
    if(this.right) {
      this.x += this.speed;
      this.facing = 'right';
    }
    if(this.up) {
      this.y -= this.speed;
      this.facing = 'up';
    }
    if(this.down) {
      this.y += this.speed;
      this.facing = 'down';
    }
    if(this.down || this.up || this.left || this.right) {
      this.moving = true;
    } else {
      this.moving = false;
    }
    if(this.moving) {
      this.animationRate++;
      if(this.animationRate < 7) {
        // do nothing
      } else {
        this.sx += this.sw;
        this.animationRate = 0;
      }
      if (this.sx >= 90 * 3) {
        this.sx = 0;
      }
    }
  }
}

io.sockets.on('connection', (socket) => {
  sessions[socket.id] = socket;

  socket.on('join', (playerData) => {
    //need to set attributes
    players[socket.id] = new Player(1500, 800, 25, 25, socket.id);
    let player = players[socket.id];
    player.c = playerData;
  })

  socket.on('move', (data) => {
    if(players[socket.id]) {
      let player = players[socket.id];
      switch(data.input) {
        case 'left':
          player.left = data.state;
        break;
        case 'right': 
          player.right = data.state;
        break
        case 'up':  
          player.up = data.state;
        break
        case 'down':  
          player.down = data.state;
        break
      }
    }
  })

  socket.on('disconnect', () => {
    delete sessions[socket.id];
    delete players[socket.id];
  })

})

setInterval(() => {
  let pack = [];
  for(let i in players) {
    players[i].move();
    pack.push(players[i])
  }
  for(let i in sessions) {
    let socket = sessions[i];
    socket.emit('update', pack);
  }
},1000/60)