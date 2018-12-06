var express = require('express');
var router = express.Router();
var path = require('path');
var moment = require('moment');


	router.use(function(req, res, next) {
    moment().locale('es');
		var host = req.get('origin');
  	res.setHeader('Access-Control-Allow-Origin', host || '*');
  	res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
  	res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type,tsec,otp');
  	res.setHeader('Access-Control-Allow-Credentials', true);
	 	next();
	});

var jsonError = {
	message: ''
};

router.get('/', function(req, res, next) {
  res.render('index', { title: '' });
});

router.get("/v0/date", function(req, res){
  var obj = {
    date: moment().format('YYYY-MM-DD'),
    time: moment().format('HH:mm:ss')
  };
  
  return res.json(obj);
});


module.exports = router;