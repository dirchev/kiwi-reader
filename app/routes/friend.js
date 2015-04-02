var fs = require('fs');

module.exports = function(app, passport){
var friendCtrl = require('../controllers/friendCtrl')(app);

  // get all user`s friends
  app.get('/api/friend', isLoggedIn, friendCtrl.getUsersFriends);

  // add friend
  app.post('/api/friend', isLoggedIn, friendCtrl.addFriend);

  // rename friend
  app.post('/api/friend/:friend_index/rename', isLoggedIn, friendCtrl.renameFriend);

  // delete friend
  app.delete('/api/friend/:friend_index', isLoggedIn, friendCtrl.removeFriend);

};

// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {

    // if user is authenticated in the session, carry on
    if (req.isAuthenticated())
        return next();

    // if they aren't redirect them to the home page
    res.redirect('/');
}
