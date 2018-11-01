var requestjson = require('request-json');

var service = {};

var jsonError = {
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
	    	console.log("Error: ", err);
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
	    	console.log("Error: ", err);
	    }else{
	    	callback(body);
	    }
  	});
  	return false;
}

service.executePOSTOut = function (pathUrl, params, post){
	var request = requestjson.createClient(pathUrl);
	request.post(params,post, function(err, req, body) {
	    if (err){
	    	console.log("Error: ", err);
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
	    	console.log("Error: ", err);
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
	    	console.log("Error: ", err);
	    }else{
	    	callback(body);
	    }
  	});
  	return false;
}

module.exports = service;