// server.js

// set up ======================================================================
// get all the tools we need
var express      = require('express');
var app          = express();
var server       = require('http').createServer(app);
var io           = require('socket.io')(server);
var port         = process.env.PORT || 80;
var mongoose     = require('mongoose');
var passport     = require('passport');
var flash        = require('connect-flash');
var morgan       = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser   = require('body-parser');
var session      = require('express-session');
var proc         = require('child_process');
var minecraft    = null;

// configuration ===============================================================
mongoose.connect('mongodb://127.0.0.1:27017/ender'); // connect to our database

require('./app/passport')(passport); // pass passport for configuration

app.use(express.static(__dirname + '/public'));
// set up our express application
app.use(morgan('dev')); // log every request to the console
app.use(cookieParser()); // read cookies (needed for auth)
app.use(bodyParser.json()); // get information from html forms
app.use(bodyParser.urlencoded({ extended: true }));

app.set('view engine', 'ejs'); // set up ejs for templating

// required for passport
app.use(session({ secret: 'gameofthronesthronesthronesgame' })); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session

// routes ======================================================================
require('./app/routes.js')(app, passport); // load our routes and pass in our app and fully configured passport

// launch ======================================================================
server.listen(port);
console.log('Webserver running on Port: ' + port);
console.log('Minecraft running on Port: ' + 'default');

minecraft = proc.spawn(
  "java",
  ['-Xms256M', '-Xmx256M', '-jar', 'minecraft_server.jar', 'nogui'],
  { cwd: __dirname+"/minecraft/" }
);

app.post('/deposit', function(req, res) {
  console.log("Deposit from: " + req.user.local.username);
  runCommand("tell Iamdone Deposit from you", function(result) {
    console.log(result);
  });
});

function runCommand(cmd, callback) {
  var lres         = "";
  minecraft.stdin.write(cmd + "\r");
  minecraft.stdout.on('data', function (data) {
    if (data) {
      lres = data + "";
      return callback(lres);
    }
  });
}
// io.on('connection', function(socket){
//   console.log('a user connected');
// });
//
// io.on('auth', function(user) {
//   if (minecraft) {
//     minecraft.stdin.write("kick" + user + "Code: 4871" + "\r");
//   } else {
//     socket.emit('fail', cmd);
//   }
// });
