// config/passport.js

//load all the things we need
var LocalStrategy = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var TwitterStrategy = require('passport-twitter').Strategy;

// load up the user model
var User = require('../app/models/user');

//load the auth variables
var configAuth = require('./auth');

// expose this function to our app using module.exports
module.exports = function(passport){

  // used to serialize the user for the session
  passport.serializeUser(function(user, done){
    done(null, user.id)
  });

  // used to deserialize the user
  passport.deserializeUser(function(id, done){
    User.findById(id, function(err, user){
      done(err, user);
    });
  });

  // ========================================
  // LOCAL SIGNUP ===========================
  // ========================================
  // we are using named strategies since we have one for login and one for signup
  // by default, if there was no name, it would just be called 'local'

  passport.use('local-signup', new LocalStrategy({
    // by default, local strategy uses username and password, we will override with email
    usernameField : 'email',
    passwordField : 'password',
    passReqToCallback : true // allows us to pass back the entire request to the callback
  }, function(req, email, password, done){
    // asynchronous
    // User.findOne wont fire unless data is sent back
    process.nextTick(function(){

      // find a user whose email is the same as the forms email
      // we are checking to see if the user trying to login already exists
      User.findOne({ 'local.email' : email }, function(err, user){
        console.log('email = ' + email);
        console.log(user);
        // if there are any errors, return the error
        if(err){
          return done(err);
        }
        //check to see if theres already a user with that email
        if(user){
          return done(null, false, req.flash('signupMessage', 'That email is already taken'));
        } else {
          // if there is no user with tha email
          // create the user
          var newUser = new User();

          // set the user`s local credentials
          newUser.local.email = email;
          newUser.local.password = newUser.generateHash(password);
          newUser.data.email = email;
          newUser.data.name = req.body.name;

          // save the user
          newUser.save(function(err){
            if(err){
              throw err;
            }
            return done(null, newUser);
          });
        }
      });

    });
  }));

  // =========================================================================
  // LOCAL LOGIN =============================================================
  // =========================================================================
  // we are using named strategies since we have one for login and one for signup
  // by default, if there was no name, it would just be called 'local'

  passport.use('local-login', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
  }, function(req, email, password, done){

    // find a user with this email
    User.findOne({'local.email' : email}, function(err, user){
      if(err){
        return done(err);
      }

      if(!user){
        return done(null, false, req.flash('loginMessage', 'There is no a user with that email'));
      }
      if(!user.validPassword(password)){
        return done(null, false, req.flash('loginMessage', 'Oops! Wrong password'));
      }

      // all is well, return the user
      return done(null, user);
    });

  }));

  // ==========================================================
  // ======= FACEBOOK =========================================
  // ==========================================================
  passport.use('facebook', new FacebookStrategy(
    {
      // pull in out app id and secret from our auth.js file
      clientID       : configAuth.facebookAuth.clientID,
      clientSecret   : configAuth.facebookAuth.clientSecret,
      callbackURL    : configAuth.facebookAuth.callbackURL
    },

    // facebook will send back the tokena and profile
    function(token, refreshToken, profile, done) {

      // async
      process.nextTick(function(){

        // find the user on the database based on their fb id
        User.findOne({ 'facebook.id' : profile.id }, function(err, user){

          // if there is an err, stop everything and return that
          if(err){
            return done(err);
          }

          if(user) {
            return done(null, user);
          } else {
              // if there is not user, create one
              var newUser = new User();
              // set all the fb info for the user
              newUser.facebook.id = profile.id;
              newUser.facebook.token = token;
              newUser.facebook.name = profile.name.givenName + ' ' + profile.name.familyName;
              newUser.facebook.email = profile.emails[0].value;
              newUser.data.email = profile.emails[0].value;
              newUser.data.name = profile.name.givenName + ' ' + profile.name.familyName;

              //save our new user to the db
              newUser.save(function(err){
                if(err){
                  throw err;
                }

                // if success, return the new user
                return done(null, newUser);
              });
          }

        });
      });
    }

  ));

  // ================================================================
  // TWITTER ========================================================
  // ================================================================
  passport.use('twitter', new TwitterStrategy({
    consumerKey    : configAuth.twitterAuth.consumerKey,
    consumerSecret : configAuth.twitterAuth.consumerSecret,
    callbackURL    : configAuth.twitterAuth.callbackURL
  },
  function(token, tokenSecter, profile, done) {
    // make the code async
    // User.findOne wont file until we have all our data back from Twitter
    process.nextTick(function(){

      User.findOne({ 'twitter.id' : profile.id }, function(err, user) {

        // if there is an error, stop everything and return that
        // ie an err connection to the database
        if(err){
          return done(err);
        }

        // if the user is found, log him
        if(user){
          return done(null, err);
        } else {
          // if there is not user, create
          var newUser = new User();
          // set all data, that will be saved
          newUser.twitter.id = profile.id;
          newUser.twitter.token = token;
          newUser.twitter.username = profile.username;
          newUser.twitter.displayName = profile.displayName;
          newUser.data.name = profile.displayName;

          //save user to db
          newUser.save(function(err){
            if(err)
              throw err;
            return done(null, newUser);
          });
        }
      });
    })

    }));
};
