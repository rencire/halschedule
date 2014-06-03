// TODO: save race date and race type/plan so users can visit site again with previous settings loaded


var get_diff_days = function(date_1, date_2){
    // console.log('d1: ' + date_1);
    // console.log('d2: ' + date_2);

    var one_day = 24*60*60*1000;
    var diff_in_days = Math.abs((date_1.getTime() - date_2.getTime()) / (one_day));
    return Math.ceil(diff_in_days);
}

var update_main_page = function(json_training_data) {
    var date_today = new Date();
    var date_race = new Date(window.localStorage.getItem('race_date'));

    console.log('date_race: ' + date_race);

    var diff_days = get_diff_days(date_today, date_race);
    if (diff_days > json_training_data.num_days) {
        // today's date before start of selected training program.
        $('#today-plan p').text('still have time before training plan starts'); // should actually only do this
        return
    }

    var completed_days = (json_training_data.num_days - diff_days);
    var current_week = Math.ceil(completed_days / 8);

    var json_row = json_training_data.rows[current_week-1];
    var today_workout = json_row[day_of_week[date_today.getDay()]];
    
    $('#today-plan p').text(today_workout); // should actually only do this

}

// called everytime main page loads
var load_main_page = function() {

    var json_training = window.localStorage.getObject('json_training');

    if (json_training === null) {
        var race_type = window.localStorage.getItem('race_type');
        var race_level = window.localStorage.getItem('race_level');
        fetch_training_json(race_type, race_level, function(data){
            update_main_page(data);
            window.localStorage.setObject('json_training', data);
        });
    } else {
        update_main_page(json_training)
    }

 }

var fetch_training_json = function(race_type, race_level, callback) {
    var req_url = 'api?race=' + race_type + '&level=' + race_level;
    console.log(req_url);
    $.getJSON(req_url, callback).fail(function(problem){
        console.log(problem.responseText);
    });

}

var fetch_option_vals = function() {
    req_url = 'api/links.json';
    $.getJSON(req_url, function(data){
        var ret = {};
        for (var race in data) {
            var levels = []
            for (var level in data[race]){
                levels.push(level);
            }
            ret[race] = levels;
        }
        window.localStorage.setObject('option_vals', ret);
    });
}

var to_title = function(str){
    str = str.replace('_', ' ');
    return str.charAt(0).toUpperCase() + str.slice(1);
}

var day_of_week = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

fetch_option_vals();


$(document).ready(function(){
    // init external panel
    $('[data-role=panel]').panel().enhanceWithin();

    // add event handlers here
    $('select.select-race-type').change(function(e){
        var level_select = $(this).closest('[data-role=content]').find('select.select-race-level');
        console.log(level_select);
        level_select.empty();

        var race_type = $(this).val();
        var option_vals = window.localStorage.getObject('option_vals');

        if (option_vals !== null) {
            var level_options = option_vals[race_type];
            $.each(level_options, function(i, level){
                var option_tag = $('<option/>', {
                            value:level,
                            text: to_title(level),
                        });
                if (i === 0) {
                    option_tag.attr('selected', 'selected');
                } 
                level_select.append(option_tag);
            });
            level_select.selectmenu('refresh', true);
        } else {
            console.log('Did not receive option_vals from server');
        }
    });

    // Save 'run type' and 'level' upon exiting #train-plan page
    $('#train-plan').on('pagebeforehide', function(){

        var race_type = $(this).find('select.select-race-type').val();
        var race_level = $(this).find('select.select-race-level').val();
    
        var saved_race_type = window.localStorage.getItem('race_type');
        var saved_race_level = window.localStorage.getItem('race_level');

        if (race_type !== saved_race_type || race_level !== saved_race_level) {
            fetch_training_json(race_type, race_level, function(data) {
                update_main_page(data);
                window.localStorage.setObject('json_training', data);
            });    
        } 
        
        if (race_type !== saved_race_type)  {
            window.localStorage.setItem('race_type',  race_type);
        }

        if (race_level !== saved_race_level) { 
            window.localStorage.setItem('race_level', race_level);
        }

        update_main_page(window.localStorage.getObject('json_training'));

    });

    // Save race date from race date page

    // Save init settings
    $('#save-init-settings').on('click', function(){
        var input_date = $('#init-date-input');
        console.log('input_date: ' + input_date);
        window.localStorage.setItem('race_date', input_date.val());

        // put race values in localStorage
        
        var type_select = $(this).parent().find('select.select-race-type');
        var level_select = $(this).parent().find('select.select-race-level');

        var race_type = type_select.val();
        var race_level = level_select.val();

        window.localStorage.setItem('race_type',  race_type);
        window.localStorage.setItem('race_level', race_level);
        
        fetch_training_json(race_type, race_level, function(data) {
            update_main_page(data);
            window.localStorage.setObject('json_training', data);
        });
    });


    // Recalculate today's train plan everytime we go to main page
    

    if (Modernizr.localStorage) {
        if (window.localStorage.getItem('race_date') === null) {
            
        } else {
        }

    } else {
        // Design app without localstorage?
    }
});





