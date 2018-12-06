var requestjson = require('request-json');

var service = {};

var objErr = {
	code: 'ERROR',
	isError: true,
	message: ''
};

service.validId = function(id, res){
	if (id === undefined || id === '123'){
		jsonError.message = "No se encontró id en la petición.";

		return res.status(400).json(jsonError);
	}else{
		return jsonError;
	}

	return false;
}

service.executeGET = function (pathUrl, params, callback){
	var request = requestjson.createClient(pathUrl);
	request.headers['Content-Type'] = 'application/json';
	request.get(params, function(err, req, body) {
	    if (err){
	    	console.log(err);
	    	objErr.code = err.code;
	    	callback(objErr);
	    }else{
	    	callback(body);
	    }
  	});
  	return false;
}


service.executePOST = function (pathUrl, params, post, callback){
	var request = requestjson.createClient(pathUrl);
	request.headers['Content-Type'] = 'application/json';
	request.post(params, post, function(err, req, body) {
	    if (err){
	    	console.log(err);
	    	objErr.code = err.code;
	    	callback(objErr);
	    }else{
	    	callback(body);
	    }
  	});
  	return false;
}

service.executePOSTOut = function (pathUrl, params, post, callback){
	var request = requestjson.createClient(pathUrl);
	request.headers['Content-Type'] = 'application/json';
	request.post(params,post, function(err, req, body) {
	    if (err){
	    	console.log(err);
	    	objErr.code = err.code;
	    	callback(objErr);
	    }else{
	    	return true;
	    }
  	});
  	return false;
}

service.executePUT = function (pathUrl, params, post, callback){
	var request = requestjson.createClient(pathUrl);
	request.headers['Content-Type'] = 'application/json';
	request.put(params, post, function(err, req, body) {
	    if (err){
	    	console.log(err);
	    	objErr.code = err.code;
	    	callback(objErr);
	    }else{
	    	callback(body);
	    }
  	});
  	return false;
}

service.executeDELETE = function (pathUrl, params, callback){
	var request = requestjson.createClient(pathUrl);
	request.delete(params, function(err, req, body) {
	    if (err){
	    	console.log(err);
	    	objErr.code = err.code;
	    	callback(objErr);
	    }else{
	    	callback(body);
	    }
  	});
  	return false;
}

service.getJsonMovements = function (client, number, amount, description, operationDate, type){
	var data = {
		client: client,
		number: number,
		detail: {
			amount: amount,
			description: description,
			operationDate: operationDate,
			type: type
		}
	};

	return data;
}

service.getNavigator = function (userAgent){
	if (userAgent.indexOf("Firefox") > -1) {
	     return "Mozilla Firefox";
	} else if (userAgent.indexOf("Opera") > -1) {
	     return "Opera";
	} else if (userAgent.indexOf("Trident") > -1) {
	     return "Microsoft Internet Explorer";
	} else if (userAgent.indexOf("Edge") > -1) {
	     return "Microsoft Edge";
	} else if (userAgent.indexOf("Chrome") > -1) {
	    return "Google Chrome o Chromium";
	} else if (userAgent.indexOf("Safari") > -1) {
	    return "Apple Safari";
	} 
	
	return "Desconocido";
}


module.exports = service;