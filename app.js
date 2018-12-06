var createError = require('http-errors');
var express = require('express');
var logger = require('morgan');
var bodyParser = require('body-parser');
var requestjson = require('request-json');
var path = require('path');

var app = express();
app.get('/', function(req, res, next) {
  res.render('index', { title: 'Proyecto TechU - Back', port: 4000 });
});

app.use(function(req, res, next) {
 res.header("Access-Control-Allow-Origin", "*");
 res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
 next();
});

var clients = require('./routes/clients');
var movements = require('./routes/movements');
var pockets = require('./routes/pockets');
var users = require('./routes/users');
var accounts = require('./routes/accounts');
var datetime = require('./routes/datetime')

app.use(logger('dev'));
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use("/clients", clients);
app.use("/movements", movements);
app.use("/pockets", pockets);
app.use("/users", users);
app.use("/accounts", accounts);
app.use("/datetime", datetime);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});
// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});
var port = 4000;
app.listen(port, function() {
  console.log('Aplicacion lista en: http://127.0.0.1:' + 4000);
});
module.exports = app;
