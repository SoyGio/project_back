var express = require('express');
var router = express.Router();
var moment = require('moment-timezone');
var service = require('../scripts/execute.js');
var path = require('path');

var pathUrlPoc = "https://api.mlab.com/api/1/databases/proyecto/collections/pockets/";
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

/*
router.get("/v0/pockets/", function(req, res){
	//validaNumber
  	service.executeGET(pathUrlPoc, apiKey, function(data) {
  		if (data.length === 0){
  			jsonError.message = "No existen aparados a listar.";
			return res.status(400).json(jsonError);
  		}
	    return res.json(data);
	});
	return false;
});
*/
router.get("/v0/pockets/:number", function(req, res){
	//validaNumber
	var query = {
    	number: req.params.number
  	};
  	var urlQuery ="&q=" + JSON.stringify(query);
  	service.executeGET(pathUrlPoc, apiKey + urlQuery, function(data) {
  		if (data.length === 0){
  			jsonError.message = "La cuenta seleccionada no tiene apartados registrados.";
			return res.status(400).json(jsonError);
  		}
	    return res.json(data);
	});
	return false;
});

router.post("/v0/pockets/:number", function(req, res){
	var date = moment().tz('America/Mexico_City');
	var balanceAdd = 0;
	//validaNumber
	if (req.body.balance != undefined && req.body.balance > 0){
		balanceAdd = Number(req.body.balance);
	}
	var query = {
    	number: req.params.number
  	};
  	var urlQuery ="&q=" + JSON.stringify(query);
  	var pathUrlCli = "https://api.mlab.com/api/1/databases/proyecto/collections/accounts/";
  	//Consulta los clientes para validar saldo y la cuenta
  	service.executeGET(pathUrlCli, apiKey + urlQuery, function(data) {
  		if (data.length === 0){
  			jsonError.message = "El apartado ingresado no corresponde a la cuenta.";
		    return res.status(400).json(jsonError);
  		}
  		if (data.length > 0 && balanceAdd > data[0].balance){
    		jsonError.message = "El saldo del apartado no puede ser mayor al saldo disponible en tu cuenta.";
			return res.status(400).json(jsonError);
    	}
    	var clientId = data[0]._id.$oid;
    	var creationDate = date.format('YYYY-MM-DD HH:mm:ss');
    	//Consulta pockets para validar si existe el pocket
		service.executeGET(pathUrlPoc, apiKey + urlQuery, function(data2) {
			if (data2.length === 0){
		    	var dataX = {
		    		number: data[0].number,
	    			client: data[0].client,
	    			balance: balanceAdd,
	    			creationDate: creationDate
	    		};
	    		//Actualización del saldo
	    		if (balanceAdd > 0){
	    			var newBalanceAccount = Number(data[0].balance) - balanceAdd;
	    			var objPut = {
	    				number: data[0].number,
		    			client: data[0].client,
		    			cardNumber: data[0].cardNumber,
		    			balance: newBalanceAccount,
		    			creationDate: data[0].creationDate
	    			};
	    			service.executePUT(pathUrlCli, clientId + apiKey, objPut, function(dataPut) {
	    				
	    			});
	    		}
	    		service.executePOST(pathUrlPoc, apiKey, dataX, function(data3) {
				    var pathUrlMov = "https://api.mlab.com/api/1/databases/proyecto/collections/movements/";
				    var dataY = service.getJsonMovements(data[0].client, data[0].number, balanceAdd, 'Se crea apartado de la cuenta',
	  					creationDate, 'A');
		  			service.executePOST(pathUrlMov, apiKey, dataY, function(data4) {
		  				//No hace nada, no es necesario devolver el error.
			  		});
			  		if (balanceAdd > 0){
				  		dataY.detail.description = "Se realiza abono al apartado";
						dataY.detail.amount = balanceAdd;
						dataY.detail.type = "D";
						service.executePOST(pathUrlMov, apiKey, dataY, function(data5) {
				  			//No hace nada, no es necesario devolver el error.
				  		});
		  			}
			  		return res.json(data);
				});
			}else{
				jsonError.message = "El apartado seleccionado ya existe";
				return res.status(400).json(jsonError);
			}
			
		});
	});

	return false;
});

