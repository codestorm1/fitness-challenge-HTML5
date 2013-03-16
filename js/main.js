// Sets the require.js configuration for your application.
require.config( {

    baseUrl: "/js/",
    // 3rd party script alias names (Easier to type "jquery" than "libs/jquery-1.8.2.min")
    paths: {

        // Core Libraries
        "json2": "libs/json2-min",
        "underscore": "libs/underscore-1.4.1-min",
        //"underscore": "libs/lodash",
        "jquery": "libs/jquery-1.8.2.min",
        "jquerymobile": "libs/jquery.mobile-1.3.0.min",
        "backbone": "libs/backbone-0.9.2-min",
        "stackmob" : "libs/stackmob-js-0.8.0-min",
        "mustache": "libs/mustache"
    },

    // Sets the configuration for your third party scripts that are not AMD compatible
    shim: {
        "underscore": {
            "exports" : "_"
        },

        "backbone": {
            "deps": [ "underscore", "jquery" ],
            "exports": "Backbone"  //attaches "Backbone" to the window object
        },
        "stackmob": {
            "deps": [ "jquery", "backbone" ],
            "exports": "StackMob"
        },
        "mustache": {
            "exports": "Mustache"
        }
    } // end Shim Configuration

} );

require(["jquery"], function($) {
    // console.log shim
    if (!window.console) {
        window.console = {};
        window.console.log = function() {};
    }
    // Set up the "mobileinit" handler before requiring jQuery Mobile's module
    $(document).live("mobileinit", function() {
        //$.mobile.ajaxEnabled = false; // ???
        $.mobile.linkBindingEnabled = false;
        $.mobile.hashListeningEnabled = false;
        $.mobile.pushStateEnabled = false;
        $.mobile.defaultPageTransition = 'fade';

        $('ul[data-role="listview"] a').live('click', function (event, ui) {
            $(event.currentTarget).addClass('ui-btn-active');
        });
        $('div[data-role="page"]').live('pageshow', function (event, ui) {
            $.mobile.hidePageLoadingMsg();
        });
        $('.back_button, .home_button').live('click', function(event, ui) {
            $.mobile.showPageLoadingMsg();
        });
    });
});


require(["routers/FitnessRouter"], function(FitnessRouter) {
    window.router = new FitnessRouter(); // TODO: figure out how to put this in a namespace
    //router.navigate();
});
