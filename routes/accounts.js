var express = require('express');
var router = express.Router();
var requestjson = require('request-json');
var moment = require('moment');
var path = require('path');
var service = require('../scripts/execute.js');

var pathUrlBd = "https://api.mlab.com/api/1/databases/proyecto/collections/accounts/";
var apiKey = "?apiKey=BC596B42p_doVh2TuyzvxOt8p1Alior6";
var request = requestjson.createClient(pathUrlBd);
router.use(function(req, res, next) {
 res.header("Access-Control-Allow-Origin", "*");
 res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
 next();
});

router.get('/', function(req, res, next) {
  res.render('index', { title: '' });
});

router.get("/v0/accounts", function(req, res){
	service.executeGET(pathUrlBd, apiKey, function(data) {
	    return res.json(data);
	});
});

router.get("/v0/accounts/:id", function(req, res){
	//validaId
	var params = req.params.id + apiKey;
	service.executeGET(pathUrlBd, params, function(data) {
	    return res.json(data);
	});

	return false;
});

router.delete("/v0/accounts/:id", function(req, res){
	//validaId
	var params = req.params.id + apiKey;
	service.executeDELETE(pathUrlBd, params, function(data) {
	    if (data.client != undefined){
	    	var pathUrlMov = "https://api.mlab.com/api/1/databases/proyecto/collections/movements/";
		    var data = {
	  			client: data.client,
	  			number: 000,
	  			detail: {
	  				amount: 0,
	  				description: 'Se ha eliminado la cuenta',
	  				operationDate: moment().format('YYYY-MM-DD HH:mm:ss'),
	  				type: 'I'
	  			}
	  		};
	  		service.executePOSTOut(pathUrlMov, apiKey, data, function(data2) {
	  			//No hace nada, no es necesario devolver el error.
	  		});
		   
		}
		 res.json(data);
	});
	return false;
});

router.post("/v0/accounts/:client", function(req, res){
	var query = {
    	number: Number(req.params.client)
  	};
  	var urlQuery ="&q=" + JSON.stringify(query);
  	var pathUrlCli = "https://api.mlab.com/api/1/databases/proyecto/collections/clients/";
  	service.executeGET(pathUrlCli, apiKey + urlQuery, function(data) {
		if (data.length === 0){
  			jsonError.message = "El cliente seleccionado no existe.";
		    return res.status(400).json(jsonError);
  		}
  		req.body.client = data[0].client;
  		req.body.creationDate = moment().format('YYYY-MM-DD HH:mm:ss');
  		req.body.balance = 1000;
  		service.executePOST(pathUrlBd, apiKey, req.body, function(data2) {
  			var pathUrlMov = "https://api.mlab.com/api/1/databases/proyecto/collections/movements/";
		    var dataX = {
	  			client: data[0].client,
	  			number: 000,
	  			detail: {
	  				amount: 0,
	  				description: 'Se ha dado de alta la cuenta',
	  				operationDate: req.body.creationDate,
	  				type: 'I'
	  			}
	  		};
	  		service.executePOSTOut(pathUrlMov, apiKey, dataX, function(data3) {
	  			//No hace nada, no es necesario devolver el error.
	  		});
  		});
  		return res.json(data);
	});
	return false;
});


router.put("/v0/accounts/:id", function(req, res){
	//validaId
	var params = req.params.id + apiKey;
	service.executeGET(pathUrlBd, params, function(data) {
		req.body.client = data.client;
		req.body.creationDate = data.creationDate;
	    req.body.balance = data.balance;
	    service.executePUT(pathUrlBd, apiKey, req.body, function(data2) {
		    var pathUrlMov = "https://api.mlab.com/api/1/databases/proyecto/collections/movements/";
		    var dataX = {
	  			client: data.client,
	  			number: 000,
	  			detail: {
	  				amount: 0,
	  				description: 'Se actualizaron los datos de la cuenta',
	  				operationDate: moment().format('YYYY-MM-DD HH:mm:ss'),
	  				type: 'I'
	  			}
	  		};
	  		service.executePOSTOut(pathUrlMov, apiKey, dataX, function(data3) {
	  			//No hace nada, no es necesario devolver el error.
	  		});
  		return res.json(data);
		});
	});
  	return false;
});
module.exports = router;