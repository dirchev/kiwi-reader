var User = require('../models/user');

module.exports = function(){
  return {
    // gets all friends of logged user
    getUsersFriends: function(req, res){
      User.findById(req.user._id).exec(function(err, user){
        if(err){
          console.log('Error while searching for user: ' + err);
          res.json({success:false, message:'Възникна грешка при взимането на информацията.'});
        } else if (!user) {
          res.json({success:false, message: 'Потребителят не може да бъде намерен.'});
        } else {
          res.json({success:true, friends: user.friends});
        }
      });
    }, // end of getUsersFriends

    addFriend: function(req, res){
      var friend_email = req.body.friend_email;
      var friend = {};
      // get friend info
      User.findOne({"data.email" : friend_email}).exec(function(err, user){
        if(err){
          console.log('Error while searching for user: ' + err);
          res.json({success:false, message:'Възникна грешка при взимането на информацията.'});
        } else if (!user) {
          res.json({success:false, message: 'Потребителят не може да бъде намерен.'});
        } else {
          // put friend info in friend object
          friend._id = user._id;
          friend.name = user.data.name;
          friend.email = user.data.email;

          // get data of logged user
          User.findById(req.user._id).exec(function(err, user){
            if(err){
              console.log('Error while searching for user: ' + err);
              res.json({success:false, message:'Възникна грешка при взимането на информацията.'});
            } else if (!user) {
              res.json({success:false, message: 'Потребителят не може да бъде намерен.'});
            } else {

              // check if friend is already in friends list
              var alreadyInFriends = false;
              for(var i in user.friends){
                if(user.friends[i]._id === friend._id){
                  alreadyInFriends = true;
                  break;
                }
              }
              if(alreadyInFriends){
                // if it is, send error to user
                res.json({success:false, message: 'Този потребител вече е в списъка с приятели.'});
              } else {
                // if not, add new friend
                user.friends.push(friend);
                user.save(function(err){
                  if(err){
                    console.log('Error while updating user:' + err);
                    res.json({success:false, message: 'Възникна грешка при обновяването на информацията.'});
                  } else {
                    res.json({success:true});
                  }
                });
              }
            }
          });
        }
      });
    }, // end of addFriend

    removeFriend: function(req, res){
      var friend_index = req.params.friend_index;
      User.findById(req.user._id).exec(function(err, user){
        if(err){
          console.log('Error while searching for user: ' + err);
          res.json({success:false, message:'Възникна грешка при взимането на информацията.'});
        } else if (!user) {
          res.json({success:false, message: 'Потребителят не може да бъде намерен.'});
        } else {
          user.friends.splice(friend_index, 1);
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
    }, // end of removeFriend
    renameFriend: function(req, res){
      var friend_index = req.params.friend_index;
      var newFriendName = req.body.friend_name;
      User.findById(req.user._id).exec(function(err, user){
        if(err){
          console.log('Error while searching for user: ' + err);
          res.json({success:false, message:'Възникна грешка при взимането на информацията.'});
        } else if (!user) {
          res.json({success:false, message: 'Потребителят не може да бъде намерен.'});
        } else {
          user.friends[friend_index].name = newFriendName;
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
    } // end of renameFriend
  }; // end of return object
}; // end of module.exports
