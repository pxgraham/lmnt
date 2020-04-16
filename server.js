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

function Player(x, y, w, h, id, viewX, viewY) {
  this.x = x;
  this.y = y;
  this.w = w;
  this.h = h;
  this.id = id;
  this.viewX = viewX;
  this.viewY = viewY;
  this.left = false;
  this.right = false;
  this.speed = 15;
  this.move = () => {
    if(this.left) {
      this.x -= this.speed;
      this.viewX += this.speed;
    }
    if(this.right) {
      this.x += this.speed;
      this.viewX -= this.speed;
    }
  }
}

io.sockets.on('connection', (socket) => {
  sessions[socket.id] = socket;

  socket.on('join', (playerData) => {
    //need to set attributes
    players[socket.id] = new Player(1000, 800, 50, 50, socket.id, -875, -750);
    let player = players[socket.id];
    player.c = playerData;
  })

  socket.on('move', (data) => {
    if(players[socket.id]) {
      switch(data.input) {
        case 'left': players[socket.id].left = data.state;
        break;
        case 'right': players[socket.id].right = data.state;
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
    sessions[i].emit('update', pack);
  }
},1000/60)