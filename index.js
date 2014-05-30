var express = require('express');
var fs = require('fs');
var request = require('request');
  
var app = express();

app.use(express.static(__dirname + '/public'));

app.get('/api', function(req, res){
  var race = req.param('race');
  var level = req.param('level');

  res.set('Content-Type', 'application/json');
  
  if (race && level) {
    fs.readFile('./out/' + race + '_' + level + '.json', function(err, data){
      if (err) {
        res.send("Cannot find file");
      } else {
        res.send(data);
      }
    }); 
  }
});

app.listen('8080');
console.log('Listening on port 8080');

exports = module.exports = app;
