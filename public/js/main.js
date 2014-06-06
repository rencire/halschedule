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
        fetch_training_data(race_type, race_level, function(data){
            update_main_page(data);
            window.localStorage.setObject('json_training', data);
        });
    } else {
        update_main_page(json_training)
    }
 }

// Page is the page element id. See load_train_plan_page()
var load_select_options = function(page, training_list, race_type, race_level) {
    if (race_type === undefined) {
        //TODO change to default to first type of race. will need to change json format given by server.
        race_type = 'full'; 
    }

    var race_options = gen_race_options(training_list, race_type);
    var level_options = gen_level_options(training_list, race_type, race_level);

    var select_race = $(page).find('select.select-race-type');
    var select_level = $(page).find('select.select-race-level');

    select_race.append(race_options);
    select_level.append(level_options);
}

var load_race_date_page = function() {
    var race_date = window.localStorage.getItem('race_date');
    console.log(race_date);
    $('#date-input').val(race_date);
}

var save_race_date_page = function() {
    var old_race_date = window.localStorage.getItem('race_date');
    var new_race_date = $('#date-input').val();

    console.log('old ' + old_race_date);
    console.log('new ' + new_race_date);

    if (old_race_date !== new_race_date) {
        window.localStorage.setItem('race_date', new_race_date);
    }

}

var save_train_plan_page = function() {
    var race_type = $('#train-plan').find('select.select-race-type').val();
    var race_level = $('#train-plan').find('select.select-race-level').val();


    var saved_race_type = window.localStorage.getItem('race_type');
    var saved_race_level = window.localStorage.getItem('race_level');
    
    if (race_type !== saved_race_type)  {
        window.localStorage.setItem('race_type',  race_type);
    }

    if (race_level !== saved_race_level) { 
        window.localStorage.setItem('race_level', race_level);
    }
}


 

var fetch_training_data = function(race_type, race_level, callback) {
    var req_url = 'api?race=' + race_type + '&level=' + race_level;
    $.getJSON(req_url, callback).fail(function(problem){
        console.log(problem.responseText);
    });
}

var fetch_training_list = function(callback) {
    req_url = 'api/training_list';
    $.getJSON(req_url, callback).fail(function(problem){
        console.log(problem.responseText);
    });
}

var to_title = function(str){
    str = str.replace('_', ' ');
    return str.charAt(0).toUpperCase() + str.slice(1);
}

var day_of_week = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];


// Page event bindings
// Function bindings on 'pagebeforecreate' are only bound ONCE since pagebeforecreate is only fired once for each page.

// If visiting app for first time, change page to #init-setup

$('#main').on('pagebeforecreate', function(e) {

    // App starts here
    // First fetch training list from server.    
    fetch_training_list(function(data){
        window.localStorage.setObject('training_list', data);

        var race_date = window.localStorage.getItem('race_date');
        var race_type = window.localStorage.getItem('race_type');
        var race_level = window.localStorage.getItem('race_level');

        if ( !(race_date && race_type && race_level) ) {
            $( ":mobile-pagecontainer" ).pagecontainer( "change", "#init-setup" );
        } else {
            load_main_page();
        }
    });

});

$('#train-plan').on('pagebeforecreate', function(){
    
    // Load select boxes with race type and level that user should have 
    // set in #init-setup
    var training_list = window.localStorage.getObject('training_list');
    var race_type = window.localStorage.getItem('race_type');
    var race_level = window.localStorage.getItem('race_level');

    load_select_options(this, training_list, race_type, race_level) 

    // Save 'run type' and 'level' upon exiting #train-plan page.
    // Once select boxes change in value, save values to localStorage.
    // 'change' event will propogate up from changing select menus.
    $(this).on('change', function(e){
        save_train_plan_page(); 
    });
    
});

$('#race-date').on('pagebeforecreate', function(){

    var race_date = window.localStorage.getItem('race_date');
    console.log($('#date-input'));
    console.log('val: ' + $('#date-input').val());

    // When date input changes, save the changed value to localStorage.
    //
    // Date value will persist, so no need to reload it when visiting race-date 
    // page again later.
    $(this).on('change', function(e){
        save_race_date_page(); 
    });

});


