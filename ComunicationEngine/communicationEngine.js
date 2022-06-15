const app = require('express')();
const server = require('http').createServer(app);
var clients = [];
const io = require('socket.io')(server, {
    cors: {
      origin: '*',
    }
  });

const RemoveClient = (id)=>{
    io.sockets.sockets.forEach((socket) => {
        // If given socket id is exist in list of all sockets, kill it
        if(socket.id === id)
          {  
            socket.disconnect(true);
          }
    });
}

const SendBroadCastMsg= (msg)=>{
    io.on('connection',function(socket){
        socket.emit('BroadCastMsg',msg );
    })
}


const StartCommuicationEngine = ()=>{
    io.on('connection',function(socket){
        console.log('a new user is connected')
        socket.emit('connection', null);
    })
}


const StopCommuicationEngine = ()=>{
    io.sockets.sockets.forEach((socket) => {
        socket.disconnect(true);
});
}


const NotifySelectedClient = (id)=>{
    const content= "notificaton from Server"
    io.sockets.sockets.forEach((socket) => {
      if(socket.id === id)
        {  
        
            socket.emit("msg", {
              content,
              to: socket.id
            });  
        }
       
  });
}


const LoadAllClients = ()=>{
    for (let [id, socket] of io.of("/").sockets) {
        clients.push({
          userID: id,
          username: socket.username,
        });
      }
}


// Middleware - for username authentication
// io.use((socket, next) => {
//     const username = socket.handshake.auth.username;
//     if (!username) {
//       return next(new Error("invalid username"));
//     }
//     socket.username = username;
//     console.log(socket.username)
//     next();
//   });


module.exports = {RemoveClient,SendBroadCastMsg,StartCommuicationEngine,StartCommuicationEngine,StopCommuicationEngine,NotifySelectedClient,LoadAllClients}