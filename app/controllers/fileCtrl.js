var File = require('../models/file');
var User = require('../models/user');
var path = require('path');
var fs = require('fs');
var fstream = require('fstream');
var office = require('office');
var cheerio = require('cheerio');
var mongoose = require('mongoose');

module.exports = function(){
  return {
    create: function(req, res){
      var file = new File();
      file.title = 'Неозаглавен файл';
      file.content = '';
      file.users.push(req.user._id);
      file.save(function(err, file){
        if(err){
            console.log(err);
            res.json({success: false, message: "Грешка при създаването на файл."});
          } else {
            res.json({success: true});
          }
      });
    },
    createFromFile: function(req, res){
      var filePath, fileType;
      if (req.busboy) {
        req.busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {
          if(mimetype === 'text/plain'){
            filePath = path.join(__dirname + '../../../uploads/files', path.basename(filename));
            fileType = 'txt';
            saveFile(file, filePath);
          } else if(mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
            filePath = path.join(__dirname + '../../../uploads/files', path.basename(filename));
            fileType = 'office';
            saveFile(file, filePath);
          } else if(mimetype === 'application/vnd.oasis.opendocument.text'){
            filePath = path.join(__dirname + '../../../uploads/files', path.basename(filename));
            fileType = 'office';
            saveFile(file, filePath);
          } else if(mimetype = 'application/msword') {
            filePath = path.join(__dirname + '../../../uploads/files', path.basename(filename));
            fileType = 'office';
            fileName = filename;
            saveFile(file, fileName);
          } else {
            console.log("Bad file format: " + mimetype);
            res.json({success:false, message:'Този файл не се поддържа!'});
          }
        });
        req.busboy.on('finish', function() {
          fs.readFile(__dirname + '../../uploads/files/' + fileName, 'utf8', function(err, fileContent){
            if(err){
              console.log(err);
              res.json({success:false, message:'Грешка при запазването на файла.'});
            } else {
              var file = new File();
              file.title = 'Неозаглавен файл';
              if(fileType === 'txt'){
                file.content = fileContent.replace(/\r?\n/g, '<br />');;
                file.users.push(req.user._id);
                file.save(function(err){
                  if(err){
                    res.json({success:false, message:'Грешка при запазването на файла.'});
                  }
                  res.json({success:true});
                });
              } else if (fileType === 'office'){
                parseDocx(filePath, function(content){
                  file.content = content;
                  file.users.push(req.user._id);
                  file.save(function(err){
                    if(err){
                      res.json({success:false, message:'Грешка при запазването на файла.'});
                    }
                    res.json({success:true});
                  });
                })

              } else {
                res.json({success:false, message:'Този файл не е поддържан.'})
              }
            }
          })
        });
        req.pipe(req.busboy);
      }
    },
    read: function(req, res){
      File.find({users: req.user._id}, function(err, data){
        if(err){
          console.log(err);
          res.json({success:false, message:'Възникна проблем при намирането на файла.'});
        }
        res.json(data);
      })
    },
    readOne: function(req, res){
      var file_id = req.params.file_id;
      File.findOne({_id : file_id , users: req.user._id}).lean().exec(function(err, data){
        var file = data;
        if(err){
          console.log(err);
          res.json({success:false, message:'Възникна проблем при намирането на файла.'});
        } else {
          res.json(file);
        }
      });
    },
    delete: function(req, res){
      var file_id = req.params.file_id;
      File.findOne({_id: file_id, users: req.user._id}, function(err, file){
        if(file.users.length === 1){
          File.remove({_id: file_id, users: req.user._id}, function(err, file){
            if(err)
              console.log(err);
            console.log('Deleting file: '+ file);
            res.json({success:true});
          })
        } else {
          File.update({_id: file_id, users: req.user._id}, {$pull:{users:req.user._id}}, {upsert:true}, function(err){
            if(err)
              console.log(err);
            res.json({success:true});
          });
        }
      })
    },
    share: function(req, res){
      // Put data in variables for easy access
      var file_id = req.params.file_id;
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
          File.update({$and:[{_id: file_id, users: req.user._id}, {users: {$ne: user._id}}]},{$push: {'users':user._id}},{upsert:true}, function(err, file){
            if(err){
              console.log('Error while updating file: ' + err);
              res.json({success:false, message: 'Този файл вече е споделен с този потребител.'});
            } else {
              res.json({success:true, file: file});
            }
          })
        }
      })
    },
    getShared: function(req, res){
      var file_id = req.params.file_id;
      File.findOne({_id:req.params.file_id, users: req.user._id}, function(err,file){
        if(err){
          console.log(err);
          res.json({success:false, message: 'Взимането на тази информация не е успешно.'});
        } else if(!file){
          res.json({success:false, message: 'Взимането на тази информация не е успешно.'});
        } else {
          var sharedUsers = [];
          for(var i = 0; i < file.users.length; i++){
            User.findById(file.users[i], function(err, user){
              if(err){
                console.log(err);
              }
              sharedUsers.push({_id: user._id, name: user.data.name, email: user.data.email });
              if(file.users.length === sharedUsers.length){
                res.json({success:true, users: sharedUsers});
              }
            });
          }
        }
      })
    },
    updateTitle: function(file_id, title, callback){
      File.findById(file_id).exec(function(err, file){
        if(err){
          console.log(err)
          callback(err);
        } else {
          file.title = title;
          file.save(function(err, data){
            if(err){
              console.log(err)
              callback(err);
            } else {
              callback(null, data);
            }
          });
        }
      })
    },
    updateContent: function(file_id, content, callback){
      File.findById(file_id).exec(function(err, file){
        if(err){
          console.log(err)
          callback(err);
        } else {
          file.content = content;
          file.save(function(err, data){
            if(err){
              console.log(err)
              callback(err);
            } else {
              callback(null, data);
            }
          });
        }
      });
    },
    // adds anotation to file
    addAnotation: function(file_id, anotation, callback){
      File.update(
        {_id : file_id},
        {$push: {'anotations':anotation}},
        {upsert: true},
        function(err, data){
          if(err){
            console.log(err);
            callback('Грешка при запазването на коментара.');
          } else {
            File.findById(file_id, function(err, file){
              if(err){
                console.log(err);
              } else {
                callback(null, file.anotations);
              }
            })
          }
        }
      );
    }, // end of addAnotation
    // adds comment to a specific anotation in file
    addComment: function(file_id, anotation_index, comment, callback){
      // search for file with specific id, where the user is from the file users
      File.findOne({_id: file_id}).exec(function(err, file){
        // if there is an err of file is missing, send message to the client
        if(err || !file){
          console.log(err);
          callback(err);
        } else {
          // push the comment in the specified anotation
          file.anotations[anotation_index].comments.push(comment);
          // save the file and if no errors, send success to client
          file.save(function(err){
            if(err){
              console.log(err);
              callback(err);
            } else {
              callback();
            }
          })
        }
      })
    }, // end of addComment

    // deletes anotation from a file
    deleteAnotation: function(file_id, anotation_index, callback){
      File.findOne({_id: file_id}).exec(function(err, file){
        if(err){
          console.log(err);
          callback(err);
        } else {
          file.anotations.splice(anotation_index, 1);
          file.save(function(err, file){
            if(err){
              console.log(err);
              callback(err);
            } else {
              callback();
            }
          })
        }
      })
    } // end of deleteAnotation

  } // end of return object
} // end of module.exports


// save file to directory
var saveFile = function(file, filename){
  file.pipe(fstream.Writer(__dirname + '../../uploads/files/' + filename));
};

var ObjectId = function(string){
  return mongoose.Types.ObjectId(string)
};

// gets .docx file path and returns its content (actually <body> tag content), converted to html
var parseDocx = function(document, callback){
  office.parse(document, function(err, data){
    if(err){
      console.log(err);
    }
    var $ = cheerio.load(data);
    var html = $('body').html();
    callback(html);
  });
};
