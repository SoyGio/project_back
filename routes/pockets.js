var express = require('express');
var router = express.Router();
var requestjson = require('request-json');
var moment = require('moment');
var service = require('../scripts/execute.js');
var path = require('path');

var pathUrlBd = "https://api.mlab.com/api/1/databases/proyecto/collections/pockets/";
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

router.get("/v0/pockets/", function(req, res){
	//validaNumber
  	service.executeGET(pathUrlBd, apiKey, function(data) {
  		if (data.length === 0){
  			jsonError.message = "El apartado seleccionado no existe.";
			return res.status(400).json(jsonError);
  		}
	    return res.json(data);
	});
	return false;
});

router.get("/v0/pockets/:number", function(req, res){
	//validaNumber
	var query = {
    	number: Number(req.params.number)
  	};
  	var urlQuery ="&q=" + JSON.stringify(query);
  	service.executeGET(pathUrlBd, apiKey + urlQuery, function(data) {
  		if (data.length === 0){
  			jsonError.message = "El apartado seleccionado no existe.";
			return res.status(400).json(jsonError);
  		}
	    return res.json(data);
	});
	return false;
});

router.post("/v0/pockets/:number", function(req, res){
	var balanceAdd = 0;
	//validaNumber
	if (req.body.balance != undefined && req.body.balance > 0){
		balanceAdd = req.body.balance;
	}
	var query = {
    	number: Number(req.params.number)
  	};
  	var urlQuery ="&q=" + JSON.stringify(query);
  	var pathUrlCli = "https://api.mlab.com/api/1/databases/proyecto/collections/clients/";
  	//Consulta los clientes para validar saldo
  	service.executeGET(pathUrlCli, apiKey + urlQuery, function(data) {
  		if (data.length === 0){
  			jsonError.message = "El pocket ingresado no corresponde a la cuenta.";
		    return res.status(400).json(jsonError);
  		}
  		if (data.length > 0 && balanceAdd > data[0].balance){
    		jsonError.message = "El saldo del apartado no puede ser mayor al saldo disponible en tu cuenta.";
			return res.status(400).json(jsonError);
    	}
    	//Consulta pockets para validar si existe el pocket
		service.executeGET(pathUrlBd, apiKey + urlQuery, function(data2) {
			if (data2.length === 0){
				if (data[0].number !== Number(req.params.number)){
		    		jsonError.message = "El pocket ingresado no corresponde a la cuenta.";
		    		return res.status(400).json(jsonError);
		    	}
		    	var dataX = {
	    			number: data[0].number,
	    			balance: balanceAdd
	    		};
	    		service.executePOST(pathUrlBd, apiKey, dataX, function(data3) {
				    var pathUrlMov = "https://api.mlab.com/api/1/databases/proyecto/collections/movements/";
				    var dataY = {
			  			number: data[0].number,
			  			detail: {
			  				amount: 0,
			  				description: 'Se crea apartado de la cuenta.',
			  				operationDate: moment().format('YYYY-MM-DD'),
			  				operationTime: moment().format('HH:mm:ss'),
			  				type: 'I'
			  			}
			  		};
			  		service.executePOST(pathUrlMov, apiKey, dataY, function(data4) {
			  			//No hace nada, no es necesario devolver el error.
			  		});
			  		dataY.detail.description = "Se realiza abono al apartado.";
					dataY.detail.amount = balanceAdd;
					dataY.detail.type = "D";
					service.executePOST(pathUrlMov, apiKey, dataY, function(data5) {
			  			//No hace nada, no es necesario devolver el error.
			  		});
			  		res.json(data);
				});
			}else{
				jsonError.message = "El apartado seleccionado ya existe.";
				return res.status(400).json(jsonError);
			}
			
		});
    	
	    return res.json(data);
	});

	return false;
});

router.get("/v0/clients/:id", function(req, res){
	var url = req.params.id + apiKey;
	request.get(url, function(err, requ, body) {
	    if (err){
	      return res.status(400).json(body);
	    }else{	
	      return res.json(body);
	    }
  	});

	return false;
});

router.delete("/v0/clients/:id", function(req, res){
	if (req.params.id === undefined || req.params.id === ''){
		jsonError.message = "id no encontrado en la petición";
		return res.status(400).json(jsonError);
	}
	var url = req.params.id + apiKey;
	request.delete(url, function(err, requ, body) {
	    if (err){
	      return res.status(400).json(body);
	    }else{	
	    	var pathUrlMov = "https://api.mlab.com/api/1/databases/proyecto/collections/movements/";
	  		var request2 = requestjson.createClient(pathUrlMov);
	  		var data = {
	  			number: body.number,
	  			detail: {
	  				amount: 0,
	  				description: 'Se ha eliminado la cuenta.',
	  				operationDate: moment().format('YYYY-MM-DD'),
	  				operationTime: moment().format('HH:mm:ss'),
	  				type: 'I'
	  			}
	  		};
			request2.headers['Content-Type'] = 'application/json';
			request2.post(apiKey, data, function(err2, requ2, body2) {
				//No se hace nada, si se da del alta o no.
			});
	      res.json(body);
	    }
  	});

	return false;
});

router.put("/v0/pockets/:id", function(req, res){
	if (req.params.id === undefined || req.params.id === ''){
		jsonError.message = "id no encontrado en la petición";
		return res.status(400).json(jsonError);
	}
	var url = req.params.id + apiKey;
	request.get(url, function(err, requ, body) {
	    if (err){
	      	return res.status(400).json(body);
	    }else{
	    	req.body.number = body.number;
	    	req.body.balance = body.balance;
	    	req.body.pocket = body.pocket;
	    	request.headers['Content-Type'] = 'application/json';
			request.put(apiKey, req.body, function(err2, requ2, body2) {
				if (err){
			    	return res.status(400).json(body);
			  	}else{
			  		var pathUrlMov = "https://api.mlab.com/api/1/databases/proyecto/collections/movements/";
			  		var request2 = requestjson.createClient(pathUrlMov);
			  		var data = {
			  			number: body.number,
			  			detail: {
			  				amount: 0,
			  				description: 'Actualizacion en los datos de la cuenta.',
			  				operationDate: moment().format('YYYY-MM-DD'),
	  						operationTime: moment().format('HH:mm:ss'),
			  				type: 'I'
			  			}
			  		};
					request2.headers['Content-Type'] = 'application/json';
					request2.post(apiKey, data, function(err3, requ3, body3) {
						//No se hace nada, si se da del alta o no.
					});
			  		res.json(body2);
			  	}
			});
	    }
  	});
  	return false;
});
module.exports = router;