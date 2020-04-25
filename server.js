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

//list of connections
let sessions = [];

//list of people that press play
let players = [];

//map data
let items = {
  fire: []
};

//add fire items to map data
for(let i = 0; i < 10; i++) {
  items.fire.push(
    {
      x: Math.random() * 3500 + 250,
      y: Math.random() * 1900 + 50,
      w: 20,
      h: 20,
      c: 'red',
    }
  )
}

//player constructor
function Player(x, y, w, h, id) {
  //player details(coordinates/movement controls)
  this.x = x;
  this.y = y;
  this.w = w;
  this.h = h;
  this.id = id;
  this.left = false;
  this.right = false;
  this.up = false;
  this.down = false;
  this.speed = 8.5;
  this.facing = 'front';
  this.moving = false;

  //moves player based on input direction
  this.move = () => {
    if(this.left) {
      if(this.x <= 0) {
        this.x += this.speed;
      }
      this.x -= this.speed;
      this.facing = 'left';
    }
    if(this.right) {
      if(this.x + this.w >= 4000) {
        this.x -= this.speed;
      }
      this.x += this.speed;
      this.facing = 'right';
    }
    if(this.up) {
      if(this.y <= 0) {
        this.y += this.speed;
      }
      this.y -= this.speed;
      this.facing = 'up';
    }
    if(this.down) {
      if(this.y + this.h >= 2000) {
        this.y -= this.speed;
      }
      this.y += this.speed;
      this.facing = 'down';
    }
    if(this.down || this.up || this.left || this.right) {
      this.moving = true;
    } else {
      this.moving = false;
    }
  }

  //test if anything in the 'items' array is hitting the player
  this.testCollision = (items) => {
    items.forEach((item) => {
      //if it hits the player, randomize it's position an raise players power
      if(item.x + item.w >= this.x && item.y + item.h >= this.y && item.y <= this.y + this.h && item.x < this.x + this.w) {
        item.x = Math.random() * 3500 + 250;
        item.y = Math.random() * 1900 + 50;
        this.power++;
        for(let i in players) {
          //re randomize if new random position lands on player
          if(item.x + item.w >= players[i].x && item.y + item.h >= players[i].y && item.y <= players[i].y + players[i].h && item.x < players[i].x + players[i].w) {
            item.x = Math.random() * 3500 + 250;
            item.y = Math.random() * 1900 + 50;
          }
        }
      }
    })
  }

  //stores message to send
  this.message = '';

  //attacking
  this.power = 1;
  this.bspeed = 12;
  this.clip = [];
  this.target = [];

  //shoots bullet in the direction your facing, deletes offscreen bullets
  this.shoot = (bullet, i) => {
    //makes sure bullet direction only changes once with player direction
    if(bullet.moveable) {
      //points bullet in players direction and disables further change of direction
      switch(this.facing) {
        case 'left':
          bullet.moving  = 'left';
          bullet.moveable = false;
          break;
        case 'right':
          bullet.moving = 'right';
          bullet.moveable = false;
          break;
        case 'up':
          bullet.moving = 'up';
          bullet.moveable = false;
          break;
        case 'down':
          bullet.moving = 'down';
          bullet.moveable = false;
          break;
      }
    }
    //propels bullet in its assigned direction
    switch(bullet.moving) {
      case 'left':
        bullet.x -= this.bspeed;
        break;
      case 'right':
        bullet.x += this.bspeed;
        break;
      case 'up':
        bullet.y -= this.bspeed;
        break;
      case 'down':
        bullet.y += this.bspeed;
        break;
    }
    //deletes offscreen bullets
    if(bullet.x < 0 || bullet.x > 4000 || bullet.y < 0 || bullet.y > 2000) {
      bullet.id = this.id;
      for (let j = this.clip.length - 1; i >= 0; --i) {                
        if (bullet.id === this.id) {
            this.clip.splice(i,1);
            return;
        }
      }
    }
  }

  //your starting sprite coordinates
  this.sx = 0;
  this.sy = 0;
  this.sw = 90;
  this.sh = 130;
  this.animationRate = 0;

  //animates your sprite
  this.playerAnimate = () => {
    //changes image to the direction you are facing
    switch(this.facing) {
      case 'up':
        this.sy = 0;
      break;
      case 'right':
        this.sy = 120;
      break;
      case 'down':
        this.sy = 240;
      break;
      case 'left':
        this.sy = 360;
       break;
    }
    //cycles through pictures on the x-axis if you are moving
    if(this.moving) {
      this.animationRate++;
      if(this.animationRate < 7) {
        //skips 7 frames
      } else {
        //then animate
        this.sx += this.sw;
        this.animationRate = 0;
      }
      //cycles back to first picture on x-axis after the 3rd
      if (this.sx >= this.sw * 3) {
        this.sx = 0;
      }
    }
  }

  //controls all movement and changes on the canvas
  this.update = () => {
    //player collision test with items
    for(let i in items) {
      let item = items[i];
      this.testCollision(item);
    }

    //shoots any bullets inside your clip
    for(let i = 0; i < this.clip.length; i++) {
      let bullet = this.clip[i];
      this.shoot(bullet, i)
    }

    this.playerAnimate();

    this.move();
  }
}

io.sockets.on('connection', (socket) => {
  //creates session
  sessions[socket.id] = socket;

  //creates player
  socket.on('join', (playerData) => {
    players[socket.id] = new Player(1500, 800, 25, 25, socket.id);
  })

  //captures movement input
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
  
  //captures message input and deletes it after 2.5 seconds
  socket.on('message', (data) => {
    players[socket.id].message = data;
    let timerId = false;
    if(!timerId) {
      timerId = setTimeout(() => {
        players[socket.id].message = '';
      }, 2500)
    } else {
      clearTimeout(timerId);
    }
  })

  //captures attack input and pushes bullets to clip
  socket.on('attack', () => {
    let player = players[socket.id];
    if(player.power === 1) {
    } else {
      player.clip.push({
        x: player.x,
        y: player.y,
        w: player.power * 10 /2,
        h: player.power * 10 /2,
        c: 'red',
        id: 0,
        facing: 'nowhere',
        moveable: true,
      })
    }
  })

  socket.on('disconnect', () => {
    delete sessions[socket.id];
    delete players[socket.id];
  })

})

//runs player update and sends clients the new data
setInterval(() => {
  let pack = [];
  for(let i in players) {
    players[i].update();
    pack.push(players[i])
  }
  for(let i in sessions) {
    let socket = sessions[i];
    socket.emit('update', pack);
    socket.emit('mapData', items);
  }
},1000/60)