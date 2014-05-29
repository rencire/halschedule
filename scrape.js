var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');

out_dir = 'out';

fs.readFile('links.json', 'utf8', function (err, data) {
  if (err) throw err;
  links = JSON.parse(data); 

  for (var race_type in links){ // race_type is 'full', 'half', etc.
    race_type_links = links[race_type];
    for (var training_type in race_type_links) { // training_type is 'novice_1', 'intermediate_2', etc.
      url_link = race_type_links[training_type];
      file_name = out_dir + '/' + race_type + '_' + training_type + '.json';
      create_output_file(url_link, file_name);
    }
  }

});

var create_output_file = function(url, file_name) {
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

      fs.writeFile(file_name, JSON.stringify(json_table, null, 4), function(err){
        console.log( file_name + ' sucessfully written');
      });
    }
  });
};
