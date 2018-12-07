var express = require('express');
var router = express.Router();
var moment = require('moment-timezone');
var service = require('../scripts/execute.js');
var cypher = require('../scripts/cypher.js');
var path = require('path');

var pathUrlUsers = "https://api.mlab.com/api/1/databases/proyecto/collections/users/";
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

router.get("/v0/validate/", function(req, res){
  var username = escape(req.query.username);
  var query = {};
  if (req.query.username.includes("@")){
    query.email = username
  }else{
	query.username = username
  }
  var urlQuery ="&q=" + JSON.stringify(query);
  service.executeGET(pathUrlUsers, apiKey + urlQuery, function(data) {
  	var json  = {};
  	if (data.length > 0){
  	  json.code = 'ERR';
  	  json.message = 'El usuario y/o email que ingresaste ya existe.'
  	  return res.status(400).json(json);
  	}else{
	  return res.json(json);
  	}
  });
});

router.get("/v0/users/", function(req, res){
  var date = moment().tz('America/Mexico_City');
  var json  = {};
  var username = escape(req.query.username);
  if (username === undefined || username === ''){
    json .message = "Debes ingresar el usuario ó email";
    return res.status(400).json(json );
  }
  if (req.query.password === undefined || req.query.password === ''){
    json .message = "Debes ingresar la contraseña.";
    return res.status(400).json(json );
  }
  var query = {};
  if (req.query.username.includes("@")){
    query.email = username
  }else{
    query.username = username
  }
  var urlQuery ="&q=" + JSON.stringify(query);
  service.executeGET(pathUrlUsers, apiKey + urlQuery, function(data) {
    if (data.isError === undefined){
      var passEnc = cypher.encryptSHA1(req.query.password);
      if (data.length === 0 || passEnc !== data[0].password){
        json.code = 'ERR';
        json.message = "El usuario y/o contraseña no es válido.";
        return res.status(400).json(json );
      }
      var query2 = {
        client: Number(data[0].client)
      };
      var urlQuery2 ="&q=" + JSON.stringify(query2);
      var pathUrlCli = "https://api.mlab.com/api/1/databases/proyecto/collections/clients/";
      service.executeGET(pathUrlCli, apiKey + urlQuery2, function(data2) {
        if (data2.length === 0 || data2[0]._id.$oid === undefined){
          json .code = 'ERR';
          json .message = "El usuario y/o contraseña no es válido.";
          return res.status(400).json(json);
        }else{
          var pathUrlMov = "https://api.mlab.com/api/1/databases/proyecto/collections/movements/";
          var navegador = service.getNavigator(req.headers['user-agent']);
          var obj = service.getJsonMovements(data[0].client, 0, 0, 'Sesión iniciada en ' + navegador,
          date.format('YYYY-MM-DD HH:mm:ss'), 'A');
          //Se guarda el movimiento.
          service.executePOSTOut(pathUrlMov, apiKey, obj, function(data3) {
            //No hace nada, no es necesario devolver algo.
          });
          json.code = 'OK';
          json.message = 'Has iniciado sesión correctamente.';
          json.clientId = data2[0]._id.$oid;
          json.clientName = data2[0].name;
          return res.json(json);
        } 
      });
    }else{
        json.code = 'ERR_REFUSED';
        json.message = "Servicio temporalmente no disponible, intenta mas tarde.";
        return res.status(400).json(json);
    }
    
  });
  return false;
});

module.exports = router;