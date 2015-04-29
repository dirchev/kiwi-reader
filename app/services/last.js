var User = require('../models/user');
module.exports = {
  addLastFile: function(user_id, file_id, callback){
    User
      .findById(user_id)
      .select('lastFiles')
      .exec(function(err, user){
        if(err){
          console.log("Error while getting user: " + err);
          callback(err);
        } else if (!user){
          callback('User not found.');
        } else {
          // if lastFiles is undefined, declare it as array
          if(typeof user.lastFiles === "undefined"){
            user.lastFiles = [];
          }

          //check if this file is alredy in array
          for(var i in user.lastFiles){
            if(user.lastFiles[i] == file_id){
              // if file is already in array, remove it
              user.lastFiles.splice(i ,1);
              break;
            }
          }

          // add file to array
          user.lastFiles.unshift(file_id);

          //save user data
          user.save(function(err){
            if(err){
              console.log("Error while saving user: " + err);
              callback(err);
            } else {
              callback();
            }
          });
        }
      });
  },
  getLastFiles: function(user_id){
    User
      .findById(user_id)
      .select('lastFiles')
      .populate('lastFiles', '_id title')
      .exec(function(err, files){
        if(err){
          console.log("Error while getting last files: " + err);
          callback("Възникна грешка при взимането на последно отворените файлове.");
        } else {
          callback(null, files);
        }
      });
  }
};
