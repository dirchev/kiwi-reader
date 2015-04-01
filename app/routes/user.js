module.exports = function(app, passport){
  var userCtrl = require('../controllers/userCtrl')(app);
  app.get('/api/user', isLoggedIn, userCtrl.getUserInfo);

  app.post('/api/user', isLoggedIn, userCtrl.updateUserInfo);
};


// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {

    // if user is authenticated in the session, carry on
    if (req.isAuthenticated())
        return next();

    // if they aren't redirect them to the home page
    res.redirect('/');
}
