module.exports = function(app, passport){

  // HOME PAGE with login links
  app.get('/', function(req, res){
    res.render('index.ejs');
  });

  // LOGIN to show he login form
  app.get('/login', function(req, res){
    res.render('login.ejs', { message: req.flash('loginMessage') });
  });

  // PROCESS LOGIN
  // uncomment later
  app.post('/login', passport.authenticate('local-login', {
      successRedirect : '/app', // redirect to the secure profile section
      failureRedirect : '/login', // redirect back to the signup page if there is an error
      failureFlash : true // allow flash messages
  }));

  // SIGNUP to singup the user
  app.get('/signup', function(req, res){
    res.render('signup.ejs', { message: req.flash('signupMessage') });
  });

  // PROCESS SIGNUP
  app.post('/signup', passport.authenticate('local-signup', {
      successRedirect : '/app', // redirect to the secure profile section
      failureRedirect : '/signup', // redirect back to the signup page if there is an error
      failureFlash : true // allow flash messages
  }));

  // =====================================
  // FACEBOOK ROUTES =====================
  // =====================================

  // route for facebook authentication and login
  app.get('/auth/facebook', passport.authenticate('facebook', {scope : 'email'}));

  // handle the callack after facebook auth
  app.get('/auth/facebook/callback',
    passport.authenticate('facebook', {
      successRedirect : '/app',
      failureRedirect : '/'
    }));


  // LOGOUT
  app.get('/logout', function(req, res){
    req.logout();
    res.redirect('/');
  });

  // PROFILE SECTION
  // protected page only for logged users
  app.get('/app', isLoggedIn, function(req, res){
    res.render('app.ejs');
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
