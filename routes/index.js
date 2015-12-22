var express = require('express');
var router = express.Router();

router.get('/', function(req, res){
  res.render('index');
});
router.get('/article', function(req, res){
  res.render('entry');
});

module.exports = router;