var express = require('express');
var router = express.Router();
var moment = require('moment');
var path = require('path');
var service = require('../scripts/execute.js');

var pathUrlAccount = "https://api.mlab.com/api/1/databases/proyecto/collections/accounts/";
var apiKey = "?apiKey=BC596B42p_doVh2TuyzvxOt8p1Alior6";

router.use(function(req, res, next) {
  moment().locale('es');
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

var jsonError = {};

/*
router.get("/v0/accounts", function(req, res){
  service.executeGET(pathUrlAccount, apiKey, function(data) {
    return res.json(data);
  });
});
*/

router.get("/v0/accounts/:id", function(req, res){
  //validaId
  if (req.params.id === 'getCard'){
    var number = Math.round(new Date().getTime());
    var ran;
    do {
      ran = Math.floor(Math.random() * 999);
    } while (ran < 100);
    var data = {
      account: number,
      card: '41' + number + '' + ran
    };
    
    return res.json(data);
  }else{
    var pathUrlCli = "https://api.mlab.com/api/1/databases/proyecto/collections/clients/";
    if (req.query.type !== undefined && req.query.type === 'DETAIL'){
      pathUrlCli = pathUrlAccount;
    }
    var params = req.params.id + apiKey;
    service.executeGET(pathUrlCli, params, function(data) {
      if (data.client === undefined){
        jsonError.message = "El cliente no existe.";
        return res.status(400).json(jsonError);
    }
    var query = {};
    if (req.query.type !== undefined && req.query.type === 'DETAIL'){
      query.number = data.number;
      }else {
      query.client = data.client;
      }
    var params2 ="&q=" + JSON.stringify(query);
      service.executeGET(pathUrlAccount, apiKey + params2, function(data2) {
        return res.json(data2);
      });
    });
  }
  
  return false;
});


router.delete("/v0/accounts/:id", function(req, res){
  //validaId
  var params = req.params.id + apiKey;
  //Se elimina la cuenta
  service.executeDELETE(pathUrlAccount, params, function(data) {
    if (data.client != undefined){
      var pathUrlMov = "https://api.mlab.com/api/1/databases/proyecto/collections/movements/";
      var obj = service.getJsonMovements(data.client, data.number, 0, 'Se ha eliminado la cuenta',
      moment().format('YYYY-MM-DD HH:mm:ss'), 'I');
      //Se guarda el movimiento.
      service.executePOSTOut(pathUrlMov, apiKey, obj, function(data3) {
      //No hace nada, no es necesario devolver algo.
      });
      var query = {
        number: data.number
      };
      var urlQuery ="&q=" + JSON.stringify(query);
      var pathUrlPoc = "https://api.mlab.com/api/1/databases/proyecto/collections/pockets/";
      service.executeGET(pathUrlPoc, apiKey + urlQuery, function(dataPoc) {
        if (dataPoc.length > 0){
          var params = dataPoc[0]._id.$oid + apiKey;
          //Se eliminan los pockets asociadas a la cuenta.
          service.executeDELETE(pathUrlPoc, params, function(data2) {
            obj.detail.description = 'Se han eliminado los apartados asociados a la cuenta';
              service.executePOSTOut(pathUrlMov, apiKey, obj, function(data4) {
            //No hace nada, no es necesario devolver algo.
            });
          });
        }   
      });
    }
    res.json(data);
  });
  return false;
});

router.post("/v0/accounts/:id", function(req, res){
  var params = req.params.id + apiKey;
  var pathUrlCli = "https://api.mlab.com/api/1/databases/proyecto/collections/clients/";
  service.executeGET(pathUrlCli, params, function(data) {
    if (data.client === undefined){
      jsonError.message = "El cliente ingresado no existe.";
      return res.status(400).json(jsonError);
    }
    req.body.client = data.client;
    req.body.creationDate = moment().format('YYYY-MM-DD HH:mm:ss');
    req.body.balance = 1000;
    req.body.shortname = '';
    service.executePOST(pathUrlAccount, apiKey, req.body, function(data2) {
      var pathUrlMov = "https://api.mlab.com/api/1/databases/proyecto/collections/movements/";
      var obj = service.getJsonMovements(data.client, req.body.number, 0, 'Se ha dado de alta la cuenta',
      req.body.creationDate, 'I');
      service.executePOSTOut(pathUrlMov, apiKey, obj, function(data3) {
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
  service.executeGET(pathUrlAccount, params, function(data) {
    req.body.client = data.client;
    req.body.creationDate = data.creationDate;
    req.body.balance = data.balance;
    service.executePUT(pathUrlAccount, apiKey, req.body, function(data2) {
      var pathUrlMov = "https://api.mlab.com/api/1/databases/proyecto/collections/movements/";
      var obj = service.getJsonMovements(data.client, data.number, 0, 'Se actualizaron los datos de la cuenta',
      moment().format('YYYY-MM-DD HH:mm:ss'), 'I');
      service.executePOSTOut(pathUrlMov, apiKey, obj, function(data3) {
        //No hace nada, no es necesario devolver el error.
      });
      return res.json(data);
    });
  });
  return false;
});
module.exports = router;