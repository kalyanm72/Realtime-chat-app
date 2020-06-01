require("dotenv").config();
const express = require("express");
const http = require("http");
const app = express();
const server = http.createServer(app);
const socket = require("socket.io");
const io = socket(server);
const path=require("path");
if(process.env.NODE_ENV==="production"){
    app.use(express.static(path.join(__dirname,'./video-chat/build')));
    app.get('*',(req,res)=>{
      res.sendFile(path.join(__dirname,'./video-chat/build/index.html'));
    });
  }
const users = {};
io.on('connection', socket => {
    if (!users[socket.id]) {
        users[socket.id] = socket.id;
    }
    socket.emit("yourID", socket.id);
    io.sockets.emit("allUsers", users);
    socket.on('disconnect', () => {
        delete users[socket.id];
    })

    socket.on("callUser", (data) => {
        io.to(data.userToCall).emit('hey', {signal: data.signalData, from: data.from});
    })

    socket.on("acceptCall", (data) => {
        io.to(data.to).emit('callAccepted', data.signal);
    })
});
var server_port = process.env.YOUR_PORT || process.env.PORT || 5000;
server.listen(server_port, () => console.log('server is running on port 5000'));
