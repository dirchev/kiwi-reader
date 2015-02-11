var User = require('../models/user');
module.exports = function(app, passport){
  app.get('/api/user', function(req, res){
    User.findById(req.user._id).lean().exec(function(err, data){
      var user = {
        _id: data._id,
        name: data.data.name,
        email: data.data.email
      };
      res.json(user);
    })
  });
};
