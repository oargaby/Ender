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

// config

mongoose.connect('mongodb://127.0.0.1:27017/ender');

require('./app/passport')(passport);

app.use(express.static(__dirname + '/public'));
app.use(morgan('dev'));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.set('view engine', 'ejs');

app.use(session({ secret: 'gameofthronesthronesthronesgame' }));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

// routes
require('./app/routes.js')(app, passport);

// launch
server.listen(port);
console.log('Webserver running on Port: ' + port);
console.log('Minecraft running on Port: ' + 'default');

minecraft = proc.spawn(
  "java",
  ['-Xms256M', '-Xmx256M', '-jar', 'minecraft_server.jar', 'nogui'],
  { cwd: __dirname+"/minecraft/" }
);

//this thrives me out of my mind...

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
