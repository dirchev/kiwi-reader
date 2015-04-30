var fileCtrl = require('../controllers/fileCtrl')();
var pageCtrl = require('../controllers/pageCtrl')();

// TODO make different files for files and books

module.exports = function(io){
  io.on('connection', function(socket){

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
      populatedAnotation = data.populatedAnotation;
      file_id = data.file_id;
      socket.broadcast.to('file' + file_id).emit('file:update:anotations', populatedAnotation);
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
      socket.broadcast.to('file' + file_id).emit('file:delete:anotation', data.anotation_index);
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
      populatedComment = data.populatedComment;
      console.log('adding comment');
      socket.broadcast
        .to('file' + file_id)
        .emit('file:update:comment', {anotation_index: anotation_index, comment: populatedComment});

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

    // =========================================================================
    // ====================== PAGES ============================================
    // =========================================================================
    
    socket.on('open:page', function(page_id){
      // TODO check if user is logged, if he is not, check if file is public
      socket.join('page' + page_id);
    });

    socket.on('page:add:anotation', function(data){
      anotation = data.anotation;
      populatedAnotation = data.populatedAnotation;
      page_id = data.page_id;
      socket.broadcast.to('page' + page_id).emit('page:update:anotations', populatedAnotation);
      pageCtrl.addAnotation(page_id, anotation, function(err, anotations){
        if(err){
          console.log(err);
          socket.to('page' + page_id).emit('page:error', err);
        }
      });
    });

    socket.on('page:set:content', function(data){
      page_id = data.page_id;
      content = data.content;
      socket.to('page' + page_id).emit('page:update:content', content);
      pageCtrl.updateContent(page_id, content, function(err){
        if(err){
          socket.to('page' + page_id).emit('page:error', err);
        }
      });
    });

    socket.on('page:delete:anotation', function(data){
      anotation_index = data.anotation_index;
      page_id = data.page_id;
      socket.to('page' + page_id).emit('page:delete:anotation', data.anotation_index);
      pageCtrl.deleteAnotation(page_id, anotation_index, function(err){
        if(err){
          socket.to('page' + page_id).emit('page:error', err);
        }
      });
    });
    
    socket.on('page:add:comment', function(data){
      var anotation_index = data.anotation_index;
      var page_id = data.page_id;
      var comment = data.comment;
      var populatedComment = data.populatedComment;
      socket.broadcast.to('page' + page_id).emit('page:add:comment',  {anotation_index : anotation_index, comment:populatedComment});
      pageCtrl.addComment(page_id, anotation_index, comment, function(err){
        if(err){
          socket.to('page' + page_id).emit('page:error', err);
        }
      });
    });
  });
};
