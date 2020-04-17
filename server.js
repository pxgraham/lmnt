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
  this.id = id;
  this.left = false;
  this.right = false;
  this.up = false;
  this.down = false;
  this.speed = 20;
  this.move = () => {
    if(this.left) {
      this.x -= this.speed;
    }
    if(this.right) {
      this.x += this.speed;
    }
    if(this.up) {
      this.y -= this.speed;
    }
    if(this.down) {
      this.y += this.speed;
    }
  }
}

io.sockets.on('connection', (socket) => {
  sessions[socket.id] = socket;

  socket.on('join', (playerData) => {
    //need to set attributes
    players[socket.id] = new Player(1500, 800, 50, 50, socket.id);
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