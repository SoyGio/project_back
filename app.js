var createError = require('http-errors');
var express = require('express');
var path = require('path');

var app = express();
var clients = require('./routes/clients');
app.use("/clients", clients);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
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
  console.log('Tu servidor ha sido levantando en el puerto: ' + 4000);
});
module.exports = app;
