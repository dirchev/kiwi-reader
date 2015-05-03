var jwt = require('jsonwebtoken');
var express = require('express');
var User = require('../models/user');
var isLoggedIn = require('../services/is-authenticated');

module.exports = function(app){
  app.post('/authenticate', function(req, res){
    User
      .findOne({'data.email':req.body.email})
      .exec(function(err, user){
        if(err){
          throw err;
        } else if (!user){
          // invalid email
          res.json({success:false, message: "Грешен email или парола"});
        } else {
          if (!user.validPassword(req.body.password)){
            // invalid pass
            res.json({success:false, message: "Грешен email или парола"});
          } else {
            
            // create a token
            var token = jwt.sign(user, app.get('superSecret'), {
              expiresInMinutes: 1440 // expires in 24 hours
            });
            
            // return the information including token as JSON
            res.json({
              success: true,
              token: token
            });
          }
        }
      });
  });
};