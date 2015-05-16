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
          
          for(;;){
            // if files are 5, remove last
            if(user.lastFiles.length >= 5){
              user.lastFiles.pop();
            } else {
              break;
            }
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
          
          for(;;){
            // if pages are 5, remove last
            if (user.lastPages.length >= 5){
              user.lastPages.pop();
            } else {
              break;
            }
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
          
          for(;;){
            // if books are 5, remove last
            if (user.lastBooks.length >= 5){
              user.lastBooks.pop();
            } else {
              break;
            }
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
            callback(err);
          });
        }
      });
  },
  addLastCollection : function(user_id, collection_id, callback){
    User
      // get current last collections array
      .findById(user_id)
      .select('lastCollections')
      .exec(function(err, user){
        if(err){
          console.log('Error while getting last collections: ' + err);
          callback(err);
        } else if(!user_id) {
          console.log('User not found.');
          callback('User not found');
        } else {
          // create lastCollections array if undefined
          if(typeof user.lastCollections === 'undefined'){
            user.lastCollections = [];
          }
          
          for(;;){
            if (user.lastCollections.length >= 5){
              user.lastCollections.pop();
            } else {
              break;
            }
          }
          
          // check if collection is already in list
          for(var i in user.lastCollections){
            if(user.lastCollections[i] == collection_id){
              // if collection is already in list - remove it
              user.lastCollections.splice(i, 1);
              break;
            }
          }
          
          // add book to array
          user.lastCollections.unshift(collection_id);
          
          // save user data
          user.save(function(err, user){
            callback(err);
          });
        }
      });
  },
  removeLastFile: function(user_id, file_id, callback){
    User.update(
      {_id: user_id},
      { $pull: {'lastFiles' : file_id}},
      {},
      function(err){
        callback(err);
      }
    );
  },
  removeLastBook: function(user_id, book_id, callback){
    User.update(
      {_id: user_id},
      { $pull: {'lastBooks' : book_id}},
      {},
      function(err){
        callback(err);
      }
    );
  },
  removeLastPage: function(user_id, page_id, callback){
    User.update(
      {_id: user_id},
      { $pull: {'lastPages' : page_id}},
      {},
      function(err){
        callback(err);
      }
    );
  },
  removeLastCollection : function(user_id, collection_id, callback){
    User.update(
      {_id: user_id},
      { $pull: {'lastCollections' : collection_id}},
      {},
      function(err){
        callback(err);
      }
    );
  }
};
