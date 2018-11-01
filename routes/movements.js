var express = require('express');
var router = express.Router();
var requestjson = require('request-json');
var service = require('../scripts/execute.js');
var path = require('path');
var pathUrlBd = "https://api.mlab.com/api/1/databases/proyecto/collections/movements/";
var apiKey = "?apiKey=BC596B42p_doVh2TuyzvxOt8p1Alior6";
var request = requestjson.createClient(pathUrlBd);

router.use(function(req, res, next) {
 res.header("Access-Control-Allow-Origin", "*");
 res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
 next();
});

var jsonError = {
	message: ''
};

router.get('/', function(req, res, next) {
  res.render('index', { title: '' });
});

router.get("/v0/movements", function(req, res){
	service.executeGET(pathUrlBd, apiKey, function(data) {
	    return res.json(data);
	});
	return false;
});

router.get("/v0/movements/:number", function(req, res){
	var query = {
    	number: Number(req.params.number)
  	};
  	var urlQuery ="&q=" + JSON.stringify(query);
  	service.executeGET(pathUrlBd, apiKey + urlQuery, function(data) {
	    return res.json(data);
	});
	return false;
});


module.exports = router;