var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');

var argv = require('minimist')(process.argv.slice(2));

out_dir = 'out';
help = "A simple script to scrape training data from Hal Higdon's website";

if ((argv.h) || (argv.help) ){
  console.log(help);
  process.exit(0);
}

if ((argv.out_dir)) out_dir = argv.out; 
if ((argv.o)) out_dir = argv.o; 

var dl_all = function(err, data) {
  fs.readFile('links.json', 'utf8', function (err, data) {
    if (err) throw err;
    links = JSON.parse(data); 

    // download all the json files individually
    for (var race_type in links) { // race_type is 'full', 'half', etc.
      var race_type_links = links[race_type];
      for (var training_type in race_type_links) { // training_type is 'novice_1', 'intermediate_2', etc.
        var url_link = race_type_links[training_type];
        var file_name = out_dir + '/' + race_type + '_' + training_type + '.json';

        scrape_table(url_link, (function(file){
          return function(json){
            fs.writeFile(file, JSON.stringify(json_table, null, 4), function(err){
              console.log( file + ' sucessfully written');
            });         
          };
        })(file_name));
      }
    }
  });
};

//   // combine them into a all.json file
//   var json_all_training_data = {};
//   for (var race_type in links) { // race_type is 'full', 'half', etc.
//     var race_type_links = links[race_type];
//     json_all_training_data[race_type] = {};
//
//     for (var training_type in race_type_links) { // training_type is 'novice_1', 'intermediate_2', etc.
//       var url_link = race_type_links[training_type];
//         
//       var file_name = out_dir + '/' + race_type + '_' + training_type + '.json';
//       fs.readFile(file_name, 'utf8', function (err,data){
//         console.log(race_type);
//         console.log(training_type);
//         console.log(file_name);
//         json_all_training_data[race_type][training_type] = JSON.parse(data);
//       });
//     }
//   }
//
//   // var file = out_dir + '/' + 'all.json';
//   // fs.writeFile(file, JSON.stringify(json_all_training_data, null, 4), function(err){
//   //   console.log( file + ' sucessfully written');
//   // });         
// });

// scrape training table given url, hands json to callback function
var scrape_table = function(url, callback) {
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
          rows.push(json_row);
        }
      });

      json_table.rows = rows;

      callback(json_table);
    }
  });
};

var scrape_table_sync = function(url) {
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
          rows.push(json_row);
        }
      });

      json_table.rows = rows;

      return json_table;
    }
  });
};

dl_all();
