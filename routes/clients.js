var express = require('express');
var router = express.Router();
var moment = require('moment');
var path = require('path');
var service = require('../scripts/execute.js');
var cypher = require('../scripts/cypher.js');

var pathUrlCli = "https://api.mlab.com/api/1/databases/proyecto/collections/clients/";
var apiKey = "?apiKey=BC596B42p_doVh2TuyzvxOt8p1Alior6";

router.use(function(req, res, next) {
  var host = req.get('origin');
  res.setHeader('Access-Control-Allow-Origin', host || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type,tsec,otp');
  res.setHeader('Access-Control-Allow-Credentials', true);
  next();
});

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
	service.executeGET(pathUrlCli, apiKey, function(data) {
	  return res.json(data);
	});
});

router.get("/v0/clients/:id", function(req, res){
   //validaId
  var params = req.params.id + apiKey;
  service.executeGET(pathUrlCli, params, function(data) {
    return res.json(data);
  });

  return false;
});

router.post("/v0/clients", function(req, res){
  var json  = {};
  var clientNumber = Math.floor(Math.random() * 99999999);
  var creationDate = moment().format('YYYY-MM-DD HH:mm:ss');
  var obj = {
  	name: req.body.name,
  	phoneNumber: req.body.phoneNumber,
  	address: req.body.address,
  	birthDate: req.body.birthDate,
  	client: clientNumber,
  	creationDate: creationDate
  };
  service.executePOST(pathUrlCli, apiKey, obj, function(data) {
    var pathUrlMov = "https://api.mlab.com/api/1/databases/proyecto/collections/movements/";
	var dataX = service.getJsonMovements(clientNumber, 0, 0, 'Se ha creado el cliente', creationDate, 'I');
  	service.executePOSTOut(pathUrlMov, apiKey, dataX, function(data2) {
  	  //No hace nada, no es necesario devolver el error.
  	});
  	var passEnc = cypher.encryptSHA1(req.body.password);
  	var obj2 = {
  	  client: clientNumber,
  	  username: req.body.username,
  	  password: passEnc,
  	  email: req.body.email,
  	  type: req.body.type,
  	  creationDate: creationDate
    };
  	var pathUrlUser = "https://api.mlab.com/api/1/databases/proyecto/collections/users/";
	service.executePOST(pathUrlUser, apiKey, obj2, function(data3) {
		var pathUrlMov = "https://api.mlab.com/api/1/databases/proyecto/collections/movements/";
		var dataX = service.getJsonMovements(clientNumber, 0, 0, 'Se ha creado el usuario', creationDate, 'I');
	  	service.executePOSTOut(pathUrlMov, apiKey, dataX, function(data2) {
	  	  //No hace nada, no es necesario devolver el error.
	  	});
	});
  	json.code = 'OK';
  	json.message = 'El cliente fue dado de alta correctamente.';
  	json.client = clientNumber;
  	json.date = creationDate;
  	res.json(json);
  });
  return false;
});

router.put("/v0/clients/:id", function(req, res){
	//validaId
	var params = req.params.id + apiKey;
	service.executeGET(pathUrlCli, params, function(data) {
		req.body.client = data.client;
	    req.body.creationDate = data.creationDate;
	    service.executePUT(pathUrlCli, apiKey, req.body, function(data2) {
		    var pathUrlMov = "https://api.mlab.com/api/1/databases/proyecto/collections/movements/";
		    var dataX = {
	  			client: data.client,
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
	service.executeDELETE(pathUrlCli, params, function(data) {
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