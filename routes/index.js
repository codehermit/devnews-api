var express = require('express');
var router = express.Router();
var dbconfig = require('../util/dbconfig');

/* GET home page. */
router.get('/', function(req, res, next) {
  //res.render('index', { title: 'Express' });
  var sql = 'select * from link';
  var sqlArr = [];
  dbconfig.SySqlConnect(sql,sqlArr).then((data)=>{
      console.log(data);
      res.render('index', { title: 'Express',data:data});
  })
});

module.exports = router;
