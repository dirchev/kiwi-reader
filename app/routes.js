var EPub = require('epub');
module.exports = function(app, passport){

  // TESTS
  app.get('/book', function(req, res){
    var book = new EPub('./book.epub', '/book/111/image/', '/book/111/chapters/');
    book.on("end", function(){
      book.flow.forEach(function(chapter){
        console.log(chapter.id);
      });
      book.getChapter("item-9", function(error, text){
        res.send(text);
      });
    });
    book.parse();
  });

  app.get('/book/:book_id/:data_type/:data_id/*', function(req, res){
    var book = new EPub('./book.epub');
    book.on("end", function(){
      console.log("Book ID: " + req.params.book_id);
      console.log("Data Type: " + req.params.data_type);
      console.log("Data ID: " + req.params.data_id);
      book.getImage(req.params.data_id, function(error, img, mimeType){
        res.send(img);
      });
    });
    book.parse();
  })

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
