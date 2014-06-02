// TODO: save race date and race type/plan so users can visit site again with previous settings loaded


var get_diff_days = function(date_1, date_2){
    var one_day = 24*60*60*1000;
    var diff_in_days = Math.abs((date_1.getTime() - date_2.getTime()) / (one_day));
    return Math.ceil(diff_in_days);
}

var update_main_page = function(json_training_data) {
    var date_today = new Date();
    var date_race = window.localStorage.getItem('race_date');

    var diff_days = get_diff_days(date_today, date_race);
    if (diff_days > data.num_days) {
        // today's date before start of selected training program.
        $('#today-plan').text('still have time before training plan starts'); // should actually only do this
        return
    }

    var completed_days = (data.num_days - diff_days);
    var current_week = Math.ceil(completed_days / 8);

    var json_row = json_training_data.rows[current_week-1];
    var today_workout = json_row[day_of_week[date_today.getDay()]];
    
    $('#today-plan').text(today_workout); // should actually only do this

}

var load_main_page = function() {
    var race_type = window.localStorage.getItem('race_type');
    var race_level = window.localStorage.getItem('race_level');

     
    var json_training = window.localStorage.getObject('json_training');

    if (json_training === null) {
        var req_url = 'api?race=' + race_type + '&level=' + race_level;
        $.getJSON(req_url, function(data){
            update_main_page(data);
            window.localStorage.setObject('json_training', data);
            // save data to local storage
        }).fail(function(problem){
            console.log(problem.responseText);
        });
    } else {
        update_main_page(json_training)
    }

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
    // add event handlers here
    $('#select-race-type').change(function(e){
        var level_select = $('#select-race-level');
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
        }
        
    });


    if (Modernizr.localStorage) {
        if (window.localStorage.getItem('race_date') === null) {
            // first time using app
            // choose race type and level
            // redirect to 'pick race date' page
            // redirect to home page
        } else {
            load_main_page();
        }

    } else {
        // Design app without localstorage?
    }
});