// Event bindings for #init-setup page
$('#init-setup').on('pagebeforecreate', function(e) {

    var training_list = window.localStorage.getObject('training_list');

    console.log('training list not ready?');
    load_select_options(this, training_list);

    // Save settings after completing init-settings page.
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
    console.log('pcbeforetransition');
    switch (ui.toPage[0].id) {
        case 'main':
            load_main_page();
        case 'race-date':

            load_race_date_page();
        case 'train-plan':
            // load_train_plan_page();
    } 
});

$(document).on('pagecontainerbeforeload', function(e, ui) {
    console.log('beforeload');
    console.log('val: ' + $('#date-input').val());

    if (ui.prevPage[0]) {
        switch(ui.prevPage[0].id) {
        }
    }
});

$(document).on('pagecontainerload', function(e, ui) {
    console.log('load');
    console.log('val: ' + $('#date-input').val());

    if (ui.prevPage[0]) {
        switch(ui.prevPage[0].id) {
        }
    }
});

$(document).on('pagecontainereshow', function(e, ui) {
    console.log('show');
    console.log('val: ' + $('#date-input').val());

    if (ui.prevPage[0]) {
        switch(ui.prevPage[0].id) {
        }
    }
});

$(document).on('pagecontainerbeforeshow', function(e, ui) {
    console.log('beforeshow');
    // console.log(ui);
    // console.log('val: ' + $('#date-input').val());
    //
    //
    console.log('val: ' + $('#date-input').val());
    $('#date-input').trigger('change');

    if (ui.prevPage[0]) {
        switch(ui.prevPage[0].id) {
        }
    }
});

// race_type optional
var gen_race_options = function(training_list, race_type){
    var option_elements = [];
    var i = 0;
    // TODO make sure training_list is an array of objects in the future.
    // Right now, for loop on an object such as training_list is incorrect 
    // since it has no concept of an index.
    //
    // We need index to set the first option to selected if no race_type 
    // is specified.
    for (var type in training_list) {
        var option_tag = $('<option/>', {
                    value:type,
                    text: to_title(type),
                });
        if (race_type !== null ) {
            if (race_type === type) {
                option_tag.attr('selected', 'selected');
            }
        } else if (i === 0){
            option_tag.attr('selected', 'selected');
        }
        option_elements.push(option_tag);
        i = i + 1;
    }
    return option_elements;
}

// race_level optional
var gen_level_options = function(training_list, race_type, race_level) {
    var level_options = training_list[race_type];
    var option_elements = [];
    $.each(level_options, function(i, level){
        var option_tag = $('<option/>', {
                    value:level,
                    text: to_title(level),
                });
        if (race_level !== null) {
            if (race_level === level) {
                option_tag.attr('selected', 'selected');
            }
        } else if (i === 0) {
            option_tag.attr('selected', 'selected');
        } 
        option_elements.push(option_tag);
    });

    return option_elements;
}

// TODO if training_plan or training_data is updated on the server, will have to fetch the data.
// If the data is changed on server, we don't have to immediately push it out to
// client.  Just have the client poll for changes every time app is reloaded (refreshed).

// App should request training_plan first, and then training_data.

$(document).on('pagebeforecreate', function(e){
    // init external panel
    

    // Add select handler to all .select-race-type in app.
    // Changes level select options based on currently selected race type.
    $('select.select-race-type').on('change', function(e){
        var level_select = $(this).closest('[data-role=content]').find('select.select-race-level');
        level_select.empty();

        var race_type = $(this).val();
        var training_list = window.localStorage.getObject('training_list');

        var option_tags = gen_level_options(training_list, race_type);
        $.each(option_tags, function(i, tag){
            level_select.append(tag);
        });
        level_select.selectmenu('refresh', true);
    });


    //TODO add event handlers for 'pagecontainershow' to set race day, run type, and run level values for their respective pages.

    if (Modernizr.localStorage) {
        if (window.localStorage.getItem('race_date') === null) {
            
        } else {
        }

    } else {
        // Design app without localstorage?
    }
});


// TODO fix main panel loading issue
$(function() {
    $('[data-role=panel]').panel().enhanceWithin();
});
