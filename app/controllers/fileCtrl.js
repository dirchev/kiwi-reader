var File = require('../models/file');
var User = require('../models/user');
var path = require('path');
var fs = require('fs');
var fstream = require('fstream');
var cheerio = require('cheerio');
var mongoose = require('mongoose');
var awsService = require('../services/aws');
var docParser = require('../services/doc-parser');
var lastService = require('../services/last');

module.exports = function(){
  return {
    create: function(req, res){
      createFile(req.user, null, null, function(response){
        res.json(response);
      });
    },
    // import file
    createFromFile: function(req, res){
      var filePath, fileType, fileName;
      var fileReady = false;
      // check if there is a file uploaded
      if (req.busboy) {
        // get info about the file
        req.busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {
          if(mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'){
            fileType = 'docx';
            fileName = filename;
            filePath = path.join(__dirname + '/../../uploads/files', path.basename(filename));
            saveFile(file, filePath, function(){
              fileReady = true;
            });
          } else if( mimetype === 'text/plain' ){
            fileType = 'txt';
            fileName = filename;
            filePath = path.join(__dirname + '/../../uploads/files', path.basename(filename));
            saveFile(file, filePath, function(){
              fileReady = true;
            });
          } else {
            console.log("Bad file format: " + mimetype);
            res.json({success:false, message:'Този файл не се поддържа!'});
          }
        });
        // when uploading finishes
        req.busboy.on('finish', function() {
          var interval = setInterval(function(){
            if(fileReady){
              console.log('checking if file is ready...');
              clearInterval(interval);
              fileReady = false;
              if(fileType === 'txt'){
                fs.readFile(filePath, 'utf8', function(err, fileContent){
                  if(err){
                    res.json({success:false, message:'Грешка при запазването на файла.'});
                  } else {
                    docParser.txtToHTML(filePath, function(err, fileContent){
                      if(err){
                        res.json({success:false, message:err});
                      } else {
                        createFile(req.user, fileName, fileContent, function(response){
                          res.json(response);
                        });
                      }
                    });
                  }
                });
              } else if (fileType === 'docx'){
                docParser.docxToHTML(filePath, function(err, fileContent){
                  if(err){
                    console.log("Error while parsing: " + err);
                    res.json({success:false, message: 'Възникна грешка при обработването на файла.'});
                  } else {
                    createFile(req.user, fileName, fileContent, function(response){
                      res.json(response);
                    });
                  }
                });
              } else {
                res.json({success:false, message:'Този файл не е поддържан.'});
              }
            }
          }, 500);
        });
        req.pipe(req.busboy);
      }
    },
    createDropboxFile : function(req, res){
      var user = req.user;
      var fileData = req.body.file;
      docParser.dropboxToHTML(fileData, function(err, fileContent){
        if(err){
          res.json({success:false, message:err});
        } else {
          createFile(req.user, fileData.name, fileContent, function(response){
            res.json(response);
          });
        }
      });
    },
    // get all files from user
    read: function(req, res){
      var user_id = req.user._id;
      File.find({users: user_id}, function(err, data){
        if(err){
          console.log(err);
          res.json({success:false, message:'Възникна проблем при намирането на файла.'});
        }
        res.json(data);
      });
    },
    // get file
    readOne: function(req, res){
      var file_id = req.params.file_id;
      File
        .findOne({_id : file_id , users: req.user._id})
        .populate('users anotations.user anotations.comments.user', 'data.name data.email')
        .exec(function(err, file){
          if(err){
            console.log(err);
            res.json({success:false, message:'Възникна проблем при намирането на файла.'});
          } else if (!file) {
            res.json({success:false, message:"Файлът не е намерен."});
          } else {
            // add file do last files
            lastService.addLastFile(req.user._id, file_id, function(err){
              if(err){
                res.json({success:false, message:err});
              } else {
                res.json({success:true, file:file});
              }
            });
          }
      });
    },
    delete: function(req, res){
      var file_id = req.params.file_id;
      File.findOne({_id: file_id, users: req.user._id}, function(err, file){
        if(file.users.length === 1){
          File.remove({_id: file_id, users: req.user._id}, function(err, file){
            if(err){
              console.log("Error while deleting file: " + err);
              res.json({success:false, message: "Възникна грешак при изтриването на файла."}); 
            }
            lastService.removeLastFile(req.user._id, file_id, function(err){
              if(err){
                console.log("Error while ramoving file from Last Files");
                res.json({success:false, message: "Възникна грешка при изтриването на файла."});
              } else {
                res.json({success:true});
              }
            });
          });
        } else {
          File.update({_id: file_id, users: req.user._id}, {$pull:{users:req.user._id}}, {upsert:false}, function(err){
            if(err){
              console.log("Error while deleting file: " + err);
              res.json({success:false, message: "Възникна грешак при изтриването на файла."}); 
            }
            lastService.removeLastFile(req.user._id, file_id, function(err){
              if(err){
                console.log("Error while ramoving file from Last Files");
                res.json({success:false, message: "Възникна грешка при изтриването на файла."});
              } else {
                res.json({success:true});
              }
            });
          });
        }
      });
    },
    share: function(req, res){
      // Put data in variables for easy access
      if(userEnteredEmail(req.user) == false){
        res.json({success:false, message: 'Не може да споделяте файлове без да сте въвели email. Въведете Вашият email от меню "Профил".'});
      } else {
        var file_id = req.params.file_id;
        var user_email = req.body.user_email;
        // Get all data for the user, we want to share file to
        User
          .findOne({'data.email': user_email})
          .select('_id data.name data.email')
          .exec(function(err, user){
            if(err){
              console.log('Error while searching for user: ' + err);
            } else if(!user){
              // if user not exists (bad email) send message to client
              res.json({success:false, message: 'Не е намерен потребител с този email.'});
            } else {
              // update file, that is with mentioned id, if the user who wants
              //to share it is its owner and if it is not shared to the samo user before
              File
              .update(
                // select the file with id = file_id and one of his users is req.user
                {$and:[{_id: file_id, users: req.user._id},
                // check if file is not already shared with that user
                {users: {$ne: user._id}}]},
                // push the user to file.users array
                {$push: {'users':user._id}},
                // options
                {upsert:false})
              .exec(function(err, file){
                if(err){
                  console.log('Error while updating file: ' + err);
                  res.json({success:false, message: 'Този файл вече е споделен с този потребител.'});
                } else {
                  res.json({success:true, user:user});
                }
              });
            }
          });
      }
    },
    updateTitle: function(file_id, title, callback){
      File.findById(file_id).exec(function(err, file){
        if(err){
          console.log(err);
          callback(err);
        } else {
          file.title = title;
          file.save(function(err, data){
            if(err){
              console.log(err);
              callback(err);
            } else {
              callback(null, data);
            }
          });
        }
      });
    },
    updateContent: function(file_id, content, callback){
      File.findById(file_id).exec(function(err, file){
        if(err){
          console.log(err);
          callback(err);
        } else {
          file.content = content;
          file.save(function(err, data){
            if(err){
              console.log(err);
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
      File
        .update(
          {_id : file_id},
          {$push: {'anotations':anotation}},
          {upsert: false})
        .exec(function(err, data){
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
            });
          }
        });
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
          });
        }
      });
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
          });
        }
      });
    }, // end of deleteAnotation
    
    // rename file
    rename: function(req, res){
      var file_id = req.params.file_id;
      var newName = req.body.name;
      File.update({_id: file_id, "users": req.user._id}, {title:newName}, {upsert:false}, function(err, rows){
        if(err){
          console.log('Error while updating file name ' + err);
          res.json({success:false, message: 'Грешка при преименуването на файла.'});
        } else if(rows === 0){
          res.json({success:false, message: 'Файлът не беше намерен'});
        } else {
          res.json({success:true});
        }
      });
    }, // end of rename
    
    // make file public
    public: function(req, res){
      //gets the id of the file
      var file_id = req.params.file_id;
      //gets user, who requested the change
      var user = req.user;
      // gets if public is changed to true or false;
      var public = req.body.public;
      // searches for the file
      File.findOne({_id: file_id, "users": user._id}).exec(function(err, file){
        // checks if there is an error
        if(err){
          console.log('Error while searching for file:' + err);
          res.json({success:false, message:'Възникна грешка при търсенето на файла.'});
        // checks if there is a file
        } else if(file === null){
          res.json({success:false, message:'Файлът не може да бъде намерен.'});
        } else {
          // changes public property of the file
          file.public = public;
          // updates information to database
          file.save(function(err){
            // checks for error while saving
            if(err){
              res.json({success:false, message:'Възникна грешка при обновяването на информацията.'});
            } else {
              // sends success message for client
              res.json({success:true});
            }
          });
        }
      });
    } // end of public

  }; // end of return object
}; // end of module.exports


var createFile = function(creator, fileTitle, fileContent, cb){
  var file = new File();
  file.title = fileTitle || 'Неозаглавен файл';
  file.content = fileContent || '';
  file.public = false;
  file.users.push(creator._id);
  file.save(function(err, file){
    if(err){
        console.log(err);
        cb({success: false, message: "Грешка при създаването на файл."});
      } else {
        cb({success: true});
      }
  });
};

// save file to directory
var saveFile = function(file, path, cb){
    console.log('uploading file...');
  file.pipe(fs.createWriteStream(path)).on('close', function(){
    console.log('file uploaded!');
    cb();
  });
};

// check if  user has entered his email
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


var ObjectId = function(string){
  return mongoose.Types.ObjectId(string);
};