router.delete("/v0/pockets/:number", function(req, res){
	//validaId
	var date = moment().tz('America/Mexico_City');
	var query = {
    	number: req.params.number
  	};
  	var urlQuery ="&q=" + JSON.stringify(query);
  	var pathUrlAcc = "https://api.mlab.com/api/1/databases/proyecto/collections/accounts/";
  	service.executeGET(pathUrlAcc, apiKey + urlQuery, function(dataAcc) {
  		var pathUrlPoc = "https://api.mlab.com/api/1/databases/proyecto/collections/pockets/";
	  	service.executeGET(pathUrlPoc, apiKey + urlQuery, function(dataPoc) {
	  		var newBalanceAccount = Number(dataAcc[0].balance) + dataPoc[0].balance;
			var objPut = {
				number: dataAcc[0].number,
				client: dataAcc[0].client,
				cardNumber: dataAcc[0].cardNumber,
				balance: newBalanceAccount,
				creationDate: dataAcc[0].creationDate
			};
			service.executePUT(pathUrlAcc, apiKey + urlQuery, objPut, function(dataPut) {
				var params = dataPoc[0]._id.$oid + apiKey;
				service.executeDELETE(pathUrlPoc, params, function(data) {
				  	//Consulta los clientes para validar saldo y la cuenta
				    if (data.number != undefined){
				    	var pathUrlMov = "https://api.mlab.com/api/1/databases/proyecto/collections/movements/";
				    	var dataX = service.getJsonMovements(data.client, data.number, 0, 'Se ha eliminado el apartado de la cuenta',
	  						date.format('YYYY-MM-DD HH:mm:ss'), 'I');
				  		service.executePOSTOut(pathUrlMov, apiKey, dataX, function(data2) {
				  			//No hace nada, no es necesario devolver el error.
				  		});
				  		var dataY = service.getJsonMovements(data.client, data.number, dataPoc[0].balance, 'Se ha devuelto el monto del apartado a la cuenta',
	  						date.format('YYYY-MM-DD HH:mm:ss'), 'D');
				  		service.executePOSTOut(pathUrlMov, apiKey, dataY, function(data3) {
				  			//No hace nada, no es necesario devolver el error.
				  		});
						   
					}
					res.json(data);
  				});
			});
	  	});
	 });
	return false;
});

router.put("/v0/pockets/:id", function(req, res){
	//validarId
	var date = moment().tz('America/Mexico_City');
	var type = req.body.type; //ADD, DISP
	var params = req.params.id + apiKey;
  	service.executeGET(pathUrlPoc, params, function(data) {	
  		if (data.number === undefined){
  			jsonError.message = "El apartado seleccionado no existe.";
			return res.status(400).json(jsonError);
  		}
  		var pathUrlAcc = "https://api.mlab.com/api/1/databases/proyecto/collections/accounts/";
  		var query = {
  			number: data.number
  		};
  		var params2 ="&q=" + JSON.stringify(query);
	  	service.executeGET(pathUrlAcc, apiKey + params2, function(data2) {
	  		var accountId = data2[0]._id.$oid;
	  		if (type === 'ADD' && Number(req.body.amount) > Number(data2[0].balance)){
	    		jsonError.message = "El saldo del apartado no puede ser mayor al saldo disponible en tu cuenta.";
				return res.status(400).json(jsonError);
	    	}else if (type === 'DISP' && Number(req.body.amount) > Number(data.balance)){
	    		jsonError.message = "El saldo a disponer no puede ser mayor al saldo disponible en tu apartado.";
				return res.status(400).json(jsonError);
	    	}
		    var newBalancePocket = 0;
		    var newBalanceAccount = 0;
		    var putType = '';
		    if (type === 'ADD'){
		    	newBalanceAccount = Number(data2[0].balance) - Number(req.body.amount);
		    	newBalancePocket = Number(data.balance) + Number(req.body.amount);
		    	putType = 'D';
		    }else if (type === 'DISP'){
		    	newBalanceAccount = Number(data2[0].balance) + Number(req.body.amount);
		    	newBalancePocket = Number(data.balance) - Number(req.body.amount);
		    	putType = 'C';
		    }
		    data.balance = newBalancePocket;
		    dataAcc = data2[0];
		    dataAcc.balance = newBalanceAccount;
		    delete data._id;
		    delete dataAcc._id;
		    
		    service.executePUT(pathUrlAcc, accountId + apiKey, dataAcc, function(dataPut) {

			});
			service.executePUT(pathUrlPoc, params, data, function(dataPut2) {
				var desc = "agregado dinero al";
				if (putType === 'C'){
					var desc = "retirado dinero del";
				}
				var pathUrlMov = "https://api.mlab.com/api/1/databases/proyecto/collections/movements/";
				var dataX = service.getJsonMovements(data.client, data.number, Number(req.body.amount), 'Se ha ' + 
					desc + ' apartado de la cuenta', date.format('YYYY-MM-DD HH:mm:ss'), putType);
				service.executePOSTOut(pathUrlMov, apiKey, dataX, function(data2) {
		  			//No hace nada, no es necesario devolver el error.
		  		});
			});
		    return res.json(req.body);
	    });
	});
});

module.exports = router;