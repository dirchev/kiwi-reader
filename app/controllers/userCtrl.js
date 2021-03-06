var User = require('../models/user');

module.exports = function(){
  return {
    getUserInfo: function(req, res){
      User
        .findById(req.user._id)
        .select('_id data.name data.email friends bookmarks lastFiles lastPages lastBooks lastCollections')
        .populate('friends', 'data.name data.email')
        .populate('lastFiles', '_id title')
        .populate('lastPages', '_id title')
        .populate('lastBooks', '_id title')
        .populate('lastCollections', '_id title')
        .exec(function(err, user){
          if(err){
            console.log("Error while getting user data: " + err);
            res.json({succcess:false, message: "Грешка при вземането на инфоермацията"});
          } else if(!user){
            res.json({succcess:false, message: "Потребителят не беше намерен."});
          } else {
            res.json({success:true, user:user});
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
    }, // end of updateUserInfo
    createUser : function(req, res){
      var userdata = req.body.user;
      var user = new User();
      user.data.name = userdata.name;
      user.data.email = userdata.email;
      user.local.email = userdata.email;
      user.local.password = user.generateHash(userdata.password);
      user.save(function(err){
        if(err){
          res.send({success:false, message:err});
        } else {
          res.send({success:true});
        }
      });
    }
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
