var express = require('express');
var path = require('path');

var app = express();
app.use(express.static(path.resolve(__dirname, "public")));

app.get('/', function(req, res, next){
  res.render('index');
});

app.use(function(req, res){
  res.status(404).send('404 error');
});

app.listen(3000, '0.0.0.0', function(){
  // console.log("Visit in browser: http://localhost:3000");
  console.log("Visit in browser: http://192.168.1.1:3000");
});

module.exports = app;
