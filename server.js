var express = require("express");
var app = express();

var PORT = process.env.PORT || 3000;
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use("/public", express.static(__dirname + "/public"));

require("./routes/htmlRoutes")(app);

var serv = require('http').createServer(app);

serv.listen(PORT, function() {
  console.log("App listening on PORT: " + PORT);
});

var io = require('socket.io')(serv, {});

//stores list of sessions
var users = {};

function Player(x, y) {
  this.x = x;
  this.y = y;
  this.up = false;
  this.left = false;
  this.down = false;
  this.right = false;
  this.speed = 7.5;
  this.update = function() {
    if(this.up) {
      this.y -= this.speed;
    }
    if(this.left) {
      this.x -= this.speed;
    }
    if(this.down) {
      this.y += this.speed;
    }
    if(this.right) {
      this.x += this.speed;
    }
  }
  return this;
}

io.sockets.on('connection', function(socket) { 

  //add user to list on connection
  socket.playerData = new Player(Math.random() * 1000, Math.random() * 500);
  users[socket.id] = socket;
  // map.players[socket.id] = socket;


  //movement controls
  socket.on('keyPress', function(data) {
    console.log(data.key)
    //case keys are wasd, in that order
    switch(data.key) {
      case 87:
        users[socket.id].playerData.up = true;
        break;
      case 65:
        users[socket.id].playerData.left = true;
        break;
      case 83:
        users[socket.id].playerData.down = true;
        break;
      case 68:
        users[socket.id].playerData.right = true;
        break;

    }
  })
  socket.on('keyLift', function(data) {
    console.log(data.key)
    //case keys are wasd, in that order
    switch(data.key) {
      case 87:
        users[socket.id].playerData.up = false;
        break;
      case 65:
        users[socket.id].playerData.left = false;
        break;
      case 83:
        users[socket.id].playerData.down = false;
        break;
      case 68:
        users[socket.id].playerData.right = false;
        break;
    }
  })

  socket.on('disconnect', function() {
    leaveGame(socket.id);
  })

})

function leaveGame(id) {
  delete users[id];
}


setInterval(function() {
  var pack = [];
  for(var i in users) {
    users[i].playerData.update();
    pack.push(users[i].playerData);
  }
  for(var j in users){
    users[j].emit('clientData', pack)
  }
}, 1000/60)