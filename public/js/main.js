// TODO: save race date and race type/plan so users can visit site again with previous settings loaded


var get_diff_days = function(date_1, date_2){
    var one_day = 24*60*60*1000;
    var diff_in_days = Math.abs((date_1.getTime() - date_2.getTime()) / (one_day));
    return Math.ceil(diff_in_days);
}

var day_of_week = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

$(document).ready(function(){

    var race_type = 'full';
    var race_level = 'novice_1';
    var today_workout = 'still have time before training plan starts';

    var date_race = new Date('7/30/2014');
    var date_today = new Date();
    var current_week;


    var req_url = 'api?race=' + race_type + '&level=' + race_level;


    $('#today-plan').text(today_workout);

    $.getJSON(req_url, function(data){
        var diff_days = get_diff_days(date_today, date_race);
        if (diff_days > data.num_days) {
            // today's date before start of selected training program.
            return
        }
        var completed_days = (data.num_days - diff_days);
        console.log('completed: '+completed_days);
        current_week = Math.ceil(completed_days / 8);

        var json_row = data.rows[current_week-1];
        today_workout = json_row[day_of_week[date_today.getDay()]];
        $('#today-plan').text(today_workout);

    }).fail(function(problem){
        console.log(problem.responseText);
    });



});





