var express = require('express');
var router = express.Router();
var requestjson = require('request-json');
var service = require('../scripts/execute.js');
var path = require('path');
var pathUrlBd = "https://api.mlab.com/api/1/databases/proyecto/collections/movements/";
var apiKey = "?apiKey=BC596B42p_doVh2TuyzvxOt8p1Alior6";

	router.use(function(req, res, next) {
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

router.get("/v0/movements", function(req, res){
	service.executeGET(pathUrlBd, apiKey, function(data) {
	    return res.json(data);
	});
	return false;
});

router.get("/v0/movements/:client", function(req, res){
	

	var params = req.params.client + apiKey;
  	var pathUrlCli = "https://api.mlab.com/api/1/databases/proyecto/collections/clients/";
  	service.executeGET(pathUrlCli, params, function(data) {
		if (data.client === undefined){
  			jsonError.message = "El cliente seleccionado no existe.";
		    return res.status(400).json(jsonError);
  		}
  		var query = {
	    	client: Number(data.client)
	  	};
	  	var urlQuery ="&q=" + JSON.stringify(query);
	  	service.executeGET(pathUrlBd, apiKey + urlQuery, function(data) {
		    return res.json(data);
		});
	});

	return false;
});


module.exports = router;