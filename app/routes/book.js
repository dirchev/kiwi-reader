var fs = require('fs');
var bookCtrl = require('../controllers/bookCtrl')();

module.exports = function(app, passport){

  app.get('/api/book', isLoggedIn, bookCtrl.read)

  app.post('/api/book', isLoggedIn, bookCtrl.create)

  app.get('/api/book/:book_id', isLoggedIn, bookCtrl.readOne)

  app.post('/api/book/:book_id/share', isLoggedIn, bookCtrl.share)

  app.delete('/api/book/:book_id', isLoggedIn, bookCtrl.delete)

  app.get('/api/book/:book_id/share', isLoggedIn, bookCtrl.getShared)

};

// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {

    // if user is authenticated in the session, carry on
    if (req.isAuthenticated())
        return next();

    // if they aren't redirect them to the home page
    res.redirect('/');
}
