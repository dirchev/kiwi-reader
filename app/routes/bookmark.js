var fs = require('fs');

module.exports = function(app, passport){
var bookmarkCtrl = require('../controllers/bookmarkCtrl')(app);

  // get all user`s bookmarks
  app.get('/api/bookmark', isLoggedIn, bookmarkCtrl.getUsersBookmarks);

  // add bookmark
  app.post('/api/bookmark', isLoggedIn, bookmarkCtrl.addBookmark);

  // delete bookmark
  app.delete('/api/bookmark/:bookmark_index', isLoggedIn, bookmarkCtrl.deleteBookmark);

};

// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {

    // if user is authenticated in the session, carry on
    if (req.isAuthenticated())
        return next();

    // if they aren't redirect them to the home page
    res.redirect('/');
}
