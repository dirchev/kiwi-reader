
module.exports = function(app, passport){
  var searchCtrl = require('../controllers/searchCtrl');
  var isLoggedIn = require('../services/is-authenticated')(app);

  // get all files
  app.get('/api/search/:search', isLoggedIn, searchCtrl.all);
};
