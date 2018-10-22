var express = require('express');
var router = express.Router();
var path = require('path');

var data01 = require('../jsons/data01.json');
var data02 = require('../jsons/data02.json');
var data03 = require('../jsons/data03.json');

router.use(function(req, res, next) {
    var host = req.get('origin');
    res.setHeader('Access-Control-Allow-Origin', host||"*");
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.append('Access-Control-Expose-Headers');
    next();
});

router.get("/", function(req, res){
	res.sendFile(path.join(__dirname, '../views/error.html'));
});
// /clients/v00/clients
router.get("/v00/clients", function(req, res){
	res.json(data01);
});
//con id en la url
router.get("/info/:id", function(req, res){
	if (req.params.id === '123'){
		res.json(data02);
	}else{
		res.json(data03);
	}
	
});
//con id como parametro
router.get("/info", function(req, res){
	if (req.query.id !== undefined){
		if (req.query.id === '123'){
			res.json(data02);
		}else{
			res.json(data03);
		}
	}
	
	
});
module.exports = router;