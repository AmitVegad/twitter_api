var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
  res.send('Welcome To twitter Api')
});


module.exports = router;
