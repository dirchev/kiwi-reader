var lastService = require('../services/last');
module.exports = function(app, passport){
  var isLoggedIn = require('../services/is-authenticated')(app);
  var userCtrl = require('../controllers/userCtrl')(app);

  app.get('/api/user', isLoggedIn, userCtrl.getUserInfo);
  app.post('/api/user', isLoggedIn, userCtrl.updateUserInfo);
  app.post('/api/user/new', userCtrl.createUser);
};
