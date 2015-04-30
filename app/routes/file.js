
module.exports = function(app, passport, busboy){
  var fileCtrl = require('../controllers/fileCtrl')(app);

  // get all files
  app.get('/api/file', isLoggedIn, fileCtrl.read);
  // get file with id = file_id
  app.get('/api/file/:file_id', isLoggedIn, fileCtrl.readOne);

  // create new blank file
  app.post('/api/file', isLoggedIn, fileCtrl.create);
  
  // create file from dropbox
  app.post('/api/file/dropbox', isLoggedIn, fileCtrl.createDropboxFile);
  
  // import file
  app.post('/api/file/txt', isLoggedIn, fileCtrl.createFromFile);

  //delete file
  app.delete('/api/file/:file_id', isLoggedIn, fileCtrl.delete);

  // share file
  app.post('/api/file/:file_id/share', isLoggedIn, fileCtrl.share);

  // make public
  app.post('/api/file/:file_id/public', isLoggedIn, fileCtrl.public);

  // rename file
  app.post('/api/file/:file_id/rename', isLoggedIn, fileCtrl.rename);

};

// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {

    // if user is authenticated in the session, carry on
    if (req.isAuthenticated())
        return next();

    // if they aren't redirect them to the home page
    res.redirect('/');
}
