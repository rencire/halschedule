var express = require('express');
var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');
  
var app = express();

app.get('/scrape', function(req, res){

  url = 'http://www.halhigdon.com/training/51137/Marathon-Novice-1-Training-Program';

  request(url, function(error, response, html){
    if(!error){
      var $ = cheerio.load(html);

      json_table = { headers : "", rows : "" }

      rows = []
      $('.table-training tbody tr').filter(function(i){
        if(i === 0){
          table_headers = []
          $(this).children().each(function(){
            column_header = $(this).text();
            table_headers.push(column_header);
            json_table.headers = table_headers;
          });
        } else{
          json_row = {}
          $(this).children().each(function(i){
            cell_data = $(this);
            column_header = table_headers[i];
            json_row[column_header] = cell_data.text();

          });
          console.log(json_row);
          rows.push(json_row);
        }
      });

      json_table.rows = rows;

      fs.writeFile('output.json', JSON.stringify(json_table, null, 4), function(err){
        console.log('File successfully written! Check for output.json file');
      });
      res.send('Check your console!');


      // var title, release, rating;
      // var json = {title:"", release: "", rating: ""};
      //
      // $('.header').filter(function(){
      //   var data = $(this);
      //
      //   title = data.children().first().text();
      //   release = data.children().last().text();
      //
      //   json.title = title;
      //   json.release = release;
      // });
      //
      // $('.star-box-giga-star').filter(function(){
      //   var data = $(this);
      //
      //   rating = data.text();
      //   json.rating = rating;
      // });
    }

    // fs.writeFile('output.json', JSON.stringify(json, null, 4), function(err){
    //   console.log('File successfully written! Check for output.json file');
    // });
    // res.send('Check your console!');

    
  });
});

app.listen('8080');
console.log('Listening on port 8080');

exports = module.exports = app;
