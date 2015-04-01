var User = require('../models/user');

module.exports = function(){
  return {
    getUsersBookmarks: function(req, res){
      User.findById(req.user._id).exec(function(err, user){
        if(err){
          console.log('Error while searching for user: ' + err);
          res.json({success:false, message:'Възникна грешка при взимането на информацията.'});
        } else if (!user) {
          res.json({success:false, message: 'Потребителят не може да бъде намерен.'});
        } else {
          res.json({success:true, bookmarks: user.bookmarks});
        }
      });
    },
    addBookmark: function(req, res){
      var bookmark = req.body.bookmark;
      User.findById(req.user._id).exec(function(err, user){
        if(err){
          console.log('Error while searching for user: ' + err);
          res.json({success:false, message:'Възникна грешка при взимането на информацията.'});
        } else if (!user) {
          res.json({success:false, message: 'Потребителят не може да бъде намерен.'});
        } else {
          user.bookmarks.push({content: bookmark});
          user.save(function(err){
            if(err){
              console.log('Error while updating user:' + err);
              res.json({success:false, message: 'Възникна грешка при обновяването на информацията.'});
            } else {
              res.json({success:true});
            }
          });
        }
      });
    },
    deleteBookmark: function(req, res){
      var bookmark_index = req.params.bookmark_index;
      User.findById(req.user._id).exec(function(err, user){
        if(err){
          console.log('Error while searching for user: ' + err);
          res.json({success:false, message:'Възникна грешка при взимането на информацията.'});
        } else if (!user) {
          res.json({success:false, message: 'Потребителят не може да бъде намерен.'});
        } else {
          console.log(user.bookmarks);
          user.bookmarks.splice(bookmark_index, 1);
          user.save(function(err){
            if(err){
              console.log('Error while updating user:' + err);
              res.json({success:false, message: 'Възникна грешка при обновяването на информацията.'});
            } else {
              res.json({success:true});
            }
          });
        }
      });
    }
  }; // end of return object
}; // end of module.exports
