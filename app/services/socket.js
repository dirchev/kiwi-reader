var fileCtrl = require('../controllers/fileCtrl')();

module.exports = function(io){
  io.on('connection', function(socket){

    socket.on('open:file', function(file_id){
      socket.join('file' + file_id);
      console.log('user joined room file' + file_id);
    });

    socket.on('set:title', function(data){
      file_id = data.file_id;
      title = data.title;
      socket.to('file' + file_id).emit('update:title', title);
      fileCtrl.updateTitle(file_id, title, function(err, data){
        if(err){
          socket.to('file' + file_id).emit('error', err);
        }
      });
    });

    socket.on('set:content', function(data){
      file_id = data.file_id;
      content = data.content;
      socket.to('file' + file_id).emit('update:content', content);
      fileCtrl.updateContent(file_id, content, function(err){
        if(err){
          socket.to('file' + file_id).emit('error', err);
        }
      });
    });

    socket.on('add:anotation', function(data){
      anotation = data.anotation;
      file_id = data.file_id;
      socket.to('file' + file_id).emit('update:anotations', anotation);
      fileCtrl.addAnotation(file_id, anotation, function(err, anotations){
        if(err){
          console.log(err);
          socket.to('file' + file_id).emit('error', err);
        }
      });
    });

    socket.on('delete:anotation', function(data){
      anotation_index = data.anotation_index;
      file_id = data.file_id;
      socket.to('file' + file_id).emit('delete:anotation', data.anotation_index);
      fileCtrl.deleteAnotation(file_id, anotation_index, function(err){
        if(err){
          socket.to('file' + file_id).emit('error', err);
        }
      });
    });

    socket.on('add:comment', function(data){
      file_id = data.file_id;
      anotation_index = data.anotation_index;
      comment = data.comment;
      console.log('adding comment');
      socket.to('file' + file_id).emit('update:comment', {anotation_index: anotation_index, comment: comment});
      fileCtrl.addComment(file_id, anotation_index, comment, function(err){
        if(err){
          socket.to('file' + file_id).emit('error', err);
        }
      });
    });

  });
};
