var express = require('express');
var router = express.Router();
var requestjson = require('request-json');
var moment = require('moment');
var path = require('path');
var service = require('../scripts/execute.js');

var pathUrlBd = "https://api.mlab.com/api/1/databases/proyecto/collections/clients/";
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

router.get("/v0/clients", function(req, res){

	if (req.query.client !== undefined && req.query.client !== ''){
		var query = {
	    	number: Number(req.params.client)
	  	};
  		var params ="&q=" + JSON.stringify(query);
  		apiKey +=params;
	}

	service.executeGET(pathUrlBd, apiKey, function(data) {
	    return res.json(data);
	});

	
});

router.get("/v0/clients/:id", function(req, res){
	//validaId
	var params = req.params.id + apiKey;
	service.executeGET(pathUrlBd, params, function(data) {
	    return res.json(data);
	});

	return false;
});

router.post("/v0/clients", function(req, res){
	var clientNumber = Math.floor(Math.random() * 99999999);
	req.body.client = clientNumber;
	req.body.creationDate = moment().format('YYYY-MM-DD HH:mm:ss');
	service.executePOST(pathUrlBd, apiKey, req.body, function(data) {
	    var pathUrlMov = "https://api.mlab.com/api/1/databases/proyecto/collections/movements/";
	    var dataX = {
  			number: clientNumber,
  			detail: {
  				amount: 0,
  				description: 'Se ha dado de alta el cliente',
  				operationDate: req.body.creationDate,
  				type: 'I'
  			}
  		};
  		service.executePOSTOut(pathUrlMov, apiKey, dataX, function(data2) {
  			//No hace nada, no es necesario devolver el error.
  		});

  		res.json(data);
	});
	return false;
});

router.put("/v0/clients/:id", function(req, res){
	//validaId
	var params = req.params.id + apiKey;
	service.executeGET(pathUrlBd, params, function(data) {
		req.body.client = data.client;
	    req.body.creationDate = data.creationDate;
	    req.body.birthDate = data.birthDate;
	    service.executePUT(pathUrlBd, apiKey, req.body, function(data2) {
		    var pathUrlMov = "https://api.mlab.com/api/1/databases/proyecto/collections/movements/";
		    var dataX = {
	  			client: data.clients,
	  			number: 000,
	  			detail: {
	  				amount: 0,
	  				description: 'Se han actualizado los datos del cliente',
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

router.delete("/v0/clients/:id", function(req, res){
	//validaId
	var params = req.params.id + apiKey;
	service.executeDELETE(pathUrlBd, params, function(data) {
	    if (data.number != undefined){
	    	var pathUrlMov = "https://api.mlab.com/api/1/databases/proyecto/collections/movements/";
		    var data = {
	  			client: data.client,
	  			number: 000,
	  			detail: {
	  				amount: 0,
	  				description: 'Se ha eliminado el cliente',
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
module.exports = router;