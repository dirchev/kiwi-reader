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
  addLastPage: function(user_id, page_id, callback){
    User
      .findById(user_id)
      .select('lastPages')
      .exec(function(err, user){
        if(err){
          console.log("Error while getting user: " + err);
          callback(err);
        } else if(!user){
          callback("User not found.");
        } else {
          // if lastPages is undefined, declare it as array
          if(typeof user.lastPages === 'undefined'){
            user.lastPages = [];
          }

          // check if page is already in list
          for(var i in user.lastPages){
            if(user.lastPages[i] == page_id){
              // if page is already in list, remove it
              user.lastPages.splice(i, 1);
              break;
            }
          }

          // add page to array
          user.lastPages.unshift(page_id);

          //save user data
          user.save(function(err){
            if(err){
              callback(err);
            } else {
              callback();
            }
          });
        }
      });
  },
  addLastBook: function(user_id, book_id, callback){
    User
      .findById(user_id)
      .select('lastBooks')
      .exec(function(err, user){
        if(err){
          console.log("Error while getting user: " + err);
          callback(err);
        } else if(!user){
          callback("User not found.");
        } else {
          // if lastBooks is undefined, declare it as array
          if(typeof user.lastBooks === 'undefined'){
            user.lastBooks = [];
          }

          // check if book is already in list
          for(var i in user.lastBooks){
            if(user.lastBooks[i] == book_id){
              // if book is already in list, remove it
              user.lastBooks.splice(i, 1);
              break;
            }
          }

          // add book to array
          user.lastBooks.unshift(book_id);

          //save user data
          user.save(function(err){
            if(err){
              callback(err);
            } else {
              callback();
            }
          });
        }
      });
  }
};
