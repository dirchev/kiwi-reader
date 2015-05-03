var fs = require('fs');

module.exports = function(app, passport){
  var friendCtrl = require('../controllers/friendCtrl')(app);
  var isLoggedIn = require('../services/is-authenticated')(app);

  // get all user`s friends
  app.get('/api/friend', isLoggedIn, friendCtrl.getUsersFriends);

  // add friend
  app.post('/api/friend', isLoggedIn, friendCtrl.addFriend);

  // rename friend
  app.post('/api/friend/:friend_index/rename', isLoggedIn, friendCtrl.renameFriend);

  // delete friend
  app.delete('/api/friend/:friend_index', isLoggedIn, friendCtrl.removeFriend);

};