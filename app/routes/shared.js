var File = require('../models/file');
var User = require('../models/user');
var path = require('path');
var fs = require('fs');
var cheerio = require('cheerio');


module.exports = function(app, passport, busboy){
  var isLoggedIn = require('../services/is-authenticated')(app);
  var sharedCtrl = require('../controllers/sharedCtrl')(app);

  // get all files
  // TODO defferent views based on authentication
  app.get('/shared/file/:file_id', sharedCtrl.file);

};
