var User = require('../models/user');

module.exports = function(){
  return {
    getUserInfo: function(req, res){
      User
        .findById(req.user._id)
        .select('_id data.name data.email friends bookmarks')
        .populate('friends', 'data.name data.email')
        .exec(function(err, user){
          if(err){
            // TODO make this
          } else {
            res.json(user);
          }
        });
    }, // end of getUserInfo
    updateUserInfo: function(req, res){
      User.findById(req.user._id).exec(function(err, user){
        user.data.name = req.body.user.name;
        if(!emailExists(req.body.user.email)){
          user.data.email = req.body.user.email;
        } else {
          res.json({success:false, message:'Грешка при обновяването на данните. Потребител с този email вече съществува!'});
        }
        user.save(function(err){
          if(err){
            console.log('Error while updating user: ' + err);
            res.json({success:false, message:'Грешка при обновяването на данните'});
          } else {
            res.json({success:true});
          }
        });
      });
    } // end of updateUserInfo
  }; // end of return object
}; // end of module.exports

var emailExists = function(email){
  User.find({'data.email' : email}, function(err, user){
    if(err){
      console.log('Error while checking if user with email exists: ' + err);
      return false;
    } else if (!user){
      return false;
    } else {
      return true;
    }
  });
};
