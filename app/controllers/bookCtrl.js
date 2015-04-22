var Book = require('../models/book');
var User = require('../models/user');
var path = require('path');
var fs = require('fs');
var rmdir = require('rimraf');
var epubParser = require('../services/epub-parser');
var awsService = require('../services/aws');
var fileStorageType = require('../../config/file_storage');

module.exports = function(){
  return {
    create: function(req, res){
      var filePath;
      var fileName;
      if(req.busboy){
        req.busboy.on('file', function(fieldname, file, filename, encoding, mimetype){
          if(mimetype !== 'application/epub+zip'){
            res.json({
              success: false,
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
          book.users.push({user: req.user._id, position: '0'});
          book.save(function(err, book){
            if(err){
              console.log(err);
              res.json({success:false, message: 'Грешка при създаването на нова книга.'});
            } else {
              var outputPath = __dirname + '/../../uploads/extracted/' + book.id;
              var epubPath = filePath;
              epubParser.unzip(epubPath, outputPath, function(){
                var folderPath = path.join(__dirname + '/../../uploads/extracted/', book.id);
                epubParser.getContent(folderPath, book._id.toString(), function(opf){
                  book.opf = opf;
                  book.save(function(err, book){
                    if(err){
                      console.log(err);
                      res.json({success:false, message: 'Грешка при създаването на нова книга.'});
                    }
                    res.send({success:true, book: book});
                  });
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
      Book
        .find({'users.user': user.id})
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
      Book
        .findOne({_id: book_id, 'users.user': user._id})
        .populate('users.user', 'data.name data.email')
        .exec(function(err, book){
          if(err){
            console.log(err);
            res.json({success:false, message: 'Грешка при зареждането на книгата.'});
          } else if (!book) {
            res.json({success:false, message: 'Книгата не беше намерена.'});
          } else {
            res.json({success:true, book:book});
          }
        });
    },
    delete: function(req, res){
      var book_id = req.params.book_id;
      var user = req.user;
      Book.findOne({_id: book_id, 'users.user': user._id}).exec(function(err, book){
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
                if(fileStorageType.get() === 'aws'){
                  // delete folder from aws s3 bucket
                  awsService().deleteDir(remoteDir, function(err){
                    if(err){
                      console.log('Folder was not deleted successfully');
                      console.log(err);
                      res.json({success:false, message: 'Грешка при изтриването на книгата.'});
                    }
                    res.json({success:true});
                  });
                }
              }
            });
          } else {
            for(var i = 0 ; i < book.users.length ; i++){
              if(book.users[i]._id.toString() === user._id.toString()){
                book.users.splice(i, 1);
              }
            }
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
      });
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
            Book
              .update(
                {$and:[{_id: book_id, "users.user": req.user._id},
                {"users.user": {$ne: user._id}}]},
                {$push: {'users':{_id: user._id, position: 0}}},
                {upsert:false})
              .exec(function(err, book){
                if(err){
                  console.log('Error while updating book: ' + err);
                  res.json({success:false, message: 'Тази книга вече е споделена с този потребител.'});
                } else {
                  res.json({success:true});
                }
              });
          }
        });
      }
    },
    setUserPosition: function(req, res){
      var book_id = req.params.book_id;
      var userIndex = req.body.userIndex;
      var position = req.body.position;
      Book.findById(book_id).exec(function(err, book){
        if(err){
          console.log(err);
          res.json({success:false, message:"Грешка при обновяването на позицията: книгата не може да бъде намерена."});
        } else {
          book.users[userIndex].position = position;
          book.save(function(err){
            if(err){
              console.log(err);
              res.json({success:false, message:"Грешка при обновяването на позицията: информацията не може да бъде запазена."});
            } else {
              res.json({success:true});
            }
          });
        }
      });
    },
    rename: function(req, res){
      var book_id = req.params.book_id;
      var newName = req.body.name;
      Book.update({_id: book_id, "users.user": req.user._id}, {title:newName}, {upsert:false}, function(err, rows){
        if(err){
          console.log('Error while updating book name ' + err);
          res.json({success:false, message: 'Грешка при преименуването на книгата.'});
        } else if(rows === 0) {
          res.json({success:false, message: 'Книгата не е намерена.'});
        }else {
          res.json({success:true});
        }
      });
    }, // end of rename
    addAnotation: function(book_id, anotation, cb){
      Book.update(
        {_id : book_id},
        {$push: {'anotations':anotation}},
        {upsert: false},
        function(err, data){
          if(err){
            console.log(err);
            callback('Грешка при запазването на анотацията.');
          } else {
            Book.findById(book_id, function(err, book){
              if(err){
                console.log(err);
              } else {
                callback(null, book.anotations);
              }
            });
          }
        }
      );
    }

  };
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
  });
};

var saveFile = function(file, path){
  file.pipe(fs.createWriteStream(path));
};
