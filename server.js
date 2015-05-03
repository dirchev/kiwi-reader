// set up ======================================================================
// get all the tools we need
var express  = require('express');
var app      = express();
var port     = process.env.PORT || 8080;
var mongoose = require('mongoose');
var passport = require('passport');
var flash    = require('connect-flash');
var cookieParser = require('cookie-parser');
var session      = require('express-session');
var bodyParser = require('body-parser');
var path = require('path');
var busboy = require('connect-busboy');
var http = require('http').Server(app);
var io = require('socket.io')(http);

// configuration ===============================================================
var configDB = require('./config/database.js');
mongoose.connect(configDB.url, {}, function(){
  console.log('Successfully connected to database.');
}); // connect to database and log in console

require('./config/passport')(passport); // passport for configuration

// set up our express application
app.use(cookieParser()); // read cookies (needed for auth)
app.use(bodyParser.urlencoded({ extended: true, limit: '7mb' }));
app.use(bodyParser.json({limit: '5mb'}));
app.use(busboy());

// serve static files in public dir
app.use("/", express.static(__dirname + '/public'));
app.set('view engine', 'ejs'); // set up ejs for templating

// required for passport
app.use(session({ secret: 'fromdirchevwithlove' })); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session

app.set('superSecret', process.env.SECRET || 'dirchevMirchevScoobyDo'); // secret variable

// routes ======================================================================
app.get('/', function(req, res){
  res.render('index.ejs');
});
require('./app/routes/auth.js')(app, passport);
require('./app/routes/book.js')(app, passport);
require('./app/routes/file.js')(app, passport, busboy);
require('./app/routes/user.js')(app, passport);
require('./app/routes/shared.js')(app, passport);
require('./app/routes/uploads.js')(app, passport);
require('./app/routes/bookmark.js')(app, passport);
require('./app/routes/friend.js')(app, passport);
require('./app/routes/page.js')(app, passport);
require('./app/routes/search.js')(app, passport);

// socket ======================================================================
require('./app/services/socket.js')(io);

// launch ======================================================================
http.listen(port);
console.log('Magic happens on port ' + port);
