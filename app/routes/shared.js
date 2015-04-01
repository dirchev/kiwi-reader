var File = require('../models/file');
var User = require('../models/user');
var path = require('path');
var fs = require('fs');
var cheerio = require('cheerio');


module.exports = function(app, passport, busboy){
  var sharedCtrl = require('../controllers/sharedCtrl')(app);

  // get all files
  // TODO defferent views based on authentication
  app.get('/shared/file/:file_id', sharedCtrl.file);

};

// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {

    // if user is authenticated in the session, carry on
    if (req.isAuthenticated())
        return next();

    // if they aren't redirect them to the home page
    res.send(403);
}
