var express = require('express');
var fs = require('fs');
var request = require('request');
  
var app = express();

app.use(express.static(__dirname + '/public'));

app.get('/api/training_list', function(req, res){
  fs.readFile('./links.json', function(err, data){
    var list = JSON.parse(data);

    var ret = {};
    for (var race in list) {
      var levels = []
      for (var level in list[race]){
        levels.push(level);
      }
      ret[race] = levels;
    }

    console.log(ret);
    res.set('Content-Type', 'application/json');
    res.send(ret);
  });
});

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

var port = Number(process.env.PORT || 5000);
app.listen(port, function() {
  console.log('Listening on port ' + port);
});

exports = module.exports = app;
