var User = require('../models/user');
// TODO move logic to controller
module.exports = function(app, passport){
  app.get('/api/user', isLoggedIn, function(req, res){
    User.findById(req.user._id).lean().exec(function(err, data){
      var user = {
        _id: data._id,
        name: data.data.name,
        email: data.data.email
      };
      res.json(user);
    });
  });
  app.post('/api/user', isLoggedIn, function(req, res){
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
  });
};

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


// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {

    // if user is authenticated in the session, carry on
    if (req.isAuthenticated())
        return next();

    // if they aren't redirect them to the home page
    res.redirect('/');
}
