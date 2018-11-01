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
  	var pathUrlCli = "https://api.mlab.com/api/1/databases/proyecto/collections/accounts/";
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
		    	var dataX = {
	    			client: data[0].client,
	    			balance: balanceAdd,
	    			creationDate: moment().format('YYYY-MM-DD HH:mm:ss')
	    		};
	    		service.executePOST(pathUrlBd, apiKey, dataX, function(data3) {
				    var pathUrlMov = "https://api.mlab.com/api/1/databases/proyecto/collections/movements/";
				    var dataY = {
			  			client: data[0].client,
			  			number: data[0].number,
			  			detail: {
			  				amount: 0,
			  				description: 'Se crea apartado de la cuenta.',
	  						operationDate: dataX.creationDate,
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
			  		return res.json(data);
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

router.delete("/v0/pockets/:id", function(req, res){
	//validaId
	var params = req.params.id + apiKey;
	service.executeDELETE(pathUrlBd, params, function(data) {
	    if (data.number != undefined){
	    	var pathUrlMov = "https://api.mlab.com/api/1/databases/proyecto/collections/movements/";
		    var dataX = {
	  			client: data.client,
	  			number: data.number,
	  			detail: {
	  				amount: 0,
	  				description: 'Se ha eliminado el pocket de la cuenta',
	  				operationDate: moment().format('YYYY-MM-DD HH:mm:ss'),
	  				type: 'I'
	  			}
	  		};
	  		service.executePOSTOut(pathUrlMov, apiKey, dataX, function(data2) {
	  			//No hace nada, no es necesario devolver el error.
	  		});
	  		var dataY = {
	  			client: data.client,
	  			number: data.number,
	  			detail: {
	  				amount: data.balance,
	  				description: 'Se ha devuelto el monto del pocket a la cuenta',
	  				operationDate: moment().format('YYYY-MM-DD HH:mm:ss'),
	  				type: 'I'
	  			}
	  		};
	  		service.executePOSTOut(pathUrlMov, apiKey, dataY, function(data3) {
	  			//No hace nada, no es necesario devolver el error.
	  		});
		   
		}
		 res.json(data);
	});
	return false;
});

router.put("/v0/pockets/:id", function(req, res){
	//validarId
	var type = req.body.type; //ADD, DP
	var params = req.params.id + apiKey;
  	service.executeGET(pathUrlBd, params, function(data) {
  		if (data.number === undefined){
  			jsonError.message = "El apartado seleccionado no existe.";
			return res.status(400).json(jsonError);
  		}
  		req.body.client = data.client;
	    var newBalancePocket = 0;
	    var newBalanceAccount = 0;
	    if (type === 'ADD'){
	    	newBalancePocket = data.balance + req.body.balance;
	    	newBalanceAccount = data.balance - req.body.balance;
	    }else if (type === 'DP'){
	    	newBalancePocket = data.balance - req.body.balance;
	    	newBalanceAccount = data.balance + req.body.balance;
	    }
	    req.body.pocket = data.pocket;
	    req.body.balance = newBalancePocket;
	    return res.json(data);
	});

});

router.put("/v0/pockets/:id", function(req, res){
	//validarId
	var type = req.body.type; //ADD, DP, RM
	var url = req.params.id + apiKey;
	request.get(url, function(err, requ, body) {
	    if (err){
	      	return res.status(400).json(body);
	    }else{
	    	req.body.client = body.client;
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
			  			client: body.client,
			  			number: body.number,
			  			detail: {
			  				amount: 0,
			  				description: 'Actualizacion en los datos de la cuenta.',
			  				operationDate: moment().format('YYYY-MM-DD HH:mm:ss'),
			  				type: 'I'
			  			}
			  		};
					request2.headers['Content-Type'] = 'application/json';
					request2.post(apiKey, data, function(err3, requ3, body3) {
						//No se hace nada, si se da del alta o no.
					});
			  		return res.json(body2);
			  	}
			});
	    }
  	});
  	return false;
});
module.exports = router;