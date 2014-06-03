// TODO: save race date and race type/plan so users can visit site again with previous settings loaded


var get_diff_days = function(date_1, date_2){

    var one_day = 24*60*60*1000;
    var diff_in_days = Math.abs((date_1.getTime() - date_2.getTime()) / (one_day));
    return Math.ceil(diff_in_days);
}

var update_main_page = function(json_training_data) {
    var date_today = new Date();
    var date_race = new Date(window.localStorage.getItem('race_date'));

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

var load_race_date_page = function() {
    var race_date = window.localStorage.getItem('race_date');
    $('#date-input').val(race_date).trigger('change');
}

var load_train_plan_page = function() {
}

var save_race_date_page = function() {
    var old_race_date = window.localStorage.getItem('race_date');
    var new_race_date = $('#date-input').val();

    console.log(old_race_date);
    console.log(new_race_date);

    if (old_race_date !== new_race_date) {
        window.localStorage.setItem('race_date', new_race_date);
    }

}

var save_train_plan_page = function() {
    var race_type = $('#train-plan').find('select.select-race-type').val();
    var race_level = $('#train-plan').find('select.select-race-level').val();

    console.log(race_type);
    console.log(race_level);

    var saved_race_type = window.localStorage.getItem('race_type');
    var saved_race_level = window.localStorage.getItem('race_level');
    
    if (race_type !== saved_race_type)  {
        window.localStorage.setItem('race_type',  race_type);
    }

    if (race_level !== saved_race_level) { 
        window.localStorage.setItem('race_level', race_level);
    }
}


 

var fetch_training_json = function(race_type, race_level, callback) {
    var req_url = 'api?race=' + race_type + '&level=' + race_level;
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

// Page event bindings
// Function bindings on 'pagebeforecreate' are only bound ONCE, when the page is first created.

// If visiting app for first time, change page to #init-setup
$('#main').on('pagebeforecreate', function(e) {
    var race_date = window.localStorage.getItem('race_date');
    if (race_date === null) {
        $( ":mobile-pagecontainer" ).pagecontainer( "change", "#init-setup" );
    }
    load_main_page();
});

// Save 'run type' and 'level' upon exiting #train-plan page.
$('#train-plan').on('pagebeforecreate', function(){

    // Once select boxes change in value, save values to localStorage
    // 'change' event will propogate up from select boxes
    $(this).on('change', function(e){
        save_train_plan_page(); 
    });

});

$('#race-date').on('pagebeforecreate', function(){

    $(this).on('change', function(e){
        save_race_date_page(); 
    });

});

// Save settings after completing init-settings page.
$('#init-setup').on('pagebeforecreate', function(e) {
    $('#save-init-settings').on('click', function(){
        var input_date = $('#init-date-input');
        window.localStorage.setItem('race_date', input_date.val());

        var type_select = $(this).parent().find('select.select-race-type');
        var level_select = $(this).parent().find('select.select-race-level');

        var race_type = type_select.val();
        var race_level = level_select.val();

        window.localStorage.setItem('race_type',  race_type);
        window.localStorage.setItem('race_level', race_level);
    });
});

// Page transition events
$(document).on('pagecontainerbeforetransition', function(e, ui) {
    switch (ui.toPage[0].id) {
        case 'main':
            load_main_page();
        case 'race-date':
            load_race_date_page();
        case 'train-plan':
            load_train_plan_page();
    } 
});

$(document).on('pagecontainerbeforeshow', function(e, ui) {
    if (ui.prevPage[0]) {
        switch(ui.prevPage[0].id) {
        }
    }
});


$(document).on('pagebeforecreate', function(){
    // init external panel
    $('[data-role=panel]').panel().enhanceWithin();

    // Add select handler to all .select-race-type in app.
    // TODO refactor to put 'options processing' logic into its own function/elsewhere
    $('select.select-race-type').change(function(e){
        var level_select = $(this).closest('[data-role=content]').find('select.select-race-level');
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

    
    // Save race date from race date page

    


    // // Page transitions
    // $(document).on('pagebeforechange', function(e,ui){
    //     var race_date = window.localStorage.getItem('race_date');
    //     console.log(e);
    //     if (race_date !== null) {
    //         //redirect to main page
    //         window.location.replace(window.location.origin + '/#main');
    //     }
    // });


    


    //TODO add event handlers for 'pagecontainershow' to set race day, run type, and run level values for their respective pages.

    if (Modernizr.localStorage) {
        if (window.localStorage.getItem('race_date') === null) {
            
        } else {
        }

    } else {
        // Design app without localstorage?
    }
});





