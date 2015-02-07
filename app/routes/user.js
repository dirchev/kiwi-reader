var User = require('../models/user');
module.exports = function(app, passport){
  app.get('/api/user', function(req, res){
    res.json(req.user.data);
  });
};
