var fs = require('fs');
var bookCtrl = require('../controllers/bookCtrl')();

module.exports = function(app, passport){

  // get all user`s books
  app.get('/api/book', isLoggedIn, bookCtrl.read);

  // create new book
  app.post('/api/book', isLoggedIn, bookCtrl.create);

  // get book
  app.get('/api/book/:book_id', isLoggedIn, bookCtrl.readOne);

  // share book with user
  app.post('/api/book/:book_id/share', isLoggedIn, bookCtrl.share);

  // remove user from book or delete book
  app.delete('/api/book/:book_id', isLoggedIn, bookCtrl.delete);

  // set last page readed position
  app.post('/api/book/:book_id/position', isLoggedIn, bookCtrl.setUserPosition);

  // rename book
  app.post('/api/book/:book_id/rename', isLoggedIn, bookCtrl.rename);
};

// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {

    // if user is authenticated in the session, carry on
    if (req.isAuthenticated())
        return next();

    // if they aren't redirect them to the home page
    res.redirect('/');
}
