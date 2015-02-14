module.exports = function(app){
  var http = require('http').Server(app);
  var io = require('socket.io')(http);
  var socketParams;
  io.on('connection', function(socket){
    socket.on('enter file', function(file_id){
      socket.join('file' + file_id);
    });
    console.log('a user connected');
    socket.on('disconnect', function(){
      console.log('a user disconnected');
    })
    socket.on('chat message', function(message){
      io.emit('chat message', message);
    })
  })
}
