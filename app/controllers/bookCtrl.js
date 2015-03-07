var Book = require('../models/book');
var User = require('../models/user');
var path = require('path');
var fs = require('fs');
var rmdir = require('rimraf');
var epubParser = require('../services/epub-parser');
var awsService = require('../services/aws');

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
          res.json({success:false, message: 'Грешка при изтриването на книгата.'});
        } else if (!book){
          res.json({success:false, message: 'Книгата не беше намерена'});
        } else {
          if(book.users.length === 1){
            book.remove(function(err){
              if(err){
                console.log(err);
                res.json({success:false, message: 'Грешка при изтриването на книгата.'});
              } else {
                var remoteDir = 'extracted/' + book.id;
                awsService().deleteDir(remoteDir, function(err){
                  if(err){
                    console.log('Folder was not deleted successfully');
                    console.log(err);
                    res.json({success:false, message: 'Грешка при изтриването на книгата.'});
                  }
                  res.json({success:true});
                });
              }
            });
          } else {
            for(var i = 0 ; i < book.users.length ; i++){
              if(book.users[i]._id.toString() === user._id.toString()){
                book.users.splice(i, 1);
                book.save(function(err){
                  if(err){
                    console.log(err);
                    res.json({success:false, message: 'Грешка при изтриването на книгата.'});
                  } else {
                    res.json({success:true});
                  }
                });
              }
            }
          }
        }
      })
    },
    share: function(req, res){
      // Put data in variables for easy access
      if(userEnteredEmail(req.user) === false){
        res.json({success:false, message: 'Не може да споделяте книги без да сте въвели email. Въведете Вашият email от меню "Профил".'});
      } else {
        var book_id = req.params.book_id;
        var user_email = req.body.user_email;
        // Get all data for the user, we want to share file to
        User.findOne({'data.email': user_email}, function(err, user){
          if(err){
            console.log('Error while searching for user: ' + err);
          } else if(!user){
            // if user not exists (bad email) send message to client
            res.json({success:false, message: 'Не е намерен потребител с този email.'});
          } else {
            // update file, that is with mentioned id, if the user who wants
            //to share it is its owner and if it is not shared to the samo user before
            Book.update(
                {$and:[{_id: book_id, "users._id": req.user._id}, {"users._id": {$ne: user._id}}]},
                {$push: {'users':{_id: user._id, position: 0}}},{upsert:true},
              function(err, book){
              if(err){
                console.log('Error while updating book: ' + err);
                res.json({success:false, message: 'Тази книга вече е споделена с този потребител.'});
              } else {
                res.json({success:true});
              }
            })
          }
        })
      }
    },
    getShared: function(req, res){
      var book_id = req.params.book_id;
      Book.findOne({_id:book_id, "users._id": req.user._id}, function(err,book){
        if(err){
          console.log(err);
          res.json({success:false, message: 'Взимането на тази информация не е успешно.'});
        } else if(!book){
          res.json({success:false, message: 'Взимането на тази информация не е успешно.'});
        } else {
          var sharedUsers = [];
          for(var i = 0; i < book.users.length; i++){
            User.findById(book.users[i]._id, function(err, user){
              if(err){
                console.log(err);
              }
              sharedUsers.push({_id: user._id, name: user.data.name, email: user.data.email });
              if(book.users.length === sharedUsers.length){
                res.json({success:true, users: sharedUsers});
              }
            });
          }
        }
      })
    }
  }
};

var userEnteredEmail = function(data){
  User.findById(data._id).exec(function(err, user){
    if(err || !user){
      return false;
    } else {
      if(user.data.email){
        return true;
      } else {
        return false;
      }
    }
  })
}

var saveFile = function(file, path){
  file.pipe(fs.createWriteStream(path));
};
