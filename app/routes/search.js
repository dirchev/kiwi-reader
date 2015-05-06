
module.exports = function(app, passport){
  var searchCtrl = require('../controllers/searchCtrl');
  var isLoggedIn = require('../services/is-authenticated')(app);

  // get all files
  app.get('/api/search/:search', isLoggedIn, searchCtrl.all);
  app.get('/api/search/:search/file', isLoggedIn, searchCtrl.file);
  app.get('/api/search/:search/book', isLoggedIn, searchCtrl.book);
  app.get('/api/search/:search/page', isLoggedIn, searchCtrl.page);
};
