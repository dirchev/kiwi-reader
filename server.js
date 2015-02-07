// server.js

// set up ======================================================================
// get all the tools we need
var express  = require('express');
var app      = express();
var port     = process.env.PORT || 8080;
var mongoose = require('mongoose');
var passport = require('passport');
var flash    = require('connect-flash');

var morgan       = require('morgan');
var cookieParser = require('cookie-parser');
var session      = require('express-session');
var bodyParser = require('body-parser');
var path = require('path');
var busboy = require('connect-busboy');


var configDB = require('./config/database.js');


// configuration ===============================================================
mongoose.connect(configDB.url, {}, function(){
  console.log('Successfully connected to database.');
}); // connect to database and log in console

require('./config/passport')(passport); // pass passport for configuration

// set up our express application
app.use(morgan('dev')); // log every request to the console
app.use(cookieParser()); // read cookies (needed for auth)
app.use(bodyParser.urlencoded({ extended: true, limit: '7mb' }));
app.use(bodyParser.json({limit: '500mb'}));
app.use(busboy());


app.use("/public", express.static(__dirname + '/public'));
app.use("/uploads", express.static(__dirname + '/uploads'));
app.set('view engine', 'ejs'); // set up ejs for templating

// required for passport
app.use(session({ secret: 'fromdirchevwithlove' })); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session

// controllers / routes ======================================================================
require('./app/routes/auth.js')(app, passport);
require('./app/routes/book.js')(app, passport);
require('./app/routes/file.js')(app, passport, busboy);
require('./app/routes/user.js')(app, passport);

app.listen(port);
// launch ======================================================================
console.log('Magic happens on port ' + port)