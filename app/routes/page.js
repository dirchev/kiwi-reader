
module.exports = function(app, passport, busboy){
  var pageCtrl = require('../controllers/pageCtrl')(app);

  // get all files
  app.get('/api/page', isLoggedIn, pageCtrl.get);

  // get Page HTML
  app.get('/api/page/html', pageCtrl.getPageHtml);

  // get page with id = page_id
  app.get('/api/page/:page_id', isLoggedIn, pageCtrl.getOne);

  // get page with id = page_id
  app.post('/api/page', isLoggedIn, pageCtrl.create);

  //delete page
  app.delete('/api/page/:page_id', isLoggedIn, pageCtrl.delete);

  // share page
  app.post('/api/page/:page_id/share', isLoggedIn, pageCtrl.share);
};

// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {

    // if user is authenticated in the session, carry on
    if (req.isAuthenticated())
        return next();

    // if they aren't redirect them to the home page
    res.redirect('/');
}
