
module.exports = function(app, passport){
var bookmarkCtrl = require('../controllers/bookmarkCtrl')(app);
  var isLoggedIn = require('../services/is-authenticated')(app);

  // get all user`s bookmarks
  app.get('/api/bookmark', isLoggedIn, bookmarkCtrl.getUsersBookmarks);

  // add bookmark
  app.post('/api/bookmark', isLoggedIn, bookmarkCtrl.addBookmark);

  // delete bookmark
  app.delete('/api/bookmark/:bookmark_index', isLoggedIn, bookmarkCtrl.deleteBookmark);

};