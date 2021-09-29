var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
  res.cookie('name', 'amit', {maxAge:120000});

  res.send('Welcome to the session demo')
});
router.get('/cookies', function(req, res, next) {
  // res.cookie('name', 'amit', {maxAge: 360000});
  // console.log(req.cookies);
  res.send(req.cookies);
  // res.clearCookie('name')
  // res.send('done');
});

module.exports = router;
