const express = require("express");
const app = express();

const PORT = process.env.PORT || 3000;
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use("/public", express.static(__dirname + "/public"));

require("./routes/htmlRoutes")(app);

const serv = require('http').createServer(app);

serv.listen(PORT, function() {
  console.log("App listening on PORT: " + PORT);
});

const io = require('socket.io')(serv, {});


io.sockets.on('connection', (socket) => { 
  socket.on('disconnect', () => {
    // nothing yet
  })

})
