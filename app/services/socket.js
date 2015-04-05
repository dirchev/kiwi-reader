var fileCtrl = require('../controllers/fileCtrl')();
// var io               = require("socket.io")(server);
// var sessionStore     = require('awesomeSessionStore'); // find a working session store (have a look at the readme)
// var passportSocketIo = require("passport.socketio");

var roomUsers = {};
module.exports = function(io){
  io.on('connection', function(socket){
    console.log('user connected');

    // =========================================================================
    // ====================== FILES ============================================
    // =========================================================================
    socket.on('open:file', function(file_id){
      // TODO check if user is logged, if he is not, check if file is public
      socket.join('file' + file_id);
    });

    socket.on('file:set:content', function(data){
      file_id = data.file_id;
      content = data.content;
      socket.to('file' + file_id).emit('file:update:content', content);
      fileCtrl.updateContent(file_id, content, function(err){
        if(err){
          socket.to('file' + file_id).emit('file:error', err);
        }
      });
    });

    socket.on('file:add:anotation', function(data){
      anotation = data.anotation;
      file_id = data.file_id;
      socket.to('file' + file_id).emit('file:update:anotations', anotation);
      fileCtrl.addAnotation(file_id, anotation, function(err, anotations){
        if(err){
          console.log(err);
          socket.to('file' + file_id).emit('file:error', err);
        }
      });
    });

    socket.on('file:delete:anotation', function(data){
      anotation_index = data.anotation_index;
      file_id = data.file_id;
      socket.to('file' + file_id).emit('file:delete:anotation', data.anotation_index);
      fileCtrl.deleteAnotation(file_id, anotation_index, function(err){
        if(err){
          socket.to('file' + file_id).emit('file:error', err);
        }
      });
    });

    socket.on('file:add:comment', function(data){
      file_id = data.file_id;
      anotation_index = data.anotation_index;
      comment = data.comment;
      console.log('adding comment');
      socket.to('file' + file_id).emit('file:update:comment', {anotation_index: anotation_index, comment: comment});
      fileCtrl.addComment(file_id, anotation_index, comment, function(err){
        if(err){
          socket.to('file' + file_id).emit('file:error', err);
        }
      });
    });

    socket.on('file:add:chat', function(data){
      message = data.message;
      file_id = data.file_id;
      socket.broadcast.to('file' + file_id).emit('file:update:chat', message);
    });

    // =========================================================================
    // ====================== BOOKS ============================================
    // =========================================================================
    socket.on('open:book', function(book_id){
      // TODO check if user is logged, if he is not, check if file is public
      socket.join('book' + book_id);
    });

    socket.on('book:add:chat', function(data){
      message = data.message;
      book_id = data.book_id;
      socket.broadcast.to('book' + book_id).emit('book:update:chat', message);
    });

    socket.on('book:add:anotation', function(data){
      anotation = data.anotation;
      book_id = data.book_id;
      socket.broadcast.to('book' + book_id).emit('book:update:anotations', anotation);
      bookCtrl.addAnotation(book_id, anotation, function(err, anotations){
        if(err){
          console.log(err);
          socket.to('book_id' + book_id).emit('book_id:error', err);
        }
      });
    });
  });
};
