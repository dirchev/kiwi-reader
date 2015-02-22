var Book = require('../models/book');
var User = require('../models/user');
var path = require('path');
var fs = require('fs');
var rmdir = require('rimraf');
var epubParser = require('../epub-parser');

module.exports = function(){
  return {
    create: function(req, res){
      var filePath;
      var fileName;
      if(req.busboy){
        req.busboy.on('file', function(fieldname, file, filename, encoding, mimetype){
          if(mimetype !== 'application/epub+zip'){
            res.json({
              success:false,
              message: 'Позволени са само .epub файлове.'
            });
          } else {
            fileName = filename;
            filePath = path.join(__dirname + '../../../uploads/books', path.basename(filename));
            saveFile(file, filePath);
          }
        });
        req.busboy.on('finish', function(){
          var book = new Book();
          book.title = fileName;
          book.users.push({_id: req.user._id, position: '0'});
          book.save(function(err, book){
            if(err){
              console.log(err);
              res.json({success:false, message: 'Грешка при създаването на нова книга.'})
            } else {
              var outputPath = __dirname + '/../../uploads/extracted/' + book.id;
              var epubPath = filePath;
              epubParser.unzip(epubPath, outputPath, function(){
                var folderPath = path.join(__dirname + '/../../uploads/extracted/', book.id);
                epubParser.getContent(folderPath, book._id.toString(), function(opf){
                  book.opf = opf;
                  //book.title = opf['metadata']['dc:title'] + ' ' + opf['metadata']['dc:creator'];
                  book.save(function(err, book){
                    if(err){
                      console.log(err);
                      res.json({success:false, message: 'Грешка при създаването на нова книга.'})
                    }
                    res.send({success:true, book: book});
                  })
                });
              });
            }
          });
        });
        req.pipe(req.busboy);
      }
    },
    read: function(req, res){
      var user = req.user;
      Book.find({'users._id': user.id})
        .exec(function(err, books){
          if(err){
            console.log(err);
            res.json({success:false, message: 'Грешка при зареждането на книгите.'});
          } else {
            res.json({success:true, books: books});
          }
        });
    },
    readOne: function(req, res){
      var user = req.user;
      var book_id = req.params.book_id;
      Book.findOne({_id: book_id, 'users._id': user._id}).lean()
        .exec(function(err, book){
          if(err){
            console.log(err);
            res.json({success:false, message: 'Грешка при зареждането на книгата.'});
          } else if (!book) {
            res.json({success:false, message: 'Книгата не беше намерена.'});
          } else {
            res.json({success:true, book:book});
          }
        })
    },
    delete: function(req, res){
      var book_id = req.params.book_id;
      var user = req.user;
      Book.findOne({_id: book_id, 'users._id': user._id}).exec(function(err, book){
        if(err){
          console.log(err);
          res.json({success:false, message: 'Грешка при изтриването на файла.'});
        } else if (!book){
          res.json({success:false, message: 'Книгата не беше намерена'});
        } else {
          if(book.users.length === 1){
            book.remove(function(err){
              if(err){
                console.log(err);
                res.json({success:false, message: 'Грешка при изтриването на файла.'});
              } else {
                var bookFolderPath = __dirname + '/../../uploads/extracted/' + book.id;
                rmdir(bookFolderPath, function(err){
                  if(err){
                    console.log('Folder was not deleted successfully');
                    console.log(err);
                  }
                  res.json({success:true});
                })
              }
            });
          } else {
            for(i in book.users){
              if(book.users[i]._id === user._id){
                book.users.splice(i, 1);
                book.save(function(err){
                  if(err){
                    console.log(err);
                    res.json({success:false, message: 'Грешка при изтриването на файла.'});
                  } else {
                    res.json({success:true});
                  }
                })
              }
            }
          }
        }
      })
    }
  }
};

var saveFile = function(file, path){
  file.pipe(fs.createWriteStream(path));
};
