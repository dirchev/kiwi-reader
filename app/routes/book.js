var fs = require('fs');

module.exports = function(app, passport){
  var bookCtrl = require('../controllers/bookCtrl')(app);

  app.get('/api/book', isLoggedIn, bookCtrl.read);

  //app.post('/api/book', isLoggedIn, bookCtrl.create);
  app.post('/api/book', bookCtrl.create);

  // app.get('/api/book/:book_id', isLoggedIn, bookCtrl.readOne);
  app.get('/api/book/:book_id', bookCtrl.readOne);

  app.post('/api/book/:book_id/share', isLoggedIn, function(req, res){

  })

  app.delete('/api/book/:book_id', isLoggedIn, bookCtrl.delete);
};

// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {

    // if user is authenticated in the session, carry on
    if (req.isAuthenticated())
        return next();

    // if they aren't redirect them to the home page
    res.redirect('/');
}
