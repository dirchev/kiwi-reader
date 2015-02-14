var File = require('../models/file');
var User = require('../models/user');
var path = require('path');
var fs = require('fs');
var office = require('office');
var cheerio = require('cheerio');


module.exports = function(app, passport, busboy){
  var fileCtrl = require('../controllers/fileCtrl')(app);
  
  app.post('/api/file', isLoggedIn, function(req, res){
    fileCtrl.create(req, res);
  });

  app.post('/api/file/txt', isLoggedIn, function(req, res){
    fileCtrl.createFromFile(req, res);
  });

  app.put('/api/file/:file_id', isLoggedIn, function(req, res){
    fileCtrl.update(req, res);
  });

  app.put('/api/file/:file_id/anotations', isLoggedIn, function(req, res){
    fileCtrl.updateAnotations(req, res);
  });

  app.get('/api/file', isLoggedIn, function(req, res){
    fileCtrl.read(req, res);
  });

  app.get('/api/file/:file_id', isLoggedIn, function(req, res){
    fileCtrl.readOne(req, res);
  })

  app.delete('/api/file/:file_id/anotation/:anotation_id', isLoggedIn, function(req, res){
    fileCtrl.deleteAnotation(req, res);
  })

  app.delete('/api/file/:file_id', isLoggedIn, function(req, res){
    fileCtrl.delete(req, res)
  })

  app.post('/api/file/:file_id/share', isLoggedIn, function(req, res){
    fileCtrl.share(req, res);
  })

  app.get('/api/file/:file_id/share', isLoggedIn, function(req, res){
    fileCtrl.getShared(req, res)
  });

  app.post('/api/file/anotation', isLoggedIn, function(req, res){
    fileCtrl.addAnotation(req, res);
  });


  app.post('/api/file/comment', isLoggedIn, function(req, res){
    fileCtrl.addComment(req, res);
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
