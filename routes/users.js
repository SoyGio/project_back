var express = require('express');
var router = express.Router();
var requestjson = require('request-json');
var moment = require('moment');
var service = require('../scripts/execute.js');
var cypher = require('../scripts/cypher.js');
var path = require('path');

var pathUrlBd = "https://api.mlab.com/api/1/databases/proyecto/collections/users/";
var apiKey = "?apiKey=BC596B42p_doVh2TuyzvxOt8p1Alior6";
var request = requestjson.createClient(pathUrlBd);
router.use(function(req, res, next) {
 res.header("Access-Control-Allow-Origin", "*");
 res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
 next();
});

var jsonError = {
	code: 'Error',
	message: ''
};

router.get('/', function(req, res, next) {
  res.render('index', { title: '' });
});

router.get("/v0/users/", function(req, res){
	if (req.query.username === undefined || req.query.username === ''){
		jsonError.message = "No has ingresado el usuario.";
		return res.status(400).json(jsonError);
	}
	if (req.query.password === undefined || req.query.password === ''){
		jsonError.message = "No has ingresado la contraseña.";
		return res.status(400).json(jsonError);
	}
	var query = {
    	username: req.query.username
  	};
  	var urlQuery ="&q=" + JSON.stringify(query);
  	service.executeGET(pathUrlBd, apiKey + urlQuery, function(data) {
  		if (data.length === 0){
  			jsonError.code = 'Error';
  			jsonError.message = "El usuario ingresado no existe.";
			return res.status(400).json(jsonError);
  		}
  		var passEnc = cypher.encryptSHA1(req.query.password);
  		if (passEnc !== data[0].password){
  			jsonError.code = 'Error';
  			jsonError.message = "La contraseña que ingresaste es incorrecta.";
			return res.status(400).json(jsonError);
  		}
  		data[0].message = 'Acceso correcto.';
	    return res.json(data);
	});
	return false;
});

module.exports = router;